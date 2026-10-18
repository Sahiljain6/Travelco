"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Tour = require("../models/tours");
const Vehicle = require("../models/Vehicle");
const Train = require("../models/Train");
const {
  assertDemoSeedTarget,
  createDemoData,
  databaseNameFromUri,
  referenceData,
  stableObjectId,
} = require("../scripts/demoDataFactory");

test("stable object IDs are deterministic 24-character hexadecimal strings", () => {
  assert.equal(stableObjectId("hotel:1"), stableObjectId("hotel:1"));
  assert.notEqual(stableObjectId("hotel:1"), stableObjectId("hotel:2"));
  assert.match(stableObjectId("hotel:1"), /^[a-f0-9]{24}$/);
});

test("demo catalogue generation is repeatable with the same seed", () => {
  const first = createDemoData({ scale: "small", seed: 12345 });
  const second = createDemoData({ scale: "small", seed: 12345 });
  assert.deepEqual(first, second);
});

test("small demo catalogue is bounded and relationships are linked", () => {
  const data = createDemoData({ scale: "small", seed: 7 });
  assert.equal(data.hotels.length, 8);
  assert.equal(data.tours.length, 8);
  assert.equal(data.vehicles.length, 8);
  assert.equal(data.trains.length, 8);
  assert.ok(data.rooms.length >= data.hotels.length * 2);

  const roomIds = new Set(data.rooms.map((room) => String(room._id)));
  for (const hotel of data.hotels) {
    assert.equal(hotel.numberOfRoomTypes, hotel.rooms.length);
    assert.ok(hotel.rooms.every((roomId) => roomIds.has(String(roomId))));
    assert.ok(hotel.cheapestPrice > 0);
    assert.ok(hotel.rating >= 3 && hotel.rating <= 5);
  }
  for (const vehicle of data.vehicles) {
    assert.equal(vehicle.isAccepted, true);
    assert.ok(vehicle.price > 0);
    assert.ok(Number.isInteger(vehicle.capacity));
    assert.ok(vehicle.vehicleMainImg);
  }
  for (const train of data.trains) {
    assert.ok(train.price > 0);
    assert.ok(Number.isInteger(train.noOfSeats));
    assert.match(train.date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("generated catalogue records pass Travelco model schema validation", async () => {
  const data = createDemoData({ scale: "small", seed: 2026 });
  const modelsAndRecords = [
    [Hotel, data.hotels],
    [Room, data.rooms],
    [Tour, data.tours],
    [Vehicle, data.vehicles],
    [Train, data.trains],
  ];

  for (const [Model, records] of modelsAndRecords) {
    for (const record of records) {
      await assert.doesNotReject(() => new Model(record).validate(), Model.modelName);
    }
  }
});

test("airport fixture references only included countries, regions and airports", () => {
  const countryCodes = new Set(referenceData.countries.map((record) => record.code));
  const regionCodes = new Set(referenceData.regions.map((record) => record.code));
  const airportIdentifiers = new Set(referenceData.airports.map((record) => record.ident));
  assert.ok(referenceData.airports.length >= 15);
  assert.ok(referenceData.countries.length >= 10);
  assert.ok(referenceData.regions.length >= 10);

  for (const airport of referenceData.airports) {
    assert.ok(countryCodes.has(airport.countryCode));
    assert.ok(regionCodes.has(airport.regionCode));
    assert.ok(airport.iata);
  }
  for (const frequency of referenceData.airportFrequencies) {
    assert.ok(airportIdentifiers.has(frequency.airportIdent));
    assert.ok(frequency.frequencyMHz > 0);
  }
});

test("seed target guard requires explicit consent and a non-production database marker", () => {
  const uri = "mongodb://127.0.0.1:27017/travelco_demo";
  assert.throws(
    () => assertDemoSeedTarget({ uri, nodeEnv: "production", allow: "true" }),
    /disabled when NODE_ENV=production/
  );
  assert.throws(
    () => assertDemoSeedTarget({ uri, nodeEnv: "development", allow: "false" }),
    /ALLOW_TRAVELCO_DEMO_SEED=true/
  );
  assert.throws(
    () => assertDemoSeedTarget({
      uri: "mongodb://127.0.0.1:27017/travelco",
      nodeEnv: "development",
      allow: "true",
    }),
    /Database name must include/
  );
  assert.equal(
    assertDemoSeedTarget({ uri, nodeEnv: "development", allow: "true" }),
    "travelco_demo"
  );
  assert.equal(databaseNameFromUri(uri + "?retryWrites=true"), "travelco_demo");
});

test("unsupported data scales are rejected before any database connection", () => {
  assert.throws(() => createDemoData({ scale: "massive" }), /Unknown demo data scale/);
});
