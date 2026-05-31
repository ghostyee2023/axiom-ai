"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import WelcomePage from "@/components/game/WelcomePage";
import RoleSelection from "@/components/game/RoleSelection";
import StatusBar from "@/components/game/StatusBar";
import StoreScene from "@/components/game/StoreScene";
import TaskPanel from "@/components/game/TaskPanel";
import ChatPanel from "@/components/game/ChatPanel";
import ReviewPanel from "@/components/game/ReviewPanel";
import DecisionPanel from "@/components/game/DecisionPanel";
import DiceRoller from "@/components/game/DiceRoller";
import ScoringResult from "@/components/game/ScoringResult";
import ShopDialog from "@/components/game/ShopDialog";
import EndingPage from "@/components/game/EndingPage";
import NarrativeTransition from "@/components/game/NarrativeTransition";
import LevelStartAnimation from "@/components/game/LevelStartAnimation";
import DecisionOptionPanel from "@/components/game/DecisionOptionPanel";
import {
  ShoppingBag,
  Sparkles,
  MessageCircle,
  ClipboardList,
  FileText,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function GamePage() {
  const phase = useGameStore((s) => s.phase);
  const subPhase = useGameStore((s) => s.subPhase);
  const currentTask = useGameStore((s) => s.currentTask);
  const opportunityAccepted = useGameStore((s) => s.opportunityAccepted);
  const showShop = useGameStore((s) => s.showShop);
  const continueAfterCheckpoint = useGameStore(
    (s) => s.continueAfterCheckpoint
  );
  const acceptOpportunity = useGameStore((s) => s.acceptOpportunity);
  const declineOpportunity = useGameStore((s) => s.declineOpportunity);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const generateReview = useGameStore((s) => s.generateReview);
  const clearReview = useGameStore((s) => s.clearReview);
  const reviewReport = useGameStore((s) => s.reviewReport);
  const isReviewLoading = useGameStore((s) => s.isReviewLoading);
  const reviewedCheckpointId = useGameStore((s) => s.reviewedCheckpointId);
  const isFinalReportLoading = useGameStore((s) => s.isFinalReportLoading);
  const finalReport = useGameStore((s) => s.finalReport);
  const decisionOptionPhase = useGameStore((s) => s.decisionOptionPhase);

  const strings = scenarioData.strings;
  const [aiDrawerState, setAiDrawerState] = useState<{ open: boolean; step: number }>({ open: false, step: -1 });
  const [taskIntelState, setTaskIntelState] = useState<{ open: boolean; step: number }>({ open: false, step: -1 });

  // Auto-switch to chat tab on mobile when reaching checkpoint
  // Use derived state: if at checkpoint, always show chat; otherwise use manual tab
  const effectiveMobileTab = subPhase === "checkpoint" ? "chat" : "task";

  const shouldHideAiDrawer =
    decisionOptionPhase ||
    subPhase === "scoring" ||
    subPhase === "checkpoint" ||
    subPhase === "shop";
  const aiDrawerVisible =
    aiDrawerState.open &&
    aiDrawerState.step === currentStepIndex &&
    !shouldHideAiDrawer;
  const taskIntelOpen =
    taskIntelState.open &&
    taskIntelState.step === currentStepIndex;
  const setAiDrawerOpenForStep = (open: boolean) =>
    setAiDrawerState({ open, step: open ? currentStepIndex : -1 });
  const setTaskIntelOpenForStep = (open: boolean) =>
    setTaskIntelState({ open, step: open ? currentStepIndex : -1 });

  // Auto-generate review when reaching checkpoint
  useEffect(() => {
    const currentCheckpointId = currentTask?.id || null;
    // Only generate if at checkpoint AND not already generated for this specific checkpoint
    if (
      subPhase === "checkpoint" &&
      !isReviewLoading &&
      reviewedCheckpointId !== currentCheckpointId &&
      currentCheckpointId
    ) {
      generateReview();
    }
    // Clear review when leaving checkpoint/shop context
    if (subPhase !== "checkpoint" && subPhase !== "shop") {
      clearReview();
    }
  }, [subPhase, isReviewLoading, reviewedCheckpointId, currentTask, generateReview, clearReview]);

  // Determine if final checkpoint
  const isFinalCheckpoint =
    currentTask?.type === "checkpoint" &&
    currentTask.checkpoint.isFinal === true;

  // Pre-generate final report at the final checkpoint once the review is ready
  const generateFinalReport = useGameStore((s) => s.generateFinalReport);
  useEffect(() => {
    if (
      isFinalCheckpoint &&
      subPhase === "checkpoint" &&
      reviewReport &&
      !isReviewLoading &&
      !finalReport &&
      !isFinalReportLoading
    ) {
      generateFinalReport();
    }
  }, [isFinalCheckpoint, subPhase, reviewReport, isReviewLoading, finalReport, isFinalReportLoading, generateFinalReport]);

  // Determine if decision panel should show
  const showDecisionPanel =
    subPhase === "task" ||
    (subPhase === "opportunity" && opportunityAccepted);

  // Render based on phase
  if (phase === "welcome") return <WelcomePage />;
  if (phase === "roleSelect") return <RoleSelection />;
  if (phase === "ending") return <EndingPage />;
  if (phase === "transition") return <NarrativeTransition />;

  // Playing phase - redesigned layout
  return (
    <div className="h-screen flex flex-col overflow-hidden game-bg">
      {/* Top Status Bar */}
      <div className="shrink-0 px-2 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-3">
        <StatusBar />
      </div>

      {subPhase !== "checkpoint" && subPhase !== "shop" && (
        <div className="shrink-0 px-2 pb-2 sm:px-4">
          <StoreScene />
        </div>
      )}

      {subPhase === "checkpoint" && (
        <div className="lg:hidden shrink-0 px-2 pb-1">
          <div
            className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-amber-200"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.14)",
            }}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            阶段复盘
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-2 pb-2 sm:px-4 sm:pb-4 min-h-0 overflow-hidden">
        {/* ====== MOBILE: Tab-based view ====== */}
        {/* Left Panel - Task Info (mobile: only when "task" tab selected) */}
        <div className={`${
          effectiveMobileTab === "task" ? "flex flex-col flex-1" : "hidden"
        } lg:flex lg:flex-col lg:w-[380px] xl:w-[420px] lg:shrink-0 overflow-hidden min-h-0`}>
          {/* Scrollable task content area */}
          <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 min-h-0 pb-2">
            <TaskPanel
              onOpenAiAid={() => setAiDrawerOpenForStep(true)}
              intelOpen={taskIntelOpen}
              onIntelOpenChange={setTaskIntelOpenForStep}
            />

            {/* Opportunity Actions */}
            {subPhase === "opportunity" && !opportunityAccepted && (
              <div
                className="rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(26, 16, 64, 0.3))",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <div className="text-center text-sm text-white/60">
                  你要接受这个挑战吗？
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={acceptOpportunity}
                    className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#6ee7b7",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {strings.accept_opportunity}
                  </button>
                  <button
                    onClick={declineOpportunity}
                    className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                  >
                    {strings.decline_opportunity}
                  </button>
                </div>
              </div>
            )}

            {/* Checkpoint Actions */}
            {subPhase === "checkpoint" &&
              currentTask?.type === "checkpoint" && (
                <div
                  className="rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(26, 16, 64, 0.3))",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                  }}
                >
                  {currentTask.checkpoint.shop && (
                    <button
                      onClick={showShop}
                      className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.05))",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        color: "#fbbf24",
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {strings.shop_title}
                    </button>
                  )}
                  <button
                    onClick={continueAfterCheckpoint}
                    disabled={isFinalCheckpoint && (isReviewLoading || !reviewReport || isFinalReportLoading)}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    }}
                  >
                    {isFinalCheckpoint ? (
                      isReviewLoading && !reviewReport ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          AI复盘分析中...
                        </>
                      ) : isFinalReportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          报告生成中...
                        </>
                      ) : !reviewReport ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          等待AI分析...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          查看最终报告
                        </>
                      )
                    ) : (
                      strings.next_level_button
                    )}
                  </button>
                </div>
              )}
          </div>

          {/* Crisis DiceRoller - always visible, pinned above bottom panel */}
          {subPhase === "crisis" && (
            <div className="shrink-0">
              <DiceRoller />
            </div>
          )}

          {/* Floating Decision Panel - Bottom Left */}
          {showDecisionPanel && !aiDrawerVisible && (
            <div className="shrink-0 mt-auto sticky bottom-0 z-30">
              <DecisionPanel />
            </div>
          )}
        </div>

        {/* Right Panel - Chat or Review (mobile: only when "chat" tab selected) */}
        <div className={`${
          effectiveMobileTab === "chat" ? "flex flex-col flex-1" : "hidden"
        } lg:flex lg:flex-col lg:flex-1 min-h-0`}>
          {subPhase === "checkpoint" ? (
            <>
              <ReviewPanel />
              {currentTask?.type === "checkpoint" && (
                <div
                  className="lg:hidden shrink-0 p-3 space-y-2"
                  style={{
                    background: "rgba(10, 14, 26, 0.92)",
                    borderTop: "1px solid rgba(245, 158, 11, 0.12)",
                  }}
                >
                  {currentTask.checkpoint.shop && (
                    <button
                      onClick={showShop}
                      className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.05))",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        color: "#fbbf24",
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {strings.shop_title}
                    </button>
                  )}
                  <button
                    onClick={continueAfterCheckpoint}
                    disabled={isFinalCheckpoint && (isReviewLoading || !reviewReport || isFinalReportLoading)}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    }}
                  >
                    {isFinalCheckpoint ? (
                      isReviewLoading && !reviewReport ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          AI复盘分析中...
                        </>
                      ) : isFinalReportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          报告生成中...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          查看最终报告
                        </>
                      )
                    ) : (
                      strings.next_level_button
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <ChatPanel onOpenTaskIntel={() => setTaskIntelOpenForStep(true)} />
          )}
        </div>
      </div>

      {aiDrawerVisible && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(10, 14, 26, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={() => setAiDrawerOpenForStep(false)}
        >
          <div
            className="w-full h-[82vh] rounded-t-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 14, 26, 0.98))",
              border: "1px solid rgba(6, 182, 212, 0.18)",
              boxShadow: "0 -24px 70px rgba(0,0,0,0.45)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold text-white">AI 外援</span>
                <span className="text-[10px] text-white/35">需要时呼叫，不抢主舞台</span>
              </div>
              <button
                onClick={() => setAiDrawerOpenForStep(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[calc(82vh-3rem)] p-2 flex flex-col gap-2 min-h-0">
              <div className="flex-1 min-h-0">
                <ChatPanel
                  hideHeader
                  onOpenTaskIntel={() => {
                    setAiDrawerOpenForStep(false);
                    setTaskIntelOpenForStep(true);
                  }}
                />
              </div>
              {showDecisionPanel && (
                <div className="shrink-0">
                  <DecisionPanel />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scoring Result Overlay */}
      {subPhase === "scoring" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4"
          style={{
            background: "linear-gradient(135deg, rgba(10, 14, 26, 0.85), rgba(26, 16, 64, 0.75))",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
            <ScoringResult />
          </div>
        </div>
      )}

      {/* Shop Dialog */}
      {subPhase === "shop" && <ShopDialog />}

      {/* Decision Option Panel Overlay */}
      <DecisionOptionPanel />

      {/* Level Start Animation - key causes remount on task change */}
      <LevelStartAnimation key={`anim-${currentStepIndex}`} />
    </div>
  );
}
