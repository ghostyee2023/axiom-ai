"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import { Coins, Package, Trophy, MapPin, Zap, RotateCcw, TrendingUp } from "lucide-react";

function getCurrentRoute(roleId: string | null) {
  if (!roleId) return scenarioData.routes.shop_owner;
  return scenarioData.routes[roleId] || scenarioData.routes.shop_owner;
}

export default function StatusBar() {
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const inventory = useGameStore((s) => s.inventory);
  const totalScore = useGameStore((s) => s.totalScore);
  const revenue = useGameStore((s) => s.revenue);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const selectedRole = useGameStore((s) => s.selectedRole);

  const route = getCurrentRoute(selectedRole?.id || null);

  let mainTaskCount = 0;
  for (let i = 0; i < currentStepIndex; i++) {
    if (route[i].type === "main") mainTaskCount++;
  }
  const totalMainTasks = route.filter((r) => r.type === "main").length;
  const currentStep = route[currentStepIndex];
  const progress = Math.round((currentStepIndex / route.length) * 100);

  return (
    <div className="relative rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.04), rgba(26, 16, 64, 0.6))",
        border: "1px solid rgba(139, 92, 246, 0.15)",
      }}
    >
      {/* Subtle decorative corner accents */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-20"
        style={{ background: "radial-gradient(circle at top right, rgba(139, 92, 246, 0.3), transparent 70%)" }}
      />
      <div className="absolute bottom-0 left-0 w-12 h-12 opacity-15"
        style={{ background: "radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.3), transparent 70%)" }}
      />

      {/* Progress Bar */}
      <div className="mb-2 sm:mb-3 relative">
        <div className="flex items-center justify-between text-xs mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span className="text-white/80 font-medium tabular-nums text-[11px] sm:text-xs">
              {currentStepIndex + 1}/{route.length}
            </span>
            {currentStep?.type === "main" && (
              <span className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                任务 {mainTaskCount + 1}/{totalMainTasks}
              </span>
            )}
            {currentStep?.type === "trigger" && (
              <span className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> 事件
              </span>
            )}
            {currentStep?.type === "checkpoint" && (
              <span className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                <RotateCcw className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> 结算
              </span>
            )}
          </div>
          <span className="text-base sm:text-lg font-bold tabular-nums"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {progress}%
          </span>
        </div>
        {/* Progress track */}
        <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(10, 14, 26, 0.6)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out progress-bar-gradient"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Row - mobile: smaller, wrapping */}
      <div className="flex items-center gap-1.5 sm:gap-3 relative flex-wrap">
        {/* Score */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 animate-icon-pulse" />
          <span className="text-amber-300 font-bold text-xs sm:text-sm tabular-nums">{totalScore}</span>
          <span className="text-amber-400/60 text-[9px] hidden sm:inline">分</span>
        </div>

        {/* Decision Coins */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tabular-nums">{decisionCoins}</span>
          <span className="text-yellow-500/60 text-[9px] hidden sm:inline">币</span>
        </div>

        {/* Items */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg"
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
          }}
        >
          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
          <span className="text-emerald-300 font-bold text-xs sm:text-sm tabular-nums">
            {inventory.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg"
          style={{
            background: revenue >= 0
              ? "rgba(16, 185, 129, 0.08)"
              : "rgba(239, 68, 68, 0.08)",
            border: `1px solid ${revenue >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
          }}
        >
          <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${revenue >= 0 ? "text-emerald-400" : "text-red-400"}`} />
          <span className={`font-bold text-xs sm:text-sm tabular-nums ${revenue >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            ¥{revenue >= 0 ? revenue.toLocaleString() : revenue.toLocaleString()}
          </span>
        </div>

        {/* Inventory Items Detail - desktop only */}
        {inventory.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 ml-auto">
            {inventory.map((item) => (
              <span
                key={item.shopItem.id}
                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
                title={item.shopItem.description}
              >
                {item.shopItem.name}×{item.quantity}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
