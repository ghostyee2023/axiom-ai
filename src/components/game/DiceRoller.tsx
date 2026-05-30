"use client";

import { useGameStore } from "@/store/gameStore";
import type { CrisisCard } from "@/data/scenario";
import { scenarioData } from "@/data/scenario";
import { Dices, Shield, Sparkles, AlertTriangle } from "lucide-react";

/** Dice face dot positions for values 1-6 */
function DiceFace({ value, size = 72 }: { value: number; size?: number }) {
  const dotSize = Math.max(6, size * 0.13);
  const positions: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]],
  };

  const dots = positions[value] || positions[1];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {dots.map(([xPct, yPct], i) => (
        <div
          key={i}
          className="absolute rounded-full animate-dice-dot bg-white"
          style={{
            width: dotSize,
            height: dotSize,
            left: `${xPct * 100}%`,
            top: `${yPct * 100}%`,
            transform: "translate(-50%, -50%)",
            animationDelay: `${i * 0.05}s`,
            boxShadow: "0 0 6px rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </div>
  );
}

export default function DiceRoller() {
  const currentEvent = useGameStore((s) => s.currentEvent);
  const diceResult = useGameStore((s) => s.diceResult);
  const diceRolled = useGameStore((s) => s.diceRolled);
  const isDiceRolling = useGameStore((s) => s.isDiceRolling);
  const mitigated = useGameStore((s) => s.mitigated);
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const rollDice = useGameStore((s) => s.rollDice);
  const mitigateCrisis = useGameStore((s) => s.mitigateCrisis);
  const acceptCrisisResult = useGameStore((s) => s.acceptCrisisResult);
  const inventory = useGameStore((s) => s.inventory);

  if (!currentEvent || currentEvent.type !== "crisis") return null;

  const crisis = currentEvent as CrisisCard;

  // Check if player has reroll dice item
  const hasRerollDice = inventory.some(
    (i) => i.shopItem.effect === "reroll_dice" && i.quantity > 0
  );

  // Severity color based on dice value
  const severityColor =
    diceResult && diceResult.value <= 2
      ? "#ef4444"
      : diceResult && diceResult.value <= 4
      ? "#f59e0b"
      : "#10b981";

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-in-up relative"
      style={{
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(26, 16, 64, 0.4))",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderTop: "2px solid rgba(239, 68, 68, 0.35)",
      }}
    >
      {/* Top gradient accent line */}
      <div className="h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #ef4444, #f97316, #ef4444, transparent)" }}
      />

      {/* Before dice rolled - compact call-to-action */}
      {!diceRolled && (
        <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-red-400">处理突发挑战</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/30">1=最坏 ⚔️ 6=最轻 🛡️</span>
          </div>

          {/* Dice Display */}
          <div className="flex justify-center">
            <div
              className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${
                isDiceRolling ? "dice-rolling" : ""
              }`}
              style={{
                width: 72,
                height: 72,
                background: isDiceRolling
                  ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15))"
                  : "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.08))",
                border: isDiceRolling
                  ? "2px solid rgba(139, 92, 246, 0.3)"
                  : "2px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {isDiceRolling ? (
                <span className="text-2xl sm:text-3xl font-black text-white/60 animate-pulse">?</span>
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white/20">?</span>
              )}
            </div>
          </div>

          {/* Roll Button - Prominent with pulsing glow */}
          <button
            onClick={rollDice}
            disabled={isDiceRolling}
            className="w-full py-2.5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden"
            style={{
              background: isDiceRolling
                ? "linear-gradient(135deg, #8b5cf666, #06b6d466)"
                : "linear-gradient(135deg, #ef4444, #f97316)",
              boxShadow: isDiceRolling
                ? "none"
                : undefined,
              animation: isDiceRolling ? "none" : "pulse-glow-red 2s ease-in-out infinite",
            }}
          >
            <Dices className="w-5 h-5" />
            {isDiceRolling ? "命运之骰转动中..." : scenarioData.strings.dice_roll_button}
          </button>
        </div>
      )}

      {/* After dice rolled - compact result display */}
      {diceRolled && diceResult && (
        <div className="p-2 sm:p-3 space-y-2 sm:space-y-2.5">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
              <span className="text-xs sm:text-sm font-bold text-white">骰子结果</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black" style={{ color: severityColor }}>
                {diceResult.value}
              </span>
              <span className="text-[10px] sm:text-xs text-white/40">点</span>
            </div>
          </div>

          {/* Dice + narrative inline */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: 44,
                height: 44,
                background: `linear-gradient(135deg, ${severityColor}18, ${severityColor}08)`,
                border: `2px solid ${severityColor}40`,
                boxShadow: `0 0 20px ${severityColor}15`,
              }}
            >
              <DiceFace value={diceResult.value} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed line-clamp-2">
                {diceResult.narrative}
              </p>
              <div className="mt-1 text-[11px] sm:text-xs font-bold" style={{ color: severityColor }}>
                惩罚：{mitigated ? Math.ceil(diceResult.penalty / 2) : diceResult.penalty} 分
                {mitigated && "（已缓冲）"}
              </div>
            </div>
          </div>

          {/* Action buttons in a row */}
          <div className="flex gap-1.5 sm:gap-2">
            {/* Mitigate Button */}
            {!mitigated && (
              <button
                onClick={mitigateCrisis}
                disabled={decisionCoins < crisis.mitigationCost}
                className="flex-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border border-amber-500/25"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))",
                  color: "#f59e0b",
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                缓冲 (-{crisis.mitigationCost}币)
              </button>
            )}

            {/* Use Reroll Dice Item */}
            {hasRerollDice && !isDiceRolling && (
              <button
                onClick={() => {
                  const rerollItem = inventory.find(
                    (i) => i.shopItem.effect === "reroll_dice" && i.quantity > 0
                  );
                  if (rerollItem) {
                    useGameStore.getState().useItem(rerollItem.shopItem.id);
                    useGameStore.setState({ diceRolled: false, diceResult: null });
                    setTimeout(() => rollDice(), 100);
                  }
                }}
                className="flex-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 border border-emerald-500/25"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))",
                  color: "#10b981",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                重掷
              </button>
            )}

            {/* Mitigated badge */}
            {mitigated && (
              <div className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/15"
                style={{
                  background: "rgba(245, 158, 11, 0.06)",
                  color: "#fbbf24",
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                已缓冲！惩罚减半
              </div>
            )}
          </div>

          <button
            onClick={acceptCrisisResult}
            className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #ef4444, #8b5cf6)",
              boxShadow: "0 8px 24px rgba(239,68,68,0.16)",
            }}
          >
            记录影响，继续主线
          </button>
        </div>
      )}
    </div>
  );
}
