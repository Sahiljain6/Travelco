const multer = require("multer");
const Train = require("../models/Train");
const path = require("path");
const { parsePositiveNumber, parsePositiveInteger, parseNonNegativeNumber } = require("../utils/validation");

const storage = multer.diskStorage({
    destination : (req,file,cb)=> {
        cb(null,"images")
    },
    filename : (req,file,cb)=>{
        console.log(file);
        cb(null,Date.now()+path.extname(file.originalname));
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
    { name: 'trainMainImg', maxCount: 1 }
  ]);

// Add a train and validate numeric fields before persisting.
const addTrain = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message || "Error uploading train image" });

      const price = parsePositiveNumber(req.body?.price);
      if (price === null) return res.status(400).json({ message: "Fare must be greater than zero. Decimal values are allowed." });
      const noOfSeats = parsePositiveInteger(req.body?.noOfSeats);
      if (noOfSeats === null) return res.status(400).json({ message: "Number of seats must be a positive whole number." });

      const normalized = { ...req.body, price, noOfSeats };
      for (const key of ["MaxBagage", "cancelCharges"]) {
        const value = req.body?.[key];
        if (value === undefined || value === null || value === "") {
          delete normalized[key];
          continue;
        }
        const parsed = parseNonNegativeNumber(value);
        if (parsed === null) return res.status(400).json({ message: key === "MaxBagage" ? "Baggage weight must be zero or greater. Decimal values are allowed." : "Cancellation charges must be zero or greater. Decimal values are allowed." });
        normalized[key] = parsed;
      }

      try {
        const newTrain = new Train(normalized);
        await newTrain.save();
        return res.status(201).json(newTrain);
      } catch (saveError) {
        return res.status(400).json({ message: saveError.message || "Unable to add train" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to add train" });
  }
};

// get all trains admin -- just for now
const getAllTrains = async(req,res)=>{
    await Train.find().then((trains)=>{
        res.json(trains);
    }).catch((err)=>{
        res.send(err.message);
    })
}

// get one trains
const getSingleTrain = async (req,res)=>{
    const id = req.params.id;

    const train = await Train.findById(id).then((train)=>{
        res.json(train);
    }).catch((err)=>{
        res.json(err.message)
    })
}

// delete train  - admin
const deleteTrain = async(req,res)=>{
    const id = req.params.id;

    await Train.findByIdAndDelete(id).then(()=>{
        res.json("deleted");
    }).catch((err)=>{
        res.json(err.message);
    })
}


// Update train with consistent numeric validation.
const updateTrain = async (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  const update = {};

  if (body.price !== undefined) {
    const price = parsePositiveNumber(body.price);
    if (price === null) return res.status(400).json({ message: "Fare must be greater than zero. Decimal values are allowed." });
    update.price = price;
  }
  if (body.noOfSeats !== undefined) {
    const noOfSeats = parsePositiveInteger(body.noOfSeats);
    if (noOfSeats === null) return res.status(400).json({ message: "Number of seats must be a positive whole number." });
    update.noOfSeats = noOfSeats;
  }
  for (const key of ["MaxBagage", "cancelCharges"]) {
    if (body[key] === undefined) continue;
    if (body[key] === "") {
      update[key] = undefined;
      continue;
    }
    const parsed = parseNonNegativeNumber(body[key]);
    if (parsed === null) return res.status(400).json({ message: key === "MaxBagage" ? "Baggage weight must be zero or greater. Decimal values are allowed." : "Cancellation charges must be zero or greater. Decimal values are allowed." });
    update[key] = parsed;
  }
  for (const key of ["trainName", "from", "to", "arrivalTime", "depatureTime", "date", "description", "trainMainImg", "classType"]) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  try {
    const updatedTrain = await Train.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!updatedTrain) return res.status(404).json({ message: "Train not found" });
    return res.status(200).json({ status: "Updated", train: updatedTrain });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to update train" });
  }
};

// fetch trains by from and To of searh component
const getTrainFromTo =  async (req,res) =>{
    const {from,to} = req.params;
    try{
        const trains = await Train.find({from : from , to : to})
        if(!trains){
            res.status(404).send("no trains");
        }
        res.send(trains)
    }catch(err){
        res.status(500).send(err.message);
    }
}

module.exports= {
    addTrain,
    getAllTrains,
    getSingleTrain,
    deleteTrain,
    updateTrain,
    getTrainFromTo
}