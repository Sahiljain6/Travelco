const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { isValidInternationalPhone, isValidPostalCode, parsePositiveNumber, parsePositiveInteger, isOptionalRating } = require("../utils/validation");


//img upload part
 const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 8, fields: 100, parts: 120 },
    fileFilter(_req, file, cb) {
      const extension = path.extname(file.originalname).toLowerCase();
      const expectedMime = extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : extension === ".png" ? "image/png" : null;
      if (!expectedMime || file.mimetype !== expectedMime) {
        return cb(new Error("Only valid JPG or PNG images are allowed."));
      }
      return cb(null, true);
    }
  }).fields([
    { name: "HotelImg", maxCount: 1 },
    { name: "HotelImgs", maxCount: 5 },
    { name: "certificates", maxCount: 2 }
  ]);

  const removeUploadedFiles = async (files) => {
    const uploaded = Object.values(files || {}).flat();
    await Promise.all(uploaded.map((file) => fs.promises.unlink(file.path).catch(() => {})));
  };

  const hasValidImageSignature = async (file) => {
    let handle;
    try {
      handle = await fs.promises.open(file.path, "r");
      const header = Buffer.alloc(8);
      const { bytesRead } = await handle.read(header, 0, header.length, 0);
      if (file.mimetype === "image/jpeg") {
        return bytesRead >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
      }
      if (file.mimetype === "image/png") {
        return bytesRead >= 8 &&
          header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e &&
          header[3] === 0x47 && header[4] === 0x0d && header[5] === 0x0a &&
          header[6] === 0x1a && header[7] === 0x0a;
      }
      return false;
    } catch {
      return false;
    } finally {
      if (handle) await handle.close().catch(() => {});
    }
  };

  // Create a new hotel with the same validation used by update forms.
  const createHotel = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        await removeUploadedFiles(req.files);
        const message = err.code === "LIMIT_FILE_SIZE"
          ? "Each hotel image must be 5 MB or smaller."
          : "Hotel image upload is invalid. Use JPG or PNG files within the size limit.";
        return res.status(400).json({ message });
      }

      try {
        const body = req.body || {};
        if (!isValidPostalCode(body.zip)) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "Enter a valid postal/ZIP code (2–12 characters; not all zeroes)." });
        }
        if (!isValidInternationalPhone(body.contactNo)) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "Enter a valid international contact number with 7–15 digits; it cannot be all zeroes." });
        }
        const cheapestPrice = parsePositiveNumber(body.cheapestPrice);
        if (cheapestPrice === null) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "Cheapest price must be greater than zero. Decimal values are allowed." });
        }
        const numberOfRoomTypes = parsePositiveInteger(body.numberOfRoomTypes);
        if (numberOfRoomTypes === null) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "Number of room types must be a whole number greater than zero." });
        }
        if (!isOptionalRating(body.rating, 5) || (body.rating !== "" && Number(body.rating) < 1)) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "Rating must be between 1 and 5. Decimal values such as 4.5 are allowed." });
        }

        const uploadedFiles = Object.values(req.files || {}).flat();
        for (const file of uploadedFiles) {
          if (!(await hasValidImageSignature(file))) {
            await removeUploadedFiles(req.files);
            return res.status(400).json({ message: "One or more files are not valid JPG or PNG images." });
          }
        }

        const hotelImg = req.files?.HotelImg?.[0];
        if (!hotelImg) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "A main hotel image is required." });
        }

        const newHotel = new Hotel({
          ...body,
          zip: String(body.zip).trim(),
          contactNo: String(body.contactNo).trim(),
          numberOfRoomTypes,
          cheapestPrice,
          ...(body.rating === undefined || body.rating === "" ? { rating: undefined } : { rating: Number(body.rating) }),
          HotelImg: hotelImg.filename,
          HotelImgs: (req.files?.HotelImgs || []).map((file) => file.filename),
          certificates: (req.files?.certificates || []).map((file) => file.filename),
        });

        await newHotel.save();
        return res.status(201).json(newHotel);
      } catch (error) {
        await removeUploadedFiles(req.files);
        return res.status(400).json({ message: error.message || "Unable to create hotel." });
      }
    });
  };

  // update Hotel
