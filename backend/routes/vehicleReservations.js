const router = require("express").Router();
const reservationController = require("../controllers/vehicleReservationController");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.route("/").post(userMiddleware, reservationController.addReservation).get(adminMiddleware, reservationController.getAllReservations);
router.route("/:id").delete(userMiddleware, reservationController.deleteReservation).get(userMiddleware, reservationController.getOneReservation);
router.route("/traveler/:userId").get(userMiddleware, reservationController.getMyReservationsTraveler);
router.route("/owner/:vehicleOwnerId").get(userMiddleware, reservationController.getMyReservationsOwner);
router.route("/traveler/vehicles/:vehicleId").get(userMiddleware, reservationController.getMyReservationsTravelerByVehicle);

module.exports = router;
