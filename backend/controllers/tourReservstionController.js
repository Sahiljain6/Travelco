const tourReserve = require("../models/tourBook");
const { isValidInternationalPhone, parsePositiveInteger } = require("../utils/validation");

const bookTour = async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    if (!isValidInternationalPhone(body.phone)) {
      return res.status(400).json({ status: "Unsuccess", message: "Enter a valid international phone number with 7–15 digits; it cannot be all zeroes." });
    }
    const guestCount = parsePositiveInteger(body.guestCount);
    if (guestCount === null) {
      return res.status(400).json({ status: "Unsuccess", message: "Guest count must be a positive whole number." });
    }
    body.phone = String(body.phone).trim();
    body.guestCount = guestCount;
    const newRes = new tourReserve(body);
    const saveRes = await newRes.save();

    res.status(200).json({
      status: "Success",
      message:
        "Your have SuccessFully booked this tour, One of our Agent will contact you!",
      data: {
        book: saveRes,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Unsuccess",
      message: "Error Booking Tour",
    });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const allReservations = await tourReserve.find();
    res.status(200).send(allReservations);
  } catch (err) {
    console.log();
    res.status(404).json({
      status: "unsuccess",
      message: "err.message",
    });
  }
};

module.exports = { bookTour, getAllReservations };
