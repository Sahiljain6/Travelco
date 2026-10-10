const express = require("express");
const router = express.Router();
const { weatherRateLimit, getWeather } = require("../controllers/integrationController");

router.get("/weather", weatherRateLimit, getWeather);

module.exports = router;
