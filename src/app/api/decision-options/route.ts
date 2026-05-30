import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

function fallbackOptions(taskTitle: string, taskChallenge = "") {
  const context = `${taskTitle} ${taskChallenge}`;
  if (/合同|合作|供应商|采购|条款|谈判/.test(context)) {
    return [
      {
        id: "fallback_contract_review",
        title: "审条款",
        description: "先核对付款、违约、退换和责任边界，列出必须修改的合同条件。",
        consequence: `你围绕「${taskTitle || "当前任务"}」先把合作边界说清楚。推进速度变慢，但隐藏成本和责任风险被提前暴露。`,
        scoreModifier: 2,
        revenueModifier: 300,
        coinModifier: 0,
        traitChanges: [{ trait: "dataDependency", direction: 5, reason: "先核清合同条件" }],
      },
      {
        id: "fallback_contract_trial",
        title: "先试跑",
        description: "不直接签长期承诺，先设计短周期试运行，用结果再决定是否扩大合作。",
        consequence: "你用试运行替代一次性承诺。短期收益有限，但下一关会多一组真实反馈数据可用。",
        scoreModifier: 1,
        revenueModifier: -500,
        coinModifier: 1,
        traitChanges: [{ trait: "riskAppetite", direction: -3, reason: "用试运行降低合作风险" }],
      },
      {
        id: "fallback_contract_push",
        title: "抢窗口",
        description: "接受核心条件，优先拿到资源或低价窗口，同时设置止损点和复盘日期。",
        consequence: "你选择抢先进入合作窗口。资源到手更快，但后续现金流和履约压力也会更明显。",
        scoreModifier: 0,
        revenueModifier: 1200,
        coinModifier: -1,
        traitChanges: [{ trait: "riskAppetite", direction: 6, reason: "接受更高合作不确定性" }],
      },
    ];
  }

  if (/营销|客流|竞争|会员|活动|曝光|定价|爆款|口碑/.test(context)) {
    return [
      {
        id: "fallback_marketing_focus",
        title: "抓熟客",
        description: "先面向高频顾客设计活动，用复购、到店次数和客单价验证效果。",
        consequence: "你没有盲目拉新，而是先稳住最容易回来的顾客。口碑更稳，但增长速度不会立刻爆发。",
        scoreModifier: 1,
        revenueModifier: 800,
        coinModifier: 0,
        traitChanges: [{ trait: "collaborationTendency", direction: 4, reason: "利用熟客关系做验证" }],
      },
      {
        id: "fallback_marketing_test",
        title: "小促销",
        description: "选一个品类做低成本测试，限定时间和预算，用成交数据判断是否继续。",
        consequence: "你用小预算换来了真实市场反馈。结果会影响下一关的库存压力和现金安排。",
        scoreModifier: 2,
        revenueModifier: -400,
        coinModifier: -1,
        traitChanges: [{ trait: "dataDependency", direction: 5, reason: "用数据验证营销动作" }],
      },
      {
        id: "fallback_marketing_story",
        title: "讲差异",
        description: "把店铺优势整理成一句话卖点，并同步到门店、社群和顾客沟通中。",
        consequence: "你开始用清晰卖点替代零散解释。顾客更容易记住你，但需要持续兑现承诺。",
        scoreModifier: 0,
        revenueModifier: 500,
        coinModifier: 1,
        traitChanges: [{ trait: "innovationLevel", direction: 4, reason: "尝试差异化表达" }],
      },
    ];
  }

  if (/扩张|资金|现金|回本|投资|补贴|借款|预算|实施计划|最终/.test(context)) {
    return [
      {
        id: "fallback_finance_guard",
        title: "守现金",
        description: "先设现金安全线，只批准必要支出，把回本周期作为继续推进的门槛。",
        consequence: `你围绕「${taskTitle || "当前任务"}」先守住现金流。增长变慢，但经营容错率提高。`,
        scoreModifier: 1,
        revenueModifier: 700,
        coinModifier: 1,
        traitChanges: [{ trait: "riskAppetite", direction: -4, reason: "优先保护现金流" }],
      },
      {
        id: "fallback_finance_stage",
        title: "分阶段",
        description: "把投入拆成两到三阶段，每阶段绑定里程碑、预算上限和退出条件。",
        consequence: "你把大决策拆成连续小决策。下一关会更依赖执行节奏和复盘结果。",
        scoreModifier: 2,
        revenueModifier: -600,
        coinModifier: 0,
        traitChanges: [{ trait: "dataDependency", direction: 5, reason: "用阶段指标管理投入" }],
      },
      {
        id: "fallback_finance_attack",
        title: "抢增长",
        description: "集中资源押注最有回报的增长点，同时提前准备资金缺口的补救方案。",
        consequence: "你选择用压力换增长。短期局面更刺激，但后续会出现更强的资金和执行考验。",
        scoreModifier: 0,
        revenueModifier: 1800,
        coinModifier: -1,
        traitChanges: [{ trait: "riskAppetite", direction: 7, reason: "主动承担增长风险" }],
      },
    ];
  }

  return [
    {
      id: "fallback_focus",
      title: "控现金",
      description: "只做必要支出，保留周转现金，先保障现有业务不断档。",
      consequence: `你没有急着扩大战线，而是围绕「${taskTitle || "当前任务"}」先稳住最关键的经营指标。短期增长有限，但局面更可控。`,
      scoreModifier: 0,
      revenueModifier: 800,
      coinModifier: 1,
      traitChanges: [{ trait: "dataDependency", direction: 4, reason: "选择稳健验证" }],
    },
    {
      id: "fallback_growth",
      title: "集中投入",
      description: "选择一个最有把握的增长点投入，先用一轮结果验证方向。",
      consequence: "你把资源集中投向增长机会。动作更冒险，但也让后续故事出现更强的分化。",
      scoreModifier: 2,
      revenueModifier: -1200,
      coinModifier: -1,
      traitChanges: [{ trait: "riskAppetite", direction: 6, reason: "选择主动进攻" }],
    },
    {
      id: "fallback_relation",
      title: "借外力",
      description: "联系社区、熟客或合作方，争取场地、客流或人手支持。",
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

function getLastAssistantContent(conversation: unknown) {
  if (!Array.isArray(conversation)) return "";
  const lastAssistant = [...conversation]
    .reverse()
    .find((m: { role?: string; content?: string }) => m.role === "assistant" && String(m.content || "").trim());
  return String((lastAssistant as { content?: string } | undefined)?.content || "");
}

function hasActionableAdvice(text: string) {
  const normalized = text.replace(/\s+/g, "");
  if (normalized.length < 80) return false;
  const actionSignals = [
    "行动建议",
    "下一步",
    "核心建议",
    "建议你",
    "先别",
    "先做",
    "可以先",
    "方案",
    "执行",
    "谈判",
    "调研",
    "预算",
    "合同",
    "开张",
  ];
  return actionSignals.some((signal) => normalized.includes(signal));
}

function adviceFallbackOptions(taskTitle: string, adviceText: string) {
  const candidates = adviceText
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:\d+[\.\、]|[-*])\s*/, "").replace(/[*"“”]/g, "").trim())
    .filter((line) => line.length >= 18 && /(先|不要|不|谈|调研|预算|合同|开张|执行|方案|建议|可以)/.test(line))
    .slice(0, 3);

  if (candidates.length === 0) return fallbackOptions(taskTitle);

  return candidates.map((line, index) => {
    const summary = summarizeAdviceLine(line, index);
    return {
      id: `advice_opt_${index + 1}`,
      title: summary.title,
      description: summary.description,
      consequence:
        index === 0
          ? "你选择先控制风险，把经营动作压到现金流能承受的范围内。短期扩张变慢，但局面更稳。"
          : index === 1
            ? "你选择用低成本方式验证市场，先拿到真实反馈再扩大投入。结果会影响下一关的资源压力。"
            : "你选择先补齐业务信息，再做承诺。决策速度变慢，但后续方案会更贴近真实经营条件。",
      scoreModifier: index === 0 ? 1 : index === 1 ? 0 : 2,
      revenueModifier: index === 0 ? 500 : index === 1 ? -600 : 300,
      coinModifier: index === 2 ? 1 : 0,
      traitChanges: [
        {
          trait: index === 1 ? "riskAppetite" : "dataDependency",
          direction: index === 1 ? 3 : 5,
          reason: "基于 AI 外援行动建议生成",
        },
      ],
    };
  });
}

function summarizeAdviceLine(line: string, index: number) {
  const text = line.replace(/[“”"]/g, "").replace(/\s+/g, "");
  const rules = [
    {
      test: /先别|不签|不要.*签|暂缓.*合同|别.*合同/,
      title: "暂缓签约",
      description: "先不签高投入合同，保留现金流，等关键条件确认后再谈。",
    },
    {
      test: /房东|转让费|分.*付|谈|议价|租金/,
      title: "谈判降压",
      description: "和房东谈转让费分期，压低首期现金压力，保留试错空间。",
    },
    {
      test: /隔壁|代收|快递|不装修|不添置|现有员工|低投入/,
      title: "低成本试点",
      description: "不装修、不添设备，用现有空间和员工测试快递代收需求。",
    },
    {
      test: /调研|菜鸟|社区|取快递|问题|清单|问卷/,
      title: "先做调研",
      description: "先问菜鸟驿站、社区和顾客，核实取件量与合作条件。",
    },
    {
      test: /预算|算算|投入|多少钱|现金|资金/,
      title: "测算现金",
      description: "列出启动成本、月租、人力缺口，判断现金能撑多久。",
    },
    {
      test: /合同|条款|风险|条件/,
      title: "核清条款",
      description: "核对付款、违约和场地使用条款，先排除隐藏成本。",
    },
    {
      test: /开张|上线|执行|步骤|落地/,
      title: "拆步执行",
      description: "把方案拆成今日动作、负责人和反馈指标，先跑第一轮。",
    },
  ];

  const matched = rules.find((rule) => rule.test.test(text));
  if (matched) return matched;

  const fallbackTitles = ["稳健推进", "小步验证", "补齐信息"];
  const fallbackDescriptions = [
    "选择低投入动作，控制单次成本，避免现金流被一次性压垮。",
    "先做小范围试点，验证客户需求和执行成本，再决定是否扩大。",
    "补齐成本、客户、合同三类信息，再让 AI 重新比较方案。",
  ];
  return {
    title: fallbackTitles[index] || `行动${index + 1}`,
    description: fallbackDescriptions[index] || "把当前建议收束成一个可执行动作。",
  };
}

export async function POST(request: NextRequest) {
  try {
    const { conversation, taskTitle, taskChallenge, decisionAnswer, apiKey, existingOptions } = await request.json();
    const lastAssistantContent = getLastAssistantContent(conversation);
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

请先判断：玩家与 AI 的对话是否已经形成了具体、可执行的行动方案。判断重点不是聊了多少，而是是否完成了 AI 决策训练闭环：
- 是否说明目标
- 是否补充业务事实
- 是否给出约束条件
- 是否让 AI 比较或追问
- 是否形成可执行动作和验证方式

如果还没有形成具体行动方案，或者只是泛泛讨论、信息不足、还在提问阶段，请不要生成方案卡。直接返回：
\`\`\`json
{
  "status": "insufficient",
  "reason": "你还没有得出具体的行动方案。请继续补充目标、业务事实、约束条件，或让 AI 反问你还缺什么。",
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
      "title": "方案标题（2-5字，动词+对象，如“谈租金”“控现金”“先试点”）",
      "description": "方案描述（28-56字，必须说清对象、动作、条件、产出；精炼但完整，不要直接复制对话原文，不要透露结果）",
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
- 标题和描述必须总结精炼，不要直接截取或复述 AI 对话原句
- 描述必须让玩家看懂“具体要做什么”，至少包含：对象 + 动作 + 限制/验证方式
- 禁止只有抽象词，例如“小步验证”“稳健推进”“补齐信息”；必须说明验证什么、补齐什么、怎么做
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

    const hasPlayerConclusion = typeof decisionAnswer === "string" && decisionAnswer.trim().length >= 10;
    const hasAssistantAdvice = hasActionableAdvice(lastAssistantContent);
    if (status === "insufficient" && !hasPlayerConclusion && !hasAssistantAdvice) {
      return insufficient(reason);
    }
    if (status === "insufficient" && (hasPlayerConclusion || hasAssistantAdvice)) {
      options = hasAssistantAdvice ? adviceFallbackOptions(taskTitle, lastAssistantContent) : fallbackOptions(taskTitle, taskChallenge);
    }

    // Validate and normalize options
    if ((!Array.isArray(options) || options.length === 0) && !hasPlayerConclusion && !hasAssistantAdvice) {
      return insufficient(reason);
    }
    if (!Array.isArray(options) || options.length === 0) {
      options = hasAssistantAdvice ? adviceFallbackOptions(taskTitle, lastAssistantContent) : fallbackOptions(taskTitle, taskChallenge);
    }

    const normalizedOptions = options.slice(0, 3).map((opt: Record<string, unknown>, i: number) => ({
      id: opt.id || `ai_opt_${String.fromCharCode(97 + i)}`,
      title: compactTitle(String(opt.title || `方案${String.fromCharCode(65 + i)}`)),
      description: compactDescription(String(opt.description || "选择低投入动作，控制单次风险。")),
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

function compactTitle(value: string) {
  const cleaned = value
    .replace(/[“”"《》]/g, "")
    .replace(/方案|策略|计划|选择|建议|行动/g, "")
    .replace(/[，。；：、\s]/g, "")
    .slice(0, 5);
  return cleaned || "控风险";
}

function compactDescription(value: string) {
  const cleaned = value
    .replace(/[“”"]/g, "")
    .replace(/^(建议|可以|考虑|优先)?/, "")
    .replace(/更好地|明显|综合考虑|合理安排/g, "")
    .replace(/\s+/g, "");
  const compacted = cleaned.length > 64 ? `${cleaned.slice(0, 64)}...` : cleaned;
  return compacted || "明确对象、动作、成本和验证方式。";
}
