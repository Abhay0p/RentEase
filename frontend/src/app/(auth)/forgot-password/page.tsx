"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { PremiumButton } from "@/components/ui/premium-button";
import api from "@/lib/axios";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      setStatus("loading");
      setMessage(null);
      const res = await api.post("/auth/password-reset/", { email: data.email });
      setStatus("success");
      setMessage("A recovery link has been sent to your email.");
      if (res.data.dev_reset_link) {
        // Extract relative path to work on both localhost and vercel
        const relative = res.data.dev_reset_link.substring(res.data.dev_reset_link.indexOf('/reset-password'));
        setDevLink(relative);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Failed to initiate recovery. Please verify your email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-secondary/50 blur-[100px] rounded-full pointer-events-none opacity-50" />

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
          <h1 className="text-3xl font-serif text-foreground mb-3">Account Recovery</h1>
          <p className="text-muted-foreground font-light">Enter your email to regain access.</p>
        </div>

        <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-10 arch-shadow">
          {status === "success" ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-foreground">Recovery Initiated</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {message}
              </p>
              
              {devLink && (
                <div className="mt-6 p-4 border border-accent/30 bg-accent/5 rounded-xl text-left">
                  <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Developer Preview</p>
                  <p className="text-sm text-muted-foreground font-light mb-4">Skip the email and test the reset flow directly:</p>
                  <Link href={devLink}>
                    <PremiumButton className="w-full py-4 text-sm bg-accent text-white border-none shadow-md">
                      Test Password Reset Flow
                    </PremiumButton>
                  </Link>
                </div>
              )}

              <Link href="/login" className="block mt-8">
                <PremiumButton className="w-full py-6">Return to Sign In</PremiumButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {status === "error" && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="text-sm font-medium text-destructive text-center">{message}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Email</label>
                  <input 
                    type="email"
                    {...register("email")}
                    className={`w-full bg-secondary border ${errors.email ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
                    placeholder="name@example.com"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <PremiumButton 
                type="submit" 
                className="w-full py-6 mt-4 shadow-xl"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Processing..." : "Send Recovery Link"}
              </PremiumButton>

              <div className="text-center pt-4 border-t border-border/40 mt-8">
                <Link href="/login" className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
