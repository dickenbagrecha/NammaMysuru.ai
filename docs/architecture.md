# System Architecture & Component Design: NammaMysuru.ai

## 1. Architecture Overview

NammaMysuru.ai employs a clean full-stack architecture with decoupled frontend and backend layers, tied together with shared type contracts.

```mermaid
flowchart TB
    subgraph Browser ["Frontend Client (React + Vite on Vercel)"]
        UI["UI Pages & Radix Components"]
        APIClient["API Client (lib/api.ts)"]
        QueryState["TanStack React Query Cache"]
        AudioRecord["Web Audio Recorder & Streamer"]
    end

    subgraph ServerLayer ["Backend Service (Express + Node.js on Render)"]
        HTTP["Express HTTP Server (backend/index.ts)"]
        CORSMW["Strict CORS & Allowlist Middleware"]
        SpotRouter["Heritage Spots Router"]
        RestRouter["Restaurants Router"]
        ChatRouter["Conversational Chat Router (SSE)"]
        AudioRouter["Voice Streaming Router"]
        HealthRouter["Health Check Router (/api/health)"]
    end

    subgraph DataIntegrations ["Data & External Providers"]
        PostgresDB[(Neon PostgreSQL via node-postgres + Drizzle)]
        GeminiAI["Google Gemini 3.5 Flash Lite API"]
        OpenMeteo["Open-Meteo Weather API"]
    end

    UI --> APIClient
    APIClient --> QueryState
    QueryState -->|REST JSON| HTTP
    AudioRecord -->|Audio Chunk Streaming| HTTP

    HTTP --> CORSMW
    CORSMW --> SpotRouter
    CORSMW --> RestRouter
    CORSMW --> ChatRouter
    CORSMW --> AudioRouter
    CORSMW --> HealthRouter

    SpotRouter --> PostgresDB
    RestRouter --> PostgresDB
    ChatRouter --> PostgresDB
    ChatRouter --> GeminiAI
    ChatRouter --> OpenMeteo
    AudioRouter --> GeminiAI
```

---

## 2. Layer Boundaries & Responsibilities

### Frontend (`frontend/`)
- **Scope**: Browser-only SPA execution deployed to Vercel Edge CDN.
- **Components**:
  - `src/pages/`: Route targets (`Home`, `Chat`, `TouristSpots`, `Restaurants`, `Helpline`, `Login`).
  - `src/components/`: Modular UI system built on Tailwind CSS and Radix UI primitives.
  - `src/hooks/`: Data-fetching hooks (`useTouristSpots`, `useRestaurants`, `useChat`, `useVoiceStream`).
  - `src/lib/api.ts`: Central endpoint resolution. Dynamically uses `VITE_API_BASE_URL` when specified, or relative routes in local dev.
  - `public/`: Images, vector graphics, and Web Audio worklets.

### Backend (`backend/`)
- **Scope**: Express HTTP API server and external service orchestration deployed to Render.
- **Components**:
  - `index.ts`: Application bootstrap, strict CORS allowlist middleware, body parsers, and error handling.
  - `routes.ts`: Core REST routes for tourist attractions, dining, and system health (`/api/health`).
  - `storage.ts`: Repository operations interfacing with Drizzle ORM.
  - `db.ts` / `db.pg.ts`: Neon PostgreSQL database connection pool and Drizzle client.
  - `restaurant-provenance.ts`: Verified restaurant metadata and data provenance records.
  - `replit_integrations/`:
    - `gemini_client.ts`: Google Generative AI client (`gemini-3.5-flash-lite`) with fallback protection.
    - `chat/routes.ts`: Multi-lingual conversational pipeline with function-calling tools.
    - `audio/routes.ts`: Base64 audio decoding and streaming synthesis.
    - `weather.ts`: Real-time weather provider.

### Shared Layer (`shared/`)
- **Scope**: Shared validation schemas and contracts.
- **Components**:
  - `schema.ts`: Canonical PostgreSQL Drizzle table definitions (`tourist_spots`, `restaurants`) and Zod schemas.
  - `models/chat.ts`: Active PostgreSQL `conversations` and `messages` schemas.
  - `schema.sqlite.ts` & `models/chat.sqlite.ts`: Preserved SQLite schemas for rollback.
  - `routes.ts`: Standardized route paths and request/response Zod contracts.

---

## 3. Communication Patterns

1. **Standard REST Endpoints**:
   - `GET /api/spots`: Returns tourist spots with cache headers.
   - `GET /api/spots/:id`: Returns single spot details.
   - `GET /api/restaurants`: Returns restaurants with dietary, cuisine, neighbourhood, and verification filters.
   - `GET /api/health`: Validates backend service availability and uptime.

2. **Server-Sent Events (SSE)**:
   - `POST /api/conversations/:id/messages`: Streams Gemini AI tokens chunk-by-chunk to the frontend in real time.
   - `POST /api/voice-conversations/:id/messages`: Accepts base64 audio and returns streaming transcribed response text.
