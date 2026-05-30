"use client";

import { useGameStore } from "@/store/gameStore";
import { ChevronRight, Sparkles } from "lucide-react";

export default function NarrativeTransition() {
  const currentTransition = useGameStore((s) => s.currentTransition);
  const dismissTransition = useGameStore((s) => s.dismissTransition);

  if (!currentTransition) return null;
  const reveal = buildRevealCopy(currentTransition);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(26, 16, 64, 0.92))",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Atmospheric background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-violet-400/20 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/15 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-amber-400/15 rounded-full animate-float" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="max-w-lg w-full animate-fade-in-up relative z-10">
        <div className="game-card rounded-2xl p-5 sm:p-8 space-y-4 sm:space-y-6 glow-accent relative overflow-hidden">
          {/* Decorative shimmer */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />

          <div className="text-center space-y-3 relative">
            <div className="mx-auto w-10 h-10 rounded-2xl flex items-center justify-center bg-violet-400/10 border border-violet-300/18">
              <Sparkles className="w-5 h-5 text-violet-200 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-cyan-200/70 tracking-[0.22em]">下一幕</div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {reveal.title}
            </h2>
            <p className="text-white/58 text-sm sm:text-base leading-relaxed px-2">
              {currentTransition}
            </p>
            <div className="mx-auto w-20 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
          </div>

          {/* Continue button with gradient */}
          <div className="flex justify-center">
            <button
              onClick={dismissTransition}
              className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.2)",
              }}
            >
              揭开下一关
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildRevealCopy(text: string) {
  const pick = (items: string[]) => items[hashText(text) % items.length];

  if (/危机|投诉|涨价|竞争|连锁|断供|亏损|罚|压力|糟|下降/.test(text)) {
    return {
      title: pick([
        "糟糕，麻烦找上门了。",
        "不妙，压力开始加码。",
        "坏了，局面突然拧紧。",
        "诶？对手开始出牌了。",
        "糟糕，现金流要经受考验。",
      ]),
    };
  }
  if (/机会|增长|奖励|合作|转机|好评|口碑|回升|赚|增加/.test(text)) {
    return {
      title: pick([
        "太好了，转机冒出来了。",
        "咦？机会自己敲门了。",
        "漂亮，局面有了回弹。",
        "好消息，口子打开了。",
        "这一步，终于看见回报了。",
      ]),
    };
  }
  if (/上一|选择|决定|影响|后续/.test(text)) {
    return {
      title: pick([
        "诶？上一步开始发酵了。",
        "你刚才的选择，开始改写局面。",
        "后劲来了，这次选择不简单。",
        "局面变了，原因正是你上一手。",
        "看来，选择已经留下痕迹。",
      ]),
    };
  }
  if (/供应|房东|合同|租|付款|报价|条款/.test(text)) {
    return {
      title: pick([
        "等等，合同里有新变量。",
        "房东这边，又有动作了。",
        "供应链的账，开始算到你头上。",
        "条款一变，算盘也得重打。",
      ]),
    };
  }
  if (/顾客|会员|社区|邻居|口味|客流|投诉/.test(text)) {
    return {
      title: pick([
        "顾客的反应，比你想得更快。",
        "社区开始给出反馈了。",
        "人流变了，答案也变了。",
        "熟客的一句话，可能改写下一关。",
      ]),
    };
  }
  if (/现金|钱|营收|成本|预算|利润|亏/.test(text)) {
    return {
      title: pick([
        "账本翻开，现实很直接。",
        "钱开始说话了。",
        "现金流给了你一道新题。",
        "利润没有撒谎，下一步得谨慎。",
      ]),
    };
  }
  return {
    title: pick([
      "门帘一掀，新问题来了。",
      "下一幕开场，局面不太一样。",
      "等等，事情有了新走向。",
      "风向变了，你得重新判断。",
      "这家小店，又迎来一个岔路口。",
      "看起来，平静只是暂时的。",
    ]),
  };
}

function hashText(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}
