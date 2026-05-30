import { create } from "zustand";
import {
  scenarioData,
  type Role,
  type RouteStep,
  type EventCard,
  type CrisisCard,
  type OpportunityCard,
  type ShopItem,
  type DecisionOption,
} from "@/data/scenario";

export type GamePhase =
  | "welcome"
  | "roleSelect"
  | "playing"
  | "ending"
  | "transition"; // 新增：过渡动画阶段

export type PlaySubPhase =
  | "task"
  | "event"
  | "crisis"
  | "opportunity"
  | "checkpoint"
  | "scoring"
  | "shop";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TaskScore {
  taskId: string;
  title: string;
  scores: Record<string, number>;
  total: number;
  weightedTotal: number;
  comment: string;
}

export interface InventoryItem {
  shopItem: ShopItem;
  quantity: number;
}

export interface DiceResult {
  value: number;
  narrative: string;
  penalty: number;
}

export interface RevenueEntry {
  taskId: string;
  title: string;
  revenue: number;      // Revenue earned/lost this task (¥)
  cumulative: number;   // Running total (¥)
  reason: string;       // Brief reason
}

export type NumericChangeType = "score" | "coins" | "revenue" | "trait" | "item";

export interface NumericChangeEntry {
  id: string;
  type: NumericChangeType;
  label: string;
  delta: number;
  before: number;
  after: number;
  reason: string;
  source: string;
  createdAt: number;
}

export interface BranchContextEntry {
  id: string;
  sourceTaskId: string;
  sourceTitle: string;
  optionTitle: string;
  context: string;
  nextPressure: string;
  createdAt: number;
}

/** Player decision tendency traits (0-100, start at 50) */
export interface DecisionTraits {
  riskAppetite: number;
  dataDependency: number;
  collaborationTendency: number;
  innovationLevel: number;
}

/** A single entry in the trait change history log */
export interface TraitHistoryEntry {
  trait: keyof DecisionTraits;
  direction: number;
  reason: string;
}

export interface GameState {
  phase: GamePhase;
  subPhase: PlaySubPhase;

  selectedRole: Role | null;
  apiKey: string;
  decisionCoins: number;
  inventory: InventoryItem[];
  totalScore: number;
  taskScores: TaskScore[];

  currentStepIndex: number;
  chatMessages: ChatMessage[];

  currentTask: RouteStep | null;
  currentEvent: EventCard | null;

  diceResult: DiceResult | null;
  diceRolled: boolean;
  mitigated: boolean;
  skipNextCrisis: boolean;

  opportunityAccepted: boolean;

  currentScore: TaskScore | null;
  finalAnswer: string;

  rerollCount: number;

  expertRoleActive: boolean;
  expertRoleName: string;
  scoreBonus: number;

  doubleDiceActive: boolean;

  isChatLoading: boolean;
  chatWaitStage: "idle" | "connecting" | "thinking" | "slow" | "error";
  lastUserMessage: string | null;
  isJudging: boolean;
  isDiceRolling: boolean;

  // Narrative transition
  currentTransition: string | null;
  /** History of previous decisions, injected into AI context for continuity */
  decisionHistory: string[];

  // Hint & hidden data unlock tracking
  /** Array of task IDs whose hints (锦囊) have been unlocked */
  unlockedHints: string[];
  /** Array of task IDs whose hidden data has been unlocked */
  unlockedHiddenData: string[];

  // Decision traits
  decisionTraits: DecisionTraits;
  traitHistory: TraitHistoryEntry[];

  // Follow-up task (after accepting an opportunity)
  currentFollowUpTask: string | null;
  currentFollowUpData: string | null;

  // Decision option selection (card-based choice after scoring)
  /** Whether the decision option selection phase is active */
  decisionOptionPhase: boolean;
  settlementAfterOption: boolean;
  /** The decision option the player has selected */
  selectedDecisionOption: DecisionOption | null;
  /** AI-generated decision options (override hardcoded ones when available) */
  aiDecisionOptions: DecisionOption[] | null;
  /** Guidance shown when the conversation is not ready for action cards */
  decisionOptionsNotice: string | null;
  /** Number of assistant replies at the time action cards were last generated */
  decisionOptionsGeneratedAssistantCount: number;
  /** Whether AI is generating decision options */
  isDecisionOptionsLoading: boolean;
  /** Whether the consequence reveal animation is playing */
  consequenceRevealed: boolean;

  // Revenue simulation
  revenue: number;
  revenueHistory: RevenueEntry[];
  pendingRevenueEntry: RevenueEntry | null;
  /** Unified ledger of score, coin, revenue, trait, and item changes */
  numericChangeLog: NumericChangeEntry[];
  /** Story consequences from previous choices that affect later tasks */
  branchContexts: BranchContextEntry[];

  // Review report
  reviewReport: string | null;
  isReviewLoading: boolean;
  /** Track which checkpoint the review was generated for, to prevent re-generation */
  reviewedCheckpointId: string | null;
  finalReport: string | null;
  isFinalReportLoading: boolean;

  // Actions
  startGame: () => void;
  loadSavedGame: () => boolean;
  clearSavedGame: () => void;
  selectRole: (role: Role) => void;
  proceedToNextStep: () => void;
  sendChatMessage: (message: string) => Promise<void>;
  retryLastChatMessage: () => Promise<void>;
  submitTask: (finalAnswer: string) => Promise<void>;
  rerollTask: () => Promise<void>;
  rollDice: () => void;
  mitigateCrisis: () => void;
  acceptCrisisResult: () => void;
  acceptOpportunity: () => void;
  declineOpportunity: () => void;
  showShop: () => void;
  closeShop: () => void;
  buyItem: (item: ShopItem) => void;
  useItem: (itemId: string) => void;
  continueAfterScoring: () => void;
  continueAfterCheckpoint: () => void;
  dismissTransition: () => void;
  resetGame: () => void;
  setFinalAnswer: (answer: string) => void;
  setApiKey: (key: string) => void;

  // Hint & hidden data actions
  /** Unlock the strategy hint (锦囊) for the current task - costs decision coins */
  unlockHint: () => void;
  /** Unlock hidden data for the current task - costs decision coins */
  unlockHiddenData: () => void;

  // Decision trait actions
  /** Update a decision trait by a given direction and log the reason */
  updateDecisionTraits: (trait: keyof DecisionTraits, direction: number, reason: string) => void;

  // Follow-up task actions
  /** Complete the current follow-up task and proceed */
  completeFollowUpTask: () => void;

  // Decision option actions
  /** Show the decision option card selection overlay */
  showDecisionOptions: () => void;
  /** Select a decision option, apply its effects, and advance */
  selectDecisionOption: (option: DecisionOption) => void;
  /** Generate AI-based decision options from the conversation */
  generateDecisionOptions: () => Promise<void>;
  /** Set consequence revealed state */
  setConsequenceRevealed: (v: boolean) => void;

  // Review report actions
  generateReview: () => Promise<void>;
  clearReview: () => void;
  generateFinalReport: () => Promise<void>;
}

/** Default decision traits */
const defaultDecisionTraits: DecisionTraits = {
  riskAppetite: 50,
  dataDependency: 50,
  collaborationTendency: 50,
  innovationLevel: 50,
};

