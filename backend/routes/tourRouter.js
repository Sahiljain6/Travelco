const express = require("express");
const tourController = require("../controllers/tourController");
const tourCustomForm = require("../controllers/tourCustomFormController");
const tourReservation = require("../controllers/tourReservstionController");
const { adminMiddleware, userMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.route("/").post(adminMiddleware, tourController.createTour).get(tourController.getAllTours);
router.route("/:id").get(tourController.getTour).patch(adminMiddleware, tourController.updateTour).delete(adminMiddleware, tourController.deleteTour);
router.route("/customform").post(userMiddleware, tourCustomForm.createForm);
router.route("/tourReservations").put(adminMiddleware, tourReservation.getAllReservations).post(userMiddleware, tourReservation.bookTour);

module.exports = router;
