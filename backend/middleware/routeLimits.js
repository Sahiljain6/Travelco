const { createRateLimiter } = require("./rateLimit");

function userOrIpKey(req) {
  if (typeof req.user === "string" && req.user) return req.user;
  if (req.user && typeof req.user.id === "string" && req.user.id) return req.user.id;
  return req.ip || (req.socket && req.socket.remoteAddress) || "unknown";
}

// Broad API guard for endpoints without a route-specific limiter. This is an
// in-process backstop; use CloudFront/WAF for distributed and volumetric attacks.
const globalApiLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 600,
  message: "Too many requests. Please wait before trying again.",
});

const authRegisterLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please wait before trying again.",
});

const authLoginLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many sign-in attempts. Please wait before trying again.",
});

const passwordRecoveryLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: "Too many password-recovery requests. Please wait before trying again.",
});

const verificationLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many verification attempts. Please wait before trying again.",
});

const emailCheckLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many email-availability checks. Please wait before trying again.",
});

const bookingCreationLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 12,
  keyGenerator: userOrIpKey,
  message: "Too many booking requests. Please wait before trying again.",
});

const privateImageUploadLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: userOrIpKey,
  message: "Too many image uploads. Please wait before trying again.",
});

const contactMessageLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many contact messages. Please wait before trying again.",
});

const flightSearchLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many flight searches. Please wait before trying again.",
});

module.exports = {
  globalApiLimit,
  authRegisterLimit,
  authLoginLimit,
  passwordRecoveryLimit,
  verificationLimit,
  emailCheckLimit,
  bookingCreationLimit,
  privateImageUploadLimit,
  flightSearchLimit,
  contactMessageLimit,
  userOrIpKey,
};