const LOCAL_SAVE_KEY = "axiom-ai-game-save-v1";
const API_KEY_STORAGE_KEY = "axiom-ai-api-key";

function readStoredApiKey() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

/** Clamp a value between 0 and 100 */
function clampTrait(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Get the route for the currently selected role */
function getCurrentRoute(roleId: string | null): RouteStep[] {
  if (!roleId) return scenarioData.routes.shop_owner;
  return scenarioData.routes[roleId] || scenarioData.routes.shop_owner;
}

function drawEventCard(trigger: {
  pool: string[];
  crisisWeight: number;
  opportunityWeight: number;
}): EventCard {
  const { pool, crisisWeight, opportunityWeight } = trigger;
  const totalWeight = crisisWeight + opportunityWeight;
  const roll = Math.random() * totalWeight;

  const isCrisis = roll < crisisWeight;
  const poolName = isCrisis
    ? pool.find((p) => p.includes("crisis"))
    : pool.find((p) => p.includes("opportunity"));

  if (!poolName || !scenarioData.eventPool[poolName]) {
    const fallbackPool = pool[0];
    const cards = scenarioData.eventPool[fallbackPool];
    return cards[Math.floor(Math.random() * cards.length)];
  }

  const cards = scenarioData.eventPool[poolName];
  return cards[Math.floor(Math.random() * cards.length)];
}

function getDiceMapping(mapping: Record<string, { penalty: number; narrative: string }>, diceValue: number) {
  if (mapping[String(diceValue)]) return mapping[String(diceValue)];
  for (const key of Object.keys(mapping)) {
    if (key.includes("-")) {
      const [min, max] = key.split("-").map(Number);
      if (diceValue >= min && diceValue <= max) return mapping[key];
    }
  }
  return mapping["1"];
}

function numericChange(
  type: NumericChangeType,
  label: string,
  before: number,
  after: number,
  reason: string,
  source: string
): NumericChangeEntry {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    label,
    before,
    after,
    delta: Math.round((after - before) * 10) / 10,
    reason,
    source,
    createdAt: Date.now(),
  };
}

