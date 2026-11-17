const fs = require('fs');

async function run() {
  const [spots, rests] = await Promise.all([
    fetch('http://localhost:5001/api/tourist-spots').then(r => r.json()),
    fetch('http://localhost:5001/api/restaurants').then(r => r.json())
  ]);

  let md = '# Phase 2: Ground Truth Knowledge Base Reference\n';
  md += '**Project:** NammaMysuru.ai\n';
  md += '**Date of Verification:** November 16, 2026 (Asia/Kolkata timezone: Monday)\n';
  md += '**Source Hierarchy:**\n';
  md += '1. Neon PostgreSQL database (`tourist_spots`, `restaurants`, `conversations`, `messages` tables)\n';
  md += '2. Local verified application code and routes (`backend/routes.ts`, `backend/restaurant-provenance.ts`, `frontend/src/pages/Helpline.tsx`)\n';
  md += '3. Official Karnataka State Tourism & Mysuru Palace board verified standards\n\n';
  md += '---\n\n';

  md += '## 1. Verified Tourist Attractions & Places (Database Table: `tourist_spots`)\n\n';
  md += 'Total spots in verified database: **' + spots.length + '**\n\n';
  md += '| ID | Name | Location | Visiting Hours | Ticket Price |\n';
  md += '|---|---|---|---|---|\n';
  for (const s of spots) {
    md += `| ${s.id} | ${s.name} | ${s.location} | ${s.visitingHours || 'Open / Unspecified'} | ${s.ticketPrice || 'Free'} |\n`;
  }

  md += '\n---\n\n';
  md += '## 2. Verified Restaurants & Dining (Database Table: `restaurants`)\n\n';
  md += 'Total restaurants in verified database: **' + rests.length + '**\n\n';
  md += '| ID | Name | Cuisine | Price | Dietary Class | Jain-Friendly? | Vegan-Friendly? | Verification Status | Source URL |\n';
  md += '|---|---|---|---|---|---|---|---|---|\n';
  for (const r of rests) {
    const jain = r.isJainFriendly === true ? '**YES**' : (r.isJainFriendly === false ? 'No' : 'UNVERIFIED (NULL)');
    const vegan = r.isVeganFriendly === true ? '**YES**' : (r.isVeganFriendly === false ? 'No' : 'UNVERIFIED (NULL)');
    md += `| ${r.id} | ${r.name} | ${r.cuisine} | ${r.priceRange} | ${r.dietaryClassification} | ${jain} | ${vegan} | ${r.verificationStatus} | ${r.sourceUrl || 'None'} |\n`;
  }

  md += '\n### 2.1 Critical Dietary Truths (Strict Negative-Inference Rules)\n';
  md += '- **CONFIRMED JAIN-FRIENDLY (isJainFriendly = true):** EXACTLY ONE RESTAURANT: **Jalpaan** (ID 106). All other 32 restaurants are null or false. If a restaurant is not Jalpaan, the chatbot MUST NOT claim it is verified Jain-friendly.\n';
  md += '- **CONFIRMED VEGAN-FRIENDLY (isVeganFriendly = true):** EXACTLY THREE RESTAURANTS: **Jalpaan** (ID 106), **Depth N Green** (ID 125), and **Minimal Coffee Roasters** (ID 127). All other 30 restaurants are null or false.\n';
  md += '- **CONFIRMED PURE VEGETARIAN (`pure_veg`):** Vinayaka Mylari, Mahesh Prasad, Gayatri Tiffin Room (GTR), Green Leaf, Jalpaan, Old House, Depth N Green, Minimal Coffee Roasters, Corner House Ice Cream, Polar Bear Ice Cream.\n';
  md += '- **PROVENANCE STANDARD:** Only restaurants with `verificationStatus = "verified"` have dedicated official domains/locators. Aggregator listings (`partially_verified`) verify general existence but not specific daily hours or unlisted dietary sub-options.\n';

  md += '\n---\n\n';
  md += '## 3. Verified Helplines & Safety Network (Source: `frontend/src/pages/Helpline.tsx`)\n\n';
  md += '| Service | Number | Availability | Notes |\n';
  md += '|---|---|---|---|\n';
  md += '| Police Control Room | 100 / 112 | 24/7 | Direct rapid response line for city-wide emergencies |\n';
  md += '| Ambulance & Medical Trauma | 108 | 24/7 | Free government emergency medical service |\n';
  md += '| National Tourist Helpline | 1363 | 24/7 | Multilingual assistance desk |\n';
  md += '| Women Safety Helpline | 1091 | 24/7 | Emergency safety and confidential assistance |\n';
  md += '| KSTDC Tourist Information Kiosk | 0821-2422096 | 9:00 AM – 7:00 PM | Near Mysore Palace South Gate |\n';
  md += '| Suburban KSRTC Bus Stand | 0821-2425824 | 24/7 | Mother Teresa Road, Central Mysore |\n';
  md += '| Mysuru Railway Junction Helpline | 139 | 24/7 | Medar Block, Yadavagiri |\n';
  md += '| Mysore City Corporation (MCC) | 0821-2418800 | 10:00 AM – 5:30 PM | Sayyaji Rao Road |\n';
  md += '| Fire Assistance | 101 | 24/7 | Standard emergency fire service |\n';

  md += '\n---\n\n';
  md += '## 4. Time-Sensitive & Cultural Facts (Current Date: November 16, 2026)\n\n';
  md += '- **Current Date:** November 16, 2026 (Asia/Kolkata). Day of week: Monday.\n';
  md += '- **Mysuru Dasara Status:** Dasara occurs in September/October (Navaratri). For the calendar year 2026, Dasara has ALREADY PASSED. Answering that Dasara is happening today or tomorrow is a critical hallucination.\n';
  md += '- **Palace Illumination Timing:** Illuminated on Sundays and public holidays (usually 7:00 PM to 7:45 PM / 8:00 PM). Sound & Light show operates on weekdays. Because November 16, 2026 is a Monday, full exterior illumination is NOT scheduled for today unless specifically declared as a public holiday.\n';
  md += '- **Mysore Pak Heritage:** Created by Kakasura Madappa in the royal kitchens of Mysore Palace under Maharaja Krishnaraja Wodeyar IV. The original family continues the tradition at Guru Sweet Mart, Sayyaji Rao Road / Devaraja Market area.\n';
  md += '- **Amba Vilas vs Chamundeshwari:** Amba Vilas Palace is the Mysore Palace in the city center. Chamundeshwari Temple is atop Chamundi Hill (~13 km away). They are distinct sites.\n';

  md += '\n---\n\n';
  md += '## 5. Explicitly Unsupported & Fabricated Entities (Not Verified / Hallucination Traps)\n\n';
  md += '- **Nonexistent Restaurant Trap 1:** "The Royal Tandoor of Chamundi" -> Fake entity. Expected behavior: State that this restaurant is not in the verified database and advise checking trusted directories.\n';
  md += '- **Nonexistent Restaurant Trap 2:** "Kavita Vegan Bhavan" -> Fake entity.\n';
  md += '- **Nonexistent Attraction Trap 1:** "Tipu Sultan Underwater Tunnel" -> Fake attraction.\n';
  md += '- **Nonexistent Attraction Trap 2:** "Wodeyar Astronomical Space Observatory" -> Fake attraction.\n';
  md += '- **Unsupported Fact Trap:** Exact real-time table wait times for restaurants or live bus delays -> Not stored in DB. Expected: Acknowledge that live wait times are unavailable.\n';
  md += '- **Unsupported Event Trap:** "Mysuru Winter Snow Festival" -> Nonexistent event.\n';

  fs.writeFileSync('CHATBOT_AUDIT/02_GROUND_TRUTH.md', md, 'utf8');
  console.log('Successfully generated CHATBOT_AUDIT/02_GROUND_TRUTH.md');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
