const express = require("express");
const { reservation, getAllReservation } = require("../controllers/hotelReservation.js");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { bookingCreationLimit } = require("../middleware/routeLimits");

const router = express.Router();
router.post("/reservation", userMiddleware, bookingCreationLimit, reservation);
router.get("/getAll", adminMiddleware, getAllReservation);

module.exports = router;
