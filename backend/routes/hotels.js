const express = require("express");
const {
  createHotel, updateHotel, deleteHotel, getHotel, getAllHotel,
  countByCity, countByType, getHotelbyCity, getHotelRooms
} = require("../controllers/hotel.js");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", adminMiddleware, createHotel);
router.put("/:id", adminMiddleware, updateHotel);
router.delete("/:id", adminMiddleware, deleteHotel);
router.get("/find/:id", getHotel);
router.get("/", getAllHotel);
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/get/:city", getHotelbyCity);
router.get("/room/:id", getHotelRooms);

module.exports = router;
