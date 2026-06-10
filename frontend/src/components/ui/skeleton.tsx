import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-sm bg-muted/30 border border-muted/50 hud-glow", className)}
      {...props}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px)`,
          backgroundSize: '10px 10px'
        }}
      />
      
      {/* Scanning Line */}
      <div className="absolute inset-0 -translate-y-full animate-[shimmer_2s_infinite] bg-gradient-to-b from-transparent via-accent/30 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.5)] border-b border-accent/80" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/40" />
    </div>
  )
}

export { Skeleton }