const updateHotel = async (req, res, next) => {
  const body = { ...(req.body || {}) };

  if (Object.prototype.hasOwnProperty.call(body, "zip") && !isValidPostalCode(body.zip)) {
    return res.status(400).json({ message: "Enter a valid postal/ZIP code (2–12 characters; not all zeroes)." });
  }
  if (Object.prototype.hasOwnProperty.call(body, "contactNo") && !isValidInternationalPhone(body.contactNo)) {
    return res.status(400).json({ message: "Enter a valid international contact number with 7–15 digits; it cannot be all zeroes." });
  }
  if (Object.prototype.hasOwnProperty.call(body, "cheapestPrice")) {
    const price = parsePositiveNumber(body.cheapestPrice);
    if (price === null) return res.status(400).json({ message: "Cheapest price must be greater than zero. Decimal values are allowed." });
    body.cheapestPrice = price;
  }
  if (Object.prototype.hasOwnProperty.call(body, "numberOfRoomTypes")) {
    const roomTypes = parsePositiveInteger(body.numberOfRoomTypes);
    if (roomTypes === null) return res.status(400).json({ message: "Number of room types must be a whole number greater than zero." });
    body.numberOfRoomTypes = roomTypes;
  }
  if (Object.prototype.hasOwnProperty.call(body, "rating")) {
    if (!isOptionalRating(body.rating, 5) || (body.rating !== "" && Number(body.rating) < 1)) return res.status(400).json({ message: "Rating must be between 1 and 5." });
    if (body.rating === "") delete body.rating;
    else body.rating = Number(body.rating);
  }

  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
    if (!updatedHotel) return res.status(404).json({ message: "Hotel not found." });
    return res.status(200).json(updatedHotel);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to update hotel." });
  }
}

//delete Hotel
const deleteHotel =async (req,res,next)=>{
    try{
        console.log(req.params.id)
        const deleteHotel= await Hotel.findByIdAndDelete(req.params.id);
        res.status(200).json("Hotel has been deleted.");

    }catch(err){
  
        res.status(500).json(err);
    }
}
 
//get Hotel
const getHotel =async (req,res,next)=>{
    try{
        const viewHotel= await Hotel.findOne({ _id: req.params.id, isApproved: true });
        res.status(200).json(viewHotel);

    }catch(err){
        next(err);
    }
}

//get all Hotels
const getAllHotel = async (req, res) => {
  const min = req.query.min === undefined ? 0 : Number(req.query.min);
  const max = req.query.max === undefined ? Number.MAX_SAFE_INTEGER : Number(req.query.max);
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = req.query.limit === undefined ? 100 : Math.min(100, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 100));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
    return res.status(400).json({ message: "Invalid price range" });
  }
  try {
    const hotels = await Hotel.find({ isApproved: true, cheapestPrice: { $gte: min, $lte: max } }).limit(limit);
    return res.status(200).json(hotels);
  } catch {
    return res.status(500).json({ message: "Unable to retrieve hotels" });
  }
};

//count by city
 const countByCity =async (req,res,next)=>{
    const cities = req.query.cities.split(",")
    try{
        const list = await Promise.all(cities.map(city => {
            return Hotel.countDocuments({city: city})
        }))

        res.status(200).json(list);

    }catch(err){
        res.status(500).json(err);
    }
}


//count by type
const countByType =async (req,res,next)=>{
    
    try{

    const hotelCount  =await Hotel.countDocuments({type:"Hotel"})
    const apratmentCount =await Hotel.countDocuments({type:"apartment"})
    const resortCount  =await Hotel.countDocuments({type:"resort"})
    const villaCount  =await Hotel.countDocuments({type:"villa"})
    const cabinCount  =await Hotel.countDocuments({type:"cabin"})
   
        res.status(200).json([
            {type:"hotel", count:hotelCount},
            {type:"apartment", count:apratmentCount},
            {type:"resort", count:resortCount},
            {type:"villa", count:villaCount},
            {type:"cabin", count:cabinCount},
        ]);

    }catch(err){
        res.status(500).json(err);
    }
}



// get hotel by hotel type and city

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getHotelbyCity = async (req, res) => {
  const destination = String(req.params.city || "").trim().slice(0, 120);
  if (!destination) return res.status(400).json({ message: "A destination is required" });
  const parts = destination.split(",").map((part) => part.trim()).filter(Boolean);
  const cityPattern = escapeRegex(parts[0]);
  try {
    const query = {
      isApproved: true,
      $or: [
        { city: { $regex: cityPattern, $options: "i" } },
        { country: { $regex: cityPattern, $options: "i" } },
        { address: { $regex: cityPattern, $options: "i" } }
      ]
    };
    if (parts.length > 1) query.country = { $regex: escapeRegex(parts[1]), $options: "i" };
    const hotels = await Hotel.find(query).limit(100);
    return res.status(200).json(hotels);
  } catch {
    return res.status(500).json({ message: "Unable to search hotels" });
  }
};

const getHotelRooms = async(req,res,next)=>{
  try{
    const hotel= await Hotel.findOne({ _id: req.params.id, isApproved: true });
    const list= await  Promise.all(hotel.rooms.map((room)=>{
        return Room.findById(room);

    }))
    res.status(200).json(list)  
  }catch(err){
    next(err);
  }  
 }

module.exports = {
    createHotel,
    updateHotel,
    deleteHotel,
    getHotel,
    getAllHotel,
    countByCity,
    countByType,
    getHotelbyCity,
    getHotelRooms
    
  };


