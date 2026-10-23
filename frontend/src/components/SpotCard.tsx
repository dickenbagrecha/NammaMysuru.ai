import { Clock, Crown, MapPin, Ticket } from "lucide-react";
import { type TouristSpot } from "@shared/schema";
import { motion } from "framer-motion";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface SpotCardProps {
  spot: TouristSpot;
  index: number;
}

export function SpotCard({ spot, index }: SpotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      className="royal-card group flex h-full flex-col overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {/* Decorative overlay for image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />

        <ImageWithFallback
          src={spot.imageUrl || undefined}
          alt={spot.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          fallbackType="spot"
        />

        <div className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-secondary/40 bg-black/30 text-secondary backdrop-blur">
          <Crown className="h-4 w-4" />
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-20">
          <h3 className="text-xl font-bold text-white font-display drop-shadow-md">{spot.name}</h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
          {spot.description}
        </p>

        <div className="mt-auto space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{spot.location}</span>
          </div>

          {(spot.visitingHours) && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Clock className="w-4 h-4 text-secondary-foreground" />
              <span className="truncate">{spot.visitingHours}</span>
            </div>
          )}

          {(spot.ticketPrice) && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{spot.ticketPrice}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
