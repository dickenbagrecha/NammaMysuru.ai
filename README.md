<div align="center">

# NammaMysuru.ai

### AI-powered Mysuru tourism companion with a royal, tech-first experience.

[![Live Website](https://img.shields.io/badge/Live_Website-nammamysuruai.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://nammamysuruai.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=111)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-111827?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Gemini](https://img.shields.io/badge/Gemini-3.5_Flash_Lite-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

![NammaMysuru.ai](https://capsule-render.vercel.app/api?type=waving&height=260&color=0:3b0714,45:8e1321,100:d7a832&text=NammaMysuru.ai&fontColor=fff4c2&fontSize=58&fontAlignY=40&desc=Royal%20Mysuru%20Tourism%20AI%20Guide&descAlignY=60&descSize=18)

**Explore palaces. Plan itineraries. Find food. Ask in English, Kannada, or Hindi.**

🌐 **[Experience Live Demo: nammamysuruai.vercel.app](https://nammamysuruai.vercel.app/)**
<br />
⚡ **[Backend API Health: nammamysuru-ai.onrender.com/api/health](https://nammamysuru-ai.onrender.com/api/health)**


[Mysuru Tourism](https://mysore.nic.in/en/tourism/) • [Karnataka Tourism](https://karnatakatourism.org/) • [GitHub Repository](https://github.com/dickenbagrecha/NammaMysuru.ai)

</div>

---

## What Is This?

**NammaMysuru.ai** is a production-ready, full-stack AI tourism guide built for Mysuru, the "City of Palaces." It fuses a high-performance modern web interface with a Google Gemini-powered chatbot, curated tourist spots, restaurant discovery with provenance and dietary filters, emergency helpline details, local authentication, and a royal heritage-themed visual language inspired by Mysore silk sarees.

The platform serves as an interactive digital local guide: ultra-fast, visually stunning, multilingual, and deeply grounded in the cultural heritage of Mysuru.

---

## Key Highlights

- 🌟 **AI Travel Chatbot**: Powered by Google Gemini (`gemini-3.5-flash-lite`) with streaming Server-Sent Events (SSE) responses.
- 🗣️ **Multilingual Intelligence**: Native reply options in English, Kannada, and Hindi, featuring automated script-aware language detection.
- 🗺️ **Actionable Tool Integration**: AI is equipped with live local weather and time tools using geocoding APIs.
- 🏛️ **Tourist Places Directory**: A comprehensive database of curated tourist spots, including visiting hours, ticket prices, and map directions.
- 🍽️ **Restaurant Explorer**: Interactive dining discovery engine with filters for pure-veg, vegan-friendly, Jain-friendly, cuisine types, neighbourhoods, and budget ranges, backed by data provenance verification metadata.
- 📞 **Helpline Directory**: Quick access to municipal emergency lines, local police, ambulance services, and tourist desks.
- 🎨 **Royal Silk Design Language**: Curated theme system with smooth gradients, glassmorphism panels, and a rotating cursor follower.
- 🐘 **Cultural & Dasara Information**: Comprehensive cultural advisories, etiquette tips, and Dasara festival event guidance.
- 💾 **Managed PostgreSQL Storage**: Production persistence powered by **Neon PostgreSQL** and **Drizzle ORM** with identity sequence management, with SQLite rollback schemas preserved.
- 📴 **Smart Fallback Engine**: Hardcoded localized fallback maps that serve responses in case of internet loss or API limitations.

---

## Live Deployment Links

| Service | Hosting | Live URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | [https://nammamysuruai.vercel.app/](https://nammamysuruai.vercel.app/) | Global Edge CDN Single Page Application (SPA) |
| **Backend API** | [Render](https://render.com/) | [https://nammamysuru-ai.onrender.com](https://nammamysuru-ai.onrender.com) | Express REST API, SSE streaming, Gemini client |
| **Health Check** | [Render](https://render.com/) | [https://nammamysuru-ai.onrender.com/api/health](https://nammamysuru-ai.onrender.com/api/health) | Uptime & health verification endpoint |
| **Database** | [Neon](https://neon.tech/) | *Managed Cloud Postgres* | Serverless PostgreSQL with connection pooling |
| **Source Code** | [GitHub](https://github.com/) | [https://github.com/dickenbagrecha/NammaMysuru.ai](https://github.com/dickenbagrecha/NammaMysuru.ai) | Canonical GitHub Repository (`main` branch) |

---

## Product Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend Client (Vercel Edge CDN)"]
        UI["React 18 Component Views"]
        State["TanStack Query (Cache)"]
        ClientAPI["Frontend API Client (lib/api.ts)"]
        Style["Tailwind CSS + Silk HSL Theme Engine"]
    end

    subgraph Server ["Backend Service (Render Node.js)"]
        HTTP["Express 5 HTTP Server"]
        CORS["Strict CORS Allowlist (CORS_ORIGIN)"]
        Routes["API Routers (/api/spots, /api/restaurants)"]
        SSE["Server-Sent Events Controller"]
        ChatEngine["Chat & Voice Integrations"]
    end

    subgraph External ["External Services & Managed Database"]
        NeonDB[("Neon PostgreSQL (DATABASE_URL)")]
        Gemini["Google Gemini API (gemini-3.5-flash-lite)"]
        Meteo["Open-Meteo Weather & Time API"]
    end

    subgraph LocalArchived ["Local Development / Rollback"]
        SQLiteArchived[("sqlite.db (shared/schema.sqlite.ts)")]
    end

    UI --> ClientAPI
    ClientAPI -->|HTTPS REST / SSE| CORS
    CORS --> HTTP
    HTTP --> Routes
    HTTP --> SSE
    HTTP --> ChatEngine
    Routes -->|Drizzle ORM| NeonDB
    ChatEngine -->|Drizzle ORM| NeonDB
    ChatEngine -->|Streaming Prompts| Gemini
    ChatEngine -->|Live Conditions| Meteo
    UI -->|Cache Check| State
```

### Production Request Flow
1. **Browser → Vercel Frontend**: The browser loads the static Vite React SPA from Vercel Edge CDN.
2. **Frontend → Render API**: Client requests (`/api/spots`, `/api/restaurants`, `/api/conversations`) resolve against `VITE_API_BASE_URL` (`https://nammamysuru-ai.onrender.com`).
3. **CORS Validation**: Express inspects incoming `Origin` headers against the strict `CORS_ORIGIN` allowlist (`https://nammamysuruai.vercel.app`), sets `Vary: Origin`, and handles preflight requests cleanly.
4. **Backend → Neon PostgreSQL**: Database operations run via node-postgres (`pg`) Pool using `DATABASE_URL` (SSL enabled for managed Neon hosts).
5. **Backend → Google Gemini**: Chat and voice queries are handled server-side using the Google Generative AI SDK with the `GEMINI_API_KEY`, keeping API secrets strictly protected on the backend.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Frontend** | [React](https://react.dev/) | `18.3.1` | Page layouts and stateful views |
| **Routing** | [Wouter](https://github.com/molecula/wouter) | `3.3.5` | Lightweight, high-performance client-side routing |
| **State Caching** | [TanStack Query](https://tanstack.com/query) | `5.60.5` | Server state management and caching |
| **Build Compiler** | [Vite](https://vite.dev/) | `7.3.0` | Frontend bundle compilation and development server |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.17` | Responsive layout utility styles & design tokens |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) | Latest | Accessible baseline primitives & dialogs |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | `11.18.2` | Hardware-accelerated UI transitions |
| **Backend** | [Express](https://expressjs.com/) | `5.0.1` | API routing, CORS handling, and SSE streaming |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | `16+` | Cloud-native serverless relational database |
| **Database Client** | [node-postgres (`pg`)](https://node-postgres.com/) | `8.16.3` | Connection pooling client |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | `0.39.3` | Type-safe SQL builder and migrations |
| **Schema Migration** | [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | `0.31.8` | Schema generation and PostgreSQL DDL migrations |
| **Validation** | [Zod](https://zod.dev/) | `3.25.76` | Input parsing and API schema guards |
| **Generative AI** | [Google Gen AI SDK](https://ai.google.dev/) | `^0.24.1` | Multilingual chatbot (`gemini-3.5-flash-lite`) |
| **Frontend Host** | [Vercel](https://vercel.com/) | - | Global CDN static SPA hosting |
| **Backend Host** | [Render](https://render.com/) | Node 20 LTS | Web service container hosting |

---

## Project Structure

```bash
NammaMysuru.ai/
├── frontend/                   # Decoupled React + Vite Client
│   ├── public/                 # Static Assets (Images, patterns, audio worklet)
│   ├── src/
│   │   ├── components/         # Reusable UI Blocks & Radix Primitives
│   │   ├── hooks/              # Data-fetching hooks (useTouristSpots, useRestaurants, useChat)
│   │   ├── lib/                # API client (api.ts with VITE_API_BASE_URL), queryClient, utils
│   │   ├── pages/              # Route views (Home, Chat, TouristSpots, Restaurants, Helpline, Login)
│   │   ├── replit_integrations/audio/ # Audio recording & streaming hooks
│   │   ├── App.tsx             # Application routing & context providers
│   │   ├── index.css           # Global HSL royal silk design tokens
│   │   └── main.tsx            # Vite React entry point
│   ├── index.html              # HTML shell
│   └── vercel.json             # Vercel SPA routing rewrites
├── backend/                    # Decoupled Express Backend
│   ├── replit_integrations/    # AI Modules (Gemini client, voice, chat, weather)
│   ├── db.ts                   # Canonical database export (re-exports dbPg and pool)
│   ├── db.pg.ts                # Neon PostgreSQL connection pool & Drizzle adapter
│   ├── index.ts                # Express application bootstrap & strict CORS
│   ├── restaurant-provenance.ts # Verified restaurant metadata & provenance records
│   ├── routes.ts               # Core API endpoints (/api/spots, /api/restaurants, /api/health)
│   ├── static.ts               # Production static distributor
│   ├── storage.ts              # PostgreSQL database storage repository layer
│   └── vite.ts                 # Local development Vite middleware
├── shared/                     # Shared Contracts & Data Types
│   ├── models/
│   │   ├── chat.ts             # Active PostgreSQL Conversation & Message Drizzle schemas
│   │   └── chat.sqlite.ts      # Preserved SQLite chat schema (rollback support)
│   ├── routes.ts               # Type-safe API path contracts
│   ├── schema.ts               # Active PostgreSQL database schema & Zod validators
│   ├── schema.pg.ts            # PostgreSQL canonical Drizzle schema definitions
│   └── schema.sqlite.ts        # Preserved SQLite database schema (rollback support)
├── migrations-pg/              # Drizzle PostgreSQL migration files
│   ├── 0000_shallow_morlocks.sql # Initial PostgreSQL DDL schema definition
│   └── meta/                   # Drizzle migration journal metadata
├── docs/                       # Architecture & Operational Documentation
│   ├── DESIGN.md               # Visual design tokens & aesthetic specification
│   ├── architecture.md         # Full-stack system design
│   ├── architecture-audit.md   # Architectural audit & decoupling blueprint
│   ├── deployment-guide.md     # Production deployment instructions
│   ├── environment-setup.md    # Environment variables & secrets guide
│   └── mobile-responsiveness-audit.md # Mobile UX audit report
├── script/
│   ├── build.ts                # Production compilation script (Vite + esbuild)
│   ├── migrate-restaurants.ts  # SQLite-specific restaurant column migration (historic)
│   └── migrate-sqlite-to-postgres.ts # Verified SQLite -> Neon PostgreSQL data transfer utility
├── drizzle.config.ts           # SQLite Drizzle configuration (rollback/legacy)
├── drizzle.pg.config.ts        # PostgreSQL Drizzle configuration (active)
├── vercel.json                 # Top-level Vercel SPA rewrite configuration
├── package.json                # Root orchestration & scripts
├── tsconfig.json               # Root TypeScript configuration with path aliases
├── tailwind.config.ts          # Tailwind CSS styling configuration
└── vite.config.ts              # Vite compilation setup
```

---

## Detailed Feature Architecture

### 1. Smart AI Chatbot & Language Fallbacks
The chatbot uses the `gemini-3.5-flash-lite` model (configurable via `GEMINI_MODEL`) initialized with a tailored system prompt. The chat runs over **Server-Sent Events (SSE)** via `POST /api/conversations/:id/messages`.

* **Language Preferences**: Users can toggle between **Auto**, **English**, **Kannada**, and **Hindi**.
* **Automatic Detection**: In `Auto` mode, incoming user messages are scanned using regular expressions (`/[\u0C80-\u0CFF]/` for Kannada, `/[\u0900-\u097F]/` for Hindi) to instantly determine the language script.
* **Robust Server-Side Fallbacks**: If the Gemini API key is missing or external rate limits occur, a localized fallback parser extracts key search terms (e.g., *food, itinerary, Chamundi, palace, emergency*) to return beautifully styled offline responses in the corresponding user language.

### 2. Live Tool Integrations
The Gemini SDK is loaded with function declarations for real-time external checks:
* **getWeather**: Fetches current weather. The server performs geocoding on the location name via Open-Meteo, extracts latitude/longitude, and retrieves wind speed, temperature, and condition interpretations.
* **getTime**: Automatically retrieves local time using geocoding timezone lookups.

### 3. Database Schema & Migration Status
The production database uses **PostgreSQL hosted on Neon**:
* **Active Runtime Adapter**: `backend/db.ts` re-exports `dbPg` from `backend/db.pg.ts`, connected to Neon using `DATABASE_URL`.
* **Canonical PostgreSQL Schemas**: Defined in `shared/schema.ts` (re-exporting `shared/schema.pg.ts` and `shared/models/chat.ts`).
* **PostgreSQL Tables**:
  - `tourist_spots`: ID (identity), name, description, location, imageUrl, visitingHours, ticketPrice.
  - `restaurants`: ID (identity), name, cuisine, priceRange, rating, isVegetarian, location, imageUrl, dietaryClassification, category, neighbourhood, isVeganFriendly, isJainFriendly, openingHours, menuUrl, description, sourceUrl, verificationStatus, verifiedAt.
  - `conversations`: ID (identity), title, createdAt (timestamptz with default `now()`).
  - `messages`: ID (identity), conversationId (foreign key cascading to `conversations.id`), role, content, createdAt (timestamptz with default `now()`).
* **Migration Records**: DDL migration SQL resides in `migrations-pg/0000_shallow_morlocks.sql`.
* **Rollback Protection**: Original SQLite schema definitions are safely preserved in `shared/schema.sqlite.ts` and `shared/models/chat.sqlite.ts`.
* **Data Migration Script**: `script/migrate-sqlite-to-postgres.ts` is a dry-run protected data-copy utility with host/database confirmation guards that safely transfers SQLite records to PostgreSQL while preserving foreign keys and resetting identity sequences.

### 4. Silk Saree Styling System
The app features a custom visual aesthetic:
* **HSL Color Tokens**: Gold (`hsl(45, 90%, 55%)`), Deep Maroon (`hsl(350, 78%, 35%)`), Saffron (`hsl(28, 90%, 60%)`), and Cream (`hsl(40, 33%, 98%)`).
* **Saree Texture Patterns**: CSS classes `.royal-page` and `.royal-panel` apply radial gradients overlaying light-opacity vector patterns (`royal-silk-pattern.svg` & `bg-pattern-mandala`).
* **Rotating Cursor**: Standard desktop mouse pointers are replaced with an animated gradient circle (`.custom-cursor`) and a blurred trailing cursor ring (`.custom-cursor-follower`).

---

## API Specifications

### Attractions API
#### 1. List Tourist Spots
* **Route**: `GET /api/spots`
* **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Mysuru Palace (Amba Vilas Palace)",
    "description": "A historical palace and royal residence...",
    "location": "Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru",
    "imageUrl": "https://upload.wikimedia.org/.../Mysore_Palace_Morning.jpg",
    "visitingHours": "10:00 AM - 5:30 PM",
    "ticketPrice": "Adults: ₹70, Children: ₹30, Foreigners: ₹200"
  }
]
```

#### 2. Get Spot Details
* **Route**: `GET /api/spots/:id`
* **Response**: `200 OK` or `404 Not Found`

---

### Dining API
#### 1. Search & Filter Restaurants
* **Route**: `GET /api/restaurants`
* **Query Parameters**:
  * `cuisine` (string, optional - e.g., `South Indian`)
  * `priceRange` (string, optional - e.g., `Budget`, `Mid-range`, `Luxury`)
  * `isVegetarian` (boolean, optional - e.g., `true`)
  * `dietaryClassification` (string, optional - `pure_veg`, `veg_and_non_veg`, `non_veg`)
  * `isVeganFriendly` (boolean, optional - `true`)
  * `isJainFriendly` (boolean, optional - `true`)
  * `category` (string, optional - `restaurant`, `cafe`, `sweet_shop`, etc.)
  * `neighbourhood` (string, optional - e.g., `Gokulam`, `Vontikoppal`)
  * `search` (string, optional - multi-field search term)
* **Response**: `200 OK`
```json
[
  {
    "id": 100,
    "name": "Vinayaka Mylari",
    "cuisine": "South Indian, Traditional",
    "priceRange": "Budget",
    "rating": 5,
    "isVegetarian": true,
    "dietaryClassification": "pure_veg",
    "category": "traditional",
    "neighbourhood": "Nazarbad",
    "isVeganFriendly": null,
    "isJainFriendly": null,
    "location": "Nazarbad Main Rd, Near Mylari Circle, Mysuru",
    "sourceUrl": "https://karnatakatourism.org/tour-item/mysore-masala-dosa/",
    "verificationStatus": "verified"
  }
]
```

---

### Chat API
#### 1. Create Conversation
* **Route**: `POST /api/conversations`
* **Body**: `{"title": "Day Trip Plan"}`
* **Response**: `201 Created`

#### 2. Send Message (Streaming)
* **Route**: `POST /api/conversations/:id/messages`
* **Body**:
```json
{
  "content": "What is the entry price for Mysuru Palace?",
  "language": "Kannada"
}
```
* **Response**: `200 OK` (Server-Sent Events)
```text
data: {"content": "ನಮಸ್ಕಾರ"}
data: {"content": ", ಮೈಸೂರು ಅರಮನೆ ಪ್ರವೇಶ ದರ..."}
data: {"done": true}
```

#### 3. Health Endpoint
* **Route**: `GET /api/health`
* **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "NammaMysuru.ai API",
  "timestamp": "2026-10-24T10:00:00.000Z"
}
```

---

## Local Setup & Configuration

### Prerequisites
- [Node.js](https://nodejs.org/) `v20.x` or higher (Active LTS recommended)
- [npm](https://www.npmjs.com/) `v10.x` or higher
- A PostgreSQL database instance (or a free [Neon](https://neon.tech/) PostgreSQL project)

### 1. Installation
Clone the repository and install dependencies cleanly:
```bash
git clone https://github.com/dickenbagrecha/NammaMysuru.ai.git
cd NammaMysuru.ai
npm ci
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Port (Default: 5000)
PORT=5000

# Google Gemini API key (Required for AI Chat & Voice)
# Get a free key at: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Database Configuration (PostgreSQL / Neon)
DATABASE_URL=postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require
# DATABASE_URL_DIRECT=postgresql://user:password@ep-host-direct.region.aws.neon.tech/neondb?sslmode=require

# CORS Allowed Origins (Comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

> [!WARNING]
> Keep `GEMINI_API_KEY` and `DATABASE_URL` strictly server-side. Never commit `.env` or prefix sensitive backend credentials with `VITE_`.

### 3. Database Schema Verification
For managed PostgreSQL with Drizzle:
```bash
# Push PostgreSQL schema changes using direct connection if needed:
npx drizzle-kit push --config=drizzle.pg.config.ts
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Production Deployment Guide

### A. Backend on Render
1. Create a **Web Service** on [Render](https://render.com/) pointing to your repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Node Version**: `20.x`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables in Render:
   - `DATABASE_URL`: Your Neon PostgreSQL pooled connection string
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `CORS_ORIGIN`: `https://nammamysuruai.vercel.app`
   - `NODE_ENV`: `production`

### B. Frontend on Vercel
1. Import the repository into [Vercel](https://vercel.com/).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `dist/public`
3. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL`: `https://nammamysuru-ai.onrender.com`
4. The repository's [`vercel.json`](file:///c:/DICKEN-BAGRECHA/Local%20Disk%20%28D%29/Projects/NammaMysuru.ai-main/vercel.json) automatically directs all SPA routes to `/index.html`.

---

## CLI Script Registry

| Script Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Express backend with Vite HMR middleware for full-stack local development |
| `npm run build` | Compiles frontend via Vite (`dist/public`) and bundles backend via esbuild (`dist/index.cjs`) |
| `npm run build:frontend` | Compiles only the Vite React client into `dist/public` |
| `npm run start` | Launches the compiled production server (`dist/index.cjs`) |
| `npm run check` | Runs TypeScript Compiler (`tsc`) diagnostic validation |

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with 👑 for **Namma Mysuru** by **Dicken Bagrecha**

`React 18` • `TypeScript` • `Express 5` • `PostgreSQL (Neon)` • `Drizzle ORM` • `Gemini 3.5` • `Tailwind CSS`

</div>
