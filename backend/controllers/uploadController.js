const crypto = require("crypto");
const multer = require("multer");
const User = require("../models/userModel");

const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const PUBLIC_PROFILE_UPLOADS_PER_WINDOW = 8;
const PUBLIC_UPLOAD_WINDOW_MS = 15 * 60 * 1000;
const publicUploadAttempts = new Map();

const storage = multer.memoryStorage();
const makeMulter = (maxBytes) =>
  multer({
    storage,
    limits: { fileSize: maxBytes, files: 1, fields: 2, parts: 4 },
    fileFilter(_req, file, callback) {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return callback(new Error("Unsupported image type. Use JPG, PNG, WEBP or GIF."));
      }
      return callback(null, true);
    },
  });

const profileMulter = makeMulter(MAX_PROFILE_BYTES);
const privateMulter = makeMulter(MAX_IMAGE_BYTES);

const safeMulter = (middleware) => (req, res, next) => {
  middleware(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Please choose a smaller image."
          : "Upload is invalid. Please upload one image at a time.";
      return res.status(400).json({ message });
    }
    return res.status(400).json({ message: error.message || "Image upload is invalid." });
  });
};

const uploadProfileFile = safeMulter(profileMulter.single("file"));
const uploadPrivateFile = safeMulter(privateMulter.single("file"));

const publicProfileUploadLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let entry = publicUploadAttempts.get(key);

  if (!entry || entry.expiresAt <= now) {
    entry = { count: 0, expiresAt: now + PUBLIC_UPLOAD_WINDOW_MS };
  }
  if (entry.count >= PUBLIC_PROFILE_UPLOADS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ message: "Too many profile-image uploads. Please try again later." });
  }
  entry.count += 1;
  publicUploadAttempts.set(key, entry);

  // Keep the in-memory limiter bounded. Use a distributed limiter before scaling to multiple replicas.
  if (publicUploadAttempts.size > 2000) {
    for (const [ip, attempt] of publicUploadAttempts.entries()) {
      if (attempt.expiresAt <= now) publicUploadAttempts.delete(ip);
    }
  }
  return next();
};

const sniffImageType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mime: "image/webp", extension: "webp" };
  }
  if (buffer.length >= 6) {
    const signature = buffer.toString("ascii", 0, 6);
    if (signature === "GIF87a" || signature === "GIF89a") {
      return { mime: "image/gif", extension: "gif" };
    }
  }
  return null;
};

const cloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(cloudName)) return null;
  return { cloudName, apiKey, apiSecret };
};

const forwardImageToCloudinary = async (file, folder) => {
  const config = cloudinaryConfig();
  if (!config) {
    const error = new Error("Image uploads are not configured. Add the Cloudinary credentials to the backend environment.");
    error.statusCode = 503;
    throw error;
  }
  if (typeof fetch !== "function" || typeof Blob !== "function" || typeof FormData !== "function") {
    const error = new Error("This server runtime does not support secure image uploads. Use Node.js 18 or newer.");
    error.statusCode = 503;
    throw error;
  }

  const actualType = sniffImageType(file.buffer);
  if (!actualType || actualType.mime !== file.mimetype) {
    const error = new Error("The uploaded file is not a supported image or its file type does not match.");
    error.statusCode = 400;
    throw error;
  }

  const multipart = new FormData();
  const safeName = "travelco-" + crypto.randomUUID() + "." + actualType.extension;
  multipart.append("file", new Blob([file.buffer], { type: actualType.mime }), safeName);
  multipart.append("folder", folder);

  const endpoint =
    "https://api.cloudinary.com/v1_1/" + encodeURIComponent(config.cloudName) + "/image/upload";
  const authorization =
    "Basic " + Buffer.from(config.apiKey + ":" + config.apiSecret).toString("base64");

  let upstream;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: authorization },
      body: multipart,
      signal: AbortSignal.timeout(25000),
    });
  } catch (error) {
    const timeoutError = new Error("Image provider could not be reached. Please try again.");
    timeoutError.statusCode = 502;
    throw timeoutError;
  }

  if (!upstream.ok) {
    // Do not return or log the provider's raw response, which may contain implementation details.
    console.error("Cloudinary image upload failed with HTTP status", upstream.status);
    const error = new Error("The image provider could not accept this upload. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  let asset;
  try {
    asset = await upstream.json();
  } catch (_error) {
    const error = new Error("The image provider returned an invalid response.");
    error.statusCode = 502;
    throw error;
  }

  if (!asset || typeof asset.secure_url !== "string" || !asset.secure_url.startsWith("https://")) {
    const error = new Error("The image provider did not return a secure image URL.");
    error.statusCode = 502;
    throw error;
  }

  return {
    url: asset.secure_url,
    secure_url: asset.secure_url,
    public_id: asset.public_id,
    format: asset.format,
    bytes: asset.bytes,
  };
};

const uploadPublicProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Select a profile image to upload." });
  try {
    const uploaded = await forwardImageToCloudinary(req.file, "travelco/profiles");
    return res.status(201).json(uploaded);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Unable to upload this image right now.",
    });
  }
};

const uploadPrivateImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Select an image to upload." });
  const category = typeof req.body.category === "string" ? req.body.category.toLowerCase() : "";
  if (!["profile", "tour"].includes(category)) {
    return res.status(400).json({ message: "Choose a supported image category." });
  }

  try {
    const user = await User.findById(req.user.id).select("type isAdmin");
    if (!user) return res.status(401).json({ message: "Please sign in again." });

    if (category === "tour" && user.isAdmin !== true && !["tourGuide", "eventOrganizer"].includes(user.type)) {
      return res.status(403).json({ message: "Your account is not allowed to upload tour images." });
    }

    const folder = category === "tour" ? "travelco/tours" : "travelco/profiles";
    const uploaded = await forwardImageToCloudinary(req.file, folder);
    return res.status(201).json(uploaded);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Unable to upload this image right now.",
    });
  }
};

module.exports = {
  uploadProfileFile,
  uploadPrivateFile,
  publicProfileUploadLimit,
  uploadPublicProfileImage,
  uploadPrivateImage,
};
