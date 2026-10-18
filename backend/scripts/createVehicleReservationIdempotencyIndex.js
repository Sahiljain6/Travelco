require("dotenv").config();
const mongoose = require("mongoose");
const { buildMongoOptions } = require("../utils/mongoOptions");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL ||
    process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Set MONGO_URI (or the documented MongoDB URI alias) before running this migration.");
  }

  await mongoose.connect(uri, buildMongoOptions(process.env));
  const collection = mongoose.connection.db.collection("vehiclereservations");

  const duplicate = await collection.aggregate([
    { $match: { idempotencyKey: { $type: "string" } } },
    {
      $group: {
        _id: { userId: "$userId", idempotencyKey: "$idempotencyKey" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();

  if (duplicate.length) {
    throw new Error("Duplicate idempotency records exist. Resolve them manually before creating the unique index.");
  }

  const name = await collection.createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $type: "string" } },
      name: "uniq_user_vehicle_idempotency_key",
    }
  );

  console.log(JSON.stringify({
    event: "vehicle_reservation_idempotency_index_created",
    collection: "vehiclereservations",
    index: name,
  }));
}

main()
  .catch((error) => {
    console.error("Vehicle idempotency index migration failed:", error && error.message ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
