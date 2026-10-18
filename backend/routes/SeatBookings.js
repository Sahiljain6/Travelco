const router = require("express").Router();
const seatBookingCtrl = require("../controllers/seatBookingTrainCtrl");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { bookingCreationLimit } = require("../middleware/routeLimits");

router.route("/add").post(userMiddleware, bookingCreationLimit, seatBookingCtrl.addSeatBooking);
router.route("/").get(adminMiddleware, seatBookingCtrl.fetchAllBookings);
router.route("/get/:id").get(userMiddleware, seatBookingCtrl.getSingleSeatBooking);
router.route("/update/:id").put(userMiddleware, seatBookingCtrl.updateSeatBooking);
router.route("/delete/:id").delete(userMiddleware, seatBookingCtrl.deleteSeatBooking);
router.route("/getSingleUser/:userId").get(userMiddleware, seatBookingCtrl.myBookings);

module.exports = router;
