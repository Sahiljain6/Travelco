const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SalarySchema = new Schema({
    Name :{
        type: String
    },
    Eid :{
        type:String
    },
    Nic :{
        type : String
    },
    JobPosition: {
        type : String 
    },
    Numberaofdates:{
        type:Number,
        min:1,
        validate:{ validator:Number.isInteger, message:"Working days must be a positive whole number" }
    },

    OtHours:{
        type:Number,
        min:0,
        validate:{ validator:Number.isInteger, message:"Overtime hours must be a non-negative whole number" }
    },
    BasicSalary:{
        type:Number,
        min:[0.01, "Basic salary must be greater than zero"]
    },
    NetSalary:{
        type:Number,
        min:0
    }

})

module.exports = mongoose.model('Salary',SalarySchema)