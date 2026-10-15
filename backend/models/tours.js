const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addTourForm = new Schema({
  currentUser: {
    type: String,
    required: [true, "Must be login first"],
  },
  img: {
    type: String,
    required: [true, "must provide a photo"],
  },
  name: {
    type: String,
    required: [true, "must provide a name "],
  },
  category: {
    type: String,
    required: [true, "must provide a category "],
  },
  price: {
    type: Number,
    required: [true, "must provide a price"],
  },
  currency: {
    type: String,
    enum: ["USD","EUR","GBP","INR","LKR","AUD","CAD","NZD","JPY","CNY","SGD","ZAR","CHF","AED","BRL","MXN","KRW","THB","MYR","IDR","PHP","TRY","SAR","NGN","PKR"],
    default: "USD",
  },
  groupCount: {
    type: Number,
    required: [true, "must provide a Group Count"],
  },
  languages: {
    type: String,
    required: [true, "must provide Languages"],
  },
  duration: {
    type: String,
    required: [true, "must provide a duration"],
  },
  cities: {
    type: String,
    required: [true, "must provide a cities"],
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "",
    index: true,
  },
  description: {
    type: String,
    required: [true, "must provide a description"],
  },
  introduction: {
    type: String,
    required: [true, "must provide a Introduction"],
  },
});

const tourDetails = mongoose.model("Tour Details", addTourForm);
module.exports = tourDetails;
