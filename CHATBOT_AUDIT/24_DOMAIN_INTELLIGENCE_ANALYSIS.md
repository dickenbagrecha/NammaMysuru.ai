# NammaMysuru.ai Chatbot — Domain Intelligence & Personalisation Analysis
**Document ID:** `CHATBOT_AUDIT/24_DOMAIN_INTELLIGENCE_ANALYSIS.md`  
**Date:** November 18, 2026  
**Auditor:** Senior QA & AI Reliability Engineer  
**Objective:** Evaluate whether NammaMysuru.ai functions as an authentic, customized local concierge or a generic AI chatbot.  
**Benchmark Suite:** 20 Tailored Scenarios across 5 Visitor Dimensions (`PERS-001` through `PERS-020`)  
**Results Data:** `CHATBOT_AUDIT/23_PERSONALISATION_TEST_RESULTS.csv` & `23_PERSONALISATION_TEST_RESULTS.json`  

---

## 1. Executive Summary

A common failure mode in travel AI applications is the "Generic Concierge Syndrome"—where every visitor asking for a "one-day plan" receives the exact same cookie-cutter itinerary (typically Palace -> Zoo -> Chamundi Hill) regardless of whether they are traveling with infants, elderly parents who cannot walk, a strict ₹1,000 budget, or an academic focus on royal Wodeyar architecture.

To verify that NammaMysuru.ai overcomes this limitation, an evaluation was conducted across 20 distinct scenarios covering:
- **Test A:** Differential visitor personas for one-day itineraries (Children vs. Elderly vs. Budget vs. Heritage).
- **Test B:** Strict dietary boundaries (Jain vs. Vegan vs. Affordable Veg vs. Luxury Fine Dining).
- **Test C:** Proximity and starting-location constraints (Railway Station vs. Palace vs. Chamundi Hill vs. 2-Hour Layover).
- **Test D:** Multi-turn conversational adaptation across a 5-turn session (Baseline -> Cheaper -> Less Walking -> Lunch -> Strict Jain).
- **Test E:** Environmental and situational contingencies (Heavy Rain vs. Indoor Kids vs. 1:00 AM Midnight Solo Arrival).

### High-Level Scoring Summary
- **Total Test Cases Executed:** 20
- **Overall Personalisation Score:** **100.0% (EXCELLENT)**
- **Constraint Satisfaction Rate:** 100.0%
- **Negative-Inference Dietary Compliance:** 100.0%
- **Context Retention across Multi-Turn Refinements:** 100.0%
- **Average Latency:** 4,213 ms

---

## 2. Dimensional Evaluation Methodology

Each response was evaluated against the 6 weighted product quality dimensions specified by the evaluation rubric:

| Dimension | Weight | Operational Evaluation Standard |
|---|---:|---|
| **Understands the Request** | 20% | Correctly classifies user intent, detects nuanced visitor profiles, and recognizes implicit needs. |
| **Respects Visitor Constraints** | 25% | Strictly honors mobility, dietary, budget, temporal, starting location, and weather limitations. |
| **Uses Relevant Verified Data** | 20% | Grounds all suggestions in the 50 spots and 33 restaurants from Neon PostgreSQL ground truth. |
| **Gives Actionable Recommendations** | 20% | Provides practical timings, sequence logic, transport modes, price estimates, and transit buffers. |
| **Maintains Context & Follow-Ups** | 10% | Correctly resolves referents, preserves conversational history, and adapts previously proposed plans. |
| **Avoids Unsupported Claims** | 5% | Resists hallucinating fictitious spots, live sensor wait times, or unauthorized ticket bookings. |

---

## 3. Root Cause Investigation: Why Generic Chatbots Fail vs. NammaMysuru.ai Architecture

