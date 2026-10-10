import axios from "axios";

const validateImage = (file, maxBytes) => {
  if (!file) throw new Error("Choose an image file first.");
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP or GIF image.");
  }
  if (file.size > maxBytes) {
    throw new Error("Image must be " + (maxBytes / (1024 * 1024)) + " MB or smaller.");
  }
};

const sendImage = async (file, endpoint, category, maxBytes = 5 * 1024 * 1024) => {
  validateImage(file, maxBytes);
  const form = new FormData();
  form.append("file", file);
  if (category) form.append("category", category);
  const response = await axios.post(endpoint, form);
  return response.data;
};

// Public but rate-limited, for sign-up when there is no authenticated session yet.
export const uploadProfileImage = (file) =>
  sendImage(file, "uploads/profile-image", undefined, 2 * 1024 * 1024);

// Requires an authenticated session; categories are validated server-side.
export const uploadImage = (file, category) =>
  sendImage(file, "uploads/image", category);
