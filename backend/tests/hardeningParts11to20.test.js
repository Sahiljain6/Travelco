const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("../middleware/rateLimit");
const securityHeaders = require("../middleware/securityHeaders");
const { buildMongoOptions } = require("../utils/mongoOptions");
const { parseIdempotencyKey, fingerprintVehicleReservationRequest } = require("../utils/idempotency");
const { withKeyedLock, withKeyedLocks } = require("../utils/keyedLock");
const { userOrIpKey } = require("../middleware/routeLimits");

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("security headers are additive and continue the request", () => {
  const res = mockResponse();
  let continued = false;
  securityHeaders({}, res, () => { continued = true; });

  assert.equal(continued, true);
  assert.equal(res.headers["X-Content-Type-Options"], "nosniff");
  assert.equal(res.headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(res.headers["X-Frame-Options"], "SAMEORIGIN");
  assert.equal(res.headers["X-Permitted-Cross-Domain-Policies"], "none");
});

test("route rate limiter allows requests within the window and responds 429 after the limit", () => {
  let now = 100000;
  const limiter = createRateLimiter({
    windowMs: 60000,
    max: 2,
    now: () => now,
    keyGenerator: (req) => req.ip,
  });
  const req = { ip: "test-client" };

  let passed = 0;
  let res = mockResponse();
  limiter(req, res, () => { passed += 1; });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["RateLimit-Remaining"], "1");

  res = mockResponse();
  limiter(req, res, () => { passed += 1; });
  assert.equal(res.headers["RateLimit-Remaining"], "0");

  res = mockResponse();
  limiter(req, res, () => { passed += 1; });
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers["Retry-After"], "60");
  assert.equal(passed, 2);

  now += 60001;
  res = mockResponse();
  limiter(req, res, () => { passed += 1; });
  assert.equal(res.statusCode, 200);
  assert.equal(passed, 3);
});

test("rate limiter bounds its per-process key store", () => {
  const limiter = createRateLimiter({
    windowMs: 60000,
    max: 5,
    maxEntries: 1,
    now: () => 100000,
    keyGenerator: (req) => req.ip,
  });

  let res = mockResponse();
  limiter({ ip: "first" }, res, () => {});
  assert.equal(res.statusCode, 200);

  res = mockResponse();
  limiter({ ip: "second" }, res, () => {});
  assert.equal(res.statusCode, 429);
});

test("MongoDB options preserve driver defaults unless explicit values are configured", () => {
  assert.deepEqual(buildMongoOptions({}), {});
  assert.deepEqual(buildMongoOptions({
    MONGO_MAX_POOL_SIZE: "20",
    MONGO_MIN_POOL_SIZE: "2",
    MONGO_SERVER_SELECTION_TIMEOUT_MS: "10000",
  }), {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
  });
  assert.throws(() => buildMongoOptions({ MONGO_MAX_POOL_SIZE: "0" }), /MONGO_MAX_POOL_SIZE/);
  assert.throws(() => buildMongoOptions({ MONGO_MAX_POOL_SIZE: "2", MONGO_MIN_POOL_SIZE: "3" }), /cannot be greater/);
  assert.throws(() => buildMongoOptions({ MONGO_SOCKET_TIMEOUT_MS: "soon" }), /MONGO_SOCKET_TIMEOUT_MS/);
});

test("idempotency keys are optional but validated when provided", () => {
  assert.deepEqual(parseIdempotencyKey(undefined), { provided: false, key: null });
  assert.deepEqual(parseIdempotencyKey("request-key-123456"), {
    provided: true,
    key: "request-key-123456",
    valid: true,
  });
  assert.equal(parseIdempotencyKey("short").valid, false);
  assert.equal(parseIdempotencyKey("bad key with spaces").valid, false);
});

test("vehicle request fingerprints are stable for equivalent calendar dates", () => {
  const first = fingerprintVehicleReservationRequest({
    vehicleId: "abc123",
    pickupDate: "2026-11-01T08:00:00.000Z",
    returnDate: "2026-11-04T20:00:00.000Z",
    needDriver: "true",
  });
  const second = fingerprintVehicleReservationRequest({
    vehicleId: "abc123",
    pickupDate: "2026-11-01T00:00:00.000Z",
    returnDate: "2026-11-04T00:00:00.000Z",
    needDriver: true,
  });
  const different = fingerprintVehicleReservationRequest({
    vehicleId: "abc123",
    pickupDate: "2026-11-01",
    returnDate: "2026-11-04",
    needDriver: false,
  });

  assert.equal(first, second);
  assert.notEqual(first, different);
});

test("keyed lock serializes operations for the same booking resource", async () => {
  let active = 0;
  let maximumActive = 0;
  const operation = async () => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setTimeout(resolve, 15));
    active -= 1;
  };

  await Promise.all([
    withKeyedLock("vehicle-1", operation),
    withKeyedLock("vehicle-1", operation),
    withKeyedLock("vehicle-1", operation),
  ]);

  assert.equal(maximumActive, 1);
});

test("multi-key lock deduplicates and acquires locks without interleaving identical resource sets", async () => {
  const events = [];
  const operation = async (name) => {
    await withKeyedLocks(["room-b", "room-a", "room-a"], async () => {
      events.push(name + ":start");
      await new Promise((resolve) => setTimeout(resolve, 10));
      events.push(name + ":end");
    });
  };

  await Promise.all([operation("first"), operation("second")]);
  assert.deepEqual(events, ["first:start", "first:end", "second:start", "second:end"]);
});

const { parsePagination } = require("../utils/pagination");

test("pagination accepts normal values and rejects unsafe bounds", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 100, skip: 0 });
  assert.deepEqual(parsePagination({ page: "3", limit: "20" }), { page: 3, limit: 20, skip: 40 });
  assert.equal(parsePagination({ page: "0", limit: "20" }), null);
  assert.equal(parsePagination({ page: "1", limit: "1000" }), null);
  assert.equal(parsePagination({ page: "1.5", limit: "20" }), null);
  assert.equal(parsePagination({ page: "10001", limit: "10" }), null);
});

test("rate limit keys use a stable authenticated user ID when available", () => {
  assert.equal(userOrIpKey({ user: "user-123", ip: "203.0.113.10" }), "user-123");
  assert.equal(userOrIpKey({ user: { id: "user-456" }, ip: "203.0.113.11" }), "user-456");
  assert.equal(userOrIpKey({ ip: "203.0.113.12" }), "203.0.113.12");
});
