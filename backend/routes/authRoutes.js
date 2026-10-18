const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");
const {
  authRegisterLimit,
  authLoginLimit,
  passwordRecoveryLimit,
  verificationLimit,
  emailCheckLimit,
} = require("../middleware/routeLimits");

router.post("/register", authRegisterLimit, registerUser);
router.post("/login", authLoginLimit, loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", passwordRecoveryLimit, resetpasswordrequest);
router.post("/reset-password", passwordRecoveryLimit, resetpassword);
router.get("/check-email", emailCheckLimit, checkEmailExists);
router.post("/verify-email", verificationLimit, verifyEmail);
router.post("/resend-verification", passwordRecoveryLimit, resendVerification);
router.get("/me", verifyToken, getCurrentUser);
router.patch("/profile", verifyToken, updateMyProfile);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
