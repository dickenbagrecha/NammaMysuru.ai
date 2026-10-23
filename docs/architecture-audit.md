# Architecture Audit: NammaMysuru.ai

**Date**: 2026-10-23  
**Status**: Pre-Migration Baseline  
**Project**: NammaMysuru.ai  
**Auditor**: Full-Stack Architecture & Refactoring Agent

---

## 1. Executive Summary

NammaMysuru.ai is an intelligent Mysuru tourism and cultural assistant with AI-powered chat, multi-language conversational support (English, Kannada, Hindi), real-time weather information, curated heritage spots, and dining directories.

The codebase currently resides in a combined single-package layout (`client/`, `server/`, `shared/`) historically configured for Replit. While functional, the repository couples frontend UI code, server-side Express logic, database operations, and development tooling into a monolithic root configuration.

This document details the audit of the existing codebase, identifies critical architectural limitations and risks, and establishes the blueprint for reorganizing the application into an enterprise-grade `frontend/` and `backend/` decoupled architecture.

---

## 2. Current Architecture & Directory Map

```text
NammaMysuru.ai/ (Current)
├── .env / .env.example       # Local environment configuration
├── client/                   # React frontend
│   ├── index.html            # Vite HTML entry
│   ├── public/               # Images (spots, patterns, audio worklet)
│   ├── src/
│   │   ├── components/       # UI primitives & custom components (Header, Footer, SpotCard, UI kit)
│   │   ├── hooks/            # TanStack Query & state hooks (use-chat, use-restaurants, use-tourist-spots)
│   │   ├── lib/              # Utilities (queryClient, tailwind merge cn)
│   │   ├── pages/            # Page views (Home, Chat, TouristSpots, Restaurants, Helpline, Login, 404)
│   │   ├── replit_integrations/audio/ # Audio recording & streaming hooks
│   │   ├── App.tsx           # Wouter routes & providers
│   │   ├── index.css         # Tailwind styles + theme variables
│   │   └── main.tsx          # React DOM entry
│   └── requirements.md
├── server/                   # Node.js Express server
│   ├── db.ts                 # SQLite connection via better-sqlite3 + drizzle-orm
│   ├── index.ts              # Express initialization & entry
│   ├── routes.ts             # API routes + in-memory seed data for spots & restaurants
│   ├── static.ts             # Static file serving in production
│   ├── storage.ts            # Database storage operations for spots & restaurants
│   ├── vite.ts               # Development Vite middleware integration
│   └── replit_integrations/  # Chat, Audio, Weather, Batch, Image modules
├── shared/                   # Shared schema & route definitions
│   ├── models/chat.ts        # SQLite tables for conversations and messages
│   ├── routes.ts             # Route contracts with Zod schema definitions
│   └── schema.ts             # Drizzle tables: touristSpots, restaurants
├── script/build.ts           # Combined build script using Vite + esbuild
├── attached_assets/          # Media assets
├── drizzle.config.ts         # Drizzle configuration
├── package.json              # Monolithic package manifest
├── tsconfig.json             # Root TypeScript configuration with aliases
├── tailwind.config.ts        # Tailwind configuration
└── vite.config.ts            # Vite configuration
```

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite 7 |
| **Routing & State** | `wouter` (client-side routing), `@tanstack/react-query` v5 |
| **Styling & UI Components** | Tailwind CSS 3, Radix UI primitives, Lucide React, Framer Motion |
| **Backend Runtime** | Node.js (ESM), Express 5 |
| **Database & ORM** | SQLite (`better-sqlite3`), Drizzle ORM |
| **AI Integration** | Google Generative AI SDK (`@google/generative-ai`), Gemini Flash models |
| **Live Integrations** | Open-Meteo Weather API, Web Speech Synthesis API, Web Audio API |
| **Build & Tooling** | `tsx`, `esbuild`, `vite`, `drizzle-kit`, `postcss`, `autoprefixer` |

---

## 4. Application Flow & Data Tracing

1. **Client Startup**: `index.html` loads `client/src/main.tsx`, bootstrapping `App.tsx` wrapped in `QueryClientProvider`, `TooltipProvider`, and `AppSettingsProvider`.
2. **API Requests**:
   - Tourist spots & restaurants: Queried via hooks (`use-tourist-spots.ts`, `use-restaurants.ts`) calling `/api/spots` and `/api/restaurants`.
   - Chat & Voice:
     - Chat messages POST to `/api/conversations/:id/messages` yielding Server-Sent Events (SSE) data streams.
     - Voice recordings POST base64 audio to `/api/voice-conversations/:id/messages`, transcribed and answered by Gemini with live weather tool calling.
3. **Backend Handling**:
   - `server/index.ts` creates Express app and HTTP server.
   - `server/routes.ts` registers endpoints and seeds database from curated static objects on startup if records differ.
   - `server/replit_integrations/chat/routes.ts` and `audio/routes.ts` invoke Gemini 2.5 models and persist conversations into SQLite.
