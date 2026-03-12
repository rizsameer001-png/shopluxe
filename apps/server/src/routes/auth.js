const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, asyncHandler, sendTokenResponse, AppError } = require('../middleware/auth');

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// @POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], handleValidation, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res, 'Registration successful');
}));

// @POST /api/auth/login
router.post('/login', [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], handleValidation, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +isActive');
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  if (user.isLocked()) {
    return res.status(423).json({ success: false, message: 'Account temporarily locked. Please try again later.' });
  }
  
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account has been deactivated' });
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  // Reset login attempts on successful login
  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 }
  });
  
  sendTokenResponse(user, 200, res, 'Login successful');
}));

// @POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    sendTokenResponse(user, 200, res, 'Token refreshed');
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}));

// @GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images slug');
  res.json({ success: true, user });
}));

// @PUT /api/auth/update-profile
router.put('/update-profile', protect, [
  body('name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('phone').optional().trim(),
], handleValidation, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;
  
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated', user });
}));

// @PUT /api/auth/change-password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], handleValidation, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  
  user.password = newPassword;
  await user.save();
  
  sendTokenResponse(user, 200, res, 'Password changed successfully');
}));

// @POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
], handleValidation, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    // Don't reveal if email exists
    return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });
  
  // In production, send email here
  console.log(`Password reset token for ${user.email}: ${resetToken}`);
  
  res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
}));

// @POST /api/auth/reset-password/:token
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], handleValidation, asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');
  
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
  
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  sendTokenResponse(user, 200, res, 'Password reset successful');
}));

// @POST /api/auth/wishlist/:productId
router.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  
  const inWishlist = user.wishlist.includes(productId);
  
  if (inWishlist) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
  } else {
    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
  }
}));

// @POST /api/auth/addresses
router.post('/addresses', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (req.body.isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }
  
  user.addresses.push(req.body);
  await user.save();
  
  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
}));

// @PUT /api/auth/addresses/:addressId
router.put('/addresses/:addressId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }
  
  if (req.body.isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }
  
  Object.assign(address, req.body);
  await user.save();
  
  res.json({ success: true, message: 'Address updated', addresses: user.addresses });
}));

// @DELETE /api/auth/addresses/:addressId
router.delete('/addresses/:addressId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
}));

module.exports = router;
