const HotelReservation = require("../models/hotelReservationModel");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const { withKeyedLocks } = require("../utils/keyedLock");
const logger = require("../utils/logger");

const reservationHandler = async (req, res) => {
  let createdBooking = null;
  const updatedRoomIds = [];
  let rollbackCheckIn = null;
  let rollbackCheckOut = null;
  try {
    const hotelId = String(req.body.hotelId || "").toLowerCase();
    const selectedRoomIds = Array.isArray(req.body.selectedRoomIds)
      ? [...new Set(req.body.selectedRoomIds.map((id) => String(id).toLowerCase()))]
      : [];
    const checkIn = new Date(req.body.checkInDate);
    const checkOut = new Date(req.body.checkOutDate);
    if (!hotelId || selectedRoomIds.length === 0 || selectedRoomIds.length > 10 ||
        !/^[a-f\d]{24}$/i.test(hotelId) ||
        selectedRoomIds.some((id) => !/^[a-f\d]{24}$/i.test(id)) ||
        !req.body.checkInDate || !req.body.checkOutDate ||
        Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: "Choose a hotel, one or more rooms, and valid check-in/check-out dates" });
    }
    checkIn.setUTCHours(0, 0, 0, 0);
    checkOut.setUTCHours(0, 0, 0, 0);
    rollbackCheckIn = new Date(checkIn);
    rollbackCheckOut = new Date(checkOut);
    const totalDays = (checkOut - checkIn) / 86400000;
    if (!Number.isInteger(totalDays) || totalDays < 1 || totalDays > 90) {
      return res.status(400).json({ message: "Check-out must be after check-in and the stay cannot exceed 90 nights" });
    }
    if (checkIn < new Date(new Date().setUTCHours(0, 0, 0, 0))) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    const hotel = await Hotel.findOne({ _id: hotelId, isApproved: true });
    if (!hotel) return res.status(404).json({ message: "Hotel is not available" });
    const rooms = await Room.find({ "roomNumbers._id": { $in: selectedRoomIds } });
    const roomById = new Map();
    for (const room of rooms) {
      for (const number of room.roomNumbers) {
        if (selectedRoomIds.includes(String(number._id))) roomById.set(String(number._id), { room, number });
      }
    }
    if (roomById.size !== selectedRoomIds.length) {
      return res.status(400).json({ message: "One or more selected rooms are invalid" });
    }

    const blockedDates = [];
    for (let day = new Date(checkIn); day < checkOut; day.setUTCDate(day.getUTCDate() + 1)) {
      blockedDates.push(new Date(day));
    }
    for (const roomId of selectedRoomIds) {
      const entry = roomById.get(roomId);
      const unavailable = entry.number.unavailableDates || [];
      const hasConflict = unavailable.some((date) => {
        const existing = new Date(date);
        existing.setUTCHours(0, 0, 0, 0);
        return existing >= checkIn && existing < checkOut;
      });
      if (hasConflict) return res.status(409).json({ message: "One or more selected rooms are no longer available for those dates" });
    }

    const totalPrice = selectedRoomIds.reduce((sum, roomId) => sum + Number(roomById.get(roomId).room.price), 0) * totalDays;
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: "Selected rooms have invalid prices" });
    }

    createdBooking = await HotelReservation.create({
      hotelId: String(hotel._id),
      hotelName: hotel.name,
      userId: String(req.user),
      userName: req.authUser?.name || "Traveler",
      selectedRoomIds,
      checkInDate: checkIn.toISOString().slice(0, 10),
      checkOutDate: checkOut.toISOString().slice(0, 10),
      totalPrice,
      currency: hotel.currency || "USD",
      totalDays
    });

    for (const roomId of selectedRoomIds) {
      const updateResult = await Room.updateOne(
        { "roomNumbers._id": roomId },
        { $push: { "roomNumbers.$.unavailableDates": { $each: blockedDates } } }
      );
      if (!updateResult.matchedCount) {
        throw new Error("The selected room no longer exists");
      }
      updatedRoomIds.push(roomId);
    }
    return res.status(201).json({
      message: "Reservation request created. Payment is not enabled in Travelco yet.",
      reservation: createdBooking
    });
  } catch (error) {
    // Best-effort compensation for partial multi-document writes. Full atomicity
    // still requires a MongoDB deployment configured for transactions.
    for (const roomId of updatedRoomIds.reverse()) {
      try {
        await Room.updateOne(
          { "roomNumbers._id": roomId },
          { $pull: { "roomNumbers.$.unavailableDates": { $gte: rollbackCheckIn, $lt: rollbackCheckOut } } }
        );
      } catch (rollbackError) {
        logger.error({
          event: "hotel_reservation_room_rollback_failed",
          requestId: req.requestId,
          errorName: rollbackError && rollbackError.name ? rollbackError.name : "UnknownError",
        });
      }
    }
    if (createdBooking) {
      try {
        await HotelReservation.deleteOne({ _id: createdBooking._id });
      } catch (rollbackError) {
        logger.error({
          event: "hotel_reservation_record_rollback_failed",
          requestId: req.requestId,
          errorName: rollbackError && rollbackError.name ? rollbackError.name : "UnknownError",
        });
      }
    }
    logger.error({
      event: "hotel_reservation_create_failed",
      requestId: req.requestId,
      errorName: error && error.name ? error.name : "UnknownError",
    });
    return res.status(500).json({ message: "Unable to create hotel reservation" });
  }
};

// Serialize bookings for the same room IDs inside this single application process.
// Multi-instance coordination requires a database-backed lock/transaction strategy.
const reservation = async (req, res) => {
  const requestedIds = Array.isArray(req.body?.selectedRoomIds) &&
    req.body.selectedRoomIds.length > 0 &&
    req.body.selectedRoomIds.length <= 10 &&
    req.body.selectedRoomIds.every((value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value))
      ? [...new Set(req.body.selectedRoomIds.map((value) => value.toLowerCase()))]
      : ["invalid-request:" + String(req.user)];

  return withKeyedLocks(
    requestedIds.map((id) => "hotel-room-reservation:" + id),
    () => reservationHandler(req, res)
  );
};

const getAllReservation = async (req, res) => {
  try {
    const reservations = await HotelReservation.find().sort({ createdAt: -1 }).limit(500);
    return res.status(200).json(reservations);
  } catch {
    return res.status(500).json({ message: "Unable to retrieve hotel reservations" });
  }
};

module.exports = { reservation, getAllReservation };
