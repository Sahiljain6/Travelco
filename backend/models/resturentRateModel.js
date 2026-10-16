const mongoose = require('mongoose');
const { Schema } = mongoose;

const resturentRateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resturent: { type: Schema.Types.ObjectId, ref: 'Resturent', required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, required: true },
  rate: { type: Number, required: true, min: [1, "Rating must be at least 1"], max: [5, "Rating cannot exceed 5"] },
  status: { type: String, enum: ['VALID', 'INVALID'], default: 'VALID' },
});

const ResturentRate = mongoose.model('ResturentRate', resturentRateSchema);

module.exports = ResturentRate;
