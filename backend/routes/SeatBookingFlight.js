const router = require("express").Router();
const flightBooking = require("../controllers/FlightSeatBookingCtrl");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { bookingCreationLimit, flightSearchLimit } = require("../middleware/routeLimits");

router.route("/").get(flightSearchLimit, flightBooking.searchFlight);
router.route("/add").post(userMiddleware, bookingCreationLimit, flightBooking.flightBooking);
router.route("/getAllBookings").get(adminMiddleware, flightBooking.fetchAllFlightBookings);
router.route("/getSingle/:id").get(userMiddleware, flightBooking.getSingleFlightBooking);
router.route("/delete/:id").delete(userMiddleware, flightBooking.deleteSeatBooking);
router.route("/update/:id").put(userMiddleware, flightBooking.updateSeatBookingFlight);
router.route("/getMyFlights/:id").get(userMiddleware, flightBooking.getMyAllTickets);

module.exports = router;
