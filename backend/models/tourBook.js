const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isValidInternationalPhone } = require("../utils/validation");

const tourBook = new Schema({
  currentUser: {
    type: String,
    required: [true, "User Must login First"],
  },
  firstName: {
    type: String,
    required: [true, "Must provide your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Must provide your last Name"],
  },
  date: {
    type: Date,
    required: [true, "Must provide a Date to start tour"],
  },
  phone: {
    type: String,
    required: [true, "Must provide a phone number"],
    trim: true,
    validate: { validator: isValidInternationalPhone, message: "Enter a valid international phone number with 7–15 digits; it cannot be all zeroes" },
  },
  guestCount: {
    type: Number,
    required: [true, "Must provide a guest count"],
    min: 1,
    validate: { validator: Number.isInteger, message: "Guest count must be a positive whole number" },
  },
});

const tourReservation = mongoose.model("tour Reservation", tourBook);
module.exports = tourReservation;
