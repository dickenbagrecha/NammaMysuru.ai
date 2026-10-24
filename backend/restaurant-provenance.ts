export interface RestaurantProvenanceSeed {
  name: string;
  sourceUrl: string | null;
  verificationStatus: "verified" | "partially_verified" | "unverified";
  verifiedAt: string | null;
}

/**
 * Conservative Provenance Mapping for all 33 Restaurants
 * 
 * Strict Audit Standard:
 * - 'verified': Active official website or dedicated branch locator supporting establishment identity, address, and specialty in Mysuru.
 * - 'partially_verified': Reputable business listing / aggregator / directory (e.g. Zomato) confirming local address and general dining presence, but lacking an independent official domain or specific branch-level hours verification.
 * - 'unverified': Conflicting, expired, or unsupported claims.
 */
export const RESTAURANT_PROVENANCE_DATA: Record<string, RestaurantProvenanceSeed> = {
  // --- Traditional & Heritage Eateries ---
  "Vinayaka Mylari": {
    name: "Vinayaka Mylari",
    sourceUrl: "https://www.zomato.com/mysore/hotel-vinayaka-mylari-nazarbad",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Mahesh Prasad": {
    name: "Mahesh Prasad",
    sourceUrl: "https://www.nmaheshprasad.com/menu.html",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
  "Gayatri Tiffin Room (GTR)": {
    name: "Gayatri Tiffin Room (GTR)",
    sourceUrl: "https://www.zomato.com/mysore/gayathri-tiffin-room-chamundipuram",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Hotel Hanumanthu": {
    name: "Hotel Hanumanthu",
    sourceUrl: "https://www.zomato.com/mysore/hotel-hanumanthu-original-mandi-mohalla",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Tegu Mess": {
    name: "Tegu Mess",
    sourceUrl: "https://www.zomato.com/mysore/tegu-mess-jayalakshmipuram",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Vegetarian Restaurants ---
  "Green Leaf": {
    name: "Green Leaf",
    sourceUrl: "https://www.zomato.com/mysore/green-leaf-restaurant-v-v-mohalla",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Jalpaan": {
    name: "Jalpaan",
    sourceUrl: "https://www.zomato.com/mysore/jalpaan-bannimantap",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Old House": {
    name: "Old House",
    sourceUrl: "https://www.zomato.com/mysore/the-old-house-chamrajpura",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Hotel Fine Dining & Multi-Cuisine ---
  "Gufha Restaurant": {
    name: "Gufha Restaurant",
    sourceUrl: "https://www.zomato.com/mysore/gufha-hotel-pai-vista-mysore-locality",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Spring": {
    name: "Spring",
    sourceUrl: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-mysore",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Royal Orchid Metropole": {
    name: "Royal Orchid Metropole",
    sourceUrl: "https://www.royalorchidhotels.com/royal-orchid-metropole-mysore/overview",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
  "Tiger Trail (Metropole)": {
    name: "Tiger Trail (Metropole)",
    sourceUrl: "https://www.royalorchidhotels.com/royal-orchid-metropole-mysore/overview",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
  "By The Way": {
    name: "By The Way",
    sourceUrl: "https://www.zomato.com/mysore/by-the-way-bogadi",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "La Uppu (Grand Mercure)": {
    name: "La Uppu (Grand Mercure)",
    sourceUrl: "https://www.zomato.com/mysore/la-uppu-grand-mercure-mysuru-yadavagiri",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "By the Blue (Grand Mercure)": {
    name: "By the Blue (Grand Mercure)",
    sourceUrl: "https://www.zomato.com/mysore/by-the-blue-grand-mercure-mysuru-yadavagiri",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Olive Garden (Windflower)": {
    name: "Olive Garden (Windflower)",
    sourceUrl: "https://www.zomato.com/mysore/the-olive-garden-the-windflower-resorts-spa-nazarbad",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Parklane Hotel": {
    name: "Parklane Hotel",
    sourceUrl: "https://www.zomato.com/mysore/parklane-hotel-restaurant-doora",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Lalitha Mahal Palace Hotel": {
    name: "Lalitha Mahal Palace Hotel",
    sourceUrl: "https://www.zomato.com/mysore/lalitha-mahal-palace-hotel-siddhartha-layout",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Mezzaluna": {
    name: "Mezzaluna",
    sourceUrl: "https://www.zomato.com/mysore/mezzaluna-continental-gokulam",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Oyster Bay": {
    name: "Oyster Bay",
    sourceUrl: "https://www.zomato.com/mysore/oyster-bay-vijayanagar",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Infinit Lounge Bar": {
    name: "Infinit Lounge Bar",
    sourceUrl: "https://www.zomato.com/mysore/infinit-lounge-bar-chamarajapura",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Meat Specialists & Andhra / Coastal ---
  "Poojari's Fish Land": {
    name: "Poojari's Fish Land",
    sourceUrl: "https://www.zomato.com/mysore/poojaris-fish-land-srirangapatna",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "RRR 'Mysuru'": {
    name: "RRR 'Mysuru'",
    sourceUrl: "https://www.zomato.com/mysore/hotel-rrr-mysore-locality",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Empire Restaurant": {
    name: "Empire Restaurant",
    sourceUrl: "https://hotelempire.in/",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Sepoy's Phirangi": {
    name: "Sepoy's Phirangi",
    sourceUrl: "https://www.zomato.com/mysore/sepoys-phirangi-v-v-mohalla",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Cafes & Coffee Roasters ---
  "Depth N Green": {
    name: "Depth N Green",
    sourceUrl: "https://depthngreen.com/",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
  "Tina's Cafe": {
    name: "Tina's Cafe",
    sourceUrl: "https://www.zomato.com/mysore/tinas-cafe-gokulam",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Minimal Coffee Roasters": {
    name: "Minimal Coffee Roasters",
    sourceUrl: "https://www.zomato.com/mysore/minimal-coffee-roasters-gokulam",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Bakeries & Dessert Shops ---
  "Sapa Sourdough & Pastry": {
    name: "Sapa Sourdough & Pastry",
    sourceUrl: "https://www.sapabakery.com",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
  "Glen's Bakehouse": {
    name: "Glen's Bakehouse",
    sourceUrl: "https://www.glensbakehouse.com/",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Frosting": {
    name: "Frosting",
    sourceUrl: "https://www.zomato.com/mysore/frosting-v-v-mohalla",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },

  // --- Ice Cream & Sweets ---
  "Corner House Ice Cream": {
    name: "Corner House Ice Cream",
    sourceUrl: "https://www.zomato.com/mysore/corner-house-ice-cream-1-gokulam",
    verificationStatus: "partially_verified",
    verifiedAt: "2026-10-24",
  },
  "Polar Bear Ice Cream": {
    name: "Polar Bear Ice Cream",
    sourceUrl: "https://polarbear.co.in/store-locator/",
    verificationStatus: "verified",
    verifiedAt: "2026-10-24",
  },
};
