import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, apiKey } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages is required and must be an array" },
        { status: 400 }
      );
    }

    // Build message list with system prompt
    const apiMessages = [
      { role: "system" as const, content: systemPrompt || "你是一位专业的AI经营顾问，帮助用户进行商业决策分析。请直接给建议，不要写剧本、旁白或动作描写。" },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" as const : "user" as const,
        content: m.content,
      })),
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
        console.error("DeepSeek API error:", response.status, errText);
        return NextResponse.json(
          { error: `DeepSeek API错误 (${response.status}): ${errText.slice(0, 200)}`, reply: `抱歉，AI服务返回错误 (${response.status})，请检查API Key是否正确。` },
          { status: 500 }
        );
      }

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "抱歉，我暂时无法回答。";
    } else {
      // Use z-ai-web-dev-sdk as fallback
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: apiMessages,
        thinking: { type: "disabled" },
        max_tokens: 2048,
      });
      reply = completion.choices[0]?.message?.content || "抱歉，我暂时无法回答。";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", reply: "抱歉，AI暂时无法响应，请稍后再试。" },
      { status: 500 }
    );
  }
}
