const mongoose = require('mongoose');

/**
 * InventoryTransaction
 * Records adjustments to product stock for auditing and analytics.
 */
const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { type: String, enum: ['INBOUND','OUTBOUND','ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  beforeQuantity: { type: Number, required: true },
  afterQuantity: { type: Number, required: true },
  reason: { type: String },
  reference: { type: String }, // e.g., orderNumber, invoiceNumber
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
