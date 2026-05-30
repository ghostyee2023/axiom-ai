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
        role: "assistant",
        content: judgePrompt,
      },
      {
        role: "user",
        content: "请评估该学员的表现，严格按照JSON格式输出评分结果。",
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

    // Try to parse JSON from the response
    let result;
    try {
      // Try to find JSON in the response
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // Fallback if JSON parsing fails
      result = {
        scores: {
          "角色设定": 5,
          "约束清晰": 5,
          "信息完整": 5,
          "迭代深度": 5,
          "逻辑严谨": 5,
        },
        total: 25,
        comment: "评分系统暂时异常，已提供默认评分。请重试获取准确评分。",
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
