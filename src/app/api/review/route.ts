import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { taskScores, decisionHistory, selectedRole, decisionTraits, apiKey, isFinal, totalScore, traitHistory } = await request.json();

    let reviewPrompt: string;

    if (isFinal) {
      // Comprehensive final report prompt
      const traitHistoryText = traitHistory?.length > 0
        ? traitHistory.map((t: { trait: string; direction: number; reason: string }) =>
            `${t.trait}${t.direction > 0 ? "↑" : "↓"}：${t.reason}`
          ).join("；")
        : "暂无";

      reviewPrompt = `你是一位资深的商业决策教练。游戏已全部结束，请根据以下完整数据为学员生成一份适合演示稿展示的最终复盘报告。

角色：${selectedRole?.name || "未知"}
最终总分：${totalScore ?? "未知"}分
已完成任务评分：${JSON.stringify(taskScores)}
完整决策历程：${decisionHistory?.join("\n") || "暂无"}
决策风格特征：${JSON.stringify(decisionTraits) || "暂无"}
决策风格变化轨迹：${traitHistoryText}

请生成一份“PPT式复盘报告”，必须高度精简，不要堆砌原始文字。使用 markdown，每个 ## 是一页幻灯片。每页只保留 1 句结论 + 2-4 个要点。禁止长段落，禁止逐条复述完整决策历程。不要写“这是为您生成的PPT式报告”这类开场白。

分数口径必须使用“最终总分：${totalScore ?? "未知"}分”，禁止自造 /100、/400 或其他满分口径。

## 🧭 决策旅程回顾
用 1 句话概括整体路径，再列 2-3 个关键转折点。

## 📊 综合业绩分析
只呈现最终总分、最强维度、最弱维度、最关键营收判断。不要写满分口径。

## 🎯 决策模式分析
基于风险偏好${decisionTraits?.riskAppetite ?? "?"}、数据依赖${decisionTraits?.dataDependency ?? "?"}、协作倾向${decisionTraits?.collaborationTendency ?? "?"}、创新水平${decisionTraits?.innovationLevel ?? "?"}，总结一个核心模式。

## 💡 AI提问反思
只写 2-3 个 AI 决策力上的关键提醒。

## ✅ 优势与亮点
列 2-3 个优势，每个不超过 18 字。

## ⚠️ 不足与风险
列 2-3 个风险，每个不超过 22 字。

## 🚀 进阶建议
给 3 条下一次可直接使用的 AI 对话动作。

## 🏷️ 决策风格标签
给学员一个2-4字的决策风格称号，并用 1 句话说明。`;
    } else {
      // Mid-game review prompt (original)
      reviewPrompt = `你是一位资深的商业决策教练。现在游戏进行到中场结算，请根据以下数据为学员生成一份适合演示稿展示的复盘报告。

角色：${selectedRole?.name || "未知"}
已完成任务评分：${JSON.stringify(taskScores)}
决策历程：${decisionHistory?.join("\n") || "暂无"}
决策风格特征：${JSON.stringify(decisionTraits) || "暂无"}

请生成一份“PPT式复盘报告”，必须高度精简。使用 markdown，每个 ## 是一页幻灯片。每页只保留 1 句结论 + 2-3 个要点。禁止长段落，禁止重新堆砌历史文字。

## 📊 决策回顾
一句话总结目前走向，列 2 个关键转折。

## 🧠 商业洞察
列 2-3 个已经体现出来的经营判断。

## 🎯 AI提问反思
列 2-3 个 AI 决策力提醒。

## 💪 优势与不足
- 优势：2条，每条不超过18字
- 不足：2条，每条不超过18字

## 🚀 进阶建议
给出3条下一关可直接使用的 AI 对话动作。

## 🏷️ 决策风格标签
给学员一个2-4字的决策风格称号，并用 1 句话说明理由。`;
    }

    const apiMessages = [
      { role: "system" as const, content: reviewPrompt },
      { role: "user" as const, content: isFinal ? "请生成最终PPT式复盘报告，务必精简。" : "请生成中场PPT式复盘报告，务必精简。" },
    ];

    let reply: string;

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
          max_tokens: isFinal ? 4096 : 2048,
        }),
      });
      if (!response.ok) {
        return NextResponse.json({ error: `API错误 (${response.status})` }, { status: 500 });
      }
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "报告生成失败。";
    } else {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: apiMessages,
        thinking: { type: "disabled" },
        max_tokens: isFinal ? 4096 : 2048,
      });
      reply = completion.choices[0]?.message?.content || "报告生成失败。";
    }

    return NextResponse.json({ report: reply });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
