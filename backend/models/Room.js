const mongoose=require('mongoose')

const RoomSchema=new mongoose.Schema({
    title:{
        type:String,  
        required:true
    },    
    price:{ 
        type:Number,
        required:true,
        min:[0.01, "Room price must be greater than zero"] 
    },  
    description:{
        type:String,  
        required:true
    },
    maxPeople:{    
        type:Number,
        required:true,
        min:1,
        validate:{ validator:Number.isInteger, message:"Maximum people must be a whole number" }
    },
    roomNumbers: [{
      number: { type:Number, required:true, min:1, validate:{ validator:Number.isInteger, message:"Room number must be a positive whole number" } },
      unavailableDates: { type: [Date] }
    }],
    
}) 
module.exports =  mongoose.model("Room",RoomSchema)   