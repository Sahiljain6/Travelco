const router = require("express").Router();
const vehicleController = require("../controllers/vehicleController");
const { userMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.route("/").post(userMiddleware, vehicleController.addVehicle).get(vehicleController.getAllVehicle);
router.route("/:id").get(vehicleController.getSpecificvehicle).delete(adminMiddleware, vehicleController.deleteVehicle).patch(userMiddleware, vehicleController.updateVehicle);
router.route("/accept/:id").get(adminMiddleware, vehicleController.acceptVehicle);
router.route("/myvehicles/:userId").get(userMiddleware, vehicleController.getMyVehicles);
router.route("/get/:vehicleType/:location").get(vehicleController.getVehiclesByTypeAndLocation);
router.route("/type/get/:vehicleType").get(vehicleController.getVehicleByType);
router.route("/location/get/:location").get(vehicleController.getVehicleByLocation);

module.exports = router;
