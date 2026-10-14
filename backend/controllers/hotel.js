const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const multer = require("multer");
const path = require("path");


//img upload part
 const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null,"images")
    },
    filename : (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname) );
    } 
});

 const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'));
      }
      cb(null, true);
    }
  }).fields([
    { name: 'HotelImg', maxCount: 1 },
    { name: 'HotelImgs', maxCount: 5 },
    { name: 'certificates', maxCount: 2}
  ]);

  // Create a new hotel
  const createHotel = async (req, res) => {
    try {
      // Use Multer middleware to handle file upload
      upload(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error uploading images" });
        }  
  
        // Extract the file names from the request object
        const hotelImg = req.files.HotelImg[0].filename;
        const HotelImgs = req.files.HotelImgs.map((file) => file.filename);
        const certificates=req.files.certificates.map((file)=>file.filename);
  
        // Create a new hotel object from the request body and file names
        const newHotel = new Hotel({ 
          ...req.body,   
          HotelImg: hotelImg,
          HotelImgs:HotelImgs,
          certificates:certificates
        }); 
  
        // Save the new hotel to the database
        await newHotel.save();
  
        // Send a response with the new hotel object 
        res.status(200).json(newHotel); 
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    } 
  };  
  
 // update Hotel
const  updateHotel =async (req,res,next)=>{
    try{
        const updatedHotel= await Hotel.findByIdAndUpdate(req.params.id, {$set:req.body}
            ,{new:true})
        res.status(200).json(updatedHotel);

    }catch(err){ 
        next(err);
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
        const viewHotel= await Hotel.findById(req.params.id);
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
    const hotel= await Hotel.findById(req.params.id);
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


