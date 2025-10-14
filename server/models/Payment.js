const mongoose = require('mongoose');

/**
 * Payment Schema
 * Tracks Stripe payment transactions for orders and invoices.
 */
const paymentSchema = new mongoose.Schema({
  // Stripe identifiers
  stripePaymentIntentId: { type: String, unique: true, sparse: true, index: true },
  stripeChargeId: { type: String, index: true },
  stripeCustomerId: { type: String, index: true },
  stripeSessionId: { type: String, unique: true, sparse: true },
  
  // Payment details
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'SAR', uppercase: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },
  
  // Related documents
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Payment method info
  paymentMethod: {
    type: { type: String }, // card, bank_transfer, etc.
    last4: String,
    brand: String, // visa, mastercard, etc.
    expiryMonth: Number,
    expiryYear: Number
  },
  
  // Refund information
  refundAmount: { type: Number, default: 0, min: 0 },
  refundReason: String,
  refundedAt: Date,
  
  // Webhook tracking
  webhookEvents: [{
    eventId: String,
    eventType: String,
    receivedAt: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Transaction metadata
  description: String,
  receiptEmail: String,
  receiptUrl: String,
  
  // Status timestamps
  succeededAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  
  // Error tracking
  errorCode: String,
  errorMessage: String,
  
  // Additional data
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Index for finding payments by date range
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ succeededAt: -1 });

// Virtual for refund balance
paymentSchema.virtual('refundBalance').get(function() {
  return +(this.amount - this.refundAmount).toFixed(2);
});

// Method to check if payment is completed
paymentSchema.methods.isCompleted = function() {
  return this.status === 'succeeded';
};

// Method to check if payment is refundable
paymentSchema.methods.isRefundable = function() {
  return this.status === 'succeeded' && this.refundAmount < this.amount;
};

paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