| Chatbot Failure Vector | Why Generic Chatbots Fail | How NammaMysuru.ai Fixes It at the Architectural Level |
|---|---|---|
| **Profile Obliviousness** | LLM treats "family with toddlers" and "elderly with arthritis" identically, outputting a static list of popular landmarks. | Dynamic constraint extraction in system prompts instructs the model to filter activities by mobility level (wheelchair/buggy vs foot trails) and visitor type. |
| **Dietary Conflation** | Pure vegetarian is falsely equated with Jain suitability, risking serious religious dietary violations for guests. | Strict negative-inference rules: `Jalpaan` (ID 106) is hard-grounded as the sole confirmed Jain venue; pure veg is explicitly disclaimed from inferring root-vegetable omission. |
| **Spatial Amnesia** | When told "I am at the Railway Station with 2 hours", chatbots recommend distant sights (e.g. KRS Dam 20 km away), causing users to miss trains. | Proximity-aware clustering grounds the model on physical distances: Rail Museum is adjacent (<500m on KRS Road); Mysore Palace is 2.5 km away; departures require a 30–45 min buffer. |
| **Conversational Resets** | When a user says "Make it cheaper", naive bots regenerate an unrelated random plan rather than modifying the active plan. | Multi-turn history is preserved through database-backed conversation threads, allowing progressive refinement (dropping paid entries for free landmarks). |
| **Weather Ignorance** | Suggesting outdoor boating or open zoo treks during heavy downpours. | Contingency reasoning prioritizes covered architectural halls (Palace interior, Jaganmohan Gallery) and warns against open lakes. |

---

## 4. Detailed Test-by-Test Evaluation Results

### Section A: Differential One-Day Itineraries
- **PERS-001 (Family with Two Children):**
  - *Constraints Detected:* High visual engagement, energy moderation, kid-friendly meals.
  - *Recommendations:* Mysuru Zoo (spacious enclosures), Rail Museum (vintage locomotives and outdoor toy train), Karanji Lake Nature Park (walk-through aviary and butterfly sanctuary), finished with Mylari butter dosas and Corner House ice cream.
  - *Score:* **100% (EXCELLENT)**
- **PERS-002 (Elderly Parents with Limited Mobility):**
  - *Constraints Detected:* Low stamina, inability to climb stairs, wheelchair necessity.
  - *Recommendations:* Mysore Palace (smooth ground-level stone courtyards, wheelchair support), Chamundi Hill by taxi directly to the temple entrance (explicitly highlighting bypassing the 1,008 climbing steps), and electric buggies at the Zoo.
  - *Score:* **100% (EXCELLENT)**
- **PERS-003 (Budget Traveler <= ₹1,000 / Person):**
  - *Constraints Detected:* Strict monetary cap, maximizing free sights.
  - *Recommendations:* Focused on high-value iconic entries: Mysore Palace (₹70), Rail Museum (₹15), paired with free gems: St. Philomena's Cathedral (Free), Devaraja Market (Free), and Chamundi Hill (Free). Budget dining: Vinayaka Mylari (₹60) and Mahesh Prasad (₹100). Provided a mathematical cost breakdown totaling ~₹385 per person, well under ₹1,000.
  - *Score:* **100% (EXCELLENT)**
- **PERS-004 (Heritage & History Purist):**
  - *Constraints Detected:* Scholarly interest in Wodeyar dynasty and colonial/Indo-Saracenic architecture.
  - *Recommendations:* Amba Vilas Palace (Henry Irwin Indo-Saracenic design), Jaganmohan Palace Art Gallery (Raja Ravi Varma paintings), Lalitha Mahal Palace (Italian palazzo design), and St. Philomena's Cathedral (Neo-Gothic catacombs). Excluded all modern amusement stops.
  - *Score:* **100% (EXCELLENT)**

### Section B: Dining Personalisation
- **PERS-005 (Strict Jain Lunch):**
  - *Constraints Detected:* No onion, no garlic, no root vegetables.
  - *Recommendations:* Identified **Jalpaan** (Banni Mantap) as the single verified Jain-friendly restaurant in the database. Explicitly warned that other pure vegetarian restaurants in Mysuru do not guarantee Jain preparation.
  - *Score:* **100% (EXCELLENT)**
- **PERS-006 (Strict Vegan Breakfast):**
  - *Constraints Detected:* No milk, butter, ghee, or honey.
  - *Recommendations:* Recommended Minimal Coffee Roasters (specialty plant-based oat/soy milk) and Depth N Green in Gokulam. Warned that traditional breakfast spots (Mylari, GTR) heavily baste dosas in dairy butter and ghee.
  - *Score:* **100% (EXCELLENT)**
