const mongoose = require('mongoose');

/**
 * Product Schema
 * Represents a construction supply product available for ordering.
 * If inventory tracking is enabled, maintain stock fields; otherwise omit.
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true, enum: ['cement','aggregate','sand','other'], index: true },
  description: { type: String, default: '' },
  unit: { type: String, required: true, enum: ['bags','tons','kg','m3','units'] },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0.15, min: 0, max: 1 },
  // Inventory
  stockQuantity: { type: Number, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

// Prevent OverwriteModelError during dev/hot reload
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
