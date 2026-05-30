"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import { Coins, Package, Trophy, MapPin, TrendingUp, History, X } from "lucide-react";
import { useState } from "react";
import type { NumericChangeType } from "@/store/gameStore";

type LedgerFilter = NumericChangeType | "all";

function getCurrentRoute(roleId: string | null) {
  if (!roleId) return scenarioData.routes.shop_owner;
  return scenarioData.routes[roleId] || scenarioData.routes.shop_owner;
}

export default function StatusBar() {
  const [showLog, setShowLog] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all");
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const inventory = useGameStore((s) => s.inventory);
  const totalScore = useGameStore((s) => s.totalScore);
  const revenue = useGameStore((s) => s.revenue);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const selectedRole = useGameStore((s) => s.selectedRole);
  const numericChangeLog = useGameStore((s) => s.numericChangeLog);

  const route = getCurrentRoute(selectedRole?.id || null);

  let mainTaskCount = 0;
  for (let i = 0; i < currentStepIndex; i++) {
    if (route[i].type === "main") mainTaskCount++;
  }
  const totalMainTasks = route.filter((r) => r.type === "main").length;
  const currentStep = route[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / route.length) * 100);
  const currentMainTaskNumber = Math.min(
    mainTaskCount + (currentStep?.type === "main" ? 1 : 0),
    totalMainTasks
  );
  const latestChange = numericChangeLog[numericChangeLog.length - 1];
  const ledgerLabels: Record<LedgerFilter, string> = {
    all: "全部变更",
    score: "决策力变更",
    coins: "决策币明细",
    revenue: "营收变更",
    trait: "风格变化",
    item: "道具记录",
  };
  const filteredChanges = numericChangeLog
    .filter((change) => ledgerFilter === "all" || change.type === ledgerFilter)
    .slice(-8)
    .reverse();
  const openLedger = (filter: LedgerFilter) => {
    setLedgerFilter(filter);
    setShowLog(true);
  };

  return (
    <div className="relative rounded-2xl px-3 py-3 sm:px-5 sm:py-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.86), rgba(26, 16, 64, 0.5))",
        border: "1px solid rgba(139, 92, 246, 0.18)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
      }}
    >
      <div className="mb-3 relative">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <SectionHeader icon={MapPin}>任务总览</SectionHeader>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-white font-bold tabular-nums text-base sm:text-lg">
                {currentStepIndex + 1}/{route.length}
              </span>
              <span className="text-[11px] text-white/45">
                {currentStep?.type === "main"
                  ? `主线 ${currentMainTaskNumber}/${totalMainTasks}`
                  : currentStep?.type === "trigger"
                    ? "事件"
                    : currentStep?.type === "checkpoint"
                      ? "阶段结算"
                      : "流程"}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-white/38">完成度</div>
            <div className="text-xl sm:text-2xl font-black tabular-nums"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {progress}%
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.055)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out progress-bar-gradient"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Stats Row - mobile: smaller, wrapping */}
      <div className="flex items-center gap-1.5 sm:gap-2 relative flex-wrap">
        {/* Score */}
        <button
          onClick={() => openLedger("score")}
          className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          title="查看积分变更记录"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 animate-icon-pulse" />
          <span className="text-amber-300 font-bold text-xs sm:text-sm tabular-nums">{totalScore}</span>
          <span className="text-amber-400/60 text-[9px] hidden sm:inline">决策力</span>
        </button>

        {/* Decision Coins */}
        <button
          onClick={() => openLedger("coins")}
          className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform ${
            latestChange?.type === "coins" && latestChange.delta < 0 ? "coin-spend-pop" : ""
          }`}
          title="查看决策币收支记录"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tabular-nums">{decisionCoins}</span>
          <span className="text-yellow-500/60 text-[9px] hidden sm:inline">币</span>
        </button>

        {/* Items */}
        <button
          onClick={() => openLedger("item")}
          className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          title="查看道具记录"
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
          }}
        >
          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
          <span className="text-emerald-300 font-bold text-xs sm:text-sm tabular-nums">
            {inventory.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
        </button>

        {/* Revenue */}
        <button
          onClick={() => openLedger("revenue")}
          className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          title="查看营收变更记录"
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
        </button>

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

        {latestChange && (
          <button
            onClick={() => {
              setLedgerFilter("all");
              setShowLog(!showLog);
            }}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs text-white/60 hover:text-white/85 transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <History className="w-3 h-3" />
            <span className={latestChange.delta >= 0 ? "text-emerald-300" : "text-red-300"}>
              {latestChange.label} {latestChange.delta > 0 ? "+" : ""}{latestChange.delta.toLocaleString()}
            </span>
          </button>
        )}
      </div>

      {showLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{ background: "rgba(10, 14, 26, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowLog(false)}
        >
          <div
            className="w-full max-w-lg max-h-[82vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(24, 18, 52, 0.96))",
              border: "1px solid rgba(139, 92, 246, 0.22)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
            }}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-white">
                  <History className="w-4 h-4 text-cyan-300" />
                  <span className="font-bold">{ledgerLabels[ledgerFilter]}</span>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  决策力是表现评分，决策币用于解锁资料、缓冲风险和购买道具；模拟营收记录经营结果。
                </p>
              </div>
              <button
                onClick={() => setShowLog(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white/80 hover:bg-white/10 transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pt-3 flex flex-wrap gap-1.5">
              {(["all", "score", "coins", "revenue", "item", "trait"] as LedgerFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLedgerFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    ledgerFilter === filter ? "text-cyan-100 bg-cyan-400/12 border border-cyan-300/20" : "text-white/45 hover:text-white/75 border border-white/8 bg-white/[0.03]"
                  }`}
                >
                  {filter === "all" ? "全部" : filter === "score" ? "决策力" : filter === "coins" ? "决策币" : filter === "revenue" ? "营收" : filter === "trait" ? "风格" : "道具"}
                </button>
              ))}
            </div>

            {ledgerFilter === "item" && inventory.length > 0 && (
              <div className="mx-4 mt-3 rounded-xl px-3 py-2 border border-emerald-300/15 bg-emerald-400/5">
                <div className="text-[10px] text-white/35 mb-1">当前道具</div>
                <div className="flex flex-wrap gap-1">
                  {inventory.map((item) => (
                    <span key={item.shopItem.id} className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-400/10 text-emerald-200 border border-emerald-400/15">
                      {item.shopItem.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 max-h-[52vh] overflow-y-auto custom-scrollbar px-4 pb-4">
              {filteredChanges.length > 0 ? (
                <div className="space-y-2">
                  {filteredChanges.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-xs"
                      style={{
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="min-w-0">
                        <div>
                          <span className="text-white/78 font-medium">{change.label}</span>
                          <span className="text-white/25 mx-1.5">·</span>
                          <span className="text-white/45">{change.source}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-white/42 leading-relaxed">{change.reason}</div>
                        <div className="mt-1 text-[10px] text-white/25">
                          {new Date(change.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                      </div>
                      <div className={`shrink-0 text-sm font-bold tabular-nums ${change.delta >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {change.delta > 0 ? "+" : ""}{change.delta.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl px-3 py-8 text-center text-xs text-white/35 bg-white/[0.03] border border-white/7">
                  暂无{ledgerLabels[ledgerFilter]}记录
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] font-bold text-white/72">
      <Icon className="w-3.5 h-3.5 text-cyan-300" />
      {children}
    </div>
  );
}
