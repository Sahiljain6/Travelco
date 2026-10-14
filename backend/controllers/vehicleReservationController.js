const Reservation = require("../models/VehicleReservation");
const Vehicle = require("../models/Vehicle");
const { v4: uuidv4 } = require("uuid");

exports.addReservation = async (req, res) => {
  //tested in postman - working well
  try {
    // Fetch vehicle details to calculate price
    const vehicle = await Vehicle.findById(req.body.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const pickupDate = new Date(req.body.pickupDate);
    const returnDate = new Date(req.body.returnDate);
    if (!req.body.pickupDate || !req.body.returnDate || Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
      return res.status(400).json({ message: "Valid pickup and return dates are required" });
    }
    pickupDate.setUTCHours(0, 0, 0, 0);
    returnDate.setUTCHours(0, 0, 0, 0);
    const numberOfDays = (returnDate - pickupDate) / 86400000;
    if (numberOfDays <= 0 || numberOfDays > 90) {
      return res.status(400).json({ message: "Return date must be after pickup and within 90 days" });
    }
    if (!Number.isFinite(Number(vehicle.price)) || Number(vehicle.price) <= 0) {
      return res.status(400).json({ message: "Vehicle has an invalid rental price" });
    }
    let amount = numberOfDays * Number(vehicle.price);
    if (req.body.needDriver === true || req.body.needDriver === "true") {
      amount += numberOfDays * Number(process.env.DRIVER_DAILY_FEE || 25);
    }

    const newReservation = new Reservation({
      userId: String(req.user),
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      date: new Date(),
      location: vehicle.location,
      pickupDate: req.body.pickupDate,
      returnDate: req.body.returnDate,
      price: amount,
      needDriver : req.body.needDriver,
      vehicleOwnerId: vehicle.userId,
      transactionId: uuidv4(),
    });

    await newReservation.save();
    res.status(200).json(newReservation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

//get my all reservations - traveler                               //postman tested working well.
exports.getMyReservationsTraveler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (String(req.user) !== String(userId) && req.authUser?.isAdmin !== true) {
      return res.status(403).json({ message: "You can only view your own reservations" });
    }
    const reservations = await Reservation.find({ userId: String(req.user) });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get my all reservations - owner                               //postman tested working well.
exports.getMyReservationsOwner = async (req, res) => {
  try {
    const { vehicleOwnerId } = req.params;
    if (String(req.user) !== String(vehicleOwnerId) && req.authUser?.isAdmin !== true) {
      return res.status(403).json({ message: "You can only view your own vehicle reservations" });
    }
    const reservations = await Reservation.find({ vehicleOwnerId });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get a specific reservation - traveler                                 //postman tested working well.
exports.getOneReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    if (String(reservation.userId) !== String(req.user) && String(reservation.vehicleOwnerId) !== String(req.user) && req.authUser?.isAdmin !== true) {
      return res.status(403).json({ message: "You are not allowed to view this reservation" });
    }
    return res.status(200).json(reservation);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//delete/cancel a reservation   - traveler and vehicle owner     //postman tested working well.
exports.deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    if (String(reservation.userId) !== String(req.user) && String(reservation.vehicleOwnerId) !== String(req.user) && req.authUser?.isAdmin !== true) {
      return res.status(403).json({ message: "You are not allowed to cancel this reservation" });
    }
    if (reservation.status && ["CANCELLED", "COMPLETED"].includes(String(reservation.status).toUpperCase())) {
      return res.status(409).json({ message: "This reservation can no longer be cancelled" });
    }
    await reservation.deleteOne();
    return res.status(200).json({ message: "Reservation cancelled" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get All reservations
exports.getAllReservations = async (req, res) => {
  try {
    if (req.authUser?.isAdmin !== true) return res.status(403).json({ message: "Administrator access required" });
    const reservations = await Reservation.find();
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

//get reservations - traveler by vehicle id                 //postman tested working well.
exports.getMyReservationsTravelerByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reservations = await Reservation.find({ vehicleId, userId: req.user });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
}