const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();
const path = require("path");
const app = express();
// Railway sits behind a trusted reverse proxy; use its forwarded client IP for rate limits.
app.set("trust proxy", 1);
const bodyParser = require("body-parser");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cors = require("cors");
const connectDB = require("./config/db");

if (process.env.NODE_ENV === "production" && !process.env.JWT) {
  console.error("Startup blocked: set a strong JWT secret in the backend environment.");
  process.exit(1);
}
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("Email verification/password reset are unavailable until SMTP_HOST, SMTP_USER and SMTP_PASS are configured.");
}
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("Image uploads are unavailable until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are configured.");
}

connectDB();

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "https://travelxco.netlify.app")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([...configuredOrigins, "http://localhost:3000", "http://127.0.0.1:3000"]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/integrations", require("./routes/integrationRoutes"));

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
const server = app.listen(port, () => console.log(`Server running on port ${port} 🔥`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: Array.from(allowedOrigins), credentials: true },
});

io.on("connection", (socket) => console.log("Connected to socket.io"));
