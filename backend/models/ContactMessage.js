const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new", index: true },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
