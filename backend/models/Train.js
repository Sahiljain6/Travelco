const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainSchema =  new Schema({
    trainName : { type : String},
    from : {type : String},
    to : {type : String },
    arrivalTime : { type : String},
    depatureTime : {type : String},
    date : {type : String},
    price : { type: Number, required: true, min: [0.01, "Fare must be greater than zero"] },
    noOfSeats : { type: Number, required: true, min: 1, validate: { validator: (value) => Number.isInteger(value), message: "Number of seats must be a positive whole number" } },
    description : {type: String,},    
    trainMainImg :{type:String},
    MaxBagage : { type: Number, min: 0 },
    classType: { type : String},
    cancelCharges : { type: Number, min: 0 }
})

module.exports = mongoose.model('trainSchedule',trainSchema);


