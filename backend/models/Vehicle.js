const {mongoose, Schema} = require("mongoose");


const vehicleSchema = new Schema({

  ownerName: {type: String, required : true}, 
  brand: {type: String, required : true},
  model: {type: String, required : true},
  vehicleType : {type : String, required : true},
  userId : {type : String, },
  vehicleNumber : {type: String, required : true},
  capacity : { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: "Capacity must be a positive whole number" } },
  transmissionType : {type: String, required : true},
  fuelType : {type: String, required : true},
  price : { type: Number, required: true, min: [0.01, "Price must be greater than zero"] },
  currency: { type: String, enum: ["USD","EUR","GBP","INR","LKR","AUD","CAD","NZD","JPY","CNY","SGD","ZAR","CHF","AED","BRL","MXN","KRW","THB","MYR","IDR","PHP","TRY","SAR","NGN","PKR"], default: "USD" },
  description : {type: String, required : true},
  insuranceImgs: [{ type: String, required : true }],
  vehicleMainImg: {type : String, required : true},
  vehicleImgs: [{ type: String, required : true }],
  location : {type: String, required : true},
  isAccepted : {type: Boolean, required : true, default : false},
  
});


module.exports = mongoose.model('Vehicle', vehicleSchema);
