import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRestaurants } from "@/hooks/use-restaurants";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
type DietaryFilter =
  | "all"
  | "pure_veg"
  | "veg_and_non_veg"
  | "non_veg"
  | "vegan_friendly"
  | "jain_friendly";

type CategoryFilter =
  | ""
  | "restaurant"
  | "cafe"
  | "cafeteria"
  | "bakery"
  | "traditional"
  | "sweet_shop"
  | "juice_bar";

// ─── Constants ────────────────────────────────────────────────────────────────
const DIETARY_OPTIONS: { value: DietaryFilter; label: string; icon: string }[] = [
  { value: "all", label: "All Dining", icon: "restaurant" },
  { value: "pure_veg", label: "Pure Vegetarian", icon: "eco" },
  { value: "veg_and_non_veg", label: "Veg & Non-Veg", icon: "menu_book" },
  { value: "non_veg", label: "Non-Vegetarian", icon: "set_meal" },
  { value: "vegan_friendly", label: "Vegan-Friendly", icon: "psychiatry" },
  { value: "jain_friendly", label: "Jain-Friendly", icon: "self_improvement" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string; icon: string }[] = [
  { value: "", label: "All Categories", icon: "grid_view" },
  { value: "restaurant", label: "Restaurants", icon: "restaurant" },
  { value: "cafe", label: "Cafes & Coffee", icon: "coffee" },
  { value: "cafeteria", label: "Cafeterias", icon: "fastfood" },
  { value: "bakery", label: "Bakeries & Desserts", icon: "cake" },
  { value: "traditional", label: "Traditional Eateries", icon: "storefront" },
  { value: "sweet_shop", label: "Sweet Shops", icon: "icecream" },
  { value: "juice_bar", label: "Juice Bars & Tea", icon: "local_bar" },
];

const PRICE_OPTIONS = ["", "Budget", "Mid-range", "High-end", "Luxury"];
const PRICE_DISPLAY: Record<string, string> = {
  Budget: "Rs Budget",
  "Mid-range": "Rs Rs Mid-Range",
  "High-end": "Rs Rs Rs High-End",
  Luxury: "Rs Rs Rs Rs Luxury",
};
const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  cafeteria: "Cafeteria",
  bakery: "Bakery",
  traditional: "Traditional",
  sweet_shop: "Sweet Shop",
  juice_bar: "Juice Bar",
};

const sweetHouses = [
  {
    name: "Guru Sweets Mart",
    era: "Est. 1935 CE",
    desc: "Founded by the royal palace cook Kakasura Madappa. Original recipe crafted with pure desi ghee and gram flour.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa5zU322q_bV8jQ31oJ159g4W7PqF0lqJp4XhG01n87Rk8g2j0-81Xm-gC5f_496g49P2l2b0zP1h4962p1j",
  },
  {
    name: "Mahalakshmi Sweets",
    era: "Est. 1991 CE",
    desc: "Famous for classic hard-porous ghee Mysore Pak and smooth kaju Mysore Pak gift boxes.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn5ROWtX9TA6DYxmqDmSegAX7_DgA79oTY3PpTwYmS-dVOhwKMhNx7V5oF3a4lNzN-a4DIK2abLAP00vkbnWRrH1iRRDPLUq7erW_2ToVhKmD-3QHurWIhHQRRLqPTBiUPWXoQFGGf4aZWOaQp-8RPJNsWa-5CA5fWJcGBQZHLlkAs1duM90ESkeEU1BAZKMzHsXi3TePDLCqLwKt-5RlDQGUlBRljTYqUeqLKokogwTItE4U2shAa",
  },
  {
    name: "Hotel Vinayaka Mylari",
    era: "Est. 1938 CE",
    desc: "World-renowned for feather-light butter masala dosa served on banana leaves with freshly ground coconut chutney.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEenEszN-t7MLxn3q9DhTR5X0l6BmH0DC0veBqYFdx1_Mc9u32i00hY9syaps3RntXfBkNx6CtwwFmadFyJUa0q31FMB2cQDOUjc-un_pWMYSg8BEflPQj-C_nPsI49jDntBisoEmyBaVxcD1YRmHzMcCFndwvuY0sMnQE0ReoATQFW63_k3q1idD59w2GC85Qf-Br6HWWk746zxN6bofDueGV5IUQQh0p4zH3qG6HKFEXnM1t8RJn",
  },
];

