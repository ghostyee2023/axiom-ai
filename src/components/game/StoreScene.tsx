"use client";

import { useGameStore } from "@/store/gameStore";
import { Banknote, Coins, Gauge, Package, ShieldAlert, Sparkles, Star, TrendingUp, UsersRound, Zap } from "lucide-react";

type StoreMood = "growth" | "pressure" | "stable";

export default function StoreScene() {
  const revenue = useGameStore((s) => s.revenue);
  const revenueHistory = useGameStore((s) => s.revenueHistory);
  const totalScore = useGameStore((s) => s.totalScore);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const subPhase = useGameStore((s) => s.subPhase);
  const currentTask = useGameStore((s) => s.currentTask);
  const numericChangeLog = useGameStore((s) => s.numericChangeLog);

  const latestRevenue = revenueHistory.at(-1)?.revenue || 0;
  const previousRevenue = revenueHistory.length > 1 ? revenueHistory[revenueHistory.length - 2].revenue : 0;
  const swing = latestRevenue - previousRevenue;
  const mood: StoreMood = latestRevenue < 0 || currentEvent?.type === "crisis"
    ? "pressure"
    : latestRevenue > 1200 || totalScore >= 28
      ? "growth"
      : "stable";
  const metrics = buildStoreMetrics(revenue, latestRevenue, totalScore, mood);
  const eventChip = buildEventChip(subPhase, currentEvent?.type, swing);
  const tickerItems = buildTickerItems(numericChangeLog);

  return (
    <section className="store-scene rounded-2xl overflow-hidden border border-white/10">
      <div className={`store-sky store-sky-${mood}`} />
      <div className="relative z-10 grid grid-cols-[78px_1fr] sm:grid-cols-[104px_1fr] gap-2.5 sm:gap-3 p-2.5 sm:p-3">
        <div className="storefront store-front-compact" aria-hidden="true">
          <div className="storefront-sign">小店</div>
          <div className="storefront-awning">
            <span />
            <span />
            <span />
          </div>
          <div className="storefront-body">
            <div className="storefront-window">
              <div className="shelf-line" />
              <div className="shelf-items">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="storefront-door" />
          </div>
          <div className={`store-crowd store-crowd-${mood}`}>
            <b />
            <b />
            <b />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/45">
                <Sparkles className="w-3 h-3 text-cyan-300/70" />
                小店经营状态
              </div>
              <h2 className="mt-0.5 text-sm sm:text-base font-bold text-white truncate">
                {getSceneHeadline(mood, subPhase, currentTask?.title)}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className={`store-event-chip store-event-${eventChip.tone}`}>
                <eventChip.icon className="w-3 h-3" />
                {eventChip.label}
              </div>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="store-metric">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <metric.icon className="w-3.5 h-3.5 shrink-0" style={{ color: metric.color }} />
                    <span className="text-[11px] text-white/52 truncate">{metric.label}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: metric.color }}>
                    {metric.value}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full store-meter-fill"
                    style={{
                      width: `${metric.percent}%`,
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {tickerItems.length > 0 && (
            <div className="store-ticker mt-2 flex items-center gap-2 overflow-hidden rounded-xl px-2.5 py-1.5">
              <div className="shrink-0 text-[10px] font-black text-white/42">最近</div>
              <div className="flex min-w-0 gap-1.5 overflow-x-auto custom-scrollbar">
                {tickerItems.slice(0, 2).map((item) => (
                  <div key={item.id} className="store-ticker-chip">
                    <item.icon className="w-3 h-3" style={{ color: item.color }} />
                    <span className="truncate">{item.label}</span>
                    <b style={{ color: item.color }}>{item.value}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function buildStoreMetrics(revenue: number, latestRevenue: number, totalScore: number, mood: StoreMood) {
  const cashPercent = clamp(44 + revenue / 900 + latestRevenue / 120);
  const trafficPercent = clamp(mood === "growth" ? 72 : mood === "pressure" ? 36 : 54);
  const reputationPercent = clamp(42 + totalScore * 1.25);
  const riskPercent = clamp(mood === "pressure" ? 76 : mood === "growth" ? 32 : 48);

  return [
    {
      label: "现金流",
      value: revenue >= 0 ? `¥${Math.round(revenue).toLocaleString()}` : `-¥${Math.abs(Math.round(revenue)).toLocaleString()}`,
      percent: cashPercent,
      color: revenue >= 0 ? "#6ee7b7" : "#fca5a5",
      icon: Banknote,
    },
    {
      label: "客流",
      value: mood === "growth" ? "上升" : mood === "pressure" ? "回落" : "平稳",
      percent: trafficPercent,
      color: "#67e8f9",
      icon: UsersRound,
    },
    {
      label: "口碑",
      value: totalScore >= 28 ? "变好" : totalScore >= 12 ? "积累中" : "待建立",
      percent: reputationPercent,
      color: "#fcd34d",
      icon: Star,
    },
    {
      label: "风险",
      value: mood === "pressure" ? "偏高" : mood === "growth" ? "可控" : "中等",
      percent: riskPercent,
      color: mood === "pressure" ? "#fb7185" : "#a78bfa",
      icon: mood === "pressure" ? ShieldAlert : Package,
    },
  ];
}

function getSceneHeadline(mood: StoreMood, subPhase: string, title?: string) {
  if (subPhase === "crisis") return "突发事件压到柜台前，先稳住局面";
  if (subPhase === "opportunity") return "一个机会敲门了，接不接要算清楚";
  if (mood === "growth") return "店里开始有起色，下一步要把增长接住";
  if (mood === "pressure") return "现金流和风险同时冒头，不能再凭感觉";
  return title ? `当前任务：${title}` : "小店还在试探市场，下一步很关键";
}

function buildEventChip(subPhase: string, eventType?: string, swing = 0) {
  if (subPhase === "crisis" || eventType === "crisis") {
    return { label: "风险逼近", tone: "danger" as const, icon: ShieldAlert };
  }
  if (subPhase === "opportunity" || eventType === "opportunity") {
    return { label: "机会出现", tone: "growth" as const, icon: Sparkles };
  }
  if (swing > 800) return { label: "趋势向上", tone: "growth" as const, icon: Zap };
  if (swing < -800) return { label: "趋势下滑", tone: "danger" as const, icon: ShieldAlert };
  return { label: "经营中", tone: "stable" as const, icon: Package };
}

function buildTickerItems(log: ReturnType<typeof useGameStore.getState>["numericChangeLog"]) {
  return log.slice(-3).reverse().map((entry) => {
    const isPositive = entry.delta >= 0;
    const color = isPositive ? "#6ee7b7" : "#fca5a5";
    const icon = entry.type === "coins"
      ? Coins
      : entry.type === "revenue"
        ? TrendingUp
        : entry.type === "score"
          ? Star
          : Gauge;
    return {
      id: entry.id,
      icon,
      color,
      label: formatTickerLabel(entry.label),
      value: `${entry.delta > 0 ? "+" : ""}${entry.delta.toLocaleString()}`,
    };
  });
}

function formatTickerLabel(label: string) {
  const labels: Record<string, string> = {
    "总分": "决策力",
    "模拟营收": "营收",
    "决策币": "决策币",
    riskAppetite: "风险偏好",
    dataDependency: "数据意识",
    collaborationTendency: "协作倾向",
    innovationLevel: "创新倾向",
  };
  return labels[label] || label;
}

function clamp(value: number) {
  return Math.max(8, Math.min(100, Math.round(value)));
}
