"use client";

import { scenarioData } from "@/data/scenario";
import { APP_CHANGELOG, APP_VERSION } from "@/lib/version";
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
  RotateCcw,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

export default function WelcomePage() {
  const startGame = useGameStore((s) => s.startGame);
  const loadSavedGame = useGameStore((s) => s.loadSavedGame);
  const clearSavedGame = useGameStore((s) => s.clearSavedGame);
  const apiKey = useGameStore((s) => s.apiKey);
  const setApiKey = useGameStore((s) => s.setApiKey);
  const [showRules, setShowRules] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
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
  const hasSave = useSyncExternalStore(
    () => () => {},
    () => Boolean(window.localStorage.getItem("axiom-ai-game-save-v1")),
    () => false
  );

  const particleCount = isClient && window.innerWidth < 640 ? 10 : 22;
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        opacity: Math.random() * 0.4 + 0.16,
        animationDuration: `${Math.random() * 10 + 9}s`,
        animationDelay: `${Math.random() * 8}s`,
        color:
          i % 5 === 0
            ? "rgba(245, 158, 11, 0.52)"
            : i % 5 === 1
              ? "rgba(6, 182, 212, 0.52)"
              : "rgba(139, 92, 246, 0.42)",
      })),
    [particleCount]
  );

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
              left: p.left,
              width: p.width,
              height: p.height,
              background: p.color,
              opacity: p.opacity,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          {hasSave && (
            <button
              onClick={() => loadSavedGame()}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative"
              style={{
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                boxShadow: "0 0 30px rgba(16,185,129,0.16)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" />
                继续上次游戏
              </span>
            </button>
          )}

          {/* Start Button with Animated Gradient */}
          <button
            onClick={() => {
              clearSavedGame();
              startGame();
            }}
            className="btn-gradient w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] glow-accent-strong relative"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {hasSave ? "开始新游戏" : strings.start_button}
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </div>

        <div className="mt-4 sm:mt-6 text-xs text-[#6d5a8a]/70 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <button
            onClick={() => setShowApiConfig(true)}
            className="badge-cyan cursor-pointer hover:scale-105 transition-transform inline-flex items-center gap-1.5"
          >
            <Key className="w-3 h-3" />
            API 配置
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="badge-rules cursor-pointer hover:scale-105 transition-transform"
          >
            📖 游戏规则
          </button>
        </div>
      </div>

      {showApiConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(10, 14, 26, 0.78)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowApiConfig(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden text-left animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(26, 16, 64, 0.94))",
              border: "1px solid rgba(139, 92, 246, 0.22)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.46)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
                  <Key className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">API 配置</div>
                  <div className="text-[11px] text-white/38">可选，不填则使用内置 AI 服务</div>
                </div>
              </div>
              <button
                onClick={() => setShowApiConfig(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="px-5 py-4">
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
                  placeholder="输入 DeepSeek API Key"
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
              <p className="text-[11px] text-[#6d5a8a] mt-2">
                你的 Key 仅存储在当前浏览器本地。
              </p>
              <button
                onClick={() => setShowApiConfig(false)}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white btn-gradient"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showChangelog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 animate-fade-in"
          style={{ background: "rgba(10, 14, 26, 0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowChangelog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden text-left animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(20, 28, 44, 0.98), rgba(22, 18, 48, 0.96))",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="text-sm font-bold text-white">更新记录</div>
                <div className="text-[11px] text-white/35">当前版本 {APP_VERSION}</div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/55" />
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto custom-scrollbar px-4 py-3 space-y-4">
              {APP_CHANGELOG.map((entry) => (
                <section key={entry.version}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold text-cyan-200">{entry.version}</h3>
                    <span className="text-[10px] text-white/30">{entry.date}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/65">{entry.title}</p>
                  <ul className="mt-2 space-y-1.5">
                    {entry.changes.map((change) => (
                      <li key={change} className="flex gap-2 text-[12px] leading-relaxed text-white/50">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowChangelog(true)}
        className="fixed bottom-2 right-3 z-10 text-[10px] tracking-wide text-white/40 hover:text-white/70 transition-colors"
        title="查看更新记录"
      >
        Version {APP_VERSION}
      </button>
    </div>
  );
}
