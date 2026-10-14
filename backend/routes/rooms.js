const express = require("express");
const {
  createRoom, updateRoom, deleteRoom, getRoom, getAllRoom, updateRoomAvailability
} = require("../controllers/room.js");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/:hotelid", adminMiddleware, createRoom);
router.put("/:id", adminMiddleware, updateRoom);
router.put("/availability/:id", adminMiddleware, updateRoomAvailability);
router.delete("/:id/:hotelid", adminMiddleware, deleteRoom);
router.get("/:id", getRoom);
router.get("/", getAllRoom);

module.exports = router;
