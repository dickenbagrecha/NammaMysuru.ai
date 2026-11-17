# 42. DESIGN 1 — LIGHT THEME IMPLEMENTATION AUDIT
**NammaMysuru.ai — Royal Heritage Light Mode Architecture**
*Audit Date: November 18, 2026*
*Reference Screen: Stitch `af5e9a062c264664b8fd0636d93fe764` (Design 1)*

---

## 1. Architectural Overview

Design 1 establishes the daytime royal aesthetic for NammaMysuru.ai, drawing inspiration from the ivory courtyards of the Ambavilas Palace, traditional Mysore silk textiles, and antique Kannada manuscripts.

The implementation was engineered cleanly within the single React codebase, driven by Tailwind CSS design tokens and synchronized through `useAppSettings()`.

```mermaid
graph TD
    A[AppSettingsProvider] -->|theme = 'light'| B[Document Root: class 'light']
    B --> C[Header Component]
    B --> D[Chat Component]
    C --> C1[Emerald Cultural Notice Ticker]
    C --> C2[Wadiyar Crest & Cinzel Brand]
    C --> C3[1-Click Theme Toggle Button]
    D --> D1[Collapsible History Sidebar: w-0 default]
    D --> D2[Unified Master Card: bg-white/85 shadow-royal]
    D2 --> D2a[Upper Scrollable Conversation Stream]
    D2 --> D2b[Docked Bottom Question Composer]
    D2a --> D3[Assistant Concierge Bubble: bg-[#FAF6EE]]
    D2a --> D4[User Message Bubble: bg-maroon text-white]
    D2a --> D5[Referenced Places Carousel with Spot Images]
```

---

## 2. Component Implementation Details

### 2.1 Live Cultural Notice Ticker (`Header.tsx`)
In Design 1, the top banner renders as a regal emerald green notice bar reflecting official cultural advisories:
- **Background:** `bg-[#183B2B]` (Deep Forest Emerald)
- **Border:** `border-b border-[#C59B27]/40` (Mysore Gold accent)
- **Typography:** `text-[11px] sm:text-xs text-[#F4EFE6]` with amber live broadcast dot
- **Copy:** `"LIVE CULTURAL NOTICE: Chamundi Hill Temple Darshan 07:30 - 21:00 • Palace Illumination Sunday 19:00 - 20:00 • Dasara Exhibition Open"`

### 2.2 Brand Identity & 1-Click Theme Switcher (`Header.tsx`)
- **Royal Crest:** Dual Gandaberunda crest rendering with `#C59B27` gold stroke.
- **Brand Typography:** `"NAMMA MYSURU"` in `font-royal font-bold text-maroon text-lg tracking-wider`.
- **Sub-tag:** `"ROYAL HERITAGE & CULTURAL CONCIERGE • ESTD WADIYAR ERA"`.
- **Direct 1-Click Toggle:** An accessible pill button in the header nav bar:
  ```tsx
  <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-parchment-200 border border-[#DFD6C6] text-slate-700 hover:text-maroon"
  >
    <Moon className="w-3.5 h-3.5 text-maroon" />
    <span>Dark Mode</span>
  </button>
  ```

### 2.3 Desktop Collapsible History Sidebar (`Chat.tsx`)
Per product requirements, the conversation history sidebar starts **collapsed by default** on desktop, maximizing reading and workspace comfort:
- **State Initialization:**
  ```tsx
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_SIDEBAR_KEY);
    return stored === "true"; // Defaults to false (collapsed)
  });
  ```
- **Desktop Transition:**
  ```tsx
  <aside className={cn(
    "hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-20",
    isDesktopSidebarOpen ? "w-72 lg:w-80 opacity-100" : "w-0 opacity-0 border-r-0 pointer-events-none"
  )}>
  ```
- **Mobile Slide-Over:** Uses shadcn/ui `Sheet` drawer with `w-[85%] max-w-[320px]`.
- **Sidebar Canvas:** `bg-[#F4EFE6]` with active conversation indicator featuring a vertical `#5E0F2B` maroon pill.

### 2.4 Single Unified Master Workspace (`Chat.tsx`)
Instead of visually fragmented boxes, the conversation area is constructed as **one cohesive master card**:
- **Container Styling:**
  ```tsx
  <section className="flex-1 rounded-3xl flex flex-col overflow-hidden relative transition-colors duration-300 bg-white/85 border border-[#E8DFC9] shadow-royal backdrop-blur-md">
  ```
- **Scrollable Message Region:**
  ```tsx
  <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6 space-y-6" ref={messagesContainerRef}>
  ```
- **Docked Bottom Composer:**
  ```tsx
  <footer className="shrink-0 border-t border-[#EAE2D2] p-3 sm:p-4 backdrop-blur-md bg-white/70">
  ```

### 2.5 Message Bubbles & Spot Reference Cards
- **Assistant Message:** Wrapped in `#FAF6EE` ivory parchment container with a gold verified crest badge, rounded-2xl geometry, and typing cursor:
  ```css
  .typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1.15em;
    vertical-align: text-bottom;
    margin-left: 2px;
    animation: royal-pulse-light 0.9s infinite ease-in-out;
  }
  ```
- **User Message:** Deep Mysore maroon (`#5E0F2B`) with crisp white typography, right-aligned with rounded-2xl geometry.
- **Referenced Places Horizontal Carousel:** Displays spot cards with genuine local imagery (`/images/stitch/mysore_palace.jpg`, `/images/stitch/vinayaka_mylari.jpg`), star ratings, entry fees, and "Explore Heritage" dialog trigger.

### 2.6 Welcome State & Royal Chips
When no messages are present, the concierge greeting introduces the visitor to Mysore:
- **Title:** `"Wadiyar Heritage Concierge"` in `font-royal font-bold text-maroon text-2xl`.
- **Quick Action Chips:**
  1. `👑 Royal day plan`: "Plan a one-day heritage tour of Mysore Palace & Chamundi Hill"
  2. `🏛️ Palace route`: "What are the Mysore Palace illumination timings and ticket price?"
  3. `🍛 Mysuru feast`: "Where can I get authentic Mysore Pak and Mylari Butter Dosa?"
  4. `📷 Photo moments`: "Best sunset photography spots near KRS Dam and Chamundi Hill"
  5. `🛡️ Safe travel`: "What are the emergency tourist helpline numbers in Mysuru?"

---

## 3. Visual Verification Artefacts

- **Desktop Collapsed (Default):** `CHATBOT_AUDIT/light_theme_desktop.png` (1536 × 864)
- **Desktop Expanded Sidebar:** `CHATBOT_AUDIT/light_theme_expanded.png` (1536 × 864)
- **Active Streaming Conversation:** `CHATBOT_AUDIT/light_theme_conversation.png` (1536 × 864)
- **Mobile Viewport:** `CHATBOT_AUDIT/mobile_light.png` (390 × 844)

---

## 4. Verification Verdict

Design 1 (Light Mode) fully matches Stitch Screen `af5e9a062c264664b8fd0636d93fe764` in typography, color ratios, conversational layout, and responsiveness.

**Status:** **PASSED & FULLY INTEGRATED**
