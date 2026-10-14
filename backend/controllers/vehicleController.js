const multer = require("multer");
const Vehicle = require("../models/Vehicle");
//const AcceptedVehicle = require("../models/AcceptedVehicle");
const path = require("path");

//image uploading path to diskStorage
const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "images")
    },
    filename : (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname) );
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
    fileFilter: function (req, file, cb) {
      const validExtension = /\.(jpg|jpeg|png)$/i.test(file.originalname);
      const validMime = ["image/jpeg", "image/png"].includes(file.mimetype);
      if (!validExtension || !validMime) {
        return cb(new Error("Only JPEG and PNG images up to 5 MB are allowed"));
      }
      cb(null, true);
    }
  }).fields([
    { name: 'vehicleMainImg', maxCount: 1 },
    { name: 'insuranceImgs', maxCount: 2 },
    { name: 'vehicleImgs', maxCount: 5 }
  ]);



//add a vehicle - postman checked. working well.
exports.addVehicle = async(req, res) => {

    try {
        upload(req, res, async(err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error uploading images" });
            }
            
    
            const mainImage = req.files?.vehicleMainImg?.[0];
            if (!mainImage) return res.status(400).json({ message: "A main vehicle image is required" });
            const newVehicle = new Vehicle({
                ...req.body,
                userId: String(req.user),
                isAccepted: false,
                vehicleMainImg: mainImage.filename,
                insuranceImgs: (req.files.insuranceImgs || []).map(file => file.filename),
                vehicleImgs: (req.files.vehicleImgs || []).map(file => file.filename)
            })

            await newVehicle.save();
            res.status(200).json(newVehicle);
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({message : err.message});
    }
}



//get all vehicles - vehicle admin             //postman checked. working well.
exports.getAllVehicle = async(req, res) => {
    try{
        const vehicles = await Vehicle.find({ isAccepted: true }).limit(200);
        res.send(vehicles);
    }catch (err) {
        res.status(500).send(err.message);
    }
}


//get a specific vehicle by id - vehicle admin       postman checked. working well.
exports.getSpecificvehicle = async(req, res) => {
    const {id} = req.params;
    try{
        const specificVehicle = await Vehicle.findOne({ _id: id, isAccepted: true });     //without _id, it will not work ???
        res.send(specificVehicle);
    }catch(err){
        res.status(500).send(err.message);
    }
}



//delete a specific vehicle by id (Reject a vehicle from pending collection) - vehicle admin
exports.deleteVehicle = async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      if (String(vehicle.userId) !== String(req.user) && req.authUser?.isAdmin !== true) {
        return res.status(403).json({ message: "You can only delete your own vehicle listing" });
      }
      await vehicle.deleteOne();
      return res.status(200).json({ message: "Vehicle listing deleted" });
    } catch {
      return res.status(400).json({ message: "Unable to delete vehicle listing" });
    }
  };

//accept a vehicle by isAccepted change to true - vehicle admin
exports.acceptVehicle = async(req, res) => {
    const {id} = req.params;
    try{
        const vehicle = await Vehicle.findById(id);
        if(!vehicle){
            res.status(404).send("Vehicle not found");
        }

        const accept = await Vehicle.findByIdAndUpdate(id, {isAccepted: true}, {new: true});
        res.send(accept);

        // Return success message
        return "Vehicle accepted successfully!";

  }catch(err){
      res.status(500).send(err.message);
  }
}


//retrieve all my vehicle details - vehicle owner
exports.getMyVehicles = async(req, res) => {
    const { userId } = req.params;
    try{
        if (String(req.user) !== String(userId) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You can only view your own vehicles" });
        }
        const myVehicles = await Vehicle.find({ userId: String(req.user) });
        return res.status(200).json(myVehicles);
    } catch (err) {
        res.status(500).json({ message: "Unable to retrieve vehicles" });
    }
}


//edit a specific vehicle details - vehicle owner 
exports.updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { price, description, location } = req.body || {};
  const update = {};
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    update.price = numericPrice;
  }
  if (description !== undefined) update.description = String(description).slice(0, 3000);
  if (location !== undefined && String(location).trim()) update.location = String(location).trim().slice(0, 180);
  if (req.body.currency !== undefined) {
    const currency = String(req.body.currency).toUpperCase();
    if (!["USD","EUR","GBP","INR","LKR","AUD","CAD","NZD","JPY","CNY","SGD","ZAR","CHF","AED","BRL","MXN","KRW","THB","MYR","IDR","PHP","TRY","SAR","NGN","PKR"].includes(currency)) return res.status(400).json({ message: "Unsupported listing currency" });
    update.currency = currency;
  }
  update.isAccepted = false;
  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (String(vehicle.userId) !== String(req.user) && req.authUser?.isAdmin !== true) {
      return res.status(403).json({ message: "You can only edit your own vehicle listing" });
    }
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    return res.status(200).json(updatedVehicle);
  } catch (err) {
    return res.status(500).json({ message: "Unable to update vehicle" });
  }
};

exports.availableVehicles = async (req, res) => {

  try{
      const availablevehicles = await Vehicle.aggregate([
          {
              $lookup: {
                  from: "reservations",
                  localField: "_id",
                  foreignField: "vehicleId",
                  as: "reservations"
              }
          },
          {
              $match: {
                  $and: [
                      { "reservations.pickupDate": { $lt: new Date(req.body.pickupDate) } },
                      { "reservations.returnDate": { $lt: new Date(req.body.pickupDate) } },
                      { "reservations.pickupDate": { $gt: new Date(req.body.returnDate) } },
                      { "reservations.returnDate": { $gt: new Date(req.body.returnDate) } },
                      { "location": req.body.location },
                      { "vehicleType": req.body.vehicleType }
                  ]
              }
          }
      ]);

      res.send(availablevehicles);
  }catch(err){
      res.status(500).send(err.message);

    }

}


//retrieve vehicles by vehicle type and location - vehicle owner
exports.getVehiclesByTypeAndLocation = async(req, res) => {
    const { vehicleType, location } = req.params;
    try{
        const safeLocation = String(location).replace(/[.*+?^${}()|[\]\\]/g, "\\const vehicles = await Vehicle.find({vehicleType: vehicleType, location: location});");
        const vehicles = await Vehicle.find({ vehicleType, location: { $regex: safeLocation, $options: "i" }, isAccepted: true }).limit(100);
        if(!vehicles){
            res.status(404).send("No vehicles found");
        }
        res.send(vehicles);
    }catch(err){
        res.status(500).send(err.message);
    }
}


//retrieve vehicles by vehicle type
exports.getVehicleByType = async (req, res) => {
    const {vehicleType} = req.params;
    try{
        const vehicles = await Vehicle.find({ vehicleType, isAccepted: true }).limit(200);
        if(!vehicles){
            res.status(404).send("No vehicles found");
        }
        res.send(vehicles);
    }catch(err){
        res.status(500).send(err.message);
    }
}

//retrieve vehicles by location
exports.getVehicleByLocation = async (req, res) => {
    const {location} = req.params;
    try{
        const safeLocation = String(location).replace(/[.*+?^${}()|[\]\\]/g, "\\const vehicles = await Vehicle.find({location: location});");
        const vehicles = await Vehicle.find({ location: { $regex: safeLocation, $options: "i" }, isAccepted: true }).limit(100);
        if(!vehicles){
            res.status(404).send("No vehicles found");
        }
        res.send(vehicles);
    }catch(err){
        res.status(500).send(err.message);
    }
}






