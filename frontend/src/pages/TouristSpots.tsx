import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpotCard } from "@/components/SpotCard";
import { useTouristSpots } from "@/hooks/use-tourist-spots";
import { type TouristSpot } from "@shared/schema";
import { Link } from "wouter";

export default function TouristSpots() {
  const { data: spots, isLoading, error } = useTouristSpots();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);

  const categories = [
    { id: "all", label: "All Landmarks" },
    { id: "palace", label: "Royal Palaces" },
    { id: "temple", label: "Temples & Hills" },
    { id: "garden", label: "Historic Gardens" },
    { id: "museum", label: "Art Galleries & Museums" },
    { id: "bazaar", label: "Heritage Bazaars" },
  ];

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (spots ?? []).filter((spot) => {
      const matchesSearch =
        !query ||
        [spot.name, spot.description, spot.location].some((val) =>
          val?.toLowerCase().includes(query)
        );

      const matchesCat =
        selectedCategory === "all" ||
        (selectedCategory === "palace" && spot.name.toLowerCase().includes("palace")) ||
        (selectedCategory === "temple" && (spot.name.toLowerCase().includes("temple") || spot.name.toLowerCase().includes("hill") || spot.name.toLowerCase().includes("church") || spot.name.toLowerCase().includes("cathedral"))) ||
        (selectedCategory === "garden" && (spot.name.toLowerCase().includes("garden") || spot.name.toLowerCase().includes("lake") || spot.name.toLowerCase().includes("dam") || spot.name.toLowerCase().includes("zoo"))) ||
        (selectedCategory === "museum" && (spot.name.toLowerCase().includes("museum") || spot.name.toLowerCase().includes("gallery") || spot.name.toLowerCase().includes("art"))) ||
        (selectedCategory === "bazaar" && (spot.name.toLowerCase().includes("market") || spot.name.toLowerCase().includes("bazaar") || spot.name.toLowerCase().includes("silk") || spot.name.toLowerCase().includes("sandalwood")));

      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory, spots]);

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans selection:bg-stitch-primary-container selection:text-white">
      <Header />

      <main className="flex-grow pb-24 md:pb-12">
        {/* Top Atmospheric Header & Live Crown Status */}
        <section className="relative w-full bg-stitch-surface-container-low overflow-hidden pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stitch-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stitch-secondary-fixed/30 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-stitch-primary/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
            {/* Breadcrumb & Tagline */}
            <div className="flex flex-wrap items-center gap-2 text-stitch-on-surface-variant text-xs">
              <span className="text-stitch-secondary font-bold uppercase tracking-widest">
                Heritage Directory
              </span>
              <span className="text-stitch-outline-variant">•</span>
              <span>7 Historic Wards of Mysore</span>
              <span className="text-stitch-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-stitch-tertiary animate-ping" />
                Monuments Operational Today
              </span>
            </div>

            {/* Main Headline with Neo-Heritage Pacing */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stitch-primary tracking-tight">
                  Explore Mysuru’s Royal Heritage &amp; Sacred Landmarks
                </h1>
                <p className="mt-3 text-sm sm:text-base text-stitch-on-surface-variant max-w-2xl leading-relaxed">
                  Live darshan timings, verified entry tariffs, architectural monographs, and audio-guided pathways orchestrated by heritage curators and AI.
                </p>
              </div>

              {/* Quick Monument Stats Bar */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-stitch-outline-variant/30">
                <div className="text-center px-2">
                  <span className="block font-serif text-2xl font-bold text-stitch-primary">7</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">Royal Palaces</span>
                </div>
                <div className="text-center px-2 bg-stitch-surface-container-low rounded-lg py-1">
                  <span className="block font-serif text-2xl font-bold text-stitch-tertiary">130+</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">Years Bazaar</span>
                </div>
                <div className="text-center px-2">
                  <span className="block font-serif text-2xl font-bold text-stitch-primary">1,008</span>
                  <span className="text-[10px] uppercase text-stitch-secondary font-bold">Hill Steps</span>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="pt-2">
              <div className="overflow-x-auto pb-2 flex items-center gap-2 sm:gap-3" id="categoryChips">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? "bg-stitch-primary text-white shadow-sm"
                        : "bg-white text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-stitch-surface-container border border-stitch-outline-variant/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Spot Search & Accessible Trait Toggles */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/5 flex flex-col gap-4 border border-stitch-outline-variant/30">
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stitch-secondary text-[22px]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search palace, museum, hill steps, or historic spot..."
                  className="w-full pl-11 pr-4 py-3 bg-stitch-surface-container-low rounded-xl text-stitch-on-surface text-sm focus:outline-none focus:bg-white border border-stitch-outline-variant/30 placeholder:text-stitch-on-surface-variant/60"
                />
              </div>

              {/* Counter and Clear */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <span className="px-3.5 py-2.5 rounded-lg bg-stitch-surface-container text-xs text-stitch-on-surface-variant font-semibold">
                  Showing {filteredSpots.length} of {spots?.length ?? 0} Heritage Sites
                </span>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-3 py-2 rounded-lg bg-stitch-surface-container-low text-stitch-primary hover:bg-stitch-surface-container transition-colors text-xs font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Curated Monument Directory */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-low animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
              <h3 className="text-xl font-bold text-stitch-primary mb-2">Unable to load spots</h3>
              <p className="text-stitch-on-surface-variant text-sm">Please refresh or verify connection.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredSpots.map((spot, index) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  index={index}
                  onSelect={(s) => setSelectedSpot(s)}
                />
              ))}

              {filteredSpots.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-stitch-outline-variant/30 p-8">
                  <span className="material-symbols-outlined text-[48px] text-stitch-secondary mb-3">
                    search_off
                  </span>
                  <p className="text-stitch-on-surface font-serif text-xl font-bold">
                    No tourist spots match your criteria
                  </p>
                  <p className="text-stitch-on-surface-variant text-sm mt-1">
                    Try searching for &quot;Palace&quot;, &quot;Chamundi&quot;, &quot;Market&quot;, or clear filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 px-4 py-2 bg-stitch-primary text-white rounded-lg text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Detail Modal Dialog when Spot is clicked */}
        {selectedSpot && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSpot(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stitch-outline-variant/40 shadow-2xl p-6 sm:p-8 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stitch-outline-variant/20">
                <span className="px-3 py-1 rounded-full bg-stitch-primary/10 text-stitch-primary text-xs font-bold">
                  Heritage Monument
                </span>
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="p-1 rounded-full hover:bg-stitch-surface-container text-stitch-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>

              {selectedSpot.imageUrl && (
                <div className="h-64 rounded-2xl overflow-hidden relative">
                  <img
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stitch-on-surface">
                {selectedSpot.name}
              </h2>

              <p className="text-sm text-stitch-on-surface-variant leading-relaxed">
                {selectedSpot.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30">
                  <span className="text-stitch-secondary uppercase tracking-wider font-bold block mb-1">
                    Location
                  </span>
                  <span className="font-semibold text-stitch-on-surface">{selectedSpot.location}</span>
                </div>
                <div className="p-3 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30">
                  <span className="text-stitch-secondary uppercase tracking-wider font-bold block mb-1">
                    Visiting Hours
                  </span>
                  <span className="font-semibold text-stitch-on-surface">
                    {selectedSpot.visitingHours || "Open Daily"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30">
                  <span className="text-stitch-secondary uppercase tracking-wider font-bold block mb-1">
                    Entry Tariff
                  </span>
                  <span className="font-semibold text-stitch-primary font-bold">
                    {selectedSpot.ticketPrice || "Free Entry"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stitch-surface-container-low border border-stitch-outline-variant/30">
                  <span className="text-stitch-secondary uppercase tracking-wider font-bold block mb-1">
                    Experience
                  </span>
                  <span className="font-semibold text-stitch-on-surface">
                    Royal Heritage &amp; Culture
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/chat"
                  className="flex-1 py-3 px-4 rounded-xl bg-stitch-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-stitch-primary-container transition"
                >
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  <span>Ask AI Concierge for Directions</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedSpot(null)}
                  className="py-3 px-6 rounded-xl border border-stitch-outline-variant/40 text-stitch-on-surface-variant font-bold text-xs hover:bg-stitch-surface-container transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
