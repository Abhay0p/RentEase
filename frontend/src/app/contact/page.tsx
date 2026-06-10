"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PremiumButton } from "@/components/ui/premium-button";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Use Web3Forms to avoid needing an email server password
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "6824aa32-8399-4b82-884a-a7f046c2b13e",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: "RentEase Inquiry",
          from_name: "RentEase Global Concierge",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <Navbar />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Concierge Services.</h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              Our dedicated lifestyle managers are available around the clock to assist with bespoke requests, reservations, and property inquiries.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-2xl font-serif mb-6">Global Offices</h3>
              <div className="space-y-8">
                <div className="flex gap-4 items-start text-muted-foreground font-light">
                  <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="font-serif text-foreground text-xl mb-2">New York (HQ)</p>
                    <p>100 Park Avenue, Suite 4500<br/>New York, NY 10017</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start text-muted-foreground font-light">
                  <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="font-serif text-foreground text-xl mb-2">London</p>
                    <p>1 Mayfair Place<br/>London, W1J 8AJ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/40">
              <h3 className="text-2xl font-serif mb-6">Direct Lines</h3>
              <div className="space-y-4 text-muted-foreground font-light">
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>+1 (936) 846-XXXX</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-accent" />
                  <span>Abhaynarayan0001@gmail.com</span>
                </div>
              </div>
            </div>
          </motion.div>

            <div className="bg-card border border-border/40 rounded-3xl p-8 arch-shadow">
            <h3 className="text-2xl font-serif mb-8">Send an Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "success" && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-sm">
                  Your inquiry has been dispatched to our concierge team. We will be in touch shortly.
                </div>
              )}
              {status === "error" && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                  There was an error sending your inquiry. Please try again.
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-secondary border border-transparent focus:border-accent rounded-xl px-4 py-3.5 text-sm outline-none transition-all" 
                  placeholder="Your name" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-secondary border border-transparent focus:border-accent rounded-xl px-4 py-3.5 text-sm outline-none transition-all" 
                  placeholder="name@example.com" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-secondary border border-transparent focus:border-accent rounded-xl px-4 py-3.5 text-sm outline-none transition-all resize-none" 
                  placeholder="How can we assist you?"
                  required
                />
              </div>
              <PremiumButton type="submit" disabled={status === "loading"} className="w-full py-6 mt-4">
                {status === "loading" ? "Sending..." : "Send Message"}
              </PremiumButton>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