function buildBranchContext(option: DecisionOption, sourceTask?: RouteStep | null): BranchContextEntry {
  const sourceTitle = sourceTask?.title || "方案选择";
  const pressure: string[] = [];
  if (option.revenueModifier < 0) pressure.push("现金流更紧，下一步需要优先验证投入回收周期");
  if (option.revenueModifier > 0) pressure.push("短期收入改善，但需要确认增长是否可持续");
  if (option.coinModifier < 0) pressure.push("可调用资源减少，试错空间被压缩");
  if (option.scoreModifier < 0) pressure.push("方案带来执行风险，后续AI建议需要更重视约束和复盘");
  if (option.scoreModifier > 0) pressure.push("决策质量获得加成，后续可尝试更系统的执行计划");

  return {
    id: `${Date.now()}_${option.id}`,
    sourceTaskId: sourceTask?.id || "unknown",
    sourceTitle,
    optionTitle: option.title,
    context: `上一轮你选择了「${option.title}」。${option.consequence}${pressure.length > 0 ? ` 后续影响：${pressure.join("；")}。` : ""}`,
    nextPressure:
      pressure.length > 0
        ? pressure.join("；")
        : "局面保持稳定，但下一步仍需要把方案落到行动细节。",
    createdAt: Date.now(),
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "welcome",
  subPhase: "task",
  selectedRole: null,
  apiKey: readStoredApiKey(),
  decisionCoins: 0,
  inventory: [],
  totalScore: 0,
  taskScores: [],
  currentStepIndex: 0,
  chatMessages: [],
  currentTask: null,
  currentEvent: null,
  diceResult: null,
  diceRolled: false,
  mitigated: false,
  skipNextCrisis: false,
  opportunityAccepted: false,
  currentScore: null,
  finalAnswer: "",
  rerollCount: 0,
  expertRoleActive: false,
  expertRoleName: "",
  scoreBonus: 0,
  doubleDiceActive: false,
  isChatLoading: false,
  chatWaitStage: "idle",
  lastUserMessage: null,
  isJudging: false,
  isDiceRolling: false,
  currentTransition: null,
  decisionHistory: [],
  unlockedHints: [],
  unlockedHiddenData: [],
  decisionTraits: { ...defaultDecisionTraits },
  traitHistory: [],
  currentFollowUpTask: null,
  currentFollowUpData: null,
  decisionOptionPhase: false,
  settlementAfterOption: false,
  selectedDecisionOption: null,
  aiDecisionOptions: null,
  decisionOptionsNotice: null,
  decisionOptionsGeneratedAssistantCount: 0,
  isDecisionOptionsLoading: false,
  consequenceRevealed: false,
  revenue: 0,
  revenueHistory: [],
  pendingRevenueEntry: null,
  numericChangeLog: [],
  branchContexts: [],
  reviewReport: null,
  isReviewLoading: false,
  reviewedCheckpointId: null,
  finalReport: null,
  isFinalReportLoading: false,

  startGame: () => {
    set({ phase: "roleSelect" });
  },

  loadSavedGame: () => {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw) as Partial<GameState>;
      const { apiKey: _savedApiKey, ...savedGame } = saved;
      void _savedApiKey;
      set({
        ...savedGame,
        apiKey: readStoredApiKey(),
        isChatLoading: false,
        chatWaitStage: "idle",
        isJudging: false,
        isDiceRolling: false,
        isDecisionOptionsLoading: false,
        isReviewLoading: false,
        isFinalReportLoading: false,
      });
      return true;
    } catch {
      window.localStorage.removeItem(LOCAL_SAVE_KEY);
      return false;
    }
  },

  clearSavedGame: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_SAVE_KEY);
    }
  },

  selectRole: (role: Role) => {
    set({
      phase: "playing",
      selectedRole: role,
      decisionCoins: role.startingResources.decisionCoins,
      currentStepIndex: 0,
      decisionHistory: [],
      unlockedHints: [],
      unlockedHiddenData: [],
      decisionTraits: { ...defaultDecisionTraits },
      traitHistory: [],
    });
    get().proceedToNextStep();
  },

  proceedToNextStep: () => {
    const { currentStepIndex, selectedRole } = get();
    const route = getCurrentRoute(selectedRole?.id || null);

    if (currentStepIndex >= route.length) {
      set({ phase: "ending" });
      return;
    }

    const step = route[currentStepIndex];

    // Show transition if exists
    const transition = "transition" in step ? step.transition : undefined;
    if (transition && currentStepIndex > 0) {
      set({ currentTransition: transition, phase: "transition" });
      return; // Will continue after dismissTransition
    }

    applyStep(step, set, get);
  },

  dismissTransition: () => {
    const { currentStepIndex, selectedRole } = get();
    const route = getCurrentRoute(selectedRole?.id || null);
    set({ currentTransition: null, phase: "playing" });
    if (currentStepIndex < route.length) {
      applyStep(route[currentStepIndex], set, get);
    }
  },

  sendChatMessage: async (message: string) => {
    const { chatMessages, currentTask, currentEvent, selectedRole, expertRoleActive, expertRoleName, diceResult, mitigated, taskScores, subPhase, decisionHistory, unlockedHints, unlockedHiddenData, branchContexts } = get();

    const userMessage: ChatMessage = { role: "user", content: message };
    const newMessages = [...chatMessages, userMessage];

    set({ chatMessages: newMessages, isChatLoading: true, chatWaitStage: "connecting", lastUserMessage: message });

    const slowTimeout = setTimeout(() => {
      if (get().isChatLoading) {
        set({ chatWaitStage: "slow" });
      }
    }, 20000);

    // Safety timeout: force reset isChatLoading after 65s no matter what
    const safetyTimeout = setTimeout(() => {
      if (get().isChatLoading) {
        console.warn("Chat safety timeout triggered - resetting isChatLoading");
        set({ isChatLoading: false, chatWaitStage: "error" });
      }
    }, 65000);

    try {
      let cardTitle = "";
      let cardChallenge = "";
      let cardData = "";

      if (currentTask?.type === "main") {
        cardTitle = currentTask.title;
        // Use challenge field as the freely shown problem statement
        cardChallenge = (currentTask as Record<string, unknown>).challenge
          ? String((currentTask as Record<string, unknown>).challenge)
          : currentTask.task;
        cardData = currentTask.data;

        // Dynamic data for task_10
        if (currentTask.id === "task_10" && taskScores.length > 0) {
          const scoreSummary = taskScores
            .map((ts) => `${ts.title}：${ts.weightedTotal}分`)
            .join("；");
          cardData = `你的历史任务评分：${scoreSummary}。总分：${get().totalScore}分。`;
        }
      } else if (currentEvent) {
        cardTitle = currentEvent.title;
        cardChallenge = currentEvent.task;
      }

      // Build system prompt
      let systemPrompt = selectedRole?.defaultSystemPrompt || "你是一位助手。";
      systemPrompt += `\n\n【回答方式要求】
你是玩家的 AI 外援和经营顾问，不要代替玩家扮演角色。
不要写剧本、旁白、镜头、动作描写、人物台词或舞台指令。
不要用“你走向柜台”“他沉默片刻”这类叙事表达。
请直接给出经营分析、关键判断、可执行建议和需要补充的数据。
如果玩家信息不足或还没有形成结论，请优先追问关键问题，不要强行替玩家下结论。
表达要像顾问对话：简洁、现实、可落地。`;
      if (expertRoleActive && expertRoleName) {
        systemPrompt += `\n\n当前任务中，你必须扮演"${expertRoleName}"的角色，以该专家的视角提供专业建议。`;
      }
      systemPrompt += `\n\n当前情景：${cardTitle}\n挑战描述：${cardChallenge}`;
      if (cardData) {
        systemPrompt += `\n相关数据：${cardData}`;
      }

      // Include hint (锦囊/task) only if unlocked for this task
      if (currentTask?.type === "main" && unlockedHints.includes(currentTask.id)) {
        systemPrompt += `\n策略锦囊：${currentTask.task}`;
      }

      // Include hiddenData only if unlocked for this task
      if (
        currentTask?.type === "main" &&
        unlockedHiddenData.includes(currentTask.id) &&
        (currentTask as Record<string, unknown>).hiddenData
      ) {
        const hiddenLabel = (currentTask as Record<string, unknown>).hiddenDataLabel
          ? `（${String((currentTask as Record<string, unknown>).hiddenDataLabel)}）`
          : "";
        systemPrompt += `\n隐藏数据${hiddenLabel}：${String((currentTask as Record<string, unknown>).hiddenData)}`;
      }

      // Add crisis dice result context
      if (subPhase === "crisis" && diceResult) {
        const severityText = mitigated ? `（已缓冲，惩罚减半）` : "";
        systemPrompt += `\n\n危机骰子结果：掷出${diceResult.value}点。${diceResult.narrative}${severityText}当前危机惩罚：${mitigated ? Math.ceil(diceResult.penalty / 2) : diceResult.penalty}分。请基于这个危机严重程度给出应对建议。`;
      }

      // Add follow-up task context if active
      const { currentFollowUpTask, currentFollowUpData } = get();
      if (currentFollowUpTask) {
        systemPrompt += `\n\n【后续任务】${currentFollowUpTask}`;
        if (currentFollowUpData) {
          systemPrompt += `\n【后续任务参考数据】${currentFollowUpData}`;
        }
      }

      // Add contract data to context if current task has a contract
      if (currentTask?.type === "main") {
        const contract = (currentTask as Record<string, unknown>).contract as {
          type: string;
          title: string;
          parties: { partyA: string; partyB: string };
          terms: string[];
          financials: { amount: string; paymentTerms: string; duration: string };
          risks: string[];
          specialConditions?: string[];
        } | undefined;
        if (contract) {
          let contractContext = `\n\n【当前相关合同】\n合同名称：${contract.title}\n甲方：${contract.parties.partyA}\n乙方：${contract.parties.partyB}\n主要条款：${contract.terms.join("；")}\n财务条款：金额${contract.financials.amount}，付款方式${contract.financials.paymentTerms}，期限${contract.financials.duration}\n风险条款：${contract.risks.join("；")}`;
          if (contract.specialConditions && contract.specialConditions.length > 0) {
            contractContext += `\n特别约定：${contract.specialConditions.join("；")}`;
          }
          systemPrompt += contractContext;
        }
      }

      // Add decision history for story continuity
      if (decisionHistory.length > 0) {
        systemPrompt += `\n\n【你之前的决策历程】\n${decisionHistory.join("\n")}`;
      }

      if (branchContexts.length > 0) {
        systemPrompt += `\n\n【会影响当前任务的经营惯性】\n${branchContexts.slice(-3).map((b) => `- ${b.context}\n  本关延续压力：${b.nextPressure}`).join("\n")}`;
      }

      // Add fetch with AbortController timeout (60s)
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 60000);
      set({ chatWaitStage: "thinking" });

      let response: Response;
      try {
        const { apiKey } = get();
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            cardContext: { title: cardTitle, task: cardChallenge },
            systemPrompt,
            apiKey: apiKey || undefined,
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(fetchTimeout);
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          throw new Error("AI响应超时，请稍后再试");
        }
        throw fetchError;
      }
      clearTimeout(fetchTimeout);

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API返回了非JSON响应，请稍后重试");
      }

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: ChatMessage = { role: "assistant", content: data.reply };
        set({ chatMessages: [...newMessages, assistantMessage], chatWaitStage: "idle" });
      } else if (data.error) {
        // API returned an error in JSON format
        const errorMessage: ChatMessage = { role: "assistant", content: `抱歉，AI暂时无法响应（${data.error}）。请稍后再试。` };
        set({ chatMessages: [...newMessages, errorMessage], chatWaitStage: "error" });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errMsg = error instanceof Error ? error.message : "未知错误";
      const errorMessage: ChatMessage = { role: "assistant", content: `抱歉，AI暂时无法响应（${errMsg}）。请稍后再试。` };
      // Re-read chatMessages to avoid stale state
      const currentMessages = get().chatMessages;
      set({ chatMessages: [...currentMessages, errorMessage], chatWaitStage: "error" });
    } finally {
      clearTimeout(slowTimeout);
      clearTimeout(safetyTimeout);
      set({ isChatLoading: false });
    }
  },

  retryLastChatMessage: async () => {
    const { lastUserMessage, isChatLoading } = get();
    if (!lastUserMessage || isChatLoading) return;
    await get().sendChatMessage(lastUserMessage);
  },

  submitTask: async (finalAnswer: string) => {
    const { chatMessages, currentTask, currentEvent, expertRoleActive, scoreBonus, taskScores, decisionHistory, apiKey, unlockedHints } = get();
    set({ isJudging: true });

    // Not using hint increases innovation level
    if (currentTask?.type === "main" && !unlockedHints.includes(currentTask.id)) {
      get().updateDecisionTraits("innovationLevel", 5, "未使用锦囊独立完成任务");
    }

    try {
      let cardTitle = "";
      let cardTask = "";
      let scoringWeight = 1.0;

      if (currentTask?.type === "main") {
        cardTitle = currentTask.title;
        cardTask = currentTask.task;
        scoringWeight = currentTask.scoringWeight;
      } else if (currentEvent) {
        cardTitle = currentEvent.title;
        cardTask = currentEvent.task;
      }

      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          finalAnswer,
          card: { title: cardTitle, task: cardTask },
          scoringDimensions: scenarioData.scoring.dimensions,
          apiKey: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`评分API请求失败: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("评分API返回了非JSON响应，请稍后重试");
      }

      const data = await response.json();

      if (data.scores) {
        const total = Object.values(data.scores).reduce(
          (sum: number, s: unknown) => sum + (typeof s === "number" ? s : 0), 0
        );
        let weightedTotal = total * scoringWeight;

        if (expertRoleActive) {
          weightedTotal += scoreBonus;
          set({ expertRoleActive: false, expertRoleName: "", scoreBonus: 0 });
        }

        const taskScore: TaskScore = {
          taskId: currentTask?.id || currentEvent?.id || "unknown",
          title: cardTitle,
          scores: data.scores,
          total,
          weightedTotal: Math.round(weightedTotal * 10) / 10,
          comment: data.comment || "",
        };

        const newTotalScore = taskScores.reduce((sum, s) => sum + s.weightedTotal, 0) + weightedTotal;

        const { diceResult, mitigated, totalScore: prevTotalScore } = get();
        // Calculate incremental adjustment from previous totalScore
        // prevTotalScore includes all previous penalties/bonuses already
        // New totalScore = prevTotalScore + current weightedTotal + current adjustments
        let currentPenalty = 0;
        if (diceResult && currentEvent?.type === "crisis") {
          currentPenalty = mitigated ? Math.ceil(diceResult.penalty / 2) : diceResult.penalty;
        }

        let currentOppBonus = 0;
        if (currentEvent?.type === "opportunity" && get().opportunityAccepted) {
          const oppCard = currentEvent as OpportunityCard;
          currentOppBonus = oppCard.reward.score || 0;
        }

        // Add to decision history
        const historyEntry = `「${cardTitle}」：得分${weightedTotal}分。${finalAnswer ? `决策结论：${finalAnswer.slice(0, 80)}` : "未提交结论。"}${data.comment ? ` 评语：${data.comment.slice(0, 60)}` : ""}`;
        const newDecisionHistory = [...decisionHistory, historyEntry];

        // === Revenue simulation ===
        // Base monthly revenue depends on the role (realistic Chinese small business numbers)
        const baseMonthlyRevenue = get().selectedRole?.startingResources?.baseMonthlyRevenue || 18600;
        // Each task generates 5-15% of monthly revenue as base income
        const taskRevenueBase = Math.round(baseMonthlyRevenue * (0.05 + Math.random() * 0.1));
        // Better decisions = more revenue: score multiplier based on weightedTotal
        // weightedTotal typically ranges 5-50, so multiplier ranges ~0.6-1.5
        const scoreMultiplier = 0.5 + (weightedTotal / 50) * 1.0;
        const taskRevenue = Math.round(taskRevenueBase * scoreMultiplier);

        // Apply crisis penalties as revenue loss
        let revenuePenalty = 0;
        if (diceResult && currentEvent?.type === "crisis") {
          const penaltyPoints = mitigated ? Math.ceil(diceResult.penalty / 2) : diceResult.penalty;
          // Each penalty point = 1% of monthly revenue
          revenuePenalty = Math.round(baseMonthlyRevenue * 0.01 * Math.abs(penaltyPoints));
        }

        // Opportunity bonus revenue
        let oppRevenueBonus = 0;
        if (currentEvent?.type === "opportunity" && get().opportunityAccepted) {
          const oppCard = currentEvent as OpportunityCard;
          oppRevenueBonus = oppCard.reward.decisionCoins ? Math.round(baseMonthlyRevenue * 0.03) : 0;
        }

        const hasDecisionOptions =
          currentTask?.type === "main" &&
          Boolean((currentTask as Record<string, unknown>).decisionOptions);
        const netRevenue = taskRevenue - revenuePenalty + oppRevenueBonus;
        const currentRevenue = get().revenue;
        const newRevenue = Math.round((currentRevenue + netRevenue) * 100) / 100;

        const revenueEntry: RevenueEntry = {
          taskId: currentTask?.id || currentEvent?.id || "unknown",
          title: cardTitle,
          revenue: netRevenue,
          cumulative: hasDecisionOptions ? currentRevenue : newRevenue,
          reason: netRevenue >= 0
            ? `经营收入¥${taskRevenue}${revenuePenalty > 0 ? `，危机损失¥${revenuePenalty}` : ''}${oppRevenueBonus > 0 ? `，机遇增收¥${oppRevenueBonus}` : ''}`
            : `危机损失¥${revenuePenalty}，经营收入¥${taskRevenue}${oppRevenueBonus > 0 ? `，机遇增收¥${oppRevenueBonus}` : ''}`,
        };

        // Clear follow-up task on scoring
        const scoreAfter = Math.round((prevTotalScore + weightedTotal + currentPenalty + currentOppBonus) * 10) / 10;
        const scoreReasonParts = [`任务评分 ${Math.round(weightedTotal * 10) / 10}`];
        if (currentPenalty !== 0) scoreReasonParts.push(`危机修正 ${currentPenalty}`);
        if (currentOppBonus !== 0) scoreReasonParts.push(`机遇奖励 +${currentOppBonus}`);

        const changes = [
          numericChange("score", "总分", prevTotalScore, scoreAfter, scoreReasonParts.join("，"), cardTitle),
          ...(hasDecisionOptions
            ? []
            : [numericChange("revenue", "模拟营收", currentRevenue, newRevenue, revenueEntry.reason, cardTitle)]),
        ];

        set({
          currentScore: taskScore,
          taskScores: [...taskScores, taskScore],
          totalScore: scoreAfter,
          subPhase: hasDecisionOptions ? "task" : "scoring",
          decisionHistory: newDecisionHistory,
          currentFollowUpTask: null,
          currentFollowUpData: null,
          revenue: hasDecisionOptions ? currentRevenue : newRevenue,
          revenueHistory: hasDecisionOptions ? get().revenueHistory : [...get().revenueHistory, revenueEntry],
          pendingRevenueEntry: hasDecisionOptions ? revenueEntry : null,
          settlementAfterOption: false,
          numericChangeLog: [...get().numericChangeLog, ...changes],
        });

        if (hasDecisionOptions) {
          set({ decisionOptionPhase: true });
          get().generateDecisionOptions();
        }
      }
    } catch (error) {
      console.error("Judge error:", error);
    } finally {
      set({ isJudging: false });
    }
  },

  rerollTask: async () => {
    const { decisionCoins, rerollCount, currentTask, totalScore, currentScore, decisionHistory } = get();
    const task = currentTask as { type: "main"; rerollCost: number } | null;
    if (!task) return;

    const cost = task.rerollCost * (rerollCount + 1);
    if (decisionCoins < cost) return;

    // Remove the last task score and recalculate totalScore
    let newTotalScore = totalScore;
    if (currentScore) {
      newTotalScore = totalScore - currentScore.weightedTotal;
    }

    // Remove last decision history entry
    const newDecisionHistory = decisionHistory.slice(0, -1);

    set({
      decisionCoins: decisionCoins - cost,
      rerollCount: rerollCount + 1,
      chatMessages: [],
      finalAnswer: "",
      currentScore: null,
      subPhase: "task",
      totalScore: Math.round(newTotalScore * 10) / 10,
      decisionHistory: newDecisionHistory,
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("coins", "决策币", decisionCoins, decisionCoins - cost, `重做任务：${currentTask?.title || "当前任务"}`, "重做"),
      ],
    });
  },

  rollDice: () => {
    const { currentEvent, doubleDiceActive } = get();
    if (!currentEvent || currentEvent.type !== "crisis") return;

    set({ isDiceRolling: true });
    const crisis = currentEvent as CrisisCard;

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const result = getDiceMapping(crisis.dice.mapping, roll);

      if (doubleDiceActive) {
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const result2 = getDiceMapping(crisis.dice.mapping, roll2);
        const betterResult = result.penalty >= result2.penalty ? result : result2;
        const betterRoll = result.penalty >= result2.penalty ? roll : roll2;
        set({
          diceResult: { value: betterRoll, narrative: betterResult.narrative, penalty: betterResult.penalty },
          diceRolled: true, isDiceRolling: false, doubleDiceActive: false,
        });
      } else {
        set({
          diceResult: { value: roll, narrative: result.narrative, penalty: result.penalty },
          diceRolled: true, isDiceRolling: false,
        });
      }
    }, 1500);
  },

  mitigateCrisis: () => {
    const { decisionCoins, currentEvent } = get();
    if (!currentEvent || currentEvent.type !== "crisis") return;
    const crisis = currentEvent as CrisisCard;
    if (decisionCoins < crisis.mitigationCost) return;
    // Accepting crisis mitigation reduces risk appetite
    get().updateDecisionTraits("riskAppetite", -3, "接受危机缓冲");
    set({
      decisionCoins: decisionCoins - crisis.mitigationCost,
      mitigated: true,
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("coins", "决策币", decisionCoins, decisionCoins - crisis.mitigationCost, `缓冲危机：${crisis.title}`, "危机缓冲"),
      ],
    });
  },

  acceptCrisisResult: () => {
    const { currentEvent, diceResult, mitigated, totalScore, revenue, selectedRole, decisionHistory } = get();
    if (!currentEvent || currentEvent.type !== "crisis" || !diceResult) return;

    const penalty = mitigated ? Math.ceil(diceResult.penalty / 2) : diceResult.penalty;
    const newTotalScore = Math.round((totalScore + penalty) * 10) / 10;
    const baseMonthlyRevenue = selectedRole?.startingResources?.baseMonthlyRevenue || 18600;
    const revenueLoss = Math.round(baseMonthlyRevenue * 0.01 * Math.abs(penalty));
    const newRevenue = Math.round((revenue - revenueLoss) * 100) / 100;
    const crisis = currentEvent as CrisisCard;
    const source = `危机：${crisis.title}`;

    set({
      totalScore: newTotalScore,
      revenue: newRevenue,
      decisionHistory: [
        ...decisionHistory,
        `「${crisis.title}」：掷出${diceResult.value}点，接受危机结果。${diceResult.narrative}（影响：${penalty}分，营收-¥${revenueLoss.toLocaleString()}）`,
      ],
      revenueHistory: [
        ...get().revenueHistory,
        {
          taskId: crisis.id,
          title: crisis.title,
          revenue: -revenueLoss,
          cumulative: newRevenue,
          reason: `危机结果：${diceResult.narrative}`,
        },
      ],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("score", "总分", totalScore, newTotalScore, `接受危机结果：${crisis.title}`, source),
        numericChange("revenue", "模拟营收", revenue, newRevenue, `危机损失：${diceResult.narrative}`, source),
      ],
      currentStepIndex: get().currentStepIndex + 1,
      currentEvent: null,
      diceResult: null,
      diceRolled: false,
      mitigated: false,
    });
    get().proceedToNextStep();
  },

  acceptOpportunity: () => {
    const { currentEvent, decisionCoins, decisionHistory, totalScore } = get();
    if (!currentEvent || currentEvent.type !== "opportunity") return;
    const opp = currentEvent as OpportunityCard;
    const newCoins = decisionCoins + (opp.reward.decisionCoins || 0);
    const newTotalScore = Math.round((totalScore + (opp.reward.score || 0)) * 10) / 10;
    const newInventory = [...get().inventory];
    if (opp.reward.item) {
      newInventory.push({
        shopItem: { id: `reward_${opp.reward.item}`, name: opp.reward.item, description: `从"${opp.title}"中获得的特殊道具`, cost: 0, effect: "special", limit: 1 },
        quantity: 1,
      });
    }

    // Accepting opportunity increases risk appetite
    get().updateDecisionTraits("riskAppetite", 5, "接受机遇");

    // Check if the opportunity has a follow-up task
    if (opp.followUpTask) {
      set({
        opportunityAccepted: true,
        decisionCoins: newCoins,
        inventory: newInventory,
        subPhase: "opportunity",
        chatMessages: [],
        finalAnswer: "",
        currentFollowUpTask: opp.followUpTask,
        currentFollowUpData: opp.followUpData || null,
        numericChangeLog: [
          ...get().numericChangeLog,
          numericChange("coins", "决策币", decisionCoins, newCoins, `接受机遇：${opp.title}`, "机遇"),
        ],
      });
    } else {
      const changes = [
        numericChange("coins", "决策币", decisionCoins, newCoins, `接受机遇：${opp.title}`, "机遇"),
        numericChange("score", "总分", totalScore, newTotalScore, `机遇奖励：${opp.title}`, "机遇"),
      ].filter((change) => change.delta !== 0);
      set({
        opportunityAccepted: false,
        decisionCoins: newCoins,
        totalScore: newTotalScore,
        inventory: newInventory,
        currentStepIndex: get().currentStepIndex + 1,
        currentEvent: null,
        currentFollowUpTask: null,
        currentFollowUpData: null,
        chatMessages: [],
        finalAnswer: "",
        decisionHistory: [
          ...decisionHistory,
          `「${opp.title}」：接受机遇，获得${opp.reward.decisionCoins ? `${opp.reward.decisionCoins}枚决策币` : ""}${opp.reward.score ? `，决策力+${opp.reward.score}` : ""}${opp.reward.item ? `，道具「${opp.reward.item}」` : ""}。`,
        ],
        numericChangeLog: [...get().numericChangeLog, ...changes],
      });
      get().proceedToNextStep();
    }
  },

  declineOpportunity: () => {
    // Declining opportunity increases data dependency (more cautious, want more data)
    get().updateDecisionTraits("dataDependency", 3, "放弃机遇");
    set({ opportunityAccepted: false, currentStepIndex: get().currentStepIndex + 1 });
    get().proceedToNextStep();
  },

  showShop: () => { set({ subPhase: "shop" }); },
  closeShop: () => { set({ subPhase: "checkpoint" }); },

  buyItem: (item: ShopItem) => {
    const { decisionCoins, inventory, selectedRole } = get();
    if (decisionCoins < item.cost) return;
    const maxItems = selectedRole?.startingResources.maxItems || 3;
    const currentItemCount = inventory.reduce((sum, i) => sum + i.quantity, 0);
    if (currentItemCount >= maxItems) return;

    const existingItem = inventory.find((i) => i.shopItem.id === item.id);
    if (existingItem) {
      if (existingItem.quantity >= item.limit) return;
      existingItem.quantity += 1;
    } else {
      inventory.push({ shopItem: item, quantity: 1 });
    }

    if (item.effect === "skip_next_crisis") {
      set({ skipNextCrisis: true });
      // Buying skip_next_crisis reduces collaboration tendency and increases data dependency
      get().updateDecisionTraits("collaborationTendency", -5, "购买贵人相助道具");
      get().updateDecisionTraits("dataDependency", 5, "购买贵人相助道具");
    }
    if (item.effect === "boost_score") {
      const params = item.params as { role: string; scoreBonus: number } | undefined;
      set({ expertRoleActive: true, expertRoleName: params?.role || "资深商业顾问", scoreBonus: params?.scoreBonus || 2 });
      // Buying boost_score increases risk appetite
      get().updateDecisionTraits("riskAppetite", 5, "购买专家名片道具");
    }
    if (item.effect === "double_dice") set({ doubleDiceActive: true });

    set({
      decisionCoins: decisionCoins - item.cost,
      inventory: [...inventory],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("coins", "决策币", decisionCoins, decisionCoins - item.cost, `购买道具：${item.name}`, "商店"),
        numericChange("item", "道具", currentItemCount, currentItemCount + 1, `获得道具：${item.name}`, "商店"),
      ],
    });
  },

  useItem: (itemId: string) => {
    const { inventory } = get();
    const itemIndex = inventory.findIndex((i) => i.shopItem.id === itemId);
    if (itemIndex === -1) return;
    const item = inventory[itemIndex];
    if (item.shopItem.effect === "skip_next_crisis") set({ skipNextCrisis: true });
    if (item.shopItem.effect === "boost_score") {
      const params = item.shopItem.params as { role: string; scoreBonus: number } | undefined;
      set({ expertRoleActive: true, expertRoleName: params?.role || "资深商业顾问", scoreBonus: params?.scoreBonus || 2 });
    }
    if (item.shopItem.effect === "double_dice") set({ doubleDiceActive: true });
    if (item.quantity > 1) {
      inventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
    } else {
      inventory.splice(itemIndex, 1);
    }
    const currentItemCount = get().inventory.reduce((sum, i) => sum + i.quantity, 0);
    set({
      inventory: [...inventory],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("item", "道具", currentItemCount, Math.max(0, currentItemCount - 1), `使用道具：${item.shopItem.name}`, "道具"),
      ],
    });
  },

  continueAfterScoring: () => {
    if (get().settlementAfterOption) {
      set({
        settlementAfterOption: false,
        selectedDecisionOption: null,
        consequenceRevealed: false,
        currentStepIndex: get().currentStepIndex + 1,
      });
      get().proceedToNextStep();
      return;
    }

    // Check if current task has decision options. This remains as a fallback for
    // older in-progress saves where scoring was reached before option generation.
    const { currentTask } = get();
    if (currentTask?.type === "main") {
      const task = currentTask as Record<string, unknown>;
      const options = task.decisionOptions as DecisionOption[] | undefined;
      if (options && options.length > 0) {
        set({ decisionOptionPhase: true });
        // Start generating AI-based options in the background
        get().generateDecisionOptions();
        return;
      }
    }
    // No decision options, advance normally
    set({ currentStepIndex: get().currentStepIndex + 1 });
    get().proceedToNextStep();
  },

  showDecisionOptions: () => {
    set({ decisionOptionPhase: true });
  },

  selectDecisionOption: (option: DecisionOption) => {
    const { selectedDecisionOption } = get();
    if (selectedDecisionOption) return; // Already selected

    // Set the selected option but DON'T apply effects yet - wait for consequence reveal
    set({
      selectedDecisionOption: option,
      consequenceRevealed: false,
    });

    // After a short delay, reveal the consequence
    setTimeout(() => {
      set({ consequenceRevealed: true });
    }, 800);

    // After a longer delay, apply effects and advance
    setTimeout(() => {
      const { totalScore, decisionCoins, decisionHistory, revenue, branchContexts, currentTask, pendingRevenueEntry } = get();
      const currentOption = get().selectedDecisionOption;
      if (!currentOption) return;

      // Apply score modifier
      const newTotalScore = Math.round((totalScore + currentOption.scoreModifier) * 10) / 10;

      // Apply coin modifier
      const newCoins = Math.max(0, decisionCoins + currentOption.coinModifier);

      // Apply revenue modifier
      const pendingRevenue = pendingRevenueEntry?.revenue || 0;
      const newRevenue = Math.round((revenue + pendingRevenue + currentOption.revenueModifier) * 100) / 100;

      // Apply trait changes
      if (currentOption.traitChanges) {
        for (const tc of currentOption.traitChanges) {
          get().updateDecisionTraits(tc.trait as keyof DecisionTraits, tc.direction, tc.reason);
        }
      }

      // Add to decision history - this is key for path branching
      const historyEntry = `「方案选择」：选择了「${currentOption.title}」— ${currentOption.consequence.slice(0, 80)}${currentOption.scoreModifier !== 0 ? `（决策力${currentOption.scoreModifier > 0 ? "+" : ""}${currentOption.scoreModifier}）` : ""}${currentOption.revenueModifier !== 0 ? `（营收${currentOption.revenueModifier > 0 ? "+" : ""}¥${currentOption.revenueModifier.toLocaleString()}）` : ""}`;
      const newDecisionHistory = [...decisionHistory, historyEntry];

      // Add revenue history entry for the decision
      const revenueEntry: RevenueEntry = {
        taskId: `decision_${Date.now()}`,
        title: `方案选择：${currentOption.title}`,
        revenue: currentOption.revenueModifier,
        cumulative: newRevenue,
        reason: currentOption.consequence.slice(0, 50),
      };

      const branchContext = buildBranchContext(currentOption, currentTask);
      const changes = [
        numericChange("score", "总分", totalScore, newTotalScore, `方案选择：${currentOption.title}`, "方案"),
        numericChange("coins", "决策币", decisionCoins, newCoins, `方案资源变化：${currentOption.title}`, "方案"),
        numericChange(
          "revenue",
          "模拟营收",
          revenue,
          newRevenue,
          `${pendingRevenueEntry ? `${pendingRevenueEntry.reason}；` : ""}${currentOption.consequence.slice(0, 70)}`,
          "本回合结算"
        ),
      ].filter((change) => change.delta !== 0);

      set({
        totalScore: newTotalScore,
        decisionCoins: newCoins,
        revenue: newRevenue,
        decisionHistory: newDecisionHistory,
        revenueHistory: [
          ...get().revenueHistory,
          ...(pendingRevenueEntry
            ? [{ ...pendingRevenueEntry, cumulative: Math.round((revenue + pendingRevenue) * 100) / 100 }]
            : []),
          revenueEntry,
        ],
        branchContexts: [...branchContexts, branchContext],
        pendingRevenueEntry: null,
        numericChangeLog: [...get().numericChangeLog, ...changes],
      });

      // After another delay, show the full settlement for this round
      setTimeout(() => {
        set({
          decisionOptionPhase: false,
          aiDecisionOptions: null,
          decisionOptionsNotice: null,
          isDecisionOptionsLoading: false,
          settlementAfterOption: true,
          subPhase: "scoring",
        });
      }, 2000);
    }, 3000);
  },

  generateDecisionOptions: async () => {
    const { chatMessages, currentTask, finalAnswer, apiKey, isDecisionOptionsLoading } = get();
    if (isDecisionOptionsLoading) return;

    set({ isDecisionOptionsLoading: true, aiDecisionOptions: null, decisionOptionsNotice: null });

    try {
      let taskTitle = "";
      let taskChallenge = "";
      let existingOptionsText = "";

      if (currentTask?.type === "main") {
        taskTitle = currentTask.title;
        taskChallenge = (currentTask as Record<string, unknown>).challenge
          ? String((currentTask as Record<string, unknown>).challenge)
          : currentTask.task;

        // Provide existing options as reference
        const existingOptions = (currentTask as Record<string, unknown>).decisionOptions as DecisionOption[] | undefined;
        if (existingOptions && existingOptions.length > 0) {
          existingOptionsText = existingOptions.map((o, i) =>
            `${i + 1}. ${o.title}：${o.description}`
          ).join("\n");
        }
      }

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/decision-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          taskTitle,
          taskChallenge,
          decisionAnswer: finalAnswer,
          apiKey: apiKey || undefined,
          existingOptions: existingOptionsText,
        }),
        signal: controller.signal,
      });

      clearTimeout(fetchTimeout);

      if (!response.ok) {
        throw new Error(`Decision options API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "insufficient" || data.needsMoreDiscussion) {
        set({
          aiDecisionOptions: [],
          decisionOptionsNotice: data.reason || "你还没有得出具体的行动方案，请继续和 AI 对话决策。",
          decisionOptionsGeneratedAssistantCount: chatMessages.filter((m) => m.role === "assistant").length,
        });
      } else if (data.options && Array.isArray(data.options) && data.options.length > 0) {
        // Merge AI-generated options with hardcoded trait changes if available
        const currentOptions = (currentTask as Record<string, unknown>).decisionOptions as DecisionOption[] | undefined;
        const mergedOptions = data.options.map((aiOpt: DecisionOption, i: number) => {
          // If there's a matching hardcoded option, merge its traitChanges
          const hardcodedOpt = currentOptions?.[i];
          return {
            ...aiOpt,
            traitChanges: hardcodedOpt?.traitChanges || aiOpt.traitChanges || [],
          };
        });
        set({
          aiDecisionOptions: mergedOptions,
          decisionOptionsNotice: null,
          decisionOptionsGeneratedAssistantCount: chatMessages.filter((m) => m.role === "assistant").length,
        });
      } else {
        set({
          aiDecisionOptions: [],
          decisionOptionsNotice: "你还没有得出具体的行动方案，请继续和 AI 对话决策。",
          decisionOptionsGeneratedAssistantCount: chatMessages.filter((m) => m.role === "assistant").length,
        });
      }
    } catch (error) {
      console.error("Generate decision options error:", error);
      set({
        aiDecisionOptions: [],
        decisionOptionsNotice: "这次没有生成出可执行行动卡，请继续和 AI 对话后重试。",
        decisionOptionsGeneratedAssistantCount: chatMessages.filter((m) => m.role === "assistant").length,
      });
    } finally {
      set({ isDecisionOptionsLoading: false });
    }
  },

  setConsequenceRevealed: (v: boolean) => {
    set({ consequenceRevealed: v });
  },

  continueAfterCheckpoint: () => {
    set({ currentStepIndex: get().currentStepIndex + 1 });
    get().proceedToNextStep();
  },

  setFinalAnswer: (answer: string) => { set({ finalAnswer: answer }); },
  setApiKey: (key: string) => {
    set({ apiKey: key });
    if (typeof window !== "undefined") {
      const normalized = key.trim();
      if (normalized) {
        window.localStorage.setItem(API_KEY_STORAGE_KEY, normalized);
      } else {
        window.localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    }
  },

  unlockHint: () => {
    const { currentTask, decisionCoins, unlockedHints } = get();
    if (!currentTask || currentTask.type !== "main") return;

    // Already unlocked
    if (unlockedHints.includes(currentTask.id)) return;

    // Check cost - use hintCost if available (new field), otherwise fall back to rerollCost
    const hintCost = (currentTask as Record<string, unknown>).hintCost
      ? Number((currentTask as Record<string, unknown>).hintCost)
      : currentTask.rerollCost;
    if (decisionCoins < hintCost) return;

    // Using hint increases data dependency
    get().updateDecisionTraits("dataDependency", 5, "使用锦囊提示");

    set({
      decisionCoins: decisionCoins - hintCost,
      unlockedHints: [...unlockedHints, currentTask.id],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("coins", "决策币", decisionCoins, decisionCoins - hintCost, `解锁策略锦囊：${currentTask.title}`, "锦囊"),
      ],
    });
  },

  unlockHiddenData: () => {
    const { currentTask, decisionCoins, unlockedHiddenData } = get();
    if (!currentTask || currentTask.type !== "main") return;

    // Already unlocked
    if (unlockedHiddenData.includes(currentTask.id)) return;

    // Check cost - hiddenDataCost is optional
    const hiddenDataCost = (currentTask as Record<string, unknown>).hiddenDataCost
      ? Number((currentTask as Record<string, unknown>).hiddenDataCost)
      : 0;
    if (hiddenDataCost === 0) return; // No hidden data to unlock
    if (decisionCoins < hiddenDataCost) return;

    // Using hidden data increases data dependency
    get().updateDecisionTraits("dataDependency", 5, "解锁隐藏数据");

    set({
      decisionCoins: decisionCoins - hiddenDataCost,
      unlockedHiddenData: [...unlockedHiddenData, currentTask.id],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("coins", "决策币", decisionCoins, decisionCoins - hiddenDataCost, `解锁隐藏数据：${currentTask.title}`, "情报"),
      ],
    });
  },

  updateDecisionTraits: (trait: keyof DecisionTraits, direction: number, reason: string) => {
    const { decisionTraits, traitHistory } = get();
    const currentValue = decisionTraits[trait];
    const newValue = clampTrait(currentValue + direction);
    set({
      decisionTraits: { ...decisionTraits, [trait]: newValue },
      traitHistory: [...traitHistory, { trait, direction, reason }],
      numericChangeLog: [
        ...get().numericChangeLog,
        numericChange("trait", trait, currentValue, newValue, reason, "风格"),
      ],
    });
  },

  completeFollowUpTask: () => {
    // Completing a follow-up task boosts innovation level
    get().updateDecisionTraits("innovationLevel", 3, "完成后续任务");
    set({
      currentFollowUpTask: null,
      currentFollowUpData: null,
    });
  },

  generateReview: async () => {
    const { taskScores, decisionHistory, selectedRole, decisionTraits, apiKey, isReviewLoading } = get();
    if (isReviewLoading) return;

    set({ isReviewLoading: true });
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskScores,
          decisionHistory,
          selectedRole: selectedRole ? { name: selectedRole.name } : null,
          decisionTraits,
          apiKey: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Review API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.report) {
        const checkpointId = get().currentTask?.id || null;
        set({ reviewReport: data.report, reviewedCheckpointId: checkpointId });
      } else if (data.error) {
        set({ reviewReport: `报告生成失败：${data.error}` });
      }
    } catch (error) {
      console.error("Generate review error:", error);
      set({ reviewReport: "报告生成失败，请稍后再试。" });
    } finally {
      set({ isReviewLoading: false });
    }
  },

  clearReview: () => {
    set({ reviewReport: null, isReviewLoading: false, reviewedCheckpointId: null });
  },

  generateFinalReport: async () => {
    const { taskScores, decisionHistory, selectedRole, decisionTraits, apiKey, isFinalReportLoading, totalScore, traitHistory } = get();
    if (isFinalReportLoading) return;

    set({ isFinalReportLoading: true });
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskScores,
          decisionHistory,
          selectedRole: selectedRole ? { name: selectedRole.name } : null,
          decisionTraits,
          apiKey: apiKey || undefined,
          isFinal: true,
          totalScore,
          traitHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Review API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.report) {
        set({ finalReport: data.report });
      } else if (data.error) {
        set({ finalReport: `报告生成失败：${data.error}` });
      }
    } catch (error) {
      console.error("Generate final report error:", error);
      set({ finalReport: "最终报告生成失败，请稍后再试。" });
    } finally {
      set({ isFinalReportLoading: false });
    }
  },

  resetGame: () => {
    get().clearSavedGame();
    const apiKey = get().apiKey;
    set({
      phase: "welcome", subPhase: "task", selectedRole: null, apiKey, decisionCoins: 0,
      inventory: [], totalScore: 0, taskScores: [], currentStepIndex: 0,
      chatMessages: [], currentTask: null, currentEvent: null, diceResult: null,
      diceRolled: false, mitigated: false, skipNextCrisis: false, opportunityAccepted: false,
      currentScore: null, finalAnswer: "", rerollCount: 0, expertRoleActive: false,
      expertRoleName: "", scoreBonus: 0, doubleDiceActive: false, isChatLoading: false,
      chatWaitStage: "idle", lastUserMessage: null,
      isJudging: false, isDiceRolling: false, currentTransition: null, decisionHistory: [],
      unlockedHints: [], unlockedHiddenData: [],
      decisionTraits: { ...defaultDecisionTraits }, traitHistory: [],
      currentFollowUpTask: null, currentFollowUpData: null,
      decisionOptionPhase: false, settlementAfterOption: false, selectedDecisionOption: null,
      aiDecisionOptions: null, decisionOptionsNotice: null, decisionOptionsGeneratedAssistantCount: 0, isDecisionOptionsLoading: false, consequenceRevealed: false,
      revenue: 0, revenueHistory: [], pendingRevenueEntry: null, numericChangeLog: [], branchContexts: [],
      reviewReport: null, isReviewLoading: false, reviewedCheckpointId: null,
      finalReport: null, isFinalReportLoading: false,
    });
  },
}));

