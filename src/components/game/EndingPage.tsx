"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import type { Ending } from "@/data/scenario";
import {
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Star,
  Crown,
  BookOpen,
  TrendingUp,
  Shield,
  Users,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Target,
  Loader2,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useRef } from "react";

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000, delay: number = 500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return count;
}

// Staggered entrance wrapper
function StaggerItem({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 200 + index * 120);
    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div
      className={`transition-all duration-700 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Circular progress indicator
function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color,
  label,
  icon: Icon,
  delay = 0,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animatedValue / max;
  const offset = circumference - progress * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const duration = 1500;
      const step = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setAnimatedValue(Math.round(eased * value));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-100"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-lg font-bold text-white">{animatedValue}</span>
        </div>
      </div>
      <span className="text-xs text-white/50 font-medium">{label}</span>
    </div>
  );
}

// Glassmorphism card wrapper
function GlassCard({
  children,
  className = "",
  accentColor = "violet",
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: "violet" | "cyan" | "gold" | "emerald";
}) {
  const accentMap = {
    violet: "rgba(139, 92, 246, 0.2)",
    cyan: "rgba(6, 182, 212, 0.2)",
    gold: "rgba(245, 158, 11, 0.2)",
    emerald: "rgba(16, 185, 129, 0.2)",
  };
  const lineMap = {
    violet: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.2), transparent)",
    cyan: "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.2), transparent)",
    gold: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), rgba(139, 92, 246, 0.2), transparent)",
    emerald: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.2), transparent)",
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(26, 16, 64, 0.4))",
        border: `1px solid ${accentMap[accentColor]}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: lineMap[accentColor] }}
      />
      {children}
    </div>
  );
}

