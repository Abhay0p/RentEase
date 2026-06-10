"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";

import { MemoryBoard } from "@/components/ui/MemoryBoard";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <Navbar />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">The Art of <br/>Extraordinary Living.</h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              RentEase was founded on a simple premise: to provide access to the world's most architecturally significant properties.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          
          {/* Authentic Visual Boxes / Collage */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4 pt-12">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden arch-shadow">
                <Image 
                  src="/images/villa.png" 
                  alt="Luxury Modern Villa" 
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden arch-shadow">
                <Image 
                  src="/images/interior.png" 
                  alt="Luxury Interior" 
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden arch-shadow">
                <Image 
                  src="/images/interior.png" 
                  alt="Architecture Details" 
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden arch-shadow">
                <Image 
                  src="/images/villa.png" 
                  alt="Poolside Luxury" 
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-serif leading-tight">Curating the Exceptional.</h2>
            <div className="space-y-6 text-muted-foreground font-light text-lg leading-relaxed">
              <p>
                We do not list properties; we curate experiences. Our portfolio represents the top 1% of luxury real estate globally. From ultra-modern glass penthouses hovering over Manhattan to secluded, brutalist concrete villas in the Mediterranean.
              </p>
              <p>
                Every home in the RentEase collection undergoes a rigorous 50-point architectural and amenity inspection to ensure it meets our exacting standards of design, comfort, and privacy.
              </p>
            </div>
            <div className="pt-8 border-t border-border/40">
              <p className="font-serif text-xl text-foreground">"Luxury is attention to detail, originality, exclusivity and above all, quality."</p>
            </div>
          </motion.div>
        </div>

        {/* Memory Capsule Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-16 border-t border-border/40"
        >
          <MemoryBoard />
        </motion.div>

      </main>
    </div>
  );
}
