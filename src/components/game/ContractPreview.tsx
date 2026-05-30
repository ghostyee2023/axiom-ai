"use client";

import { useGameStore } from "@/store/gameStore";
import type { ContractData } from "@/data/scenario";
import {
  ScrollText,
  X,
  Copy,
  Check,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Star,
} from "lucide-react";
import { useState, useCallback } from "react";

/** Contract type badge config */
const typeConfig: Record<
  ContractData["type"],
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  supply: {
    label: "供货合同",
    color: "#22d3ee",
    bgColor: "rgba(6, 182, 212, 0.1)",
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  partnership: {
    label: "合伙协议",
    color: "#a78bfa",
    bgColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  loan: {
    label: "借贷合同",
    color: "#fbbf24",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.25)",
  },
  lease: {
    label: "租赁合同",
    color: "#34d399",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  employment: {
    label: "劳动合同",
    color: "#f472b6",
    bgColor: "rgba(244, 114, 182, 0.1)",
    borderColor: "rgba(244, 114, 182, 0.25)",
  },
};

/** Generate plain text from contract data for copying */
function contractToText(contract: ContractData): string {
  const tc = typeConfig[contract.type];
  let text = `${tc.label}：${contract.title}\n`;
  text += `${"=".repeat(30)}\n\n`;
  text += `甲方：${contract.parties.partyA}\n`;
  text += `乙方：${contract.parties.partyB}\n\n`;

  text += `【主要条款】\n`;
  contract.terms.forEach((t, i) => {
    text += `${i + 1}. ${t}\n`;
  });
  text += `\n`;

  text += `【财务条款】\n`;
  text += `金额：${contract.financials.amount}\n`;
  text += `付款方式：${contract.financials.paymentTerms}\n`;
  text += `期限：${contract.financials.duration}\n\n`;

  text += `【风险条款】\n`;
  contract.risks.forEach((r, i) => {
    text += `${i + 1}. ${r}\n`;
  });

  if (contract.specialConditions && contract.specialConditions.length > 0) {
    text += `\n【特别约定】\n`;
    contract.specialConditions.forEach((s, i) => {
      text += `${i + 1}. ${s}\n`;
    });
  }

  return text;
}

/** Compact button to show in TaskPanel */
export function ContractPreviewButton() {
  const currentTask = useGameStore((s) => s.currentTask);
  const setContractVisible = useGameStore((s) => s.setContractVisible);

  if (!currentTask || currentTask.type !== "main") return null;
  const contract = (currentTask as Record<string, unknown>).contract as
    | ContractData
    | undefined;
  if (!contract) return null;

  return (
    <button
      onClick={() => setContractVisible(true)}
      className="w-full rounded-lg px-3 py-2.5 flex items-center gap-2 text-xs font-medium transition-all duration-300 animate-task-card-enter relative overflow-hidden"
      style={{
        animationDelay: "150ms",
        background:
          "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.04))",
        border: "1px solid rgba(139, 92, 246, 0.15)",
        color: "#c4b5fd",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))";
        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
        e.currentTarget.style.boxShadow =
          "0 0 15px rgba(139, 92, 246, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.04))";
        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.15)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{
          background: "linear-gradient(180deg, #8b5cf6, #06b6d4)",
        }}
      />
      <ScrollText className="w-3.5 h-3.5 text-violet-400" />
      <span>查看合同：{contract.title}</span>
    </button>
  );
}

