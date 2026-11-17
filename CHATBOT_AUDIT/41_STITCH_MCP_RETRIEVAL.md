# 41. GOOGLE STITCH MCP DESIGN RETRIEVAL AUDIT
**NammaMysuru.ai — Royal Heritage Chat Interface Redesign**
*Audit Date: November 18, 2026*
*Platform: Google Stitch MCP Integration*

---

## 1. Executive Summary & MCP Discovery

To elevate NammaMysuru.ai to presentation and technical interview standards, the user requested retrieving approved design assets directly from Google Stitch via the connected Model Context Protocol (MCP) server. 

Rather than relying on manual screenshot exports, mockups, or improvisations, the design system was inspected, queried, and retrieved directly using the `stitch` MCP toolset.

### 1.1 Available MCP Tool Suite Inspection

The active Stitch MCP server registered 14 specialized design operations:
1. `list_projects`: Queries active design workspaces and projects accessible to the authenticated context.
2. `get_project`: Inspects project-level metadata, creator details, and update timestamps.
3. `list_screens`: Retrieves the roster of designed screens, canvas sizes, and screen identifiers.
4. `get_screen`: Fetches screen structure, layout nodes, download URLs, and snapshot previews.
5. `download_file`: Streams raw HTML code, CSS definitions, and full-resolution screenshot image binaries.
6. `update_screen` & `edit_screens`: Programmatic design adjustments.
7. `generate_screen_from_text`: Text-to-screen AI design generation.
8. `generate_variants`: Variant exploration.
9. `upload_design_md` & `create_design_system_from_design_md`: Design markdown bindings.
10. `list_design_systems`, `create_design_system`, `update_design_system`, `apply_design_system`: Design tokens and system synchronization.

---

## 2. Project & Screen Resolution

### 2.1 Project Discovery
Calling `list_projects` identified the target workspace:
- **Project ID:** `projects/3239800335956115781`
- **Project Title:** `NammaMysuru Chat Interface Redesign`
- **Created / Modified:** 2026-11-17T20:00:23Z
- **Owner / Context:** Antigravity UI / Google Stitch Design System

### 2.2 Screen Roster (`list_screens`)
Querying the screens for project `3239800335956115781` yielded three approved high-fidelity screens designed at desktop canvas `2560 × 2048`:

| Screen ID | Screen Title | Design Role | Canvas Size | Key Visual Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| `af5e9a062c264664b8fd0636d93fe764` | **NammaMysuru.ai - Redesigned ChatGPT-Style Chat Interface** | **Design 1 (Light Mode)** | 2560 × 2048 | Ivory Parchment (`#F8F4EC`), Royal Mysore Maroon (`#5E0F2B`), Gold accents (`#C59B27`), Green cultural notice bar (`#183B2B`), ChatGPT-style conversation stream, docked composer. |
| `d0ee591767bd41cdb02d546538425a75` | **NammaMysuru.ai - Royal Evening Illumination Chat Interface** | **Design 3 (Dark Mode)** | 2560 × 2048 | Deep Midnight Dusk (`#0D070B`), Royal Velvet Maroon (`#881337`/`#580A23`), Luminous Mysore Gold (`#F3C246`), Palace Incandescent bulb glow, Evening cultural ticker. |
| `15be9d089afb47e1bf83f53d510280dc` | **NammaMysuru.ai - Collapsed Sidebar & Palace Bulb Shimmer** | **Screen 2 (Sidebar State)** | 2560 × 2048 | Demonstrates the full-width conversation canvas when the left history drawer is collapsed, revealing palace bulb shimmer motifs and expanded reading view. |

---

## 3. Asset Retrieval & Local Storage

All three screens were inspected using `get_screen` to obtain file references and screenshot URLs, and then extracted using `download_file`. The raw code and high-resolution reference binaries were preserved under `CHATBOT_AUDIT/stitch_designs/`:

```
CHATBOT_AUDIT/stitch_designs/
├── design_1_light.html       (41,248 bytes) — Raw Tailwind & HTML from Stitch
├── design_1_light.png        (1,414,279 bytes) — Full 2560x2048 Reference Screenshot
├── design_3_dark.html        (44,351 bytes) — Raw Tailwind & HTML from Stitch
├── design_3_dark.png         (1,726,858 bytes) — Full 2560x2048 Reference Screenshot
├── screen_2_collapsed.html   (52,999 bytes) — Raw Tailwind & HTML from Stitch
└── screen_2_collapsed.png    (2,223,458 bytes) — Full 2560x2048 Reference Screenshot
```

