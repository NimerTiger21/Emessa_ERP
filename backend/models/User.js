const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@emessadenim\.com$/, 'Please use a company email']
  },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['admin', 'quality_manager', 'production_manager', 'wash_supervisor', 'operator'],
    default: 'operator'
  },
  department: {
    type: String,
    enum: ['production', 'sewing', 'washing', 'finishing', 'quality', 'admin'],
    required: true
  },
  lastLogin: Date,
  active: { type: Boolean, default: true },
  avatar: String,

  // ... existing fields ...
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Filter sensitive data when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', UserSchema);