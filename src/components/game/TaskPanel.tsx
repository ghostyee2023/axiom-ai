"use client";

import { useGameStore } from "@/store/gameStore";
import type { MainTask, CrisisCard, OpportunityCard } from "@/data/scenario";
import ContractPreview, { ContractPreviewButton } from "./ContractPreview";
import {
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  FileSearch,
  Lightbulb,
  Eye,
  Coins,
  Copy,
  Check,
  Shield,
  Star,
  Trophy,
} from "lucide-react";
import { useState, useCallback } from "react";

export default function TaskPanel() {
  const currentTask = useGameStore((s) => s.currentTask);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const subPhase = useGameStore((s) => s.subPhase);
  const expertRoleActive = useGameStore((s) => s.expertRoleActive);
  const expertRoleName = useGameStore((s) => s.expertRoleName);
  const doubleDiceActive = useGameStore((s) => s.doubleDiceActive);

  if (!currentTask && !currentEvent) return null;

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Expert Role Indicator */}
      {expertRoleActive && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs animate-task-card-enter relative overflow-hidden"
          style={{
            animationDelay: "0ms",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.03))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-amber-400" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-icon-pulse" />
          <span className="text-amber-300 font-medium">
            专家模式：AI将扮演「{expertRoleName}」
          </span>
        </div>
      )}

      {doubleDiceActive && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs animate-task-card-enter relative overflow-hidden"
          style={{
            animationDelay: "0ms",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-emerald-400" />
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-icon-pulse" />
          <span className="text-emerald-300 font-medium">
            双面骰子已激活：下次掷骰将选更好的结果
          </span>
        </div>
      )}

      {/* Main Task Card */}
      {currentTask?.type === "main" && subPhase === "task" && (
        <TaskCard task={currentTask} />
      )}

      {/* Contract Preview Button */}
      {currentTask?.type === "main" && subPhase === "task" && (
        <ContractPreviewButton />
      )}

      {/* Contract Preview Overlay */}
      <ContractPreview />

      {/* Event Card */}
      {subPhase === "crisis" && currentEvent?.type === "crisis" && (
        <CrisisEventCard event={currentEvent as CrisisCard} />
      )}

      {subPhase === "opportunity" && currentEvent?.type === "opportunity" && (
        <OpportunityEventCard event={currentEvent as OpportunityCard} />
      )}

      {/* Checkpoint Card */}
      {currentTask?.type === "checkpoint" && <CheckpointCard />}

      {/* Scoring result hint */}
      {subPhase === "scoring" && (
        <div
          className="rounded-xl p-4 text-center relative overflow-hidden animate-task-card-enter"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          <p className="text-violet-400 text-sm font-medium">正在查看评分结果 →</p>
          <p className="text-muted-foreground text-xs mt-1">
            请在右侧面板查看评分详情
          </p>
        </div>
      )}
    </div>
  );
}

