import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { conversation, taskTitle, taskChallenge, decisionAnswer, apiKey, existingOptions } = await request.json();

    // Build prompt asking AI to generate decision options based on the conversation
    const systemPrompt = `你是一位商业决策游戏设计师。玩家刚刚完成了一个商业决策任务，并与AI进行了深入对话。

任务：${taskTitle}
核心挑战：${taskChallenge}
玩家的决策结论：${decisionAnswer || "未明确提交"}

请基于玩家与AI的对话内容，为玩家生成3个不同的后续行动方案。这些方案应该：

1. **与对话内容高度相关** - 基于玩家在对话中表现出的倾向和分析
2. **各有优劣** - 没有绝对正确的选择，每个方案都有利弊
3. **影响不同** - 选择不同方案会导致不同的经营走向
4. **真实可信** - 符合小本经营的真实商业场景

参考方案框架（请根据对话内容调整和丰富）：
${existingOptions || "无参考"}

请用JSON格式返回3个方案，格式如下：
\`\`\`json
[
  {
    "id": "opt_a",
    "title": "方案标题（2-6字）",
    "description": "方案描述（30-60字，说明这个方案的核心做法，不要透露结果）",
    "consequence": "选择后果（50-100字，描述选择后的具体影响和故事发展）",
    "scoreModifier": 数字（-3到+3的整数，对AI决策力评分的影响），
    "revenueModifier": 数字（对模拟营收的影响，单位元，范围-10000到+10000），
    "coinModifier": 数字（-2到+2的整数，对决策币的影响），
    "traitChanges": [
      { "trait": "riskAppetite|dataDependency|collaborationTendency|innovationLevel", "direction": 数字（-10到+10）, "reason": "原因说明" }
    ]
  }
]
\`\`\`

注意：
- scoreModifier 三个方案的总和应该接近0（有升有降）
- revenueModifier 要符合真实经营场景的金额范围
- consequence 要有故事感，让玩家感受到选择的重量
- 描述中不要透露具体数值和后果，让玩家在选择后才发现
- traitChanges 反映选择对决策风格的影响，每个方案1-2个特征变化`;

    const apiMessages = [
      { role: "assistant" as const, content: systemPrompt },
      { role: "user" as const, content: "请根据对话内容生成3个决策方案。" },
    ];

    let reply: string;

    if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          max_tokens: 2048,
        }),
      });
      if (!response.ok) {
        return NextResponse.json({ error: `API错误 (${response.status})` }, { status: 500 });
      }
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "";
    } else {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: apiMessages,
        thinking: { type: "disabled" },
        max_tokens: 2048,
      });
      reply = completion.choices[0]?.message?.content || "";
    }

    // Parse the JSON from the reply
    let options;
    try {
      // Try to extract JSON array from the response
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        options = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response as JSON
        const parsed = JSON.parse(reply);
        options = Array.isArray(parsed) ? parsed : parsed.options || [];
      }
    } catch {
      console.error("Failed to parse decision options:", reply);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Validate and normalize options
    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ error: "No valid options generated" }, { status: 500 });
    }

    const normalizedOptions = options.slice(0, 3).map((opt: Record<string, unknown>, i: number) => ({
      id: opt.id || `ai_opt_${String.fromCharCode(97 + i)}`,
      title: String(opt.title || `方案${String.fromCharCode(65 + i)}`),
      description: String(opt.description || "请选择此方案继续"),
      consequence: String(opt.consequence || "你做出了选择。"),
      scoreModifier: Number(opt.scoreModifier) || 0,
      revenueModifier: Number(opt.revenueModifier) || 0,
      coinModifier: Number(opt.coinModifier) || 0,
      traitChanges: Array.isArray(opt.traitChanges) ? opt.traitChanges : [],
    }));

    return NextResponse.json({ options: normalizedOptions });
  } catch (error) {
    console.error("Decision options API error:", error);
    return NextResponse.json({ error: "Failed to generate decision options" }, { status: 500 });
  }
}
