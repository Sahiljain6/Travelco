const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const authenticateRequest = (req, res) => {
  const bearerToken =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
  const token = (req.cookies && req.cookies.access_token) || bearerToken;

  if (!token) {
    res.status(401).json({ message: "Please sign in to continue", code: "AUTH_REQUIRED" });
    return false;
  }
  if (!process.env.JWT) {
    res.status(503).json({ message: "Authentication is not configured on this server" });
    return false;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT);
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Invalid session", code: "INVALID_TOKEN" });
      return false;
    }
    return true;
  } catch (error) {
    res.status(401).json({ message: "Your session has expired. Please sign in again.", code: "INVALID_TOKEN" });
    return false;
  }
};

const verifyToken = (req, res, next) => {
  if (authenticateRequest(req, res)) next();
};

const verifyUser = (req, res, next) => {
  if (!authenticateRequest(req, res)) return;
  if (String(req.user.id) === String(req.params.id) || req.user.isAdmin === true) {
    return next();
  }
  return res.status(403).json({ message: "You are not allowed to do that" });
};

const verifyAdmin = (req, res, next) => {
  if (!authenticateRequest(req, res)) return;
  if (req.user.isAdmin === true) return next();
  return res.status(403).json({ message: "Administrator access is required" });
};

// Legacy bearer-token middleware retained for existing chat/user routes.
// New account endpoints use verifyToken and the main JWT secret.
const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

module.exports = { verifyToken, verifyUser, verifyAdmin, protect };
