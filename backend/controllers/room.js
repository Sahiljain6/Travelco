
const Room = require("../models/Room.js");
const Hotel = require("../models/Hotel.js");
const { parsePositiveNumber, parsePositiveInteger } = require("../utils/validation");
const { invalidatePublicCatalog } = require("../utils/publicCatalogCache");


const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  const price = parsePositiveNumber(req.body?.price);
  const maxPeople = parsePositiveInteger(req.body?.maxPeople);
  const roomNumbers = Array.isArray(req.body?.roomNumbers) ? req.body.roomNumbers : [];

  if (price === null) return res.status(400).json({ message: "Room price must be greater than zero. Decimal values are allowed." });
  if (maxPeople === null) return res.status(400).json({ message: "Maximum people must be a whole number greater than zero." });
  if (!roomNumbers.length || roomNumbers.some((room) => parsePositiveInteger(room?.number) === null)) {
    return res.status(400).json({ message: "Provide at least one positive whole-number room number." });
  }

  try {
    const newRoom = new Room({
      ...req.body,
      price,
      maxPeople,
      roomNumbers: roomNumbers.map((room) => ({ ...room, number: Number(room.number) })),
    });
    const savedRoom = await newRoom.save();
    await Hotel.findByIdAndUpdate(hotelId, { $push: { rooms: savedRoom._id } });
    invalidatePublicCatalog();
    return res.status(201).json(savedRoom);
  } catch (error) {
    return next(error);
  }
};

const updateRoom =async (req,res,next)=>{
    try{
        const update = { ...(req.body || {}) };
        if (Object.prototype.hasOwnProperty.call(update, "price")) {
            const price = parsePositiveNumber(update.price);
            if (price === null) return res.status(400).json({ message: "Room price must be greater than zero. Decimal values are allowed." });
            update.price = price;
        }
        if (Object.prototype.hasOwnProperty.call(update, "maxPeople")) {
            const maxPeople = parsePositiveInteger(update.maxPeople);
            if (maxPeople === null) return res.status(400).json({ message: "Maximum people must be a whole number greater than zero." });
            update.maxPeople = maxPeople;
        }
        if (Object.prototype.hasOwnProperty.call(update, "roomNumbers")) {
            if (!Array.isArray(update.roomNumbers) || !update.roomNumbers.length || update.roomNumbers.some((room) => parsePositiveInteger(room?.number) === null)) {
                return res.status(400).json({ message: "Room numbers must be positive whole numbers." });
            }
            update.roomNumbers = update.roomNumbers.map((room) => ({ ...room, number: Number(room.number) }));
        }
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, { $set: update }, { new:true, runValidators:true });
        if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
        res.status(200).json(updatedRoom);

    }catch(err){
        next(err);
    }
}

const updateRoomAvailability =async (req,res,next)=>{
    try{
        console.log(req.body.dates)
        await Room.updateOne({"roomNumbers._id":req.params.id},{
            
            $push:{
                
                "roomNumbers.$.unavailableDates": req.body.dates 
            }
        })
        res.status(200).json("room updatedd");

    }catch(err){
        next(err);
    }
}



const deleteRoom =async (req,res,next)=>{
    const hotelId=req.params.hotelid;
    try{
        const deleteRoom= await Room.findByIdAndDelete(req.params.id);
        try{
            await Hotel.findByIdAndUpdate(hotelId, {$pull :{rooms: req.params.id}})
            invalidatePublicCatalog()
        }catch(err){
            next(err)
        }
        res.status(200).json("Room has been deleted.");

    }catch(err){
        res.status(500).json(err);
    }
}

const getRoom=async (req,res,next)=>{
    try{
        const viewRoom= await Room.findById(req.params.id);
        res.status(200).json(viewRoom);

    }catch(err){
        next(err);
    }
}

const getAllRoom =async (req,res,next)=>{
    try{
        const Rooms= await Room.find();
        res.status(200).json(Rooms);

    }catch(err){
        res.status(500).json(err);
    }
}

module.exports = {
    createRoom, updateRoom, deleteRoom, getRoom, getAllRoom,updateRoomAvailability
  };
