"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
}

export function RatingStars({ rating, size = 16, className }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className="fill-gold text-gold"
            />
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <StarHalf
              key={i}
              style={{ width: size, height: size }}
              className="fill-gold text-gold"
            />
          );
        }
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className="text-charcoal/20"
          />
        );
      })}
    </div>
  );
}
