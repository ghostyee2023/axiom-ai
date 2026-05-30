"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, Coins, Star, Sparkles, Trophy, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Color map for each scoring dimension */
const dimensionColors: Record<string, string> = {
  角色设定: "#8b5cf6",
  约束清晰: "#ef4444",
  信息完整: "#06b6d4",
  迭代深度: "#10b981",
  逻辑严谨: "#f59e0b",
};

function getDimColor(name: string): string {
  return dimensionColors[name] || "#8b5cf6";
}

export default function ScoringResult() {
  const currentScore = useGameStore((s) => s.currentScore);
  const continueAfterScoring = useGameStore((s) => s.continueAfterScoring);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const currentTask = useGameStore((s) => s.currentTask);
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const rerollCount = useGameStore((s) => s.rerollCount);
  const rerollTask = useGameStore((s) => s.rerollTask);
  const revenueHistory = useGameStore((s) => s.revenueHistory);
  const strings = scenarioData.strings;

  if (!currentScore) return null;

  // Build radar chart data
  const radarData = Object.entries(currentScore.scores).map(([name, value]) => ({
    dimension: name,
    score: value,
    fullMark: 10,
  }));

  // Check if reroll is available (only for main tasks)
  const isMainTask = currentTask?.type === "main";
  const rerollCost = isMainTask
    ? (currentTask as { rerollCost: number }).rerollCost * (rerollCount + 1)
    : Infinity;
  const canReroll = isMainTask && decisionCoins >= rerollCost;

  // Get latest revenue entry for this scoring
  const latestRevenue = revenueHistory.length > 0 ? revenueHistory[revenueHistory.length - 1] : null;

  return (
    <div className="game-card rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-5 animate-fade-in-up">
      {/* Header with celebratory elements */}
      <div className="text-center relative">
        {/* Decorative sparkles */}
        <Sparkles className="w-4 h-4 text-amber-400/60 absolute -top-1 -left-1 animate-sparkle" />
        <Star className="w-3 h-3 text-violet-400/50 absolute -top-2 right-4 animate-sparkle-delay" />
        <Star className="w-3 h-3 text-cyan-400/40 absolute top-2 -right-2 animate-sparkle-delay2" />

        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold gradient-text">评分结果</h3>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Radar Chart - Violet/Purple theme */}
      <div className="w-full h-44 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(139, 92, 246, 0.12)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: "#64748b", fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="评分"
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Score Bars */}
      <div className="space-y-2.5">
        {Object.entries(currentScore.scores).map(([name, value], index) => {
          const color = getDimColor(name);
          const pct = (value / 10) * 100;
          return (
            <div
              key={name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{name}</span>
                <span
                  className="text-sm font-bold animate-score-reveal"
                  style={{
                    color,
                    animationDelay: `${0.3 + index * 0.1}s`,
                  }}
                >
                  {value}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full score-bar-animate"
                  style={{
                    ["--target-width" as string]: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Score - Large and Gold */}
      <div className="text-center py-2 sm:py-3 relative">
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="text-xs text-white/50 mb-2 font-medium tracking-wider uppercase">
          {currentEvent?.type === "crisis" ? "⚔️ 危机应对得分" : "🎯 任务得分"}
        </div>
        <div className="animate-score-reveal" style={{ animationDelay: "0.5s" }}>
          <span className="text-3xl sm:text-4xl font-black gradient-text-gold">
            {currentScore.weightedTotal}
          </span>
          <span className="text-sm font-normal text-white/40 ml-1.5">分</span>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>

      {/* Revenue Result for this task */}
      {latestRevenue && (
        <div className="relative rounded-xl p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-amber-500/3 to-cyan-500/5" />
          <div className="absolute inset-0 border border-emerald-500/10 rounded-xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: latestRevenue.revenue >= 0
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                }}
              >
                <TrendingUp className={`w-4 h-4 ${latestRevenue.revenue >= 0 ? "text-emerald-400" : "text-red-400"}`} />
              </div>
              <div>
                <span className="text-xs text-white/50 font-medium">本回合营收</span>
                <p className="text-xs text-white/30 mt-0.5">{latestRevenue.reason}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black ${latestRevenue.revenue >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {latestRevenue.revenue >= 0 ? "+" : ""}¥{latestRevenue.revenue.toLocaleString()}
              </span>
              <p className="text-xs text-white/30 mt-0.5">
                累计 ¥{latestRevenue.cumulative.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mentor's Note Card */}
      {currentScore.comment && (
        <div className="relative rounded-xl p-4 overflow-hidden">
          {/* Card background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-violet-500/5 to-cyan-500/5" />
          <div className="absolute inset-0 border border-amber-500/10 rounded-xl" />

          {/* Decorative corner */}
          <div className="absolute top-2 right-2 text-amber-500/10 text-2xl font-serif">✦</div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-400">教练评语</span>
            </div>
            <div className="chat-markdown text-white/70 text-sm leading-relaxed pl-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentScore.comment}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-2.5">
        {/* Check if current task has decision options */}
        {currentTask?.type === "main" &&
        (currentTask as Record<string, unknown>).decisionOptions ? (
          <button
            onClick={continueAfterScoring}
            className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            选择你的方案
          </button>
        ) : (
          <button
            onClick={continueAfterScoring}
            className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            }}
          >
            {strings.next_level_button}
          </button>
        )}

        {isMainTask && (
          <button
            onClick={rerollTask}
            disabled={!canReroll}
            className="shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 border border-amber-500/30"
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))",
              color: "#f59e0b",
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {rerollCost}
          </button>
        )}
      </div>

      {/* Reroll hint */}
      {isMainTask && !canReroll && (
        <p className="text-xs text-white/30 text-center">
          决策币不足，无法重做（需要 {rerollCost} 币）
        </p>
      )}
    </div>
  );
}
