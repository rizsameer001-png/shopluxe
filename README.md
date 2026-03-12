# 🛍️ ShopLux — Full-Stack E-commerce Platform

A production-ready, full-stack e-commerce monorepo with three apps:

| App | Stack | Port | Description |
|-----|-------|------|-------------|
| `apps/server` | Node.js · Express · MongoDB | `5000` | REST API |
| `apps/web` | Next.js 15 · Tailwind · Zustand | `3000` | Customer storefront |
| `apps/admin` | Vite · React · Tailwind · Recharts | `3001` | Admin dashboard |

---

## 🚀 Quick Start (All 3 apps)

### Step 1 — Install all dependencies
```bash
npm run install:all
```

### Step 2 — Configure environment variables

**Server** (`apps/server/.env`):
```bash
cp apps/server/.env.example apps/server/.env
```
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

**Web Client** (`apps/web/.env.local`):
```bash
cp apps/web/.env.local.example apps/web/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Admin Dashboard** (`apps/admin/.env`):
```bash
cp apps/admin/.env.example apps/admin/.env
```
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3 — Seed the database (optional but recommended)
```bash
npm run seed
```
Creates demo data + these accounts:
- 👑 **Admin**: `admin@ecommerce.com` / `admin123`
- 👤 **User**: `john@example.com` / `user123`

### Step 4 — Run all apps simultaneously
```bash
npm run dev
```
Or run individually:
```bash
npm run dev:server   # API on :5000
npm run dev:web      # Storefront on :3000
npm run dev:admin    # Admin panel on :3001
```

---

## 📁 Project Structure

```
shoplux-ecommerce/
├── apps/
│   ├── server/                    # Node.js REST API
│   │   ├── src/
│   │   │   ├── index.js           # Express app entry
│   │   │   ├── models/            # Mongoose models
│   │   │   │   ├── User.js
│   │   │   │   ├── Product.js
│   │   │   │   └── index.js       # Category, Order, Cart, Review
│   │   │   ├── routes/            # Express routers
│   │   │   │   ├── auth.js        # Register, login, profile, wishlist
│   │   │   │   ├── products.js    # CRUD + filtering + search
│   │   │   │   ├── categories.js
│   │   │   │   ├── orders.js
│   │   │   │   ├── cart.js
│   │   │   │   ├── reviews.js
│   │   │   │   ├── payments.js    # Stripe intents + webhooks
│   │   │   │   ├── uploads.js
│   │   │   │   ├── users.js       # Admin user management
│   │   │   │   └── dashboard.js   # Analytics & KPIs
│   │   │   ├── middleware/
│   │   │   │   └── auth.js        # JWT protect, authorize, asyncHandler
│   │   │   └── utils/
│   │   │       └── seeder.js      # Demo data seeder
│   │   ├── uploads/               # Uploaded images
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── web/                       # Next.js 15 Customer Storefront
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Listing + filters
│   │   │   │   └── [slug]/page.tsx # Product detail
│   │   │   └── orders/page.tsx
│   │   ├── components/
│   │   │   ├── layout/            # Header, Footer
│   │   │   ├── cart/              # CartDrawer
│   │   │   ├── product/           # ProductCard
│   │   │   └── providers.tsx
│   │   ├── lib/api.ts             # All API calls
│   │   ├── store/index.ts         # Zustand (auth, cart, UI)
│   │   ├── .env.local.example
│   │   └── package.json
│   │
│   └── admin/                     # Vite + React Admin Dashboard
│       ├── src/
│       │   ├── App.tsx            # Router + layout
│       │   ├── main.tsx
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── Dashboard.tsx  # KPIs + charts
│       │   │   ├── Products.tsx   # CRUD table
│       │   │   ├── Orders.tsx     # Status management
│       │   │   └── UsersAndCategories.tsx
│       │   ├── components/
│       │   │   ├── layout/Sidebar.tsx
│       │   │   └── ProductModal.tsx
│       │   ├── lib/api.ts
│       │   └── store/auth.ts
│       ├── .env.example
│       └── package.json
│
├── package.json                   # Root — workspaces + concurrently
└── .gitignore
```

---

## 🔌 API Overview

### Base URL
```
http://localhost:5000/api
```

### Endpoints Summary
| Group | Routes |
|-------|--------|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PUT /auth/update-profile` · `POST /auth/wishlist/:id` |
| Products | `GET /products` · `GET /products/:slug` · `POST /products` (admin) · `PUT /products/:id` (admin) |
| Categories | `GET /categories` · `GET /categories/tree` · `POST /categories` (admin) |
| Cart | `GET /cart` · `POST /cart/add` · `PUT /cart/item/:id` · `DELETE /cart/item/:id` |
| Orders | `POST /orders` · `GET /orders/my-orders` · `GET /orders` (admin) · `PUT /orders/:id/status` (admin) |
| Reviews | `GET /reviews/product/:id` · `POST /reviews` |
| Payments | `POST /payments/create-intent` · `POST /payments/webhook` |
| Dashboard | `GET /dashboard/stats` (admin) |

All responses: `{ "success": true, "data": {...}, "pagination": {...} }`

---

## 🌐 Deploy on Render

### Server (Web Service)
- **Root Directory**: `apps/server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Env vars**: all from `.env.example`

### Web Client (Web Service)
- **Root Directory**: `apps/web`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Env vars**: `NEXT_PUBLIC_API_URL` → your server Render URL

### Admin Dashboard (Static Site)
- **Root Directory**: `apps/admin`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Env vars**: `VITE_API_URL` → your server Render URL

---

## 📱 Flutter Integration

Point your Dart HTTP client at the deployed server URL:

```dart
const String baseUrl = 'https://your-api.onrender.com/api';

// Auth header
headers: {'Authorization': 'Bearer $token'}

// All responses follow:
// { "success": true, "data": {...} }
```

Health check: `GET /health`
