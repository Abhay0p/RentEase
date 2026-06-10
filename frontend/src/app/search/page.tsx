"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { PremiumButton } from "@/components/ui/premium-button";
import { MapPin, SlidersHorizontal, Compass } from "lucide-react";
import api from "@/lib/axios";

import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/ui/PropertyCard";

// Dynamically import the Leaflet Map to avoid SSR issues
const PropertyMap = dynamic(
  () => import("@/components/map/PropertyMap"),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-none" />
  }
);

export default function SearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [propertyType, setPropertyType] = useState<string>("ALL");
  const [center, setCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default map center
  const [zoom, setZoom] = useState(12);

  // Debounce the search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedLocation(location);
    }, 500);
    return () => clearTimeout(timerId);
  }, [location]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let queryParams = [];
        if (debouncedLocation) queryParams.push(`search=${encodeURIComponent(debouncedLocation)}`);
        if (propertyType !== "ALL") queryParams.push(`type=${propertyType}`);
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : "";
        const res = await api.get(`/properties/${queryString}`);
        setProperties(res.data);
        
        // Find the first property that actually has valid numeric coordinates
        const firstValidProperty = res.data.find((p: any) => {
          const lat = parseFloat(p.latitude);
          const lng = parseFloat(p.longitude);
          return !isNaN(lat) && !isNaN(lng);
        });
        
        if (firstValidProperty) {
          setCenter([parseFloat(firstValidProperty.latitude), parseFloat(firstValidProperty.longitude)]);
          setZoom(13);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [debouncedLocation, propertyType]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row mt-20 md:mt-[72px] relative z-10">
        
        {/* Left Sidebar - Filter & List */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-background border-r border-border/40 z-20 arch-shadow">
          
          {/* Search Header */}
          <div className="p-8 border-b border-border/40">
            <h1 className="text-3xl font-serif text-foreground mb-6">Discover Residences</h1>
            
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by city, neighborhood, or address..." 
                  className="pl-12 h-12 bg-secondary border-transparent focus-visible:ring-1 focus-visible:ring-accent font-sans text-sm rounded-xl transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <PremiumButton variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl">
                <SlidersHorizontal className="h-5 w-5" />
              </PremiumButton>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['ALL', 'HOTEL', 'VILLA', 'APARTMENT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPropertyType(type)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${
                    propertyType === type 
                      ? 'bg-foreground text-background' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  {type === 'ALL' ? 'All Residences' : type + 'S'}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Property List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))
            ) : (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </div>

        {/* Right Side - Premium Map Experience */}
        <div className="hidden md:block flex-1 relative bg-secondary">
          <div className="absolute top-6 right-6 z-20 bg-background/90 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-foreground flex items-center shadow-sm">
            <Compass className="w-4 h-4 mr-2 text-accent" />
            Interactive View
          </div>
          
          <div className="w-full h-full grayscale-[0.3] contrast-[1.1]">
            <PropertyMap properties={properties} center={center} zoom={12} />
          </div>
        </div>

      </main>
    </div>
  );
}
