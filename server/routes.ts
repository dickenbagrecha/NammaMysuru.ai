import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerChatRoutes } from "./replit_integrations/chat";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI Integration Routes (Voice Chat)
  registerAudioRoutes(app);
  registerChatRoutes(app);

  // === Tourist Spots API ===
  app.get(api.spots.list.path, async (req, res) => {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    const spots = await storage.getTouristSpots();
    res.json(spots);
  });

  app.get(api.spots.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid tourist spot id" });
    }

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    const spot = await storage.getTouristSpot(id);
    if (!spot) {
      return res.status(404).json({ message: "Tourist Spot not found" });
    }
    res.json(spot);
  });

  // === Restaurants API ===
  app.get(api.restaurants.list.path, async (req, res) => {
    const querySchema = z.object({
      cuisine: z.string().optional(),
      priceRange: z.string().optional(),
      isVegetarian: z.coerce.boolean().optional(),
    });

    const filters = querySchema.parse(req.query);
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    const restaurants = await storage.getRestaurants(filters);
    res.json(restaurants);
  });

  app.get(api.restaurants.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    const restaurant = await storage.getRestaurant(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const spots = [
    {
      name: "Mysuru Palace (Amba Vilas Palace)",
      description: "A historical palace and a royal residence at Mysore. It is incredibly grand and illuminated with nearly 100,000 light bulbs on Sundays and public holidays.",
      location: "Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru",
      imageUrl: "/images/spots/mysuru-palace-amba-vilas-palace.jpg",
      visitingHours: "10:00 AM - 5:30 PM",
      ticketPrice: "Adults: ₹70, Children: ₹30, Foreigners: ₹200",
    },
    {
      name: "Brindavan Gardens (KRS)",
      description: "A garden located in the Mandya District of Karnataka, India. It lies adjoining the Krishnarajasagara Dam which is built across the river Kaveri.",
      location: "KRS Dam Road, Krishna Raja Sagara, Mandya",
      imageUrl: "/images/spots/brindavan-gardens-krs.jpg",
      visitingHours: "6:00 AM - 8:00 PM",
      ticketPrice: "Adults: ₹50, Children: ₹10",
    },
    {
      name: "Chamundi Hills & Sri Chamundeshwari Temple",
      description: "Famous for the Chamundeshwari Temple atop the hill. It offers a panoramic view of the city.",
      location: "Chamundi Hill, Mysuru",
      imageUrl: "/images/spots/chamundi-hills-sri-chamundeshwari-temple.jpg",
      visitingHours: "7:30 AM - 2:00 PM, 3:30 PM - 6:00 PM, 7:30 PM - 9:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "St. Philomena's Cathedral",
      description: "A Catholic church that is the cathedral of the Diocese of Mysore, India. It is recognized as the second tallest church in Asia.",
      location: "Lashkar Mohalla, Ashoka Road, Mysuru",
      imageUrl: "/images/spots/st-philomenas-cathedral.jpg",
      visitingHours: "5:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Sri Chamarajendra Zoological Gardens (Mysuru Zoo)",
      description: "Sri Chamarajendra Zoological Gardens is one of the oldest and most popular zoos in India, home to a wide range of wild species.",
      location: "Indiranagar, Mysuru",
      imageUrl: "/images/spots/sri-chamarajendra-zoological-gardens-mysuru-zoo.jpg",
      visitingHours: "8:30 AM - 5:30 PM (Tuesday Closed)",
      ticketPrice: "Adults: ₹100, Children: ₹50",
    },
    {
      name: "Jaganmohan Palace Art Gallery",
      description: "A palace in Mysore, India. It was completed in 1861 and was used by the Wodeyars of Mysore when their main residence Amba Vilas Palace was under construction.",
      location: "Deshika Rd, Chamrajpura, Mysuru",
      imageUrl: "/images/spots/jaganmohan-palace-art-gallery.jpg",
      visitingHours: "10:00 AM - 5:30 PM",
      ticketPrice: "Adults: ₹40, Children: ₹20",
    },
    {
      name: "Mysuru Rail Museum",
      description: "The museum has a rich collection of photographs and objects related to the development of railways in the region.",
      location: "KRS Rd, Medar Block, Yadavagiri, Mysuru",
      imageUrl: "/images/spots/mysuru-rail-museum.jpg",
      visitingHours: "10:00 AM - 5:30 PM (Monday Closed)",
      ticketPrice: "Adults: ₹15, Children: ₹10",
    },
    {
      name: "Karanji Lake Nature Park",
      description: "A lake located in the city of Mysore in the state of Karnataka, India. The lake is surrounded by a nature park consisting of a butterfly park and a walk-through aviary.",
      location: "Indiranagar, Mysuru",
      imageUrl: "/images/spots/karanji-lake-nature-park.jpg",
      visitingHours: "8:30 AM - 5:30 PM (Tuesday Closed)",
      ticketPrice: "Adults: ₹10, Children: ₹5",
    },
    {
      name: "Lalitha Mahal Palace Hotel",
      description: "The second largest palace in Mysore. It is located near the Chamundi Hills, east of the city.",
      location: "Lalitha Mahal Palace Rd, Mysuru",
      imageUrl: "/images/spots/lalitha-mahal-palace-hotel.jpg",
      visitingHours: "10:00 AM - 6:00 PM",
      ticketPrice: "Entry: ₹100",
    },
    {
      name: "Mysuru Sand Sculpture Museum",
      description: "A unique museum dedicated to sand sculptures, showcasing intricate art made solely from sand and water.",
      location: "Chamundi Hill Rd, KC Layout, Mysuru",
      imageUrl: "/images/spots/mysuru-sand-sculpture-museum.jpg",
      visitingHours: "8:30 AM - 6:30 PM",
      ticketPrice: "Adults: ₹40, Children: ₹20",
    },
    {
      name: "Venugopala Swamy Temple, Hosa Kannambadi",
      description: "An ancient temple that was submerged in the KRS dam backwaters and recently relocated and restored. It is an architectural marvel.",
      location: "Hosa Kannambadi, Near KRS Dam, Mysuru",
      imageUrl: "/images/spots/venugopala-swamy-temple-hosa-kannambadi.jpg",
      visitingHours: "9:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Sri Ranganathaswamy Temple, Srirangapatna",
      description: "Located in Srirangapatna, this is one of the most important Vaishnavite shrines in South India, dedicated to Lord Ranganatha.",
      location: "Srirangapatna, Mandya",
      imageUrl: "/images/spots/sri-ranganathaswamy-temple-srirangapatna.jpg",
      visitingHours: "7:30 AM - 1:00 PM, 4:00 PM - 8:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Ranganathittu Bird Sanctuary",
      description: "A bird sanctuary in the Mandya District of the state of Karnataka in India. It is the largest bird sanctuary in the state, on the banks of the Kaveri river.",
      location: "Ranganathittu Rd, Srirangapatna, Mandya",
      imageUrl: "/images/spots/ranganathittu-bird-sanctuary.jpg",
      visitingHours: "9:00 AM - 6:00 PM",
      ticketPrice: "Adults: ₹70, Children: ₹35",
    },
    {
      name: "GRS Fantasy Park",
      description: "An amusement and water park located in Mysore. It offers a wide variety of dry and wet rides for all age groups.",
      location: "KRS Rd, Metagalli, Mysuru",
      imageUrl: "/images/spots/grs-fantasy-park.jpg",
      visitingHours: "10:30 AM - 6:00 PM",
      ticketPrice: "Adults: ₹749, Children: ₹649",
    },
    {
      name: "Melody World Wax Museum",
      description: "A unique museum showcasing a large collection of musical instruments and wax statues of musicians from around the world.",
      location: "Kurubara Halli, Siddhartha Layout, Mysuru",
      imageUrl: "/images/spots/melody-world-wax-museum.jpg",
      visitingHours: "9:30 AM - 7:00 PM",
      ticketPrice: "Entry: ₹30",
    },
    {
      name: "Kukkarahalli Lake",
      description: "A scenic lake located in the heart of Mysuru, perfect for nature walks and bird watching. It inspired many poets and writers.",
      location: "Manasagangothri, Mysuru",
      imageUrl: "/images/spots/kukkarahalli-lake.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Chennakeshava Temple, Somanathapura",
      description: "A stunning 13th-century Hoysala temple located near Mysore. It is a UNESCO World Heritage site known for its intricate carvings.",
      location: "Somanathapura, Mysuru District",
      imageUrl: "/images/spots/chennakeshava-temple-somanathapura.jpg",
      visitingHours: "9:00 AM - 5:30 PM",
      ticketPrice: "Adults: ₹25",
    },
    {
      name: "Kishkindha Moolika Bonsai Garden",
      description: "Located within the Avadhoota Datta Peetham, this garden houses over 450 bonsai trees and is a visual treat for plant lovers.",
      location: "Datta Peetham, Ooty Road, Mysuru",
      imageUrl: "/images/spots/kishkindha-moolika-bonsai-garden.jpg",
      visitingHours: "9:30 AM - 12:30 PM, 3:30 PM - 5:30 PM (Wednesday Closed)",
      ticketPrice: "Entry: ₹20",
    },
    {
      name: "Devaraja Market, Mysuru",
      description: "A vibrant and historic market in Mysuru. It is a sensory delight with colorful mounds of kumkum, flowers, fruits, and vegetables.",
      location: "Sayyaji Rao Rd, Devaraja Mohalla, Mysuru",
      imageUrl: "/images/spots/devaraja-market-mysuru.jpg",
      visitingHours: "6:00 AM - 9:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Regional Museum of Natural History",
      description: "Located on the banks of Karanji Lake, this museum provides an opportunity to explore the natural world and environmental conservation.",
      location: "Siddhartha Nagar, Mysuru",
      imageUrl: "/images/spots/regional-museum-of-natural-history.jpg",
      visitingHours: "10:00 AM - 6:00 PM (Monday Closed)",
      ticketPrice: "Free",
    },
    {
      name: "Dariya Daulat Bagh (Tipu Sultan's Summer Palace)",
      description: "Tipu Sultan's summer palace, built in 1784. This wooden palace is set in a beautiful garden and features exquisite murals.",
      location: "Srirangapatna, Mandya",
      imageUrl: "/images/spots/dariya-daulat-bagh-tipu-sultans-summer-palace.jpg",
      visitingHours: "9:00 AM - 5:00 PM",
      ticketPrice: "Adults: ₹15, Foreigners: ₹200",
    },
    {
      name: "Gumbaz-e-Shahi, Srirangapatna",
      description: "The burial chamber of Tipu Sultan, his father Hyder Ali, and mother Fakr-Un-Nisa. It is built in the Persian style of architecture.",
      location: "Srirangapatna, Mandya",
      imageUrl: "/images/spots/gumbaz-e-shahi-srirangapatna.jpg",
      visitingHours: "8:00 AM - 6:30 PM",
      ticketPrice: "Free",
    },
    {
      name: "Jayalakshmi Vilas Mansion & Folklore Museum",
      description: "A heritage building located in the University of Mysore campus. It houses the folklore museum, which has an impressive collection of artifacts.",
      location: "Manasagangothri, Mysuru",
      imageUrl: "/images/spots/jayalakshmi-vilas-mansion-folklore-museum.jpg",
      visitingHours: "10:00 AM - 5:30 PM (Sunday Closed)",
      ticketPrice: "Free",
    },
    {
      name: "Lingambudhi Lake",
      description: "A serene lake and a biodiversity hotspot located in Mysuru. It attracts a large number of migratory birds.",
      location: "Lingabudi Palya, Mysuru",
      imageUrl: "/images/spots/lingambudhi-lake.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Balmuri Falls",
      description: "A small water cascade located near Mysuru. It is a popular picnic spot and filming location.",
      location: "Balmuri, Yadathittu, Mandya",
      imageUrl: "/images/spots/balmuri-falls.jpg",
      visitingHours: "6:00 AM - 7:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Srikanteshwara Temple, Nanjangud",
      description: "An ancient temple dedicated to Lord Shiva, located on the banks of the Kapila River. It is known as the 'Dakshina Kashi'.",
      location: "Nanjangud, Mysuru District",
      imageUrl: "/images/spots/srikanteshwara-temple-nanjangud.jpg",
      visitingHours: "6:00 AM - 1:00 PM, 4:00 PM - 8:30 PM",
      ticketPrice: "Free",
    },
    {
      name: "Namdroling Monastery (Golden Temple), Bylakuppe",
      description: "Located in Bylakuppe, this is the largest teaching center of the Nyingma lineage of Tibetan Buddhism in the world.",
      location: "Bylakuppe, Mysuru District",
      imageUrl: "/images/spots/namdroling-monastery-golden-temple-bylakuppe.jpg",
      visitingHours: "9:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Cheluvanarayana Swamy Temple, Melukote",
      description: "A sacred pilgrimage center built on a rocky hill called Yadavagiri. It is famous for the Vairamudi Utsav.",
      location: "Melukote, Mandya District",
      imageUrl: "/images/spots/cheluvanarayana-swamy-temple-melukote.jpg",
      visitingHours: "7:30 AM - 1:00 PM, 4:00 PM - 8:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Talakadu Panchalinga Temples",
      description: "A historic site known for its sand dunes that cover ancient temples. The Vaidyanatheshwara temple is a key attraction here.",
      location: "Talakadu, Mysuru District",
      imageUrl: "/images/spots/talakadu-panchalinga-temples.jpg",
      visitingHours: "8:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Shivanasamudra Falls (Gaganachukki & Bharachukki)",
      description: "A spectacular waterfall on the banks of the river Kaveri. It is segmented into two falls - Gaganachukki and Barachukki.",
      location: "Shivanasamudra, Mandya District",
      imageUrl: "/images/spots/shivanasamudra-falls-gaganachukki-bharachukki.jpg",
      visitingHours: "8:00 AM - 5:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Bandipur National Park & Tiger Reserve",
      description: "One of India's best preserved national parks, located in the Western Ghats. It is home to tigers, elephants, and diverse wildlife.",
      location: "Bandipur, Chamarajanagar District",
      imageUrl: "/images/spots/bandipur-national-park-tiger-reserve.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Safari: ₹300 onwards",
    },
    {
      name: "Srirangapatna Fort",
      description: "A historical fort where Tipu Sultan fought against the British. It encloses the Ranganathaswamy Temple and other monuments.",
      location: "Srirangapatna, Mandya District",
      imageUrl: "/images/spots/srirangapatna-fort.jpg",
      visitingHours: "Open all day",
      ticketPrice: "Free",
    },
    {
      name: "Himavad Gopalaswamy Betta",
      description: "The highest peak in the Bandipur National Park, known for the 14th-century temple dedicated to Gopalaswamy and arguably the best view in the region.",
      location: "Gundlupet, Chamarajanagar District",
      imageUrl: "/images/spots/himavad-gopalaswamy-betta.jpg",
      visitingHours: "8:30 AM - 4:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Karighatta Viewpoint",
      description: "A hillock near Srirangapatna giving a bird's eye view of Mysore and Srirangapatna. 'Karighatta' translates to 'Black Hill'.",
      location: "Karighatta, Srirangapatna",
      imageUrl: "/images/spots/karighatta-viewpoint.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Nagarahole National Park (Kabini)",
      description: "A premier tiger reserve also known as Rajiv Gandhi National Park. It is famous for its high density of tigers and Asiatic elephants.",
      location: "Hunsur, Mysuru District",
      imageUrl: "/images/spots/nagarahole-national-park-kabini.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Safari: ₹300 onwards",
    },
    {
      name: "Nimishambha Temple, Ganjam",
      description: "A famous temple dedicated to Goddess Nimishambha, an incarnation of Parvati, located on the banks of the Kaveri river.",
      location: "Ganjam, Srirangapatna",
      imageUrl: "/images/spots/nimishambha-temple-ganjam.jpg",
      visitingHours: "6:30 AM - 8:30 PM",
      ticketPrice: "Free",
    },
    {
      name: "Colonel Bailey's Dungeon, Srirangapatna",
      description: "A historic dungeon where Tipu Sultan imprisoned British officers, including Colonel Bailey, who died here in 1780.",
      location: "Srirangapatna, Mandya District",
      imageUrl: "/images/spots/colonel-baileys-dungeon-srirangapatna.jpg",
      visitingHours: "8:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Edmuri Falls",
      description: "A small waterfall located about 3 km from the city. It is a popular spot for swimming and playing in the water.",
      location: "Edmuri, Mysuru District",
      imageUrl: "/images/spots/edmuri-falls.jpg",
      visitingHours: "6:00 AM - 7:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Sangama, Srirangapatna",
      description: "The confluence of three holy rivers: Kaveri, Lokapavani, and Hemavati. It is considered a sacred spot for performing rituals.",
      location: "Srirangapatna, Mandya District",
      imageUrl: "/images/spots/sangama-srirangapatna.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Biligiri Ranganathaswamy Hills (BR Hills)",
      description: "A hill range situated at the confluence of the Western and Eastern Ghats. It's known for the Biligiriranganatha Swamy Temple and wildlife sanctuary.",
      location: "Yelandur, Chamarajanagar District",
      imageUrl: "/images/spots/biligiri-ranganathaswamy-hills-br-hills.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free (Safari charges extra)",
    },
    {
      name: "Nandi Statue, Chamundi Hills",
      description: "A colossal monolith of Nandi, the sacred bull of Lord Shiva, carved out of a single piece of black granite. It is one of the largest in India.",
      location: "Chamundi Hill, Mysuru",
      imageUrl: "/images/spots/nandi-statue-chamundi-hills.jpg",
      visitingHours: "7:30 AM - 9:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "KSIC Mysore Silk Factory",
      description: "The historic factory where the world-famous Mysore Silk sarees are manufactured. Visitors can witness the intricate process of silk weaving.",
      location: "Manandavadi Road, Ashokapuram, Mysuru",
      imageUrl: "/images/spots/ksic-mysore-silk-factory.jpg",
      visitingHours: "10:30 AM - 6:00 PM (Sunday Closed)",
      ticketPrice: "Entry: ₹15",
    },
    {
      name: "Shuka Vana",
      description: "A unique rehabilitation centre for birds, especially parrots. It holds a Guinness World Record for housing the most bird species in an aviary.",
      location: "Datta Peetham, Ooty Road, Mysuru",
      imageUrl: "/images/spots/shuka-vana.jpg",
      visitingHours: "9:30 AM - 12:30 PM, 3:30 PM - 5:30 PM (Wednesday Closed)",
      ticketPrice: "Free",
    },
    {
      name: "Chunchanakatte Falls",
      description: "A beautiful waterfall on the Kaveri river, where the water cascades down in two small falls. It is also famous for the nearby Kodanda Rama temple.",
      location: "Krishnarajanagara, Mysuru District",
      imageUrl: "/images/spots/chunchanakatte-falls.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Thonnur Lake (Thonnur Kere)",
      description: "An ancient and massive man-made lake constructed by the Hoysala king Vishnuvardhana. It is a tranquil spot perfect for boating and picnics.",
      location: "Pandavapura, Mandya District",
      imageUrl: "/images/spots/thonnur-lake-thonnur-kere.jpg",
      visitingHours: "Open all day",
      ticketPrice: "Free",
    },
    {
      name: "Kunti Betta",
      description: "A picturesque hillock that is a favorite among trekkers and adventure enthusiasts. It holds mythological significance related to the Pandavas.",
      location: "Pandavapura, Mandya District",
      imageUrl: "/images/spots/kunti-betta.jpg",
      visitingHours: "Open all day (Trekking ideal in mornings)",
      ticketPrice: "Free",
    },
    {
      name: "Kokkare Bellur Bird Sanctuary",
      description: "A famous village where rare birds like the Painted Stork and Spot-billed Pelicans live in harmony with the local villagers.",
      location: "Maddur Taluk, Mandya District",
      imageUrl: "/images/spots/kokkare-bellur-bird-sanctuary.jpg",
      visitingHours: "6:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Jama Masjid, Srirangapatna",
      description: "Built by Tipu Sultan in 1784, this mosque features elegant minarets and a blend of Islamic and Hindu architectural styles.",
      location: "Srirangapatna, Mandya District",
      imageUrl: "/images/spots/jama-masjid-srirangapatna.jpg",
      visitingHours: "8:00 AM - 6:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Someshwara Temple, Srirangapatna",
      description: "An ancient Hoysala temple dedicated to Lord Shiva, predating the more famous monuments in Srirangapatna.",
      location: "Srirangapatna, Mandya District",
      imageUrl: "/images/spots/someshwara-temple-srirangapatna.jpg",
      visitingHours: "7:00 AM - 12:00 PM, 5:00 PM - 8:00 PM",
      ticketPrice: "Free",
    },
    {
      name: "Cheluvamba Mansion (CFTRI Campus)",
      description: "A magnificent heritage mansion built by Krishnaraja Wodeyar IV. It now houses the Central Food Technological Research Institute (CFTRI).",
      location: "KRS Road, Mysuru",
      imageUrl: "/images/spots/cheluvamba-mansion-cftri-campus.jpg",
      visitingHours: "Outside view only",
      ticketPrice: "Free",
    },
  ]

  const existingSpots = await storage.getTouristSpots();
  const existingSpotSignature = existingSpots.map((spot) => spot.name + ":" + spot.imageUrl).join("|");
  const nextSpotSignature = spots.map((spot) => spot.name + ":" + spot.imageUrl).join("|");
  if (existingSpots.length !== spots.length || existingSpotSignature !== nextSpotSignature) {
    await storage.clearTouristSpots();
    for (const spot of spots) {
      await storage.createTouristSpot(spot);
    }
  }

  const restaurants = [
    {
      name: "Vinayaka Mylari",
      cuisine: "South Indian",
      priceRange: "Budget",
      rating: 5,
      isVegetarian: true,
      location: "Nazarbad, Mysuru",
      imageUrl: "https://b.zmtcdn.com/data/pictures/2/5400002/9e9d6e469e5d4e0e5a5e5e5e5e5e5e5e.jpg",
    },
    {
      name: "Gufha Restaurant",
      cuisine: "North Indian, Chinese",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Bangalore-Nilgiri Road, Mysuru",
      imageUrl: "https://media-cdn.tripadvisor.com/media/photo-s/0e/7e/3d/8b/gufha-restaurant-mysore.jpg",
    },
    {
      name: "Spring",
      cuisine: "Continental, Italian",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "Radisson Blu Plaza Hotel, Mysuru",
      imageUrl: "https://media-cdn.tripadvisor.com/media/photo-s/0d/8e/3d/8b/spring-restaurant.jpg",
    },
    {
      name: "Poojari's Fish Land",
      cuisine: "Seafood, Mangalorean",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Mysore-Bangalore Highway",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Fish_curry_rice.jpg/500px-Fish_curry_rice.jpg",
    },
    {
      name: "RRR 'Mysuru'",
      cuisine: "Andhra Style, Biryani",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: false,
      location: "Gandhi Square, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Chicken_Biryani.jpg/500px-Hyderabadi_Chicken_Biryani.jpg",
    },
    {
      name: "Royal Orchid Metropole",
      cuisine: "Multi-cuisine, Heritage",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "Jhansi Lakshmibai Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Royal_Orchid_Metropole_Mysore.jpg/500px-Royal_Orchid_Metropole_Mysore.jpg",
    },
    {
      name: "By The Way",
      cuisine: "North Indian, Continental",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Ring Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Outdoor_dining_area.jpg/500px-Outdoor_dining_area.jpg",
    },
    {
      name: "Oyster Bay",
      cuisine: "North Indian, Chinese, Coastal",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Kannada Sahitya Parishat Rd, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/500px-Good_Food_Display_-_NCI_Visuals_Online.jpg",
    },
    {
      name: "Mahesh Prasad",
      cuisine: "South Indian",
      priceRange: "Budget",
      rating: 5,
      isVegetarian: true,
      location: "Ballal Circle, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Dosa_chutney_sambar.jpg/500px-Dosa_chutney_sambar.jpg",
    },
    {
      name: "Infinit Lounge Bar",
      cuisine: "Continental, North Indian",
      priceRange: "Luxury",
      rating: 4,
      isVegetarian: false,
      location: "Nilgiri Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Rooftop_bar_at_night.jpg/500px-Rooftop_bar_at_night.jpg",
    },
    {
      name: "Depth N Green",
      cuisine: "Cafe, Healthy, Vegan options",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: true,
      location: "Gokulam, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Avocado_Toast_with_Poached_Egg.jpg/500px-Avocado_Toast_with_Poached_Egg.jpg",
    },
    {
      name: "Old House",
      cuisine: "Italian, Pizza, Continental",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: true,
      location: "RTO Circle, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pizza_Margherita_stu_spivack.jpg/500px-Pizza_Margherita_stu_spivack.jpg",
    },
    {
      name: "Empire Restaurant",
      cuisine: "North Indian, Kebabs, Biryani",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Kalidasa Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Roasted_chicken.jpg/500px-Roasted_chicken.jpg",
    },
    {
      name: "Hotel Hanumanthu",
      cuisine: "Nati Style, Mutton Pulao",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: false,
      location: "Mandi Mohalla, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mutton_Biryani.jpg/500px-Mutton_Biryani.jpg",
    },
    {
      name: "Gayatri Tiffin Room (GTR)",
      cuisine: "South Indian Breakfast",
      priceRange: "Budget",
      rating: 5,
      isVegetarian: true,
      location: "Chamundipuram, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Idli_Sambar_Coconut_Chutney.jpg/500px-Idli_Sambar_Coconut_Chutney.jpg",
    },
    {
      name: "Tegu Mess",
      cuisine: "Local Non-Veg",
      priceRange: "Budget",
      rating: 5,
      isVegetarian: false,
      location: "Jayalakshmipuram, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Chicken_Curry_Rice.jpg/500px-Chicken_Curry_Rice.jpg",
    },
    {
      name: "Lalitha Mahal Palace Hotel",
      cuisine: "Royal Indian, Continental",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "Lalitha Mahal Palace Rd, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Lalitha_Mahal_Palace_Hotel.jpg/500px-Lalitha_Mahal_Palace_Hotel.jpg",
    },
    {
      name: "Tiger Trail (Metropole)",
      cuisine: "North Indian, Coastal",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "Jhansi Lakshmibai Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Indian_Spices.jpg/500px-Indian_Spices.jpg",
    },
    {
      name: "Tina's Cafe",
      cuisine: "Continental, Home-style",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: false,
      location: "Gokulam, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/500px-Hamburger_%28black_bg%29.jpg",
    },
    {
      name: "Sapa Sourdough & Pastry",
      cuisine: "Bakery, Cafe, European",
      priceRange: "High-end",
      rating: 5,
      isVegetarian: false,
      location: "Jayalakshmipuram, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Croissant_%281%29.jpg/500px-Croissant_%281%29.jpg",
    },
    {
      name: "Minimal Coffee Roasters",
      cuisine: "Coffee, Cafe",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: true,
      location: "Gokulam, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/500px-A_small_cup_of_coffee.JPG",
    },
    {
      name: "Glen's Bakehouse",
      cuisine: "Bakery, Continental, Desserts",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Vani Vilas Mohalla, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Chocolate_Cupcakes.jpg/500px-Chocolate_Cupcakes.jpg",
    },
    {
      name: "Corner House Ice Cream",
      cuisine: "Desserts, Ice Cream",
      priceRange: "Mid-range",
      rating: 5,
      isVegetarian: true,
      location: "Multiple Locations, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Strawberry_ice_cream_cone_%285076899310%29.jpg/500px-Strawberry_ice_cream_cone_%285076899310%29.jpg",
    },
    {
      name: "Polar Bear Ice Cream",
      cuisine: "Desserts, Ice Cream Sundaes",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: true,
      location: "Multiple Locations, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer.jpg/500px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer.jpg",
    },
    {
      name: "La Uppu (Grand Mercure)",
      cuisine: "International, Buffet",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "New Sayyaji Rao Rd, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/500px-Good_Food_Display_-_NCI_Visuals_Online.jpg",
    },
    {
      name: "By the Blue (Grand Mercure)",
      cuisine: "North Indian, Poolside",
      priceRange: "Luxury",
      rating: 5,
      isVegetarian: false,
      location: "New Sayyaji Rao Rd, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Rooftop_bar_at_night.jpg/500px-Rooftop_bar_at_night.jpg",
    },
    {
      name: "Olive Garden (Windflower)",
      cuisine: "Multi-cuisine, Open Air",
      priceRange: "Luxury",
      rating: 4,
      isVegetarian: false,
      location: "Nazarbad, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Outdoor_dining_area.jpg/500px-Outdoor_dining_area.jpg",
    },
    {
      name: "Mezzaluna",
      cuisine: "Continental, Indian",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Gokulam, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pizza_Margherita_stu_spivack.jpg/500px-Pizza_Margherita_stu_spivack.jpg",
    },
    {
      name: "Frosting",
      cuisine: "Italian, Cafe, Bakery",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Vani Vilas Mohalla, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Croissant_%281%29.jpg/500px-Croissant_%281%29.jpg",
    },
    {
      name: "Parklane Hotel",
      cuisine: "Indian, Continental, Beer",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Sri Harsha Rd, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Rooftop_bar_at_night.jpg/500px-Rooftop_bar_at_night.jpg",
    },
    {
      name: "Sepoy's Phirangi",
      cuisine: "North Indian, Mughlai",
      priceRange: "Mid-range",
      rating: 4,
      isVegetarian: false,
      location: "Vani Vilas Mohalla, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Chicken_Biryani.jpg/500px-Hyderabadi_Chicken_Biryani.jpg",
    },
    {
      name: "Jalpaan",
      cuisine: "North Indian, Italian, Mexican (Veg)",
      priceRange: "High-end",
      rating: 5,
      isVegetarian: true,
      location: "Banni Mantap, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Dosa_chutney_sambar.jpg/500px-Dosa_chutney_sambar.jpg",
    },
    {
      name: "Green Leaf",
      cuisine: "South Indian, North Indian",
      priceRange: "Budget",
      rating: 4,
      isVegetarian: true,
      location: "Kalidasa Road, Mysuru",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Idli_Sambar_Coconut_Chutney.jpg/500px-Idli_Sambar_Coconut_Chutney.jpg",
    }
  ];

  const existingRestaurants = await storage.getRestaurants();
  const existingRestaurantSignature = existingRestaurants.map((r) => r.name + ":" + r.imageUrl).join("|");
  const nextRestaurantSignature = restaurants.map((r) => r.name + ":" + r.imageUrl).join("|");
  if (existingRestaurants.length !== restaurants.length || existingRestaurantSignature !== nextRestaurantSignature) {
    await storage.clearRestaurants();
    for (const restaurant of restaurants) {
      await storage.createRestaurant(restaurant);
    }
  }
}