// Extract decision style label from the final report
function extractDecisionStyle(report: string | null): { label: string; reason: string } {
  if (!report) return { label: "分析中...", reason: "" };
  const styleSection = report.match(/##\s*🏷️?\s*决策风格标签([\s\S]*?)(?=\n##\s|$)/);
  if (styleSection) {
    const text = styleSection[1].trim();
    const lines = text
      .split("\n")
      .map((line) => cleanReportLine(line))
      .filter(Boolean);
    const labelLine = lines.find((line) => /称号|标签|风格/.test(line)) || lines[0] || "";
    const quotedLabel = labelLine.match(/[「『《“"]([^」』》”"]{2,12})[」』》”"]/);
    const colonLabel = labelLine.match(/(?:称号|标签|风格)\s*[:：]\s*([^，。；\n]{2,12})/);
    const plainLabel = labelLine
      .replace(/^(称号|标签|风格)\s*[:：]\s*/, "")
      .replace(/[，。；：:]/g, "")
      .trim();
    const label = sanitizeStyleLabel(
      quotedLabel?.[1] || colonLabel?.[1] || plainLabel || "综合型"
    );
    const reasonLine = lines.find((line) => /说明|理由|原因/.test(line));
    const reasonSource = reasonLine
      ? reasonLine.replace(/^(说明|理由|原因)\s*[:：]\s*/, "")
      : lines.filter((line) => line !== labelLine).join(" ");
    const reason = cleanReportLine(reasonSource).slice(0, 100);
    return { label, reason };
  }
  return { label: "决策达人", reason: "" };
}

function cleanReportLine(line: string) {
  return line
    .replace(/^[-*]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/#+\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeStyleLabel(label: string) {
  const cleaned = cleanReportLine(label)
    .replace(/^(称号|标签|风格)\s*[:：]\s*/, "")
    .replace(/[「」『』《》“”"]/g, "")
    .replace(/[，。；：:]/g, "")
    .trim();
  return cleaned.slice(0, 8) || "综合型";
}

function buildFinalReportSummary(report: string | null) {
  if (!report) return [];
  const cleaned = sanitizeFinalReport(report);
  const wanted = [
    { key: "journey", title: "决策旅程", match: /决策旅程|决策回顾|回顾/ },
    { key: "mode", title: "决策模式", match: /决策模式|风格标签|决策风格/ },
    { key: "reflection", title: "AI 协作提醒", match: /AI提问|提问反思|AI协作|进阶建议/ },
  ];

  return wanted
    .map((wantedItem) => {
      const section = extractReportSection(cleaned, wantedItem.match);
      if (!section) return null;
      const text = summarizeReportSection(section);
      if (!text) return null;
      return { title: wantedItem.title, text };
    })
    .filter(Boolean) as { title: string; text: string }[];
}

function extractReportSection(report: string, headingPattern: RegExp) {
  const sections = report.split(/(?=^##\s+)/m);
  const section = sections.find((part) => {
    const firstLine = part.split("\n")[0] || "";
    return headingPattern.test(firstLine);
  });
  return section
    ?.replace(/^##\s*[^\n]+\n?/, "")
    .trim();
}

function summarizeReportSection(section: string) {
  const lines = section
    .split("\n")
    .map((line) => cleanReportLine(line))
    .filter(Boolean)
    .filter((line) => !/^好的|这是|以下是/.test(line));
  const conclusion = lines.find((line) => /^结论[:：]/.test(line)) || lines.find((line) => !/^[-•]/.test(line)) || lines[0] || "";
  const bullets = lines
    .filter((line) => line !== conclusion)
    .slice(0, 2);
  return [conclusion.replace(/^结论[:：]\s*/, ""), ...bullets]
    .join("；")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function sanitizeFinalReport(report: string) {
  return report
    .replace(/^好的[，,。\s]*这是.*?报告[。！!]?/m, "")
    .replace(/总分\s*[:：]?\s*([0-9.]+)\s*\/\s*(100|400)/g, "总分：$1")
    .trim();
}

export default function EndingPage() {
  const totalScore = useGameStore((s) => s.totalScore);
  const taskScores = useGameStore((s) => s.taskScores);
  const selectedRole = useGameStore((s) => s.selectedRole);
  const decisionTraits = useGameStore((s) => s.decisionTraits);
  const resetGame = useGameStore((s) => s.resetGame);
  const finalReport = useGameStore((s) => s.finalReport);
  const isFinalReportLoading = useGameStore((s) => s.isFinalReportLoading);
  const generateFinalReport = useGameStore((s) => s.generateFinalReport);
  const revenue = useGameStore((s) => s.revenue);
  const revenueHistory = useGameStore((s) => s.revenueHistory);
  const strings = scenarioData.strings;

  const animatedScore = useAnimatedCounter(totalScore, 2500, 800);
  const hasGeneratedReport = useRef(false);

  // Auto-generate final report on mount
  useEffect(() => {
    if (!finalReport && !isFinalReportLoading && !hasGeneratedReport.current) {
      hasGeneratedReport.current = true;
      generateFinalReport();
    }
  }, [finalReport, isFinalReportLoading, generateFinalReport]);

  // Find matching ending
  const ending: Ending =
    scenarioData.endings.find(
      (e) => totalScore >= e.minScore && totalScore <= e.maxScore
    ) || scenarioData.endings[scenarioData.endings.length - 1];

  // Calculate average scores for radar chart
  const avgScores: Record<string, number> = {};
  if (taskScores.length > 0) {
    const dimensions = Object.keys(taskScores[0].scores);
    dimensions.forEach((dim) => {
      const sum = taskScores.reduce((s, ts) => s + (ts.scores[dim] || 0), 0);
      avgScores[dim] = Math.round((sum / taskScores.length) * 10) / 10;
    });
  }

  const radarData = Object.entries(avgScores).map(([name, value]) => ({
    dimension: name,
    score: value,
    fullMark: 10,
  }));

  // Decision style extraction
  const { label: styleLabel, reason: styleReason } = extractDecisionStyle(finalReport);

  // Trait config
  const traitConfig = [
    { key: "riskAppetite" as const, label: "风险偏好", color: "#f59e0b", icon: TrendingUp },
    { key: "dataDependency" as const, label: "数据依赖", color: "#06b6d4", icon: Target },
    { key: "collaborationTendency" as const, label: "协作倾向", color: "#10b981", icon: Users },
    { key: "innovationLevel" as const, label: "创新水平", color: "#8b5cf6", icon: Lightbulb },
  ];

  // Revenue analytics
  const isProfitable = revenue >= 0;
  const totalRevenueIncome = revenueHistory.filter(r => r.revenue > 0).reduce((sum, r) => sum + r.revenue, 0);
  const totalRevenueLoss = revenueHistory.filter(r => r.revenue < 0).reduce((sum, r) => sum + Math.abs(r.revenue), 0);
  const finalReportSummary = buildFinalReportSummary(finalReport);

  return (
    <div className="min-h-screen game-bg relative overflow-y-auto custom-scrollbar">
      {/* Background decorative particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/20 rounded-full animate-float" />
        <div className="absolute top-40 right-16 w-1.5 h-1.5 bg-violet-400/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-cyan-400/20 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-60 left-1/3 w-2.5 h-2.5 bg-amber-300/10 rounded-full animate-sparkle" />
        <div className="absolute bottom-48 right-1/4 w-2 h-2 bg-violet-300/10 rounded-full animate-sparkle-delay" />
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-cyan-300/5 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative z-10 space-y-8">
        {/* ===== Hero Section ===== */}
        <StaggerItem index={0}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">AI 决策力分析</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black gradient-text mb-3">
              AI决策力分析报告
            </h1>
            <p className="text-white/40 text-sm">
              {selectedRole?.name || "未知角色"} · 决策旅程复盘
            </p>
          </div>
        </StaggerItem>

        {/* ===== Score Hero Card ===== */}
        <StaggerItem index={1}>
          <GlassCard accentColor="gold" className="p-6 sm:p-8">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="relative text-center">
              <div className="text-4xl mb-3">{ending.title.split(" ")[0]}</div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-5">
                {ending.title.split(" ").slice(1).join(" ")}
              </h3>

              {/* Animated Score Counter */}
              <div className="flex items-center justify-center gap-3 mb-5 animate-score-reveal">
                <Crown className="w-8 h-8 text-amber-400" />
                <span className="text-5xl sm:text-6xl font-black gradient-text-gold tabular-nums">
                  {animatedScore}
                </span>
                <span className="text-white/30 text-sm mt-auto mb-2">分</span>
              </div>

              <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
                {ending.description}
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400/40 absolute top-3 right-4 animate-sparkle" />
            <Star className="w-3 h-3 text-violet-400/30 absolute bottom-4 left-3 animate-sparkle-delay" />
          </GlassCard>
        </StaggerItem>

        {/* ===== Revenue Summary Card ===== */}
        <StaggerItem index={2}>
          <GlassCard accentColor={isProfitable ? "emerald" : "gold"} className="p-5 sm:p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className={`w-5 h-5 ${isProfitable ? "text-emerald-400" : "text-red-400"}`} />
              <h4 className="text-sm font-bold text-white">经营营收模拟</h4>
            </div>
            <div className="text-center mb-5">
              <div className="text-xs text-white/40 mb-2 font-medium">
                {isProfitable ? "📈 模拟经营盈利" : "📉 模拟经营亏损"}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-4xl sm:text-5xl font-black tabular-nums ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
                  {isProfitable ? "+" : ""}¥{revenue.toLocaleString()}
                </span>
              </div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                isProfitable
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
              }`}>
                {isProfitable ? "盈 利" : "亏 损"}
              </span>
            </div>
            {/* Revenue breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 text-center"
                style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.1)" }}
              >
                <div className="text-xs text-white/40 mb-1">经营收入</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">¥{totalRevenueIncome.toLocaleString()}</div>
              </div>
              <div className="rounded-xl p-3 text-center"
                style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.1)" }}
              >
                <div className="text-xs text-white/40 mb-1">危机损失</div>
                <div className="text-lg font-bold text-red-400 tabular-nums">¥{totalRevenueLoss.toLocaleString()}</div>
              </div>
            </div>
            {/* Revenue timeline mini-chart */}
            {revenueHistory.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-white/30 mb-2 font-medium">营收走势</div>
                <div className="flex items-end gap-1 h-16">
                  {revenueHistory.map((entry, i) => {
                    const maxAbs = Math.max(...revenueHistory.map(r => Math.abs(r.revenue)), 1);
                    const heightPct = Math.max(Math.abs(entry.revenue) / maxAbs * 100, 8);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${heightPct}%`,
                            background: entry.revenue >= 0
                              ? "linear-gradient(180deg, #10b981, #10b98160)"
                              : "linear-gradient(180deg, #ef4444, #ef444460)",
                            minHeight: "4px",
                          }}
                          title={`${entry.title}: ¥${entry.revenue.toLocaleString()}`}
                        />
                        <span className="text-[8px] text-white/20 leading-none">{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>
        </StaggerItem>

        {/* ===== Decision Radar Chart ===== */}
        {radarData.length > 0 && (
          <StaggerItem index={3}>
            <GlassCard accentColor="violet" className="p-5">
              <h4 className="text-sm font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-violet-400" />
                综合能力雷达
              </h4>
              <div className="h-56">
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
                      name="平均分"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </StaggerItem>
        )}

        {/* ===== Decision Style Analysis - 4 Trait Circles ===== */}
        <StaggerItem index={4}>
          <GlassCard accentColor="cyan" className="p-5 sm:p-6">
            <h4 className="text-sm font-bold text-white mb-5 text-center flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              决策风格分析
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {traitConfig.map((t, i) => (
                <CircularProgress
                  key={t.key}
                  value={decisionTraits[t.key]}
                  color={t.color}
                  label={t.label}
                  icon={t.icon}
                  delay={800 + i * 200}
                />
              ))}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* ===== Decision Style Label ===== */}
        <StaggerItem index={5}>
          <GlassCard accentColor="gold" className="p-5 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 pulse-glow-gold"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.1))",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <span className="text-xs text-amber-400/70 font-semibold tracking-wider uppercase mb-1">
                你的决策风格
              </span>
              <h3 className="text-2xl sm:text-3xl font-black gradient-text-gold mb-2">
                {styleLabel}
              </h3>
              {styleReason && (
                <p className="text-white/40 text-xs leading-relaxed max-w-sm">
                  {styleReason}
                </p>
              )}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* ===== Task-by-Task Timeline ===== */}
        {taskScores.length > 0 && (
          <StaggerItem index={6}>
            <GlassCard accentColor="violet" className="p-5 sm:p-6">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-violet-400" />
                决策时间线
              </h4>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div
                  className="absolute left-2 top-2 bottom-2 w-[2px]"
                  style={{ background: "linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.2), transparent)" }}
                />
                <div className="space-y-4">
                  {taskScores.map((ts, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      {/* Dot on timeline */}
                      <div
                        className="absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center z-10"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                          boxShadow: "0 0 8px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        <span className="text-[8px] font-bold text-white">{i + 1}</span>
                      </div>
                      {/* Card */}
                      <div
                        className="flex-1 rounded-xl p-3"
                        style={{
                          background: i % 2 === 0
                            ? "rgba(139, 92, 246, 0.04)"
                            : "rgba(6, 182, 212, 0.04)",
                          border: "1px solid rgba(139, 92, 246, 0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white/80 truncate mr-2">
                            {ts.title}
                          </span>
                          <span className="text-sm font-bold gradient-text-gold shrink-0">
                            {ts.weightedTotal}分
                          </span>
                        </div>
                        {ts.comment && (
                          <p className="text-xs text-white/35 line-clamp-2">{ts.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        )}

        {/* ===== Strengths & Weaknesses ===== */}
        <StaggerItem index={7}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <GlassCard accentColor="emerald" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-emerald-400">优势</span>
              </div>
              <div className="space-y-2">
                {taskScores
                  .sort((a, b) => b.weightedTotal - a.weightedTotal)
                  .slice(0, 3)
                  .map((ts, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-white/60 py-1"
                    >
                      <Star className="w-3 h-3 text-emerald-400/60 shrink-0" />
                      <span className="truncate">{ts.title}</span>
                      <span className="ml-auto text-emerald-400/80 font-semibold shrink-0">
                        {ts.weightedTotal}
                      </span>
                    </div>
                  ))}
              </div>
            </GlassCard>

            {/* Weaknesses */}
            <GlassCard accentColor="gold" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-amber-400">待提升</span>
              </div>
              <div className="space-y-2">
                {taskScores
                  .sort((a, b) => a.weightedTotal - b.weightedTotal)
                  .slice(0, 3)
                  .map((ts, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-white/60 py-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400/60 shrink-0" />
                      <span className="truncate">{ts.title}</span>
                      <span className="ml-auto text-amber-400/80 font-semibold shrink-0">
                        {ts.weightedTotal}
                      </span>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        </StaggerItem>

        {/* ===== AI Review Summary ===== */}
        <StaggerItem index={8}>
          <GlassCard accentColor="violet" className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-sm font-bold text-violet-300">AI 复盘摘要</span>
              {isFinalReportLoading && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-xs text-violet-300/70">生成中...</span>
                </div>
              )}
            </div>
            {isFinalReportLoading && !finalReport ? (
              <div className="flex flex-col items-center py-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">AI 正在撰写你的专属复盘报告...</p>
                <p className="text-xs text-white/30">这可能需要 10-30 秒</p>
                <div className="mt-4 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
                </div>
              </div>
            ) : finalReportSummary.length > 0 ? (
              <div className="space-y-2">
                {finalReportSummary.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(139, 92, 246, 0.06)",
                      border: "1px solid rgba(139, 92, 246, 0.12)",
                    }}
                  >
                    <div className="text-xs font-bold text-violet-200">{item.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-white/62">{item.text}</div>
                  </div>
                ))}
              </div>
            ) : finalReport ? (
              <div className="chat-markdown text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizeFinalReport(finalReport)}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8 text-white/30 text-sm">
                报告生成失败，请重试
              </div>
            )}
          </GlassCard>
        </StaggerItem>

        {/* ===== Upgrade Advice Card ===== */}
        <StaggerItem index={9}>
          <div className="relative rounded-2xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-violet-500/5 to-cyan-500/5" />
            <div className="absolute inset-0 border border-amber-500/10 rounded-2xl" />
            <div className="absolute top-2 right-3 text-amber-500/8 text-3xl font-serif">✦</div>
            <div className="absolute bottom-2 left-3 text-violet-500/8 text-2xl font-serif">✧</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-amber-400">进阶建议</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed pl-9">
                {ending.upgradeAdvice}
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* ===== Action Buttons ===== */}
        <StaggerItem index={10}>
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              onClick={resetGame}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              {strings.play_again}
            </button>
            <button
              onClick={resetGame}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white/70 border border-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-white/20 flex items-center justify-center gap-2"
              style={{
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <Home className="w-4 h-4" />
              {strings.back_home}
            </button>
          </div>
        </StaggerItem>
      </div>
    </div>
  );
}
