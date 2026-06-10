"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Gem } from "lucide-react";

// Component to recenter map when properties change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

interface PropertyMapProps {
  properties: any[];
  center: [number, number];
  zoom: number;
}

export default function PropertyMap({ properties, center, zoom }: PropertyMapProps) {
  
  // Create luxury marker icon dynamically
  const createCustomIcon = (price: string) => {
    return L.divIcon({
      className: "custom-luxury-marker",
      html: `
        <div style="
          background-color: #0F1115; 
          color: #D4B483; 
          border: 1px solid rgba(212, 180, 131, 0.4);
          padding: 6px 12px; 
          border-radius: 20px; 
          font-weight: 600; 
          font-size: 13px; 
          font-family: sans-serif;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          white-space: nowrap;
          transition: all 0.3s ease;
        ">
          $${price}
        </div>
      `,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
      popupAnchor: [0, -20]
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {properties.map((property) => (
        <Marker 
          key={property.id} 
          position={[property.latitude, property.longitude]}
          icon={createCustomIcon(Math.round(property.price_per_night).toString())}
        >
          <Popup className="luxury-popup">
            <div className="font-sans min-w-[200px] p-1">
              <div className="w-full h-24 bg-secondary rounded-lg mb-3 flex items-center justify-center border border-border/50">
                <Gem className="w-6 h-6 text-accent/50" />
              </div>
              <div className="font-serif font-medium text-lg mb-1 leading-tight text-foreground">{property.title}</div>
              <div className="text-accent font-semibold mb-2">${property.price_per_night} <span className="text-xs font-normal text-muted-foreground">/ night</span></div>
              <div className="text-xs text-muted-foreground truncate">{property.address}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
