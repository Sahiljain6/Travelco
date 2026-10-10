const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://travelxco.netlify.app").replace(/\/+$/, "");
const TERMS_VERSION = "2026-10";

const makeMailer = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === "true"
    : port === 465;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = makeMailer();
  if (!transporter) {
    const error = new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM.");
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

const newToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const validPassword = (password) => typeof password === "string" && password.length >= 8 && password.length <= 128;
const publicUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  delete data.emailVerificationTokenHash;
  delete data.emailVerificationExpires;
  delete data.passwordResetTokenHash;
  delete data.passwordResetExpires;
  return data;
};

const verificationEmail = async (user) => {
  const token = newToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your Travelco email",
    text: `Hi ${user.name}, verify your Travelco account using this link (valid for 24 hours): ${link}`,
    html: `<p>Hi ${user.name},</p><p>Verify your Travelco email address by clicking the link below. It expires in 24 hours.</p><p><a href="${link}">Verify my email</a></p><p>If you did not create this account, you can ignore this message.</p>`,
  });
};

// Register new account. New accounts must verify their email before logging in.
const registerUser = async (req, res) => {
  try {
    const { name, email, password, country, mobile, type, img, termsAccepted } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: "Name must be between 2 and 80 characters" });
    }
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (!validPassword(password)) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
    }
    if (!country || typeof country !== "string" || country.trim().length > 80) {
      return res.status(400).json({ message: "Please select your country" });
    }
    if (!mobile || typeof mobile !== "string" || mobile.trim().length < 7 || mobile.trim().length > 25) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }
    if (termsAccepted !== true) {
      return res.status(400).json({ message: "You must accept the Terms and Conditions and Privacy Policy to create an account" });
    }
    const allowedTypes = ["traveler", "hotelOwner", "vehicleOwner", "resturentOwner", "tourGuide", "eventOrganizer"];
    const selectedType = type || "traveler";
    if (!allowedTypes.includes(selectedType)) {
      return res.status(400).json({ message: "Please select a valid account type" });
    }
    if (!makeMailer()) {
      return res.status(503).json({
        code: "EMAIL_NOT_CONFIGURED",
        message: "Email verification is not configured on this server yet. Please contact Travelco support.",
      });
    }
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      country: country.trim(),
      mobile: mobile.trim(),
      type: selectedType,
      img: typeof img === "string" ? img.slice(0, 2048) : "",
      emailVerified: false,
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
    });

    try {
      await verificationEmail(user);
    } catch (mailError) {
      console.error("Travelco verification email could not be sent:", mailError.message);
      return res.status(503).json({
        code: "EMAIL_DELIVERY_FAILED",
        message: "Your account was created, but the verification email could not be sent. Use the resend option on the verification page.",
      });
    }

    return res.status(201).json({
      message: "Account created. Check your email to verify your address before signing in.",
      email: user.email,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to create account right now. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    if (user.emailVerified === false) {
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address before signing in.",
      });
    }
    if (!process.env.JWT) {
      return res.status(503).json({ message: "Authentication is not configured on this server" });
    }

    const token = jwt.sign({ id: String(user._id), isAdmin: user.isAdmin === true }, process.env.JWT, { expiresIn: "7d" });
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json({ details: { ...publicUser(user), isAdmin: user.isAdmin === true }, isAdmin: user.isAdmin === true });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to sign in right now. Please try again." });
  }
};

const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

const verifyEmail = async (req, res) => {
  const token = typeof req.body.token === "string" ? req.body.token : "";
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ message: "This verification link is invalid or incomplete." });
  }
  try {
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");
    if (!user) {
      return res.status(400).json({ message: "This verification link has expired or was already used. Request a new one." });
    }
    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully. You can now sign in." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to verify this email right now." });
  }
};

