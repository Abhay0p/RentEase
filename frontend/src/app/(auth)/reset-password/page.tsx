"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { PremiumButton } from "@/components/ui/premium-button";
import api from "@/lib/axios";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid or missing reset link parameters.");
      return;
    }

    try {
      setStatus("loading");
      setMessage(null);
      await api.post("/auth/password-reset-confirm/", { 
        uid, 
        token, 
        password: data.password 
      });
      setStatus("success");
      setMessage("Your password has been successfully reset. You can now log in.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Failed to reset password. The link may have expired.");
    }
  };

  if (!uid || !token) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-serif text-foreground mb-4">Invalid Link</h3>
        <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
          This password reset link is invalid or missing required parameters.
        </p>
        <Link href="/forgot-password">
          <PremiumButton className="w-full py-6">Request New Link</PremiumButton>
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-serif text-foreground">Password Reset Complete</h3>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          {message}
        </p>
        <Link href="/login" className="block mt-8">
          <PremiumButton className="w-full py-6">Return to Sign In</PremiumButton>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {status === "error" && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <p className="text-sm font-medium text-destructive text-center">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
          <input 
            type="password"
            {...register("password")}
            className={`w-full bg-secondary border ${errors.password ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
          <input 
            type="password"
            {...register("confirmPassword")}
            className={`w-full bg-secondary border ${errors.confirmPassword ? "border-destructive" : "border-transparent focus:border-accent"} rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <PremiumButton 
        type="submit" 
        className="w-full py-6 mt-4 shadow-xl"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Resetting..." : "Reset Password"}
      </PremiumButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
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
          <h1 className="text-3xl font-serif text-foreground mb-3">Set New Password</h1>
          <p className="text-muted-foreground font-light">Secure your account with a new password.</p>
        </div>

        <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-10 arch-shadow">
          <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
