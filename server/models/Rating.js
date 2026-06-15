const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
  {
    exchange:  { type: mongoose.Schema.Types.ObjectId, ref: 'Exchange', required: true },
    reviewer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    reviewee:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },

    // Used in weighted calculation
    helpfulVotes:    { type: Number, default: 0 },
    reviewerTrust:   { type: Number, default: 50 }, // snapshot of reviewer's trust score at time of review
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', RatingSchema);
