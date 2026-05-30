import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

function fallbackOptions(taskTitle: string) {
  return [
    {
      id: "fallback_focus",
      title: "稳住基本盘",
      description: "先选择低风险动作，控制现金消耗，把问题拆成可执行的小步骤。",
      consequence: `你没有急着扩大战线，而是围绕「${taskTitle || "当前任务"}」先稳住最关键的经营指标。短期增长有限，但局面更可控。`,
      scoreModifier: 0,
      revenueModifier: 800,
      coinModifier: 1,
      traitChanges: [{ trait: "dataDependency", direction: 4, reason: "选择稳健验证" }],
    },
    {
      id: "fallback_growth",
      title: "主动进攻",
      description: "选择更积极的方案，投入资源换取更明显的经营变化。",
      consequence: "你把资源集中投向增长机会。动作更冒险，但也让后续故事出现更强的分化。",
      scoreModifier: 2,
      revenueModifier: -1200,
      coinModifier: -1,
      traitChanges: [{ trait: "riskAppetite", direction: 6, reason: "选择主动进攻" }],
    },
    {
      id: "fallback_relation",
      title: "借力关系",
      description: "优先调动社区、熟客或合作伙伴资源，用外部支持降低单打独斗压力。",
      consequence: "你开始把小店当成一个社区节点，而不是孤立的柜台。关系资源带来缓冲，也带来新的承诺。",
      scoreModifier: 1,
      revenueModifier: 500,
      coinModifier: 0,
      traitChanges: [{ trait: "collaborationTendency", direction: 6, reason: "借助外部协作" }],
    },
  ];
}

function insufficient(reason = "你还没有得出具体的行动方案，请继续和 AI 对话决策。") {
  return NextResponse.json({
    status: "insufficient",
    needsMoreDiscussion: true,
    reason,
    options: [],
  });
}

export async function POST(request: NextRequest) {
  try {
    const { conversation, taskTitle, taskChallenge, decisionAnswer, apiKey, existingOptions } = await request.json();
    const conversationText = Array.isArray(conversation)
      ? conversation
        .map((m: { role?: string; content?: string }, i: number) =>
          `${i + 1}. ${m.role === "assistant" ? "AI外援" : "玩家"}：${String(m.content || "").slice(0, 1200)}`
        )
        .join("\n")
      : "";

    // Build prompt asking AI to generate decision options based on the conversation
    const systemPrompt = `你是一位现实经营决策顾问。玩家刚刚围绕一个小本经营任务与 AI 外援进行了对话。

任务：${taskTitle}
核心挑战：${taskChallenge}
玩家的决策结论：${decisionAnswer || "未明确提交"}
玩家与 AI 外援的完整对话：
${conversationText || "暂无对话内容"}

请先判断：玩家与 AI 的对话是否已经形成了具体、可执行的行动方案。

如果还没有形成具体行动方案，或者只是泛泛讨论、信息不足、还在提问阶段，请不要生成方案卡。直接返回：
\`\`\`json
{
  "status": "insufficient",
  "reason": "你还没有得出具体的行动方案，请继续和 AI 对话决策。",
  "options": []
}
\`\`\`

如果已经形成行动方案，请生成1到3个后续行动方案。数量取决于对话实际情况：
- 只有一个明确执行方向，就只生成1张行动卡
- 有两个明显取舍，就生成2张
- 有三个真实可选路径，才生成3张

这些方案应该：

1. **与对话内容高度相关** - 必须继承玩家已经讨论过的信息、倾向、约束和结论
2. **各有优劣** - 没有绝对正确的选择，每个方案都有利弊
3. **影响不同** - 选择不同方案会导致不同的经营走向
4. **真实可信** - 符合小本经营的真实商业场景
5. **能延续到下一关** - consequence 必须说明这个选择会怎样改变下一步的经营前提，例如现金流、口碑、供应商关系、员工压力、库存压力、家庭压力等

参考方案框架（请根据对话内容调整和丰富）：
${existingOptions || "无参考"}

请用JSON格式返回，格式如下：
\`\`\`json
{
  "status": "ready",
  "options": [
    {
      "id": "opt_a",
      "title": "方案标题（2-6字）",
      "description": "方案描述（30-60字，说明这个方案的核心做法，不要透露结果）",
      "consequence": "选择后果（50-100字，描述选择后的具体经营影响）",
      "scoreModifier": 数字（-3到+3的整数，对AI决策力评分的影响），
      "revenueModifier": 数字（对模拟营收的影响，单位元，范围-10000到+10000），
      "coinModifier": 数字（-2到+2的整数，对决策币的影响），
      "traitChanges": [
        { "trait": "riskAppetite|dataDependency|collaborationTendency|innovationLevel", "direction": 数字（-10到+10）, "reason": "原因说明" }
      ]
    }
  ]
}
\`\`\`

注意：
- 不要为了凑满3张而编造方案
- 如果有多张卡，scoreModifier 总和应该接近0（有升有降）
- revenueModifier 要符合真实经营场景的金额范围
- consequence 要现实具体，说明经营影响；不要写成剧本、旁白、动作描写或人物台词
- 描述中不要透露具体数值和后果，让玩家在选择后才发现
- traitChanges 反映选择对决策风格的影响，每个方案1-2个特征变化
- 如果对话内容不足，必须返回 insufficient，不要硬生成方案`;

    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: "请根据上面的对话内容判断是否足以生成行动卡，只返回 JSON。" },
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
    let status = "ready";
    let reason = "";
    try {
      const objectMatch = reply.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        const parsed = JSON.parse(objectMatch[0]);
        status = parsed.status || "ready";
        reason = parsed.reason || "";
        options = Array.isArray(parsed) ? parsed : parsed.options || [];
      } else {
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          options = JSON.parse(jsonMatch[0]);
        } else {
          const parsed = JSON.parse(reply);
          status = parsed.status || "ready";
          reason = parsed.reason || "";
          options = Array.isArray(parsed) ? parsed : parsed.options || [];
        }
      }
    } catch {
      console.error("Failed to parse decision options:", reply);
      return insufficient("这次没有生成出可执行行动卡，请继续和 AI 对话后重试。");
    }

    if (status === "insufficient") {
      return insufficient(reason);
    }

    // Validate and normalize options
    if (!Array.isArray(options) || options.length === 0) {
      return insufficient(reason);
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

    return NextResponse.json({ status: "ready", options: normalizedOptions });
  } catch (error) {
    console.error("Decision options API error:", error);
    return NextResponse.json({ options: fallbackOptions("当前任务"), fallback: true });
  }
}
