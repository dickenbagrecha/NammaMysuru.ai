# Environment Setup & Secrets Guide: NammaMysuru.ai

This document outlines environment variables, requirements, and local setup steps for developers and operators.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (Active LTS recommended).
- **npm**: `v10.x` or higher.
- **Git**: Installed and configured.
- **Database**: PostgreSQL (e.g. [Neon](https://neon.tech/) serverless PostgreSQL) for production/staging, with local SQLite schema preserved for rollback.

---

## 2. Environment Variables Overview

| Variable | Scope | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Backend | Optional | `5000` | Port on which Express server listens |
| `DATABASE_URL` | Backend | **Yes** (in production) | None | PostgreSQL connection URI (e.g., Neon pooled endpoint) |
| `DATABASE_URL_DIRECT` | Backend / CLI | Optional | None | Direct unpooled PostgreSQL connection string for DDL migrations |
| `GEMINI_API_KEY` | Backend | **Yes** (for AI features) | None | Google AI Studio API key for Gemini models |
| `GEMINI_MODEL` | Backend | Optional | `gemini-3.5-flash-lite` | Target Gemini model name |
| `CORS_ORIGIN` | Backend | Optional | `""` | Comma-separated list of allowed frontend origins (e.g., `https://nammamysuruai.vercel.app,http://localhost:5173`) |
| `VITE_API_BASE_URL` | Frontend | Optional | `""` (relative `/api`) | Base URL pointing to deployed backend API (e.g., `https://nammamysuru-ai.onrender.com`) |

> [!WARNING]
> Never commit `.env` or `.env.local` files to Git. Keep `GEMINI_API_KEY` and `DATABASE_URL` private on the server. Do not prefix server secrets with `VITE_`.

---

## 3. Local Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dickenbagrecha/NammaMysuru.ai.git
   cd NammaMysuru.ai
   ```

2. **Install dependencies cleanly**:
   ```bash
   npm ci
   ```

3. **Configure environment**:
   ```bash
   # Copy sample environment configuration
   cp .env.example .env
   ```
   Open `.env` and insert your Gemini API Key and PostgreSQL connection string:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key
   GEMINI_MODEL=gemini-3.5-flash-lite
   DATABASE_URL=postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require
   CORS_ORIGIN=http://localhost:5173,http://localhost:5000
   ```

4. **Verify Database Schema**:
   ```bash
   npx drizzle-kit push --config=drizzle.pg.config.ts
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5000](http://localhost:5000) in your browser.