/** Copy button component */
function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded-md hover:bg-white/10 transition-colors ${className}`}
      title="复制内容"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground" />
      )}
    </button>
  );
}

/** Expandable/collapsible data section with copy button */
function DataSection({
  title,
  icon: Icon,
  children,
  contentText,
  defaultOpen = false,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  contentText?: string;
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-lg overflow-hidden animate-task-card-enter relative"
      style={{
        animationDelay: `${delay}ms`,
        background: "rgba(10, 14, 26, 0.4)",
        border: "1px solid rgba(139, 92, 246, 0.08)",
      }}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ background: "linear-gradient(180deg, #8b5cf6, #06b6d4)" }}
      />
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 text-xs hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Icon className="w-3 h-3" />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {contentText && (
            <div onClick={(e) => e.stopPropagation()}>
              <CopyButton text={contentText} className="mr-1" />
            </div>
          )}
          {open ? (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>
      {open && (
        <div className="pl-4 pr-3 pb-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap animate-expand relative">
          {children}
          {contentText && (
            <div className="sticky bottom-0 right-0 flex justify-end pt-1">
              <CopyButton text={contentText} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Locked content card - for hints (锦囊) and hidden data */
function LockedCard({
  label,
  cost,
  isUnlocked,
  onUnlock,
  canAfford,
  icon: Icon,
  accentColor = "amber",
  children,
  delay = 0,
}: {
  label: string;
  cost: number;
  isUnlocked: boolean;
  onUnlock: () => void;
  canAfford: boolean;
  icon: React.ElementType;
  accentColor?: "amber" | "emerald" | "cyan" | "violet";
  children: React.ReactNode;
  delay?: number;
}) {
  const colorMap = {
    amber: {
      border: "rgba(245, 158, 11, 0.2)",
      bg: "rgba(245, 158, 11, 0.06)",
      text: "#fbbf24",
      accentLine: "linear-gradient(180deg, #f59e0b, #d97706)",
      btnBg: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))",
      btnBorder: "rgba(245, 158, 11, 0.25)",
      btnHoverBg: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.12))",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
    emerald: {
      border: "rgba(16, 185, 129, 0.2)",
      bg: "rgba(16, 185, 129, 0.06)",
      text: "#6ee7b7",
      accentLine: "linear-gradient(180deg, #10b981, #059669)",
      btnBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
      btnBorder: "rgba(16, 185, 129, 0.25)",
      btnHoverBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.12))",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    cyan: {
      border: "rgba(6, 182, 212, 0.2)",
      bg: "rgba(6, 182, 212, 0.06)",
      text: "#67e8f9",
      accentLine: "linear-gradient(180deg, #06b6d4, #0891b2)",
      btnBg: "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))",
      btnBorder: "rgba(6, 182, 212, 0.25)",
      btnHoverBg: "linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(6, 182, 212, 0.12))",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    violet: {
      border: "rgba(139, 92, 246, 0.2)",
      bg: "rgba(139, 92, 246, 0.06)",
      text: "#c4b5fd",
      accentLine: "linear-gradient(180deg, #8b5cf6, #7c3aed)",
      btnBg: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08))",
      btnBorder: "rgba(139, 92, 246, 0.25)",
      btnHoverBg: "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.12))",
      glowColor: "rgba(139, 92, 246, 0.15)",
    },
  };
  const c = colorMap[accentColor];

  return (
    <div
      className={`rounded-lg overflow-hidden animate-task-card-enter relative transition-all duration-500 ${
        isUnlocked ? "glow-accent" : ""
      }`}
      style={{
        animationDelay: `${delay}ms`,
        background: isUnlocked ? c.bg : "rgba(10, 14, 26, 0.4)",
        border: `1px solid ${isUnlocked ? c.border : "rgba(255, 255, 255, 0.04)"}`,
        boxShadow: isUnlocked ? `0 0 15px ${c.glowColor}` : "none",
      }}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ background: c.accentLine }}
      />

      {isUnlocked ? (
        <div className="animate-unlock-reveal">
          <div className="flex items-center justify-between pl-4 pr-3 py-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: c.text }}>
              <Unlock className="w-3 h-3" />
              <span className="font-medium">{label}</span>
              <span className="text-[10px] opacity-60 ml-1">已解锁</span>
            </div>
            <CopyButton text={typeof children === "string" ? children : ""} />
          </div>
          <div className="pl-4 pr-3 pb-3 text-white/80 text-sm leading-relaxed whitespace-pre-wrap animate-expand">
            {children}
          </div>
        </div>
      ) : (
        <div className="pl-4 pr-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3 animate-lock-shake" />
              <span className="font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-bold">{cost}</span>
            </div>
          </div>
          {/* Hidden content preview blur */}
          <div className="mb-3 rounded-md px-3 py-2 text-xs text-white/20 select-none blur-[3px]"
            style={{
              background: "rgba(10, 14, 26, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
            }}
          >
            这里是隐藏的策略内容，解锁后即可查看...
          </div>
          <button
            onClick={onUnlock}
            disabled={!canAfford}
            className="w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canAfford ? c.btnBg : "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${canAfford ? c.btnBorder : "rgba(255, 255, 255, 0.05)"}`,
              color: canAfford ? c.text : "rgba(148, 163, 184, 0.5)",
            }}
            onMouseEnter={(e) => {
              if (canAfford) {
                e.currentTarget.style.background = c.btnHoverBg;
                e.currentTarget.style.boxShadow = `0 0 15px ${c.glowColor}`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = canAfford ? c.btnBg : "rgba(255, 255, 255, 0.02)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {canAfford ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                消耗 {cost} 决策币解锁
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                决策币不足（需要 {cost}）
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: MainTask }) {
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockedHiddenData = useGameStore((s) => s.unlockedHiddenData);
  const unlockHint = useGameStore((s) => s.unlockHint);
  const unlockHiddenData = useGameStore((s) => s.unlockHiddenData);

  const hintUnlocked = unlockedHints.includes(task.id);
  const hiddenDataUnlocked = unlockedHiddenData.includes(task.id);
  const hasHiddenData = !!(task as Record<string, unknown>).hiddenData;
  const hiddenDataCost = (task as Record<string, unknown>).hiddenDataCost
    ? Number((task as Record<string, unknown>).hiddenDataCost)
    : 0;
  const hiddenDataLabel = (task as Record<string, unknown>).hiddenDataLabel
    ? String((task as Record<string, unknown>).hiddenDataLabel)
    : "隐藏数据";
  const hiddenDataText = (task as Record<string, unknown>).hiddenData
    ? String((task as Record<string, unknown>).hiddenData)
    : "";

  const isAutoData =
    task.data === "（系统将根据你在上一关的选择，自动填充守店方案或转型方案的上下文）" ||
    task.data === "（系统自动汇总你在前9个任务中的关键决策和评分）";

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {/* Title Card - Violet/Purple accent */}
      <div
        className="rounded-xl p-3 sm:p-4 animate-task-card-enter relative overflow-hidden"
        style={{
          animationDelay: "0ms",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(26, 16, 64, 0.3))",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
          style={{ background: "linear-gradient(180deg, #8b5cf6, #7c3aed)" }}
        />
        {/* Corner decorative element */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10"
          style={{ background: "radial-gradient(circle at top right, rgba(139, 92, 246, 0.5), transparent 70%)" }}
        />

        <div className="flex items-start justify-between gap-2 relative">
          <h3 className="text-lg font-bold text-white">{task.title}</h3>
          <div className="flex items-center gap-1 text-xs shrink-0 px-2 py-1 rounded-md"
            style={{
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <Clock className="w-3 h-3 text-violet-400" />
            <span className="text-violet-300 font-medium tabular-nums">{Math.floor(task.timeLimit / 60)}分钟</span>
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mt-2 relative">
          {task.description}
        </p>
      </div>

      {/* Challenge Card - Gold/Amber accent with gradient border */}
      <div
        className="rounded-xl p-4 animate-task-card-enter relative overflow-hidden"
        style={{
          animationDelay: "100ms",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.03))",
          border: "1px solid rgba(245, 158, 11, 0.18)",
        }}
      >
        {/* Left gradient accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
          style={{ background: "linear-gradient(180deg, #f59e0b, #d97706, #f59e0b)" }}
        />
        {/* Warning icon decorative glow */}
        <div className="absolute top-2 right-2 w-8 h-8 opacity-15"
          style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%)" }}
        />

        <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="font-semibold">核心挑战</span>
        </div>
        <p className="text-white/85 text-sm leading-relaxed">
          {(task as Record<string, unknown>).challenge
            ? String((task as Record<string, unknown>).challenge)
            : task.task}
        </p>
      </div>

      {/* Reference Data Card (expandable, with copy) */}
      {task.data && !isAutoData && (
        <DataSection
          title="参考资料"
          icon={FileSearch}
          contentText={task.data}
          delay={200}
        >
          {task.data}
        </DataSection>
      )}

      {/* Auto-generated data (non-expandable, just a note) */}
      {isAutoData && (
        <div
          className="rounded-lg px-3 py-2.5 text-xs animate-task-card-enter relative overflow-hidden"
          style={{
            animationDelay: "200ms",
            background: "rgba(10, 14, 26, 0.4)",
            border: "1px solid rgba(139, 92, 246, 0.08)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ background: "linear-gradient(180deg, #8b5cf6, #06b6d4)" }}
          />
          <div className="flex items-center gap-1.5 mb-1 pl-3 text-cyan-400">
            <FileSearch className="w-3 h-3" />
            <span className="font-medium">参考资料</span>
          </div>
          <p className="text-white/40 italic pl-3">{task.data}</p>
        </div>
      )}

      {/* Hidden Data Card (locked by default) - Emerald accent */}
      {hasHiddenData && (
        <LockedCard
          label={hiddenDataLabel}
          cost={hiddenDataCost}
          isUnlocked={hiddenDataUnlocked}
          onUnlock={unlockHiddenData}
          canAfford={decisionCoins >= hiddenDataCost}
          icon={FileSearch}
          accentColor="emerald"
          delay={300}
        >
          {hiddenDataText}
        </LockedCard>
      )}

      {/* Strategy Hint (锦囊) Card (locked by default) - Amber accent */}
      <LockedCard
        label="策略锦囊"
        cost={task.hintCost}
        isUnlocked={hintUnlocked}
        onUnlock={unlockHint}
        canAfford={decisionCoins >= task.hintCost}
        icon={Lightbulb}
        accentColor="amber"
        delay={hasHiddenData ? 400 : 300}
      >
        {task.task}
      </LockedCard>
    </div>
  );
}

function CrisisEventCard({ event }: { event: CrisisCard }) {
  const diceResult = useGameStore((s) => s.diceResult);
  const diceRolled = useGameStore((s) => s.diceRolled);
  const mitigated = useGameStore((s) => s.mitigated);

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="rounded-xl p-4 space-y-3 animate-task-card-enter relative overflow-hidden"
        style={{
          animationDelay: "0ms",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.05))",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.06)",
        }}
      >
        {/* Left accent border - red/orange danger gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
          style={{ background: "linear-gradient(180deg, #ef4444, #f97316)" }}
        />
        {/* Danger glow corner */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10"
          style={{ background: "radial-gradient(circle at top right, rgba(239, 68, 68, 0.5), transparent 70%)" }}
        />

        <div className="flex items-center gap-2 relative">
          <Shield className="w-5 h-5 text-red-400 animate-icon-pulse" />
          <h3 className="text-lg font-bold text-red-400">{event.title}</h3>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 ml-auto">
            ⚠ 危机
          </span>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          {event.description}
        </p>

        <div
          className="rounded-lg p-3 relative overflow-hidden"
          style={{
            background: "rgba(10, 14, 26, 0.5)",
            border: "1px solid rgba(239, 68, 68, 0.12)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ background: "linear-gradient(180deg, #ef4444, #f97316)" }}
          />
          <div className="flex items-center gap-1.5 text-xs text-red-400 mb-2 pl-2">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">应对任务</span>
          </div>
          <p className="text-white/85 text-sm leading-relaxed pl-2">{event.task}</p>
        </div>
      </div>

      {/* Dice Result */}
      {diceRolled && diceResult && (
        <div
          className={`rounded-lg p-3 animate-task-card-enter relative overflow-hidden`}
          style={{
            animationDelay: "100ms",
            background: mitigated
              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.03))"
              : "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))",
            border: mitigated
              ? "1px solid rgba(245, 158, 11, 0.2)"
              : "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{
              background: mitigated
                ? "linear-gradient(180deg, #f59e0b, #d97706)"
                : "linear-gradient(180deg, #ef4444, #dc2626)",
            }}
          />
          <div className="flex items-center justify-between mb-1 pl-2">
            <span className="text-xs text-muted-foreground">
              骰子结果：{diceResult.value}点
            </span>
            {mitigated && (
              <span className="text-xs text-amber-400 font-semibold">已缓冲！惩罚减半</span>
            )}
          </div>
          <p className="text-white/80 text-sm pl-2">{diceResult.narrative}</p>
          <p
            className={`text-sm mt-1 font-bold pl-2 ${
              mitigated ? "text-amber-400" : "text-red-400"
            }`}
          >
            {mitigated
              ? `惩罚：${Math.ceil(diceResult.penalty / 2)}分（原始${Math.abs(
                  diceResult.penalty
                )}分，缓冲后减半）`
              : `惩罚：${diceResult.penalty}分`}
          </p>
        </div>
      )}
    </div>
  );
}

function OpportunityEventCard({ event }: { event: OpportunityCard }) {
  const opportunityAccepted = useGameStore((s) => s.opportunityAccepted);
  const currentFollowUpTask = useGameStore((s) => s.currentFollowUpTask);

  return (
    <div
      className="rounded-xl p-4 space-y-3 animate-task-card-enter relative overflow-hidden"
      style={{
        animationDelay: "0ms",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.04))",
        border: "1px solid rgba(16, 185, 129, 0.22)",
        boxShadow: "0 0 20px rgba(16, 185, 129, 0.06)",
      }}
    >
      {/* Left accent border - emerald sparkle gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
        style={{ background: "linear-gradient(180deg, #10b981, #34d399, #10b981)" }}
      />
      {/* Sparkle glow corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10"
        style={{ background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.5), transparent 70%)" }}
      />

      <div className="flex items-center gap-2 relative">
        <Star className="w-5 h-5 text-emerald-400 animate-icon-pulse" />
        <h3 className="text-lg font-bold text-emerald-400">
          {event.title}
        </h3>
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 ml-auto">
          ✨ 机遇
        </span>
      </div>

      <p className="text-white/60 text-sm leading-relaxed">
        {event.description}
      </p>

      {opportunityAccepted && (
        <div
          className="rounded-lg p-3 relative overflow-hidden"
          style={{
            background: "rgba(10, 14, 26, 0.5)",
            border: "1px solid rgba(16, 185, 129, 0.12)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ background: "linear-gradient(180deg, #10b981, #34d399)" }}
          />
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-2 pl-2">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">挑战任务</span>
          </div>
          <p className="text-white/85 text-sm leading-relaxed pl-2">{event.task}</p>
        </div>
      )}

      {/* Follow-up task card */}
      {opportunityAccepted && currentFollowUpTask && (
        <FollowUpTaskCard />
      )}

      <div className="flex items-center gap-3 text-xs relative">
        {event.reward.decisionCoins && (
          <span className="px-2 py-0.5 rounded-md font-semibold"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            +{event.reward.decisionCoins} 决策币
          </span>
        )}
        {event.reward.score && (
          <span className="px-2 py-0.5 rounded-md font-semibold"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            +{event.reward.score} 分
          </span>
        )}
        {event.reward.item && (
          <span className="px-2 py-0.5 rounded-md font-semibold"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "#6ee7b7",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            获得「{event.reward.item}」
          </span>
        )}
      </div>
    </div>
  );
}

/** Follow-up task card - displayed after accepting an opportunity with followUpTask */
function FollowUpTaskCard() {
  const currentFollowUpTask = useGameStore((s) => s.currentFollowUpTask);
  const currentFollowUpData = useGameStore((s) => s.currentFollowUpData);
  const [dataOpen, setDataOpen] = useState(false);

  if (!currentFollowUpTask) return null;

  return (
    <div
      className="rounded-xl p-4 space-y-3 animate-task-card-enter relative overflow-hidden"
      style={{
        animationDelay: "100ms",
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(16, 185, 129, 0.04))",
        border: "1px solid rgba(6, 182, 212, 0.22)",
        boxShadow: "0 0 20px rgba(6, 182, 212, 0.06)",
      }}
    >
      {/* Left accent border - cyan gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
        style={{ background: "linear-gradient(180deg, #06b6d4, #10b981)" }}
      />
      {/* Glow corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10"
        style={{ background: "radial-gradient(circle at top right, rgba(6, 182, 212, 0.5), transparent 70%)" }}
      />

      <div className="flex items-center gap-2 relative">
        <FileSearch className="w-5 h-5 text-cyan-400 animate-icon-pulse" />
        <h3 className="text-lg font-bold text-cyan-400">后续任务</h3>
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 ml-auto">
          📋 跟进
        </span>
      </div>

      <p className="text-white/80 text-sm leading-relaxed">
        {currentFollowUpTask}
      </p>

      {/* Expandable follow-up data */}
      {currentFollowUpData && (
        <div className="rounded-lg overflow-hidden relative" style={{ background: "rgba(10, 14, 26, 0.4)", border: "1px solid rgba(6, 182, 212, 0.1)" }}>
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ background: "linear-gradient(180deg, #06b6d4, #10b981)" }}
          />
          <div
            onClick={() => setDataOpen(!dataOpen)}
            className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 text-xs hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-cyan-400">
              <FileSearch className="w-3 h-3" />
              <span className="font-medium">参考数据</span>
            </div>
            <div className="flex items-center gap-1">
              <CopyButton text={currentFollowUpData} className="mr-1" />
              {dataOpen ? (
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
          {dataOpen && (
            <div className="pl-4 pr-3 pb-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap animate-expand">
              {currentFollowUpData}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckpointCard() {
  const currentTask = useGameStore((s) => s.currentTask);
  const totalScore = useGameStore((s) => s.totalScore);
  const taskScores = useGameStore((s) => s.taskScores);

  if (!currentTask || currentTask.type !== "checkpoint") return null;

  const checkpoint = currentTask.checkpoint;

  return (
    <div
      className="rounded-xl p-4 space-y-4 animate-task-card-enter relative overflow-hidden"
      style={{
        animationDelay: "0ms",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.03))",
        border: "1px solid rgba(245, 158, 11, 0.2)",
      }}
    >
      {/* Left accent border - gold gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
        style={{ background: "linear-gradient(180deg, #f59e0b, #d97706, #f59e0b)" }}
      />
      {/* Gold glow corner */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10"
        style={{ background: "radial-gradient(circle at top right, rgba(245, 158, 11, 0.5), transparent 70%)" }}
      />

      <div className="flex items-center gap-2 relative">
        <Trophy className="w-5 h-5 text-amber-400 animate-icon-pulse" />
        <h3 className="text-lg font-bold text-white">{currentTask.title}</h3>
      </div>

      <p className="text-white/60 text-sm leading-relaxed italic relative">
        「{checkpoint.narrative}」
      </p>

      {/* Score Summary */}
      <div
        className="rounded-lg p-3 relative overflow-hidden"
        style={{
          background: "rgba(10, 14, 26, 0.5)",
          border: "1px solid rgba(245, 158, 11, 0.1)",
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ background: "linear-gradient(180deg, #f59e0b, #d97706)" }}
        />
        <div className="text-xs text-amber-400 mb-2 pl-2 font-semibold">阶段得分</div>
        {taskScores.length > 0 ? (
          <div className="space-y-1.5">
            {taskScores.map((ts, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm pl-2"
              >
                <span className="text-white/60">{ts.title}</span>
                <span className="font-bold"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {ts.weightedTotal}分
                </span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-1.5 mt-1.5 flex items-center justify-between text-sm font-bold pl-2">
              <span className="text-white">总分</span>
              <span className="text-amber-400">{totalScore}分</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm pl-2">暂无评分记录</p>
        )}
      </div>
    </div>
  );
}
