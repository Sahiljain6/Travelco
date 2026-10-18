require("dotenv").config();
const mongoose = require("mongoose");
const { buildMongoOptions } = require("../utils/mongoOptions");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL ||
    process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Set MONGO_URI (or the documented MongoDB URI alias) before running the index inspection.");
  }

  await mongoose.connect(uri, buildMongoOptions(process.env));
  const db = mongoose.connection.db;
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const inventory = [];

  for (const collection of collections) {
    try {
      const indexes = await db.collection(collection.name).indexes();
      inventory.push({
        collection: collection.name,
        indexes: indexes.map((index) => ({
          name: index.name,
          key: index.key,
          unique: index.unique === true,
          sparse: index.sparse === true,
          partialFilterExpression: index.partialFilterExpression || undefined,
          expireAfterSeconds: index.expireAfterSeconds,
        })),
      });
    } catch (error) {
      inventory.push({
        collection: collection.name,
        error: error && error.name ? error.name : "IndexReadFailed",
      });
    }
  }

  console.log(JSON.stringify({ readOnly: true, collections: inventory }, null, 2));
}

main()
  .catch((error) => {
    console.error("Index inspection failed:", error && error.message ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
