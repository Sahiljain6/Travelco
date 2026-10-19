"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hasUnsafeKeys,
  rejectUnsafeInputKeys,
  escapeRegex,
  escapeHtml,
} = require("../utils/securityValidation");
const { isOwnerOrAdmin } = require("../utils/authorization");
const { createRateLimiter } = require("../middleware/rateLimit");

test("request input guard rejects nested MongoDB operators and dotted keys", () => {
  assert.equal(hasUnsafeKeys({ filter: { "$ne": null } }), true);
  assert.equal(hasUnsafeKeys({ profile: { "name.first": "Sahil" } }), true);
  assert.equal(hasUnsafeKeys({ data: { constructor: { prototype: { isAdmin: true } } } }), true);
});

test("request input guard accepts normal fields and operator-like text values", () => {
  assert.equal(hasUnsafeKeys({ search: "$where is plain text", name: "A.B", profile: { displayName: "Travelco" } }), false);
});

test("unsafe request keys are rejected before routes run", () => {
  let nextCalled = false;
  let statusCode = 200;
  let payload;
  const req = { body: { filters: { "$gt": 10 } }, query: {}, params: {} };
  const res = {
    status(code) { statusCode = code; return this; },
    json(body) { payload = body; return this; },
  };

  rejectUnsafeInputKeys(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.equal(payload.code, "UNSAFE_INPUT_KEYS");
});

test("request input guard passes safe requests", () => {
  let nextCalled = false;
  rejectUnsafeInputKeys(
    { body: { name: "Weekend trip" }, query: { page: "1" }, params: { id: "abc123" } },
    { status() { throw new Error("safe request was rejected"); }, json() { throw new Error("safe request was rejected"); } },
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);
});

test("regex search input is treated literally", () => {
  const raw = ".*(travelco)+?";
  const literal = new RegExp("^" + escapeRegex(raw) + "$");
  assert.equal(literal.test(raw), true);
  assert.equal(literal.test("travelco"), false);
});

test("HTML escaping prevents a user name from becoming markup in email HTML", () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script> & 'name''),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#x27;name&#x27;"
  );
});

test("resource ownership permits only the owner or an admin", () => {
  assert.equal(isOwnerOrAdmin("user-1", { user: "user-1", authUser: { isAdmin: false } }), true);
  assert.equal(isOwnerOrAdmin("user-2", { user: "user-1", authUser: { isAdmin: false } }), false);
  assert.equal(isOwnerOrAdmin("user-2", { user: "user-1", authUser: { isAdmin: true } }), true);
  assert.equal(isOwnerOrAdmin(null, { user: "user-1", authUser: { isAdmin: false } }), false);
});

test("rate limiter rejects requests over the window and recovers after expiry", () => {
  let now = 1000;
  let nextCalls = 0;
  let statusCode;
  const headers = {};
  const payloads = [];
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 2,
    keyGenerator: () => "test-client",
    now: () => now,
  });
  const makeResponse = () => ({
    set(name, value) { headers[name] = value; return this; },
    status(code) { statusCode = code; return this; },
    json(body) { payloads.push(body); return this; },
  });
  const request = { ip: "127.0.0.1" };

  limiter(request, makeResponse(), () => { nextCalls += 1; });
  limiter(request, makeResponse(), () => { nextCalls += 1; });
  limiter(request, makeResponse(), () => { nextCalls += 1; });
  assert.equal(nextCalls, 2);
  assert.equal(statusCode, 429);
  assert.ok(Number(headers["Retry-After"]) > 0);

  now += 60_001;
  limiter(request, makeResponse(), () => { nextCalls += 1; });
  assert.equal(nextCalls, 3);
});
