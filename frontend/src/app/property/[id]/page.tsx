"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { PremiumButton } from "@/components/ui/premium-button";
import { MapPin, Bath, BedDouble, Square, Wifi, Car, Tv, Wind, Check, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export default function PropertyDetailPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Booking State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Derived Values
  const nights = (checkIn && checkOut) 
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)))
    : 1;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${params.id}/`);
        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }

    try {
      setBookingStatus("loading");
      setBookingError(null);

      // 1. Create Booking in Django
      const bookingRes = await api.post("/bookings/", {
        property: property.id,
        check_in: checkIn,
        check_out: checkOut,
      });

      const bookingId = bookingRes.data.id;

      // 2. Initialize Payment (Get Razorpay Order ID)
      const paymentRes = await api.post(`/bookings/${bookingId}/create_payment/`);
      const { order_id, amount, currency, key_id } = paymentRes.data;

      // 3. Open Razorpay Modal
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "RentEase Luxury",
        description: `Booking for ${property.title}`,
        order_id: order_id,
        handler: async function (response: any) {
          // 4. Verify Payment on Success
          try {
            await api.post(`/bookings/${bookingId}/verify_payment/`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookingStatus("success");
          } catch (verifyErr) {
            console.error("Verification failed", verifyErr);
            setBookingError("Payment verification failed. Please contact concierge.");
            setBookingStatus("idle");
          }
        },
        prefill: {
          name: user?.first_name + " " + user?.last_name,
          email: user?.email,
        },
        theme: {
          color: "#0F1115", // Dark Theme
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setBookingError("Payment failed: " + response.error.description);
        setBookingStatus("idle");
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setBookingError(err.response?.data?.detail || "Failed to initiate booking.");
      setBookingStatus("idle");
    }
  };

  const mockImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1600607687931-cebf0746e50e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-6 space-y-8">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-[60vh] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <Navbar />

      <main className="pt-24 pb-32">
        {/* Cinematic Gallery Header */}
        <div className="w-full h-[70vh] relative bg-card mb-16 flex overflow-hidden">
           <motion.div 
             key={activeImage}
             initial={{ opacity: 0, scale: 1.05 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="absolute inset-0"
           >
              <Image 
                src={property?.images?.[0]?.image_url || property?.image_url || mockImages[activeImage]} 
                alt="Property Image"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
           </motion.div>
           
           {/* Gallery Controls */}
           <div className="absolute bottom-8 right-8 flex gap-4 z-20">
             {mockImages.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => setActiveImage(idx)}
                 className={`w-16 h-2 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
               />
             ))}
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
          
          {/* Main Details (Left Col) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold uppercase tracking-widest mb-4">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{property?.address}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-foreground leading-[1.1] mb-8">{property?.title}</h1>
              
              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-border/40 text-muted-foreground font-medium">
                <div className="flex items-center gap-3">
                  <BedDouble className="w-5 h-5 text-accent" />
                  <span>{property?.bedrooms || 3} Bedrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="w-5 h-5 text-accent" />
                  <span>{property?.bathrooms || 2.5} Bathrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Square className="w-5 h-5 text-accent" />
                  <span>4,500 sqft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-2xl font-serif text-foreground mb-6">About the Residence</h3>
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                {property?.description}
              </p>
            </div>

            {/* Premium Amenities */}
            <div>
              <h3 className="text-2xl font-serif text-foreground mb-6">Curated Amenities</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {property?.amenities?.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground font-light">
                    <Check className="w-5 h-5 text-accent" />
                    <span>{amenity}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center gap-3 text-muted-foreground font-light"><Wifi className="w-5 h-5 text-accent"/> Fiber Internet</div>
                    <div className="flex items-center gap-3 text-muted-foreground font-light"><Car className="w-5 h-5 text-accent"/> Valet Parking</div>
                    <div className="flex items-center gap-3 text-muted-foreground font-light"><Tv className="w-5 h-5 text-accent"/> Home Theater</div>
                    <div className="flex items-center gap-3 text-muted-foreground font-light"><Wind className="w-5 h-5 text-accent"/> Climate Control</div>
                  </>
                )}
              </div>
            </div>

            {/* Host Section */}
            <div className="pt-12 border-t border-border/40 mt-12 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center arch-shadow">
                  <span className="text-2xl font-serif text-muted-foreground">
                    {property?.landlord_name?.[0] || 'H'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-serif text-foreground mb-1">Hosted by {property?.landlord_name || 'RentEase Partner'}</h4>
                  <p className="text-sm text-muted-foreground font-light">Superhost • Luxury Specialist</p>
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  if (!isAuthenticated) return router.push("/login");
                  try {
                    const res = await api.post("/chat/conversations/", { property_id: property.id });
                    router.push(`/dashboard/chat?conversationId=${res.data.id}`);
                  } catch (err) {
                    console.error("Failed to start chat", err);
                  }
                }}
                className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-secondary hover:text-accent transition-colors font-medium text-sm"
              >
                Message Host
              </button>
            </div>

          </div>

          {/* Booking Sidebar (Right Col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-card border border-border/40 rounded-3xl p-8 arch-shadow">
              <div className="mb-8">
                <span className="text-4xl font-serif text-foreground">${property?.price_per_night}</span>
                <span className="text-muted-foreground ml-2 font-medium">/ night</span>
              </div>

              {bookingStatus === "success" ? (
                <div className="space-y-6 text-center py-8">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-serif text-foreground">Reservation Confirmed</h3>
                  <p className="text-muted-foreground font-light text-sm">
                    Your luxury stay is officially booked. Check your dashboard for itinerary details.
                  </p>
                  <button 
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-4 mt-4 rounded-xl bg-foreground text-background font-semibold hover:bg-accent hover:text-white transition-colors arch-shadow"
                  >
                    View Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookingError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                      <p className="text-xs font-medium text-destructive text-center">{bookingError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-In</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-secondary border border-border focus:border-accent rounded-xl px-4 py-3 text-sm font-sans outline-none transition-colors" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check-Out</label>
                      <input 
                        type="date" 
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-secondary border border-border focus:border-accent rounded-xl px-4 py-3 text-sm font-sans outline-none transition-colors" 
                      />
                    </div>
                  </div>
                  
                  <PremiumButton 
                    onClick={handleBooking} 
                    disabled={bookingStatus === "loading"}
                    className="w-full py-6 text-lg mt-4 shadow-xl"
                  >
                    {bookingStatus === "loading" ? "Processing..." : "Request Reservation"}
                  </PremiumButton>
                  
                  <p className="text-center text-sm text-muted-foreground font-light mt-4">
                    You won't be charged yet.
                  </p>
                </div>
              )}
              
              {/* Price Breakdown */}
              {bookingStatus !== "success" && (
                <div className="mt-8 pt-8 border-t border-border/40">
                  <div className="flex items-center justify-between text-muted-foreground font-medium mb-4">
                    <span className="underline decoration-border underline-offset-4">${property?.price_per_night} x {nights} nights</span>
                    <span>${property?.price_per_night * nights || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground font-medium mb-4">
                    <span className="underline decoration-border underline-offset-4">Concierge Fee</span>
                    <span>$450</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground font-serif text-xl mt-6 pt-6 border-t border-border">
                    <span>Total</span>
                    <span>${(property?.price_per_night * nights || 0) + 450}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
