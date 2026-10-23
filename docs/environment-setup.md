# Environment Setup & Secrets Guide: NammaMysuru.ai

This document outlines environment variables, requirements, and local setup steps for developers and operators.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (Active LTS recommended; tested with Node v24).
- **npm**: `v10.x` or higher.
- **Git**: Installed and configured.

---

## 2. Environment Variables Overview

| Variable | Scope | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Backend | Optional | `5000` | Port on which Express server listens |
| `GEMINI_API_KEY` | Backend | **Yes** (for AI features) | None | Google AI Studio API key for Gemini models |
| `GEMINI_MODEL` | Backend | Optional | `gemini-2.5-flash-lite` | Target Gemini model name |
| `CORS_ORIGIN` | Backend | Optional | `*` | Allowed origin for frontend requests |
| `VITE_API_BASE_URL` | Frontend | Optional | `""` (relative `/api`) | Base URL pointing to deployed backend API |

> [!WARNING]
> Never commit `.env` or `.env.local` files to Git. Keep `GEMINI_API_KEY` private on the server. Do not prefix server secrets with `VITE_`.

---

## 3. Local Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dickenbagrecha/NammaMysuru.ai.git
   cd NammaMysuru.ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Copy sample environment configuration
   cp .env.example .env
   ```
   Open `.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key
   ```

4. **Initialize Database**:
   ```bash
   npm run db:push
   ```
   This creates and syncs the schema with local `sqlite.db`.

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5000](http://localhost:5000) in your browser.
