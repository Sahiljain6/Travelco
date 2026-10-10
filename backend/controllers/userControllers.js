const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");

const registerUser = asyncHandler(async (_req, res) => {
  res.status(410).json({
    message: "Please use /api/auth/register to create an account and verify your email.",
  });
});

const authUser = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password;
  const user = await User.findOne({ email });
  if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.emailVerified === false) {
    return res.status(403).json({
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email address before signing in.",
    });
  }
  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

const allUsers = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.slice(0, 80) : "";
  const escapedSearch = search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const keyword = search
    ? {
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword)
    .select("-password -emailVerificationTokenHash -passwordResetTokenHash")
    .find({ _id: { $ne: req.user._id } });
  return res.send(users);
});

module.exports = { registerUser, allUsers, authUser };
