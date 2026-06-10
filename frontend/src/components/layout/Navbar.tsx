"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { PremiumButton } from "@/components/ui/premium-button";
import { LogOut, User, Menu } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { name: "Residences", href: "/search" },
    { name: "About Us", href: "/about" },
    { name: "Concierge", href: "/contact" },
  ];

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed w-full z-50 top-0 px-6 py-4 flex justify-between items-center bg-background/70 backdrop-blur-2xl border-b border-border/40"
    >
      {/* Brand / Logo */}
      <Link href="/" className="flex items-center space-x-3 group relative">
        <div className="h-8 w-8 bg-foreground rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-500">
          <div className="h-3 w-3 bg-background rounded-full" />
        </div>
        <span className="text-2xl font-serif tracking-tight text-foreground group-hover:text-accent transition-colors duration-500">
          RentEase
        </span>
      </Link>

      {/* Center Navigation Links */}
      <div className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className="relative py-2 text-sm font-medium tracking-wide transition-colors duration-300 group">
              <span className={`relative z-10 ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                {link.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="navbar-active"
                  className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        <ModeToggle />
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="group flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center arch-shadow group-hover:scale-105 transition-transform duration-300">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-sm font-medium hidden sm:block group-hover:text-accent transition-colors">{user?.first_name}</span>
            </Link>
            <PremiumButton variant="ghost" size="icon" onClick={logout} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </PremiumButton>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <PremiumButton variant="primary" size="md">
                Get Started
              </PremiumButton>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