const resendVerification = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const genericMessage = "If that address belongs to an unverified account, a verification email will be sent.";
  if (!makeMailer()) {
    return res.status(503).json({ message: "Email verification is temporarily unavailable. Please try again later." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(200).json({ message: genericMessage });
  }
  try {
    const user = await User.findOne({ email });
    if (user && user.emailVerified === false) {
      try {
        await verificationEmail(user);
      } catch (error) {
        console.error("Verification resend failed:", error.message);
      }
    }
    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    return res.status(200).json({ message: genericMessage });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+emailVerificationTokenHash +emailVerificationExpires +passwordResetTokenHash +passwordResetExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(publicUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to load your account right now" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const body = req.body || {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80) {
        return res.status(400).json({ message: "Name must be between 2 and 80 characters" });
      }
      user.name = body.name.trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "country")) {
      if (typeof body.country !== "string" || !body.country.trim() || body.country.trim().length > 80) {
        return res.status(400).json({ message: "Please select a valid country" });
      }
      user.country = body.country.trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "mobile")) {
      if (typeof body.mobile !== "string" || body.mobile.trim().length < 7 || body.mobile.trim().length > 25) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }
      user.mobile = body.mobile.trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "preferredCurrency")) {
      if (typeof body.preferredCurrency !== "string" || !/^[A-Z]{3}$/.test(body.preferredCurrency)) {
        return res.status(400).json({ message: "Choose a valid three-letter currency code" });
      }
      user.preferredCurrency = body.preferredCurrency;
    }
    if (Object.prototype.hasOwnProperty.call(body, "preferredLanguage")) {
      if (typeof body.preferredLanguage !== "string" || !/^[a-z]{2}(-[A-Z]{2})?$/.test(body.preferredLanguage)) {
        return res.status(400).json({ message: "Choose a valid language code" });
      }
      user.preferredLanguage = body.preferredLanguage;
    }
    if (Object.prototype.hasOwnProperty.call(body, "travelInterests")) {
      if (!Array.isArray(body.travelInterests) || body.travelInterests.length > 10 ||
          body.travelInterests.some((value) => typeof value !== "string" || value.trim().length > 40)) {
        return res.status(400).json({ message: "Choose up to 10 valid travel interests" });
      }
      user.travelInterests = [...new Set(body.travelInterests.map((value) => value.trim()).filter(Boolean))];
    }
    if (Object.prototype.hasOwnProperty.call(body, "budgetRange")) {
      if (!["budget", "mid-range", "luxury", "flexible"].includes(body.budgetRange)) {
        return res.status(400).json({ message: "Choose a valid budget preference" });
      }
      user.budgetRange = body.budgetRange;
    }
    if (Object.prototype.hasOwnProperty.call(body, "travelStyle")) {
      if (!["solo", "couple", "family", "friends", "group", "flexible"].includes(body.travelStyle)) {
        return res.status(400).json({ message: "Choose a valid travel style" });
      }
      user.travelStyle = body.travelStyle;
    }
    if (Object.prototype.hasOwnProperty.call(body, "savedDestinations")) {
      if (!Array.isArray(body.savedDestinations) || body.savedDestinations.length > 20 ||
          body.savedDestinations.some((value) => typeof value !== "string" || !value.trim() || value.trim().length > 80)) {
        return res.status(400).json({ message: "Save up to 20 valid destination names" });
      }
      user.savedDestinations = [...new Set(body.savedDestinations.map((value) => value.trim()))];
    }
    if (Object.prototype.hasOwnProperty.call(body, "notificationPreferences")) {
      const preferences = body.notificationPreferences;
      if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
        return res.status(400).json({ message: "Notification preferences are invalid" });
      }
      ["bookingUpdates", "tripReminders", "productNews"].forEach((key) => {
        if (typeof preferences[key] === "boolean") user.notificationPreferences[key] = preferences[key];
      });
    }

    await user.save();
    return res.status(200).json(publicUser(user));
  } catch (error) {
    return res.status(400).json({ message: "Unable to update profile. Check the fields and try again." });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!validPassword(newPassword)) {
    return res.status(400).json({ message: "New password must be between 8 and 128 characters" });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const currentMatches = typeof currentPassword === "string" && await bcrypt.compare(currentPassword, user.password);
    if (!currentMatches) return res.status(400).json({ message: "Current password is incorrect" });
    if (currentPassword === newPassword) return res.status(400).json({ message: "Choose a new password different from your current password" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to change your password right now" });
  }
};

const resetpasswordrequest = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const genericMessage = "If an account exists for that email, a password-reset link will be sent.";
  if (!makeMailer()) {
    return res.status(503).json({ message: "Password reset is temporarily unavailable. Please try again later." });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = newToken();
      user.passwordResetTokenHash = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const link = `${FRONTEND_URL}/reset-password?token=${token}`;
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your Travelco password",
          text: `Use this link to reset your Travelco password within one hour: ${link}`,
          html: `<p>Use the link below to reset your Travelco password. It expires in one hour.</p><p><a href="${link}">Reset password</a></p><p>If you did not request a reset, ignore this email.</p>`,
        });
      } catch (error) {
        console.error("Password reset email delivery failed:", error.message);
      }
    }
    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    return res.status(200).json({ message: genericMessage });
  }
};

const resetpassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (!/^[a-f0-9]{64}$/i.test(typeof token === "string" ? token : "") || !validPassword(password)) {
    return res.status(400).json({ message: "The reset link or new password is invalid" });
  }
  try {
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");
    if (!user) return res.status(400).json({ message: "This reset link has expired or was already used. Request another one." });
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully. Please sign in with your new password." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset your password right now" });
  }
};

const checkEmailExists = async (req, res, next) => {
  try {
    const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email }).select("_id");
    if (user) return res.status(409).json({ message: "Email already exists" });
    return res.status(200).json({ message: "Email is available" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resetpasswordrequest,
  resetpassword,
  checkEmailExists,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  updateMyProfile,
  changePassword,
};