/** Helper: apply a route step to state */
function applyStep(step: RouteStep, set: (partial: Partial<GameState>) => void, get: () => GameState) {
  switch (step.type) {
    case "main":
      set({
        currentTask: step, subPhase: "task", chatMessages: [], finalAnswer: "",
        rerollCount: 0, currentScore: null, currentEvent: null,
      });
      break;

    case "trigger": {
      const { skipNextCrisis } = get();
      const eventCard = drawEventCard(step.trigger);
      if (skipNextCrisis && eventCard.type === "crisis") {
        set({ skipNextCrisis: false, currentStepIndex: get().currentStepIndex + 1 });
        get().proceedToNextStep();
        return;
      }
      set({
        currentTask: step, currentEvent: eventCard, chatMessages: [], finalAnswer: "",
        rerollCount: 0, currentScore: null,
      });
      if (eventCard.type === "crisis") {
        set({ subPhase: "crisis", diceResult: null, diceRolled: false, mitigated: false });
      } else {
        set({ subPhase: "opportunity", opportunityAccepted: false });
      }
      break;
    }

    case "checkpoint":
      set({ currentTask: step, subPhase: "checkpoint", currentEvent: null });
      break;
  }
}

if (typeof window !== "undefined") {
  useGameStore.subscribe((state) => {
    if (!state.selectedRole || state.phase === "welcome" || state.phase === "roleSelect") return;
    const snapshot = {
      phase: state.phase,
      subPhase: state.subPhase,
      selectedRole: state.selectedRole,
      decisionCoins: state.decisionCoins,
      inventory: state.inventory,
      totalScore: state.totalScore,
      taskScores: state.taskScores,
      currentStepIndex: state.currentStepIndex,
      chatMessages: state.chatMessages,
      currentTask: state.currentTask,
      currentEvent: state.currentEvent,
      diceResult: state.diceResult,
      diceRolled: state.diceRolled,
      mitigated: state.mitigated,
      skipNextCrisis: state.skipNextCrisis,
      opportunityAccepted: state.opportunityAccepted,
      currentScore: state.currentScore,
      finalAnswer: state.finalAnswer,
      rerollCount: state.rerollCount,
      expertRoleActive: state.expertRoleActive,
      expertRoleName: state.expertRoleName,
      scoreBonus: state.scoreBonus,
      doubleDiceActive: state.doubleDiceActive,
      currentTransition: state.currentTransition,
      decisionHistory: state.decisionHistory,
      unlockedHints: state.unlockedHints,
      unlockedHiddenData: state.unlockedHiddenData,
      decisionTraits: state.decisionTraits,
      traitHistory: state.traitHistory,
      currentFollowUpTask: state.currentFollowUpTask,
      currentFollowUpData: state.currentFollowUpData,
      decisionOptionPhase: state.decisionOptionPhase,
      selectedDecisionOption: state.selectedDecisionOption,
      aiDecisionOptions: state.aiDecisionOptions,
      decisionOptionsNotice: state.decisionOptionsNotice,
      decisionOptionsGeneratedAssistantCount: state.decisionOptionsGeneratedAssistantCount,
      consequenceRevealed: state.consequenceRevealed,
      revenue: state.revenue,
      revenueHistory: state.revenueHistory,
      numericChangeLog: state.numericChangeLog,
      branchContexts: state.branchContexts,
      reviewReport: state.reviewReport,
      reviewedCheckpointId: state.reviewedCheckpointId,
      finalReport: state.finalReport,
      lastUserMessage: state.lastUserMessage,
    };
    window.localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(snapshot));
  });
}
