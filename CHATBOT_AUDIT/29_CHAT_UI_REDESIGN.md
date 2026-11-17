# 29 — CHAT UI REDESIGN & RESPONSIVE ARCHITECTURE

**Project:** NammaMysuru.ai  
**Component:** Chatbot Frontend UI & Design System  
**Target URL:** `http://localhost:5001/chat`  
**Execution Date:** November 18, 2026  
**Auditor:** Principal Design Technologist & Frontend Architect  

---

## 1. Design Rationale & Heritage Aesthetic

The previous chatbot interface suffered from visual congestion, narrow reading columns, and a cramped input experience. The objective of this redesign was to transform the interface into a luxurious, spacious, and comfortable digital concierge that reflects the royal heritage of Mysuru while offering world-class conversational ergonomics.

### Royal Mysore Color Palette
* **Background Surface:** Warm Royal Cream / Ivory (`hsl(257, 60%, 99%)` / `#FAF8FF`) with subtle royal silk mandala watermarks.
* **Primary Royal Crimson:** Deep Mysore Maroon (`hsl(337, 100%, 21%)` / `#6C0029`) evoking the velvet canopies of the Amba Vilas Durbar Hall.
* **Secondary Sandalwood Ochre:** Mysore Sandalwood Amber (`hsl(30, 46%, 33%)` / `#7D562D` with `#C5A059` accents).
* **Typography & Ink:** Midnight Navy (`#131B30`) and warm charcoal mauve for maximum contrast and effortless legibility.

---

## 2. Key Layout & Ergonomic Transformations

### A. Full-Height 100dvh Layout Structure
* Replaced standard viewport calculations with `h-[100dvh]`, eliminating mobile browser navigation bar clipping on iOS Safari and Android Chrome.
* Root flex hierarchy:
  ```
  h-[100dvh] flex flex-col overflow-hidden
  ├── <Header /> (Global navigation)
  └── <main className="flex min-h-0 w-full flex-grow overflow-hidden">
      ├── <aside className="hidden md:flex w-72 lg:w-80 border-r ..."> (Desktop Sidebar)
      └── <div className="max-w-6xl w-full mx-auto flex flex-col ..."> (Spacious Chat Area)
  ```

### B. Spacious Assistant Message Width (88% – 94%)
* **Previous Flaw:** Assistant messages were capped at `max-w-[78%]`, squeezing long heritage itineraries and culinary guides into narrow, tall text columns with excessive line wrapping.
* **Redesigned Proportion:**
  * Assistant Messages: `max-w-[98%] sm:max-w-[94%] lg:max-w-[90%]`, allowing wide, comfortable typography (`text-base leading-relaxed`), beautifully formatted tables, and structured lists.
  * User Messages: `max-w-[85%] md:max-w-[72%]`, compact and neatly right-aligned in Royal Crimson.

### C. Top Bar & Language Selector Unification
* Shifted the language selector from the input box up into the top conversation bar.
* Displays a live pulsating `NammaMysuru.ai Online` indicator, the current conversation title, and sleek pill buttons for `Auto`, `English`, `ಕನ್ನಡ`, and `हिन्दी`.

### D. Roomy Bottom Composer Pinned at Viewport Base
* **Auto-Growing Textarea:** Upgraded from a cramped 24px single-line box to a spacious `min-h-[52px]` (expandable up to `max-h-[160px]`) multiline composer with `focus-within:ring-2 focus-within:ring-primary/20`.
* **Quick Action Pills:** Relocated above the input box into a smooth horizontal scroll strip with snap targets.
* **High-Affordance Action Controls:**
  * 44px (`h-11 w-11`) tactile buttons for Send and Speech-to-Text Microphone.
  * Visual feedback states: active recording animation, loading spinners, and hover scales.

### E. Independently Scrollable History Sidebar
* Fixed width of `w-72 lg:w-80` on desktop with its own isolated scroll area.
* Royal Mysore conversation items with active selection borders, timestamps, and delete controls on hover.
* Fully collapsible into an accessible slide-over Sheet on viewports < 768px.

---

## 3. Responsive Viewport Specifications

| Viewport Profile | Resolution | Layout Behavior & Adaptation |
| :--- | :--- | :--- |
| **Desktop (Primary)** | 1536 × 864 | Spacious 2-column layout; sidebar pinned left (`w-80`); chat occupies `max-w-6xl`; assistant bubbles span 90% width; generous 32px padding. |
| **Laptop** | 1366 × 768 | Sidebar compact (`w-72`); chat messages utilize vertical space efficiently; composer pinned with 12px bottom buffer. |
| **Tablet** | 768 × 1024 | Sidebar collapses into hamburger trigger; chat area takes full width with 24px margins; touch-friendly 44px interactive targets. |
| **Mobile** | 390 × 844 | Full-width single column; compact top status bar; bottom composer fits above virtual keyboard safe area; horizontal pill swipe. |

---

## 4. Typography & Visual Hierarchy

```
H1 / H2 Headings:   Playfair Display, font-serif, text-primary, font-bold
Body Text:          Plus Jakarta Sans / Inter, text-foreground/90, text-base, leading-relaxed
Bullet Icons:       Lucide Crown, text-secondary, flex-shrink-0 (Royal theme)
User Bubble:        bg-primary (Royal Crimson), text-white, rounded-2xl rounded-tr-sm
Concierge Bubble:   bg-white/95, border-secondary/25, rounded-2xl rounded-tl-sm, shadow-md
Toolbar:            TTS Speaker (VoiceWave animation) + One-click Markdown Copy button
```
