const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillWanted:  { type: String, required: true },
  skillOffered: { type: String, required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending','accepted','active','completed','declined'],
    default: 'pending'
  },
  createdAt:   { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Exchange', ExchangeSchema);