// ─── Sub-component: Dietary Badge ─────────────────────────────────────────────
function DietaryBadge({ classification }: { classification: string | null | undefined }) {
  if (classification === "pure_veg") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
        <span className="material-symbols-outlined text-[11px]">eco</span>
        Pure Veg
      </span>
    );
  }
  if (classification === "non_veg") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
        <span className="material-symbols-outlined text-[11px]">set_meal</span>
        Non-Veg
      </span>
    );
  }
  if (classification === "veg_and_non_veg") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
        <span className="material-symbols-outlined text-[11px]">menu_book</span>
        Veg &amp; Non-Veg
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
      <span className="material-symbols-outlined text-[11px]">help_outline</span>
      Unverified
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Restaurants() {
  const [dietary, setDietary] = useState<DietaryFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("");
  const [priceRange, setPriceRange] = useState("");
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Build API filter params from dietary + other selectors
  const apiFilters = useMemo(() => {
    const base: Record<string, unknown> = {};
    if (category) base.category = category;
    if (priceRange) base.priceRange = priceRange;
    if (search.trim()) base.search = search.trim();
    if (minRating !== undefined) base.minRating = minRating;

    switch (dietary) {
      case "pure_veg":
        base.dietaryClassification = "pure_veg";
        break;
      case "veg_and_non_veg":
        base.dietaryClassification = "veg_and_non_veg";
        break;
      case "non_veg":
        // handled client-side below
        break;
      case "vegan_friendly":
        base.isVeganFriendly = true;
        break;
      case "jain_friendly":
        base.isJainFriendly = true;
        break;
      default:
        break;
    }
    return Object.keys(base).length ? base : undefined;
  }, [dietary, category, priceRange, search, minRating]);

  const { data: rawRestaurants, isLoading, error } = useRestaurants(
    apiFilters as Parameters<typeof useRestaurants>[0]
  );

  // Client-side post-filter for "non_veg" (both non_veg and veg_and_non_veg serve non-veg food)
  const restaurants = useMemo(() => {
    if (!rawRestaurants) return [];
    if (dietary === "non_veg") {
      return rawRestaurants.filter(
        (r) =>
          r.dietaryClassification === "non_veg" ||
          r.dietaryClassification === "veg_and_non_veg"
      );
    }
    return rawRestaurants;
  }, [rawRestaurants, dietary]);

  const activeFiltersCount = [
    dietary !== "all",
    !!category,
    !!priceRange,
    !!search.trim(),
    minRating !== undefined,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDietary("all");
    setCategory("");
    setPriceRange("");
    setSearch("");
    setMinRating(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans">
      <Header />

      <main className="flex-grow pb-24 md:pb-12">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative w-full bg-stitch-surface-container-low overflow-hidden pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stitch-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stitch-secondary-fixed/40 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-stitch-secondary-container/30 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
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

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stitch-primary tracking-tight">
                  Culinary Heritage &amp; The Mysore Pak Legend
                </h1>
                <p className="mt-3 text-sm sm:text-base text-stitch-on-surface-variant max-w-2xl leading-relaxed">
                  From Kakasura Madappa's royal kitchen innovation in 1935 to century-old Mylari butter dosas and
                  filter kaapi rituals, taste Mysuru's celebrated dining culture.
                </p>
              </div>
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

        {/* ── Story Card ─────────────────────────────────────────────── */}
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
                When Maharaja Krishnaraja Wadiyar IV sat down for dinner at the Amba Vilas Palace, royal chef
                Kakasura Madappa concocted an unusual sweet using besan, sugar syrup (paka), and generous amounts of
                pure melted ghee. The King named it <strong>Mysore Paka</strong>. That golden tradition lives on.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                {["Gram Flour (Besan)", "Cardamom Infusion", "Desi Cow Ghee"].map((i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-stitch-surface-container-low text-stitch-secondary font-semibold">
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {sweetHouses.map((s, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all shadow-sm">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-stitch-outline-variant/30">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-stitch-on-surface truncate">{s.name}</span>
                      <span className="text-[10px] text-stitch-secondary font-bold uppercase shrink-0 ml-2">{s.era}</span>
                    </div>
                    <p className="text-[11px] text-stitch-on-surface-variant truncate">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filter Panel ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-2xl shadow-sm border border-stitch-outline-variant/30 overflow-hidden">

            {/* Row 1: Dietary Preference */}
            <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-stitch-outline-variant/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stitch-secondary">
                  Dietary Preference
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-stitch-primary font-bold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Clear All ({activeFiltersCount})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const isActive = dietary === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDietary(opt.value)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isActive
                          ? "bg-stitch-primary text-white border-stitch-primary shadow-sm"
                          : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[14px] ${isActive ? "text-white" : "text-stitch-secondary"}`}>
                        {opt.icon}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {(dietary === "vegan_friendly" || dietary === "jain_friendly") && (
                <p className="mt-2 text-[11px] text-amber-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">info</span>
                  Showing only establishments with{" "}
                  <strong>verified</strong>{" "}
                  {dietary === "vegan_friendly" ? "vegan-friendly" : "Jain-friendly"} options.
                  Unverified records are excluded.
                </p>
              )}
            </div>

            {/* Row 2: Category */}
            <div className="px-4 sm:px-6 py-4 border-b border-stitch-outline-variant/20">
              <p className="text-xs font-bold uppercase tracking-widest text-stitch-secondary mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => {
                  const isActive = category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value as CategoryFilter)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isActive
                          ? "bg-stitch-secondary text-white border-stitch-secondary shadow-sm"
                          : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[14px] ${isActive ? "text-white" : "text-stitch-secondary"}`}>
                        {opt.icon}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Search + More Filters toggle */}
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stitch-secondary text-[18px]">
                  search
                </span>
                <input
                  id="dining-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, cuisine, neighbourhood..."
                  className="w-full pl-10 pr-10 py-2.5 bg-stitch-surface-container-low rounded-xl text-xs sm:text-sm text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary/30 border border-stitch-outline-variant/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stitch-outline-variant hover:text-stitch-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  showAdvanced
                    ? "bg-stitch-primary/10 text-stitch-primary border-stitch-primary/30"
                    : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                {showAdvanced ? "Hide Filters" : "More Filters"}
                {(!!priceRange || minRating !== undefined) && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-stitch-primary text-white text-[9px] flex items-center justify-center font-bold">
                    {[!!priceRange, minRating !== undefined].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-stitch-outline-variant/20"
                >
                  <div className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price Range */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stitch-secondary mb-2 block">
                        Price Range
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRICE_OPTIONS.map((p) => {
                          const isActive = p === "" ? priceRange === "" : priceRange === p;
                          return (
                            <button
                              key={p || "any"}
                              onClick={() => setPriceRange(p === priceRange ? "" : p)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                isActive
                                  ? "bg-stitch-tertiary text-white border-stitch-tertiary"
                                  : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                              }`}
                            >
                              {p === "" ? "Any Price" : PRICE_DISPLAY[p] || p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Min Rating */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stitch-secondary mb-2 block">
                        Minimum Rating
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMinRating(undefined)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            minRating === undefined
                              ? "bg-stitch-tertiary text-white border-stitch-tertiary"
                              : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                          }`}
                        >
                          Any
                        </button>
                        {[4, 5].map((r) => (
                          <button
                            key={r}
                            onClick={() => setMinRating(minRating === r ? undefined : r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              minRating === r
                                ? "bg-stitch-tertiary text-white border-stitch-tertiary"
                                : "bg-white text-stitch-on-surface-variant border-stitch-outline-variant/40 hover:bg-stitch-surface-container"
                            }`}
                          >
                            {"★".repeat(r)}+ ({r})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-stitch-on-surface-variant font-medium">Active filters:</span>
              {dietary !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stitch-primary/10 text-stitch-primary text-[11px] font-semibold">
                  {DIETARY_OPTIONS.find((d) => d.value === dietary)?.label}
                  <button onClick={() => setDietary("all")}>
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stitch-secondary/10 text-stitch-secondary text-[11px] font-semibold">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label}
                  <button onClick={() => setCategory("")}>
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {priceRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stitch-tertiary/10 text-stitch-tertiary text-[11px] font-semibold">
                  {PRICE_DISPLAY[priceRange] || priceRange}
                  <button onClick={() => setPriceRange("")}>
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {search.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stitch-surface-container text-stitch-on-surface text-[11px] font-semibold">
                  &ldquo;{search.trim()}&rdquo;
                  <button onClick={() => setSearch("")}>
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {minRating !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stitch-tertiary/10 text-stitch-tertiary text-[11px] font-semibold">
                  {"\u2605"} {minRating}+ Stars
                  <button onClick={() => setMinRating(undefined)}>
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Cards Grid ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {!isLoading && !error && (
            <p className="mb-5 text-sm text-stitch-on-surface-variant">
              <span className="font-bold text-stitch-on-surface">{restaurants.length}</span>{" "}
              establishment{restaurants.length !== 1 ? "s" : ""} found
              {activeFiltersCount > 0 && " matching your filters"}
            </p>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-low animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
              <span className="material-symbols-outlined text-[40px] text-red-400 block mb-3">error_outline</span>
              <h3 className="text-xl font-bold text-stitch-primary mb-2">Unable to load restaurants</h3>
              <p className="text-stitch-on-surface-variant text-sm">Please refresh or verify connection.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {restaurants.map((restaurant, idx) => (
                  <motion.article
                    key={restaurant.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx, 8) * 0.04 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-stitch-outline-variant/30"
                  >
                    <div>
                      {/* Photo */}
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
                          {restaurant.cuisine?.split(",")[0]?.trim() || "Mysore Cuisine"}
                        </span>
                        {restaurant.category && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold backdrop-blur-sm">
                            {CATEGORY_LABEL[restaurant.category] || restaurant.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-stitch-secondary text-xs font-bold uppercase tracking-wider">
                          <span className="truncate">{restaurant.neighbourhood || restaurant.location}</span>
                          {restaurant.rating != null && restaurant.rating > 0 && (
                            <span className="flex items-center gap-1 bg-stitch-secondary-container px-2 py-0.5 rounded text-stitch-on-secondary-container font-bold text-xs shrink-0">
                              &#9733; {restaurant.rating}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-xl font-bold text-stitch-on-surface group-hover:text-stitch-primary transition-colors">
                          {restaurant.name}
                        </h3>

                        <p className="text-xs text-stitch-on-surface-variant line-clamp-2 leading-relaxed">
                          {restaurant.description ||
                            `Authentic dining serving ${restaurant.cuisine} in ${restaurant.location}.`}
                        </p>

                        {/* Dietary + special badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <DietaryBadge classification={restaurant.dietaryClassification} />
                          {restaurant.isVeganFriendly && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-semibold">
                              Vegan Options
                            </span>
                          )}
                          {restaurant.isJainFriendly && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-semibold">
                              Jain Options
                            </span>
                          )}
                        </div>

                        {/* Price + Hours */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium">
                            {restaurant.priceRange}
                          </span>
                          {restaurant.openingHours ? (
                            <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium truncate max-w-[200px]">
                              {restaurant.openingHours.split(",")[0]}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface-variant font-medium">
                              Hours unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 pt-3 border-t border-stitch-outline-variant/20 flex items-center justify-between gap-2">
                      {restaurant.menuUrl ? (
                        <a
                          href={restaurant.menuUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stitch-secondary font-bold hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">menu_book</span>
                          View Menu
                        </a>
                      ) : restaurant.sourceUrl && restaurant.verificationStatus === "verified" ? (
                        <a
                          href={restaurant.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stitch-secondary font-medium hover:underline flex items-center gap-1 truncate max-w-[170px]"
                          title="Official website available, but online menu is not published"
                        >
                          <span className="material-symbols-outlined text-[14px]">language</span>
                          Official Site (No online menu)
                        </a>
                      ) : (
                        <span className="text-xs text-stitch-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Menu not available online
                        </span>
                      )}
                      <Link
                        href="/chat"
                        className="text-xs text-stitch-primary font-bold hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Ask AI</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              {restaurants.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-stitch-outline-variant/30 p-8">
                  <span className="material-symbols-outlined text-[48px] text-stitch-secondary block mb-3">
                    restaurant
                  </span>
                  <p className="text-stitch-on-surface font-serif text-xl font-bold">
                    No restaurants match your filters
                  </p>
                  <p className="text-stitch-on-surface-variant text-sm mt-1 mb-4">
                    Try adjusting dietary preference, category, or search terms.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-stitch-primary text-white rounded-lg text-xs font-bold hover:bg-stitch-primary/90 transition-colors"
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
