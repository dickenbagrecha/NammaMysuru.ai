# Phase 2: Ground Truth Knowledge Base Reference
**Project:** NammaMysuru.ai
**Date of Verification:** November 16, 2026 (Asia/Kolkata timezone: Monday)
**Source Hierarchy:**
1. Neon PostgreSQL database (`tourist_spots`, `restaurants`, `conversations`, `messages` tables)
2. Local verified application code and routes (`backend/routes.ts`, `backend/restaurant-provenance.ts`, `frontend/src/pages/Helpline.tsx`)
3. Official Karnataka State Tourism & Mysuru Palace board verified standards

---

## 1. Verified Tourist Attractions & Places (Database Table: `tourist_spots`)

Total spots in verified database: **50**

| ID | Name | Location | Visiting Hours | Ticket Price |
|---|---|---|---|---|
| 1 | Mysuru Palace (Amba Vilas Palace) | Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru | 10:00 AM - 5:30 PM | Adults: ₹70, Children: ₹30, Foreigners: ₹200 |
| 2 | Brindavan Gardens (KRS) | KRS Dam Road, Krishna Raja Sagara, Mandya | 6:00 AM - 8:00 PM | Adults: ₹50, Children: ₹10 |
| 3 | Chamundi Hills & Sri Chamundeshwari Temple | Chamundi Hill, Mysuru | 7:30 AM - 2:00 PM, 3:30 PM - 6:00 PM, 7:30 PM - 9:00 PM | Free |
| 4 | St. Philomena's Cathedral | Lashkar Mohalla, Ashoka Road, Mysuru | 5:00 AM - 6:00 PM | Free |
| 5 | Sri Chamarajendra Zoological Gardens (Mysuru Zoo) | Indiranagar, Mysuru | 8:30 AM - 5:30 PM (Tuesday Closed) | Adults: ₹100, Children: ₹50 |
| 6 | Jaganmohan Palace Art Gallery | Deshika Rd, Chamrajpura, Mysuru | 10:00 AM - 5:30 PM | Adults: ₹40, Children: ₹20 |
| 7 | Mysuru Rail Museum | KRS Rd, Medar Block, Yadavagiri, Mysuru | 10:00 AM - 5:30 PM (Monday Closed) | Adults: ₹15, Children: ₹10 |
| 8 | Karanji Lake Nature Park | Indiranagar, Mysuru | 8:30 AM - 5:30 PM (Tuesday Closed) | Adults: ₹10, Children: ₹5 |
| 9 | Lalitha Mahal Palace Hotel | Lalitha Mahal Palace Rd, Mysuru | 10:00 AM - 6:00 PM | Entry: ₹100 |
| 10 | Mysuru Sand Sculpture Museum | Chamundi Hill Rd, KC Layout, Mysuru | 8:30 AM - 6:30 PM | Adults: ₹40, Children: ₹20 |
| 11 | Venugopala Swamy Temple, Hosa Kannambadi | Hosa Kannambadi, Near KRS Dam, Mysuru | 9:00 AM - 6:00 PM | Free |
| 12 | Sri Ranganathaswamy Temple, Srirangapatna | Srirangapatna, Mandya | 7:30 AM - 1:00 PM, 4:00 PM - 8:00 PM | Free |
| 13 | Ranganathittu Bird Sanctuary | Ranganathittu Rd, Srirangapatna, Mandya | 9:00 AM - 6:00 PM | Adults: ₹70, Children: ₹35 |
| 14 | GRS Fantasy Park | KRS Rd, Metagalli, Mysuru | 10:30 AM - 6:00 PM | Adults: ₹749, Children: ₹649 |
| 15 | Melody World Wax Museum | Kurubara Halli, Siddhartha Layout, Mysuru | 9:30 AM - 7:00 PM | Entry: ₹30 |
| 16 | Kukkarahalli Lake | Manasagangothri, Mysuru | 6:00 AM - 6:00 PM | Free |
| 17 | Chennakeshava Temple, Somanathapura | Somanathapura, Mysuru District | 9:00 AM - 5:30 PM | Adults: ₹25 |
| 18 | Kishkindha Moolika Bonsai Garden | Datta Peetham, Ooty Road, Mysuru | 9:30 AM - 12:30 PM, 3:30 PM - 5:30 PM (Wednesday Closed) | Entry: ₹20 |
| 19 | Devaraja Market, Mysuru | Sayyaji Rao Rd, Devaraja Mohalla, Mysuru | 6:00 AM - 9:00 PM | Free |
| 20 | Regional Museum of Natural History | Siddhartha Nagar, Mysuru | 10:00 AM - 6:00 PM (Monday Closed) | Free |
| 21 | Dariya Daulat Bagh (Tipu Sultan's Summer Palace) | Srirangapatna, Mandya | 9:00 AM - 5:00 PM | Adults: ₹15, Foreigners: ₹200 |
| 22 | Gumbaz-e-Shahi, Srirangapatna | Srirangapatna, Mandya | 8:00 AM - 6:30 PM | Free |
| 23 | Jayalakshmi Vilas Mansion & Folklore Museum | Manasagangothri, Mysuru | 10:00 AM - 5:30 PM (Sunday Closed) | Free |
| 24 | Lingambudhi Lake | Lingabudi Palya, Mysuru | 6:00 AM - 6:00 PM | Free |
| 25 | Balmuri Falls | Balmuri, Yadathittu, Mandya | 6:00 AM - 7:00 PM | Free |
| 26 | Srikanteshwara Temple, Nanjangud | Nanjangud, Mysuru District | 6:00 AM - 1:00 PM, 4:00 PM - 8:30 PM | Free |
| 27 | Namdroling Monastery (Golden Temple), Bylakuppe | Bylakuppe, Mysuru District | 9:00 AM - 6:00 PM | Free |
| 28 | Cheluvanarayana Swamy Temple, Melukote | Melukote, Mandya District | 7:30 AM - 1:00 PM, 4:00 PM - 8:00 PM | Free |
| 29 | Talakadu Panchalinga Temples | Talakadu, Mysuru District | 8:00 AM - 6:00 PM | Free |
| 30 | Shivanasamudra Falls (Gaganachukki & Bharachukki) | Shivanasamudra, Mandya District | 8:00 AM - 5:00 PM | Free |
| 31 | Bandipur National Park & Tiger Reserve | Bandipur, Chamarajanagar District | 6:00 AM - 6:00 PM | Safari: ₹300 onwards |
| 32 | Srirangapatna Fort | Srirangapatna, Mandya District | Open all day | Free |
| 33 | Himavad Gopalaswamy Betta | Gundlupet, Chamarajanagar District | 8:30 AM - 4:00 PM | Free |
| 34 | Karighatta Viewpoint | Karighatta, Srirangapatna | 6:00 AM - 6:00 PM | Free |
| 35 | Nagarahole National Park (Kabini) | Hunsur, Mysuru District | 6:00 AM - 6:00 PM | Safari: ₹300 onwards |
| 36 | Nimishambha Temple, Ganjam | Ganjam, Srirangapatna | 6:30 AM - 8:30 PM | Free |
| 37 | Colonel Bailey's Dungeon, Srirangapatna | Srirangapatna, Mandya District | 8:00 AM - 6:00 PM | Free |
| 38 | Edmuri Falls | Edmuri, Mysuru District | 6:00 AM - 7:00 PM | Free |
| 39 | Sangama, Srirangapatna | Srirangapatna, Mandya District | 6:00 AM - 6:00 PM | Free |
| 40 | Biligiri Ranganathaswamy Hills (BR Hills) | Yelandur, Chamarajanagar District | 6:00 AM - 6:00 PM | Free (Safari charges extra) |
| 41 | Nandi Statue, Chamundi Hills | Chamundi Hill, Mysuru | 7:30 AM - 9:00 PM | Free |
| 42 | KSIC Mysore Silk Factory | Manandavadi Road, Ashokapuram, Mysuru | 10:30 AM - 6:00 PM (Sunday Closed) | Entry: ₹15 |
| 43 | Shuka Vana | Datta Peetham, Ooty Road, Mysuru | 9:30 AM - 12:30 PM, 3:30 PM - 5:30 PM (Wednesday Closed) | Free |
| 44 | Chunchanakatte Falls | Krishnarajanagara, Mysuru District | 6:00 AM - 6:00 PM | Free |
| 45 | Thonnur Lake (Thonnur Kere) | Pandavapura, Mandya District | Open all day | Free |
| 46 | Kunti Betta | Pandavapura, Mandya District | Open all day (Trekking ideal in mornings) | Free |
| 47 | Kokkare Bellur Bird Sanctuary | Maddur Taluk, Mandya District | 6:00 AM - 6:00 PM | Free |
| 48 | Jama Masjid, Srirangapatna | Srirangapatna, Mandya District | 8:00 AM - 6:00 PM | Free |
| 49 | Someshwara Temple, Srirangapatna | Srirangapatna, Mandya District | 7:00 AM - 12:00 PM, 5:00 PM - 8:00 PM | Free |
| 50 | Cheluvamba Mansion (CFTRI Campus) | KRS Road, Mysuru | Outside view only | Free |

---

## 2. Verified Restaurants & Dining (Database Table: `restaurants`)

Total restaurants in verified database: **33**

| ID | Name | Cuisine | Price | Dietary Class | Jain-Friendly? | Vegan-Friendly? | Verification Status | Source URL |
|---|---|---|---|---|---|---|---|---|
| 100 | Vinayaka Mylari | South Indian | Budget | pure_veg | No | No | partially_verified | https://www.zomato.com/mysore/hotel-vinayaka-mylari-nazarbad |
| 101 | Mahesh Prasad | South Indian | Budget | pure_veg | UNVERIFIED (NULL) | No | verified | https://www.nmaheshprasad.com/menu.html |
| 102 | Gayatri Tiffin Room (GTR) | South Indian Breakfast | Budget | pure_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/gayathri-tiffin-room-chamundipuram |
| 103 | Green Leaf | South Indian, North Indian | Budget | pure_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/green-leaf-restaurant-v-v-mohalla |
| 104 | Jalpaan | North Indian, Italian, Mexican (Veg) | High-end | pure_veg | **YES** | **YES** | partially_verified | https://www.zomato.com/mysore/jalpaan-bannimantap |
| 105 | Gufha Restaurant | North Indian, Chinese | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/gufha-hotel-pai-vista-mysore-locality |
| 106 | Spring | Continental, Italian | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.radissonhotels.com/en-us/hotels/radisson-blu-mysore |
| 107 | Royal Orchid Metropole | Multi-cuisine, Heritage | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | verified | https://www.royalorchidhotels.com/royal-orchid-metropole-mysore/overview |
| 108 | By The Way | North Indian, Continental | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/by-the-way-bogadi |
| 109 | La Uppu (Grand Mercure) | International, Buffet | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/la-uppu-grand-mercure-mysuru-yadavagiri |
| 110 | By the Blue (Grand Mercure) | North Indian, Poolside | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/by-the-blue-grand-mercure-mysuru-yadavagiri |
| 111 | Olive Garden (Windflower) | Multi-cuisine, Open Air | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/the-olive-garden-the-windflower-resorts-spa-nazarbad |
| 112 | Mezzaluna | Continental, Indian | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/mezzaluna-continental-gokulam |
| 113 | Parklane Hotel | Indian, Continental, Beer | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/parklane-hotel-restaurant-doora |
| 114 | Lalitha Mahal Palace Hotel | Royal Indian, Continental | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/lalitha-mahal-palace-hotel-siddhartha-layout |
| 115 | Tiger Trail (Metropole) | North Indian, Coastal | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | verified | https://www.royalorchidhotels.com/royal-orchid-metropole-mysore/overview |
| 116 | Old House | Italian, Pizza, Continental | Mid-range | pure_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/the-old-house-chamrajpura |
| 117 | Poojari's Fish Land | Seafood, Mangalorean | Mid-range | non_veg | No | No | partially_verified | https://www.zomato.com/mysore/poojaris-fish-land-srirangapatna |
| 118 | RRR 'Mysuru' | Andhra Style, Biryani | Mid-range | non_veg | No | No | partially_verified | https://www.zomato.com/mysore/hotel-rrr-mysore-locality |
| 119 | Hotel Hanumanthu | Nati Style, Mutton Pulao | Mid-range | non_veg | No | No | partially_verified | https://www.zomato.com/mysore/hotel-hanumanthu-original-mandi-mohalla |
| 120 | Tegu Mess | Local Non-Veg | Budget | non_veg | No | No | partially_verified | https://www.zomato.com/mysore/tegu-mess-jayalakshmipuram |
| 121 | Empire Restaurant | North Indian, Kebabs, Biryani | Mid-range | non_veg | No | No | partially_verified | https://hotelempire.in/ |
| 122 | Sepoy's Phirangi | North Indian, Mughlai | Mid-range | non_veg | No | No | partially_verified | https://www.zomato.com/mysore/sepoys-phirangi-v-v-mohalla |
| 123 | Oyster Bay | North Indian, Chinese, Coastal | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/oyster-bay-vijayanagar |
| 124 | Infinit Lounge Bar | Continental, North Indian | Luxury | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/infinit-lounge-bar-chamarajapura |
| 125 | Depth N Green | Cafe, Healthy, Vegan options | Mid-range | pure_veg | UNVERIFIED (NULL) | **YES** | verified | https://depthngreen.com/ |
| 126 | Tina's Cafe | Continental, Home-style | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/tinas-cafe-gokulam |
| 127 | Minimal Coffee Roasters | Coffee, Cafe | Mid-range | pure_veg | UNVERIFIED (NULL) | **YES** | partially_verified | https://www.zomato.com/mysore/minimal-coffee-roasters-gokulam |
| 128 | Sapa Sourdough & Pastry | Bakery, Cafe, European | High-end | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | verified | https://www.sapabakery.com |
| 129 | Glen's Bakehouse | Bakery, Continental, Desserts | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.glensbakehouse.com/ |
| 130 | Frosting | Italian, Cafe, Bakery | Mid-range | veg_and_non_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/frosting-v-v-mohalla |
| 131 | Corner House Ice Cream | Desserts, Ice Cream | Mid-range | pure_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | partially_verified | https://www.zomato.com/mysore/corner-house-ice-cream-1-gokulam |
| 132 | Polar Bear Ice Cream | Desserts, Ice Cream Sundaes | Mid-range | pure_veg | UNVERIFIED (NULL) | UNVERIFIED (NULL) | verified | https://polarbear.co.in/store-locator/ |

### 2.1 Critical Dietary Truths (Strict Negative-Inference Rules)
- **CONFIRMED JAIN-FRIENDLY (isJainFriendly = true):** EXACTLY ONE RESTAURANT: **Jalpaan** (ID 106). All other 32 restaurants are null or false. If a restaurant is not Jalpaan, the chatbot MUST NOT claim it is verified Jain-friendly.
- **CONFIRMED VEGAN-FRIENDLY (isVeganFriendly = true):** EXACTLY THREE RESTAURANTS: **Jalpaan** (ID 106), **Depth N Green** (ID 125), and **Minimal Coffee Roasters** (ID 127). All other 30 restaurants are null or false.
- **CONFIRMED PURE VEGETARIAN (`pure_veg`):** Vinayaka Mylari, Mahesh Prasad, Gayatri Tiffin Room (GTR), Green Leaf, Jalpaan, Old House, Depth N Green, Minimal Coffee Roasters, Corner House Ice Cream, Polar Bear Ice Cream.
- **PROVENANCE STANDARD:** Only restaurants with `verificationStatus = "verified"` have dedicated official domains/locators. Aggregator listings (`partially_verified`) verify general existence but not specific daily hours or unlisted dietary sub-options.

---

## 3. Verified Helplines & Safety Network (Source: `frontend/src/pages/Helpline.tsx`)

| Service | Number | Availability | Notes |
|---|---|---|---|
| Police Control Room | 100 / 112 | 24/7 | Direct rapid response line for city-wide emergencies |
| Ambulance & Medical Trauma | 108 | 24/7 | Free government emergency medical service |
| National Tourist Helpline | 1363 | 24/7 | Multilingual assistance desk |
| Women Safety Helpline | 1091 | 24/7 | Emergency safety and confidential assistance |
| KSTDC Tourist Information Kiosk | 0821-2422096 | 9:00 AM – 7:00 PM | Near Mysore Palace South Gate |
| Suburban KSRTC Bus Stand | 0821-2425824 | 24/7 | Mother Teresa Road, Central Mysore |
| Mysuru Railway Junction Helpline | 139 | 24/7 | Medar Block, Yadavagiri |
| Mysore City Corporation (MCC) | 0821-2418800 | 10:00 AM – 5:30 PM | Sayyaji Rao Road |
| Fire Assistance | 101 | 24/7 | Standard emergency fire service |

---

## 4. Time-Sensitive & Cultural Facts (Current Date: November 16, 2026)

- **Current Date:** November 16, 2026 (Asia/Kolkata). Day of week: Monday.
- **Mysuru Dasara Status:** Dasara occurs in September/October (Navaratri). For the calendar year 2026, Dasara has ALREADY PASSED. Answering that Dasara is happening today or tomorrow is a critical hallucination.
- **Palace Illumination Timing:** Illuminated on Sundays and public holidays (usually 7:00 PM to 7:45 PM / 8:00 PM). Sound & Light show operates on weekdays. Because November 16, 2026 is a Monday, full exterior illumination is NOT scheduled for today unless specifically declared as a public holiday.
- **Mysore Pak Heritage:** Created by Kakasura Madappa in the royal kitchens of Mysore Palace under Maharaja Krishnaraja Wodeyar IV. The original family continues the tradition at Guru Sweet Mart, Sayyaji Rao Road / Devaraja Market area.
- **Amba Vilas vs Chamundeshwari:** Amba Vilas Palace is the Mysore Palace in the city center. Chamundeshwari Temple is atop Chamundi Hill (~13 km away). They are distinct sites.

---

## 5. Explicitly Unsupported & Fabricated Entities (Not Verified / Hallucination Traps)

- **Nonexistent Restaurant Trap 1:** "The Royal Tandoor of Chamundi" -> Fake entity. Expected behavior: State that this restaurant is not in the verified database and advise checking trusted directories.
- **Nonexistent Restaurant Trap 2:** "Kavita Vegan Bhavan" -> Fake entity.
- **Nonexistent Attraction Trap 1:** "Tipu Sultan Underwater Tunnel" -> Fake attraction.
- **Nonexistent Attraction Trap 2:** "Wodeyar Astronomical Space Observatory" -> Fake attraction.
- **Unsupported Fact Trap:** Exact real-time table wait times for restaurants or live bus delays -> Not stored in DB. Expected: Acknowledge that live wait times are unavailable.
- **Unsupported Event Trap:** "Mysuru Winter Snow Festival" -> Nonexistent event.
