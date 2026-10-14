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
        const vehicles = await Vehicle.find();
        res.send(vehicles);
    }catch (err) {
        res.status(500).send(err.message);
    }
}


//get a specific vehicle by id - vehicle admin       postman checked. working well.
exports.getSpecificvehicle = async(req, res) => {
    const {id} = req.params;
    try{
        const specificVehicle = await Vehicle.findById({_id: id});     //without _id, it will not work ???
        res.send(specificVehicle);
    }catch(err){
        res.status(500).send(err.message);
    }
}



//delete a specific vehicle by id (Reject a vehicle from pending collection) - vehicle admin
exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
      const vehicle = await Vehicle.findByIdAndDelete(id);
      if (!vehicle) {
        res.status(404).send('Vehicle not found');
      } else {
        res.send(vehicle);
      }
    } catch (err) {
      res.status(500).send(err.message);
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
  const  update = { price, description, location } = req.body;
  update.isAccepted = false; 

  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, update, { new: true });    //may be wrong
    
    if (!updatedVehicle) {
      res.status(404).send('Vehicle not found');
    }

    res.send(updatedVehicle);
  } catch (err) {
    res.status(500).send(err.message);
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
        const vehicles = await Vehicle.find({vehicleType: vehicleType, location: location});
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
        const vehicles = await Vehicle.find({vehicleType: vehicleType});
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
        const vehicles = await Vehicle.find({location: location});
        if(!vehicles){
            res.status(404).send("No vehicles found");
        }
        res.send(vehicles);
    }catch(err){
        res.status(500).send(err.message);
    }
}






