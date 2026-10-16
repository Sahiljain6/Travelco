const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const FinanceHSchema = new Schema({
    RecordId :{
        type: String
    },
    Section :{
        type:String
    },
    Income:{
        type: Number,
        min: 0
    },
    Expences: {
        type: Number,
        min: 0
    },
    Month:{
        type:String
    },

    
})

module.exports = mongoose.model('FinanceH',FinanceHSchema)