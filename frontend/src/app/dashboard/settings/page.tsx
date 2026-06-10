"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { User, Mail, Shield, Check, Save } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import api from "@/lib/axios";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "GUEST",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "GUEST",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Assuming PUT /users/me/ updates the profile.
      await api.put("/users/me/", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        email: user?.email // usually email is read-only but sending it to satisfy serializers
      });
      
      // Update local zustand store
      updateUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role as any,
      });
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="text-muted-foreground font-medium mb-2 uppercase tracking-widest text-xs">Account</p>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground">Preferences</h1>
        <p className="text-muted-foreground mt-4 font-light">Manage your personal information and platform permissions.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border/40 p-8 md:p-12 rounded-3xl arch-shadow"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Preferences updated successfully.
            </div>
          )}

          {/* Read-only Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Mail className="w-3 h-3"/> Account Email
            </label>
            <input 
              disabled
              type="text" 
              value={user?.email || ""}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-4 text-base outline-none text-muted-foreground cursor-not-allowed" 
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3"/> First Name
              </label>
              <input 
                required
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3"/> Last Name
              </label>
              <input 
                required
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="w-3 h-3"/> Platform Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-secondary/50 border border-border focus:border-accent rounded-xl px-4 py-4 text-base outline-none transition-colors appearance-none"
            >
              <option value="GUEST">Guest (Traveler)</option>
              <option value="LANDLORD">Landlord (Host)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Upgrade your account to Landlord to start hosting properties.</p>
          </div>

          <div className="pt-8 border-t border-border/40">
            <PremiumButton 
              type="submit" 
              disabled={loading}
              className="w-full py-5 text-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving Changes..." : "Save Preferences"}
            </PremiumButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
