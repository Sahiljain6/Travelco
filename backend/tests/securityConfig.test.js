const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeOrigin,
  buildAllowedOrigins,
  isOriginAllowed,
  parseTrustProxyHops,
  getAuthCookieOptions,
} = require("../utils/securityConfig");

test("normalizes valid HTTP(S) origins and rejects invalid schemes", () => {
  assert.equal(normalizeOrigin("https://travelco.example/"), "https://travelco.example");
  assert.equal(normalizeOrigin("http://localhost:3000"), "http://localhost:3000");
  assert.equal(normalizeOrigin("javascript:alert(1)"), null);
  assert.equal(normalizeOrigin("not a URL"), null);
});

test("production origin allowlist includes only configured origins", () => {
  const origins = buildAllowedOrigins({
    NODE_ENV: "production",
    CORS_ORIGINS: "https://travelco.example/, https://admin.travelco.example",
  });

  assert.equal(isOriginAllowed("https://travelco.example", origins), true);
  assert.equal(isOriginAllowed("https://admin.travelco.example", origins), true);
  assert.equal(isOriginAllowed("https://attacker.example", origins), false);
  assert.equal(isOriginAllowed("null", origins), false);
  assert.equal(isOriginAllowed(undefined, origins), true);
});

test("local development origins are added only outside production", () => {
  const devOrigins = buildAllowedOrigins({ NODE_ENV: "development", FRONTEND_URL: "http://localhost:3000" });
  const prodOrigins = buildAllowedOrigins({ NODE_ENV: "production", FRONTEND_URL: "https://travelco.example" });

  assert.equal(devOrigins.has("http://127.0.0.1:3000"), true);
  assert.equal(prodOrigins.has("http://127.0.0.1:3000"), false);
});

test("proxy trust retains the existing one-hop default and rejects malformed values", () => {
  assert.equal(parseTrustProxyHops(undefined), 1);
  assert.equal(parseTrustProxyHops("0"), 0);
  assert.equal(parseTrustProxyHops("2"), 2);
  assert.throws(() => parseTrustProxyHops("true"), /TRUST_PROXY_HOPS/);
  assert.throws(() => parseTrustProxyHops("99"), /TRUST_PROXY_HOPS/);
});

test("production auth cookies preserve SameSite=None and Secure defaults", () => {
  const options = getAuthCookieOptions({ NODE_ENV: "production" });
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "none");
  assert.equal(options.path, "/");
  assert.equal(options.maxAge, 7 * 24 * 60 * 60 * 1000);
});

test("SameSite=None requires Secure and logout options omit maxAge", () => {
  const options = getAuthCookieOptions(
    { NODE_ENV: "production", AUTH_COOKIE_SAME_SITE: "none" },
    true
  );
  assert.equal(options.sameSite, "none");
  assert.equal(options.secure, true);
  assert.equal(Object.hasOwn(options, "maxAge"), false);
  assert.throws(
    () => getAuthCookieOptions({ AUTH_COOKIE_SAME_SITE: "invalid" }),
    /AUTH_COOKIE_SAME_SITE/
  );
});
