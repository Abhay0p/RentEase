"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailParticle {
  id: number;
  x: number;
  y: number;
}

export function StarCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Create a trail particle
      const id = particleIdRef.current++;
      setParticles((prev) => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY }]);

      // Remove the particle after a short delay
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 500); // 500ms trail duration
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Ensure it doesn't break SSR
  if (!isMounted) return null;

  return (
    <>
      {/* The main twinkling star cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          scale: isClicking ? 1.5 : 1,
          rotate: isClicking ? 90 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 25,
          mass: 0.1,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="#D4B483"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isClicking ? "drop-shadow-[0_0_15px_rgba(212,180,131,1)]" : "drop-shadow-[0_0_5px_rgba(212,180,131,0.5)]"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.div>

      {/* The trailing particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed top-0 left-0 pointer-events-none z-[9998]"
            initial={{
              x: p.x - 4,
              y: p.y - 4,
              opacity: 0.8,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              scale: 0.2,
              y: p.y + 20, // Drift down slightly
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(212,180,131,0.8)]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
