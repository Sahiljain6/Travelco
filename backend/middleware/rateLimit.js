const DEFAULT_MAX_ENTRIES = 10000;

function defaultKeyGenerator(req) {
  return req.ip || (req.socket && req.socket.remoteAddress) || "unknown";
}

function createRateLimiter({
  windowMs,
  max,
  keyGenerator = defaultKeyGenerator,
  message = "Too many requests. Please try again later.",
  maxEntries = DEFAULT_MAX_ENTRIES,
  now = Date.now,
} = {}) {
  if (!Number.isSafeInteger(windowMs) || windowMs < 1000) {
    throw new Error("Rate limiter windowMs must be an integer of at least 1000");
  }
  if (!Number.isSafeInteger(max) || max < 1) {
    throw new Error("Rate limiter max must be a positive integer");
  }
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) {
    throw new Error("Rate limiter maxEntries must be a positive integer");
  }
  if (typeof keyGenerator !== "function" || typeof now !== "function") {
    throw new Error("Rate limiter keyGenerator and now must be functions");
  }

  const entries = new Map();
  let requestsSinceCleanup = 0;

  function pruneExpired(currentTime) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= currentTime) entries.delete(key);
    }
  }

  return function rateLimit(req, res, next) {
    const currentTime = now();
    const rawKey = keyGenerator(req);
    const key = String(rawKey || "unknown");
    let entry = entries.get(key);

    if (!entry || entry.resetAt <= currentTime) {
      if (entries.size >= maxEntries) {
        pruneExpired(currentTime);
        if (entries.size >= maxEntries && !entries.has(key)) {
          res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
          return res.status(429).json({ message });
        }
      }
      entry = { count: 0, resetAt: currentTime + windowMs };
    }

    if (entry.count >= max) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))));
      res.set("RateLimit-Limit", String(max));
      res.set("RateLimit-Remaining", "0");
      res.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
      entries.set(key, entry);
      return res.status(429).json({ message });
    }

    entry.count += 1;
    entries.set(key, entry);
    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 256) {
      requestsSinceCleanup = 0;
      pruneExpired(currentTime);
    }

    return next();
  };
}

module.exports = { createRateLimiter };
