const express = require("express");
const reservations = require("../controllers/resturentReservationController");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { bookingCreationLimit } = require("../middleware/routeLimits");
const router = express.Router();

router.post("/", adminMiddleware, reservations.getRestaurantReservations);
router.post("/create", userMiddleware, bookingCreationLimit, reservations.createReservation);
router.post("/get-reservation-request", adminMiddleware, reservations.getRerservationRequests);
router.post("/get-reservation-request-canceled", adminMiddleware, reservations.getRerservationRequestsCanceled);
router.post("/accept-reservation-request", adminMiddleware, reservations.acceptReservation);
router.post("/decline-reservation-request", adminMiddleware, reservations.declineReservation);
router.post("/get-reservation-requess-by-user", userMiddleware, reservations.getRerservationRequestsByUser);
router.post("/get-reservation-requess-by-id", userMiddleware, reservations.getRerservationRequestById);

module.exports = router;
