const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!uri) {
    console.error("❌ ERROR: No MongoDB URI found in environment variables (MONGO_URI or MONGO_URL).");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected : ${conn.connection.host} 😎`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
