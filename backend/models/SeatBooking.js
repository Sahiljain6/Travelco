const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isValidInternationalPhone } = require("../utils/validation");

const SeatBookingSchema =  new Schema({
    userId : {type:String },
    trainId : {type:String },
    trainName : {type:String },
    price : {type:String },
    priceStatus : {type:Boolean},
    noOfTickets : { type:Number, required:true, min:1, validate:{ validator:Number.isInteger, message:"Ticket count must be a positive whole number" } },
    firstName : {type:String },
    LastName : {type:String },
    nationality : {type:String },
    IdCardNumber : {type:String },
    phoneNumber : { type:String, trim:true, required:true, validate:{ validator:isValidInternationalPhone, message:"Enter a valid international phone number with 7–15 digits; it cannot be all zeroes" } },
    email : {type:String },
    isApproved :{type : Boolean,default:true}
})

module.exports = mongoose.model('SeatBookingTrain',SeatBookingSchema);



