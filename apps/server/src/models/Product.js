const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Color", "Size"
  value: { type: String, required: true }, // e.g. "Red", "XL"
  price: { type: Number }, // override price
  stock: { type: Number, default: 0 },
  sku: { type: String },
  image: { type: String },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [200, 'Name cannot exceed 200 characters'] },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: [500, 'Short description cannot exceed 500 characters'] },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  comparePrice: { type: Number }, // Original price for discount display
  costPrice: { type: Number }, // Internal cost
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
  brand: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  }],
  variants: [variantSchema],
  stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String, sparse: true },
  weight: { type: Number }, // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDigital: { type: Boolean, default: false },
  requiresShipping: { type: Boolean, default: true },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Virtual: discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
