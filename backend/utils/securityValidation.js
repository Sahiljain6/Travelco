"use strict";

const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

/**
 * Reject MongoDB selector/property names from untrusted request payloads.
 * Values such as a search string containing "$" remain valid; only object keys
 * containing Mongo/operator syntax are rejected. Parsed JSON cannot contain
 * cycles, but the guard also bounds depth to protect other middleware callers.
 */
function hasUnsafeKeys(value, depth = 0, seen = new Set()) {
  if (depth > 30) return true;
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);

  for (const key of Object.keys(value)) {
    if (
      key.length > 128 ||
      key.startsWith("$") ||
      key.includes(".") ||
      BLOCKED_KEYS.has(key.toLowerCase()) ||
      hasUnsafeKeys(value[key], depth + 1, seen)
    ) {
      seen.delete(value);
      return true;
    }
  }

  seen.delete(value);
  return false;
}

function rejectUnsafeInputKeys(req, res, next) {
  if (hasUnsafeKeys(req.body) || hasUnsafeKeys(req.query) || hasUnsafeKeys(req.params)) {
    return res.status(400).json({
      message: "Request contains unsupported property names.",
      code: "UNSAFE_INPUT_KEYS",
    });
  }
  return next();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

module.exports = { hasUnsafeKeys, rejectUnsafeInputKeys, escapeRegex, escapeHtml };
