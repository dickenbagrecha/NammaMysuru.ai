import { Clock, MapPin, Ticket } from "lucide-react";
import { type TouristSpot } from "@shared/schema";
import { motion } from "framer-motion";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface SpotCardProps {
  spot: TouristSpot;
  index: number;
  onSelect?: (spot: TouristSpot) => void;
}

export function SpotCard({ spot, index, onSelect }: SpotCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-stitch-outline-variant/30"
    >
      <div>
        {/* Arch-shaped top photo banner */}
        <div className="relative h-56 rounded-t-[2.5rem] overflow-hidden bg-stitch-surface-container-low">
          <ImageWithFallback
            src={spot.imageUrl || undefined}
            alt={spot.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackType="spot"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Heritage Tag */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stitch-surface/90 text-stitch-on-surface text-[11px] font-bold backdrop-blur-sm border border-stitch-outline-variant/30 shadow-sm">
            Heritage Monument
          </span>

          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed text-[11px] font-bold shadow-sm">
            Verified Spot
          </span>
        </div>

        {/* Content details */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between text-stitch-secondary text-xs font-bold uppercase tracking-wider">
            <span className="truncate">{spot.location || "Mysuru Heritage Precinct"}</span>
            {spot.ticketPrice && (
              <span className="shrink-0 text-stitch-primary font-bold">{spot.ticketPrice}</span>
            )}
          </div>

          <h3 className="font-serif text-xl font-bold text-stitch-on-surface group-hover:text-stitch-primary transition-colors">
            {spot.name}
          </h3>

          <p className="text-xs text-stitch-on-surface-variant line-clamp-3 leading-relaxed">
            {spot.description}
          </p>

          {/* Quick info metadata pills */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            {spot.location && (
              <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stitch-secondary" />
                <span className="truncate max-w-[180px]">{spot.location}</span>
              </span>
            )}
            {spot.visitingHours && (
              <span className="px-2.5 py-1 rounded-lg bg-stitch-surface-container-low text-stitch-on-surface font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stitch-tertiary" />
                <span className="truncate max-w-[180px]">{spot.visitingHours}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar with action button */}
      <div className="p-5 sm:p-6 pt-3 border-t border-stitch-outline-variant/20 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-stitch-on-surface-variant block font-medium">Visiting Protocol</span>
          <span className="font-bold text-stitch-on-surface">
            {spot.visitingHours ? spot.visitingHours : "Open Daily"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect && onSelect(spot)}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-stitch-surface-container text-stitch-primary hover:bg-stitch-primary hover:text-white transition-all font-semibold text-xs flex items-center gap-1 group-hover:bg-stitch-primary group-hover:text-white"
        >
          <span>Explore</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </motion.article>
  );
}
