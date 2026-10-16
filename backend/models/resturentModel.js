const mongoose = require('mongoose');
const { Schema } = mongoose;
const { isValidInternationalPhone } = require('../utils/validation');

const resturentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  district: { type: Schema.Types.ObjectId, ref: 'ResturentDistrict', required: true },
  address: { type: String, required: true },
  pricePerHour: { type: Number, min: [0.01, "Price must be greater than zero"], required: true },
  tableCount: { type: Number, min: 1, validate: { validator: Number.isInteger, message: "Table count must be a positive whole number" }, required: true },
  chefQualification: { type: String, required: true },
  resturentImages: { type: [String], required: true },
  registrationImages: { type: [String], required: true },
  returentType: { type: Schema.Types.ObjectId, ref: 'ResturentType', required: true },
  staffAmount: { type: Number, min: 1, validate: { validator: Number.isInteger, message: "Staff amount must be a positive whole number" }, required: true },
  mobileNo: { type: String, required: true, trim: true, validate: { validator: isValidInternationalPhone, message: "Enter a valid international contact number with 7–15 digits; it cannot be all zeroes" } },
  registrationNo: { type: String, required: true },
  status: { type: String, enum: ['APPROVED', 'DECLINED', 'PENDING'], default: 'PENDING' },
});

const Resturent = mongoose.model('Resturent', resturentSchema);

module.exports = Resturent;
