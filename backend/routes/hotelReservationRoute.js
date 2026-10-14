const express = require("express");
const { reservation, getAllReservation } = require("../controllers/hotelReservation.js");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/reservation", userMiddleware, reservation);
router.get("/getAll", adminMiddleware, getAllReservation);

module.exports = router;
