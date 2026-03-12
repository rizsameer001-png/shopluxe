# ShopLux Admin Dashboard — Vite + React + Tailwind

Full-featured admin panel for managing your ShopLux store.

## Quick Start

```bash
npm install
cp .env.example .env       # set VITE_API_URL
npm run dev                # http://localhost:3001
```

## Tech Stack
- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** — utility-first styling
- **React Router v6** — client-side routing
- **Zustand** — auth state
- **TanStack React Query** — data + mutations
- **Recharts** — analytics charts
- **React Hot Toast** — notifications

## Pages
| Route | Description |
|-------|-------------|
| `/login` | Admin sign-in |
| `/` | Dashboard — KPIs, revenue chart, recent orders |
| `/products` | Product CRUD — create, edit, delete |
| `/categories` | Category management |
| `/orders` | Order list — update status inline |
| `/users` | User management — roles, activate/deactivate |

## Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

## Deploy (Render — Static Site)
- Build: `npm run build`
- Publish dir: `dist`
- Set `VITE_API_URL` to your Render API URL
