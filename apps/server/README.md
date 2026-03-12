# ShopLux E-commerce Server API

Production-ready REST API for the ShopLux e-commerce platform, built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **Payments**: Stripe
- **File Upload**: Multer (local) — swap to Cloudinary for production
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs
- **Email**: Nodemailer

---

## 📁 Project Structure

```
server/
├── src/
│   ├── index.js              # Entry point
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Product.js        # Product model
│   │   └── index.js          # Category, Order, Cart, Review models
│   ├── routes/
│   │   ├── auth.js           # Auth + user profile routes
│   │   ├── products.js       # Product CRUD + filtering
│   │   ├── categories.js     # Category management
│   │   ├── orders.js         # Order placement + management
│   │   ├── cart.js           # Shopping cart
│   │   ├── reviews.js        # Product reviews
│   │   ├── payments.js       # Stripe payment intents + webhooks
│   │   ├── uploads.js        # Image upload
│   │   ├── users.js          # Admin: user management
│   │   └── dashboard.js      # Admin: analytics + stats
│   ├── middleware/
│   │   └── auth.js           # JWT protect, authorize, asyncHandler
│   └── utils/
│       └── seeder.js         # Database seeder script
├── uploads/                  # Uploaded images (local)
├── .env.example              # Environment variable template
└── package.json
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Required `.env` variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 4. Seed the database (optional but recommended)
```bash
npm run seed
```
This creates:
- Admin: `admin@ecommerce.com` / `admin123`
- User: `john@example.com` / `user123`
- 8 categories, 8 products

### 5. Start development server
```bash
npm run dev
```

### 6. Start production server
```bash
npm start
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/update-profile` | Private | Update profile |
| PUT | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password/:token` | Public | Reset password |
| POST | `/api/auth/wishlist/:productId` | Private | Toggle wishlist |
| POST | `/api/auth/addresses` | Private | Add address |
| PUT | `/api/auth/addresses/:id` | Private | Update address |
| DELETE | `/api/auth/addresses/:id` | Private | Delete address |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List + filter products |
| GET | `/api/products/featured` | Public | Featured products |
| GET | `/api/products/new-arrivals` | Public | Newest products |
| GET | `/api/products/best-sellers` | Public | Top selling |
| GET | `/api/products/brands` | Public | All brands |
| GET | `/api/products/:idOrSlug` | Public | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete |

**Product filter query params**: `keyword`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `isFeatured`, `tags`, `inStock`, `sort`, `page`, `limit`

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Private | Place order |
| GET | `/api/orders/my-orders` | Private | User's orders |
| GET | `/api/orders/:id` | Private | Single order |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cart` | Private | Get cart |
| POST | `/api/cart/add` | Private | Add item |
| PUT | `/api/cart/item/:itemId` | Private | Update quantity |
| DELETE | `/api/cart/item/:itemId` | Private | Remove item |
| DELETE | `/api/cart/clear` | Private | Clear cart |

### Categories, Reviews, Users, Dashboard, Payments, Uploads
See full route files in `src/routes/` for complete endpoint list.

---

## 🔐 Authentication

All protected routes require the `Authorization: Bearer <token>` header.

**Token response shape:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": { "_id": "...", "name": "...", "email": "...", "role": "user" }
}
```

**Roles**: `user`, `admin`, `superadmin`

---

## 🌐 Deploying to Render

1. Push to GitHub
2. Create a **Web Service** on Render
3. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Add all variables from `.env.example`
4. Add a **MongoDB Atlas** connection string to `MONGODB_URI`
5. Set `NODE_ENV=production`

---

## 📱 Flutter REST API Integration

All responses follow the shape:
```json
{ "success": true, "data": { ... }, "pagination": { ... } }
```

Use the Dart `http` or `dio` package. Set the base URL to your deployed Render URL.

```dart
const String baseUrl = 'https://your-api.onrender.com/api';
```

Health check endpoint: `GET /health`
