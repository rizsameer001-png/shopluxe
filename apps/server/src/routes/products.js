const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
//const { addImageField } = require('../helper'); // adjust path if helper.js is elsewhere
const { protect, authorize, asyncHandler, optionalAuth } = require('../middleware/auth');

// @GET /api/products - Get all products with advanced filtering
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    keyword, category, brand, minPrice, maxPrice, rating,
    page = 1, limit = 12, sort = '-createdAt',
    isFeatured, tags, inStock,
  } = req.query;
  
  const query = { isActive: true };
  
  // Full-text search
  if (keyword) {
    query.$text = { $search: keyword };
  }
  
  // Filters
  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (isFeatured === 'true') query.isFeatured = true;
  if (tags) query.tags = { $in: tags.split(',') };
  if (inStock === 'true') query.stock = { $gt: 0 };
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  if (rating) query.rating = { $gte: Number(rating) };
  
  // Sort options
  const sortOptions = {
    '-createdAt': { createdAt: -1 },
    'price_asc': { price: 1 },
    'price_desc': { price: -1 },
    'rating': { rating: -1 },
    'popular': { salesCount: -1 },
    'name_asc': { name: 1 },
  };
  
  const sortQuery = sortOptions[sort] || { createdAt: -1 };
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  });

//   const formattedProducts = products.map(addImageField);

// res.json({
//   success: true,
//   data: formattedProducts,
//   pagination: {
//     page: pageNum,
//     limit: limitNum,
//     total,
//     pages: Math.ceil(total / limitNum),
//     hasNext: pageNum < Math.ceil(total / limitNum),
//     hasPrev: pageNum > 1,
//   },
// });
}));

// @GET /api/products/featured
router.get('/featured', asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(12)
    .lean();
  res.json({ success: true, data: products });
}));

// @GET /api/products/new-arrivals
router.get('/new-arrivals', asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(12)
    .lean();
  res.json({ success: true, data: products });
}));

// @GET /api/products/best-sellers
router.get('/best-sellers', asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort('-salesCount')
    .limit(12)
    .lean();
  res.json({ success: true, data: products });
}));

// @GET /api/products/brands - Get all unique brands
router.get('/brands', asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: null } });
  res.json({ success: true, data: brands.filter(Boolean).sort() });
}));

// @GET /api/products/:id or :slug
router.get('/:idOrSlug', optionalAuth, asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  
  let product;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idOrSlug).populate('category', 'name slug').populate('vendor', 'name');
  } else {
    product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug').populate('vendor', 'name');
  }
  
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
  
  // Related products
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8).select('name price images slug rating numReviews').lean();
  
  res.json({ success: true, data: product, related });
}));

// ==================== ADMIN ROUTES ====================

// @POST /api/products
router.post('/', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, vendor: req.user._id });
  res.status(201).json({ success: true, message: 'Product created', data: product });
}));

// @PUT /api/products/:id
router.put('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product updated', data: product });
}));

// @DELETE /api/products/:id
router.delete('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
}));

// @PUT /api/products/:id/stock
router.put('/:id/stock', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Stock updated', data: product });
}));

module.exports = router;
