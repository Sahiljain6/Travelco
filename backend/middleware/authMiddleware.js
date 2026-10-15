const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const getToken = (req) => {
  const header = req.headers.authorization;
  const bearer = typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : null;
  // Prefer an explicitly supplied bearer token so a stale cookie cannot mask a valid session fallback.
  return bearer || (req.cookies && req.cookies.access_token) || null;
};

const authenticate = async (req, res) => {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }
  if (!process.env.JWT) {
    res.status(503).json({ message: "Authentication is not configured" });
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    if (!decoded || !decoded.id) {
      res.status(401).json({ message: "Invalid session" });
      return null;
    }
    const user = await User.findById(decoded.id).select("_id name isAdmin type");
    if (!user) {
      res.status(401).json({ message: "Account no longer exists" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
    return null;
  }
};

const userMiddleware = async (req, res, next) => {
  const user = await authenticate(req, res);
  if (!user) return;
  req.user = String(user._id);
  req.authUser = user;
  next();
};

const adminMiddleware = async (req, res, next) => {
  const user = await authenticate(req, res);
  if (!user) return;
  if (user.isAdmin !== true) return res.status(403).json({ message: "Administrator access required" });
  req.user = String(user._id);
  req.authUser = user;
  next();
};

const organizerMiddleware = async (req, res, next) => {
  const user = await authenticate(req, res);
  if (!user) return;
  if (user.type !== "eventOrganizer" && user.isAdmin !== true) {
    return res.status(403).json({ message: "Approved event organizer access required" });
  }
  req.user = String(user._id);
  req.authUser = user;
  next();
};

module.exports = { userMiddleware, adminMiddleware, organizerMiddleware };
