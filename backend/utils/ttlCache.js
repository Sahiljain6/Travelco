function createTTLCache({ maxEntries = 200, now = Date.now } = {}) {
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) {
    throw new Error("maxEntries must be a positive integer");
  }
  if (typeof now !== "function") throw new Error("now must be a function");

  const entries = new Map();

  function prune(currentTime) {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= currentTime && !entry.pending) entries.delete(key);
    }
  }

  async function getOrSet(key, ttlMs, loader) {
    if (!Number.isSafeInteger(ttlMs) || ttlMs < 1) throw new Error("ttlMs must be a positive integer");
    if (typeof loader !== "function") throw new Error("loader must be a function");

    const cacheKey = String(key);
    const currentTime = now();
    const existing = entries.get(cacheKey);

    if (existing && (existing.pending || existing.expiresAt > currentTime)) {
      return existing.pending || existing.value;
    }
    if (existing) entries.delete(cacheKey);

    prune(currentTime);
    if (entries.size >= maxEntries) {
      const oldestKey = entries.keys().next().value;
      if (oldestKey !== undefined) entries.delete(oldestKey);
    }

    const pending = Promise.resolve().then(loader);
    const entry = { pending, expiresAt: currentTime + ttlMs };
    entries.set(cacheKey, entry);

    try {
      const value = await pending;
      if (entries.get(cacheKey) === entry) {
        entry.value = value;
        entry.pending = null;
        entry.expiresAt = now() + ttlMs;
      }
      return value;
    } catch (error) {
      if (entries.get(cacheKey) === entry) entries.delete(cacheKey);
      throw error;
    }
  }

  function invalidate(key) {
    return entries.delete(String(key));
  }

  function invalidatePrefix(prefix) {
    const normalized = String(prefix);
    let count = 0;
    for (const key of entries.keys()) {
      if (key.startsWith(normalized)) {
        entries.delete(key);
        count += 1;
      }
    }
    return count;
  }

  function clear() {
    entries.clear();
  }

  return { getOrSet, invalidate, invalidatePrefix, clear, get size() { return entries.size; } };
}

module.exports = { createTTLCache };
