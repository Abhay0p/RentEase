"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Download, X } from "lucide-react";
import { toPng } from "html-to-image";
import { PremiumButton } from "./premium-button";

interface Pin {
  id: string;
  x: number;
  y: number;
  label: string;
  isEditing: boolean;
}

export function MemoryBoard() {
  const [pins, setPins] = useState<Pin[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent adding pin if clicking on an existing pin or input
    if ((e.target as HTMLElement).closest(".pin-element")) return;

    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: Pin = {
      id: Date.now().toString(),
      x,
      y,
      label: "",
      isEditing: true,
    };
    setPins([...pins, newPin]);
  };

  const updatePinLabel = (id: string, label: string) => {
    setPins(pins.map(p => p.id === id ? { ...p, label } : p));
  };

  const finishEditing = (id: string) => {
    setPins(pins.map(p => p.id === id ? { ...p, isEditing: false } : p));
  };

  const deletePin = (id: string) => {
    setPins(pins.filter(p => p.id !== id));
  };

  const downloadImage = async () => {
    if (!boardRef.current) return;
    setIsCapturing(true);
    
    try {
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0F1115",
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "rentease-memory-capsule.png";
      link.click();
    } catch (err) {
      console.error("Failed to save image", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-3xl font-serif text-foreground mb-2">Memory Capsule</h3>
          <p className="text-muted-foreground font-light">
            Click anywhere on the blackboard to pin places you've visited. Build your luxury travel map.
          </p>
        </div>
        <PremiumButton 
          onClick={downloadImage} 
          disabled={isCapturing || pins.length === 0}
          className="flex items-center gap-2 px-6 py-3"
        >
          <Download className="w-4 h-4" />
          {isCapturing ? "Capturing..." : "Save Capsule"}
        </PremiumButton>
      </div>

      {/* The Blackboard Area */}
      <div 
        ref={boardRef}
        onClick={handleBoardClick}
        className="w-full aspect-[21/9] md:aspect-[21/10] bg-[#0F1115] relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl cursor-crosshair group"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-chalkboard.png')]" />

        <AnimatePresence>
          {pins.map((pin) => (
            <motion.div
              key={pin.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute pin-element transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <div className="relative group/pin flex flex-col items-center">
                
                {/* Delete Button (Visible on hover unless capturing) */}
                {!isCapturing && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePin(pin.id); }}
                    className="absolute -top-6 -right-6 bg-destructive text-white p-1 rounded-full opacity-0 group-hover/pin:opacity-100 transition-opacity z-10 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* The Pin Icon */}
                <div className="text-accent drop-shadow-[0_0_10px_rgba(212,180,131,0.6)]">
                  <MapPin className="w-8 h-8 fill-accent/20" />
                </div>

                {/* Label Input or Text */}
                <div className="mt-1">
                  {pin.isEditing && !isCapturing ? (
                    <input
                      autoFocus
                      type="text"
                      value={pin.label}
                      onChange={(e) => updatePinLabel(pin.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') finishEditing(pin.id);
                      }}
                      onBlur={() => finishEditing(pin.id)}
                      placeholder="Name this memory..."
                      className="bg-background/80 backdrop-blur-sm border border-accent/50 text-foreground text-xs px-2 py-1 rounded outline-none text-center min-w-[120px] shadow-xl"
                    />
                  ) : pin.label ? (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setPins(pins.map(p => p.id === pin.id ? { ...p, isEditing: true } : p)); }}
                      className="bg-background/90 backdrop-blur-md border border-border text-foreground text-xs font-serif px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl cursor-text hover:border-accent/50 transition-colors"
                    >
                      {pin.label}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Watermark for exported image */}
        {isCapturing && (
          <div className="absolute bottom-6 right-8 text-white/50 font-serif text-sm tracking-widest flex items-center gap-2">
            <span className="w-4 h-px bg-white/50" />
            RENTEASE EXCLUSIVE
          </div>
        )}
      </div>
    </div>
  );
}
