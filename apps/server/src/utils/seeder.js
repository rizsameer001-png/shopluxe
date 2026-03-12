require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { Category } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
  console.log('✅ MongoDB connected');
};

const categories = [
  { name: 'Electronics', description: 'Latest gadgets and electronics', icon: '💻' },
  { name: 'Clothing', description: 'Fashion and apparel', icon: '👕' },
  { name: 'Home & Garden', description: 'Home decor and garden supplies', icon: '🏠' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', icon: '⚽' },
  { name: 'Books', description: 'Books, magazines and media', icon: '📚' },
  { name: 'Beauty & Health', description: 'Beauty and health products', icon: '💄' },
  { name: 'Toys & Games', description: 'Toys and games for all ages', icon: '🎮' },
  { name: 'Food & Grocery', description: 'Fresh food and grocery items', icon: '🛒' },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');
    
    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    // Create users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);
    
    const users = await User.insertMany([
      { name: 'Super Admin', email: 'admin@ecommerce.com', password: adminPassword, role: 'superadmin', isEmailVerified: true },
      { name: 'Admin User', email: 'manager@ecommerce.com', password: adminPassword, role: 'admin', isEmailVerified: true },
      { name: 'John Doe', email: 'john@example.com', password: userPassword, role: 'user', isEmailVerified: true },
      { name: 'Jane Smith', email: 'jane@example.com', password: userPassword, role: 'user', isEmailVerified: true },
    ]);
    console.log(`✅ Created ${users.length} users`);
    
    // Create products
    const electronicsId = createdCategories.find(c => c.name === 'Electronics')._id;
    const clothingId = createdCategories.find(c => c.name === 'Clothing')._id;
    const homId = createdCategories.find(c => c.name === 'Home & Garden')._id;
    const sportsId = createdCategories.find(c => c.name === 'Sports & Outdoors')._id;
    
    const products = [
      {
        name: 'iPhone 15 Pro Max', price: 1199, comparePrice: 1299, category: electronicsId,
        brand: 'Apple', description: 'The most powerful iPhone ever with titanium design and A17 Pro chip.',
        shortDescription: 'Pro camera system, titanium design, A17 Pro chip.',
        stock: 50, isFeatured: true, rating: 4.8, numReviews: 1234,
        images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', alt: 'iPhone 15 Pro Max', isPrimary: true }],
        tags: ['smartphone', 'apple', 'ios', '5g'],
      },
      {
        name: 'MacBook Pro 14"', price: 1999, comparePrice: 2199, category: electronicsId,
        brand: 'Apple', description: 'Supercharged by M3 Pro chip, MacBook Pro delivers exceptional performance.',
        shortDescription: 'M3 Pro chip, 18-hour battery, Liquid Retina XDR display.',
        stock: 30, isFeatured: true, rating: 4.9, numReviews: 567,
        images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', alt: 'MacBook Pro', isPrimary: true }],
        tags: ['laptop', 'apple', 'macbook', 'm3'],
      },
      {
        name: 'Sony WH-1000XM5', price: 349, comparePrice: 399, category: electronicsId,
        brand: 'Sony', description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
        shortDescription: '30hr battery, Auto NC Optimizer, crystal clear call quality.',
        stock: 75, isFeatured: true, rating: 4.7, numReviews: 2341,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Sony Headphones', isPrimary: true }],
        tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
      },
      {
        name: 'Samsung 65" QLED 4K TV', price: 1299, comparePrice: 1599, category: electronicsId,
        brand: 'Samsung', description: 'Quantum HDR with AI-powered 4K upscaling and smart TV features.',
        shortDescription: '4K QLED, Quantum HDR, Smart TV, 120Hz.',
        stock: 20, isFeatured: false, rating: 4.6, numReviews: 892,
        images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=500', alt: 'Samsung TV', isPrimary: true }],
        tags: ['tv', 'samsung', '4k', 'qled'],
      },
      {
        name: 'Nike Air Max 270', price: 130, comparePrice: 160, category: clothingId,
        brand: 'Nike', description: 'Inspired by the Air Max dynasty, delivering style and comfort.',
        shortDescription: 'Foam midsole, large Air unit heel, lightweight mesh upper.',
        stock: 120, isFeatured: true, rating: 4.5, numReviews: 3421,
        images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', alt: 'Nike Air Max', isPrimary: true }],
        tags: ['shoes', 'nike', 'sneakers', 'sports'],
      },
      {
        name: 'Levi\'s 501 Original Jeans', price: 79, comparePrice: 98, category: clothingId,
        brand: 'Levi\'s', description: 'The original jeans. The 501 is the quintessential cut.',
        shortDescription: 'Classic straight leg, button fly, 100% cotton denim.',
        stock: 200, isFeatured: false, rating: 4.4, numReviews: 5678,
        images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', alt: 'Levis Jeans', isPrimary: true }],
        tags: ['jeans', 'levis', 'denim', 'casual'],
      },
      {
        name: 'Yoga Mat Pro', price: 79, comparePrice: 99, category: sportsId,
        brand: 'Manduka', description: 'Professional grade yoga mat with superior grip and cushioning.',
        shortDescription: '6mm cushioning, non-slip surface, eco-friendly materials.',
        stock: 150, isFeatured: false, rating: 4.8, numReviews: 1234,
        images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', alt: 'Yoga Mat', isPrimary: true }],
        tags: ['yoga', 'fitness', 'exercise', 'sports'],
      },
      {
        name: 'Nespresso Vertuo Plus', price: 179, comparePrice: 229, category: homId,
        brand: 'Nespresso', description: 'Brew coffee with the touch of a button using Centrifusion technology.',
        shortDescription: 'Centrifusion technology, 5 cup sizes, quick heat-up.',
        stock: 60, isFeatured: true, rating: 4.6, numReviews: 2105,
        images: [{ url: 'https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=500', alt: 'Nespresso', isPrimary: true }],
        tags: ['coffee', 'kitchen', 'appliance', 'nespresso'],
      },
    ];
    
    const createdProducts = await Product.insertMany(products.map(p => ({
      ...p,
      salesCount: Math.floor(Math.random() * 500),
    })));
    console.log(`✅ Created ${createdProducts.length} products`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Admin credentials:');
    console.log('   Email: admin@ecommerce.com');
    console.log('   Password: admin123');
    console.log('\n📧 User credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
