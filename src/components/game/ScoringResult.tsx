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
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Gauge,
  RotateCcw,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Color map for each scoring dimension */
const dimensionColors: Record<string, string> = {
  角色设定: "#8b5cf6",
  约束清晰: "#ef4444",
  信息完整: "#06b6d4",
  迭代深度: "#10b981",
  逻辑严谨: "#f59e0b",
  目标定义: "#8b5cf6",
  业务理解: "#06b6d4",
  约束表达: "#ef4444",
  追问迭代: "#10b981",
  落地验证: "#f59e0b",
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
  const numericChangeLog = useGameStore((s) => s.numericChangeLog);
  const settlementAfterOption = useGameStore((s) => s.settlementAfterOption);
  const selectedDecisionOption = useGameStore((s) => s.selectedDecisionOption);
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
  const recentImpact = numericChangeLog.slice(-4).reverse();
  const coachComment = parseCoachComment(currentScore.comment || "");
  const settlementMood = selectedDecisionOption
    ? buildSettlementMood(selectedDecisionOption.consequence, latestRevenue?.revenue || 0)
    : "";
  const battleReport = buildBattleReport({
    score: currentScore.weightedTotal,
    revenue: latestRevenue?.revenue || 0,
    impact: recentImpact,
    settlementAfterOption,
    eventType: currentEvent?.type,
  });

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
          <h3 className="text-lg font-bold gradient-text">
            {settlementAfterOption ? "本回合结算" : "AI评估结果"}
          </h3>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <BattleReport
        title={battleReport.title}
        tone={battleReport.tone}
        subtitle={battleReport.subtitle}
        score={currentScore.weightedTotal}
        revenue={latestRevenue?.revenue ?? null}
        cumulative={latestRevenue?.cumulative ?? null}
        impacts={recentImpact}
      />

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
          {settlementAfterOption ? "📌 决策质量得分" : currentEvent?.type === "crisis" ? "⚔️ 危机应对得分" : "🎯 任务得分"}
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
      {settlementAfterOption && selectedDecisionOption && (
        <div className="rounded-xl p-4 border border-violet-400/14 bg-violet-400/[0.045]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-sm font-semibold text-violet-200">本回合结论</span>
          </div>
          {settlementMood && (
            <p className="mb-2 text-[13px] font-bold text-cyan-100 leading-relaxed">
              {settlementMood}
            </p>
          )}
          <p className="text-sm font-bold text-white/84 leading-relaxed">
            你选择了「{selectedDecisionOption.title}」，这会改变下一关的经营前提。
          </p>
          <p className="mt-2 text-xs sm:text-sm text-white/56 leading-relaxed">
            {selectedDecisionOption.consequence}
          </p>
        </div>
      )}

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
              <div className="min-w-0">
                <span className="text-xs text-white/50 font-medium">本回合营收</span>
                <p
                  className="text-xs text-white/30 mt-0.5 leading-relaxed"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {latestRevenue.reason}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 pl-3">
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

      {recentImpact.length > 0 && (
        <div className="rounded-xl p-3 sm:p-4 border border-cyan-400/12 bg-cyan-400/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-200">本关影响</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {recentImpact.map((change) => (
              <div key={change.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 bg-white/[0.035] border border-white/7">
                <span className="text-xs text-white/55 truncate">{formatChangeLabel(change.label)}</span>
                <span className={`text-xs font-bold tabular-nums ${change.delta >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {change.delta > 0 ? "+" : ""}{change.delta.toLocaleString()}
                </span>
              </div>
            ))}
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
            {coachComment ? (
              <div className="pl-8 space-y-2">
                <CoachNoteBlock
                  icon={CheckCircle2}
                  title="优秀"
                  text={coachComment.excellent}
                  color="#6ee7b7"
                  background="rgba(16, 185, 129, 0.08)"
                  border="rgba(16, 185, 129, 0.16)"
                />
                <CoachNoteBlock
                  icon={AlertCircle}
                  title="待改进"
                  text={coachComment.improvement}
                  color="#fcd34d"
                  background="rgba(245, 158, 11, 0.08)"
                  border="rgba(245, 158, 11, 0.16)"
                />
              </div>
            ) : (
              <div className="chat-markdown text-white/70 text-sm leading-relaxed pl-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentScore.comment}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-2.5">
        {/* Check if current task has decision options */}
        {!settlementAfterOption && currentTask?.type === "main" &&
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
            {settlementAfterOption ? "进入下一关" : strings.next_level_button}
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

function parseCoachComment(comment: string) {
  const excellentMatch = comment.match(/优秀[:：]\s*([\s\S]*?)(?=\n\s*待改进[:：]|$)/);
  const improvementMatch = comment.match(/待改进[:：]\s*([\s\S]*)/);
  if (!excellentMatch && !improvementMatch) return null;
  return {
    excellent: excellentMatch?.[1]?.trim() || "本轮已经完成有效表达。",
    improvement: improvementMatch?.[1]?.trim() || "下一轮可以进一步明确约束、步骤和验证方式。",
  };
}

function formatChangeLabel(label: string) {
  const labels: Record<string, string> = {
    "总分": "决策力",
    riskAppetite: "风险偏好",
    dataDependency: "数据意识",
    collaborationTendency: "协作倾向",
    innovationLevel: "创新倾向",
  };
  return labels[label] || label;
}

function buildSettlementMood(consequence: string, revenue: number) {
  const text = consequence || "";
  if (/现金|资金|成本|支出|投入|亏|压力/.test(text) || revenue < 0) {
    return "糟糕，现金流开始绷紧了。你赢得了推进机会，也把后续压力推高了一截。";
  }
  if (/增长|客流|收入|营收|省|回报|赚钱/.test(text) || revenue > 1200) {
    return "太好了，局面开始松动。这个选择让经营结果有了更明显的回响。";
  }
  if (/合作|关系|顾客|社区|供应商|家人/.test(text)) {
    return "事情变得微妙了。关系资源开始发挥作用，但承诺也会跟着变重。";
  }
  if (/风险|试运行|验证|复盘|数据/.test(text)) {
    return "你把不确定性拆小了。接下来，真实反馈会决定这条路能走多远。";
  }
  return "新的局面被打开了。下一关会接住这次选择带来的连锁反应。";
}

function buildBattleReport({
  score,
  revenue,
  impact,
  settlementAfterOption,
  eventType,
}: {
  score: number;
  revenue: number;
  impact: ReturnType<typeof useGameStore.getState>["numericChangeLog"];
  settlementAfterOption: boolean;
  eventType?: string;
}) {
  const hasLoss = revenue < 0 || impact.some((entry) => entry.delta < 0 && entry.type !== "trait");
  if (eventType === "crisis") {
    return {
      tone: "danger" as const,
      title: "危机余波落地",
      subtitle: hasLoss ? "这次冲击留下了真实损失，下一关要先稳住现金流。" : "你扛住了冲击，但后续仍要补上风险预案。",
    };
  }
  if (settlementAfterOption && revenue < 0) {
    return {
      tone: "danger" as const,
      title: "本回合亏损",
      subtitle: "方案可以推进，但经营账没有立刻变好。接下来要验证投入是否值得。",
    };
  }
  if (settlementAfterOption && revenue > 0) {
    return {
      tone: "growth" as const,
      title: "本回合进账",
      subtitle: "这次选择开始转化成经营结果，下一关要接住增长惯性。",
    };
  }
  if (score >= 36) {
    return {
      tone: "growth" as const,
      title: "决策质量优秀",
      subtitle: "你把 AI 外援用成了经营参谋，方案已经有较强执行感。",
    };
  }
  if (score < 24) {
    return {
      tone: "danger" as const,
      title: "决策仍有缺口",
      subtitle: "方案还没有完全咬住问题，继续追问 AI 会更稳。",
    };
  }
  return {
    tone: "stable" as const,
    title: "完成本关判断",
    subtitle: "方案基本可用，但还可以把成本、风险和验证方式说得更硬一些。",
  };
}

function BattleReport({
  title,
  subtitle,
  tone,
  score,
  revenue,
  cumulative,
  impacts,
}: {
  title: string;
  subtitle: string;
  tone: "growth" | "danger" | "stable";
  score: number;
  revenue: number | null;
  cumulative: number | null;
  impacts: ReturnType<typeof useGameStore.getState>["numericChangeLog"];
}) {
  const revenueColor = (revenue || 0) >= 0 ? "#6ee7b7" : "#fca5a5";
  const toneIcon = tone === "growth" ? ArrowUpRight : tone === "danger" ? ArrowDownRight : Gauge;
  const ToneIcon = toneIcon;
  const coinChange = impacts.find((entry) => entry.type === "coins");

  return (
    <div className={`battle-report battle-report-${tone}`}>
      <div className="battle-report-glint" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="battle-report-icon">
                <ToneIcon className="w-4 h-4" />
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">{title}</h4>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-white/58 leading-relaxed">{subtitle}</p>
          </div>
          <span className="battle-report-tag">战报</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <BattleStat
            label="决策力"
            value={`${score}分`}
            color="#fcd34d"
            icon={Trophy}
          />
          <BattleStat
            label="本回合"
            value={revenue === null ? "待结算" : `${revenue >= 0 ? "+" : "-"}¥${Math.abs(revenue).toLocaleString()}`}
            color={revenueColor}
            icon={(revenue || 0) >= 0 ? TrendingUp : TrendingDown}
          />
          <BattleStat
            label="资源"
            value={coinChange ? `${coinChange.delta > 0 ? "+" : ""}${coinChange.delta}币` : cumulative === null ? "稳定" : `¥${cumulative.toLocaleString()}`}
            color={coinChange && coinChange.delta < 0 ? "#fca5a5" : "#67e8f9"}
            icon={Coins}
          />
        </div>
      </div>
    </div>
  );
}

function BattleStat({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="battle-stat">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] sm:text-xs text-white/42">{label}</span>
      </div>
      <div className="mt-1 text-sm sm:text-base font-black tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function CoachNoteBlock({
  icon: Icon,
  title,
  text,
  color,
  background,
  border,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  color: string;
  background: string;
  border: string;
}) {
  return (
    <div className="rounded-xl px-3 py-2.5 border" style={{ background, borderColor: border }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-bold" style={{ color }}>{title}</span>
      </div>
      <div className="chat-markdown text-white/68 text-xs sm:text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
