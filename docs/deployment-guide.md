# Deployment Guide: NammaMysuru.ai

This document provides deployment guidelines for hosting NammaMysuru.ai across production cloud platforms.

---

## 1. Production Architecture Overview

The deployed architecture decouples frontend CDN hosting, persistent backend compute, and serverless managed database:

- **Frontend**: Hosted on **Vercel** (Edge CDN Static Site / SPA).<br />*Live URL*: `https://nammamysuruai.vercel.app/`
- **Backend API**: Hosted on **Render** (Node.js Web Service).<br />*Live URL*: `https://nammamysuru-ai.onrender.com`<br />*Health Check*: `https://nammamysuru-ai.onrender.com/api/health`
- **Database**: Managed **Neon PostgreSQL** accessed via Drizzle ORM and `node-postgres` connection pool.

---

## 2. Frontend Deployment (Vercel)

The frontend is configured for static edge deployment via Vite.

### Settings in Vercel Dashboard:
- **Framework Preset**: `Vite`
- **Root Directory**: Repository root (`./`)
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist/public`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://nammamysuru-ai.onrender.com`

### Single Page Application (SPA) Routing:
The root configuration file [`vercel.json`](file:///c:/DICKEN-BAGRECHA/Local%20Disk%20%28D%29/Projects/NammaMysuru.ai-main/vercel.json) configures standard rewrite rules to guarantee deep links (e.g. `/chat`, `/spots`, `/restaurants`, `/helpline`) route cleanly to `/index.html`.

---

## 3. Backend Deployment (Render)

The Express backend handles REST APIs, strict CORS origin checks, Gemini AI streaming via Server-Sent Events (SSE), and database operations.

### Render Web Service Configuration:
- **Environment**: `Node`
- **Node Version**: `20.x`
- **Build Command**: `npm ci --include=dev && npm run build`
- **Start Command**: `npm run start`
- **Health Check Path**: `/api/health`

### Environment Variables on Render:
- `PORT`: (Supplied automatically by Render, defaults to `5000`)
- `NODE_ENV`: `production`
- `DATABASE_URL`: `postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require` (Pooled connection)
- `GEMINI_API_KEY`: Google AI Studio API key (kept strictly server-side)
- `GEMINI_MODEL`: `gemini-3.5-flash-lite`
- `CORS_ORIGIN`: `https://nammamysuruai.vercel.app`

---

## 4. Database Strategy & PostgreSQL on Neon

### Active Production Database:
- Hosted on **Neon PostgreSQL**.
- Runtime adapter: `backend/db.ts` (re-exports `backend/db.pg.ts`).
- Tables: `tourist_spots`, `restaurants`, `conversations`, `messages`.
- Schema definitions: `shared/schema.ts` (PostgreSQL Drizzle schema).
- DDL Migrations: `migrations-pg/0000_shallow_morlocks.sql`.

### Connection Configuration:
- **Runtime Pool**: Uses `DATABASE_URL` with SSL (`rejectUnauthorized: false` for managed hosts).
- **Direct Migrations**: Uses `DATABASE_URL_DIRECT` (direct unpooled endpoint) with `drizzle.pg.config.ts` when running DDL commands.

### Rollback & Local Development Support:
- SQLite schemas are preserved in `shared/schema.sqlite.ts` and `shared/models/chat.sqlite.ts`.
- The safe data migration script `script/migrate-sqlite-to-postgres.ts` is available with dry-run and host confirmation guards.
