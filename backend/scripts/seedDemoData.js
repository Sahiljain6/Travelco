"use strict";

const mongoose = require("mongoose");
require("dotenv").config();

const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Tour = require("../models/tours");
const Vehicle = require("../models/Vehicle");
const Train = require("../models/Train");
const { assertDemoSeedTarget, createDemoData } = require("./demoDataFactory");

const resolveMongoUri = () =>
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

async function upsertModelRecords(model, records) {
  if (!records.length) return { upsertedCount: 0, modifiedCount: 0 };
  const operations = records.map((record) => {
    const { _id, ...fields } = record;
    return {
      updateOne: {
        filter: { _id },
        update: { $set: fields },
        upsert: true,
      },
    };
  });
  return model.bulkWrite(operations, { ordered: false });
}

async function upsertReferenceRecords(collectionName, records, kind) {
  if (!records.length) return { upsertedCount: 0, modifiedCount: 0 };
  const collection = mongoose.connection.collection(collectionName);
  const operations = records.map((record) => {
    const { sourceId, ...fields } = record;
    return {
      updateOne: {
        filter: { _id: "provided-reference:" + kind + ":" + sourceId },
        update: {
          $set: {
            ...fields,
            sourceId,
            sourceKind: kind,
            fixtureOnly: true,
          },
        },
        upsert: true,
      },
    };
  });
  return collection.bulkWrite(operations, { ordered: false });
}

async function main() {
  const uri = resolveMongoUri();
  const databaseName = assertDemoSeedTarget({
    uri,
    nodeEnv: process.env.NODE_ENV,
    allow: process.env.ALLOW_TRAVELCO_DEMO_SEED,
  });

  const scale = process.env.TRAVELCO_DEMO_SCALE || "small";
  const seed = process.env.TRAVELCO_DEMO_SEED ? Number(process.env.TRAVELCO_DEMO_SEED) : 20261019;
  const data = createDemoData({ scale, seed });

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    if (mongoose.connection.name !== databaseName) {
      throw new Error("Connected database name did not match the guarded URI database name.");
    }

    // Upsert only deterministic Travelco demo IDs. This script never deletes records.
    const hotelResult = await upsertModelRecords(Hotel, data.hotels);
    const roomResult = await upsertModelRecords(Room, data.rooms);
    const tourResult = await upsertModelRecords(Tour, data.tours);
    const vehicleResult = await upsertModelRecords(Vehicle, data.vehicles);
    const trainResult = await upsertModelRecords(Train, data.trains);

    // Import user-provided location data into explicitly named reference-only collections.
    // These collections are not connected to flight search and do not represent live schedules.
    const countryResult = await upsertReferenceRecords("travelco_demo_countries", data.referenceData.countries, "country");
    const regionResult = await upsertReferenceRecords("travelco_demo_regions", data.referenceData.regions, "region");
    const airportResult = await upsertReferenceRecords("travelco_demo_airports", data.referenceData.airports, "airport");
    const frequencyResult = await upsertReferenceRecords("travelco_demo_airport_frequencies", data.referenceData.airportFrequencies, "airport-frequency");

    console.log(JSON.stringify({
      message: "Travelco demo data upsert completed. No existing documents were deleted.",
      database: databaseName,
      scale,
      seed,
      catalog: {
        hotels: data.hotels.length,
        rooms: data.rooms.length,
        tours: data.tours.length,
        vehicles: data.vehicles.length,
        trains: data.trains.length,
      },
      referenceFixtures: {
        countries: data.referenceData.countries.length,
        regions: data.referenceData.regions.length,
        airports: data.referenceData.airports.length,
        airportFrequencies: data.referenceData.airportFrequencies.length,
      },
      upserted: {
        hotels: hotelResult.upsertedCount,
        rooms: roomResult.upsertedCount,
        tours: tourResult.upsertedCount,
        vehicles: vehicleResult.upsertedCount,
        trains: trainResult.upsertedCount,
        countries: countryResult.upsertedCount,
        regions: regionResult.upsertedCount,
        airports: airportResult.upsertedCount,
        airportFrequencies: frequencyResult.upsertedCount,
      },
    }, null, 2));
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Travelco demo seed failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { main, upsertModelRecords, upsertReferenceRecords };
