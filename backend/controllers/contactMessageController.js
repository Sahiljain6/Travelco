const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");

const submitContactMessage = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Name, email, subject, and message are required." });
  }
  if (name.length > 100 || email.length > 254 || subject.length > 160 || message.length > 5000) {
    return res.status(400).json({ message: "One or more fields exceed the allowed length." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  try {
    await ContactMessage.create({ name, email, subject, message });
    return res.status(201).json({
      message: "Thanks for contacting Travelco. Your message has been sent to our support team.",
    });
  } catch {
    return res.status(500).json({ message: "Unable to send your message right now. Please try again." });
  }
};

const getContactMessages = async (req, res) => {
  const status = String(req.query.status || "").trim();
  const allowedStatuses = ["new", "in_progress", "resolved"];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid message status." });
  }

  try {
    const filter = status ? { status } : {};
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return res.status(200).json(messages);
  } catch {
    return res.status(500).json({ message: "Unable to retrieve contact messages." });
  }
};

const updateContactMessage = async (req, res) => {
  const { id } = req.params;
  const status = String(req.body.status || "");
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid contact message id." });
  }
  if (!["new", "in_progress", "resolved"].includes(status)) {
    return res.status(400).json({ message: "Choose a valid message status." });
  }

  try {
    const message = await ContactMessage.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true });
    if (!message) return res.status(404).json({ message: "Contact message not found." });
    return res.status(200).json(message);
  } catch {
    return res.status(500).json({ message: "Unable to update this contact message." });
  }
};

const deleteContactMessage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid contact message id." });
  }
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contact message not found." });
    return res.status(200).json({ message: "Contact message deleted." });
  } catch {
    return res.status(500).json({ message: "Unable to delete this contact message." });
  }
};

module.exports = { submitContactMessage, getContactMessages, updateContactMessage, deleteContactMessage };
