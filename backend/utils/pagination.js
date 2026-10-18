function parsePositiveInteger(value, defaultValue, maximum) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^\d+$/.test(text)) return null;

  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) return null;
  return parsed;
}

function parsePagination(query = {}, options = {}) {
  const maxPage = options.maxPage || 10000;
  const maxLimit = options.maxLimit || 100;
  const page = parsePositiveInteger(query.page, 1, maxPage);
  const limit = parsePositiveInteger(query.limit, 100, maxLimit);
  if (page === null || limit === null) return null;

  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { parsePagination };
