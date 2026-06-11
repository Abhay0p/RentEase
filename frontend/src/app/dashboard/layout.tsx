"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MessageSquare, Settings, LogOut, Compass, Search, Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const menu = [
    { name: "Portfolio", icon: Building2, path: "/dashboard" },
    { name: "Concierge Chat", icon: MessageSquare, path: "/dashboard/chat" },
    { name: "Discover", icon: Compass, path: "/search" },
    { name: "Preferences", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Elegant Sidebar (Desktop) */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-72 bg-card border-r border-border/40 flex-col z-20 arch-shadow"
      >
        <div className="h-24 flex items-center px-8 border-b border-border/40">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-8 w-8 bg-foreground rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-background rounded-full" />
            </div>
            <span className="text-xl font-serif text-foreground">RentEase</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          <div className="px-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Management Suite</p>
          </div>
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-secondary text-foreground arch-shadow" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute right-6 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-border/40 bg-secondary/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border arch-shadow">
              <span className="text-lg font-serif">{user?.first_name?.[0] || 'U'}</span>
            </div>
            <div>
              <p className="font-serif text-foreground leading-tight">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-muted-foreground font-light">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-background">
        
        {/* Top Search & Actions Bar */}
        <header className="h-24 px-6 md:px-10 flex items-center justify-between border-b border-border/40 bg-card/50 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center md:hidden gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <span className="text-xl font-serif tracking-tight text-foreground">RentEase</span>
          </div>
          
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search properties, bookings, or clients..." 
              className="w-full bg-secondary border border-border/50 focus:border-accent rounded-full pl-12 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-accent/10"
            />
          </div>
          <div className="flex items-center gap-6">
            <ModeToggle />
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card hover:bg-secondary cursor-pointer transition-colors">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card border-r border-border/40 flex flex-col z-50 arch-shadow md:hidden"
            >
              <div className="h-24 flex items-center justify-between px-8 border-b border-border/40">
                <Link href="/" className="flex items-center space-x-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="h-8 w-8 bg-foreground rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-background rounded-full" />
                  </div>
                  <span className="text-xl font-serif text-foreground">RentEase</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                <div className="px-4 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Management Suite</p>
                </div>
                {menu.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.path} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-secondary text-foreground arch-shadow" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t border-border/40 bg-secondary/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border arch-shadow flex-shrink-0">
                    <span className="text-lg font-serif">{user?.first_name?.[0] || 'U'}</span>
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="font-serif text-foreground leading-tight truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground font-light truncate">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
