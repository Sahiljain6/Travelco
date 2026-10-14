const mongoose=require('mongoose')

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
        reqiured:true
    },
    zip:{
        type:String,
        reqiured:true
    },
    address:{
        type:String, 
        reqiured:true
    }, 
    distance:{
        type:String, 
        reqiured:true
    },
    contactName:{
        type:String,
        reqiured:true
    },
    contactNo:{
        type:String,
        reqiured:true
    },
    numberOfRoomTypes:{
        type:Number, 
        reqiured:true 
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
        reqiured:true
    }, 
    cheapestPrice:{ 
        type:Number,
        reqiured:true 
    },
    rating:{
        type:Number, 
        min:0,
        max:5
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