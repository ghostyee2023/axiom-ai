"use client";

import { useGameStore } from "@/store/gameStore";
import {
  ClipboardList,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
  Presentation,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Brain,
  Target,
  Lightbulb,
  Rocket,
  Tag,
  Compass,
  TrendingUp,
  Star,
  Award,
  BookOpen,
  Zap,
  Maximize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from "react";
import React from "react";

// Map section titles to icons and colors
const sectionMeta: { keywords: string[]; icon: React.ElementType; color: string; gradient: string }[] = [
  { keywords: ["决策回顾", "回顾", "旅程"], icon: Compass, color: "#8b5cf6", gradient: "from-violet-500/20 to-purple-600/10" },
  { keywords: ["商业洞察", "洞察", "商业"], icon: Brain, color: "#06b6d4", gradient: "from-cyan-500/20 to-teal-600/10" },
  { keywords: ["提问反思", "反思", "AI"], icon: Lightbulb, color: "#f59e0b", gradient: "from-amber-500/20 to-orange-600/10" },
  { keywords: ["优势", "优势与不足"], icon: Award, color: "#10b981", gradient: "from-emerald-500/20 to-green-600/10" },
  { keywords: ["不足", "待提升"], icon: Target, color: "#ef4444", gradient: "from-red-500/20 to-rose-600/10" },
  { keywords: ["进阶建议", "建议"], icon: Rocket, color: "#8b5cf6", gradient: "from-violet-500/20 to-indigo-600/10" },
  { keywords: ["决策风格", "风格标签"], icon: Tag, color: "#f59e0b", gradient: "from-amber-500/20 to-yellow-600/10" },
  { keywords: ["综合", "总评", "整体"], icon: BarChart3, color: "#06b6d4", gradient: "from-cyan-500/20 to-blue-600/10" },
  { keywords: ["收入", "营收", "收益"], icon: TrendingUp, color: "#10b981", gradient: "from-emerald-500/20 to-teal-600/10" },
  { keywords: ["能力", "评估"], icon: Star, color: "#f59e0b", gradient: "from-amber-500/20 to-amber-600/10" },
];

function getSectionMeta(title: string) {
  const lower = title.toLowerCase();
  for (const meta of sectionMeta) {
    if (meta.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return meta;
    }
  }
  // Default
  return {
    icon: BookOpen,
    color: "#8b5cf6",
    gradient: "from-violet-500/20 to-purple-600/10",
  };
}

interface Slide {
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

function parseMarkdownToSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  const cleanedMarkdown = sanitizeReviewMarkdown(markdown);

  // Split by ## headings
  const parts = cleanedMarkdown.split(/^(?=## )/m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if it starts with ##
    const headingMatch = trimmed.match(/^##\s+(.+)/);
    let title: string;
    let content: string;

    if (headingMatch) {
      title = headingMatch[1].trim();
      // Remove the heading line from content
      content = trimmed.replace(/^##\s+.+\n?/, "").trim();
    } else {
      // Intro section (content before any ## heading)
      if (isReviewPreamble(trimmed)) continue;
      title = "📋 复盘总览";
      content = trimmed;
    }

    content = summarizeSlideContent(content);
    if (!content) continue;
    const meta = getSectionMeta(title);

    slides.push({
      title,
      content,
      icon: meta.icon,
      color: meta.color,
      gradient: meta.gradient,
    });
  }

  // If we only have one slide with no heading, try to create an intro
  if (slides.length === 0 && cleanedMarkdown.trim()) {
    slides.push({
      title: "📋 复盘报告",
      content: summarizeSlideContent(cleanedMarkdown),
      icon: BookOpen,
      color: "#8b5cf6",
      gradient: "from-violet-500/20 to-purple-600/10",
    });
  }

  return slides;
}

function sanitizeReviewMarkdown(markdown: string) {
  return markdown
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !isReviewPreamble(line))
    .join("\n")
    .trim();
}

function isReviewPreamble(line: string) {
  const normalized = line.replace(/\s+/g, "");
  return [
    /^好的[，,。！!]?这是.*?(复盘|报告)/,
    /^这是.*?(复盘|报告)/,
    /^以下是.*?(复盘|报告)/,
    /^下面是.*?(复盘|报告)/,
    /^为您生成.*?(复盘|报告)/,
  ].some((pattern) => pattern.test(normalized));
}

function summarizeSlideContent(content: string) {
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isReviewPreamble(line))
    .map((line) => line.replace(/^[-*]\s+/, "- ").replace(/^\d+[.)、]\s+/, "- "));

  const bullets = lines
    .filter((line) => line.startsWith("- "))
    .slice(0, 4)
    .map((line) => (line.length > 42 ? `${line.slice(0, 42)}...` : line));

  const lead = lines.find((line) => !line.startsWith("- ") && !line.startsWith("##"));
  const compactLead = lead
    ? (lead.length > 52 ? `${lead.slice(0, 52)}...` : lead)
    : "";

  if (bullets.length > 0) {
    return [compactLead, ...bullets].filter(Boolean).join("\n\n");
  }

  const sentences = content
    .replace(/\n+/g, " ")
    .split(/[。！？.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 4);

  return sentences
    .map((sentence, index) => {
      const text = sentence.length > 42 ? `${sentence.slice(0, 42)}...` : sentence;
      return index === 0 ? text : `- ${text}`;
    })
    .join("\n\n");
}

// ===== Key Insight Detection =====
const KEY_INSIGHT_KEYWORDS = ["关键", "重要", "核心", "关键点", "要点", "核心能力", "关键指标", "决定性", "至关重要", "值得注意的是"];

/** Extract plain text from React children recursively */
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children)) return extractText((children.props as { children?: ReactNode }).children);
  return "";
}

