"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import WelcomePage from "@/components/game/WelcomePage";
import RoleSelection from "@/components/game/RoleSelection";
import StatusBar from "@/components/game/StatusBar";
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
  FileText,
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";

type MobileTab = "task" | "chat";

export default function GamePage() {
  const phase = useGameStore((s) => s.phase);
  const subPhase = useGameStore((s) => s.subPhase);
  const currentTask = useGameStore((s) => s.currentTask);
  const diceRolled = useGameStore((s) => s.diceRolled);
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

  const strings = scenarioData.strings;
  const [mobileTab, setMobileTab] = useState<MobileTab>("task");

  // Auto-switch to chat tab on mobile when reaching checkpoint
  // Use derived state: if at checkpoint, always show chat; otherwise use manual tab
  const effectiveMobileTab: MobileTab = subPhase === "checkpoint" ? "chat" : mobileTab;

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
    (subPhase === "crisis" && diceRolled) ||
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
      <div className="shrink-0 px-2 pt-2 pb-1 sm:px-4 sm:pt-3">
        <StatusBar />
      </div>

      {/* Mobile Tab Switcher - only visible on small screens */}
      <div className="lg:hidden shrink-0 px-2 pb-1">
        <div
          className="flex rounded-xl overflow-hidden"
          style={{
            background: "rgba(10, 14, 26, 0.6)",
            border: "1px solid rgba(139, 92, 246, 0.12)",
          }}
        >
          <button
            onClick={() => setMobileTab("task")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all duration-200"
            style={{
              background: effectiveMobileTab === "task"
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08))"
                : "transparent",
              color: effectiveMobileTab === "task" ? "#c4b5fd" : "rgba(255,255,255,0.4)",
              borderBottom: effectiveMobileTab === "task" ? "2px solid #8b5cf6" : "2px solid transparent",
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            任务
          </button>
          <button
            onClick={() => setMobileTab("chat")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all duration-200"
            style={{
              background: effectiveMobileTab === "chat"
                ? "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.08))"
                : "transparent",
              color: effectiveMobileTab === "chat" ? "#67e8f9" : "rgba(255,255,255,0.4)",
              borderBottom: effectiveMobileTab === "chat" ? "2px solid #06b6d4" : "2px solid transparent",
            }}
          >
            {subPhase === "checkpoint" ? (
              <>
                <ClipboardList className="w-3.5 h-3.5" />
                复盘
              </>
            ) : (
              <>
                <MessageCircle className="w-3.5 h-3.5" />
                对话
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 px-2 pb-2 sm:px-4 sm:pb-4 min-h-0 overflow-hidden">
        {/* ====== MOBILE: Tab-based view ====== */}
        {/* Left Panel - Task Info (mobile: only when "task" tab selected) */}
        <div className={`${
          effectiveMobileTab === "task" ? "flex flex-col flex-1" : "hidden"
        } lg:flex lg:flex-col lg:w-[380px] xl:w-[420px] lg:shrink-0 overflow-hidden min-h-0`}>
          {/* Scrollable task content area */}
          <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 min-h-0 pb-2">
            <TaskPanel />

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
          {showDecisionPanel && (
            <div className="shrink-0 mt-auto">
              <DecisionPanel />
            </div>
          )}
        </div>

        {/* Right Panel - Chat or Review (mobile: only when "chat" tab selected) */}
        <div className={`${
          effectiveMobileTab === "chat" ? "flex flex-col flex-1" : "hidden"
        } lg:flex lg:flex-col lg:flex-1 min-h-0`}>
          {subPhase === "checkpoint" ? <ReviewPanel /> : <ChatPanel />}
        </div>
      </div>

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
