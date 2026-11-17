# Phase 1: Repository and Chatbot Investigation Report
**Project:** NammaMysuru.ai  
**Auditor:** Senior QA & AI Reliability Engineer  
**Date of Audit:** November 16, 2026  
**Environment:** Local Development (`http://localhost:5001`)

---

## 1. Executive Summary & Architecture Overview

NammaMysuru.ai is an intelligent tourism, culture, dining, and visitor-assistance platform designed for Mysuru (Mysore), Karnataka, India.

Through static code inspection, dependency analysis, and runtime verification of the local development server, this investigation maps out the exact system components and identifies a **critical architectural gap** in the chat pipeline.

### High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                           FRONTEND                                                 |
|  React 18 + TypeScript + Vite + Wouter + Tailwind CSS + Framer Motion + TanStack React Query       |
|                                                                                                    |
|  Pages:                                                                                            |
|  - Home (/)                - Tourist Spots (/tourist-spots)   - Restaurants (/restaurants)         |
|  - Helpline (/helpline)    - Login (/login)                   - Chatbot (/chat)                    |
|                                                                                                    |
|  Chat UI Components (frontend/src/pages/Chat.tsx):                                                 |
|  - Sidebar: Conversation list & management (New Chat, Delete Chat)                                 |
|  - Chat Area: Message history, streaming text display, markdown parser, mentioned-items carousel   |
|  - Input Area: Auto-resizing textarea, language selector, quick prompts, Web Speech TTS/STT        |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                    HTTP / SSE (Server-Sent Events)
                    POST /api/conversations/:id/messages
                                                  |
+-------------------------------------------------v--------------------------------------------------+
|                                           BACKEND                                                  |
|  Express 5 + Node.js + tsx + Drizzle ORM + @google/generative-ai                                   |
|                                                                                                    |
|  Server Entry: backend/index.ts                                                                    |
|  - Serves static assets & mounts Vite middleware                                                   |
|  - Registers REST routes & Chat routes                                                             |
|                                                                                                    |
|  Chat Pipeline (backend/replit_integrations/chat/routes.ts):                                       |
|  - Language Resolution: Auto-detects Kannada (\u0C80-\u0CFF) or Hindi (\u0900-\u097F), or manual   |
|  - Conversation Persistence: Stores user & assistant messages in PostgreSQL                        |
|  - Gemini Client: Initializes GoogleGenerativeAI with model `gemini-3.5-flash-lite`                |
|  - Model Tools: `getWeather` and `getTime` (from backend/replit_integrations/weather.ts)            |
|                                                                                                    |
|  *** CRITICAL GAP DISCOVERED ***                                                                   |
|  The chatbot DOES NOT query the database! It has ZERO tools or RAG grounding context to query     |
|  the `tourist_spots` or `restaurants` tables. Responses rely entirely on parametric knowledge     |
|  of Gemini and hardcoded fallback templates.                                                       |
+---------------------------------------+------------------+-----------------------------------------+
                                        |                  |
                          SQL / Drizzle |                  | Function Calling / Prompts
                                        |                  |
+---------------------------------------v--------+  +------v-----------------------------------------+
|                DATABASE                        |  |             EXTERNAL AI API                    |
|  Neon Serverless PostgreSQL                    |  |  Google Gemini API (`gemini-3.5-flash-lite`)   |
|                                                |  |                                                |
|  Tables:                                       |  |  - Streaming completions                       |
|  - `tourist_spots` (50 curated records)        |  |  - Weather & Time tools                        |
|  - `restaurants` (33 curated records)          |  |  - System Instruction persona                  |
|  - `conversations` (chat session headers)      |  +------------------------------------------------+
|  - `messages` (chat messages history)          |
+------------------------------------------------+
```

---

## 2. Component Analysis

### 2.1 Frontend Framework & Chat UI
- **Framework:** React 18.3.1 with TypeScript, bundled using Vite (`vite.config.ts`).
- **Routing:** Wouter (`frontend/src/App.tsx`). Routes include `/`, `/tourist-spots`, `/restaurants`, `/chat`, `/helpline`, `/login`.
- **Chat Page:** `frontend/src/pages/Chat.tsx` (1,271 lines).
  - **State Management:** TanStack React Query (`use-chat.ts`) handles fetching conversations (`/api/conversations`), individual messages (`/api/conversations/:id`), creating and deleting conversations.
  - **Streaming:** `useSendMessage` uses `fetch` with `ReadableStream` to receive SSE `data: {"content": "..."}` chunks in real time.
  - **Markdown Rendering:** Custom `renderMarkdown` and `renderInlineMarkdown` parses headers (`#`, `##`), bullet lists (`- `, `* `), numbered lists (`1. `), and bold text (`**`). It replaces bullets with royal `Crown` icons.
  - **Mentioned Items Carousel:** `findMentionedItems` scans the response text against loaded `spots` and `restaurants` and displays interactive card preview thumbnails below the message bubble.
  - **Voice Functionality:**
    - Speech-to-Text: Implemented via browser `window.SpeechRecognition` / `webkitSpeechRecognition`, localized to `en-IN`, `kn-IN`, or `hi-IN`.
    - Text-to-Speech: Implemented via browser `window.speechSynthesis` / `SpeechSynthesisUtterance`. Cleans markdown markers prior to speech.
  - **Identified UI Issue (from user prompt reference):**
    - The chat container has `overflow-y-auto` on the message container and an auto-scroll effect `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`.
    - When streaming responses or rendering mentioned items carousels with delayed image rendering, the scroll target (`messagesEndRef`) can be positioned above the newly expanded items, or cause jumpy/clipped rendering. Furthermore, mobile padding `pb-20` vs desktop `md:pb-4` causes container layout shifts.

