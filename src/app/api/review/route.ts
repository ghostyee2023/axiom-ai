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

      reviewPrompt = `你是一位资深的商业决策教练。游戏已全部结束，请根据以下完整数据为学员生成一份详尽的最终复盘报告。

角色：${selectedRole?.name || "未知"}
最终总分：${totalScore ?? "未知"}分
已完成任务评分：${JSON.stringify(taskScores)}
完整决策历程：${decisionHistory?.join("\n") || "暂无"}
决策风格特征：${JSON.stringify(decisionTraits) || "暂无"}
决策风格变化轨迹：${traitHistoryText}

请生成一份全面的最终复盘报告，必须包含以下部分（使用markdown格式，每个部分用 ## 标题）：

## 🧭 决策旅程回顾
完整回顾整个决策旅程，从第一个任务到最后一个，梳理关键转折点和决策路径。指出每个重大决策的背景、选择和结果。

## 📊 综合业绩分析
分析整体表现：总分${totalScore ?? "未知"}分在各维度上的分布。哪些维度得分最高，哪些最低？与商业决策的最佳实践对比，差距在哪里？如果有收入/利润相关的数据，请进行营收分析。

## 🎯 决策模式分析
基于决策风格特征数据（风险偏好${decisionTraits?.riskAppetite ?? "?"}、数据依赖${decisionTraits?.dataDependency ?? "?"}、协作倾向${decisionTraits?.collaborationTendency ?? "?"}、创新水平${decisionTraits?.innovationLevel ?? "?"}），深入分析学员的决策模式。这些特征如何影响了最终结果？哪些模式帮助了决策，哪些阻碍了？

## 💡 AI提问反思
回顾AI在过程中提出的关键问题和引导，学员是否抓住了这些问题背后的商业洞察？错过了哪些深层意图？

## ✅ 优势与亮点
列出学员表现最好的3-4个方面，用具体任务事例支撑。

## ⚠️ 不足与风险
列出需要改进的2-3个方面，指出具体的风险点，并说明如果继续这种决策模式可能带来的商业后果。

## 🚀 进阶建议
给出4条具体的、可执行的改进建议，每条建议要包含：1）改什么 2）怎么改 3）改后预期效果。

## 🏷️ 决策风格标签
给学员一个2-4字的决策风格称号（如"数据驱动型"、"谨慎保守型"、"大胆创新型"、"平衡稳健型"等），并用2-3句话说明为什么给出这个标签，基于哪些具体表现。`;
    } else {
      // Mid-game review prompt (original)
      reviewPrompt = `你是一位资深的商业决策教练。现在游戏进行到中场/终点结算，请根据以下数据为学员生成一份详细的复盘报告。

角色：${selectedRole?.name || "未知"}
已完成任务评分：${JSON.stringify(taskScores)}
决策历程：${decisionHistory?.join("\n") || "暂无"}
决策风格特征：${JSON.stringify(decisionTraits) || "暂无"}

请生成一份复盘报告，包含以下部分（使用markdown格式）：

## 📊 决策回顾
简要回顾每个关键决策，指出亮点和不足。

## 🧠 商业洞察
从商业角度总结学员学到了什么决策能力，哪些商业规律被理解了。

## 🎯 AI提问反思
分析AI在过程中提出的关键问题，学员是否抓住了这些问题背后的意图。

## 💪 优势与不足
- 优势：列出学员表现最好的2-3个方面
- 不足：列出需要改进的2-3个方面

## 🚀 进阶建议
给出3条具体的、可执行的改进建议。

## 🏷️ 决策风格标签
给学员一个2-4字的决策风格称号（如"数据驱动型"、"谨慎保守型"、"大胆创新型"等），并简要说明理由。`;
    }

    const apiMessages = [
      { role: "assistant" as const, content: reviewPrompt },
      { role: "user" as const, content: isFinal ? "请生成最终完整复盘报告。" : "请生成复盘报告。" },
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
