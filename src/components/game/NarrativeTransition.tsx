"use client";

import { useGameStore } from "@/store/gameStore";
import { ChevronRight } from "lucide-react";

export default function NarrativeTransition() {
  const currentTransition = useGameStore((s) => s.currentTransition);
  const dismissTransition = useGameStore((s) => s.dismissTransition);

  if (!currentTransition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(26, 16, 64, 0.92))",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Atmospheric background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-violet-400/20 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/15 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-amber-400/15 rounded-full animate-float" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="max-w-lg w-full animate-fade-in-up relative z-10">
        <div className="game-card rounded-2xl p-5 sm:p-8 space-y-4 sm:space-y-6 glow-accent relative overflow-hidden">
          {/* Decorative shimmer */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />

          {/* Narrative text with decorative quote marks */}
          <div className="text-center space-y-4 relative">
            {/* Opening quote ornament */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
              <span className="text-3xl font-serif text-violet-400/30 animate-quote-pulse">&ldquo;</span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20" />
              <span className="text-3xl font-serif text-violet-400/30 animate-quote-pulse">&rdquo;</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
            </div>

            {/* Narrative text */}
            <p className="text-white/85 text-sm sm:text-base leading-relaxed font-light px-2">
              {currentTransition}
            </p>

            {/* Closing quote ornament */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/15" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500/20" />
            </div>
          </div>

          {/* Continue button with gradient */}
          <div className="flex justify-center">
            <button
              onClick={dismissTransition}
              className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.2)",
              }}
            >
              继续
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
