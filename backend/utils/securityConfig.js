const VALID_SAME_SITE_VALUES = new Set(["lax", "strict", "none"]);

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function buildAllowedOrigins(env = process.env) {
  const configured = env.CORS_ORIGINS || env.FRONTEND_URL || "https://travelxco.netlify.app";
  const origins = configured
    .split(",")
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

  if (env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return new Set(origins);
}

// Requests without an Origin header may be server-to-server or command-line clients.
// Browsers sending an Origin must match the explicit allowlist.
function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return Boolean(normalized && allowedOrigins.has(normalized));
}

// Default to trusting no proxy headers. Only configure the hop count after the
// CloudFront -> nginx path and direct-origin protections have been verified.
function parseTrustProxyHops(rawValue) {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") return 0;

  const text = String(rawValue).trim();
  if (!/^\d+$/.test(text)) {
    throw new Error("TRUST_PROXY_HOPS must be an integer from 0 to 3");
  }

  const hops = Number(text);
  if (!Number.isSafeInteger(hops) || hops < 0 || hops > 3) {
    throw new Error("TRUST_PROXY_HOPS must be an integer from 0 to 3");
  }

  return hops;
}

function getAuthCookieOptions(env = process.env, clearing = false) {
  const sameSite = String(env.AUTH_COOKIE_SAME_SITE || "lax").toLowerCase();
  if (!VALID_SAME_SITE_VALUES.has(sameSite)) {
    throw new Error("AUTH_COOKIE_SAME_SITE must be lax, strict, or none");
  }

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
  };

  if (!clearing) options.maxAge = 7 * 24 * 60 * 60 * 1000;
  return options;
}

module.exports = {
  normalizeOrigin,
  buildAllowedOrigins,
  isOriginAllowed,
  parseTrustProxyHops,
  getAuthCookieOptions,
};
