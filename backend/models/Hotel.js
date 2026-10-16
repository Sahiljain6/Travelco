const mongoose=require('mongoose');
const { isValidInternationalPhone, isValidPostalCode } = require("../utils/validation");

const HotelSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true 
    },
    type:{  
        type:String
         
    },
    city:{ type:String, required:true, trim:true, index:true },
    country:{ type:String, default:"", trim:true, index:true },
    currency:{ type:String, default:"USD", enum:["USD","EUR","GBP","INR","LKR","AUD","CAD","NZD","JPY","CNY","SGD","ZAR","CHF","AED","BRL","MXN","KRW","THB","MYR","IDR","PHP","TRY","SAR","NGN","PKR"] },
    province:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        required:true,
        trim:true,
        validate:{ validator:isValidPostalCode, message:"Enter a valid postal/ZIP code (2–12 characters; not all zeroes)" }
    },
    address:{
        type:String, 
        required:true
    }, 
    distance:{
        type:String, 
        required:true
    },
    contactName:{
        type:String,
        required:true
    },
    contactNo:{
        type:String,
        required:true,
        trim:true,
        validate:{ validator:isValidInternationalPhone, message:"Enter a valid international phone number (7–15 digits; not all zeroes)" }
    },
    numberOfRoomTypes:{
        type:Number,
        required:true,
        min:1,
        validate:{ validator:Number.isInteger, message:"Number of room types must be a whole number" }
    },
    HotelImg:{
        type:String}
    , 
    HotelImgs:{ 
        type: [String], 
    },  
    certificates:{ 
        type: [String],
    },
    description:{ 
        type:String,
        required:true
    }, 
    cheapestPrice:{
        type:Number,
        required:true,
        min:[0.01, "Price must be greater than zero"]
    },
    rating:{
        type:Number,
        min:[1, "Rating must be at least one"],
        max:[5, "Rating cannot exceed five"]
    },
    rooms:{
        type: [String],
    },
    sustainability:{
        type: Boolean,
        default: false,
    },
    availableWork:{
        type: Boolean,
        default: false,
    },
    featured:{
        type: Boolean,
        default: true,
    },
    isApproved:{ // for accomodation admin
        type: Boolean,
        default: true,
    }
   
},{timestamps :true}) 

module.exports =  mongoose.model("Hotel",HotelSchema)    