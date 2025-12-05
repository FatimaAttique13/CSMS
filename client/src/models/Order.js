const mongoose = require('mongoose');

/**
 * Order Schema
 * Captures a snapshot of items at purchase time (price & product name copied for audit).
 */
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // snapshot
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { 
    type: String,
    enum: ['Pending','Confirmed','Out for Delivery','Delivered','Cancelled'],
    default: 'Pending',
    index: true
  },
  items: { type: [orderItemSchema], validate: v => v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'SAR' },
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    notes: String
  },
  deliveryETA: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  timeline: [{
    status: String,
    at: { type: Date, default: Date.now },
    note: String
  }],
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
    default: 'unpaid',
    index: true
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

orderSchema.pre('validate', function(next){
  if (this.items && this.items.length) {
    this.subtotal = this.items.reduce((s,i)=> s + i.lineTotal, 0);
    if (this.tax == null) this.tax = +(this.subtotal * 0.15).toFixed(2);
    this.total = +(this.subtotal + this.tax).toFixed(2);
  }
  next();
});

// Prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
