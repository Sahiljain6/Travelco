const tourReserve = require("../models/tourBook");
const { isValidInternationalPhone, parsePositiveInteger } = require("../utils/validation");

const bookTour = async (req, res) => {
  const body = req.body || {};
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const date = body.date ? new Date(body.date) : null;

  if (firstName.length < 1 || firstName.length > 80 || lastName.length < 1 || lastName.length > 80) {
    return res.status(400).json({ status: "Unsuccess", message: "First and last names must be 1–80 characters." });
  }
  if (!date || Number.isNaN(date.getTime())) {
    return res.status(400).json({ status: "Unsuccess", message: "A valid tour date is required." });
  }
  if (!isValidInternationalPhone(body.phone)) {
    return res.status(400).json({ status: "Unsuccess", message: "Enter a valid international phone number with 7–15 digits; it cannot be all zeroes." });
  }
  const guestCount = parsePositiveInteger(body.guestCount);
  if (guestCount === null) {
    return res.status(400).json({ status: "Unsuccess", message: "Guest count must be a positive whole number." });
  }

  try {
    // Never accept currentUser (or other server-owned fields) from the browser.
    const newRes = new tourReserve({
      currentUser: String(req.user),
      firstName,
      lastName,
      date,
      phone: String(body.phone).trim(),
      guestCount,
    });
    const savedRes = await newRes.save();
    return res.status(201).json({
      status: "Success",
      message: "Your tour request was received. An agent will contact you.",
      data: { book: savedRes },
    });
  } catch (_error) {
    return res.status(400).json({ status: "Unsuccess", message: "Unable to book this tour with the supplied details." });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const allReservations = await tourReserve.find().limit(500);
    return res.status(200).json(allReservations);
  } catch (_error) {
    return res.status(500).json({ status: "unsuccess", message: "Unable to retrieve tour reservations." });
  }
};

module.exports = { bookTour, getAllReservations };
