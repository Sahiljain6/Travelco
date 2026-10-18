"use strict";

const crypto = require("node:crypto");
const { faker } = require("@faker-js/faker");
const referenceData = require("../data/demo/airport-reference.json");

const CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "LKR", "AUD", "CAD", "NZD", "JPY", "CNY",
  "SGD", "ZAR", "CHF", "AED", "BRL", "MXN", "KRW", "THB", "MYR", "IDR",
  "PHP", "TRY", "SAR", "NGN", "PKR",
];

const CURRENCY_BY_COUNTRY = {
  IN: "INR", LK: "LKR", GB: "GBP", FR: "EUR", DE: "EUR", SG: "SGD",
  AE: "AED", US: "USD", CA: "CAD", BR: "BRL", ZA: "ZAR", AU: "AUD",
  NZ: "NZD", NP: "INR", HK: "SGD", MX: "MXN", JP: "JPY", CN: "CNY",
  ID: "IDR", MY: "MYR", TH: "THB", KR: "KRW", PH: "PHP", TR: "TRY",
  SA: "SAR", PK: "PKR", CH: "CHF", NG: "NGN",
};

const SCALES = {
  small: { hotels: 8, tours: 8, vehicles: 8, trains: 8 },
  standard: { hotels: 30, tours: 30, vehicles: 25, trains: 20 },
  load: { hotels: 100, tours: 100, vehicles: 100, trains: 50 },
};

