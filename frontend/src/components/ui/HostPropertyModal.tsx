"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Home, MapPin, DollarSign, Users, BedDouble, Bath, Check, X } from "lucide-react";
import api from "@/lib/axios";
import { PremiumButton } from "@/components/ui/premium-button";

interface HostPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HostPropertyModal({ isOpen, onClose, onSuccess }: HostPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "VILLA",
    address: "",
    price_per_night: "",
    max_guests: "2",
    bedrooms: "1",
    bathrooms: "1",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        address: formData.address,
        price_per_night: parseFloat(formData.price_per_night),
        // The backend requires latitude and longitude
        latitude: 40.7128,  // Default to NYC
        longitude: -74.0060,
        amenities: [`${formData.bedrooms} Bedrooms`, `${formData.bathrooms} Bathrooms`, `Up to ${formData.max_guests} Guests`]
      };

      // 1. Create the Property
      const res = await api.post("/properties/", payload);
      const propertyId = res.data.id;

      // 2. Upload the Image to Django Backend
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        uploadData.append("is_primary", "true");
        
        await api.post(`/properties/${propertyId}/upload_image/`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.detail || "Failed to list property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6 pointer-events-none"
          >
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border/40 rounded-[2rem] arch-shadow pointer-events-auto relative no-scrollbar">
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl md:text-4xl font-serif text-foreground">List a Residence</h2>
                  <p className="text-muted-foreground mt-3 font-light">Add a new luxury property to your exclusive portfolio.</p>
                </div>

                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-accent" />
                    </div>
                    <h2 className="text-3xl font-serif text-foreground mb-4">Property Listed</h2>
                    <p className="text-muted-foreground font-light mb-8">Your residence is now active on the global map.</p>
                    <p className="text-sm font-medium text-accent animate-pulse">Refreshing portfolio...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Image Upload Area */}
                    <div className="relative border-2 border-dashed border-border/60 rounded-2xl hover:border-accent transition-colors overflow-hidden bg-secondary/30 group">
                      {imagePreview ? (
                        <div className="relative h-64 w-full">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <p className="text-white font-semibold">Change Cover Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full mx-auto mb-4 border border-border">
                            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                          <p className="text-foreground font-medium">Upload Cover Image</p>
                          <p className="text-sm text-muted-foreground mt-1 font-light">High-resolution photography required</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Home className="w-3 h-3"/> Title</label>
                        <input 
                          required
                          type="text" 
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. The Malibu Cliffside Villa"
                          className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors" 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">Property Type</label>
                        <select
                          required
                          value={formData.property_type}
                          onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                          className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors appearance-none"
                        >
                          <option value="HOTEL">Hotel</option>
                          <option value="VILLA">Villa</option>
                          <option value="APARTMENT">Apartment</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                        <textarea 
                          required
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Describe the architectural details and luxury amenities..."
                          className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors resize-none" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><MapPin className="w-3 h-3"/> Full Address</label>
                        <input 
                          required
                          type="text" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="e.g. 100 Billionaire's Row, NY"
                          className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><DollarSign className="w-3 h-3"/> Price per Night ($)</label>
                        <input 
                          required
                          type="number" 
                          min="0"
                          value={formData.price_per_night}
                          onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                          placeholder="e.g. 3500"
                          className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors" 
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Users className="w-3 h-3"/> Guests</label>
                          <input required type="number" min="1" value={formData.max_guests} onChange={(e) => setFormData({...formData, max_guests: e.target.value})} className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><BedDouble className="w-3 h-3"/> Beds</label>
                          <input required type="number" min="1" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Bath className="w-3 h-3"/> Baths</label>
                          <input required type="number" min="1" step="0.5" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40">
                      <PremiumButton 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 text-lg"
                      >
                        {loading ? "Publishing to Global Network..." : "Launch Residence"}
                      </PremiumButton>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
