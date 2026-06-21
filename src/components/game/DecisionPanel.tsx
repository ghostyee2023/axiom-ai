"use client";

import { useGameStore } from "@/store/gameStore";
import {
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

/**
 * DecisionPanel - Floating bottom-left panel for final decision conclusion + submit button.
 * Game-like "SUBMIT YOUR DECISION" feel with gradient and glow effects.
 */
export default function DecisionPanel({
  onOpenTaskIntel,
  onOpenAiAid,
}: {
  onOpenTaskIntel?: () => void;
  onOpenAiAid?: () => void;
}) {
  const subPhase = useGameStore((s) => s.subPhase);
  const diceRolled = useGameStore((s) => s.diceRolled);
  const opportunityAccepted = useGameStore((s) => s.opportunityAccepted);
  const finalAnswer = useGameStore((s) => s.finalAnswer);
  const isJudging = useGameStore((s) => s.isJudging);
  const judgeError = useGameStore((s) => s.judgeError);
  const isChatLoading = useGameStore((s) => s.isChatLoading);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const setFinalAnswer = useGameStore((s) => s.setFinalAnswer);
  const submitTask = useGameStore((s) => s.submitTask);

  const [decisionOpen, setDecisionOpen] = useState(false);

  // Whether to show the decision area
  const showDecisionArea =
    subPhase === "task" ||
    (subPhase === "crisis" && diceRolled) ||
    (subPhase === "opportunity" && opportunityAccepted);

  const isCrisisAndNotRolled = subPhase === "crisis" && !diceRolled;
  const disabledReason = isCrisisAndNotRolled
    ? "先掷骰子，接受危机结果后再处理。"
    : chatMessages.length === 0
      ? "先和 AI 外援对话，让它帮你形成可执行方案。"
      : isChatLoading
        ? "AI 正在回复，等它输出后再提交。"
        : "";
  const submitReady = !isJudging && !isChatLoading && chatMessages.length > 0 && !isCrisisAndNotRolled;
  const submitStatus = submitReady
    ? finalAnswer.trim().length > 0
      ? "准备出牌：已补充你的决策结论。"
      : "准备出牌：可直接让 AI 整理行动卡。"
    : disabledReason ? `出牌条件：${disabledReason}` : "";

  const handleSubmitDecision = () => {
    if (isJudging || isChatLoading || chatMessages.length === 0 || isCrisisAndNotRolled) return;
    submitTask(finalAnswer);
  };

  if (!showDecisionArea) return null;

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-in-up relative z-30 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(26, 16, 64, 0.4), rgba(10, 14, 26, 0.7))",
        border: "1px solid rgba(139, 92, 246, 0.18)",
        borderTop: "2px solid rgba(139, 92, 246, 0.3)",
      }}
    >
      {/* Mobile: compact submit-only mode | Desktop: full toggle mode */}
      {/* Top gradient accent line */}
      <div className="h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #8b5cf6, transparent)" }}
      />

      {/* Toggle Header - hidden on mobile, visible on desktop */}
      <button
        onClick={() => setDecisionOpen(!decisionOpen)}
        className="hidden sm:flex w-full items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-white/70 font-medium">
            最终决策结论
          </span>
          {finalAnswer ? (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                color: "#c4b5fd",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              {finalAnswer.length}字
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">（可选）</span>
          )}
        </div>
        {decisionOpen ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Decision Area - on mobile always visible, on desktop toggle */}
      {/* Mobile: compact inline textarea */}
      <div className="sm:hidden px-3 pb-2">
        <textarea
            value={finalAnswer}
            onChange={(e) => setFinalAnswer(e.target.value)}
            placeholder="写下你的决策结论：目标、动作、验证方式..."
          rows={2}
          className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none resize-none min-h-[44px] max-h-[80px] overflow-y-auto custom-scrollbar transition-all duration-300"
          style={{
            background: "rgba(10, 14, 26, 0.6)",
            border: "1px solid rgba(139, 92, 246, 0.12)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.35)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.12)";
          }}
        />
      </div>

      {/* Desktop: expandable textarea */}
      {decisionOpen && (
        <div className="hidden sm:block px-3.5 pb-2 animate-expand">
          <textarea
            value={finalAnswer}
            onChange={(e) => setFinalAnswer(e.target.value)}
            placeholder="总结你的决策结论：要解决什么、准备怎么做、用什么指标判断有效..."
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none resize-y min-h-[60px] max-h-[200px] overflow-y-auto custom-scrollbar transition-all duration-300"
            style={{
              background: "rgba(10, 14, 26, 0.6)",
              border: "1px solid rgba(139, 92, 246, 0.12)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.35)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(139, 92, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.12)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {/* Character counter */}
          <div className="flex items-center justify-end mt-1">
            <span className="text-[10px] tabular-nums"
              style={{
                color: finalAnswer.length > 0 ? "rgba(139, 92, 246, 0.6)" : "rgba(148, 163, 184, 0.3)",
              }}
            >
              {finalAnswer.length} / 500
            </span>
          </div>
        </div>
      )}

      {/* Fixed action area */}
      <div className="px-2.5 py-2 sm:px-3.5 sm:pb-3 sm:pt-0.5">
        {(onOpenTaskIntel || onOpenAiAid) && (
          <div className="mb-2 grid grid-cols-2 lg:grid-cols-1 gap-2">
            {onOpenTaskIntel && (
              <button
                type="button"
                onClick={onOpenTaskIntel}
                className="rounded-xl border border-cyan-300/14 bg-cyan-400/[0.055] px-3 py-2 text-left transition hover:bg-cyan-400/[0.09]"
              >
                <div className="text-xs font-bold text-cyan-200">任务资料</div>
                <div className="mt-0.5 text-[10px] text-white/34">查看/引用信息</div>
              </button>
            )}
            {onOpenAiAid && (
              <button
                type="button"
                onClick={onOpenAiAid}
                className="lg:hidden rounded-xl border border-violet-300/14 bg-violet-400/[0.06] px-3 py-2 text-left transition hover:bg-violet-400/[0.1]"
              >
                <div className="text-xs font-bold text-violet-200">AI 外援</div>
                <div className="mt-0.5 text-[10px] text-white/34">追问/推演方案</div>
              </button>
            )}
          </div>
        )}
        {judgeError && (
          <div
            className="mb-2 rounded-lg px-3 py-2 text-xs leading-relaxed text-amber-100"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.22)",
            }}
          >
            {judgeError}
          </div>
        )}
        {!judgeError && submitStatus && !isJudging && (
          <div className={`mb-2 rounded-lg px-2.5 py-1.5 text-center text-[11px] leading-relaxed border ${
            submitReady
              ? "text-emerald-100/72 bg-emerald-300/[0.055] border-emerald-300/[0.12]"
              : "text-white/42 bg-white/[0.035] border-white/[0.06]"
          }`}>
            {submitStatus}
          </div>
        )}
        <button
          onClick={handleSubmitDecision}
          disabled={
            isJudging ||
            isChatLoading ||
            chatMessages.length === 0 ||
            isCrisisAndNotRolled
          }
          className="w-full py-3 sm:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 btn-gradient-violet disabled:opacity-35 relative overflow-hidden"
        >
          {/* Shimmer effect on button */}
          <div className="absolute inset-0 animate-shimmer" />
          {isJudging ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="relative">AI 评估中...</span>
            </>
          ) : isChatLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="relative">等待AI回复...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-white relative" />
              <span className="relative">提交方案，生成行动卡</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
