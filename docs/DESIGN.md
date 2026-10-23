# Design System Specification: Namma Mysuru UI Redesign

**Project ID**: `1358385072020638077`  
**Project Title**: Namma Mysuru UI Redesign  
**Design Name**: Garden City Modern / Royal Heritage & Cultural  
**Origin**: Stitch Multi-Screen Generation  
**Date Extracted**: October 24, 2026  

---

## 1. Overview & Aesthetic Vision

The design system synthesizes Mysore's **princely Wodeyar heritage** with modern **tactile glassmorphism** and structured cultural storytelling. It honors the city's golden age of Indo-Saracenic architecture, sandalwood craft, Mysore silk weaving, and historic royal gastronomy.

Key principles:
- **Atmospheric Warmth**: Deep regal crimson/maroon primary (`#6c0029`), warm sandalwood ochre secondary (`#7d562d`), rich garden emerald tertiary (`#0a3b22`), and warm cream surface base (`#faf8ff`).
- **Tactile Glassmorphism**: Translucent frosted panels (`bg-surface/90 backdrop-blur-xl`), soft tinted drop shadows, and subtle inner glow outlines (`outline-variant: #ddbfc3`).
- **Typographic Dignity**: High-contrast serif headlines in **Playfair Display** paired with geometric clarity in **Plus Jakarta Sans** for body and structured labels.
- **Micro-Badging & Live Notice**: Cultural status indicators, pulse countdown widgets, and GI authenticity badges.

---

## 2. Color Palette & Token Mapping

### A. Semantic Color Palette

| Token Name | Hex Code | Role in UI |
| :--- | :--- | :--- |
| `primary` | `#6c0029` | Deep Royal Crimson / Maroon. Core branding, main buttons, prominent titles. |
| `primary-container` | `#8b1e3f` | Rich Burgundy Container. Active navigation pills, prominent action bars. |
| `on-primary` | `#ffffff` | High-contrast white text on primary surfaces. |
| `on-primary-container`| `#ff9db0` | Light pink tint for highlighted sub-text on dark burgundy. |
| `secondary` | `#7d562d` | Mysore Sandalwood Ochre. Category subtitles, metadata, ornamental icons. |
| `secondary-container`| `#ffca98` | Warm Amber Amber container for highlighted badges. |
| `on-secondary` | `#ffffff` | White text on secondary buttons. |
| `on-secondary-container` | `#7a532a` | Deep wood brown text on amber containers. |
| `secondary-fixed` | `#ffdcbd` | Pale Sandalwood pill fill. Live notices, countdown numbers. |
| `on-secondary-fixed`| `#2c1600` | Deepest sandalwood brown text on fixed badges. |
| `tertiary` | `#0a3b22` | Deep Cubbon Park / Chamundi Forest Green. Sacred icons, nature trails. |
| `tertiary-container` | `#255238` | Deep forest container for badges and special highlight cards. |
| `on-tertiary` | `#ffffff` | High contrast white on tertiary elements. |
| `tertiary-fixed` | `#bceecb` | Fresh garden mint green for status badges (e.g. "Open Daily", "Pleasant"). |
| `on-tertiary-fixed` | `#002110` | Dark pine green text on mint pills. |
| `background` | `#faf8ff` | Ultra-soft lilac/warm alabaster canvas background. |
| `surface` | `#faf8ff` | Card surfaces and top headers. |
| `surface-container-lowest` | `#ffffff` | Pure white elevated cards, search boxes, and dialogue panels. |
| `surface-container-low` | `#f2f3ff` | Soft tinted input fields, breadcrumb bars, and subtle sections. |
| `surface-container` | `#eaedff` | Interactive item hover states and neutral pill backgrounds. |
| `surface-container-high` | `#e2e7ff` | Accent borders and emphasized panel dividers. |
| `surface-container-highest` | `#dae2ff` | Deepest surface neutral for bento container backings. |
| `on-surface` | `#131b30` | Midnight Navy / Deep slate. Primary reading text for high legibility. |
| `on-surface-variant` | `#564145` | Warm charcoal mauve. Secondary body text, descriptions, timestamps. |
| `outline` | `#897174` | Subtle borders for inputs and neutral cards. |
| `outline-variant` | `#ddbfc3` | Low-contrast divider lines and dot separators. |
| `inverse-surface` | `#283046` | Deep navy-indigo for countdown clock cards and dark overlays. |
| `inverse-on-surface` | `#eef0ff` | Crisp silver-white text on dark cards. |

---

## 3. Typography Hierarchy

### Fonts
1. **Headlines & Display**: `Playfair Display`, serif.
2. **Body, Subtitles & Metadata**: `Plus Jakarta Sans`, sans-serif.

### Type Scale

