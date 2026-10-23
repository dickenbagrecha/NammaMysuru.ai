# Deployment Guide: NammaMysuru.ai

This document provides deployment guidelines for hosting NammaMysuru.ai across modern cloud platforms.

---

## 1. Production Architecture Overview

The recommended architecture separates frontend CDN hosting from backend cloud compute:

- **Frontend**: Hosted on **Vercel** (Edge CDN Static Site / SPA).
- **Backend API**: Hosted on a persistent container or Node runtime (e.g. **Render**, **Railway**, **Fly.io**, or **VPS**).
- **Database**:
  - *Local/Single-node VM*: Persistent disk mounted with `sqlite.db`.
  - *Serverless/Distributed*: Managed Postgres via **Neon** or **Supabase** using Drizzle ORM.

---

## 2. Frontend Deployment (Vercel)

The frontend is prepared for independent static deployment.

### Settings in Vercel Dashboard:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` (or repository root if building from top-level)
- **Build Command**: `npm run build:frontend` (or `vite build`)
- **Output Directory**: `dist/public` (or `dist` if executing within `frontend/`)
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`

### Single Page Application (SPA) Routing:
The file [`frontend/vercel.json`](file:///c:/DICKEN-BAGRECHA/Local%20Disk%20%28D%29/Projects/NammaMysuru.ai-main/frontend/vercel.json) configures standard rewrite rules to guarantee deep links (e.g. `/chat`, `/spots`, `/restaurants`) route cleanly to `index.html`.

---

## 3. Backend Deployment (Render / Railway / Cloud VM)

Because the application provides streaming responses via Server-Sent Events (SSE) and uses SQLite for local state, a persistent Node.js environment is ideal.

### Build and Start:
- **Build Command**: `npm run build:backend`
- **Start Command**: `node dist/index.cjs`
- **Environment Variables**:
  - `PORT`: `5000` (or host-assigned `$PORT`)
  - `GEMINI_API_KEY`: Your private Google AI Studio API key
  - `CORS_ORIGIN`: `https://your-frontend.vercel.app`

---

## 4. Database Strategy & Considerations

### Current State:
- Uses SQLite with `better-sqlite3`.
- Auto-seeds default tourist spots and dining directories on startup.
- Conversations and messages are persisted to `sqlite.db`.

### Production Persistence Note:
Vercel serverless functions have an ephemeral filesystem. If deploying the backend to serverless functions, database writes to local `sqlite.db` will not persist across invocations. For high-scale or serverless environments, transitioning the Drizzle schema to PostgreSQL (e.g. via Neon serverless driver) is recommended.
