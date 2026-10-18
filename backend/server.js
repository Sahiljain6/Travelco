const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const {
  buildAllowedOrigins,
  isOriginAllowed,
  parseTrustProxyHops,
} = require("./utils/securityConfig");

// Preserve the existing deployment behavior (one trusted proxy hop) unless an
// operator explicitly configures and validates a different value for the AWS path.
const trustProxyHops = process.env.TRUST_PROXY_HOPS === undefined
  ? 1
  : parseTrustProxyHops(process.env.TRUST_PROXY_HOPS);
app.set("trust proxy", trustProxyHops);

if (process.env.NODE_ENV === "production" && !process.env.JWT) {
  logger.error({ event: "startup_blocked", reason: "JWT secret is not configured" });
  process.exit(1);
}
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  logger.warn({ event: "email_service_unconfigured", reason: "SMTP environment variables are missing" });
}
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.warn({ event: "image_upload_service_unconfigured", reason: "Cloudinary environment variables are missing" });
}

connectDB().catch((error) => {
  logger.error({ event: "database_startup_failed", errorName: error && error.name ? error.name : "UnknownError" });
  process.exit(1);
});

const allowedOrigins = buildAllowedOrigins(process.env);

// Correlation IDs and request timing are useful for investigation without logging
// query strings, request bodies, cookies, authorization headers or client secrets.
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = process.hrtime.bigint();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info({
      event: "http_request",
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(elapsedMs * 100) / 100,
    });
  });
  next();
});

// Keep existing CORS request behavior while normalizing configured origins.
// This middleware only controls browser-readable CORS responses; application
// authentication and authorization remain the security boundary.
app.use(cors({
  origin(origin, callback) {
    if (!origin || isOriginAllowed(origin, allowedOrigins)) return callback(null, true);
    logger.warn({ event: "cors_origin_denied" });
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

let shuttingDown = false;
app.get("/health/live", (req, res) => {
  return res.status(200).json({ status: "alive" });
});
app.get("/health/ready", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  if (shuttingDown || !databaseReady) {
    return res.status(503).json({ status: "not_ready" });
  }
  return res.status(200).json({ status: "ready" });
});

app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/integrations", require("./routes/integrationRoutes"));
app.use("/api/contact-messages", require("./routes/contactMessageRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

const tourRouter = require("./routes/tourRouter");
app.use("/api/tours", tourRouter);
const vehicleRouter = require("./routes/vehicles");
const reservationRouter = require("./routes/vehicleReservations");
app.use("/api/vehicle", vehicleRouter);
app.use("/api/vehicle/images", express.static(path.join(__dirname, "images")));
app.use("/api/vehiclereservation", reservationRouter);

const hotels = require("./routes/hotels");
const rooms = require("./routes/rooms");
const hotelreservation = require("./routes/hotelReservationRoute");
app.use("/api/hotels", hotels);
app.use("/api/rooms", rooms);
app.use("/api/hotelreservation", hotelreservation);
app.use("/api/hotels/images", express.static(path.join(__dirname, "images")));

const restaurantRoute = require("./routes/restaurantRoute.js");
const restaurantTypeRoute = require("./routes/restaurantTypeRoute");
const restaurantDistrictRoute = require("./routes/restaurantDistrictRoute");
const restaurantReservationTimeRoute = require("./routes/restaurantReservationTimeRoute");
const restaurantRateRoute = require("./routes/restaurantRateRoute");
const restaurantReservationRoute = require("./routes/restaurantReservationRoute");
app.use("/api/restaurant", restaurantRoute);
app.use("/api/restaurantType", restaurantTypeRoute);
app.use("/api/restaurantDistrict", restaurantDistrictRoute);
app.use("/api/restaurantReservationTime", restaurantReservationTimeRoute);
app.use("/api/restaurantRate", restaurantRateRoute);
app.use("/api/restaurantReservation", restaurantReservationRoute);

const trainRouter = require("./routes/train");
app.use("/api/train", trainRouter);
const seatBookingRouter = require("./routes/SeatBookings");
app.use("/api/seatBookings", seatBookingRouter);
const flightBookingRouter = require("./routes/SeatBookingFlight");
app.use("/api/flight", flightBookingRouter);

const refundRouter = require("./routes/RefundRoute");
app.use("/api/refund", refundRouter);
const EmployeeRouter = require("./routes/EmployeeRoute");
app.use("/api/employee", EmployeeRouter);
const SalaryRouter = require("./routes/SalaryRoute");
app.use("/api/salary", SalaryRouter);
const RecordRouter = require("./routes/FinanceHealth");
app.use("/api/record", RecordRouter);

const ActivityRoute = require("./routes/activityRoute");
const ReservationRoute = require("./routes/reservationRoute.js");
app.use("/api/activities", ActivityRoute);
app.use("/api/reservations", ReservationRoute);

app.get("/", (req, res) => res.send("API is Running Successfully"));
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info({ event: "server_started", port, trustProxyHops });
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: Array.from(allowedOrigins), credentials: true },
});

io.on("connection", () => logger.info({ event: "socket_connected" }));

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.warn({ event: "shutdown_started", signal });

  const forceExitTimer = setTimeout(() => {
    logger.error({ event: "shutdown_timeout", signal });
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  io.close(async () => {
    try {
      await mongoose.disconnect();
      clearTimeout(forceExitTimer);
      logger.info({ event: "shutdown_complete", signal });
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExitTimer);
      logger.error({
        event: "shutdown_failed",
        signal,
        errorName: error && error.name ? error.name : "UnknownError",
      });
      process.exit(1);
    }
  });
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
