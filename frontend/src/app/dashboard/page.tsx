"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Key, CalendarCheck, Wallet, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import Image from "next/image";
import { HostPropertyModal } from "@/components/ui/HostPropertyModal";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const bookingsRes = await api.get("/bookings/");
      setBookings(bookingsRes.data);
      
      if (user?.role === "LANDLORD") {
        const propsRes = await api.get("/properties/my_properties/");
        setProperties(propsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const activeBookings = bookings.filter(b => b.status === "CONFIRMED");
  const totalValue = activeBookings.reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);

  const stats = user?.role === "LANDLORD" ? [
    { label: "Active Residences", value: properties.length.toString(), icon: Key, trend: "Status: Verified" },
    { label: "Upcoming Guests", value: activeBookings.length.toString(), icon: CalendarCheck, trend: activeBookings.length > 0 ? "Confirmed" : "No active bookings" },
    { label: "Total Earnings", value: "$" + totalValue.toLocaleString(), icon: Wallet, trend: "From global stays" },
  ] : [
    { label: "Active Residences", value: "0", icon: Key, trend: "Status: Verified" },
    { label: "Upcoming Stays", value: activeBookings.length.toString(), icon: CalendarCheck, trend: activeBookings.length > 0 ? "Confirmed" : "No active plans" },
    { label: "Total Invested", value: "$" + totalValue.toLocaleString(), icon: Wallet, trend: "In luxury travel" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <HostPropertyModal 
        isOpen={isHostModalOpen} 
        onClose={() => setIsHostModalOpen(false)} 
        onSuccess={fetchData}
      />
      
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <p className="text-muted-foreground font-medium mb-2">Welcome back,</p>
          <h1 className="text-4xl font-serif text-foreground">{user?.first_name} {user?.last_name}</h1>
        </div>
        
        {user?.role === "LANDLORD" ? (
          <button 
            onClick={() => setIsHostModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-accent hover:text-white transition-all arch-shadow group"
          >
            Host New Residence
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        ) : (
          <button className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-foreground transition-colors group">
            View Complete Portfolio
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        )}
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-card border border-border/40 arch-shadow hover:-translate-y-1 transition-transform duration-500"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <stat.icon className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground font-medium mb-2">{stat.label}</p>
            <h3 className="text-3xl font-serif text-foreground mb-4">{stat.value}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-3xl bg-card border border-border/40 arch-shadow overflow-hidden"
        >
          <div className="p-8 border-b border-border/40 flex justify-between items-center">
            <h3 className="text-xl font-serif text-foreground">{user?.role === 'LANDLORD' ? 'Guest Reservations' : 'Upcoming Itinerary'}</h3>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">See all</button>
          </div>
          <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading itinerary...</div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-light">
                {user?.role === 'LANDLORD' ? "No reservations yet. Make sure your properties are active." : "No active bookings found. Explore the map to find your next luxury stay."}
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden relative">
                      <Image 
                        src={booking.property_details?.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt="Property"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-foreground mb-1 group-hover:text-accent transition-colors">
                        {booking.property_details?.title || "Luxury Property"}
                      </h4>
                      <p className="text-sm text-muted-foreground font-light mb-2">{booking.property_details?.address || "Exclusive Location"}</p>
                      <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{booking.check_in} - {booking.check_out}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-serif text-foreground mb-1">${booking.total_price}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
                      booking.status === 'CONFIRMED' ? 'bg-accent/10 text-accent' : 
                      booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Owned Properties for Landlords */}
        {user?.role === 'LANDLORD' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 rounded-3xl bg-card border border-border/40 arch-shadow overflow-hidden"
          >
            <div className="p-8 border-b border-border/40 flex justify-between items-center">
              <h3 className="text-xl font-serif text-foreground">Your Active Residences</h3>
              <button 
                onClick={() => setIsHostModalOpen(true)}
                className="text-sm font-medium text-accent hover:text-foreground transition-colors"
              >
                + Add Property
              </button>
            </div>
            <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading properties...</div>
              ) : properties.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-light">
                  You haven't hosted any properties yet.
                </div>
              ) : (
                properties.map((prop) => (
                  <div key={prop.id} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden relative">
                        <Image 
                          src={prop.images?.[0]?.image_url || prop.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                          alt={prop.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-serif text-foreground mb-1 group-hover:text-accent transition-colors">
                          {prop.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-light mb-2">{prop.address}</p>
                        <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <span className="text-accent">{prop.property_type || "VILLA"}</span>
                          <span>•</span>
                          <span>${prop.price_per_night}/night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Concierge Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-secondary p-8 border border-border/40 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-6 arch-shadow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4">Dedicated Concierge</h3>
            <p className="text-muted-foreground leading-relaxed font-light mb-8">
              Your personal architectural liaison is available 24/7 to assist with bespoke requests, transport, or private chefs for your upcoming stays.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/dashboard/chat"}
            className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-accent hover:text-white transition-colors arch-shadow"
          >
            Start Conversation
          </button>
        </motion.div>

      </div>
    </div>
  );
}
