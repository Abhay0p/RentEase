"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="w-full h-full flex flex-col flex-1 relative overflow-hidden"
      >
        {/* HUD Scanning Wipe Effect */}
        <motion.div
          initial={{ y: "100%", height: "100%" }}
          animate={{ y: "-100%", height: "0%" }}
          exit={{ y: "0%", height: "100%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-primary pointer-events-none flex flex-col justify-end"
        >
          <div className="h-1 bg-white shadow-[0_0_20px_rgba(255,255,255,1)]" />
        </motion.div>

        {/* Page Content Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full h-full flex flex-col flex-1"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
