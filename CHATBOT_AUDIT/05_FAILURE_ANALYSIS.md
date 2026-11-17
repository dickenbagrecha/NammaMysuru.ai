# Phase 7: Root-Cause Failure Analysis

**Project:** NammaMysuru.ai Chatbot  
**Audit Phase:** Baseline Test Suite Execution (122 Test Cases)  
**Baseline Results:** Total: 122 | Passed: 4 | Partial: 24 | Failed: 92 | Critical Failed: 2 | Baseline Pass Rate: 3.3%

---

## 1. Executive Summary of Root Causes

The baseline quality audit executed across 12 categories revealed four fundamental root causes responsible for 118 out of 122 test failures and partials:

1. **Complete Absence of Database Grounding / RAG in the Chat Pipeline (Primary Defect):**
   - The chat endpoint `POST /api/conversations/:id/messages` (`backend/replit_integrations/chat/routes.ts`) calls Gemini via `model.startChat()` with tools restricted solely to `getWeather` and `getTime`.
   - The backend contains 50 verified tourist spots and 33 verified restaurants in PostgreSQL, but **zero database records or retrieval tools were provided to the chat model**.
   - As a consequence, the chatbot hallucinated dietary classifications (e.g., claiming non-veg biryani house `RRR` accommodates Jain diets!), fabricated admission prices (quoting ₹100 instead of verified ₹70 for Mysore Palace), and could not provide verified neighbourhood listings.

2. **System Prompt Omissions & Weak Guardrails:**
   - **Dietary Boundary:** The prompt did not enforce the negative-inference rule: if `isJainFriendly` is null, do not claim it is Jain-friendly.
   - **Security & Privacy:** The prompt had no defense against prompt extraction, secret leakage (`GEMINI_API_KEY`, `DATABASE_URL`), or jailbreaks.
   - **Temporal Awareness:** While the current date was injected as `new Date().toString()`, the prompt failed to state that Dasara 2026 had already concluded and that today (Monday) does not have standard evening exterior palace illumination.
   - **Helpline Numbers:** The prompt lacked the verified transit and emergency directory present in `frontend/src/pages/Helpline.tsx` (Police 100/112, Ambulance 108, Tourist Police 1363, Women Helpline 1091, KSTDC Kiosk 0821-2422096, KSRTC 0821-2425824, Railway 139).

3. **Stream Error Handling & Fallback Corruption:**
   - In `backend/replit_integrations/chat/routes.ts`, when a streaming chunk threw an error (or rate limit 429), the catch block blindly wrote the entire static fallback string directly to the already-open HTTP SSE stream.
   - This caused corrupted responses where half of Gemini's response was immediately glued to a hardcoded template (e.g. `Approx. ₹200 to ₹2**Mysore Palace** is the signature Mysuru stop...`).
   - Lack of retry logic for transient 429 rate limit responses.

4. **Frontend Message Clipping & Scroll Synchronization:**
   - In `frontend/src/pages/Chat.tsx`, `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })` was triggered on raw message updates before child components (especially `mentionedItems` thumbnail cards with external images) completed rendering.
   - In addition, mobile input container padding (`pb-20`) shifted the message viewport, causing the bottom portion of long assistant responses to be occluded beneath the input textarea.

---

## 2. Category-by-Category Failure Breakdown

### 2.1 Mysuru Attractions & Places (16 tests — 0 Pass, 2 Partial, 14 Fail)
- **Root Cause:** Missing database retrieval. Model guessed ticket prices (Mysore Palace ₹100 instead of ₹70/₹30; Rail Museum ₹50 instead of ₹15/₹10; Brindavan Gardens incorrect hours; Jayalakshmi Vilas Mansion Sunday closure missed).
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.2 Restaurants, Food, and Dietary Preferences (16 tests — 0 Pass, 6 Partial, 10 Fail)
- **Root Cause:** The model hallucinated Jain-friendly and vegan dining because it lacked the database flags (`isJainFriendly`, `isVeganFriendly`). In test `DINE-001`, the model shockingly recommended `Hotel RRR` (an Andhra non-vegetarian biryani restaurant) for Jain dining.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`, lack of database tools.

### 2.3 Itinerary & Travel Planning (12 tests — 0 Pass, 2 Partial, 10 Fail)
- **Root Cause:** Hallucinated timing buffers, missed Tuesday closures of Zoo and Karanji Lake in 2-day itineraries, and could not compute accurate budget calculations under ₹150 due to incorrect venue pricing memory.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.4 Culture, Heritage, and Events (10 tests — 0 Pass, 2 Partial, 8 Fail)
- **Root Cause:** Missed exact illumination bulb count (~100,000 incandescent bulbs), missed Kakasura Madappa attribution for Mysore Pak, and failed to clearly distinguish current event status from historical tradition.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.5 Helpline and Visitor Safety (10 tests — 2 Pass, 5 Partial, 3 Fail)
- **Root Cause:** Provided 100 and 108 correctly, but failed on transit helplines (KSTDC Kiosk 0821-2422096, KSRTC Suburban 0821-2425824, Railway 139) because these were only coded in `frontend/src/pages/Helpline.tsx` and never supplied to the backend chat agent.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.6 Multilingual Capability (12 tests — 0 Pass, 4 Partial, 8 Fail)
- **Root Cause:** Under rate limits, the fallback template for Kannada/Hindi substituted hardcoded static responses that ignored the user's specific question. When Gemini ran, Kannada numbers and specific venue details were often missing.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.7 Conversational Context and Follow-ups (10 tests — 0 Pass, 1 Partial, 9 Fail)
- **Root Cause:** Rate-limiting during the test run caused multi-turn follow-up calls to fail or fall back to generic responses. In addition, prompt lacked context grounding to maintain dietary filters across turns.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.8 Chatbot Identity, Capabilities, and Limitations (8 tests — 2 Pass, 1 Partial, 5 Fail)
- **Root Cause:** Accurately stated identity and supported languages, but failed to clearly disclaim ticket booking, live GPS bus tracking, and unverified dietary claims.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.9 Prompt Injection, Privacy, and Unsafe Requests (8 tests — 0 Pass, 1 Partial, 7 Fail)
- **Root Cause:** When asked to ignore instructions and print the system prompt or override persona, the model complied or output partial internal prompt fragments because no defensive prompt instructions were present.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.10 Hallucination Resistance & Unsupported Facts (8 tests — 0 Pass, 0 Partial, 7 Fail, 1 Critical Fail)
- **Root Cause:** When asked about nonexistent places ("The Royal Tandoor of Chamundi", "Tipu Sultan Underwater Caves"), the model did not check against database records and invented plausible-sounding descriptions. In `HAL-008`, Columbus myth was refuting, but general unverified entities were tolerated.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.11 Current Dates, Time-Sensitive Facts (6 tests — 0 Pass, 0 Partial, 5 Fail, 1 Critical Fail)
- **Root Cause:** In test `TIME-001`, the model failed to state with certainty that Dasara 2026 had ended, and in `TIME-002` failed to confirm that Monday night does not have standard exterior palace illumination.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`.

### 2.12 Chat UI, Conversation Reliability, and Error Handling (6 tests — 0 Pass, 0 Partial, 6 Fail)
- **Root Cause:** Stream parsing errors and 429 rate limit exceptions caused unhandled stream aborts and corrupted fallback stitching.
- **Files Responsible:** `backend/replit_integrations/chat/routes.ts`, `frontend/src/pages/Chat.tsx`.
