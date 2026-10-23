import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRestaurants } from "@/hooks/use-restaurants";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Restaurants() {
  const [filterVeg, setFilterVeg] = useState<boolean | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
  const [cuisine, setCuisine] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: restaurants, isLoading, error } = useRestaurants({
    isVegetarian: filterVeg,
    priceRange,
    cuisine,
  });

  const clearFilters = () => {
    setFilterVeg(undefined);
    setPriceRange(undefined);
    setCuisine(undefined);
    setSearch("");
  };

  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants ?? [];
    return (restaurants ?? []).filter((r) =>
      [r.name, r.cuisine, r.location].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [restaurants, search]);

  // Featured historic sweet houses from Stitch Culinary Guide
  const sweetHouses = [
    {
      name: "Guru Sweets Mart",
      subtitle: "Ancestral Creators of Mysore Pak",
      era: "Est. 1935 CE",
      location: "Near Devaraja Market",
      desc: "Founded by the royal palace cook Kakasura Madappa. Experience the melt-in-mouth original recipe crafted with pure desi ghee and gram flour.",
      badge: "Palace Royal Kitchen Origin",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDa5zU322q_bV8jQ31oJ159g4W7PqF0lqJp4XhG01n87Rk8g2j0-81Xm-gC5f_496g49P2l2b0zP1h4962p1j",
    },
    {
      name: "Mahalakshmi Sweets",
      subtitle: "Traditional & Modern Varieties",
      era: "Est. 1991 CE",
      location: "Multiple Outlets across Mysuru",
      desc: "Famous for classic hard-porous ghee Mysore Pak and smooth kaju Mysore Pak gift boxes.",
      badge: "Popular Ghee Variety",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBn5ROWtX9TA6DYxmqDmSegAX7_DgA79oTY3PpTwYmS-dVOhwKMhNx7V5oF3a4lNzN-a4DIK2abLAP00vkbnWRrH1iRRDPLUq7erW_2ToVhKmD-3QHurWIhHQRRLqPTBiUPWXoQFGGf4aZWOaQp-8RPJNsWa-5CA5fWJcGBQZHLlkAs1duM90ESkeEU1BAZKMzHsXi3TePDLCqLwKt-5RlDQGUlBRljTYqUeqLKokogwTItE4U2shAa",
    },
    {
      name: "Hotel Vinayaka Mylari",
      subtitle: "Legendary Melt-in-Mouth Dosa",
      era: "Est. 1938 CE",
      location: "Nazarbad Main Road",
      desc: "World-renowned for its feather-light butter masala dosa served on banana leaves with freshly ground coconut chutney.",
      badge: "Culinary Legend",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDEenEszN-t7MLxn3q9DhTR5X0l6BmH0DC0veBqYFdx1_Mc9u32i00hY9syaps3RntXfBkNx6CtwwFmadFyJUa0q31FMB2cQDOUjc-un_pWMYSg8BEflPQj-C_nPsI49jDntBisoEmyBaVxcD1YRmHzMcCFndwvuY0sMnQE0ReoATQFW63_k3q1idD59w2GC85Qf-Br6HWWk746zxN6bofDueGV5IUQQh0p4zH3qG6HKFEXnM1t8RJn",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans selection:bg-stitch-primary-container selection:text-white">
      <Header />

      <main className="flex-grow pb-24 md:pb-12">
        {/* Top Jaali Pattern Culinary Header */}
        <section className="relative w-full bg-stitch-surface-container-low overflow-hidden pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stitch-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stitch-secondary-fixed/40 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-stitch-secondary-container/30 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
            {/* Breadcrumb & Live GI Tag */}
            <div className="flex flex-wrap items-center gap-2 text-stitch-on-surface-variant text-xs">
              <span className="text-stitch-secondary font-bold uppercase tracking-widest">
                Gastronomy &amp; Royal Flavors
              </span>
              <span className="text-stitch-outline-variant">•</span>
              <span>Mysore Confectionery Heritage</span>
              <span className="text-stitch-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stitch-secondary-container text-stitch-on-secondary-container font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-stitch-secondary animate-ping" />
                GI Tag Authenticity
              </span>
            </div>

            {/* Main Headline */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stitch-primary tracking-tight">
                  Culinary Heritage &amp; The Mysore Pak Legend
                </h1>
                <p className="mt-3 text-sm sm:text-base text-stitch-on-surface-variant max-w-2xl leading-relaxed">
                  From Kakasura Madappa’s royal kitchen innovation in 1935 to century-old Mylari butter dosas and filter kaapi rituals, taste Mysuru&apos;s celebrated dining culture.
                </p>
              </div>

              {/* Culinary Metric Badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-stitch-outline-variant/30">
                <div className="text-center px-2">
                  <span className="block font-serif text-2xl font-bold text-stitch-secondary">1935 AD</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">Royal Origin</span>
                </div>
                <div className="text-center px-2 bg-stitch-surface-container-low rounded-lg py-1">
                  <span className="block font-serif text-2xl font-bold text-stitch-primary">100%</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">Pure Desi Ghee</span>
                </div>
                <div className="text-center px-2">
                  <span className="block font-serif text-2xl font-bold text-stitch-tertiary">GI Tag</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">State Protected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Alchemy of 1935 Story Spotlight Card */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stitch-outline-variant/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stitch-secondary-fixed text-stitch-on-secondary-fixed text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">history_edu</span>
                The Royal Kitchen Chronicle
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stitch-on-surface">
                The Alchemy of Kakasura Madappa
              </h2>
              <p className="text-xs sm:text-sm text-stitch-on-surface-variant leading-relaxed">
                When Maharaja Krishnaraja Wadiyar IV sat down for dinner at the Amba Vilas Palace, royal chef Kakasura Madappa concocted an unusual sweet using besan (gram flour), sugar syrup (paka), and generous amounts of pure melted ghee. Delighted by the heavenly creation, the King named it <strong>Mysore Paka</strong>. Today, that golden tradition lives on across the city.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-stitch-surface-container-low text-stitch-secondary font-semibold">
                  Gram Flour (Besan)
                </span>
                <span className="px-3 py-1 rounded-full bg-stitch-surface-container-low text-stitch-secondary font-semibold">
                  Cardamom Infusion
                </span>
                <span className="px-3 py-1 rounded-full bg-stitch-surface-container-low text-stitch-secondary font-semibold">
                  Desi Cow Ghee
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {sweetHouses.map((sweet, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all shadow-sm"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-stitch-outline-variant/30">
                    <img src={sweet.image} alt={sweet.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-stitch-on-surface truncate">
                        {sweet.name}
                      </span>
                      <span className="text-[10px] text-stitch-secondary font-bold uppercase">{sweet.era}</span>
                    </div>
                    <p className="text-[11px] text-stitch-on-surface-variant truncate">{sweet.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stitch-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stitch-secondary text-[20px]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurant or cuisine..."
                className="w-full pl-10 pr-3 py-2 bg-stitch-surface-container-low rounded-xl text-xs sm:text-sm text-stitch-on-surface focus:outline-none border border-stitch-outline-variant/30"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
              <button
                onClick={() => setFilterVeg(filterVeg === true ? undefined : true)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                  filterVeg === true
                    ? "bg-stitch-tertiary text-white border-stitch-tertiary"
                    : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                }`}
              >
                🌱 Pure Veg
              </button>

              <button
                onClick={() => setPriceRange(priceRange === "Budget" ? undefined : "Budget")}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                  priceRange === "Budget"
                    ? "bg-stitch-primary text-white border-stitch-primary"
                    : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                }`}
              >
                ₹ Budget
              </button>

              <button
                onClick={() => setPriceRange(priceRange === "Mid-range" ? undefined : "Mid-range")}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                  priceRange === "Mid-range"
                    ? "bg-stitch-primary text-white border-stitch-primary"
                    : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                }`}
              >
                ₹₹ Mid-Range
              </button>

              <button
                onClick={() => setCuisine(cuisine === "South Indian" ? undefined : "South Indian")}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                  cuisine === "South Indian"
                    ? "bg-stitch-secondary text-white border-stitch-secondary"
                    : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                }`}
              >
                South Indian
              </button>

              {(filterVeg !== undefined || priceRange !== undefined || cuisine !== undefined || search) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-stitch-primary font-bold hover:underline px-2 py-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Restaurant Cards Grid */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-low animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
              <h3 className="text-xl font-bold text-stitch-primary mb-2">Unable to load restaurants</h3>
              <p className="text-stitch-on-surface-variant text-sm">Please refresh or verify connection.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredRestaurants.map((restaurant, idx) => (
                <motion.article
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.04 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-stitch-outline-variant/30"
                >
                  <div>
                    {/* Arch Photo Banner */}
                    <div className="relative h-48 rounded-t-[2rem] overflow-hidden bg-stitch-surface-container-low">
                      <ImageWithFallback
                        src={restaurant.imageUrl || undefined}
                        alt={restaurant.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        fallbackType="dining"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stitch-surface/90 text-stitch-on-surface text-[11px] font-bold backdrop-blur-sm border border-stitch-outline-variant/30 shadow-sm">
                        {restaurant.cuisine || "Mysore Cuisine"}
                      </span>

                      {restaurant.isVegetarian && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed text-[11px] font-bold shadow-sm">
                          Pure Veg
                        </span>
                      )}
                    </div>

                    {/* Content details */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-stitch-secondary text-xs font-bold uppercase tracking-wider">
                        <span className="truncate">{restaurant.location}</span>
                        {restaurant.rating && restaurant.rating > 0 && (
                          <span className="flex items-center gap-1 bg-stitch-secondary-container px-2 py-0.5 rounded text-stitch-on-secondary-container font-bold text-xs">
                            ★ {restaurant.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-stitch-on-surface group-hover:text-stitch-primary transition-colors">
                        {restaurant.name}
                      </h3>

                      <p className="text-xs text-stitch-on-surface-variant line-clamp-3 leading-relaxed">
                        Authentic dining serving signature {restaurant.cuisine} delicacies in {restaurant.location}.
                      </p>

                      <div className="pt-2 flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium">
                          💰 {restaurant.priceRange}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium truncate max-w-[160px]">
                          📍 {restaurant.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-3 border-t border-stitch-outline-variant/20 flex items-center justify-between">
                    <span className="text-xs text-stitch-on-surface-variant font-medium">
                      Authentic Mysore Trail
                    </span>
                    <Link
                      href="/chat"
                      className="text-xs text-stitch-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Ask AI for Menu</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </motion.article>
              ))}

              {filteredRestaurants.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-stitch-outline-variant/30 p-8">
                  <span className="material-symbols-outlined text-[48px] text-stitch-secondary mb-3">
                    restaurant
                  </span>
                  <p className="text-stitch-on-surface font-serif text-xl font-bold">
                    No restaurants match your filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-stitch-primary text-white rounded-lg text-xs font-bold"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
