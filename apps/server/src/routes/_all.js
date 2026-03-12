// ==================== CATEGORIES ROUTER ====================
const express = require('express');
const categoriesRouter = express.Router();
const { Category } = require('../models/index');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

categoriesRouter.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort('sortOrder name')
    .lean();
  res.json({ success: true, data: categories });
}));

categoriesRouter.get('/tree', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null }).lean();
  const withChildren = await Promise.all(categories.map(async (cat) => {
    const children = await Category.find({ parent: cat._id, isActive: true }).lean();
    return { ...cat, children };
  }));
  res.json({ success: true, data: withChildren });
}));

categoriesRouter.get('/:idOrSlug', asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let category = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? await Category.findById(idOrSlug)
    : await Category.findOne({ slug: idOrSlug });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

categoriesRouter.post('/', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
}));

categoriesRouter.put('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

categoriesRouter.delete('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category deleted' });
}));

// ==================== ORDERS ROUTER ====================
const ordersRouter = express.Router();
const { Order, Cart } = require('../models/index');
const Product = require('../models/Product');

ordersRouter.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }
  
  // Validate and price items from DB
  const orderItems = [];
  let itemsPrice = 0;
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${item.product} not available` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }
    
    const orderItem = {
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      price: product.price,
      quantity: item.quantity,
      variant: item.variant,
    };
    orderItems.push(orderItem);
    itemsPrice += product.price * item.quantity;
    
    // Decrement stock
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity, salesCount: item.quantity } });
  }
  
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    couponCode,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user._id }],
  });
  
  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, discountAmount: 0 });
  
  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
  res.status(201).json({ success: true, message: 'Order placed successfully', data: populatedOrder });
}));

ordersRouter.get('/my-orders', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);
  
  res.json({ success: true, data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
}));

ordersRouter.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images slug');
  
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  if (order.user._id.toString() !== req.user._id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  
  res.json({ success: true, data: order });
}));

// Admin: Get all orders
ordersRouter.get('/', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
  const query = {};
  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) query.orderNumber = new RegExp(search, 'i');
  
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email').sort('-createdAt').skip(skip).limit(parseInt(limit)),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, data: orders, pagination: { page: parseInt(page), total } });
}));

// Admin: Update order status
ordersRouter.put('/:id/status', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const { orderStatus, note, trackingNumber, paymentStatus } = req.body;
  
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note, updatedBy: req.user._id });
    if (orderStatus === 'delivered') order.deliveredAt = new Date();
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  
  await order.save();
  res.json({ success: true, message: 'Order updated', data: order });
}));

// ==================== CART ROUTER ====================
const cartRouter = express.Router();

cartRouter.get('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock slug isActive');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  
  // Filter out unavailable products
  cart.items = cart.items.filter(item => item.product && item.product.isActive);
  
  res.json({ success: true, data: cart });
}));

cartRouter.post('/add', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;
  
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock' });
  }
  
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  
  const existingItem = cart.items.find(item => 
    item.product.toString() === productId && 
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  
  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
  } else {
    cart.items.push({ product: productId, quantity, price: product.price, variant });
  }
  
  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');
  
  res.json({ success: true, message: 'Added to cart', data: cart });
}));

cartRouter.put('/item/:itemId', protect, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  } else {
    item.quantity = quantity;
  }
  
  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');
  res.json({ success: true, data: cart });
}));

cartRouter.delete('/item/:itemId', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, message: 'Item removed', data: cart });
}));

cartRouter.delete('/clear', protect, asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, discountAmount: 0 });
  res.json({ success: true, message: 'Cart cleared' });
}));

// ==================== REVIEWS ROUTER ====================
const reviewsRouter = express.Router();
const { Review } = require('../models/index');

reviewsRouter.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  
  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  
  res.json({ success: true, data: reviews, pagination: { page: parseInt(page), total }, distribution });
}));

reviewsRouter.post('/', protect, asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images } = req.body;
  
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  }
  
  const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment, images });
  await review.populate('user', 'name avatar');
  
  res.status(201).json({ success: true, message: 'Review submitted', data: review });
}));

reviewsRouter.put('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  
  Object.assign(review, req.body);
  await review.save();
  res.json({ success: true, message: 'Review updated', data: review });
}));

reviewsRouter.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  
  if (review.user.toString() !== req.user._id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

// ==================== USERS ROUTER ====================
const usersRouter = express.Router();
const User = require('../models/User');

usersRouter.get('/', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (role) query.role = role;
  
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, data: users, pagination: { page: parseInt(page), total } });
}));

usersRouter.get('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

usersRouter.put('/:id', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

usersRouter.delete('/:id', protect, authorize('superadmin'), asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated' });
}));

// ==================== DASHBOARD ROUTER ====================
const dashboardRouter = express.Router();

dashboardRouter.get('/stats', protect, authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const [
    totalRevenue, monthRevenue, lastMonthRevenue,
    totalOrders, monthOrders,
    totalUsers, monthUsers,
    totalProducts, lowStockProducts,
    recentOrders, topProducts,
    ordersByStatus, revenueByMonth,
  ] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lte: 10 } }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find({ isActive: true }).sort('-salesCount').limit(5).select('name price salesCount images'),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);
  
  const currRevenue = monthRevenue[0]?.total || 0;
  const prevRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = prevRevenue > 0 ? ((currRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
  
  res.json({
    success: true,
    data: {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: currRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        totalOrders,
        monthOrders,
        totalUsers,
        monthUsers,
        totalProducts,
        lowStockProducts,
      },
      recentOrders,
      topProducts,
      ordersByStatus,
      revenueByMonth,
    },
  });
}));

// ==================== PAYMENTS ROUTER ====================
const paymentsRouter = express.Router();
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {}

paymentsRouter.post('/create-intent', protect, asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Payment service unavailable' });
  const { amount, currency = 'usd', orderId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { orderId, userId: req.user._id.toString() },
  });
  
  res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
}));

paymentsRouter.post('/webhook', asyncHandler(async (req, res) => {
  if (!stripe) return res.json({ received: true });
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const { orderId } = event.data.object.metadata;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        paymentIntent: event.data.object.id,
        $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Stripe' } },
      });
    }
  }
  
  res.json({ received: true });
}));

// ==================== UPLOADS ROUTER ====================
const uploadsRouter = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

uploadsRouter.post('/', protect, authorize('admin', 'superadmin'), upload.array('images', 10), asyncHandler(async (req, res) => {
  const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
  const urls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
  res.json({ success: true, urls });
}));

module.exports = {
  categoriesRouter,
  ordersRouter,
  cartRouter,
  reviewsRouter,
  usersRouter,
  dashboardRouter,
  paymentsRouter,
  uploadsRouter,
};
