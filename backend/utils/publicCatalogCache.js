const { createTTLCache } = require("./ttlCache");

const cache = createTTLCache({ maxEntries: 200 });
const CACHE_TTL_MS = 30 * 1000;

function isEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CATALOG_CACHE === "true";
}

async function getPublicCatalog(key, loader, env = process.env) {
  if (!isEnabled(env)) return loader();
  return cache.getOrSet(String(key), CACHE_TTL_MS, loader);
}

function invalidatePublicCatalog() {
  cache.clear();
}

module.exports = {
  cache,
  CACHE_TTL_MS,
  isEnabled,
  getPublicCatalog,
  invalidatePublicCatalog,
};
