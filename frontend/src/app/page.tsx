"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PremiumButton } from "@/components/ui/premium-button";
import { ArrowRight, Compass, ShieldCheck, Gem } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";
import gsap from "gsap";

function ArchitecturalAbstract() {
  const meshRef = useRef<any>(null);
  const ringRef = useRef<any>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = time * 0.05;
    ringRef.current.rotation.y = -time * 0.15;
    ringRef.current.rotation.z = time * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, -0.5, 0]}>
        {/* Core Glass Geometry */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[2.5, 0]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={2}
            roughness={0.1}
            ior={1.5}
            chromaticAberration={0.05}
            anisotropy={0.5}
            distortion={0.1}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#ffffff"
          />
        </mesh>
        
        {/* Luxury Gold Orbital Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[3.2, 0.05, 32, 100]} />
          <meshStandardMaterial color="#C8A96B" metalness={1} roughness={0.2} />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4, 0.02, 16, 100]} />
          <meshStandardMaterial color="#C8A96B" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (headlineRef.current) {
      gsap.fromTo(
        headlineRef.current.querySelectorAll(".word"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.4 }
      );
    }
  }, []);

  const headline = ["Discover", "Extraordinary", "Living"];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden selection:bg-accent/20">
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-24">
        <motion.div style={{ y: yBg, opacity: opacityText }} className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#C8A96B" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
            <ArchitecturalAbstract />
            <Environment preset="city" />
            <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4} color="#000000" />
          </Canvas>
        </motion.div>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background z-0" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center pointer-events-none mt-20">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8 px-6 py-2 rounded-full border border-accent/30 bg-background/50 backdrop-blur-xl shadow-sm inline-flex items-center gap-3"
          >
            <Gem className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">Premium Real Estate Collection</span>
          </motion.div>

          <h1 ref={headlineRef} className="text-6xl md:text-8xl lg:text-[100px] font-serif text-foreground leading-[1.1] tracking-tight mb-8 drop-shadow-xl">
            {headline.map((word, index) => (
              <span key={index} className="word inline-block mr-4 md:mr-6">{word}</span>
            ))}
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg md:text-2xl text-muted-foreground font-sans max-w-3xl mb-12 font-light leading-relaxed drop-shadow-md bg-background/30 backdrop-blur-sm p-4 rounded-2xl"
          >
            Curated modern penthouses, luxury villas, and exclusive architectural masterworks for the discerning few.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6 pointer-events-auto"
          >
            <Link href="/search">
              <PremiumButton variant="primary" size="lg" className="w-64 gap-2">
                Explore Properties <ArrowRight className="w-4 h-4" />
              </PremiumButton>
            </Link>
            <Link href="/about">
              <PremiumButton variant="outline" size="lg" className="w-64">
                View The Gallery
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Editorial Highlights */}
      <section className="relative z-10 py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Redefining the Standard of Luxury Living.</h2>
            <p className="text-muted-foreground font-sans text-lg font-light leading-relaxed">Every property in the RentEase collection is meticulously vetted for architectural significance, premium amenities, and uncompromising comfort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Compass, title: "Curated Locations", desc: "From the dramatic coastlines of Malibu to the skyline of Manhattan, discover homes in the world's most sought-after neighborhoods." },
              { icon: ShieldCheck, title: "Uncompromising Trust", desc: "Experience complete peace of mind with our secure booking protocols and verified property standards." },
              { icon: Gem, title: "Architectural Excellence", desc: "Immerse yourself in spaces designed by award-winning architects, featuring bespoke interiors and premium materials." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
                className="group flex flex-col items-center text-center p-8 rounded-3xl transition-colors hover:bg-card hover:arch-shadow border border-transparent hover:border-border/40"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl font-serif text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive Visual Showcase */}
      <section className="relative z-10 py-20 bg-card overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/5] rounded-3xl overflow-hidden arch-shadow">
            <Image 
              src="/images/interior.png" 
              alt="Architectural Visualization" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-10 max-w-xl">
            <div className="inline-flex items-center gap-3">
              <div className="h-[1px] w-12 bg-accent" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Collection</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-foreground leading-[1.1]">Spaces designed to inspire.</h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Step inside meticulously crafted interiors where natural light, premium textures, and expansive layouts converge. Our platform provides a window into the most exclusive homes available for short-term residency.
            </p>
            <div className="pt-4 border-t border-border/40 flex justify-between items-center">
              <div>
                <h4 className="text-4xl font-serif text-foreground mb-1">500+</h4>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Global Properties</p>
              </div>
              <div>
                <h4 className="text-4xl font-serif text-foreground mb-1">12</h4>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Major Cities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="relative z-10 bg-background pt-32 pb-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-3 mb-8">
              <div className="h-8 w-8 bg-foreground rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-background rounded-full" />
              </div>
              <span className="text-2xl font-serif tracking-tight text-foreground">RentEase</span>
            </Link>
            <p className="text-muted-foreground font-light leading-relaxed max-w-sm">
              Elevating the standard of global residency. Experience the pinnacle of modern luxury architecture.
            </p>
          </div>
          <div>
            <h4 className="text-foreground font-serif text-lg mb-6">Discover</h4>
            <ul className="space-y-4">
              <li><Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors font-light">The Collection</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-light">Our Philosophy</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-light">Concierge Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-serif text-lg mb-6">Account</h4>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-light">Sign In</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors font-light">Join the Network</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-light">Client Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-light">
            © 2026 RentEase Luxury Properties. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground font-light">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
