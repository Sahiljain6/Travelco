const mongoose = require("mongoose");

const hotelReservationSchema = new mongoose.Schema({
  hotelId: { type: String, required: true },
  hotelName: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  selectedRoomIds: { type: [String], required: true },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "USD" },
  totalDays: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.models.hotelReservation || mongoose.model("hotelReservation", hotelReservationSchema);