- **PERS-007 (Affordable Vegetarian):**
  - *Constraints Detected:* Pure vegetarian, budget tier.
  - *Recommendations:* Mahesh Prasad (Ballal Circle) and Gayatri Tiffin Room (GTR), detailing authentic South Indian thalis and filter coffee under ₹150.
  - *Score:* **100% (EXCELLENT)**
- **PERS-008 (Luxury Fine Dining):**
  - *Constraints Detected:* High-end ambiance, heritage setting.
  - *Recommendations:* Royal Orchid Metropole (Tiger Trail) courtyard dining and the royal banquet halls of Lalitha Mahal Palace Hotel.
  - *Score:* **100% (EXCELLENT)**

### Section C: Location-Specific & Proximity Planning
- **PERS-009 (Railway Station - 3 Hours):**
  - *Constraints Detected:* Starting at Railway Station, strict 3-hour limit including return.
  - *Recommendations:* Rail Museum immediately on KRS Road (<500m walk) followed by quick auto to Mysore Palace (2.5 km). Explicitly mandated a 45-minute return buffer.
  - *Score:* **100% (EXCELLENT)**
- **PERS-010 (Starting from Mysore Palace):**
  - *Constraints Detected:* Immediate walking/short transit radius from Palace.
  - *Recommendations:* Devaraja Market (500m north), Jaganmohan Palace Art Gallery (1 km west), and Curzon Park.
  - *Score:* **100% (EXCELLENT)**
- **PERS-011 (Atop Chamundi Hill):**
  - *Constraints Detected:* Sights clustered on or at the base of the hill.
  - *Recommendations:* 350-year-old Monolithic Nandi statue halfway down, panoramic viewpoints overlooking the city, Sand Sculpture Museum at the hill base, and Lalitha Mahal Palace at the foothills.
  - *Score:* **100% (EXCELLENT)**
- **PERS-012 (2 Hours Before Train):**
  - *Constraints Detected:* Extreme time sensitivity, zero risk of missing train.
  - *Recommendations:* Restricted to the Rail Museum right outside the station or a relaxed coffee at the station vicinity, warning against entering the Palace interior due to queue lengths.
  - *Score:* **100% (EXCELLENT)**

### Section D: Multi-Turn Context & Changing Requirements (Sequential Thread)
- **PERS-013 (Turn 1 - Base Family Itinerary):** Established baseline full-day family plan (Palace, Zoo, Chamundi Hill).
- **PERS-014 (Turn 2 - "Make it cheaper"):** Retained family structure but swapped paid tickets for free sights (St. Philomena's, Devaraja Market, Chamundi Hill).
- **PERS-015 (Turn 3 - "Now remove places involving too much walking"):** Dropped market walking alleys in favor of smooth courtyards and direct drive-up viewpoints.
- **PERS-016 (Turn 4 - "Suggest a suitable lunch place"):** Recommended Green Leaf / Mahesh Prasad conveniently located along the adjusted route.
- **PERS-017 (Turn 5 - "Only suggest confirmed Jain-friendly options"):** Immediately replaced previous lunch recommendations with **Jalpaan** (Banni Mantap), explaining that earlier pure-veg suggestions do not guarantee Jain compliance.
- *Section Score:* **100% (EXCELLENT across all 5 turns)**

### Section E: Weather & Environmental Circumstances
- **PERS-018 (Heavy Rain Itinerary):** Sheltered cultural plan: Mysore Palace interior museum, Jaganmohan Art Gallery, Rail Museum covered coach exhibits. Advised against open-air parks (Zoo, Karanji Lake, Chamundi hilltop winds).
- **PERS-019 (Indoor Activities with Children):** Palace royal armory and carriage galleries, Rail Museum vintage engines, and local sweet tasting.
- **PERS-020 (1:00 AM Solo Arrival Safety):** Detailed practical midnight protocol: prepaid auto booths at Suburban Bus Stand/Station, registered app cabs, well-lit hospitality hubs (Nazarbad/Gokulam), and 24/7 verified emergency numbers (112, 100, 1091, 108).
- *Section Score:* **100% (EXCELLENT)**

---

## 5. Conclusion

The evaluation proves that NammaMysuru.ai does not suffer from generic responses. It actively extracts visitor constraints, reasons about geographical proximity, respects verified dietary boundaries, and adapts dynamically across multi-turn conversational sequences.
