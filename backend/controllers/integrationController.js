const axios = require("axios");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_WEATHER_REQUESTS_PER_WINDOW = 40;
const lookupWindows = new Map();

const weatherRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let entry = lookupWindows.get(key);
  if (!entry || entry.resetAt <= now) entry = { count: 0, resetAt: now + WINDOW_MS };

  if (entry.count >= MAX_WEATHER_REQUESTS_PER_WINDOW) {
    res.set("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
    return res.status(429).json({ message: "Too many weather requests. Please wait and try again." });
  }

  entry.count += 1;
  lookupWindows.set(key, entry);

  if (lookupWindows.size > 2000) {
    for (const [ip, value] of lookupWindows.entries()) {
      if (value.resetAt <= now) lookupWindows.delete(ip);
    }
  }
  return next();
};

const getWeather = async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "Weather search is not configured yet." });
  }

  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  if (!city || city.length < 2 || city.length > 80 || /[<>\u0000-\u001f]/.test(city)) {
    return res.status(400).json({ message: "Enter a valid city name, optionally followed by a country code." });
  }

  try {
    // Use OpenWeather's dedicated geocoding API instead of the legacy built-in city geocoder.
    const geocoded = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: city, limit: 1, appid: apiKey },
      timeout: 8000,
    });
    const place = Array.isArray(geocoded.data) ? geocoded.data[0] : null;
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
      return res.status(404).json({ message: "We couldn't find that city. Try adding the country code." });
    }

    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { lat: place.lat, lon: place.lon, appid: apiKey, units: "metric" },
      timeout: 8000,
    });
    const data = response.data || {};
    const details = Array.isArray(data.weather) ? data.weather[0] || {} : {};
    const icon = typeof details.icon === "string" && /^\d{2}[dn]$/.test(details.icon)
      ? details.icon
      : null;

    res.set("Cache-Control", "public, max-age=300");
    return res.status(200).json({
      city: place.name || data.name || city,
      countryCode: place.country || (data.sys && data.sys.country ? data.sys.country : null),
      latitude: Number.isFinite(place.lat) ? place.lat : (Number.isFinite(data.coord && data.coord.lat) ? data.coord.lat : null),
      longitude: Number.isFinite(place.lon) ? place.lon : (Number.isFinite(data.coord && data.coord.lon) ? data.coord.lon : null),
      temperatureC: Number.isFinite(data.main && data.main.temp) ? Math.round(data.main.temp * 10) / 10 : null,
      feelsLikeC: Number.isFinite(data.main && data.main.feels_like) ? Math.round(data.main.feels_like * 10) / 10 : null,
      humidity: Number.isFinite(data.main && data.main.humidity) ? data.main.humidity : null,
      description: typeof details.description === "string" ? details.description : "Weather unavailable",
      icon,
      windSpeedMps: Number.isFinite(data.wind && data.wind.speed) ? data.wind.speed : null,
      observedAt: Number.isFinite(data.dt) ? new Date(data.dt * 1000).toISOString() : null,
      source: "OpenWeather",
    });
  } catch (error) {
    const status = error.response && error.response.status;
    if (status === 404) {
      return res.status(404).json({ message: "We couldn't find that city. Check the spelling and try again." });
    }
    if (status === 401) {
      console.error("OpenWeather rejected the configured API key.");
      return res.status(503).json({ message: "Weather service configuration needs attention." });
    }
    if (status === 429) {
      return res.status(503).json({ message: "The weather provider is busy. Please try again later." });
    }
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ message: "Weather lookup timed out. Please try again." });
    }
    console.error("Weather lookup failed:", status || error.code || "provider unavailable");
    return res.status(502).json({ message: "Weather is temporarily unavailable. Please try again." });
  }
};

module.exports = { weatherRateLimit, getWeather };
