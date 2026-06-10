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
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      
      const res = await api.post("/auth/login/", data);
      const { user, access, refresh } = res.data;
      
      login(user, access, refresh);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/50 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-foreground rounded-full mb-6 mx-auto group hover:scale-105 transition-transform">
            <div className="h-4 w-4 bg-background rounded-full group-hover:bg-accent transition-colors" />
          </Link>
          <h1 className="text-3xl font-serif text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground font-light">Access your exclusive portfolio.</p>
        </div>

        <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-10 arch-shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-sm font-medium text-destructive text-center">{error}</p>
              </div>
            )}

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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-foreground transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input 
                  type="password"
                  {...register("password")}
                  className={`w-full bg-secondary border ${errors.password ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <PremiumButton 
              type="submit" 
              className="w-full py-6 mt-4 shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </PremiumButton>

            <div className="text-center pt-4 border-t border-border/40 mt-8">
              <p className="text-sm text-muted-foreground font-light">
                Not a member yet?{" "}
                <Link href="/register" className="text-foreground font-medium hover:text-accent transition-colors">
                  Request access
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
