const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

// Models
const Tour = require("./models/tours");
const Hotel = require("./models/Hotel");
const Vehicle = require("./models/Vehicle");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("Seeding stopped: set MONGO_URI (or MONGO_URL/MONGODB_URI/DATABASE_URL) in your local environment.");
  process.exit(1);
}

// This script deletes existing Tour, Hotel and Vehicle records before inserting samples.
// Never allow the destructive seed routine to run against a production environment.
if (process.env.NODE_ENV === "production") {
  console.error("Seeding stopped: the destructive seed script is disabled in production.");
  process.exit(1);
}
if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
  console.error("Seeding stopped: use an isolated disposable development database and set ALLOW_DESTRUCTIVE_SEED=true to confirm the destructive reset.");
  process.exit(1);
}

const sampleTours = [
  {
    currentUser: "admin@travelco.com",
    name: "Sigiriya & Ancient Kingdom Explorer",
    category: "Historical",
    price: 150,
    groupCount: 8,
    languages: "English, French",
    duration: "3",
    cities: "Sigiriya,Kandy,Dambulla",
    description: "Discover the UNESCO World Heritage Sigiriya Rock Fortress, ancient cave temples, and royal gardens.",
    introduction: "An unforgettable cultural expedition through the majestic heart of Sri Lanka.",
    img: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800",
  },
  {
    currentUser: "admin@travelco.com",
    name: "Yala Wildlife & Safari Adventure",
    category: "Wildlife",
    price: 220,
    groupCount: 6,
    languages: "English, German",
    duration: "2",
    cities: "Yala,Tissamaharama",
    description: "Get up close with leopards, wild elephants, and exotic birds in Sri Lanka's premier national park.",
    introduction: "Thrilling jeep safaris guided by certified naturalists.",
    img: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800",
  },
  {
    currentUser: "admin@travelco.com",
    name: "Ella Highlands & Scenic Train Tour",
    category: "Nature",
    price: 180,
    groupCount: 10,
    languages: "English, Spanish",
    duration: "4",
    cities: "Ella,Nuwara Eliya,Kandy",
    description: "Experience the world-famous blue train ride, lush tea plantations, and Little Adam's Peak.",
    introduction: "Breathtaking misty mountains, waterfalls, and colonial charm.",
    img: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800",
  },
  {
    currentUser: "admin@travelco.com",
    name: "Mirissa & Galle Coastal Getaway",
    category: "Beach",
    price: 130,
    groupCount: 12,
    languages: "English",
    duration: "3",
    cities: "Galle,Mirissa,Bentota",
    description: "Whale watching in Mirissa, surfing in Weligama, and walking the historic Galle Dutch Fort ramparts.",
    introduction: "Sun, sea, and rich maritime colonial history.",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  },
];

const sampleHotels = [
  {
    name: "Cinnamon Grand",
    title: "Luxury 5-Star Urban Resort",
    type: "Hotel",
    city: "Colombo",
    province: "Western",
    zip: 100,
    address: "77 Galle Road, Colombo 03",
    distance: "500m from city center",
    contactName: "Front Desk Manager",
    contactNo: 94112437437,
    numberOfRoomTypes: 4,
    HotelImg: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    cheapestPrice: 120,
    rating: 5,
    description: "Premier city hotel featuring 14 restaurants, luxury spas, and 2 outdoor swimming pools.",
  },
  {
    name: "Heritance Kandalama",
    title: "Eco-Luxury Lake Resort",
    type: "Resort",
    city: "Dambulla",
    province: "Central",
    zip: 21100,
    address: "Kandalama, Dambulla",
    distance: "2km from Dambulla Cave Temple",
    contactName: "Reservations Office",
    contactNo: 94665555000,
    numberOfRoomTypes: 3,
    HotelImg: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    cheapestPrice: 180,
    rating: 5,
    description: "Architectural masterpiece built into a rock cliff overlooking Kandalama Lake and Sigiriya.",
  },
  {
    name: "98 Acres Resort & Spa",
    title: "Mountain Retreat",
    type: "Resort",
    city: "Ella",
    province: "Uva",
    zip: 90090,
    address: "Passara Road, Ella",
    distance: "1km from Little Adam's Peak",
    contactName: "Guest Services",
    contactNo: 94574925000,
    numberOfRoomTypes: 3,
    HotelImg: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    cheapestPrice: 220,
    rating: 5,
    description: "Scenic resort nestled amidst a 98-acre tea estate with panoramic views of Ella Gap.",
  },
];

const sampleVehicles = [
  {
    ownerName: "Travelco Fleet",
    brand: "Toyota",
    model: "KDH Super GL",
    vehicleType: "Van",
    userId: "admin",
    vehicleNumber: "WP-CAB-4521",
    capacity: 10,
    transmissionType: "Automatic",
    fuelType: "Diesel",
    price: 85,
    description: "Spacious luxury passenger van, ideal for family tours and group travel with ample luggage capacity.",
    insuranceImgs: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"],
    vehicleMainImg: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    vehicleImgs: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"],
    location: "Colombo",
    isAccepted: true,
  },
  {
    ownerName: "Travelco Fleet",
    brand: "Toyota",
    model: "Prius",
    vehicleType: "Car",
    userId: "admin",
    vehicleNumber: "WP-KX-8812",
    capacity: 4,
    transmissionType: "Automatic",
    fuelType: "Hybrid",
    price: 50,
    description: "Fuel-efficient, comfortable hybrid sedan with full air conditioning and modern safety features.",
    insuranceImgs: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"],
    vehicleMainImg: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    vehicleImgs: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"],
    location: "Kandy",
    isAccepted: true,
  },
  {
    ownerName: "Travelco Fleet",
    brand: "Mitsubishi",
    model: "Montero Sport",
    vehicleType: "SUV",
    userId: "admin",
    vehicleNumber: "WP-CAG-3310",
    capacity: 7,
    transmissionType: "Automatic",
    fuelType: "Diesel",
    price: 95,
    description: "4x4 luxury SUV suited for both city cruising and rugged highland terrains.",
    insuranceImgs: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"],
    vehicleMainImg: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    vehicleImgs: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"],
    location: "Galle",
    isAccepted: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully! 🚀");

    console.log("Clearing old sample records (if any)...");
    await Tour.deleteMany({});
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});

    console.log("Seeding Tours...");
    await Tour.insertMany(sampleTours);
    console.log(`✅ Seeded ${sampleTours.length} Tours`);

    console.log("Seeding Hotels...");
    await Hotel.insertMany(sampleHotels);
    console.log(`✅ Seeded ${sampleHotels.length} Hotels`);

    console.log("Seeding Vehicles...");
    await Vehicle.insertMany(sampleVehicles);
    console.log(`✅ Seeded ${sampleVehicles.length} Vehicles`);

    console.log("\n🎉 Database seeded successfully with initial data!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
