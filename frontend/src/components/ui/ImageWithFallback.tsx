import { useState } from "react";
import { MapPinned, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: "spot" | "dining" | "generic";
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackType = "generic",
  containerClassName,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/15 border border-secondary/25 p-4 text-center",
          containerClassName
        )}
      >
        {fallbackType === "spot" ? (
          <>
            <MapPinned className="h-10 w-10 text-secondary animate-pulse mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary/80">No image preview</span>
          </>
        ) : fallbackType === "dining" ? (
          <>
            <Utensils className="h-10 w-10 text-secondary animate-pulse mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary/80">No image preview</span>
          </>
        ) : (
          <div className="h-6 w-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary font-bold text-xs">
            M
          </div>
        )}
      </div>
    );
  }

  const displaySrc = src && src.startsWith("http") && !src.includes("localhost") && !src.includes("127.0.0.1")
    ? `https://images.weserv.nl/?url=${encodeURIComponent(src)}`
    : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
