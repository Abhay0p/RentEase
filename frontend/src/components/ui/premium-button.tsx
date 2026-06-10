"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    // Ambient Soft Lighting on hover
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    };

    const variants = {
      primary: "bg-primary text-primary-foreground arch-shadow hover:bg-primary/90 font-medium",
      secondary: "bg-secondary text-secondary-foreground arch-shadow hover:bg-secondary/80 font-medium",
      ghost: "hover:bg-accent/10 hover:text-accent font-medium",
      outline: "border border-border/60 bg-transparent hover:bg-accent/5 text-foreground hover:border-accent/40 font-medium",
      danger: "bg-destructive text-destructive-foreground arch-shadow hover:bg-destructive/90 font-medium",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12 flex items-center justify-center",
    };

    return (
      <motion.button
        ref={ref}
        onMouseMove={handleMouseMove}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-full transition-all duration-300 flex items-center justify-center font-sans tracking-wide",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Soft Luxury Glow */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 mix-blend-overlay"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                100px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.15),
                transparent 80%
              )
            `,
          }}
        />

        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";