/** Recursively process React children to emphasize numbers with gold styling */
function emphasizeNumbers(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    // Match numbers with Chinese suffixes: 85分, ¥12,000, 90%, 3.5万, etc.
    const regex = /(\d[\d,]*\.?\d*(?:分|%|万|亿|元|次|个|项|位))|([¥￥]\s*[\d,]+\.?\d*)/g;
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(node)) !== null) {
      if (match.index > lastIndex) {
        parts.push(node.slice(lastIndex, match.index));
      }
      parts.push(
        <span
          key={`num-${key++}`}
          style={{
            color: "#fbbf24",
            fontWeight: 700,
            fontSize: "1.15em",
            textShadow: "0 0 8px rgba(251, 191, 36, 0.3)",
            letterSpacing: "-0.01em",
          }}
        >
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < node.length) {
      parts.push(node.slice(lastIndex));
    }

    return parts.length > 1 ? <>{parts}</> : node;
  }

  if (typeof node === "number") {
    return (
      <span
        style={{
          color: "#fbbf24",
          fontWeight: 700,
          fontSize: "1.15em",
          textShadow: "0 0 8px rgba(251, 191, 36, 0.3)",
        }}
      >
        {node}
      </span>
    );
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => emphasizeNumbers(child));
  }

  if (React.isValidElement(node)) {
    const children = (node.props as { children?: ReactNode }).children;
    if (children === undefined || children === null) return node;
    return React.cloneElement(node, undefined, emphasizeNumbers(children));
  }

  return node;
}

