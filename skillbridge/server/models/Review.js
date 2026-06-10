const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  exchange:  { type: mongoose.Schema.Types.ObjectId, ref: 'Exchange', required: true },
  reviewer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, default: '' },
  helpfulVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
