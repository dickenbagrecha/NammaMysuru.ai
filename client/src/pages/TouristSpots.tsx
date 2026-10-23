import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpotCard } from "@/components/SpotCard";
import { useTouristSpots } from "@/hooks/use-tourist-spots";
import { Crown, MapPin, Search, Sparkles } from "lucide-react";

export default function TouristSpots() {
  const { data: spots, isLoading, error } = useTouristSpots();
  const [search, setSearch] = useState("");

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return spots ?? [];

    return (spots ?? []).filter((spot) =>
      [spot.name, spot.description, spot.location].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [search, spots]);

  return (
    <div className="royal-page min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-12 pb-28 md:pb-12">
        <div className="container mx-auto">
          <div className="royal-panel mx-auto mb-10 max-w-4xl rounded-xl px-6 py-10 text-center">
            <div className="relative z-10">
            <div className="royal-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
              <Crown className="w-4 h-4" />
              <span>Royal city archive</span>
            </div>
            <h1 className="mt-4 text-4xl font-bold text-primary md:text-5xl">Tourist Attractions</h1>
            <div className="royal-divider mx-auto mt-4 max-w-sm" />
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Browse palaces, temples, gardens, markets, and scenic escapes with a curated local lens.
            </p>
            </div>
          </div>

          <div className="royal-card mx-auto mb-8 flex max-w-3xl flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by place, area, or experience"
                className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
            <div className="whitespace-nowrap px-2 text-center text-sm font-medium text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-secondary" />
              {filteredSpots.length} places
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-xl border border-secondary/20 bg-muted/70 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20">
              <h3 className="text-xl font-bold text-destructive mb-2">Unable to load spots</h3>
              <p className="text-muted-foreground">Please try again later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpots.map((spot, index) => (
                <SpotCard key={spot.id} spot={spot} index={index} />
              ))}
              
              {filteredSpots.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground text-lg">No tourist spots found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
