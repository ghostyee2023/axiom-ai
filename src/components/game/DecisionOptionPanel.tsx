"use client";

import { useGameStore } from "@/store/gameStore";
import { type DecisionOption } from "@/data/scenario";
import ChatPanel from "./ChatPanel";
import {
  Sparkles,
  Check,
  Loader2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Coins,
  Star,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  X,
  Layers3,
  Hourglass,
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
  const generateDecisionOptions = useGameStore((s) => s.generateDecisionOptions);
  const decisionOptionsNotice = useGameStore((s) => s.decisionOptionsNotice);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const decisionOptionsGeneratedAssistantCount = useGameStore((s) => s.decisionOptionsGeneratedAssistantCount);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showChatReview, setShowChatReview] = useState(false);

  if (!decisionOptionPhase) return null;

  // Use AI-generated options if available, otherwise fall back to hardcoded
  const hardcodedOptions: DecisionOption[] =
    currentTask?.type === "main"
      ? ((currentTask as Record<string, unknown>).decisionOptions as DecisionOption[] | undefined) || []
      : [];

  const options: DecisionOption[] = isDecisionOptionsLoading
    ? []
    : aiDecisionOptions || hardcodedOptions;

  if (options.length === 0 && !isDecisionOptionsLoading && !decisionOptionsNotice) return null;

  const isOptionSelected = selectedDecisionOption !== null;
  const assistantReplyCount = chatMessages.filter((m) => m.role === "assistant").length;
  const hasNewAssistantOutput = assistantReplyCount > decisionOptionsGeneratedAssistantCount;
  const decisionContext = buildDecisionContext(currentTask);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in-up"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(26, 16, 64, 0.92))",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-none overflow-y-auto custom-scrollbar">
        <div className="text-center mb-3 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5 sm:mb-2">
            <div className="hidden sm:block w-32" />
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
              <h2 className="text-base sm:text-xl font-bold gradient-text">选择行动方案</h2>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
            </div>
            <button
              onClick={() => setShowChatReview(true)}
              className="mx-auto sm:mx-0 w-fit inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-100 bg-cyan-400/10 border border-cyan-300/18 hover:bg-cyan-400/16 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              回看 AI 对话
            </button>
          </div>
          <div className="mx-auto max-w-2xl space-y-2">
            <p className="text-xs sm:text-sm text-white/50">
              {isDecisionOptionsLoading
                ? "AI 外援正在把对话整理成行动卡。"
                : decisionOptionsNotice
                  ? "还没有形成可执行行动卡。"
                  : decisionContext
                    ? `为了解决「${decisionContext}」，你需要选择一张真正执行的行动卡。`
                    : "AI 外援已把对话整理成行动卡。现在，由你决定真正执行哪一张。"}
            </p>
          </div>
          {isDecisionOptionsLoading && (
            <ActionCardLoading />
          )}
        </div>

        {decisionOptionsNotice && !isDecisionOptionsLoading && (
          <div
            className="mx-auto mb-4 max-w-md rounded-2xl px-4 py-4 text-left"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.18)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-amber-100/90">
                  您还没有得出具体的行动方案
                </div>
                <p className="mt-1 text-xs leading-relaxed text-white/52">
                  {decisionOptionsNotice}
                </p>
                <button
                  onClick={() => setShowChatReview(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-100 bg-cyan-400/10 border border-cyan-300/18 hover:bg-cyan-400/16 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  继续和 AI 对话
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        {!isDecisionOptionsLoading && options.length > 0 && (
        <>
        <div className="action-deck-status mb-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="action-deck-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-black text-white/84">
                {decisionContext ? `处理：${decisionContext}` : "选择本轮行动"}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-cyan-100 bg-cyan-400/10 border border-cyan-300/16">
            <Layers3 className="w-3.5 h-3.5" />
            {isOptionSelected ? "已锁定" : `选 1 / ${options.length}`}
          </div>
        </div>
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory custom-scrollbar pb-2 sm:pb-0">
          {options.map((option, index) => {
            const accent = cardAccents[index % cardAccents.length];
            const isSelected = selectedDecisionOption?.id === option.id;
            const isOtherSelected = isOptionSelected && !isSelected;
            const structuredOption = structureOptionDescription(option.description);

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
                className={`action-card action-card-${index % 3} relative rounded-2xl overflow-hidden text-left transition-all duration-500 group animate-fade-in-up min-w-[86vw] sm:min-w-0 snap-center`}
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
                <div className="card-foil" />
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
                  <div className="mb-2 flex items-center gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-black tracking-normal"
                      style={{
                        background: accent.badge,
                        border: `1px solid ${accent.badgeBorder}`,
                        color: accent.text,
                      }}
                    >
                      行动卡
                    </span>
                    <span className="text-[10px] font-semibold text-white/32">
                      {getCardArchetype(option)}
                    </span>
                  </div>

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

                  <div className="mb-3 sm:mb-4 space-y-2">
                    <OptionFact label="具体动作" value={structuredOption.action} />
                    {structuredOption.condition && (
                      <OptionFact label="适用条件" value={structuredOption.condition} muted />
                    )}
                  </div>

                  {!isSelected && (
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      <ValuePill label="风险" value={getRiskLevel(option)} />
                      <ValuePill label="成本" value={getCostLevel(option)} />
                      <ValuePill label="难度" value={getDifficultyLevel(option)} />
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
                      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />
                      <div
                        className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center animate-bounce-in"
                        style={{
                          background: `linear-gradient(135deg, ${accent.glow}, ${accent.badge})`,
                          border: `2px solid ${accent.borderHover}`,
                        }}
                      >
                        <Check className="w-8 h-8" style={{ color: accent.text }} />
                        <span className="mt-0.5 text-[10px] font-bold" style={{ color: accent.text }}>
                          已出牌
                        </span>
                      </div>
                    </div>
                  )}

                  {isSelected && consequenceRevealed && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white/62 bg-white/[0.045] border border-white/8">
                      <Hourglass className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                      经营结果正在结算...
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        </>
        )}

      </div>

      {showChatReview && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(10, 14, 26, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowChatReview(false)}
        >
          <div
            className="w-full sm:max-w-2xl h-[82vh] sm:h-[78vh] rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 14, 26, 0.98))",
              border: "1px solid rgba(6, 182, 212, 0.18)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold text-white">AI 外援对话</span>
              </div>
              <button
                onClick={() => setShowChatReview(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] p-2 flex flex-col gap-2 min-h-0">
              <div className="flex-1 min-h-0">
                <ChatPanel hideHeader />
              </div>
              {!selectedDecisionOption && hasNewAssistantOutput && (
                <button
                  onClick={() => {
                    setShowChatReview(false);
                    generateDecisionOptions();
                  }}
                  disabled={isDecisionOptionsLoading}
                  className="shrink-0 w-full rounded-xl px-4 py-3 text-sm font-bold text-white btn-gradient-violet disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isDecisionOptionsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  重新生成行动卡
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ValuePill({ label, value }: { label: string; value: string }) {
  const tone = getLevelTone(value);
  return (
    <div
      className="rounded-lg px-2 py-1 border"
      style={{
        background: tone.bg,
        borderColor: tone.border,
      }}
    >
      <div className="text-[9px]" style={{ color: tone.muted }}>{label}</div>
      <div className="mt-0.5 text-[11px] font-semibold" style={{ color: tone.text }}>{value}</div>
    </div>
  );
}

function OptionFact({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2">
      <div className="mb-1 text-[10px] font-bold text-white/34">{label}</div>
      <p className={`text-xs sm:text-sm leading-relaxed ${muted ? "text-white/52" : "text-white/76"}`}>
        {value}
      </p>
    </div>
  );
}

function ActionCardLoading() {
  return (
    <div className="mx-auto mt-5 max-w-md rounded-2xl px-4 py-5 action-card-loading">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
        <span className="text-sm font-bold text-violet-100/86">正在抽取行动卡...</span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
        <div className="action-card-back action-card-back-1" />
        <div className="action-card-back action-card-back-2" />
        <div className="action-card-back action-card-back-3" />
      </div>
      <p className="mt-4 text-xs text-white/42">
        AI 外援会把对话压缩成可执行的经营选择。
      </p>
    </div>
  );
}

function buildDecisionContext(currentTask: ReturnType<typeof useGameStore.getState>["currentTask"]) {
  if (!currentTask || currentTask.type !== "main") return "";
  const record = currentTask as Record<string, unknown>;
  const challenge = record.challenge ? String(record.challenge) : currentTask.task || currentTask.description;
  return challenge
    .replace(/\s+/g, " ")
    .replace(/[。；;]\s*$/, "")
    .slice(0, 88);
}

function structureOptionDescription(description: string) {
  const sentences = description
    .split(/(?<=[。！？；])|(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length <= 1) {
    return { action: description, condition: "" };
  }
  return {
    action: sentences[0],
    condition: sentences.slice(1).join(""),
  };
}

function getLevelTone(value: string) {
  if (value === "高") {
    return {
      bg: "rgba(239, 68, 68, 0.10)",
      border: "rgba(239, 68, 68, 0.24)",
      text: "#fca5a5",
      muted: "rgba(252, 165, 165, 0.62)",
    };
  }
  if (value === "中") {
    return {
      bg: "rgba(245, 158, 11, 0.10)",
      border: "rgba(245, 158, 11, 0.24)",
      text: "#fcd34d",
      muted: "rgba(252, 211, 77, 0.62)",
    };
  }
  return {
    bg: "rgba(16, 185, 129, 0.10)",
    border: "rgba(16, 185, 129, 0.24)",
    text: "#6ee7b7",
    muted: "rgba(110, 231, 183, 0.62)",
  };
}

function getRiskLevel(option: DecisionOption) {
  const risk = Math.abs(option.scoreModifier) + (option.revenueModifier < 0 ? 1 : 0) + (option.coinModifier < 0 ? 1 : 0);
  if (risk >= 4) return "高";
  if (risk >= 2) return "中";
  return "低";
}

function getCostLevel(option: DecisionOption) {
  const cost = Math.abs(option.revenueModifier) + Math.max(0, -option.coinModifier) * 1000;
  if (cost >= 5000) return "高";
  if (cost >= 1000) return "中";
  return "低";
}

function getDifficultyLevel(option: DecisionOption) {
  const text = `${option.title}${option.description}`;
  if (/系统|扩张|全面|切换|合作|外包|改造|上线/.test(text)) return "高";
  if (/优化|混合|调整|测试|试点|分阶段/.test(text)) return "中";
  return "低";
}

function getCardArchetype(option: DecisionOption) {
  const text = `${option.title}${option.description}`;
  if (/合同|合作|谈判|供应商/.test(text)) return "谈判牌";
  if (/营销|客流|社群|活动|推广|口碑/.test(text)) return "增长牌";
  if (/成本|现金|资金|预算|亏损/.test(text)) return "财务牌";
  if (/风险|验证|试点|复盘|数据/.test(text)) return "验证牌";
  return "经营牌";
}
