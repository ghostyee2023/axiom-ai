"use client";

import { useGameStore } from "@/store/gameStore";
import type { MainTask, CrisisCard, OpportunityCard, ContractData } from "@/data/scenario";
import {
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  FileSearch,
  ScrollText,
  Lightbulb,
  Eye,
  Coins,
  Copy,
  Check,
  Users,
  DollarSign,
  Shield,
  Star,
  Trophy,
  Bot,
  ClipboardList,
  X,
} from "lucide-react";
import { useState, useCallback, type ReactNode } from "react";

export default function TaskPanel({
  onOpenAiAid,
  intelOpen,
  onIntelOpenChange,
}: {
  onOpenAiAid?: () => void;
  intelOpen?: boolean;
  onIntelOpenChange?: (open: boolean) => void;
}) {
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
        <TaskCard
          task={currentTask}
          onOpenAiAid={onOpenAiAid}
          intelOpen={intelOpen}
          onIntelOpenChange={onIntelOpenChange}
        />
      )}

      {/* Event Card */}
      {subPhase === "crisis" && currentEvent?.type === "crisis" && (
        <CrisisEventCard event={currentEvent as CrisisCard} />
      )}

      {subPhase === "opportunity" && currentEvent?.type === "opportunity" && (
        <OpportunityEventCard event={currentEvent as OpportunityCard} onOpenAiAid={onOpenAiAid} />
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

function TaskCard({
  task,
  onOpenAiAid,
  intelOpen,
  onIntelOpenChange,
}: {
  task: MainTask;
  onOpenAiAid?: () => void;
  intelOpen?: boolean;
  onIntelOpenChange?: (open: boolean) => void;
}) {
  const [internalIntelOpen, setInternalIntelOpen] = useState(false);
  const [activeIntelTab, setActiveIntelTab] = useState<string>("data");
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockedHiddenData = useGameStore((s) => s.unlockedHiddenData);
  const unlockHint = useGameStore((s) => s.unlockHint);
  const unlockHiddenData = useGameStore((s) => s.unlockHiddenData);
  const branchContexts = useGameStore((s) => s.branchContexts);
  const decisionHistory = useGameStore((s) => s.decisionHistory);
  const taskScores = useGameStore((s) => s.taskScores);
  const totalScore = useGameStore((s) => s.totalScore);

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
  const contract = (task as Record<string, unknown>).contract as ContractData | undefined;
  const displayData = buildDisplayTaskData(task, decisionHistory, branchContexts, taskScores, totalScore);
  const dataItems = [
    displayData ? "参考资料" : null,
    hasHiddenData ? hiddenDataLabel : null,
    contract ? "合同" : null,
    "策略锦囊",
  ].filter(Boolean);

  const isAutoData =
    task.data === "（系统将根据你在上一关的选择，自动填充守店方案或转型方案的上下文）" ||
    task.data === "（系统将根据你在上一关的选择，自动填充相关方案的上下文）" ||
    task.data === "（系统自动汇总你在前9个任务中的关键决策和评分）";
  const activeBranchContext = branchContexts[branchContexts.length - 1];
  const branchConclusion = activeBranchContext
    ? buildBranchConclusion(activeBranchContext.nextPressure)
    : "";
  const taskGoal = buildTaskGoal(task);
  const impactTags = activeBranchContext
    ? buildImpactTags(`${activeBranchContext.context} ${activeBranchContext.nextPressure}`)
    : [];
  const showIntelDrawer = intelOpen ?? internalIntelOpen;
  const setShowIntelDrawer = onIntelOpenChange ?? setInternalIntelOpen;
  const intelTabs = [
    displayData ? { key: "data", label: "参考资料", icon: FileSearch } : null,
    contract ? { key: "contract", label: "合同", icon: ScrollText } : null,
    hasHiddenData ? { key: "hidden", label: "情报", icon: FileSearch } : null,
    { key: "hint", label: "锦囊", icon: Lightbulb },
  ].filter(Boolean) as { key: string; label: string; icon: React.ElementType }[];
  const currentIntelTab = intelTabs.some((tab) => tab.key === activeIntelTab)
    ? activeIntelTab
    : intelTabs[0]?.key || "hint";

  return (
    <div className="flex flex-col gap-3 sm:gap-3">
      <section
        className="rounded-3xl p-3 sm:p-3 space-y-3"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))",
          border: "1px solid rgba(139, 92, 246, 0.12)",
        }}
      >
        <SectionLabel icon={ClipboardList}>任务信息</SectionLabel>
      <div
        className="rounded-2xl p-4 sm:p-5 animate-task-card-enter relative overflow-hidden"
        style={{
          animationDelay: "0ms",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(6, 182, 212, 0.05), rgba(26, 16, 64, 0.42))",
          border: "1px solid rgba(139, 92, 246, 0.22)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
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

        <div className="relative">
          <div className="min-w-0">
            <h3 className="text-[22px] sm:text-[21px] font-black text-white leading-[1.22]">{task.title}</h3>
            <div className="mt-2 inline-flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 bg-amber-300/[0.08] border border-amber-300/14">
              <AlertTriangle className="mt-0.5 w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span className="text-[12px] leading-relaxed font-semibold text-amber-100">
                {taskGoal}
              </span>
            </div>
          </div>
        </div>
        <MissionInfo
          tone="main"
          background={task.description}
          objective={(task as Record<string, unknown>).challenge
            ? String((task as Record<string, unknown>).challenge)
            : task.task}
          objectiveLabel="本关要做"
        />
      </div>

      {activeBranchContext && (
        <div
          className="rounded-2xl px-4 py-3 animate-task-card-enter relative overflow-hidden"
          style={{
            animationDelay: "150ms",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.055), rgba(16, 185, 129, 0.035))",
            border: "1px solid rgba(6, 182, 212, 0.16)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
            style={{ background: "linear-gradient(180deg, #06b6d4, #10b981)" }}
          />
          <div className="pl-2 divide-y divide-white/8 border-y border-white/8">
            <MissionInfoRow label="上一选择影响" icon={Sparkles} color="#67e8f9">
              {impactTags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {impactTags.map((tag) => (
                    <span
                      key={tag.label}
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        color: tag.color,
                        background: tag.bg,
                        border: `1px solid ${tag.border}`,
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm font-bold text-white/86 leading-relaxed">
                {branchConclusion}
              </p>
            </MissionInfoRow>
            <MissionInfoRow label="原因" icon={FileSearch} color="#a5b4fc">
              <p className="text-[12px] text-white/52 leading-relaxed">
                <HighlightNumbers text={activeBranchContext.context} />
              </p>
            </MissionInfoRow>
          </div>
        </div>
      )}
      </section>

      <div
        className="rounded-3xl p-3.5 sm:p-4 animate-task-card-enter"
        style={{
          animationDelay: "220ms",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.055), rgba(139, 92, 246, 0.045))",
          border: "1px solid rgba(6, 182, 212, 0.14)",
        }}
      >
        <div className="mb-3">
          <SectionLabel icon={Bot}>操作区</SectionLabel>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          <button
            onClick={() => setShowIntelDrawer(true)}
            className="rounded-xl px-3 py-2.5 text-left bg-cyan-400/[0.055] border border-cyan-300/12"
          >
            <div className="text-xs font-semibold text-cyan-200">打开资料</div>
            <div className="mt-0.5 text-[10px] text-white/34">
              {dataItems.join(" / ")}
            </div>
          </button>
          <button
            onClick={onOpenAiAid}
            className="lg:hidden rounded-xl px-3 py-2.5 text-left bg-violet-400/[0.06] border border-violet-300/12"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-200">
              <Bot className="w-3.5 h-3.5" />
              呼叫外援
            </div>
            <div className="mt-0.5 text-[10px] text-white/34">追问、推演方案</div>
          </button>
        </div>
      </div>

      {showIntelDrawer && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(10, 14, 26, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowIntelDrawer(false)}
        >
          <div
            className="w-full sm:max-w-xl max-h-[82vh] overflow-hidden rounded-t-3xl sm:rounded-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(18, 14, 40, 0.98))",
              border: "1px solid rgba(139, 92, 246, 0.22)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-13 px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div>
                <div className="text-sm font-bold text-white">任务资料</div>
              </div>
              <button
                onClick={() => setShowIntelDrawer(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="border-b border-white/10 px-4 pt-3 pb-2">
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar">
                {intelTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = currentIntelTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveIntelTab(tab.key)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active ? "text-cyan-100 bg-cyan-400/12 border border-cyan-300/20" : "text-white/42 bg-white/[0.03] border border-white/8"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="max-h-[calc(82vh-7.5rem)] overflow-y-auto custom-scrollbar p-4 space-y-3">
              {currentIntelTab === "data" && displayData && !isAutoData && (
                <div className="rounded-xl p-3 bg-white/[0.035] border border-white/8">
                  <p className="text-sm leading-relaxed text-white/72 whitespace-pre-wrap">
                    {displayData}
                  </p>
                </div>
              )}
              {currentIntelTab === "data" && displayData && isAutoData && (
                <div className="rounded-xl p-3 bg-white/[0.035] border border-white/8">
                  <p className="text-sm leading-relaxed text-white/72 whitespace-pre-wrap">
                    {displayData}
                  </p>
                </div>
              )}
              {currentIntelTab === "contract" && contract && (
                <ContractInlineView contract={contract} />
              )}
              {currentIntelTab === "hidden" && hasHiddenData && (
                <LockedCard
                  label={hiddenDataLabel}
                  cost={hiddenDataCost}
                  isUnlocked={hiddenDataUnlocked}
                  onUnlock={unlockHiddenData}
                  canAfford={decisionCoins >= hiddenDataCost}
                  icon={FileSearch}
                  accentColor="emerald"
                >
                  {hiddenDataText}
                </LockedCard>
              )}
              {currentIntelTab === "hint" && (
              <LockedCard
                label="策略锦囊"
                cost={task.hintCost}
                isUnlocked={hintUnlocked}
                onUnlock={unlockHint}
                canAfford={decisionCoins >= task.hintCost}
                icon={Lightbulb}
                accentColor="amber"
              >
                {task.task}
              </LockedCard>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildBranchConclusion(nextPressure: string) {
  const trimmed = nextPressure.trim();
  if (!trimmed) return "上一轮选择会影响本关的经营判断。";
  const first = trimmed.split(/[；。]/).find(Boolean) || trimmed;
  return first.endsWith("。") ? first : `${first}。`;
}

function buildTaskGoal(task: MainTask) {
  const text = `${task.title} ${task.challenge || task.description} ${task.task}`;
  if (/合同|条款|合作|供应商|采购|谈判/.test(text)) return "判断合作条件是否可承受，明确必须谈清的风险条款。";
  if (/竞争|客流|营销|活动|会员|爆款|曝光|口碑/.test(text)) return "找到可执行的增长动作，并说明用什么数据验证有效。";
  if (/扩张|资金|现金|回本|投资|补贴|借款/.test(text)) return "算清现金压力和回本周期，再决定推进、暂缓或分阶段执行。";
  if (/投诉|危机|差评|信任/.test(text)) return "先修复信任，再建立防止复发的具体流程。";
  if (/团队|员工|招聘|排班/.test(text)) return "把人手问题拆成职责、排班、训练和交付标准。";
  if (/复盘|最终|实施计划|计划/.test(text)) return "把已有选择转成阶段计划，明确里程碑、资源和风险预案。";
  return "把问题、约束、行动和验证方式说清楚，再提交方案。";
}

function buildImpactTags(text: string) {
  const tagDefs = [
    { label: "现金流压力", match: /现金|资金|收入|营收|回本|成本|投入|支出|钱/, color: "#fbbf24", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
    { label: "执行压力", match: /执行|人手|员工|时间|里程碑|落地|计划|顶班/, color: "#fca5a5", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.22)" },
    { label: "关系变化", match: /关系|供应商|合作|物业|顾客|熟客|社区|家人|承诺/, color: "#a7f3d0", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.22)" },
    { label: "数据验证", match: /数据|验证|指标|反馈|复盘|调研|系统/, color: "#67e8f9", bg: "rgba(6,182,212,0.10)", border: "rgba(6,182,212,0.22)" },
    { label: "风险上升", match: /风险|止损|违约|库存|压力|不确定|隐藏成本/, color: "#c4b5fd", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)" },
  ];
  return tagDefs.filter((tag) => tag.match.test(text)).slice(0, 3);
}

function buildDisplayTaskData(
  task: MainTask,
  decisionHistory: string[],
  branchContexts: ReturnType<typeof useGameStore.getState>["branchContexts"],
  taskScores: ReturnType<typeof useGameStore.getState>["taskScores"],
  totalScore: number
) {
  const rawData = task.data || "";
  if (task.id === "task_9" || rawData.includes("系统将根据你在上一关的选择")) {
    const latestDecision = decisionHistory[decisionHistory.length - 1] || "暂无上一关选择记录。";
    const latestBranch = branchContexts[branchContexts.length - 1];
    return [
      "【上一关选择】",
      latestDecision,
      latestBranch ? `\n【延续影响】\n${latestBranch.context}\n下一步压力：${latestBranch.nextPressure}` : "",
      "\n【本关要求】\n把上一选择拆成3个月执行计划，必须包含时间表、里程碑、资源需求、风险预案。",
    ].filter(Boolean).join("\n");
  }

  if (task.id === "task_10" || rawData.includes("系统自动汇总")) {
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

function ContractInlineView({ contract }: { contract: ContractData }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(26,18,37,0.92) 0%, rgba(13,17,23,0.88) 52%, rgba(10,14,26,0.94) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.18)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
      }}
    >
      <div
        className="relative px-4 pt-4 pb-3"
        style={{
          background: "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
        }}
      >
        <div
          className="absolute top-0 left-4 right-4 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5), transparent)",
          }}
        />
        <h3 className="text-lg font-bold text-white tracking-wide pr-16">{contract.title}</h3>
        <div
          className="absolute top-4 right-4 w-14 h-14 rounded-full hidden sm:flex items-center justify-center opacity-20"
          style={{
            border: "3px solid #dc2626",
            color: "#dc2626",
            transform: "rotate(-15deg)",
          }}
        >
          <span className="text-[10px] font-bold">合同</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <InfoBlock icon={Users} title="合同方">
          <p>甲方：{contract.parties.partyA}</p>
          <p>乙方：{contract.parties.partyB}</p>
        </InfoBlock>

        <InfoBlock icon={FileSearch} title="主要条款">
          <ol className="list-decimal pl-4 space-y-1">
            {contract.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </InfoBlock>

        <InfoBlock icon={DollarSign} title="财务条款">
          <p>金额：{contract.financials.amount}</p>
          <p>付款方式：{contract.financials.paymentTerms}</p>
          <p>期限：{contract.financials.duration}</p>
        </InfoBlock>

        <InfoBlock icon={AlertTriangle} title="风险条款">
          <ol className="list-decimal pl-4 space-y-1">
            {contract.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ol>
        </InfoBlock>

        {contract.specialConditions && contract.specialConditions.length > 0 && (
          <InfoBlock icon={Star} title="特别约定">
            <ol className="list-decimal pl-4 space-y-1">
              {contract.specialConditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ol>
          </InfoBlock>
        )}

        <div
          className="flex justify-between items-end pt-4 mt-4"
          style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.08)" }}
        >
          <div className="text-white/24 text-xs">
            <p>甲方签章：_______________</p>
            <p className="mt-2">日期：_______________</p>
          </div>
          <div
            className="w-20 h-20 rounded-full hidden sm:flex flex-col items-center justify-center opacity-15"
            style={{
              border: "3px solid #dc2626",
              color: "#dc2626",
              transform: "rotate(8deg)",
            }}
          >
            <span className="text-[8px] font-bold leading-tight text-center">
              {contract.parties.partyA.slice(0, 4)}
            </span>
            <span className="text-[7px] font-bold mt-0.5">合同专用章</span>
          </div>
          <div className="text-white/24 text-xs text-right">
            <p>乙方签章：_______________</p>
            <p className="mt-2">日期：_______________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl p-3 bg-white/[0.035] border border-white/8">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-200 mb-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <div className="text-sm leading-relaxed text-white/72 space-y-1">
        {children}
      </div>
    </section>
  );
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="px-1 flex items-center gap-2 text-[12px] font-bold text-white/72 tracking-normal">
      <Icon className="w-3.5 h-3.5 text-cyan-300" />
      {children}
    </div>
  );
}

function MissionInfo({
  tone,
  conclusion,
  background,
  objective,
  objectiveLabel,
}: {
  tone: "main" | "danger" | "opportunity";
  conclusion?: string;
  background: string;
  objective?: string;
  objectiveLabel: string;
}) {
  const color = tone === "danger" ? "#f87171" : tone === "opportunity" ? "#34d399" : "#fbbf24";

  return (
    <div className="mt-4 relative divide-y divide-white/8 border-y border-white/8">
      <MissionInfoRow label="背景" icon={ClipboardList} color="#a5b4fc">
        {conclusion && <p className="mb-1.5 text-sm font-bold text-white/88">{conclusion}</p>}
        <p className="text-sm leading-[1.72] text-white/66">
          <HighlightNumbers text={background} />
        </p>
      </MissionInfoRow>

      {objective && (
        <MissionInfoRow label={objectiveLabel} icon={AlertTriangle} color={color}>
          <p className="text-white/86 text-sm leading-[1.72]">
            <HighlightNumbers text={objective} />
          </p>
        </MissionInfoRow>
      )}
    </div>
  );
}

function MissionInfoRow({
  label,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="py-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wide" style={{ color }}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

function HighlightNumbers({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,]*(?:\.\d+)?\s*(?:元|块|万|%|天|周|月|年|个|人|次|分|枚|家)|[¥￥]\s*\d[\d,]*(?:\.\d+)?)/g);
  return (
    <>
      {parts.map((part, index) =>
        /(\d|[¥￥])/.test(part) ? (
          <span key={`${part}-${index}`} className="font-bold text-amber-300 tabular-nums">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
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

        <MissionInfo
          tone="danger"
          background={event.description}
          objective={event.task}
          objectiveLabel="应对任务"
        />
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

function OpportunityEventCard({ event, onOpenAiAid }: { event: OpportunityCard; onOpenAiAid?: () => void }) {
  const opportunityAccepted = useGameStore((s) => s.opportunityAccepted);
  const currentFollowUpTask = useGameStore((s) => s.currentFollowUpTask);

  return (
    <>
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

      <OpportunityBrief event={event} accepted={opportunityAccepted} hasFollowUp={Boolean(currentFollowUpTask)} />

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
    {opportunityAccepted && currentFollowUpTask && (
      <FollowUpActionPanel onOpenAiAid={onOpenAiAid} />
    )}
    </>
  );
}

function OpportunityBrief({
  event,
  accepted,
  hasFollowUp,
}: {
  event: OpportunityCard;
  accepted: boolean;
  hasFollowUp: boolean;
}) {
  const intro = buildOpportunityIntro(event.title);

  return (
    <div className="space-y-3">
      <MissionInfo
        tone="opportunity"
        conclusion={intro}
        background={event.description}
        objective={!accepted || hasFollowUp ? undefined : event.task}
        objectiveLabel="当前要做"
      />

    </div>
  );
}

function buildOpportunityIntro(title: string) {
  if (/补贴|政策|政府/.test(title)) return "你获得了一个补贴申请机会。";
  if (/合作|资源|联盟/.test(title)) return "你获得了一个外部合作机会。";
  if (/客流|口碑|曝光|社区/.test(title)) return "你获得了一个扩大影响的机会。";
  return "你遇到了一个新的经营机会。";
}

/** Follow-up task card - displayed after accepting an opportunity with followUpTask */
function FollowUpTaskCard() {
  const currentFollowUpTask = useGameStore((s) => s.currentFollowUpTask);

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
        <h3 className="text-lg font-bold text-cyan-400">当前要做</h3>
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 ml-auto">
          📋 执行
        </span>
      </div>

      <p className="text-white/80 text-sm leading-relaxed">
        {currentFollowUpTask}
      </p>

    </div>
  );
}

function FollowUpActionPanel({ onOpenAiAid }: { onOpenAiAid?: () => void }) {
  const currentFollowUpData = useGameStore((s) => s.currentFollowUpData);
  const [dataOpen, setDataOpen] = useState(false);

  return (
    <div
      className="rounded-3xl p-3.5 sm:p-4 animate-task-card-enter"
      style={{
        animationDelay: "180ms",
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.055), rgba(139, 92, 246, 0.045))",
        border: "1px solid rgba(6, 182, 212, 0.14)",
      }}
    >
      <div className="mb-3">
        <SectionLabel icon={Bot}>操作区</SectionLabel>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {currentFollowUpData && (
          <button
            onClick={() => setDataOpen(true)}
            className="rounded-xl px-3 py-2.5 text-left bg-cyan-400/[0.055] border border-cyan-300/12"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-200">
              <FileSearch className="w-3.5 h-3.5" />
              打开资料
            </div>
            <div className="mt-0.5 text-[10px] text-white/34">参考资料</div>
          </button>
        )}
        <button
          onClick={onOpenAiAid}
          className="lg:hidden rounded-xl px-3 py-2.5 text-left bg-violet-400/[0.06] border border-violet-300/12"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-200">
            <Bot className="w-3.5 h-3.5" />
            呼叫外援
          </div>
          <div className="mt-0.5 text-[10px] text-white/34">追问、推演方案</div>
        </button>
      </div>
      {currentFollowUpData && dataOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(10, 14, 26, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={() => setDataOpen(false)}
        >
          <div
            className="w-full sm:max-w-xl max-h-[82vh] overflow-hidden rounded-t-3xl sm:rounded-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(18, 14, 40, 0.98))",
              border: "1px solid rgba(6, 182, 212, 0.22)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-13 px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="text-sm font-bold text-white">任务资料</div>
              <button
                onClick={() => setDataOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="border-b border-white/10 px-4 pt-3 pb-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-100 bg-cyan-400/12 border border-cyan-300/20">
                <FileSearch className="w-3.5 h-3.5" />
                参考资料
              </div>
            </div>
            <div className="max-h-[calc(82vh-7.5rem)] overflow-y-auto custom-scrollbar p-4">
              <div className="rounded-xl p-3 bg-white/[0.035] border border-white/8">
                <p className="text-sm leading-relaxed text-white/72 whitespace-pre-wrap">
                  {currentFollowUpData}
                </p>
              </div>
            </div>
          </div>
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
