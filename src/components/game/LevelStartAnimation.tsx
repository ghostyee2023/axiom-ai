"use client";

import { useGameStore } from "@/store/gameStore";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MapPin, AlertTriangle, Sparkles, ChevronRight, Shield, Trophy } from "lucide-react";

interface AnimationData {
  title: string;
  description: string;
  type: "main" | "crisis" | "opportunity" | "checkpoint";
}

function deriveAnimationData(
  currentTask: { id: string; type: string; title?: string; description?: string } | null,
  currentEvent: { id: string; type: string; title: string; description: string } | null,
  subPhase: string
): AnimationData | null {
  if (currentTask?.type === "main" && subPhase === "task") {
    return {
      title: (currentTask as { title: string }).title,
      description: (currentTask as { description: string }).description,
      type: "main",
    };
  }
  if (subPhase === "crisis" && currentEvent?.type === "crisis") {
    return {
      title: currentEvent.title,
      description: currentEvent.description,
      type: "crisis",
    };
  }
  if (subPhase === "opportunity" && currentEvent?.type === "opportunity") {
    return {
      title: currentEvent.title,
      description: currentEvent.description,
      type: "opportunity",
    };
  }
  if (currentTask?.type === "checkpoint") {
    return {
      title: (currentTask as { title: string }).title,
      description: (currentTask as { description: string }).description,
      type: "checkpoint",
    };
  }
  return null;
}

/** Type-specific config with vivid colors */
const typeConfig = {
  main: {
    icon: MapPin,
    gradientFrom: "#8b5cf6",
    gradientTo: "#7c3aed",
    label: "新任务",
    glowColor: "rgba(139, 92, 246, 0.25)",
    bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.06))",
    borderColor: "rgba(139, 92, 246, 0.25)",
    cornerColor: "rgba(139, 92, 246, 0.15)",
    accentBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  crisis: {
    icon: AlertTriangle,
    gradientFrom: "#ef4444",
    gradientTo: "#f97316",
    label: "危机事件",
    glowColor: "rgba(239, 68, 68, 0.25)",
    bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(249, 115, 22, 0.06))",
    borderColor: "rgba(239, 68, 68, 0.25)",
    cornerColor: "rgba(239, 68, 68, 0.15)",
    accentBg: "linear-gradient(135deg, #ef4444, #f97316)",
  },
  opportunity: {
    icon: Sparkles,
    gradientFrom: "#10b981",
    gradientTo: "#059669",
    label: "机遇事件",
    glowColor: "rgba(16, 185, 129, 0.25)",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06))",
    borderColor: "rgba(16, 185, 129, 0.25)",
    cornerColor: "rgba(16, 185, 129, 0.15)",
    accentBg: "linear-gradient(135deg, #10b981, #059669)",
  },
  checkpoint: {
    icon: Trophy,
    gradientFrom: "#f59e0b",
    gradientTo: "#d97706",
    label: "结算点",
    glowColor: "rgba(245, 158, 11, 0.25)",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06))",
    borderColor: "rgba(245, 158, 11, 0.25)",
    cornerColor: "rgba(245, 158, 11, 0.15)",
    accentBg: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
};

/**
 * Level start animation overlay.
 * Uses key-based remount from parent (page.tsx) via `key` prop.
 * Each mount triggers the animation; auto-dismisses after 2.5s or on click.
 */
export default function LevelStartAnimation() {
  const currentTask = useGameStore((s) => s.currentTask);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const subPhase = useGameStore((s) => s.subPhase);
  const phase = useGameStore((s) => s.phase);

  const data = useMemo(
    () => deriveAnimationData(currentTask, currentEvent, subPhase),
    [currentTask, currentEvent, subPhase]
  );

  if (phase !== "playing" || !data) return null;

  return <LevelStartOverlay data={data} />;
}

/** Inner overlay - animation lifecycle managed by state + timer */
function LevelStartOverlay({ data }: { data: AnimationData }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const dismiss = useCallback(() => {
    if (fadingOut) return;
    setFadingOut(true);
    // Wait for fade-out animation to complete
    setTimeout(() => setVisible(false), 300);
  }, [fadingOut]);

  // Auto-dismiss after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  if (!visible) return null;

  const config = typeConfig[data.type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.75), rgba(26, 16, 64, 0.65))",
        backdropFilter: "blur(8px)",
      }}
      onClick={dismiss}
    >
      <div
        className="max-w-sm sm:max-w-md w-full animate-level-start"
        style={{ "--glow-color": config.glowColor } as React.CSSProperties}
      >
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: config.bgGradient,
            border: `1px solid ${config.borderColor}`,
            boxShadow: `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor.replace("0.25", "0.08")}`,
          }}
        >
          {/* Top gradient accent bar */}
          <div
            className="h-1"
            style={{ background: config.accentBg }}
          />

          {/* Decorative corner elements */}
          <div className="absolute top-3 left-3 w-8 h-8 pointer-events-none">
            <div
              className="absolute top-0 left-0 w-4 h-px"
              style={{ background: config.cornerColor }}
            />
            <div
              className="absolute top-0 left-0 w-px h-4"
              style={{ background: config.cornerColor }}
            />
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 pointer-events-none">
            <div
              className="absolute top-0 right-0 w-4 h-px"
              style={{ background: config.cornerColor }}
            />
            <div
              className="absolute top-0 right-0 w-px h-4"
              style={{ background: config.cornerColor }}
            />
          </div>
          <div className="absolute bottom-3 left-3 w-8 h-8 pointer-events-none">
            <div
              className="absolute bottom-0 left-0 w-4 h-px"
              style={{ background: config.cornerColor }}
            />
            <div
              className="absolute bottom-0 left-0 w-px h-4"
              style={{ background: config.cornerColor }}
            />
          </div>
          <div className="absolute bottom-3 right-3 w-8 h-8 pointer-events-none">
            <div
              className="absolute bottom-0 right-0 w-4 h-px"
              style={{ background: config.cornerColor }}
            />
            <div
              className="absolute bottom-0 right-0 w-px h-4"
              style={{ background: config.cornerColor }}
            />
          </div>

          <div className="p-4 sm:p-7 space-y-3 sm:space-y-5">
            {/* Type Label - Gradient badge */}
            <div className="flex items-center justify-center animate-level-badge">
              <span
                className="text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 text-white"
                style={{ background: config.accentBg }}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </span>
            </div>

            {/* Title - Dramatic gradient text */}
            <div className="text-center">
              <h2
                className="text-xl sm:text-2xl sm:text-3xl font-black animate-title-reveal"
                style={{
                  background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo}, #ffffff)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {data.title}
              </h2>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 animate-desc-reveal">
              <div className="w-10 h-px" style={{ background: config.cornerColor }} />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: config.cornerColor }}
              />
              <div className="w-10 h-px" style={{ background: config.cornerColor }} />
            </div>

            {/* Description */}
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed text-center animate-desc-reveal">
              {data.description}
            </p>

            {/* Dismiss hint - subtle */}
            <div className="text-center animate-desc-reveal">
              <span className="text-white/15 text-xs tracking-wider">
                点击任意处继续
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
