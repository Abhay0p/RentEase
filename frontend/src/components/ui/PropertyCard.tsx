"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Bath, BedDouble, Square, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface PropertyProps {
  property: {
    id: string;
    title: string;
    price_per_night: number;
    address: string;
    image_url?: string;
    images?: { image_url: string }[];
    amenities?: string[];
  };
}

export function PropertyCard({ property }: PropertyProps) {
  const displayImage = property.images?.[0]?.image_url || property.image_url;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden arch-shadow border border-border/40 transition-all duration-500 hover:-translate-y-1"
    >
      <Link href={`/property/${property.id}`} className="block relative w-full aspect-[4/3] overflow-hidden">
        {displayImage ? (
          <Image 
            src={displayImage} 
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground transition-transform duration-1000 group-hover:scale-105 ease-out">
            <span className="font-serif text-lg tracking-widest uppercase">Preview</span>
          </div>
        )}
        
        {/* Subtle Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Save Button */}
        <button 
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-red-500 transition-colors shadow-sm"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Price Tag overlay */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <span className="text-2xl font-serif text-white tracking-tight">${property.price_per_night}</span>
          <span className="text-sm font-medium text-white/80">/ night</span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{property.address}</span>
          </div>
          <Link href={`/property/${property.id}`}>
            <h3 className="text-xl font-serif font-bold text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Amenities / Specs Row */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-muted-foreground text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" />
            <span>2 Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>2 Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4" />
            <span>1,200 sqft</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
