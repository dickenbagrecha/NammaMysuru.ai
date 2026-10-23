import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRestaurants } from "@/hooks/use-restaurants";
import { Crown, Utensils, IndianRupee, Leaf, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

// Filter Component
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function Restaurants() {
  const [filterVeg, setFilterVeg] = useState<boolean | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
  const [cuisine, setCuisine] = useState<string | undefined>(undefined);


  const { data: restaurants, isLoading, error } = useRestaurants({
    isVegetarian: filterVeg,
    priceRange,
    cuisine
  });

  const clearFilters = () => {
    setFilterVeg(undefined);
    setPriceRange(undefined);
    setCuisine(undefined);
  };

  return (
    <div className="royal-page min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-12 pb-28 md:pb-12">
        <div className="container mx-auto">
          <div className="royal-panel mx-auto mb-8 sm:mb-10 max-w-4xl rounded-xl px-4 py-6 sm:px-6 sm:py-10 text-center">
            <div className="relative z-10">
             <div className="royal-chip inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold">
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Taste of Mysuru</span>
            </div>
            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold text-primary md:text-5xl">Dining & Cuisine</h1>
            <div className="royal-divider mx-auto mt-3 sm:mt-4 max-w-sm" />
            <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground">
              From heritage hotel dining to legendary dosa counters, explore Mysuru through its most memorable flavors.
            </p>
            </div>
          </div>

          {/* Filters */}
          <div className="royal-card mx-auto mb-10 flex max-w-5xl flex-wrap items-center justify-center gap-3 rounded-lg p-4">
            <span className="mr-2 text-sm font-medium text-foreground/70">
              {restaurants?.length ?? 0} results
            </span>
            
            <FilterButton active={filterVeg === true} onClick={() => setFilterVeg(filterVeg === true ? undefined : true)}>
              <div className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Vegetarian</div>
            </FilterButton>
            
            <div className="h-6 w-px bg-border hidden sm:block" />

            <FilterButton active={priceRange === "Budget"} onClick={() => setPriceRange(priceRange === "Budget" ? undefined : "Budget")}>
              Budget
            </FilterButton>
            <FilterButton active={priceRange === "Mid-range"} onClick={() => setPriceRange(priceRange === "Mid-range" ? undefined : "Mid-range")}>
              Mid-range
            </FilterButton>
            <FilterButton active={priceRange === "Luxury"} onClick={() => setPriceRange(priceRange === "Luxury" ? undefined : "Luxury")}>
              Luxury
            </FilterButton>
            <FilterButton active={priceRange === "High-end"} onClick={() => setPriceRange(priceRange === "High-end" ? undefined : "High-end")}>
              High-end
            </FilterButton>

            <div className="h-6 w-px bg-border hidden sm:block" />
            
             <FilterButton active={cuisine === "South Indian"} onClick={() => setCuisine(cuisine === "South Indian" ? undefined : "South Indian")}>
              South Indian
            </FilterButton>
             <FilterButton active={cuisine === "North Indian"} onClick={() => setCuisine(cuisine === "North Indian" ? undefined : "North Indian")}>
              North Indian
            </FilterButton>

            {(filterVeg !== undefined || priceRange !== undefined || cuisine !== undefined) && (
              <button 
                onClick={clearFilters}
                className="text-xs text-primary hover:underline ml-2 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-destructive">Failed to load restaurants.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {restaurants?.map((restaurant, idx) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.035 }}
                  className="royal-card group flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-lg p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-xl"
                >
                  <div className="h-40 w-full sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-md border border-secondary/20 bg-muted">
                    <ImageWithFallback
                      src={restaurant.imageUrl || undefined}
                      alt={restaurant.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      fallbackType="dining"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{restaurant.cuisine}</p>
                      </div>
                      {restaurant.rating && restaurant.rating > 0 && (
                        <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded text-xs font-bold text-secondary-foreground">
                          <span>{restaurant.rating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 flex flex-wrap gap-y-2 gap-x-4 text-sm text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate max-w-[120px]">{restaurant.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{restaurant.priceRange}</span>
                      </div>
                      {restaurant.isVegetarian && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <Leaf className="w-3.5 h-3.5" />
                          <span>Pure Veg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {restaurants?.length === 0 && (
                <div className="col-span-full rounded-lg bg-muted/30 py-20 text-center">
                  <p className="text-muted-foreground">No restaurants match your filters.</p>
                  <button onClick={clearFilters} className="mt-2 text-primary font-medium hover:underline">
                    Clear filters
                  </button>
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
