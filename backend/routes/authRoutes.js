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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", resetpasswordrequest);
router.post("/reset-password", resetpassword);
router.get("/check-email", checkEmailExists);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", verifyToken, getCurrentUser);
router.patch("/profile", verifyToken, updateMyProfile);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