/** Create custom ReactMarkdown components for enhanced slide rendering */
function createSlideMarkdownComponents(accentColor: string) {
  return {
    p: ({ children, ...props }: any) => {
      const textContent = extractText(children);
      const isInsight = KEY_INSIGHT_KEYWORDS.some((kw) => textContent.includes(kw));

      if (isInsight) {
        return (
          <div
            style={{
              background: `linear-gradient(90deg, ${accentColor}12, ${accentColor}04, transparent)`,
              borderLeft: `3px solid ${accentColor}70`,
              padding: "10px 14px",
              margin: "8px 0",
              borderRadius: "0 10px 10px 0",
              position: "relative" as const,
            }}
          >
            {/* Subtle glow dot indicator */}
            <div
              style={{
                position: "absolute" as const,
                left: -1,
                top: -1,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 6px ${accentColor}80`,
              }}
            />
            <p {...props} style={{ color: "rgba(255, 255, 255, 0.92)", fontWeight: 500, margin: 0 }}>
              {emphasizeNumbers(children)}
            </p>
          </div>
        );
      }
      return <p {...props}>{emphasizeNumbers(children)}</p>;
    },
    strong: ({ children, ...props }: any) => (
      <strong
        {...props}
        style={{
          color: accentColor,
          fontWeight: 700,
          textShadow: `0 0 8px ${accentColor}25`,
        }}
      >
        {children}
      </strong>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        {...props}
        style={{
          borderLeft: `4px solid ${accentColor}50`,
          padding: "8px 14px",
          margin: "10px 0",
          color: `${accentColor}cc`,
          background: `${accentColor}08`,
          borderRadius: "0 8px 8px 0",
          fontStyle: "italic",
          position: "relative" as const,
        }}
      >
        {/* Decorative quote mark */}
        <span
          style={{
            position: "absolute" as const,
            left: 8,
            top: -4,
            fontSize: "1.4em",
            color: `${accentColor}30`,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          &ldquo;
        </span>
        {children}
      </blockquote>
    ),
    em: ({ children, ...props }: any) => (
      <em
        {...props}
        style={{
          color: `${accentColor}bb`,
          fontStyle: "italic",
        }}
      >
        {children}
      </em>
    ),
    ul: ({ children, ...props }: any) => (
      <ul {...props} style={{ listStyleType: "disc" }}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol {...props} style={{ listStyleType: "decimal" }}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props} style={{ margin: "4px 0" }}>
        {emphasizeNumbers(children)}
      </li>
    ),
    h3: ({ children, ...props }: any) => (
      <h3
        {...props}
        style={{
          color: accentColor,
          borderBottom: `1px solid ${accentColor}20`,
          paddingBottom: 4,
          fontWeight: 700,
        }}
      >
        {children}
      </h3>
    ),
  };
}

export default function ReviewPanel() {
  const reviewReport = useGameStore((s) => s.reviewReport);
  const isReviewLoading = useGameStore((s) => s.isReviewLoading);
  const generateReview = useGameStore((s) => s.generateReview);
  const currentTask = useGameStore((s) => s.currentTask);

  const [viewMode, setViewMode] = useState<"report" | "slides">("report");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");

  // Refs for keyboard and touch handling
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isFinalCheckpoint =
    currentTask?.type === "checkpoint" &&
    "checkpoint" in currentTask &&
    (currentTask as { checkpoint: { isFinal?: boolean } }).checkpoint?.isFinal === true;
  const isReviewError = Boolean(reviewReport && /报告生成失败|最终报告生成失败/.test(reviewReport));

  // Parse slides from the report
  const slides = useMemo(() => {
    if (!reviewReport || isReviewError) return [];
    return parseMarkdownToSlides(reviewReport);
  }, [reviewReport, isReviewError]);

  // Clamp slide index when slides change (derive during render, no setState in effect)
  const safeSlideIndex = slides.length > 0 ? Math.min(currentSlideIndex, slides.length - 1) : 0;
  const currentSlide = slides[safeSlideIndex] || null;

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        setSlideDirection(index >= safeSlideIndex ? "forward" : "backward");
        setCurrentSlideIndex(index);
      }
    },
    [slides.length, safeSlideIndex]
  );

  const nextSlide = useCallback(() => {
    goToSlide(safeSlideIndex + 1);
  }, [safeSlideIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(safeSlideIndex - 1);
  }, [safeSlideIndex, goToSlide]);

  // ===== Keyboard Navigation =====
  useEffect(() => {
    if (viewMode !== "slides" || !reviewReport) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, reviewReport, nextSlide, prevSlide]);

  // ===== Touch/Swipe Handlers =====
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  };

  // Memoize markdown components per slide color
  const markdownComponents = useMemo(
    () => (currentSlide ? createSlideMarkdownComponents(currentSlide.color) : null),
    [currentSlide]
  );

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, rgba(26, 16, 64, 0.2), rgba(10, 14, 26, 0.6))",
        border: "1px solid rgba(245, 158, 11, 0.15)",
      }}
    >
      {/* Gradient accent line at top */}
      <div
        className="h-[2px] shrink-0"
        style={{ background: "linear-gradient(90deg, #f59e0b, #8b5cf6, #06b6d4, #f59e0b)" }}
      />

      {/* Header */}
      <div
        className="shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between"
        style={{
          background: "rgba(26, 16, 64, 0.3)",
          borderBottom: "1px solid rgba(245, 158, 11, 0.12)",
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-white/90">
            {isFinalCheckpoint ? "📋 最终复盘报告" : "📋 复盘报告"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isReviewLoading && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-spin" />
              <span className="text-[10px] sm:text-xs text-amber-300/70">AI 生成中...</span>
            </div>
          )}
          {/* Toggle View Mode Button */}
          {reviewReport && !isReviewLoading && !isReviewError && (
            <button
              onClick={() => {
                setViewMode(viewMode === "report" ? "slides" : "report");
                setCurrentSlideIndex(0);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:
                  viewMode === "slides"
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.15))"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  viewMode === "slides"
                    ? "1px solid rgba(139, 92, 246, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                color: viewMode === "slides" ? "#c4b5fd" : "rgba(255,255,255,0.5)",
              }}
            >
              {viewMode === "report" ? (
                <>
                  <Presentation className="w-3 h-3" />
                  <span>演示</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3 h-3" />
                  <span>报告</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {isReviewLoading && !reviewReport ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-8 sm:py-16">
            <div className="relative mb-4 sm:mb-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.08))",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 animate-pulse" />
              </div>
            </div>
            <p className="text-white/70 text-xs sm:text-sm font-medium mb-2">AI 正在分析你的决策历程...</p>
            <p className="text-[11px] sm:text-xs text-white/30">这可能需要 10-20 秒；复盘不会影响继续游戏</p>
            <div className="mt-6 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 thinking-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 thinking-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 thinking-dot" />
            </div>
          </div>
        ) : reviewReport && !isReviewError ? (
          viewMode === "report" ? (
            // Report (markdown) mode
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 sm:px-4 sm:py-3">
              <div className="chat-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reviewReport}</ReactMarkdown>
              </div>
            </div>
          ) : (
            // ===== Enhanced Slide Presentation Mode =====
            <div
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              ref={slideContainerRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {slides.length > 0 && currentSlide ? (
                <>
                  {/* ===== Progress Bar ===== */}
                  <div className="shrink-0 px-3 pt-2">
                    <div
                      className="relative h-[3px] rounded-full overflow-hidden"
                      style={{ background: "rgba(255, 255, 255, 0.06)" }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${((safeSlideIndex + 1) / slides.length) * 100}%`,
                          background: `linear-gradient(90deg, ${currentSlide.color}, ${currentSlide.color}90)`,
                          boxShadow: `0 0 10px ${currentSlide.color}40`,
                        }}
                      />
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${((safeSlideIndex + 1) / slides.length) * 100}%`,
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                          backgroundSize: "200% 100%",
                          animation: "progress-shimmer 2s ease-in-out infinite",
                        }}
                      />
                    </div>
                  </div>

                  {/* ===== Slide Content Area ===== */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 min-h-0">
                    <div
                      key={safeSlideIndex}
                      className={slideDirection === "forward" ? "slide-enter-animation" : "slide-enter-reverse-animation"}
                    >
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, ${currentSlide.color}0a, rgba(26, 16, 64, 0.7), rgba(10, 14, 26, 0.9))`,
                          border: `1px solid ${currentSlide.color}25`,
                          boxShadow: `0 0 50px ${currentSlide.color}08, inset 0 1px 0 ${currentSlide.color}18, inset 0 -1px 0 ${currentSlide.color}08`,
                          backdropFilter: "blur(16px)",
                          position: "relative",
                        }}
                      >
                        {/* ===== Dramatic top gradient line ===== */}
                        <div
                          className="h-[3px]"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${currentSlide.color}80, ${currentSlide.color}40, transparent)`,
                          }}
                        />

                        {/* ===== Decorative corner glow ===== */}
                        <div
                          className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                          style={{
                            background: `radial-gradient(ellipse at top right, ${currentSlide.color}10, transparent 70%)`,
                          }}
                        />
                        <div
                          className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
                          style={{
                            background: `radial-gradient(ellipse at bottom left, ${currentSlide.color}08, transparent 70%)`,
                          }}
                        />

                        {/* ===== Enhanced Slide Header ===== */}
                        <div className="px-3 sm:px-5 pt-3 sm:pt-5 pb-2 sm:pb-3 relative">
                          <div className="flex items-start gap-2 sm:gap-4">
                            {/* Large dramatic icon container */}
                            <div
                              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 relative"
                              style={{
                                background: `linear-gradient(135deg, ${currentSlide.color}25, ${currentSlide.color}08)`,
                                border: `1px solid ${currentSlide.color}40`,
                                boxShadow: `0 0 24px ${currentSlide.color}18, inset 0 1px 0 ${currentSlide.color}15`,
                              }}
                            >
                              <currentSlide.icon
                                className="w-4.5 h-4.5 sm:w-6 sm:h-6"
                                style={{ color: currentSlide.color }}
                              />
                              {/* Animated glow dot */}
                              <div
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
                                style={{
                                  background: currentSlide.color,
                                  boxShadow: `0 0 8px ${currentSlide.color}80`,
                                }}
                              />
                            </div>

                            {/* Title and subtitle */}
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-sm sm:text-lg font-bold leading-tight"
                                style={{
                                  color: "rgba(255, 255, 255, 0.95)",
                                  textShadow: `0 0 20px ${currentSlide.color}15`,
                                }}
                              >
                                {currentSlide.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className="text-xs font-mono font-medium"
                                  style={{ color: `${currentSlide.color}90` }}
                                >
                                  {safeSlideIndex + 1}
                                </span>
                                <div className="h-2.5 w-px" style={{ background: `${currentSlide.color}30` }} />
                                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  {slides.length}
                                </span>
                                <div className="h-2.5 w-px" style={{ background: `${currentSlide.color}30` }} />
                                <div className="flex items-center gap-1">
                                  <Maximize2 className="w-2.5 h-2.5" style={{ color: `${currentSlide.color}50` }} />
                                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    幻灯片
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== Divider with section color ===== */}
                        <div
                          className="h-[1px] mx-5"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${currentSlide.color}20, transparent)`,
                          }}
                        />

                        {/* ===== Slide Body with Enhanced Markdown ===== */}
                        <div className="px-3 py-2 sm:px-5 sm:py-4 relative">
                          <div
                            className="chat-markdown text-xs sm:text-sm leading-relaxed"
                            style={{
                              color: "rgba(255, 255, 255, 0.75)",
                            }}
                          >
                            {markdownComponents && (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {currentSlide.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>

                        {/* ===== Key Takeaway Footer ===== */}
                        <div
                          className="mx-3 sm:mx-5 mb-1 sm:mb-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${currentSlide.color}08, transparent)`,
                            border: `1px solid ${currentSlide.color}12`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: `${currentSlide.color}80` }} />
                            <span className="text-[11px] font-medium" style={{ color: `${currentSlide.color}80` }}>
                              提示：使用 ← → 方向键或滑动切换幻灯片
                            </span>
                          </div>
                        </div>

                        {/* ===== Slide decorative bottom ===== */}
                        <div
                          className="h-[2px] mx-5 mb-3"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${currentSlide.color}15, transparent)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== Enhanced Slide Navigation ===== */}
                  <div
                    className="shrink-0 px-2 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between"
                    style={{
                      background: "rgba(26, 16, 64, 0.3)",
                      borderTop: "1px solid rgba(245, 158, 11, 0.08)",
                    }}
                  >
                    {/* Prev button */}
                    <button
                      onClick={prevSlide}
                      disabled={safeSlideIndex === 0}
                      className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background: safeSlideIndex > 0 ? `${currentSlide.color}12` : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${safeSlideIndex > 0 ? `${currentSlide.color}25` : "rgba(255, 255, 255, 0.08)"}`,
                        color: safeSlideIndex > 0 ? `${currentSlide.color}cc` : "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>上一页</span>
                    </button>

                    {/* Slide indicator: progress bar + dots */}
                    <div className="flex items-center gap-1 sm:gap-3">
                      <span
                        className="text-[10px] sm:text-xs font-mono font-semibold"
                        style={{ color: `${currentSlide.color}90` }}
                      >
                        {safeSlideIndex + 1}/{slides.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {slides.map((slide, i) => (
                          <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            className="transition-all duration-300 rounded-full"
                            style={{
                              width: i === safeSlideIndex ? "20px" : "6px",
                              height: "6px",
                              background:
                                i === safeSlideIndex
                                  ? slide.color
                                  : i < safeSlideIndex
                                    ? `${slide.color}30`
                                    : "rgba(255, 255, 255, 0.12)",
                              boxShadow:
                                i === safeSlideIndex
                                  ? `0 0 10px ${slide.color}50`
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Next button */}
                    <button
                      onClick={nextSlide}
                      disabled={safeSlideIndex === slides.length - 1}
                      className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background: safeSlideIndex < slides.length - 1 ? `${currentSlide.color}12` : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${safeSlideIndex < slides.length - 1 ? `${currentSlide.color}25` : "rgba(255, 255, 255, 0.08)"}`,
                        color: safeSlideIndex < slides.length - 1 ? `${currentSlide.color}cc` : "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      <span>下一页</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm">暂无幻灯片内容</p>
                </div>
              )}
            </div>
          )
        ) : (
          // Error / no report state
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-white/50 text-sm">报告生成失败</p>
            <p className="text-xs text-white/30 mt-1">可以重新生成，或直接继续下一关</p>
            <button
              onClick={generateReview}
              disabled={isReviewLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-45 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              }}
            >
              {isReviewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              重新生成复盘
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
