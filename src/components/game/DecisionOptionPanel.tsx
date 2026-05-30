"use client";

import { useGameStore } from "@/store/gameStore";
import { type DecisionOption } from "@/data/scenario";
import {
  Sparkles,
  Check,
  Loader2,
  TrendingUp,
  TrendingDown,
  Coins,
  Star,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

/** Accent color config per card index */
const cardAccents = [
  {
    gradient: "from-violet-500/20 to-violet-600/5",
    border: "rgba(139, 92, 246, 0.4)",
    borderHover: "rgba(139, 92, 246, 0.7)",
    glow: "rgba(139, 92, 246, 0.25)",
    text: "#c4b5fd",
    icon: "#a78bfa",
    badge: "rgba(139, 92, 246, 0.15)",
    badgeBorder: "rgba(139, 92, 246, 0.25)",
    revealBg: "rgba(139, 92, 246, 0.08)",
  },
  {
    gradient: "from-cyan-500/20 to-cyan-600/5",
    border: "rgba(6, 182, 212, 0.4)",
    borderHover: "rgba(6, 182, 212, 0.7)",
    glow: "rgba(6, 182, 212, 0.25)",
    text: "#a5f3fc",
    icon: "#22d3ee",
    badge: "rgba(6, 182, 212, 0.15)",
    badgeBorder: "rgba(6, 182, 212, 0.25)",
    revealBg: "rgba(6, 182, 212, 0.08)",
  },
  {
    gradient: "from-amber-500/20 to-amber-600/5",
    border: "rgba(245, 158, 11, 0.4)",
    borderHover: "rgba(245, 158, 11, 0.7)",
    glow: "rgba(245, 158, 11, 0.25)",
    text: "#fde68a",
    icon: "#fbbf24",
    badge: "rgba(245, 158, 11, 0.15)",
    badgeBorder: "rgba(245, 158, 11, 0.25)",
    revealBg: "rgba(245, 158, 11, 0.08)",
  },
];

export default function DecisionOptionPanel() {
  const decisionOptionPhase = useGameStore((s) => s.decisionOptionPhase);
  const selectedDecisionOption = useGameStore((s) => s.selectedDecisionOption);
  const selectDecisionOption = useGameStore((s) => s.selectDecisionOption);
  const currentTask = useGameStore((s) => s.currentTask);
  const aiDecisionOptions = useGameStore((s) => s.aiDecisionOptions);
  const isDecisionOptionsLoading = useGameStore((s) => s.isDecisionOptionsLoading);
  const consequenceRevealed = useGameStore((s) => s.consequenceRevealed);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!decisionOptionPhase) return null;

  // Use AI-generated options if available, otherwise fall back to hardcoded
  const hardcodedOptions: DecisionOption[] =
    currentTask?.type === "main"
      ? ((currentTask as Record<string, unknown>).decisionOptions as DecisionOption[] | undefined) || []
      : [];

  const options: DecisionOption[] = aiDecisionOptions || hardcodedOptions;

  if (options.length === 0 && !isDecisionOptionsLoading) return null;

  const isOptionSelected = selectedDecisionOption !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in-up"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(26, 16, 64, 0.92))",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-none overflow-y-auto custom-scrollbar">
        {/* Title */}
        <div className="text-center mb-3 sm:mb-6">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base sm:text-xl font-bold gradient-text">选择你的方案</h2>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-white/50">
            每个选择都将影响你的经营之路，请谨慎决策
          </p>
          {isDecisionOptionsLoading && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span className="text-xs text-violet-300/70">AI正在根据你的对话生成个性化方案...</span>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          {options.map((option, index) => {
            const accent = cardAccents[index % cardAccents.length];
            const isSelected = selectedDecisionOption?.id === option.id;
            const isOtherSelected = isOptionSelected && !isSelected;

            return (
              <button
                key={option.id}
                onClick={() => {
                  if (!isOptionSelected) {
                    selectDecisionOption(option);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={isOptionSelected}
                className="relative rounded-2xl overflow-hidden text-left transition-all duration-500 group animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationFillMode: "both",
                  transform: isSelected
                    ? "scale(1.03)"
                    : isOtherSelected
                    ? "scale(0.92) opacity(0.4)"
                    : hoveredIndex === index
                    ? "scale(1.02) translateY(-4px)"
                    : "scale(1)",
                  opacity: isOtherSelected ? 0.4 : 1,
                  filter: isOtherSelected ? "blur(1px)" : "none",
                  border: `2px solid ${isSelected ? accent.borderHover : accent.border}`,
                  boxShadow: isSelected
                    ? `0 0 30px ${accent.glow}, 0 0 60px ${accent.glow}`
                    : hoveredIndex === index
                    ? `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${accent.glow}`
                    : "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} transition-opacity duration-300`}
                  style={{ opacity: hoveredIndex === index || isSelected ? 1 : 0.6 }}
                />

                {/* Card top accent line */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accent.icon}, transparent)`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />

                {/* Content */}
                <div className="relative p-3 sm:p-5">
                  {/* Card index badge */}
                  <div
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: accent.badge,
                      border: `1px solid ${accent.badgeBorder}`,
                      color: accent.text,
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm sm:text-base font-bold mb-1.5 sm:mb-2 pr-8 transition-colors duration-200"
                    style={{ color: accent.text }}
                  >
                    {option.title}
                  </h3>

                  {/* Description - this is all the player sees before choosing */}
                  <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Mystery indicator - tells player consequences are hidden */}
                  {!isSelected && (
                    <div
                      className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
                      style={{
                        background: "rgba(10, 14, 26, 0.5)",
                        border: `1px solid ${accent.badgeBorder}`,
                      }}
                    >
                      <Zap className="w-3 h-3" style={{ color: accent.icon }} />
                      <span className="text-white/40">选择后揭晓后果...</span>
                    </div>
                  )}

                  {/* ===== CONSEQUENCE REVEAL (shown after selection) ===== */}
                  {isSelected && consequenceRevealed && (
                    <div
                      className="mt-3 rounded-xl overflow-hidden animate-fade-in-up"
                      style={{
                        background: accent.revealBg,
                        border: `1px solid ${accent.border}`,
                      }}
                    >
                      {/* Consequence narrative */}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: accent.text }}>
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-semibold">选择后果</span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {option.consequence}
                        </p>
                      </div>

                      {/* Modifier tags - revealed only after selection */}
                      <div
                        className="px-3 pb-3 flex flex-wrap gap-1.5"
                      >
                        {option.scoreModifier !== 0 && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border animate-fade-in-up"
                            style={{
                              animationDelay: "0.2s",
                              background: option.scoreModifier > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              borderColor: option.scoreModifier > 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                              color: option.scoreModifier > 0 ? "#6ee7b7" : "#fca5a5",
                            }}
                          >
                            {option.scoreModifier > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            决策力 {option.scoreModifier > 0 ? "+" : ""}
                            {option.scoreModifier}
                          </span>
                        )}
                        {option.coinModifier !== 0 && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border bg-amber-500/10 text-amber-300 border-amber-500/20 animate-fade-in-up"
                            style={{ animationDelay: "0.4s" }}
                          >
                            <Coins className="w-3 h-3" />
                            {option.coinModifier > 0 ? "+" : ""}
                            {option.coinModifier} 币
                          </span>
                        )}
                        {option.revenueModifier !== 0 && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border animate-fade-in-up"
                            style={{
                              animationDelay: "0.6s",
                              background: option.revenueModifier > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              borderColor: option.revenueModifier > 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                              color: option.revenueModifier > 0 ? "#6ee7b7" : "#fca5a5",
                            }}
                          >
                            <Star className="w-3 h-3" />
                            营收 {option.revenueModifier > 0 ? "+" : ""}
                            ¥{option.revenueModifier.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected check overlay */}
                  {isSelected && !consequenceRevealed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center animate-bounce-in"
                        style={{
                          background: `linear-gradient(135deg, ${accent.glow}, ${accent.badge})`,
                          border: `2px solid ${accent.borderHover}`,
                        }}
                      >
                        <Check className="w-8 h-8" style={{ color: accent.text }} />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected consequence display (after reveal) */}
        {selectedDecisionOption && consequenceRevealed && (
          <div className="mt-3 sm:mt-6 text-center animate-fade-in-up">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm text-emerald-300 font-medium">
                {selectedDecisionOption.consequence}
              </span>
            </div>
            <p className="text-xs text-white/30 mt-2">即将进入下一关...</p>
          </div>
        )}
      </div>
    </div>
  );
}
