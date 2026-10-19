const customForm = require("../models/tourCustomForm");
const User = require("../models/userModel");

const ALLOWED_DURATIONS = new Set([1, 2, 3, 5, 7, 9, 12]);

const createForm = async (req, res) => {
  const body = req.body || {};
  const whereFrom = typeof body.whereFrom === "string" ? body.whereFrom.trim() : "";
  const whereTo = typeof body.whereTo === "string" ? body.whereTo.trim() : "";
  const days = Number(body.days);

  if (!whereFrom || whereFrom.length > 120 || !whereTo || whereTo.length > 120) {
    return res.status(400).json({ status: "Unsuccess", message: "Enter valid origin and destination names (maximum 120 characters)." });
  }
  if (!Number.isInteger(days) || !ALLOWED_DURATIONS.has(days)) {
    return res.status(400).json({ status: "Unsuccess", message: "Choose a supported trip duration." });
  }

  try {
    const user = await User.findById(req.user).select("email");
    if (!user) return res.status(401).json({ status: "Unsuccess", message: "Please sign in again." });

    // Store the authenticated account's email; never trust currentUser from the client.
    const newForm = new customForm({
      currentUser: user.email,
      whereFrom,
      whereTo,
      days,
    });
    const savedForm = await newForm.save();

    return res.status(201).json({
      status: "success",
      message: "Details saved. Our agent will contact you.",
      data: { form: savedForm },
    });
  } catch (_error) {
    return res.status(400).json({
      status: "Unsuccess",
      message: "Unable to save the tour customization request.",
    });
  }
};

const getCustomForm = async (req, res) => {
  try {
    const allcustom = await customForm.find().limit(500);
    return res.status(200).json(allcustom);
  } catch (_error) {
    return res.status(500).json({
      status: "unsuccess",
      message: "Unable to retrieve tour customization requests.",
    });
  }
};

module.exports = { createForm, getCustomForm };
