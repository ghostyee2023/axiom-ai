"use client";

import { scenarioData } from "@/data/scenario";
import { useGameStore } from "@/store/gameStore";
import {
  X,
  Key,
  Sparkles,
  Shield,
  Target,
  BookOpen,
  Coins,
  Zap,
  Trophy,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

export default function WelcomePage() {
  const startGame = useGameStore((s) => s.startGame);
  const apiKey = useGameStore((s) => s.apiKey);
  const setApiKey = useGameStore((s) => s.setApiKey);
  const [showRules, setShowRules] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyFocused, setApiKeyFocused] = useState(false);
  const strings = scenarioData.strings;

  // Only render particles on client to avoid SSR hydration mismatch
  // (React serializes CSS numeric values with different precision on server vs client)
  const isClient = useSyncExternalStore(
    () => () => {}, // subscribe (noop)
    () => true,     // getSnapshot (client)
    () => false     // getServerSnapshot (server)
  );

  // Generate particles with Math.random() - safe because only rendered on client
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color:
      i % 5 === 0
        ? "rgba(245, 158, 11, 0.6)"
        : i % 5 === 1
          ? "rgba(6, 182, 212, 0.6)"
          : "rgba(139, 92, 246, 0.5)",
  }));

  const ruleItems = [
    {
      icon: <Shield className="w-4 h-4" />,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.15)",
      title: "1. 选择身份",
      desc: "选择一个角色，不同角色有不同的故事线和初始资源。",
    },
    {
      icon: <Target className="w-4 h-4" />,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.15)",
      title: "2. 面对挑战",
      desc: "每关都有一个核心挑战，通过对话找到解决方案。提交后AI裁判评分。",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      title: "💡 策略锦囊",
      desc: "卡住时可以消耗决策币解锁策略提示。但自己想出来的方案可能得分更高！",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.15)",
      title: "🔍 情报调查",
      desc: "有些关卡有隐藏的商业情报，消耗决策币可以解锁。",
    },
    {
      icon: <Coins className="w-4 h-4" />,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      title: "3. 应对随机事件",
      desc: "危机卡需要掷骰子+对话应对；机遇卡可自由选择接受或放弃。",
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.15)",
      title: "4. 最终结算",
      desc: "根据总分获得结局称号和决策风格报告。",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 game-bg overflow-hidden">
      {/* Floating Particles - client only to avoid hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {isClient && particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: p.color,
              opacity: Math.random() * 0.5 + 0.2,
              animationDuration: `${Math.random() * 12 + 10}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-lg w-full text-center relative z-10 animate-fade-in-up">
        {/* Logo / Icon with Pulsing Glow */}
        <div className="mb-6 sm:mb-8">
          <div className="relative inline-block">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 rounded-2xl pulse-ring" />
            {/* Main icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl glass-card flex items-center justify-center text-4xl sm:text-5xl pulse-glow relative">
              <span className="animate-float">{scenarioData.meta.icon}</span>
              {/* Sparkle accents */}
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-[#f59e0b] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Animated Gradient Title */}
        <h1 className="text-2xl sm:text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">
          <span className="gradient-text-rainbow">{strings.welcome_title}</span>
        </h1>
        <p className="text-[#a78bca] text-sm sm:text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
          {strings.welcome_subtitle}
        </p>

        {/* API Key Input - Improved with visibility toggle and visible border */}
        <div className="mb-4 sm:mb-6 glass-card rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
              <Key className="w-3.5 h-3.5 text-[#8b5cf6]" />
            </div>
            <span className="text-xs font-medium text-white/70">AI 服务配置</span>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all duration-200"
            style={{
              background: "rgba(10, 14, 26, 0.5)",
              border: `1px solid ${apiKeyFocused ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.12)"}`,
              boxShadow: apiKeyFocused ? "0 0 12px rgba(139, 92, 246, 0.1)" : "none",
            }}
          >
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onFocus={() => setApiKeyFocused(true)}
              onBlur={() => setApiKeyFocused(false)}
              placeholder="输入你的 DeepSeek API Key（可选）"
              className="flex-1 bg-transparent text-sm text-white placeholder-[#6d5a8a] outline-none border-none min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title={showApiKey ? "隐藏 Key" : "显示 Key"}
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4 text-white/40 hover:text-white/70" />
              ) : (
                <Eye className="w-4 h-4 text-white/40 hover:text-white/70" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-[#6d5a8a] mt-2 text-left">
            🔑 不填则使用内置AI服务 · 你的Key仅存储在浏览器本地
          </p>
        </div>

        {/* Start Button with Animated Gradient */}
        <button
          onClick={startGame}
          className="btn-gradient w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] glow-accent-strong relative"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {strings.start_button}
            <Sparkles className="w-5 h-5" />
          </span>
        </button>

        {/* Meta info badges + rules trigger */}
        <div className="mt-4 sm:mt-6 text-xs text-[#6d5a8a]/70 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <span className="badge-gradient">📜 {scenarioData.meta.title}</span>
          <span className="badge-cyan">⏱ {scenarioData.meta.estimatedTime}</span>
          <span className="badge-gold">⚡ {scenarioData.meta.difficulty}</span>
          <button
            onClick={() => setShowRules(true)}
            className="badge-rules cursor-pointer hover:scale-105 transition-transform"
          >
            📖 游戏规则
          </button>
        </div>
      </div>

      {/* Rules Overlay */}
      {showRules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(10, 14, 26, 0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowRules(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar rounded-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(26, 16, 64, 0.9))",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.1), 0 25px 50px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 flex items-center justify-between px-5 py-4 z-10"
              style={{
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(26, 16, 64, 0.95))",
                borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(139, 92, 246, 0.15)" }}
                >
                  <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <span className="text-base font-bold gradient-text">游戏规则</span>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3 text-left">
              {ruleItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                  style={{
                    background: "rgba(139, 92, 246, 0.03)",
                    border: "1px solid rgba(139, 92, 246, 0.06)",
                  }}
                >
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                    <p className="text-[#a78bca] text-[13px] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div
                className="mt-4 pt-3"
                style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}
              >
                <p className="text-[11px] text-[#6d5a8a]">
                  ⚖️ 评分维度：角色设定 · 约束清晰度 · 信息完整度 · 迭代深度 · 逻辑严谨性
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
