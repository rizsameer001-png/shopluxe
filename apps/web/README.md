# ShopLux Web Client — Next.js 15

Production-ready e-commerce storefront with Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand, and React Query.

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                         # http://localhost:3000
```

## Tech Stack
- **Next.js 15** (App Router, Server Components)
- **TypeScript** + **Tailwind CSS**
- **Zustand** — auth, cart, UI state
- **TanStack React Query** — data fetching & caching
- **Axios** — HTTP client with JWT interceptors
- **Stripe.js** — payment integration
- **React Hot Toast** — notifications

## Key Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, categories, featured products |
| `/products` | Shop — search, filter, pagination |
| `/products/[slug]` | Product detail — images, reviews, add to cart |
| `/login` | Sign in |
| `/register` | Create account |
| `/orders` | My order history |

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Deploy (Render)
- Build: `npm run build`
- Start: `npm start`
- Set `NEXT_PUBLIC_API_URL` to your Render API URL
