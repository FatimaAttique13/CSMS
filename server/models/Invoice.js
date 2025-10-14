const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  orderItemRef: { type: mongoose.Schema.Types.ObjectId }, // optional pointer to order item
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['Draft','Sent','Partially Paid','Paid','Overdue','Cancelled'],
    default: 'Draft',
    index: true
  },
  items: { type: [invoiceItemSchema], validate: v => v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'SAR' },
  amountPaid: { type: Number, default: 0, min: 0 },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  notes: String,
  timeline: [{
    status: String,
    at: { type: Date, default: Date.now },
    note: String
  }],
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

invoiceSchema.virtual('balance').get(function(){
  return +(this.total - this.amountPaid).toFixed(2);
});

invoiceSchema.pre('validate', function(next){
  if (this.items && this.items.length) {
    this.subtotal = this.items.reduce((s,i)=> s + i.lineTotal, 0);
    if (this.tax == null) this.tax = +(this.subtotal * 0.15).toFixed(2);
    this.total = +(this.subtotal + this.tax).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
