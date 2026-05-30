"use client";

import { useGameStore } from "@/store/gameStore";
import { scenarioData } from "@/data/scenario";
import type { ShopItem } from "@/data/scenario";
import { X, Coins, Store, Sparkles, Check, Star } from "lucide-react";

export default function ShopDialog() {
  const closeShop = useGameStore((s) => s.closeShop);
  const buyItem = useGameStore((s) => s.buyItem);
  const decisionCoins = useGameStore((s) => s.decisionCoins);
  const inventory = useGameStore((s) => s.inventory);
  const continueAfterCheckpoint = useGameStore(
    (s) => s.continueAfterCheckpoint
  );

  const items = scenarioData.shop.items;
  const strings = scenarioData.strings;

  const canBuy = (item: ShopItem) => {
    if (decisionCoins < item.cost) return false;
    const existing = inventory.find((i) => i.shopItem.id === item.id);
    if (existing && existing.quantity >= item.limit) return false;
    return true;
  };

  const isOwned = (item: ShopItem) => {
    const existing = inventory.find((i) => i.shopItem.id === item.id);
    return existing && existing.quantity >= item.limit;
  };

  /** Map item effects to visual accent colors */
  const itemAccentColors: Record<string, string> = {
    skip_next_crisis: "#06b6d4",  // cyan - shield
    boost_score: "#8b5cf6",       // violet - wisdom
    double_dice: "#10b981",       // emerald - luck
    reroll_dice: "#f59e0b",       // amber - fortune
    special: "#ec4899",           // pink - unique
  };

  function getItemAccent(effect: string): string {
    return itemAccentColors[effect] || "#8b5cf6";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4">
      <div className="game-card rounded-2xl p-3 sm:p-5 max-w-md w-full space-y-3 sm:space-y-4 animate-fade-in-up max-h-[92vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="relative">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-sparkle" />
              <Sparkles className="w-2 h-2 text-amber-200 absolute -bottom-0.5 -left-0.5 animate-sparkle-delay" />
            </div>
            <h3 className="text-base sm:text-lg font-bold gradient-text-gold">
              {strings.shop_title}
            </h3>
          </div>
          <button
            onClick={closeShop}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current coins - prominent gold display */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/15">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <span className="text-xs sm:text-sm text-white/50">当前决策币</span>
          <span className="text-xl sm:text-2xl font-black gradient-text-gold">{decisionCoins}</span>
        </div>

        {/* Items as collectible cards */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const owned = inventory.find((i) => i.shopItem.id === item.id);
            const buyable = canBuy(item);
            const fullyOwned = isOwned(item);
            const accent = getItemAccent(item.effect);

            return (
              <div
                key={item.id}
                className={`relative rounded-xl p-3.5 overflow-hidden transition-all duration-200 hover:scale-[1.01] animate-fade-in-up ${
                  fullyOwned
                    ? "border border-emerald-500/20"
                    : "border border-white/5"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${accent}08, ${accent}03)`,
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                {/* Gradient border accent on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}44)` }}
                />

                {/* Shimmer overlay for collectible feel */}
                <div className="absolute inset-0 animate-shimmer rounded-xl pointer-events-none" />

                {/* Owned overlay checkmark */}
                {fullyOwned && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Item icon */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${accent}15` }}
                      >
                        <Star className="w-3.5 h-3.5" style={{ color: accent }} />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed pl-9">
                      {item.description}
                    </p>
                    {owned && !fullyOwned && (
                      <span className="text-xs text-cyan-400/80 mt-1 inline-block pl-9">
                        已拥有 ×{owned.quantity} / {item.limit}
                      </span>
                    )}
                    {fullyOwned && (
                      <span className="text-xs text-emerald-400/80 mt-1 inline-block pl-9">
                        已拥有 ×{owned.quantity}（已满）
                      </span>
                    )}
                  </div>

                  {/* Buy button with coin icon */}
                  <button
                    onClick={() => buyable && buyItem(item)}
                    disabled={!buyable}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      fullyOwned
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/60 cursor-default"
                        : buyable
                        ? "border"
                        : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    }`}
                    style={
                      buyable && !fullyOwned
                        ? {
                            background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                            borderColor: `${accent}30`,
                            color: accent,
                          }
                        : undefined
                    }
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {fullyOwned ? "已满" : item.cost}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={continueAfterCheckpoint}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
          }}
        >
          继续前进 →
        </button>
      </div>
    </div>
  );
}
