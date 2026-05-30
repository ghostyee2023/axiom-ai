"use client";

import { useGameStore } from "@/store/gameStore";
import { ChevronRight, Sparkles } from "lucide-react";

export default function NarrativeTransition() {
  const currentTransition = useGameStore((s) => s.currentTransition);
  const dismissTransition = useGameStore((s) => s.dismissTransition);

  if (!currentTransition) return null;
  const reveal = buildRevealCopy(currentTransition);

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

          <div className="text-center space-y-3 relative">
            <div className="mx-auto w-10 h-10 rounded-2xl flex items-center justify-center bg-violet-400/10 border border-violet-300/18">
              <Sparkles className="w-5 h-5 text-violet-200 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-cyan-200/70 tracking-[0.22em]">下一幕</div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {reveal.title}
            </h2>
            <p className="text-white/58 text-sm sm:text-base leading-relaxed px-2">
              {currentTransition}
            </p>
            <div className="mx-auto w-20 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
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
              揭开下一关
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildRevealCopy(text: string) {
  if (/危机|投诉|涨价|竞争|连锁|断供|亏损|罚|压力|糟|下降/.test(text)) {
    return { title: "糟糕，局面突然变复杂了。" };
  }
  if (/机会|增长|奖励|合作|转机|好评|口碑|回升|赚|增加/.test(text)) {
    return { title: "太好了，转机出现了。" };
  }
  if (/上一|选择|决定|影响|后续/.test(text)) {
    return { title: "诶？你的上一步正在改写局面。" };
  }
  return { title: "新的局面被推到了你面前。" };
}