| Style Name | Font Family | Size / Line Height | Weight | Tracking / Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Playfair Display | 56px / 64px | 700 (Bold) | -0.02em |
| `display-lg-mobile` | Playfair Display | 36px / 44px | 700 (Bold) | -0.01em |
| `headline-xl` | Playfair Display | 40px / 48px | 600 (Semi-Bold) | -0.015em |
| `headline-xl-mobile` | Playfair Display | 28px / 36px | 600 (Semi-Bold) | 0em |
| `headline-lg` | Playfair Display | 32px / 40px | 600 (Semi-Bold) | Normal |
| `headline-md` | Playfair Display | 24px / 32px | 600 (Semi-Bold) | Normal |
| `headline-sm` | Playfair Display | 20px / 28px | 500 (Medium) | Normal |
| `body-xl` | Plus Jakarta Sans | 18px / 28px | 400 (Regular) | Normal |
| `body-lg` | Plus Jakarta Sans | 16px / 24px | 400 (Regular) | Normal |
| `body-md` | Plus Jakarta Sans | 14px / 20px | 400 (Regular) | Normal |
| `body-sm` | Plus Jakarta Sans | 12px / 18px | 400 (Regular) | Normal |
| `label-lg` | Plus Jakarta Sans | 14px / 20px | 600 (Semi-Bold) | 0.02em |
| `label-md` | Plus Jakarta Sans | 12px / 16px | 600 (Semi-Bold) | 0.04em |
| `label-sm` | Plus Jakarta Sans | 10px / 14px | 700 (Bold) | 0.06em (Uppercase) |

---

## 4. Spacing, Radii & Shadows

### Radii
- `rounded-DEFAULT`: `0.25rem` (4px)
- `rounded-lg`: `0.5rem` (8px) — Used for action buttons, input boxes, filter pills.
- `rounded-xl`: `0.75rem` (12px) — Used for inner bento boxes, stat widgets.
- `rounded-2xl`: `1.0rem` (16px) — Standard for cards, sections, modal dialogs.
- `rounded-[2.5rem]`: `2.5rem` (40px) — Asymmetric arch rounding on card photo headers.
- `rounded-full`: `9999px` — Used for circular avatar chips and status indicators.

### Shadows
- Soft Card Elevation: `shadow-[0_4px_20px_-2px_rgba(26,34,56,0.06)]`
- Glass Nav Backdrop: `backdrop-blur-xl bg-surface/90`
- Glowing Button Accent: `shadow-[0_2px_6px_-1px_rgba(212,163,115,0.2)]`

---

## 5. Screen Inventory & Application Route Mapping

| Screen Title | Screen Resource ID | Viewport | Existing Route | Features & Components to Implement |
| :--- | :--- | :--- | :--- | :--- |
| **Namma Mysuru - Royal Discovery Hub** | `d5fb45e3989c44aca78cbc1f53aaf588` | 2560 × 11038 | `/` (Home) | - Announcement header ("Live Cultural Notice: Dasara Schedule").<br>- Hero section with dusk palace background and exploration search console.<br>- Live pulse widget: Amba Vilas illumination countdown clock, weather widget (Chamundi hills breeze), and live temple darshan timings.<br>- "Six Jewels of the Royal City" card grid. |
| **Palaces & Heritage of Mysuru** | `39f76d063d32449ba3d9bb8e86481c4b` | 2560 × 9914 | `/spots` (Tourist Spots) | - Architectural Archives breadcrumbs & heritage monograph header.<br>- Architectural style lexicon drawer (Indo-Saracenic, Italianate, Wodeyar Classical, Greco-Roman).<br>- Category filter pills (All, Indo-Saracenic, Colonial, Museums, Temples).<br>- Interactive palace cards with tariff badges, opening hours, and audio tour indicators. |
| **Culinary & Mysore Pak Guide** | `7dd8f096d6b74f129d5526592eab611d` | 2560 × 11268 | `/restaurants` (Dining & Cuisine) | - Royal jaali patterned header with gold/amber culinary banner.<br>- Origin metrics (1935 AD, GI Tagged, Pure Desi Ghee).<br>- "The Alchemy of 1935" story card & Kakasura Madappa timeline.<br>- Sweet house cards (Guru Sweets, Mahalakshmi Sweets, Sri Krishna Sweets, Bombay Tiffanys).<br>- Heritage food cards (Hotel Vinayaka Mylari butter masala dosa, Brahmin Soda Factory, etc.). |
| **Curated Trails & Artisan Crafts** | `fe86cc54e2a0433f8ed3359c1ace1130` | 2560 × 8832 | `/chat` (AI Guide & Trails) | - Curated pathways hero (Silk, Sandalwood, Chamundi Ascent, Rosewood Carving, Yoga Capital).<br>- Step-by-step route itinerary cards with transit duration toggle (Walking vs Auto-Rickshaw).<br>- Interactive royal AI guide integrated alongside curated trail prompts. |
| **Protected Travel & Support** | *(Preserved existing)* | — | `/helpline` | - Emergency helplines (Police, Ambulance, Tourism, Women, Railway) formatted to the new royal palette and card style. |
| **Traveller Login** | *(Preserved existing)* | — | `/login` | - Authentication interface styled with warm cream backdrop and deep crimson primary button. |

---

## 6. Preserved Architecture & Engineering Guardrails

1. **Routing**: Continue using `wouter` with established paths (`/`, `/spots`, `/restaurants`, `/helpline`, `/chat`, `/login`).
2. **Backend & APIs**:
   - Attractions query: `GET /api/spots`
   - Dining query: `GET /api/restaurants`
   - AI Chat SSE Streaming: `POST /api/conversations/:id/messages`
   - System Health: `GET /api/health`
3. **Mobile Responsiveness**:
   - The established bottom navigation bar (`md:hidden fixed bottom-0`), dynamic viewport height (`h-dvh`), and safe area insets will be preserved across all screens.
   - Fluid typography scales down gracefully on 320px–430px viewports without horizontal scroll overflow.
