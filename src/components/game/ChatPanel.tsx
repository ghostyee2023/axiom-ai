"use client";

import { useGameStore } from "@/store/gameStore";
import type { ContractData } from "@/data/scenario";
import {
  Send,
  Loader2,
  Copy,
  Check,
  Bot,
  MessageCircle,
  RotateCcw,
  Clock,
  FileSearch,
  ScrollText,
  Lightbulb,
  Lock,
  Target,
  ListChecks,
  ShieldQuestion,
  GitCompare,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPanel({
  hideHeader = false,
  onOpenTaskIntel,
}: {
  hideHeader?: boolean;
  onOpenTaskIntel?: () => void;
}) {
  const chatMessages = useGameStore((s) => s.chatMessages);
  const sendChatMessage = useGameStore((s) => s.sendChatMessage);
  const isChatLoading = useGameStore((s) => s.isChatLoading);
  const chatWaitStage = useGameStore((s) => s.chatWaitStage);
  const chatError = useGameStore((s) => s.chatError);
  const retryLastChatMessage = useGameStore((s) => s.retryLastChatMessage);
  const subPhase = useGameStore((s) => s.subPhase);
  const diceRolled = useGameStore((s) => s.diceRolled);
  const currentTask = useGameStore((s) => s.currentTask);
  const currentFollowUpTask = useGameStore((s) => s.currentFollowUpTask);
  const currentFollowUpData = useGameStore((s) => s.currentFollowUpData);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockedHiddenData = useGameStore((s) => s.unlockedHiddenData);
  const decisionHistory = useGameStore((s) => s.decisionHistory);
  const branchContexts = useGameStore((s) => s.branchContexts);
  const taskScores = useGameStore((s) => s.taskScores);
  const totalScore = useGameStore((s) => s.totalScore);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isCrisisAndNotRolled = subPhase === "crisis" && !diceRolled;
  const quickRefs = buildQuickReferences(
    currentTask,
    unlockedHints,
    unlockedHiddenData,
    decisionHistory,
    branchContexts,
    taskScores,
    totalScore,
    currentFollowUpTask,
    currentFollowUpData
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  const handleSend = () => {
    if (!input.trim() || isChatLoading || isCrisisAndNotRolled) return;
    sendChatMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const appendReference = (ref: QuickReference) => {
    setInput((current) => {
      const prefix = current.trim() ? `${current.trim()}\n\n` : "";
      return `${prefix}【引用${ref.label}】\n${ref.content}\n\n请基于以上信息继续帮我分析。`;
    });
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    });
  };

  const applyThinkingCard = (card: ThinkingCard) => {
    setInput((current) => {
      const prefix = current.trim() ? `${current.trim()}\n\n` : "";
      return `${prefix}${card.prompt}`;
    });
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    });
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, rgba(26, 16, 64, 0.2), rgba(10, 14, 26, 0.6))",
        border: "1px solid rgba(139, 92, 246, 0.12)",
      }}
    >
      {/* Gradient accent line at top */}
      <div className="h-[2px] shrink-0"
        style={{ background: "linear-gradient(90deg, #8b5cf6, #06b6d4, #8b5cf6)" }}
      />

      {!hideHeader && (
        <div
          className="shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between"
          style={{
            background: "rgba(26, 16, 64, 0.3)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
          }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 pulse-glow-cyan" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-white/90">AI 外援</span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
            {chatMessages.length} 条消息
          </span>
        </div>
      )}

      {/* Messages - scrollable, takes remaining space */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 sm:px-4 sm:py-3 space-y-2.5 sm:space-y-3 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-center py-6 sm:py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 sm:mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))",
                border: "1px solid rgba(139, 92, 246, 0.15)",
              }}
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
            </div>
            <p className="text-white/60 text-xs sm:text-sm font-medium">需要外援时，就把问题交给 AI。</p>
            <p className="text-[11px] sm:text-xs mt-1.5 text-white/30 max-w-[240px] mx-auto">
              你可以继续追问、让它拆解风险，或把想法磨成可执行方案
            </p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}

        {isChatLoading && <ThinkingBubble stage={chatWaitStage} />}

        {!isChatLoading && chatWaitStage === "error" && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-4 py-3 text-sm max-w-[88%]"
              style={{
                background: "linear-gradient(135deg, rgba(127, 29, 29, 0.26), rgba(26, 16, 64, 0.25))",
                border: "1px solid rgba(248, 113, 113, 0.2)",
              }}
            >
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-300 mt-0.5" />
                <div>
                  <p className="text-xs text-red-100/80 font-medium">AI 这次没有顺利回复。</p>
                  <p className="text-[11px] text-white/42 mt-1">
                    {chatError || "你的上一条输入已保留，可以直接重试。"}
                  </p>
                  <button
                    onClick={retryLastChatMessage}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white bg-white/8 hover:bg-white/12 border border-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重试上一条
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis hint in chat area */}
      {isCrisisAndNotRolled && (
        <div
          className="shrink-0 px-3 py-2 text-center"
          style={{
            background: "rgba(245, 158, 11, 0.05)",
            borderTop: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <p className="text-amber-400 text-xs font-semibold">
            ⚠️ 请先掷骰子，再与AI对话应对危机
          </p>
        </div>
      )}

      {/* Floating Chat Input - Bottom */}
      <div
        className="shrink-0 px-2 py-2 sm:px-3 sm:py-2.5"
        style={{
          background: "rgba(10, 14, 26, 0.9)",
          borderTop: "1px solid rgba(139, 92, 246, 0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          {quickRefs.length > 0 && (
            <>
            {quickRefs.map((ref) => {
              const Icon = ref.icon;
              return (
                <button
                  key={ref.id}
                  onClick={() => {
                    if (ref.disabled) {
                      onOpenTaskIntel?.();
                      return;
                    }
                    appendReference(ref);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-colors"
                  style={{
                    background: ref.disabled ? "rgba(255,255,255,0.025)" : "rgba(6, 182, 212, 0.08)",
                    borderColor: ref.disabled ? "rgba(255,255,255,0.06)" : "rgba(6, 182, 212, 0.16)",
                    color: ref.disabled ? "rgba(255,255,255,0.35)" : "#a5f3fc",
                  }}
                  title={ref.disabled ? ref.disabledReason : `引用${ref.label}`}
                >
                  <Icon className="w-3 h-3" />
                  {ref.label}
                </button>
              );
            })}
            </>
          )}
          <ThinkingCardStrip onUse={applyThinkingCard} />
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isChatLoading
                ? "AI正在思考中..."
                : subPhase === "crisis"
                  ? "输入应对策略..."
                  : "向 AI 外援提问..."
            }
            rows={2}
            disabled={isCrisisAndNotRolled}
            className="flex-1 rounded-lg px-2.5 py-2 sm:px-3 sm:py-2 text-sm text-white placeholder:text-white/25 focus:outline-none resize-y min-h-[44px] sm:min-h-[56px] max-h-[120px] sm:max-h-[200px] overflow-y-auto custom-scrollbar disabled:opacity-50 transition-all duration-300"
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
          <button
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading || isCrisisAndNotRolled}
            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 btn-gradient-violet disabled:opacity-30"
          >
            {isChatLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingCardStrip({ onUse }: { onUse: (card: ThinkingCard) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-colors"
        style={{
          background: open ? "rgba(139, 92, 246, 0.12)" : "rgba(255,255,255,0.035)",
          borderColor: open ? "rgba(139, 92, 246, 0.22)" : "rgba(255,255,255,0.08)",
          color: open ? "#ddd6fe" : "rgba(255,255,255,0.52)",
        }}
      >
        <Lightbulb className="w-3 h-3" />
        思考卡
      </button>

      {open && (
        <div className="basis-full mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-fade-in-up">
          {thinkingCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onUse(card)}
                className="rounded-lg px-2.5 py-2 text-left border transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "rgba(10, 14, 26, 0.62)",
                  borderColor: "rgba(139, 92, 246, 0.14)",
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-200">
                  <Icon className="w-3 h-3 text-cyan-300" />
                  {card.title}
                </div>
                <div className="mt-1 text-[10px] leading-relaxed text-white/38">{card.desc}</div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

type ThinkingCard = {
  id: string;
  title: string;
  desc: string;
  prompt: string;
  icon: React.ElementType;
};

const thinkingCards: ThinkingCard[] = [
  {
    id: "goal",
    title: "澄清目标",
    desc: "先确认真正要解决什么。",
    icon: Target,
    prompt: "请先帮我澄清这个任务的真正目标：我应该优先解决什么？哪些目标可能互相冲突？",
  },
  {
    id: "missing",
    title: "反问缺口",
    desc: "让 AI 倒逼业务理解。",
    icon: ShieldQuestion,
    prompt: "请不要直接给方案。先反问我 3 个最关键的业务问题，帮助我补齐决策所需信息。",
  },
  {
    id: "compare",
    title: "三案比较",
    desc: "保守、稳健、进攻。",
    icon: GitCompare,
    prompt: "请基于当前信息，给我保守、稳健、进攻三种方向，并比较各自的风险、成本、难度和适用条件。",
  },
  {
    id: "risk",
    title: "风险预演",
    desc: "先看方案会怎么失败。",
    icon: ShieldQuestion,
    prompt: "请预演这个方案可能失败的 3 个原因，并告诉我分别需要提前准备什么缓冲动作。",
  },
  {
    id: "execution",
    title: "执行拆解",
    desc: "转成今天能做的动作。",
    icon: ListChecks,
    prompt: "请把目前最可行的方案拆成今天就能执行的步骤，并给出判断是否有效的指标。",
  },
];

type QuickReference = {
  id: string;
  label: string;
  content: string;
  icon: React.ElementType;
  disabled?: boolean;
  disabledReason?: string;
};

function buildQuickReferences(
  currentTask: ReturnType<typeof useGameStore.getState>["currentTask"],
  unlockedHints: string[],
  unlockedHiddenData: string[],
  decisionHistory: ReturnType<typeof useGameStore.getState>["decisionHistory"],
  branchContexts: ReturnType<typeof useGameStore.getState>["branchContexts"],
  taskScores: ReturnType<typeof useGameStore.getState>["taskScores"],
  totalScore: number,
  currentFollowUpTask: string | null,
  currentFollowUpData: string | null
): QuickReference[] {
  if (currentFollowUpData) {
    return [
      {
        id: "follow-up-data",
        label: detectFollowUpReferenceLabel(currentFollowUpData),
        content: [
          currentFollowUpTask ? `【当前要做】\n${currentFollowUpTask}` : "",
          `\n【参考资料】\n${currentFollowUpData}`,
        ].filter(Boolean).join("\n"),
        icon: currentFollowUpData.includes("合同") ? ScrollText : FileSearch,
      },
    ];
  }

  if (!currentTask || currentTask.type !== "main") return [];

  const refs: QuickReference[] = [];
  const record = currentTask as Record<string, unknown>;
  const contract = record.contract as ContractData | undefined;
  const hiddenData = record.hiddenData ? String(record.hiddenData) : "";
  const hiddenLabel = record.hiddenDataLabel ? String(record.hiddenDataLabel) : "隐藏情报";
  const displayData = buildChatReferenceData(currentTask, decisionHistory, branchContexts, taskScores, totalScore);

  if (displayData) {
    refs.push({
      id: "task-data",
      label: "参考资料",
      content: displayData,
      icon: FileSearch,
    });
  }

  if (contract) {
    refs.push({
      id: "contract",
      label: "合同",
      content: contractToReferenceText(contract),
      icon: ScrollText,
    });
  }

  if (hiddenData) {
    const unlocked = unlockedHiddenData.includes(currentTask.id);
    refs.push({
      id: "hidden-data",
      label: hiddenLabel,
      content: hiddenData,
      icon: unlocked ? FileSearch : Lock,
      disabled: !unlocked,
      disabledReason: "请先在任务资料库解锁该情报",
    });
  }

  refs.push({
    id: "hint",
    label: "策略锦囊",
    content: currentTask.task,
    icon: unlockedHints.includes(currentTask.id) ? Lightbulb : Lock,
    disabled: !unlockedHints.includes(currentTask.id),
    disabledReason: "请先在任务资料库解锁策略锦囊",
  });

  return refs;
}

function buildChatReferenceData(
  currentTask: Extract<ReturnType<typeof useGameStore.getState>["currentTask"], { type: "main" }>,
  decisionHistory: ReturnType<typeof useGameStore.getState>["decisionHistory"],
  branchContexts: ReturnType<typeof useGameStore.getState>["branchContexts"],
  taskScores: ReturnType<typeof useGameStore.getState>["taskScores"],
  totalScore: number
) {
  const rawData = currentTask.data || "";
  if (currentTask.id === "task_9" || rawData.includes("系统将根据你在上一关的选择")) {
    const latestDecision = decisionHistory[decisionHistory.length - 1] || "暂无上一关选择记录。";
    const latestBranch = branchContexts[branchContexts.length - 1];
    return [
      "【上一关选择】",
      latestDecision,
      latestBranch ? `\n【延续影响】\n${latestBranch.context}\n下一步压力：${latestBranch.nextPressure}` : "",
      "\n【本关要求】\n把上一选择拆成3个月执行计划，必须包含时间表、里程碑、资源需求、风险预案。",
    ].filter(Boolean).join("\n");
  }

  if (currentTask.id === "task_10" || rawData.includes("系统自动汇总")) {
    const scoreSummary = taskScores.length > 0
      ? taskScores.map((ts) => `${ts.title}：${ts.weightedTotal}分`).join("；")
      : "暂无评分记录。";
    const historySummary = decisionHistory.length > 0
      ? decisionHistory.slice(-8).join("\n")
      : "暂无关键决策记录。";
    return [
      `【历史评分】\n${scoreSummary}`,
      `\n【当前决策力】\n${totalScore}分`,
      `\n【关键决策记录】\n${historySummary}`,
    ].join("\n");
  }

  return rawData;
}

function detectFollowUpReferenceLabel(data: string) {
  if (/合同|条款|违约|甲方|乙方|利润分配|合作期限/.test(data)) return "合同";
  if (/补贴|政策|申请|评审/.test(data)) return "政策资料";
  if (/采访|媒体|提纲/.test(data)) return "采访资料";
  if (/探店|博主|视频/.test(data)) return "探店资料";
  return "参考资料";
}

function contractToReferenceText(contract: ContractData) {
  const lines = [
    `合同名称：${contract.title}`,
    `甲方：${contract.parties.partyA}`,
    `乙方：${contract.parties.partyB}`,
    `主要条款：${contract.terms.join("；")}`,
    `财务条款：金额${contract.financials.amount}，付款方式${contract.financials.paymentTerms}，期限${contract.financials.duration}`,
    `风险条款：${contract.risks.join("；")}`,
  ];
  if (contract.specialConditions?.length) {
    lines.push(`特别约定：${contract.specialConditions.join("；")}`);
  }
  return lines.join("\n");
}

function ThinkingBubble({ stage }: { stage: "idle" | "connecting" | "thinking" | "slow" | "error" }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const tips = [
    "经营顾问正在梳理你的问题...",
    "正在核对关键数据和约束...",
    "正在组织更可执行的建议...",
  ];

  useEffect(() => {
    const timer = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 3200);
    return () => clearInterval(timer);
  }, [tips.length]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const label =
    stage === "connecting"
      ? "正在连接 AI 服务..."
      : stage === "slow"
        ? "AI 思考有点久，你可以继续等待"
        : tips[tipIndex];

  return (
    <div className="flex justify-start">
      <div
        className="rounded-xl px-4 py-3 text-sm max-w-[88%]"
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.88), rgba(26, 16, 64, 0.36))",
          border: `1px solid ${stage === "slow" ? "rgba(245, 158, 11, 0.24)" : "rgba(139, 92, 246, 0.12)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 thinking-dot" />
          </div>
          <span className={`text-xs font-medium ${stage === "slow" ? "text-amber-300" : "text-violet-300"}`}>
            {label}
          </span>
          <span className="text-[10px] text-white/25 tabular-nums">
            {elapsed}s
          </span>
        </div>
        {stage === "slow" && (
          <p className="mt-1.5 text-[11px] text-white/35">
            网络或模型响应可能较慢，系统会在超时后释放输入框。
          </p>
        )}
      </div>
    </div>
  );
}

/** Single chat bubble with copy button for AI messages */
function ChatBubble({
  msg,
}: {
  msg: { role: "user" | "assistant"; content: string };
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = msg.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [msg.content]);

  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm leading-relaxed group relative ${
          msg.role === "user"
            ? "chat-bubble-user text-white"
            : "chat-bubble-ai text-white/85"
        }`}
      >
        {msg.role === "assistant" && (
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                }}
              >
                <Bot className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
              <span className="text-[10px] sm:text-xs text-violet-400 font-semibold">AI</span>
            </div>
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded-md hover:bg-white/10"
              title="复制AI回答"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
        )}

        {/* Render content: markdown for AI, plain text for user */}
        {msg.role === "assistant" ? (
          <div className="chat-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        )}

        {/* Copy button for user messages */}
        {msg.role === "user" && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-8 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10"
            title="复制"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
