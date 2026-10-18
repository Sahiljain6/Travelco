const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!uri) {
    logger.error({ event: "database_uri_missing" });
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info({ event: "database_connected" });
  } catch (error) {
    // Avoid printing driver options or connection details that could contain credentials.
    logger.error({ event: "database_connection_failed", errorName: error && error.name ? error.name : "UnknownError" });
    process.exit(1);
  }
};

module.exports = connectDB;
