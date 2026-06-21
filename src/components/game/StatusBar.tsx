"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import { Coins, Package, Trophy, MapPin, TrendingUp, History, X, Zap, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const inventory = useGameStore((s) => s.inventory);
  const totalScore = useGameStore((s) => s.totalScore);
  const revenue = useGameStore((s) => s.revenue);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const selectedRole = useGameStore((s) => s.selectedRole);
  const numericChangeLog = useGameStore((s) => s.numericChangeLog);
  const activateInventoryItem = useGameStore((s) => s.useItem);
  const subPhase = useGameStore((s) => s.subPhase);
  const skipNextCrisis = useGameStore((s) => s.skipNextCrisis);
  const expertRoleActive = useGameStore((s) => s.expertRoleActive);
  const doubleDiceActive = useGameStore((s) => s.doubleDiceActive);

  const route = getCurrentRoute(selectedRole?.id || null);

  const currentStep = route[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / route.length) * 100);
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
    <div className="relative rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.86), rgba(26, 16, 64, 0.5))",
        border: "1px solid rgba(139, 92, 246, 0.18)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
      }}
    >
      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <SectionHeader icon={MapPin}>进度</SectionHeader>
            <span className="text-white/72 font-bold tabular-nums text-sm sm:text-base">
              {currentStepIndex + 1}/{route.length}
            </span>
            {currentStep?.type !== "main" && (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-white/45">
                {currentStep?.type === "trigger"
                  ? "事件"
                  : currentStep?.type === "checkpoint"
                    ? "阶段结算"
                    : "流程"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold text-white/58 transition hover:text-white/85"
          >
            {progress}%
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
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
      {expanded && (
      <div className="mt-2.5 animate-expand">
      <div className="flex items-center gap-1.5 sm:gap-2 relative flex-wrap">
        {/* Score */}
        <button
          onClick={() => openLedger("score")}
          className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          title="查看决策力变更记录"
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
          <span className="text-yellow-500/60 text-[9px] hidden sm:inline">决策币</span>
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
          <span className="text-emerald-400/60 text-[9px] hidden sm:inline">道具</span>
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
          <span className={`text-[9px] hidden sm:inline ${revenue >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>营收</span>
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

        {latestChange && false && (
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
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <ResourceHint label="决策力" value="AI 协作评分" />
        <ResourceHint label="营收" value="经营结果" />
        <ResourceHint label="决策币" value="解锁资料/重做" />
        <ResourceHint label="道具" value="临时能力" />
      </div>
      </div>
      )}

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
                    <InventoryUseRow
                      key={item.shopItem.id}
                      item={item}
                      subPhase={subPhase}
                      skipNextCrisis={skipNextCrisis}
                      expertRoleActive={expertRoleActive}
                      doubleDiceActive={doubleDiceActive}
                      onUse={() => activateInventoryItem(item.shopItem.id)}
                    />
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

function ResourceHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/7 bg-white/[0.03] px-2 py-1.5">
      <div className="text-[10px] font-bold text-white/58">{label}</div>
      <div className="mt-0.5 text-[10px] text-white/34">{value}</div>
    </div>
  );
}

type InventoryItem = ReturnType<typeof useGameStore.getState>["inventory"][number];

function InventoryUseRow({
  item,
  subPhase,
  skipNextCrisis,
  expertRoleActive,
  doubleDiceActive,
  onUse,
}: {
  item: InventoryItem;
  subPhase: string;
  skipNextCrisis: boolean;
  expertRoleActive: boolean;
  doubleDiceActive: boolean;
  onUse: () => void;
}) {
  const state = getInventoryUseState(item.shopItem.effect, {
    subPhase,
    skipNextCrisis,
    expertRoleActive,
    doubleDiceActive,
  });

  return (
    <div className="w-full rounded-lg px-2.5 py-2 bg-emerald-400/[0.07] border border-emerald-400/14">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-emerald-100">
            {item.shopItem.name} x{item.quantity}
          </div>
          <div className="mt-0.5 text-[10px] leading-relaxed text-white/38">
            {state.hint}
          </div>
        </div>
        {state.showButton && (
          <button
            onClick={onUse}
            disabled={!state.enabled}
            className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              color: state.enabled ? "#67e8f9" : "rgba(255,255,255,0.35)",
              background: state.enabled ? "rgba(6, 182, 212, 0.10)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${state.enabled ? "rgba(6, 182, 212, 0.22)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <Zap className="w-3 h-3" />
            使用
          </button>
        )}
      </div>
    </div>
  );
}

function getInventoryUseState(
  effect: string,
  state: {
    subPhase: string;
    skipNextCrisis: boolean;
    expertRoleActive: boolean;
    doubleDiceActive: boolean;
  }
) {
  if (effect === "reroll_dice") {
    return {
      showButton: false,
      enabled: false,
      hint: state.subPhase === "crisis" ? "危机骰子区可使用，用于重掷一次。" : "留到危机骰子结果不理想时使用。",
    };
  }
  if (effect === "skip_next_crisis") {
    return {
      showButton: true,
      enabled: !state.skipNextCrisis && state.subPhase !== "crisis",
      hint: state.skipNextCrisis ? "已生效：下一次危机会被跳过。" : "提前使用，跳过下一次危机事件。",
    };
  }
  if (effect === "boost_score") {
    return {
      showButton: true,
      enabled: !state.expertRoleActive && state.subPhase === "task",
      hint: state.expertRoleActive ? "已生效：本关 AI 使用专家视角。" : "在主线任务中使用，让 AI 获得专家视角并提高评分。",
    };
  }
  if (effect === "double_dice") {
    return {
      showButton: true,
      enabled: !state.doubleDiceActive,
      hint: state.doubleDiceActive ? "已生效：下次危机掷两个骰子取更好结果。" : "提前使用，让下一次危机掷骰更稳。",
    };
  }
  return {
    showButton: false,
    enabled: false,
    hint: itemEffectLabel(effect),
  };
}

function itemEffectLabel(effect: string) {
  if (effect === "special") return "特殊道具，会在后续剧情或结算中体现。";
  return "当前道具暂不需要主动使用。";
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