### 2.2 Backend Framework & API Endpoints
- **Framework:** Express 5.0.1 on Node.js (v20+).
- **Chat Endpoints (`backend/replit_integrations/chat/routes.ts`):**
  - `GET /api/conversations`: Returns all chat conversations ordered by `createdAt DESC`.
  - `POST /api/conversations`: Creates a new conversation with title.
  - `GET /api/conversations/:id`: Fetches conversation details and all associated messages ordered by `createdAt ASC`.
  - `DELETE /api/conversations/:id`: Deletes conversation and cascades message deletion.
  - `POST /api/conversations/:id/messages`: Appends user message, initiates Gemini streaming chat session, executes function calls (`getWeather`, `getTime`), streams SSE chunks to client, and persists final assistant message.
- **Data Endpoints (`backend/routes.ts`):**
  - `GET /api/tourist-spots`: Returns list of all tourist spots.
  - `GET /api/tourist-spots/:id`: Returns single spot by ID.
  - `GET /api/restaurants`: Accepts filters (`cuisine`, `priceRange`, `isVegetarian`, `dietaryClassification`, `category`, `neighbourhood`, `isVeganFriendly`, `isJainFriendly`, `search`, `minRating`).
  - `GET /api/restaurants/:id`: Returns single restaurant by ID.
  - `GET /api/health`: Health status endpoint.

### 2.3 Gemini AI Integration & Model Configuration
- **SDK:** `@google/generative-ai` (`^0.24.1`).
- **Model Client:** `backend/replit_integrations/gemini_client.ts`.
- **Model Name:** `gemini-3.5-flash-lite` (configured via `GEMINI_MODEL` env var).
- **Generation Parameters:** `temperature: 0.7`, `topP: 0.95`.
- **System Instruction:** In `chat/routes.ts`, persona is defined as *"NammaMysuru.ai, a royal Mysuru concierge and highly helpful AI guide to Mysuru (Mysore), Karnataka, India"*. Contains tone instructions, royal touch suggestions, and factual guardrail (*"Mysuru Palace is also called Amba Vilas Palace. It is not Chamundeshwari Temple. Chamundeshwari Temple is on Chamundi Hill"*).
- **Model Tools:** Function declarations for `getWeather` and `getTime`.

### 2.4 Database Configuration & Data Models
- **Database Provider:** Managed Neon PostgreSQL (`postgresql://...ap-southeast-1.aws.neon.tech/neondb`).
- **ORM:** Drizzle ORM (`drizzle-orm/node-postgres`).
- **Schema (`shared/schema.pg.ts`):**
  1. `tourist_spots`: `id`, `name`, `description`, `location`, `imageUrl`, `visitingHours`, `ticketPrice`.
  2. `restaurants`: `id`, `name`, `cuisine`, `priceRange`, `rating`, `isVegetarian`, `location`, `imageUrl`, `dietaryClassification`, `category`, `neighbourhood`, `isVeganFriendly`, `isJainFriendly`, `openingHours`, `menuUrl`, `description`, `sourceUrl`, `verificationStatus`, `verifiedAt`.
  3. `conversations`: `id`, `title`, `createdAt`.
  4. `messages`: `id`, `conversationId`, `role`, `content`, `createdAt`.
- **Database Seeding (`backend/routes.ts`):**
  - Seeds **50 tourist spots** and **33 restaurants** on server startup if empty.

### 2.5 Retrieval & Recommendation Gap Analysis
| Capability | Expected for Verified Concierge | Actually Implemented in `chat/routes.ts` |
|---|---|---|
| Direct Gemini Generation | Yes | Yes (Streaming via `model.startChat`) |
| Database-backed Retrieval (RAG) | Crucial for project data | **NONE** — zero SQL queries or storage calls in chat routes |
| Restaurant Filter Verification | Required (Jain, Vegan, Pure Veg) | **NONE** — model guesses or hallucinates recommendations |
| Tourist Spot Hours & Fees Lookup | Required from DB | **NONE** — model relies on generic pretrained knowledge |
| External Tools | Weather and Time | Yes (`getWeather`, `getTime` implemented) |
| Conversation Memory | Multi-turn history | Yes — loaded from DB and supplied to `model.startChat({ history })` |
| Fallback System | Graceful degradation | Yes — hardcoded static templates in English, Kannada, Hindi |

---

## 3. Investigation Findings & Risk Areas

1. **Dietary Hallucination Vulnerability:** Because the chat handler passes no restaurant data or query tools to Gemini, queries asking for "Jain-friendly" or "vegan" restaurants will rely on ungrounded model output. In our database, **only 1 restaurant (`Jalpaan`) is confirmed `isJainFriendly=true`**, and **only 3 are `isVeganFriendly=true` (`Jalpaan`, `Depth N Green`, `Minimal Coffee Roasters`)**. Without database grounding, the chatbot is guaranteed to hallucinate dietary suitability.
2. **Attraction Accuracy:** The database contains exact visiting hours and ticket prices for 50 spots. Without grounding, Gemini may provide outdated or approximate numbers.
3. **Emergency Numbers:** The system prompt does not specify the official verified helplines present on the `/helpline` page (Police 100/112, Ambulance 108, Tourist Police 1363, Women Helpline 1091, KSTDC Kiosk 0821-2422096). The fallback template contains 100, 108, and 1363, but the primary prompt lacks verified emergency and transit contacts.
4. **Safety & Prompt Injection:** The system prompt lacks explicit instructions to refuse attempts to extract API keys, database connection strings, or system prompt instructions.
5. **Stale Events / Real-Time Awareness:** The model prompt injects `new Date().toString()`, which gives current system time, but the model has no event calendar tool and must explicitly communicate uncertainty regarding seasonal events (e.g. Dasara dates).