const ROOM_TYPES = ["Standard Double Room", "Deluxe King Room", "Twin Room", "Family Suite", "Accessible Room"];
const HOTEL_TYPES = ["Hotel", "apartment", "resort", "villa", "cabin"];
const TOUR_TYPES = ["Adventure", "Cultural", "Nature", "Beach", "City Break", "Wildlife", "Family"];
const VEHICLE_TYPES = ["Car", "SUV", "Van", "Motorcycle"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const LANGUAGES = ["English", "English, Hindi", "English, French", "English, Spanish", "English, Japanese"];
const TRAIN_ROUTES = [
  ["Mumbai", "Pune"], ["New Delhi", "Jaipur"], ["Chennai", "Bengaluru"],
  ["Mumbai", "Goa"], ["Kolkata", "Patna"], ["Hyderabad", "Bengaluru"],
  ["Pune", "Hyderabad"], ["Ahmedabad", "Mumbai"], ["Kochi", "Chennai"],
  ["New Delhi", "Agra"], ["Jaipur", "Udaipur"], ["Lucknow", "New Delhi"],
  ["Bengaluru", "Mysuru"], ["Chennai", "Coimbatore"], ["Varanasi", "New Delhi"],
  ["Mumbai", "Surat"], ["Amritsar", "New Delhi"], ["Bhopal", "Mumbai"],
  ["Kolkata", "Bhubaneswar"], ["Nagpur", "Hyderabad"],
];

function stableObjectId(key) {
  return crypto.createHash("sha256").update("travelco-demo:" + key).digest("hex").slice(0, 24);
}

function imageUrl(kind, index, variant = "main") {
  return "https://picsum.photos/seed/travelco-" + kind + "-" + index + "-" + variant + "/900/600";
}

function cleanCity(city) {
  return String(city || "").split(" (")[0].trim() || "Travel destination";
}

function currencyForCountry(countryCode) {
  const code = CURRENCY_BY_COUNTRY[countryCode] || "USD";
  return CURRENCIES.includes(code) ? code : "USD";
}

function priceForCurrency(currency, kind = "hotel") {
  let range;
  if (currency === "JPY" || currency === "KRW" || currency === "IDR") {
    range = kind === "vehicle" ? [5000, 35000] : kind === "tour" ? [8000, 80000] : [8000, 45000];
  } else if (currency === "INR" || currency === "LKR" || currency === "PKR" || currency === "NGN") {
    range = kind === "vehicle" ? [1800, 12000] : kind === "tour" ? [2500, 30000] : [2200, 24000];
  } else if (currency === "ZAR" || currency === "MXN" || currency === "THB" || currency === "PHP" || currency === "TRY") {
    range = kind === "vehicle" ? [400, 5000] : kind === "tour" ? [500, 9000] : [600, 8000];
  } else {
    range = kind === "vehicle" ? [25, 280] : kind === "tour" ? [60, 900] : [55, 650];
  }
  return faker.number.int({ min: range[0], max: range[1] });
}

function buildRooms(hotelIndex, roomCount, currency) {
  const rooms = [];
  for (let roomIndex = 0; roomIndex < roomCount; roomIndex += 1) {
    const roomId = stableObjectId("room:" + hotelIndex + ":" + roomIndex);
    const baseNumber = (hotelIndex + 1) * 100 + roomIndex * 10;
    rooms.push({
      _id: roomId,
      title: faker.helpers.arrayElement(ROOM_TYPES),
      price: Number((priceForCurrency(currency, "hotel") * (0.8 + roomIndex * 0.2)).toFixed(2)),
      description: faker.lorem.sentence(),
      maxPeople: faker.number.int({ min: 1, max: 6 }),
      roomNumbers: Array.from({ length: 4 }, (_unused, numberIndex) => ({
        _id: stableObjectId("room-number:" + hotelIndex + ":" + roomIndex + ":" + numberIndex),
        number: baseNumber + numberIndex + 1,
        unavailableDates: [],
      })),
    });
  }
  return rooms;
}

function createDemoData(options = {}) {
  const scale = options.scale || "small";
  const counts = SCALES[scale];
  if (!counts) {
    throw new Error("Unknown demo data scale. Use small, standard, or load.");
  }

  const seed = Number.isSafeInteger(Number(options.seed)) ? Number(options.seed) : 20261019;
  faker.seed(seed);

  const hotels = [];
  const rooms = [];
  const tours = [];
  const vehicles = [];
  const trains = [];
  const airports = referenceData.airports;

  for (let index = 0; index < counts.hotels; index += 1) {
    const airport = airports[index % airports.length];
    const city = cleanCity(airport.city);
    const currency = currencyForCountry(airport.countryCode);
    const roomCount = 2 + (index % 2);
    const hotelRooms = buildRooms(index, roomCount, currency);
    rooms.push(...hotelRooms);

    hotels.push({
      _id: stableObjectId("hotel:" + index),
      name: "Travelco Demo " + faker.company.name() + " " + String(index + 1).padStart(3, "0"),
      title: city + " " + faker.helpers.arrayElement(["City Hotel", "Boutique Stay", "Family Resort", "Airport Hotel", "Garden Suites"]),
      type: HOTEL_TYPES[index % HOTEL_TYPES.length],
      city,
      country: airport.country,
      currency,
      province: airport.region || airport.country,
      zip: String(10000 + index),
      address: faker.location.streetAddress() + ", " + city,
      distance: faker.number.int({ min: 1, max: 20 }) + " km from city centre",
      contactName: faker.person.fullName(),
      // Fictional North American test numbers only; never call or message seeded contacts.
      contactNo: "+1555010" + String(index + 1).padStart(4, "0"),
      numberOfRoomTypes: roomCount,
      HotelImg: imageUrl("hotel", index, "main"),
      HotelImgs: [imageUrl("hotel", index, "room"), imageUrl("hotel", index, "lobby")],
      certificates: [],
      description: faker.lorem.paragraph(),
      cheapestPrice: priceForCurrency(currency, "hotel"),
      rating: Number((faker.number.int({ min: 30, max: 50 }) / 10).toFixed(1)),
      rooms: hotelRooms.map((room) => String(room._id)),
      sustainability: index % 2 === 0,
      availableWork: index % 3 === 0,
      featured: index < 6,
      isApproved: true,
    });
  }

  for (let index = 0; index < counts.tours; index += 1) {
    const airport = airports[(index * 3) % airports.length];
    const city = cleanCity(airport.city);
    const currency = currencyForCountry(airport.countryCode);
    tours.push({
      _id: stableObjectId("tour:" + index),
      currentUser: "travelco-demo-seed",
      img: imageUrl("tour", index, "cover"),
      name: "Demo " + faker.commerce.productName() + " Experience " + String(index + 1).padStart(3, "0"),
      category: TOUR_TYPES[index % TOUR_TYPES.length],
      price: priceForCurrency(currency, "tour"),
      currency,
      groupCount: faker.number.int({ min: 4, max: 24 }),
      languages: LANGUAGES[index % LANGUAGES.length],
      duration: String(faker.number.int({ min: 1, max: 10 })),
      cities: city + "," + airport.country,
      country: airport.country,
      description: faker.lorem.paragraph(),
      introduction: faker.lorem.sentence(),
    });
  }

  for (let index = 0; index < counts.vehicles; index += 1) {
    const airport = airports[(index * 2) % airports.length];
    const currency = currencyForCountry(airport.countryCode);
    vehicles.push({
      _id: stableObjectId("vehicle:" + index),
      ownerName: "Travelco Demo Fleet " + String(index + 1).padStart(3, "0"),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      vehicleType: VEHICLE_TYPES[index % VEHICLE_TYPES.length],
      userId: "travelco-demo-seed",
      vehicleNumber: "TC-TEST-" + String(index + 1).padStart(4, "0"),
      capacity: faker.number.int({ min: 2, max: 12 }),
      transmissionType: TRANSMISSIONS[index % TRANSMISSIONS.length],
      fuelType: FUEL_TYPES[index % FUEL_TYPES.length],
      price: priceForCurrency(currency, "vehicle"),
      currency,
      description: "Synthetic Travelco QA vehicle. Not a real rental listing. " + faker.lorem.sentence(),
      insuranceImgs: [imageUrl("vehicle", index, "insurance")],
      vehicleMainImg: imageUrl("vehicle", index, "main"),
      vehicleImgs: [imageUrl("vehicle", index, "side"), imageUrl("vehicle", index, "interior")],
      location: cleanCity(airport.city) + ", " + airport.country,
      isAccepted: true,
    });
  }

  const baseDate = Date.UTC(2027, 0, 1);
  for (let index = 0; index < counts.trains; index += 1) {
    const [from, to] = TRAIN_ROUTES[index % TRAIN_ROUTES.length];
    const date = new Date(baseDate + index * 3 * 86400000).toISOString().slice(0, 10);
    trains.push({
      _id: stableObjectId("train:" + index),
      trainName: "Travelco QA Express " + String(index + 1).padStart(3, "0"),
      from,
      to,
      arrivalTime: String(6 + (index % 12)).padStart(2, "0") + ":45",
      depatureTime: String(5 + (index % 12)).padStart(2, "0") + ":10",
      date,
      price: faker.number.int({ min: 250, max: 4500 }),
      noOfSeats: faker.number.int({ min: 30, max: 250 }),
      description: "Synthetic QA timetable fixture; not a verified or bookable railway service.",
      trainMainImg: imageUrl("train", index, "cover"),
      MaxBagage: faker.number.int({ min: 10, max: 30 }),
      classType: faker.helpers.arrayElement(["Sleeper", "AC 3 Tier", "AC 2 Tier", "Chair Car"]),
      cancelCharges: faker.number.int({ min: 0, max: 500 }),
    });
  }

  return { hotels, rooms, tours, vehicles, trains, referenceData };
}

function databaseNameFromUri(uri) {
  const withoutQuery = String(uri || "").split("?")[0].replace(/\/+$/, "");
  const lastSlash = withoutQuery.lastIndexOf("/");
  return lastSlash < 0 ? "" : decodeURIComponent(withoutQuery.slice(lastSlash + 1));
}

function assertDemoSeedTarget({ uri, nodeEnv, allow } = {}) {
  if (!uri) throw new Error("Set MONGO_URI to a dedicated development/staging database.");
  if (String(nodeEnv || "").toLowerCase() === "production") {
    throw new Error("Demo seeding is disabled when NODE_ENV=production.");
  }
  if (allow !== "true") {
    throw new Error("Set ALLOW_TRAVELCO_DEMO_SEED=true only after confirming the target is disposable development/staging data.");
  }

  const dbName = databaseNameFromUri(uri);
  const safeName = /(^|[-_])(dev|development|test|testing|stage|staging|sandbox|demo|local)([-_]|$)/i.test(dbName);
  if (!safeName) {
    throw new Error("Database name must include a clear dev, test, staging, sandbox, demo, or local marker (for example travelco_demo).");
  }
  return dbName;
}

module.exports = {
  assertDemoSeedTarget,
  createDemoData,
  databaseNameFromUri,
  referenceData,
  stableObjectId,
};