/** Full-screen contract overlay */
export default function ContractPreview() {
  const contractVisible = useGameStore((s) => s.contractVisible);
  const setContractVisible = useGameStore((s) => s.setContractVisible);
  const currentTask = useGameStore((s) => s.currentTask);
  const [copied, setCopied] = useState(false);

  const contract =
    currentTask?.type === "main"
      ? ((currentTask as Record<string, unknown>).contract as
          | ContractData
          | undefined)
      : undefined;

  const handleCopy = useCallback(async () => {
    if (!contract) return;
    try {
      await navigator.clipboard.writeText(contractToText(contract));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = contractToText(contract);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [contract]);

  if (!contractVisible || !contract) return null;

  const tc = typeConfig[contract.type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => setContractVisible(false)}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        style={{
          background: "linear-gradient(180deg, #1a1225 0%, #0d1117 50%, #0a0e1a 100%)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "0 0 40px rgba(139, 92, 246, 0.1), 0 0 80px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with paper texture effect */}
        <div
          className="relative px-6 pt-6 pb-4"
          style={{
            background: "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
          }}
        >
          {/* Decorative top line */}
          <div
            className="absolute top-0 left-6 right-6 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5), transparent)",
            }}
          />

          {/* Close button */}
          <button
            onClick={() => setContractVisible(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
            style={{
              color: "rgba(255, 255, 255, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Contract type badge */}
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold mb-3"
            style={{
              color: tc.color,
              background: tc.bgColor,
              border: `1px solid ${tc.borderColor}`,
            }}
          >
            <ScrollText className="w-3 h-3" />
            {tc.label}
          </div>

          {/* Contract title */}
          <h2 className="text-xl font-bold text-white tracking-wide">
            {contract.title}
          </h2>

          {/* Red seal stamp effect */}
          <div
            className="absolute top-6 right-14 w-16 h-16 rounded-full flex items-center justify-center opacity-20"
            style={{
              border: "3px solid #dc2626",
              color: "#dc2626",
              transform: "rotate(-15deg)",
            }}
          >
            <span className="text-xs font-bold">合同专用</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" style={{ maxHeight: "calc(85vh - 180px)" }}>
          {/* Parties section */}
          <ContractSection
            icon={Users}
            iconColor="#22d3ee"
            title="合同方"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(6, 182, 212, 0.1)",
                    color: "#22d3ee",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                  }}
                >
                  甲方
                </span>
                <span className="text-white/90 text-sm">{contract.parties.partyA}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    color: "#a78bfa",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  乙方
                </span>
                <span className="text-white/90 text-sm">{contract.parties.partyB}</span>
              </div>
            </div>
          </ContractSection>

          {/* Terms section */}
          <ContractSection
            icon={FileText}
            iconColor="#a78bfa"
            title="主要条款"
          >
            <ol className="space-y-1.5">
              {contract.terms.map((term, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/80">
                  <span className="text-violet-400/60 font-mono text-xs mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{term}</span>
                </li>
              ))}
            </ol>
          </ContractSection>

          {/* Financials section */}
          <ContractSection
            icon={DollarSign}
            iconColor="#fbbf24"
            title="财务条款"
          >
            <div className="space-y-2">
              <FinancialRow label="金额" value={contract.financials.amount} />
              <FinancialRow
                label="付款方式"
                value={contract.financials.paymentTerms}
              />
              <FinancialRow label="期限" value={contract.financials.duration} />
            </div>
          </ContractSection>

          {/* Risks section */}
          <ContractSection
            icon={AlertTriangle}
            iconColor="#ef4444"
            title="风险条款"
          >
            <ul className="space-y-1.5">
              {contract.risks.map((risk, i) => (
                <li key={i} className="flex gap-2 text-sm text-red-300/80">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-red-400/60" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </ContractSection>

          {/* Special conditions */}
          {contract.specialConditions &&
            contract.specialConditions.length > 0 && (
              <ContractSection
                icon={Star}
                iconColor="#f472b6"
                title="特别约定"
              >
                <ul className="space-y-1.5">
                  {contract.specialConditions.map((cond, i) => (
                    <li key={i} className="flex gap-2 text-sm text-pink-300/80">
                      <Star className="w-3 h-3 mt-0.5 shrink-0 text-pink-400/60" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </ContractSection>
            )}

          {/* Bottom seal area */}
          <div
            className="flex justify-between items-end pt-4 mt-4"
            style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.08)" }}
          >
            <div className="text-white/20 text-xs">
              <p>甲方签章：_______________</p>
              <p className="mt-2">日期：_______________</p>
            </div>
            {/* Red seal stamp */}
            <div
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center opacity-15"
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
            <div className="text-white/20 text-xs text-right">
              <p>乙方签章：_______________</p>
              <p className="mt-2">日期：_______________</p>
            </div>
          </div>
        </div>

        {/* Bottom bar with copy button */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{
            background: "rgba(10, 14, 26, 0.5)",
            borderTop: "1px solid rgba(139, 92, 246, 0.1)",
          }}
        >
          <span className="text-white/30 text-xs">
            复制合同内容可在AI对话中粘贴引用
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
            style={{
              background: copied
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(139, 92, 246, 0.1)",
              border: copied
                ? "1px solid rgba(16, 185, 129, 0.25)"
                : "1px solid rgba(139, 92, 246, 0.2)",
              color: copied ? "#6ee7b7" : "#c4b5fd",
            }}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                复制合同内容
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Section wrapper for contract content */
function ContractSection({
  icon: Icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4 relative overflow-hidden"
      style={{
        background: "rgba(10, 14, 26, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{
          background: `linear-gradient(180deg, ${iconColor}, ${iconColor}44)`,
        }}
      />
      <div className="flex items-center gap-1.5 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        <span className="text-xs font-semibold" style={{ color: iconColor }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Financial row in contract */
function FinancialRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <span
        className="shrink-0 text-xs font-medium px-2 py-0.5 rounded"
        style={{
          background: "rgba(245, 158, 11, 0.08)",
          color: "#fbbf24",
          border: "1px solid rgba(245, 158, 11, 0.15)",
        }}
      >
        {label}
      </span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}
