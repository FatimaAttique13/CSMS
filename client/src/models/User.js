const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Handles authentication and authorization for customers and admins.
 */
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin'], 
    default: 'customer',
    index: true
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true }
  },
  addresses: [{
    label: { type: String, default: 'Default' }, // e.g., "Office", "Site A"
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    notes: String,
    isDefault: { type: Boolean, default: false }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Stripe integration
  stripeCustomerId: { 
    type: String, 
    sparse: true, 
    index: true 
  },
  lastLogin: { type: Date },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.email;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