4. **Data Persistence**:
   - Data stored in `sqlite.db` via `better-sqlite3` and `drizzle-orm`.

---

## 5. Identified Architectural Problems & Risks

1. **Coupled Dependencies**: All frontend and backend dependencies share a single `package.json`. Server libraries (`better-sqlite3`, `express`, `@google/generative-ai`) and client libraries (`@radix-ui/*`, `framer-motion`) are co-located.
2. **Monolithic Build Script**: `script/build.ts` invokes both `viteBuild()` and `esbuild` synchronously. This prevents independent deployment of the frontend (e.g. to Vercel CDN) and backend.
3. **SQLite Ephemeral Persistence in Serverless Deployments**:
   - SQLite writes to `sqlite.db` on local disk.
   - Deploying directly to Vercel Serverless Functions will cause read/write failures or data loss between execution cold starts.
   - A durable cloud database (e.g., Neon Postgres or Supabase) or dedicated container backend (e.g., Render, Railway, Fly.io, or VPS) is required for persistent production databases.
4. **Hardcoded Relative API Paths**: Client hooks make raw `fetch('/api/...')` calls assuming frontend and backend are always hosted on the exact same domain/port. For independent frontend hosting (Vercel) communicating with a separate backend, an environment variable `VITE_API_BASE_URL` is required with fallback to `/api` for unified dev.
5. **Replit-Specific Tooling Artifacts**: `vite.config.ts` includes conditional plugins `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner`, which should be isolated or safely handled outside Replit environments.
6. **GEMINI_API_KEY Missing Graceful Handling**: Handled locally via graceful fallback warning, but needs clear documented environment guidance in `.env.example`.

---

## 6. Proposed Target Folder Structure

```text
NammaMysuru.ai/
├── frontend/                     # Completely decoupled frontend SPA
│   ├── public/                   # Static public assets (images, audio worklet)
│   ├── src/
│   │   ├── api/                  # Configured API client & base URL handler
│   │   ├── assets/               # Local bundled assets
│   │   ├── components/           # React UI components & Radix primitives
│   │   ├── hooks/                # React Query hooks & custom state
│   │   ├── lib/                  # Frontend utilities
│   │   ├── pages/                # Page route views
│   │   ├── services/             # Audio, speech, and voice integration services
│   │   ├── types/                # Frontend type definitions
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json              # Frontend-only dependencies
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                      # Decoupled Node.js / Express backend
│   ├── src/
│   │   ├── config/               # Environment & AI model configs
│   │   ├── db/                   # Database client (SQLite/Drizzle) & seed data
│   │   ├── middleware/           # Logging & error-handling middleware
│   │   ├── routes/               # API routes (spots, restaurants, chat, voice, health)
│   │   ├── services/             # Gemini AI service, weather service
│   │   ├── storage/              # Database access layer / repositories
│   │   ├── types/                # Server types
│   │   └── index.ts              # Express application entry
│   ├── drizzle.config.ts
│   ├── package.json              # Backend-only dependencies
│   ├── tsconfig.json
│   └── .env.example
│
├── shared/                       # Lightweight shared contracts (Schemas, routes, DTOs)
│   ├── models/chat.ts
│   ├── routes.ts
│   └── schema.ts
│
├── docs/                         # Comprehensive architectural and operational documentation
│   ├── architecture-audit.md     # This comprehensive audit
│   ├── architecture.md           # System design & component interaction
│   ├── environment-setup.md      # Detailed configuration instructions
│   └── deployment-guide.md       # Vercel & cloud hosting deployment guide
│
├── .env.example                  # Root documentation of environment variables
├── .gitignore                    # Robust gitignore for both layers
├── package.json                  # Root workspace orchestration scripts (npm workspaces)
└── README.md                     # Modernized project guide
```

---

## 7. Migration Plan & Safety Safeguards

1. **Git Protection**: Refactoring on branch `refactor/deployment-ready-structure`.
2. **Preserve Shared Schema**: Both `frontend` and `backend` rely on `@shared/routes` and `@shared/schema` (Zod schemas and Drizzle entity types). Keeping `shared/` at root with TypeScript paths ensures no duplication and complete type safety.
3. **Workspace Setup**: Use standard npm workspaces in root `package.json` (`workspaces: ["frontend", "backend"]`) allowing developers to run `npm run dev` at root seamlessly while maintaining complete modularity.
4. **Vercel Readiness**:
   - `frontend/` builds into `frontend/dist`.
   - Vercel SPA configuration (`vercel.json`) prepared with rewrite rules.
5. **No Data Loss**: Existing `sqlite.db` is preserved and ignored in git; seed routines ensure immediate readiness for any fresh clone.
