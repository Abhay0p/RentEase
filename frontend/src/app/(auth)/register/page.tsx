"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/authStore";
import { PremiumButton } from "@/components/ui/premium-button";
import api from "@/lib/axios";

const registerSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  is_host: z.boolean(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      is_host: false
    }
  });

  const isHost = watch("is_host");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      // Register
      await api.post("/auth/register/", data);
      
      // Auto login after register
      const res = await api.post("/auth/login/", { email: data.email, password: data.password });
      const { user, access, refresh } = res.data;
      
      login(user, access, refresh);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.data) {
        const errorMsgs = Object.values(err.response.data).flat().join(" ");
        setError(errorMsgs);
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/50 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-foreground rounded-full mb-6 mx-auto group hover:scale-105 transition-transform">
            <div className="h-4 w-4 bg-background rounded-full group-hover:bg-accent transition-colors" />
          </Link>
          <h1 className="text-3xl font-serif text-foreground mb-3">Join the Collection</h1>
          <p className="text-muted-foreground font-light">Request access to exclusive global properties.</p>
        </div>

        <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-10 arch-shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-sm font-medium text-destructive text-center">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                <input 
                  type="text"
                  {...register("first_name")}
                  className={`w-full bg-secondary border ${errors.first_name ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                  placeholder="John"
                />
                {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                <input 
                  type="text"
                  {...register("last_name")}
                  className={`w-full bg-secondary border ${errors.last_name ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                  placeholder="Doe"
                />
                {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input 
                  type="email"
                  {...register("email")}
                  className={`w-full bg-secondary border ${errors.email ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <input 
                  type="password"
                  {...register("password")}
                  className={`w-full bg-secondary border ${errors.password ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${!isHost ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border/40 hover:border-accent/50"}`}
                  onClick={() => setValue("is_host", false)}
                >
                  <p className="font-serif text-foreground mb-1">Guest</p>
                  <p className="text-xs text-muted-foreground font-light">Book luxury stays</p>
                </div>
                <div 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${isHost ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border/40 hover:border-accent/50"}`}
                  onClick={() => setValue("is_host", true)}
                >
                  <p className="font-serif text-foreground mb-1">Host</p>
                  <p className="text-xs text-muted-foreground font-light">List your property</p>
                </div>
              </div>
            </div>

            <PremiumButton 
              type="submit" 
              className="w-full py-6 mt-4 shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Profile..." : "Submit Application"}
            </PremiumButton>

            <div className="text-center pt-4 border-t border-border/40 mt-8">
              <p className="text-sm text-muted-foreground font-light">
                Already a member?{" "}
                <Link href="/login" className="text-foreground font-medium hover:text-accent transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
