const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  bio: { type: String, default: '' },
  skillsOffered: [{ type: String, trim: true }],
  skillsWanted:  [{ type: String, trim: true }],
  assignedGroup: { type: String, enum: ['A','B'], default: 'A' },
  simpleScore:   { type: Number, default: 0 },
  weightedScore: { type: Number, default: 0 },
  totalExchanges:     { type: Number, default: 0 },
  completedExchanges: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