### 3.1 Spot Imagery Extraction
In addition to HTML and screenshots, the referenced spot and culinary images in the Stitch design cards were retrieved and placed into `frontend/public/images/stitch/` for local asset delivery without external network latency:
- `mysore_palace.jpg` (61,643 bytes) — Ambavilas Palace facade with illumination
- `jaganmohan_palace.jpg` (72,212 bytes) — Jaganmohan Palace Art Gallery & Auditorium
- `lalitha_mahal.jpg` (58,619 bytes) — Lalitha Mahal Palace Hotel terrace
- `dariya_daulat.jpg` (77,193 bytes) — Dariya Daulat Bagh (Tipu Sultan's Summer Palace)
- `vinayaka_mylari.jpg` (52,578 bytes) — Original Mylari butter dosa breakfast

---

## 4. Design Token Extraction Matrix

Analyzing `design_1_light.html` and `design_3_dark.html` revealed the exact color tokens, typography scales, elevation shadows, and border radii mandated by the Stitch design system:

### 4.1 Color Palettes

| Token | Stitch Light Mode (Design 1) | Stitch Dark Mode (Design 3) | Purpose / UI Application |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F8F4EC` / `#F4EFE6` (Ivory Parchment) | `#0D070B` / `#140A10` (Midnight Dusk) | Page canvas background with radial heritage pattern |
| **Primary Brand Accent** | `#5E0F2B` (Royal Mysore Maroon) | `#881337` / `#580A23` (Velvet Maroon) | Header brand crest, user message bubbles, active badges |
| **Secondary Accent** | `#C59B27` (Mysore Silk Gold) | `#F3C246` / `#FFDC73` (Illuminated Gold) | Crest accents, prompt badges, verified shields, shimmer glints |
| **Master Container** | `#FFFFFF` with `rgba(94,15,43,0.06)` shadow | `#180D15` / `#21141C` with Gold Glow | Single unified workspace holding chat stream & docked composer |
| **Assistant Message Card** | `#FAF6EE` (Warm Cream Parchment) | `#21141C` (Deep Velvet Dusk) | Concierge response bubble with Chamundeshwari crest |
| **User Message Card** | `#5E0F2B` (Royal Maroon) | `#351220` (Dark Velvet Burgundy) | User question container with gold timestamp text |
| **Notice Ticker** | `#183B2B` (Deep Emerald Green) | `#2A1608` with `#F3C246` border | Live cultural announcement ticker at top of header |
| **Sidebar Canvas** | `#F3ECE0` / `#ECE4D4` | `#11080F` / `#160B14` | Collapsible conversation history drawer |
| **Composer Canvas** | `#FFFFFF` with `#DFD6C6` border | `#1C1019` with `#452433` border | Docked bottom question composer inside master card |

### 4.2 Typography & Elevation Tokens
- **Display Font:** `Cinzel`, serif (Weights: 600, 700, 800) — Used for Wadiyar crests, royal titles, and section headers.
- **Body Font:** `Plus Jakarta Sans`, sans-serif (Weights: 400, 500, 600, 700) — Used for fluent chat prose, buttons, and captions.
- **Elevation Light:** `0 20px 45px -12px rgba(94, 15, 43, 0.08), 0 0 0 1px rgba(197, 155, 39, 0.18)`
- **Elevation Dark:** `0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(243, 194, 70, 0.12), inset 0 1px 0 rgba(243, 194, 70, 0.2)`
- **Palace Bulb Shimmer:** Multi-stop keyframe animation mimicking the warm incandescent illumination of Mysore Palace's 97,000 light bulbs.

---

## 5. Verification Verdict

- **MCP Project Verified:** `projects/3239800335956115781`
- **Screens Successfully Retrieved:** 3 of 3 screens
- **Image Assets Extracted:** 5 spot images + 3 reference snapshots
- **Status:** **COMPLETE & FULLY VERIFIED**
