const router = require("express").Router();
const trainCtrl = require("../controllers/trainCtrl");
const { adminMiddleware } = require("../middleware/authMiddleware");

router.route("/add").post(adminMiddleware, trainCtrl.addTrain);
router.route("/").get(trainCtrl.getAllTrains);
router.route("/get/:id").get(trainCtrl.getSingleTrain);
router.route("/update/:id").put(adminMiddleware, trainCtrl.updateTrain);
router.route("/delete/:id").delete(adminMiddleware, trainCtrl.deleteTrain);
router.route("/fetch/:from/:to").get(trainCtrl.getTrainFromTo);

module.exports = router;
