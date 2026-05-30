import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { scenarioData } from "@/data/scenario";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { conversation, finalAnswer, card, apiKey } = await request.json();

    if (!conversation || !card) {
      return NextResponse.json(
        { error: "conversation and card are required" },
        { status: 400 }
      );
    }

    // Build judge prompt
    const judgePrompt = scenarioData.scoring.judgePrompt
      .replace("{cardTitle}", card.title || "")
      .replace("{cardTask}", card.task || "")
      .replace(
        "{conversation}",
        conversation
          .map((m: { role: string; content: string }) => `${m.role === "user" ? "学员" : "AI"}: ${m.content}`)
          .join("\n")
      )
      .replace("{finalAnswer}", finalAnswer || "（未提交）");

    const apiMessages = [
      {
        role: "system",
        content: judgePrompt,
      },
      {
        role: "user",
        content: "请评估该学员的表现。只输出一个合法 JSON 对象，不要使用 Markdown 代码块，不要输出解释文字。comment 字段必须用中文，并按“优秀：...”和“待改进：...”两段书写。",
      },
    ];

    let reply: string;

    // If custom API key provided, use DeepSeek API directly
    if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("DeepSeek Judge API error:", response.status, errText);
        return NextResponse.json(
          { error: `DeepSeek API错误 (${response.status})` },
          { status: 500 }
        );
      }

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "";
    } else {
      // Use z-ai-web-dev-sdk as fallback
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: apiMessages,
        thinking: { type: "disabled" },
        max_tokens: 2048,
      });
      reply = completion.choices[0]?.message?.content || "";
    }

    let result;
    try {
      result = parseJudgeJson(reply);
    } catch (error) {
      console.error("Judge JSON parse error:", error, reply.slice(0, 500));
      result = {
        scores: {
          "角色设定": 5,
          "约束清晰": 5,
          "信息完整": 5,
          "迭代深度": 5,
          "逻辑严谨": 5,
        },
        total: 25,
        comment: "优秀：你已经完成一次可结算的决策表达，本轮结果已按基础标准记录。\n\n待改进：下一次可以把目标、约束、行动步骤和验证指标说得更清楚。",
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Judge API error:", error);
    return NextResponse.json(
      { error: "Failed to judge submission" },
      { status: 500 }
    );
  }
}

function parseJudgeJson(reply: string) {
  const trimmed = reply
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const direct = tryParseJson(trimmed);
  if (direct) return normalizeJudgeResult(direct);

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  const parsed = tryParseJson(jsonMatch[0]);
  if (!parsed) throw new Error("Invalid JSON in response");
  return normalizeJudgeResult(parsed);
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeJudgeResult(result: Record<string, unknown>) {
  const scores = typeof result.scores === "object" && result.scores !== null
    ? result.scores as Record<string, number>
    : {};
  const normalizedScores = {
    "目标定义": clampScore(Number(scores["目标定义"] ?? scores["角色设定"] ?? 5)),
    "业务理解": clampScore(Number(scores["业务理解"] ?? scores["信息完整"] ?? 5)),
    "约束表达": clampScore(Number(scores["约束表达"] ?? scores["约束清晰"] ?? 5)),
    "追问迭代": clampScore(Number(scores["追问迭代"] ?? scores["迭代深度"] ?? 5)),
    "落地验证": clampScore(Number(scores["落地验证"] ?? scores["逻辑严谨"] ?? 5)),
  };
  const total = Object.values(normalizedScores).reduce((sum, value) => sum + value, 0);
  const comment = String(result.comment || "").trim();
  return {
    scores: normalizedScores,
    total,
    comment: ensureStructuredComment(comment),
  };
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}

function ensureStructuredComment(comment: string) {
  if (comment.includes("优秀") && comment.includes("待改进")) return comment;
  const cleaned = comment || "本轮表达已经形成可评估的决策，但还可以更清楚地说明执行步骤和约束条件。";
  return `优秀：${cleaned}\n\n待改进：下一次可以把目标、限制、行动步骤和验证方式说得更具体。`;
}
