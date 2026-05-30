"use client";

import { scenarioData } from "@/data/scenario";
import { useGameStore } from "@/store/gameStore";
import {
  Coins,
  Package,
  BookOpen,
  Sword,
  Shield,
  Star,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

/** Distinctive color palette per role */
const roleColors: Record<
  string,
  {
    accent: string;
    gradient: string;
    borderHover: string;
    bg: string;
    glowShadow: string;
    icon: React.ReactNode;
  }
> = {
  shop_owner: {
    accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    borderHover: "rgba(139, 92, 246, 0.5)",
    bg: "rgba(139, 92, 246, 0.08)",
    glowShadow: "0 0 25px rgba(139, 92, 246, 0.25), 0 0 50px rgba(139, 92, 246, 0.08)",
    icon: <Shield className="w-5 h-5" />,
  },
  laid_off: {
    accent: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    borderHover: "rgba(6, 182, 212, 0.5)",
    bg: "rgba(6, 182, 212, 0.08)",
    glowShadow: "0 0 25px rgba(6, 182, 212, 0.25), 0 0 50px rgba(6, 182, 212, 0.08)",
    icon: <Sword className="w-5 h-5" />,
  },
};

const defaultColor = roleColors.shop_owner;

export default function RoleSelection() {
  const selectRole = useGameStore((s) => s.selectRole);
  const strings = scenarioData.strings;
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-8 game-bg overflow-hidden relative">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div
          className="particle"
          style={{
            left: "15%",
            width: "2px",
            height: "2px",
            background: "rgba(139, 92, 246, 0.4)",
            animationDuration: "14s",
            animationDelay: "0s",
          }}
        />
        <div
          className="particle"
          style={{
            left: "40%",
            width: "3px",
            height: "3px",
            background: "rgba(6, 182, 212, 0.4)",
            animationDuration: "18s",
            animationDelay: "3s",
          }}
        />
        <div
          className="particle"
          style={{
            left: "65%",
            width: "2px",
            height: "2px",
            background: "rgba(245, 158, 11, 0.4)",
            animationDuration: "16s",
            animationDelay: "6s",
          }}
        />
        <div
          className="particle"
          style={{
            left: "85%",
            width: "2px",
            height: "2px",
            background: "rgba(139, 92, 246, 0.3)",
            animationDuration: "20s",
            animationDelay: "9s",
          }}
        />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8 animate-fade-in-up">
          <div className="divider-ornament mb-4">
            <Star className="w-4 h-4" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="gradient-text-primary">{strings.select_role_title}</span>
          </h2>
          <p className="text-[#a78bca] text-sm">
            不同角色有不同的故事线、任务和初始资源
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {scenarioData.roles.map((role, index) => {
            const colors = roleColors[role.id] || defaultColor;
            const isHovered = hoveredRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className="animate-hero-card-enter group relative text-left"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  transform: isHovered ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  boxShadow: isHovered ? colors.glowShadow : "none",
                  borderRadius: "1rem",
                }}
              >
                {/* Animated gradient border wrapper */}
                <div
                  className="rounded-2xl p-[1.5px]"
                  style={{
                    background: isHovered
                      ? colors.gradient
                      : `linear-gradient(135deg, ${colors.accent}44, transparent, ${colors.accent}44)`,
                    transition: "background 0.3s ease",
                  }}
                >
                  {/* Card body */}
                  <div
                    className="rounded-2xl p-5 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${colors.bg}, rgba(26, 16, 64, 0.5))`,
                    }}
                  >
                    {/* Hover glow overlay - subtle, no text wash-out */}
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(ellipse at center, ${colors.accent}08, transparent 70%)`,
                        opacity: isHovered ? 1 : 0,
                      }}
                    />

                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                      style={{
                        background: colors.gradient,
                      }}
                    />

                    <div className="relative z-10">
                      {/* Role Icon + Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300"
                          style={{
                            background: `${colors.accent}20`,
                            color: colors.accent,
                            transform: isHovered ? "scale(110%) rotate(3deg)" : "scale(100%)",
                          }}
                        >
                          {colors.icon}
                        </div>
                        <div>
                          <h3
                            className="text-lg font-bold"
                            style={{
                              backgroundImage: colors.gradient,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {role.name}
                          </h3>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 ml-auto transition-all duration-300"
                          style={{
                            color: colors.accent,
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? "translateX(4px)" : "translateX(0)",
                          }}
                        />
                      </div>

                      {/* Description */}
                      <p className="text-white/75 text-sm mb-4 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs mb-3">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            color: "#fbbf24",
                          }}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span className="font-semibold">决策币 × {role.startingResources.decisionCoins}</span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            color: "#c4b5fd",
                          }}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span className="font-semibold">道具栏 × {role.startingResources.maxItems}</span>
                        </div>
                      </div>

                      {/* Backstory */}
                      {role.backstory && (
                        <div
                          className="pt-3 mt-1"
                          style={{ borderTop: `1px solid ${colors.accent}15` }}
                        >
                          <div
                            className="flex items-center gap-1.5 text-xs mb-1.5"
                            style={{ color: `${colors.accent}99` }}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>背景故事</span>
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                            {role.backstory}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="text-center mt-8 text-xs text-[#6d5a8a] animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          选择你的角色，开启专属剧情线 🎭
        </div>
      </div>
    </div>
  );
}
