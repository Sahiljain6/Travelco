const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  uploadProfileFile,
  uploadPrivateFile,
  publicProfileUploadLimit,
  uploadPublicProfileImage,
  uploadPrivateImage,
} = require("../controllers/uploadController");

// Registration must be able to upload a profile image before the user has an account.
// Limit the public endpoint and accept only small, verified raster images.
router.post(
  "/profile-image",
  publicProfileUploadLimit,
  uploadProfileFile,
  uploadPublicProfileImage
);

// All other image uploads require a valid session; the backend forwards files to Cloudinary.
router.post("/image", verifyToken, uploadPrivateFile, uploadPrivateImage);

module.exports = router;
