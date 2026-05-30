// 决策回响 · AI决策力大富翁沙盘 - 游戏剧本数据
// 剧本：小本经营破局（角色差异化版本）

export interface Role {
  id: string;
  name: string;
  description: string;
  startingResources: {
    decisionCoins: number;
    maxItems: number;
    baseMonthlyRevenue: number;  // Simulated monthly revenue in ¥ RMB
  };
  defaultSystemPrompt: string;
  backstory: string; // 角色背景故事，用于开场
}

export interface ContractData {
  /** Contract template type */
  type: "supply" | "partnership" | "loan" | "lease" | "employment";
  /** Contract title */
  title: string;
  /** Contract parties */
  parties: {
    partyA: string;
    partyB: string;
  };
  /** Key terms of the contract */
  terms: string[];
  /** Financial details */
  financials: {
    amount: string;
    paymentTerms: string;
    duration: string;
  };
  /** Risk clauses */
  risks: string[];
  /** Special conditions */
  specialConditions?: string[];
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  /** Bonus/penalty to score */
  scoreModifier: number;
  /** Bonus/penalty to revenue (narrative currency) */
  revenueModifier: number;
  /** Decision coins gained/lost */
  coinModifier: number;
  /** Trait changes from this choice. trait: riskAppetite | dataDependency | collaborationTendency | innovationLevel */
  traitChanges?: { trait: string; direction: number; reason: string }[];
  /** Narrative consequence text */
  consequence: string;
}

export interface MainTask {
  id: string;
  type: "main";
  title: string;
  description: string;       // 叙事铺垫（免费展示）
  challenge: string;          // 核心挑战/问题（免费展示，不涉及AI提示）
  task: string;               // 锦囊（策略提示），需消耗决策币解锁
  hintCost: number;           // 解锁锦囊所需决策币
  data: string;               // 参考数据（免费展示，可展开查看）
  hiddenData?: string;        // 现实中难以获取的数据（如竞争对手情报），需消耗决策币解锁
  hiddenDataLabel?: string;   // 隐藏数据的标签（如"竞争对手情报"）
  hiddenDataCost?: number;    // 解锁隐藏数据所需决策币
  timeLimit: number;
  scoringWeight: number;
  rerollCost: number;
  tags: string[];
  /** 关卡间的故事承接过渡文本 */
  transition?: string;
  /** Optional decision options presented after scoring. If provided, player must choose one. */
  decisionOptions?: DecisionOption[];
  /** Optional contract data for contract-related tasks */
  contract?: ContractData;
}

export interface TriggerPoint {
  id: string;
  type: "trigger";
  title: string;
  description: string;
  trigger: {
    pool: string[];
    drawCount: number;
    crisisWeight: number;
    opportunityWeight: number;
  };
  transition?: string;
}

export interface Checkpoint {
  id: string;
  type: "checkpoint";
  title: string;
  description: string;
  checkpoint: {
    shop: boolean;
    reportSummary: boolean;
    isFinal?: boolean;
    narrative: string;
  };
  transition?: string;
}

export type RouteStep = MainTask | TriggerPoint | Checkpoint;

export interface DiceMapping {
  penalty: number;
  narrative: string;
}

export interface CrisisCard {
  id: string;
  type: "crisis";
  title: string;
  description: string;
  task: string;
  dice: {
    effect: string;
    mapping: Record<string, DiceMapping>;
  };
  mitigationCost: number;
  tags: string[];
}

export interface OpportunityCard {
  id: string;
  type: "opportunity";
  title: string;
  description: string;
  task: string;
  optional: boolean;
  reward: {
    decisionCoins?: number;
    score?: number;
    item?: string;
  };
  tags: string[];
  /** Follow-up mini-task the player must complete after accepting */
  followUpTask?: string;
  /** Reference data for the follow-up task */
  followUpData?: string;
}

export type EventCard = CrisisCard | OpportunityCard;

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  params?: Record<string, unknown>;
  limit: number;
}

export interface ScoringDimension {
  key: string;
  name: string;
  weight: number;
  description: string;
}

export interface Ending {
  id: string;
  title: string;
  minScore: number;
  maxScore: number;
  description: string;
  upgradeAdvice: string;
}

export interface GameStrings {
  welcome_title: string;
  welcome_subtitle: string;
  start_button: string;
  select_role_title: string;
  submit_button: string;
  reroll_button: string;
  next_level_button: string;
  shop_title: string;
  buy_button: string;
  dice_roll_button: string;
  accept_opportunity: string;
  decline_opportunity: string;
  final_report_title: string;
  play_again: string;
  back_home: string;
}

export interface ScenarioData {
  meta: {
    id: string;
    title: string;
    subtitle: string;
    version: string;
    author: string;
    theme: string;
    difficulty: string;
    estimatedTime: string;
    icon: string;
    description: string;
  };
  roles: Role[];
  /** 每个角色有独立的路线 */
  routes: Record<string, RouteStep[]>;
  eventPool: Record<string, EventCard[]>;
  shop: {
    items: ShopItem[];
  };
  scoring: {
    dimensions: ScoringDimension[];
    judgePrompt: string;
  };
  endings: Ending[];
  strings: GameStrings;
}

// ========== 社区小店主路线 ==========
const shopOwnerRoute: RouteStep[] = [
  {
    id: "task_1",
    type: "main",
    title: "盘清账目",
    description:
      "你的便利店开了三年，但一直没认真记账。这个月银行余额又见底了——你决定搞清楚钱到底花哪了。",
    challenge:
      "你的账目一团糟，钱不知道花哪了。你需要理清收支，找出最大的浪费，制定改善方案。",
    task:
      "你可以把经营数据整理后，让AI帮你：1）梳理收支明细表；2）计算各类毛利率和净利率；3）识别最大的三笔浪费并给出改进建议。",
    hintCost: 1,
    data: `【上月经营数据】
• 营业收入：日均620元×30天 = 18,600元
  - 烟酒类：约7,200元（毛利率18%）
  - 生鲜食品：约5,400元（毛利率25%）
  - 日用百货：约3,800元（毛利率32%）
  - 其他（充话费、代收快递）：约2,200元（毛利率5%）
• 进货成本：11,340元（综合毛利率约39%）
• 房租：3,500元/月（40平米，续签3年未涨价）
• 水电费：980元（含冰柜用电）
• 员工工资：5,000元（2名兼职，李姐2,800+小王2,200）
• 商品损耗：860元（过期牛奶、变质的蔬菜水果）
• 杂费（包装袋、清洁用品等）：320元`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["finance", "analysis"],
    transition: "三年来第一次把账算清楚，结果让你心里五味杂陈——原来不是没赚钱，而是钱都从指缝间溜走了。但你没有时间懊恼，省下的每一分钱都是明天的弹药。",
    decisionOptions: [
      {
        id: "task1_opt_a",
        title: "全面数字化记账",
        description: "投资购买智能收银系统和库存管理软件，实现自动记账和数据分析。初期投入较大，但长期收益显著。",
        scoreModifier: 2,
        revenueModifier: -2000,
        coinModifier: -1,
        traitChanges: [
          { trait: "innovationLevel", direction: 8, reason: "选择数字化转型" },
          { trait: "dataDependency", direction: 5, reason: "依赖数据系统" },
        ],
        consequence: "你花了2000元购买了一套智能收银系统。头两周你手忙脚乱地学，但第三周开始，你发现每天只需5分钟就能看清收支状况——省下的时间，你用来研究怎么赚钱。",
      },
      {
        id: "task1_opt_b",
        title: "精简手工记账",
        description: "用Excel模板手工记录，零成本启动。虽然效率有限，但足够应付当前规模的小店。",
        scoreModifier: 0,
        revenueModifier: 0,
        coinModifier: 1,
        traitChanges: [
          { trait: "riskAppetite", direction: -3, reason: "选择保守方案" },
        ],
        consequence: "你用Excel做了一个简单的收支表。虽然比以前清楚了，但每次进货、盘点还是要花大量时间手动录入。你开始理解为什么有人说：省小钱花大时间。",
      },
      {
        id: "task1_opt_c",
        title: "外包给会计公司",
        description: "找一家小代账公司帮你做账，每月费用500元。专业可靠，但你对数据的掌控力减弱。",
        scoreModifier: 1,
        revenueModifier: -500,
        coinModifier: 0,
        traitChanges: [
          { trait: "collaborationTendency", direction: 5, reason: "外包专业服务" },
          { trait: "dataDependency", direction: 3, reason: "依赖外部数据" },
        ],
        consequence: "代账公司每周给你发一份报表，数据清楚、格式专业。但你发现有些细节他们看不懂——比如为什么某天的损耗突然增加。数据有了，但洞见还得自己来。",
      },
    ],
  },
  {
    id: "task_2",
    type: "main",
    title: "优化成本",
    description:
      "账目理清后，你发现最大的浪费在进货和损耗上。老供应商张哥跟你合作三年了，但他最近涨价了两次。是时候重新审视你的供应链了。",
    challenge:
      "你的进货成本居高不下，老供应商还在涨价。你需要找到最优的采购方案，把成本至少降10%。",
    task:
      "你可以把三家供应商的报价和你的需求整理后，让AI帮你：1）对比各方案的总成本；2）结合起订量和库存限制筛选可行方案；3）计算切换供应商的过渡方案和节省金额。",
    hintCost: 1,
    data: `【三家供应商报价对比】
供应商A（老供应商张哥）：
  - 面粉：25元/袋（起订50袋）
  - 食用油：52元/桶（5L装，起订20桶）
  - 饮料：按指导价75折，但需月订货额满3000元
  - 优势：合作久、可月结、送货上门
  - 劣势：价格偏高、涨价频繁

供应商B（批发市场王老板）：
  - 面粉：22元/袋（起订100袋，需自己承担库存风险）
  - 食用油：48元/桶（起订30桶）
  - 饮料：按指导价7折，需现金结算
  - 优势：价格最低
  - 劣势：起订量高、需自行提货、不接受退换货

供应商C（社区团购供应链）：
  - 面粉：24元/袋（起订20袋，可随时退货）
  - 食用油：50元/桶（起订10桶，次日达）
  - 饮料：按指导价72折，满2000元包邮
  - 优势：灵活、支持小批量、可退货
  - 劣势：新平台、品质需要验证

你目前的月均进货需求：面粉约60袋，食用油约25桶，饮料月均约3500元。冰柜容量有限，最多多存1周的货。`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["cost", "comparison"],
    transition: "你拿着新的报价单，心里有了一丝底气。省下来的钱不多，但这是你第一次主动掌控成本——这种掌控感，比省下的钱更值钱。",
    contract: {
      type: "supply",
      title: "商品供货协议",
      parties: { partyA: "你的便利店", partyB: "供应商B（批发市场王老板）" },
      terms: [
        "供货范围：面粉、食用油、饮料等日常商品",
        "供货周期：每周两次，周二、周五送货",
        "质量标准：符合国家食品安全标准",
        "退换货条款：临期商品30天内可换，质量问题无条件退",
      ],
      financials: {
        amount: "月均采购额约8,000-12,000元",
        paymentTerms: "月结30天，每月5号前结清上月货款",
        duration: "一年，到期自动续约（需提前30天书面通知终止）",
      },
      risks: [
        "起订量要求较高（面粉100袋起），可能造成库存积压",
        "需自己承担运输或支付配送费（每次约150元）",
        "新供应商合作初期可能存在供货不稳定风险",
      ],
      specialConditions: [
        "首次合作需预付2,000元作为信誉保证金",
        "月采购额满8,000元享95折优惠",
      ],
    },
    decisionOptions: [
      {
        id: "task2_opt_a",
        title: "维持老供应商",
        description: "继续跟张哥合作，保持月结和送货上门的便利。虽然价格偏高，但三年的人情和信任是无价的。",
        scoreModifier: 0,
        revenueModifier: 0,
        coinModifier: 1,
        traitChanges: [
          { trait: "collaborationTendency", direction: 5, reason: "维护长期合作关系" },
          { trait: "riskAppetite", direction: -3, reason: "选择稳定方案" },
        ],
        consequence: "张哥听说你在比价后，主动给你降了3%。你发现人情有时候比价格更有弹性——只要你开口，老朋友不会让你太为难。",
      },
      {
        id: "task2_opt_b",
        title: "全面切换新供应商",
        description: "转向批发市场王老板，拿到最低价。但需要现金结算、自行提货，风险和压力都更大。",
        scoreModifier: 3,
        revenueModifier: 3000,
        coinModifier: -1,
        traitChanges: [
          { trait: "riskAppetite", direction: 8, reason: "大胆切换供应商" },
          { trait: "innovationLevel", direction: 3, reason: "尝试新模式" },
        ],
        consequence: "第一个月你省了3000元进货成本，但每周要花半天时间去批发市场提货。你的腰更疼了，但钱包鼓了。你开始琢磨：能不能找人拼车进货？",
      },
      {
        id: "task2_opt_c",
        title: "混合采购策略",
        description: "主力商品从张哥进货保稳定，日用品和饮料从新供应商拿省钱。两条腿走路，平衡成本和风险。",
        scoreModifier: 1,
        revenueModifier: 1500,
        coinModifier: 0,
        traitChanges: [
          { trait: "dataDependency", direction: 5, reason: "分析比价做出混合决策" },
          { trait: "innovationLevel", direction: 3, reason: "灵活组合方案" },
        ],
        consequence: "你用了一个下午算出了一笔明细账：张哥供面粉和食用油，王老板供饮料和零食，社区团购补零星品类。省了1500元，也没丢掉张哥的情分——这大概就是成年人的做法。",
      },
    ],
  },
  {
    id: "task_3",
    type: "main",
    title: "应对竞争",
    description:
      "你还没来得及高兴，对面就新开了一家「便利蜂」连锁店。开业第一天，它挂出了全场8折的横幅。这一周你的客流掉了25%，老顾客王阿姨都说'那边便宜些'。",
    challenge:
      "对面开了连锁店，客流掉了25%。你需要想出应对策略，但不能打价格战。",
    task:
      "你可以把自己的优势和劣势列出来，让AI帮你：1）做SWOT分析，找出差异化竞争点；2）制定不拼价格的竞争策略；3）给出3个可立即执行的战术动作。",
    hintCost: 2,
    data: `【你的店（个体经营）】
  - 营业时间：6:00-次日1:00（19小时）
  - 优势：熟客关系深（认识80%的顾客）、可赊账、能代收快递、凌晨还开门、蔬菜水果当日新鲜
  - 劣势：没有会员系统、商品种类少约30%、收银只能现金/微信、没有品牌背书
  - 月固定成本：约10,000元

社区人口：约800户，以30-45岁上班族和60岁以上老人为主。`,
    hiddenData: `【竞争对手情报（实地调查）】
连锁便利店：
  - 营业时间：7:00-23:00（16小时）
  - 优势：品牌知名度、APP会员系统（积分+优惠券）、商品SKU超2000种、自助收银、有冷藏便当和咖啡
  - 劣势：店员不认识社区居民、不能赊账、凌晨不开门、蔬菜水果品种少且不新鲜
  - 周边已有3家店（说明品牌有规模效应）`,
    hiddenDataLabel: "竞争对手情报（实地调查）",
    hiddenDataCost: 1,
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["strategy", "competition"],
    transition: "竞争让你从安逸中惊醒。你意识到，在连锁店的阴影下，你唯一的护城河就是'人情'和'灵活'。但光凭感觉不够，你需要把优势变成系统。",
  },
  {
    id: "event_trigger_1",
    type: "trigger",
    title: "突发状况",
    description: "在你调整策略的关键时刻，意想不到的事情发生了...",
    trigger: {
      pool: ["crisis_pool_A", "opportunity_pool_A"],
      drawCount: 1,
      crisisWeight: 0.6,
      opportunityWeight: 0.4,
    },
    transition: "你还没喘口气，命运就又给了你一个'惊喜'——做小生意就是这样，永远不知道下一个拐角等着什么。",
  },
  {
    id: "task_4",
    type: "main",
    title: "处理客户投诉",
    description:
      "老顾客赵阿姨在你店里买了一瓶酸奶，回家后发现过期两天了。她拍了照片发到了小区500人的业主群里，文字措辞激烈：「这家店居然卖过期食品！大家以后别去了！」群里有15条跟评，5人表示不再光顾，3人@了你的微信。",
    challenge:
      "群里炸了锅，5个人说不再光顾。你需要在心虚和考虑不周之间找到回应的节奏，化解这场信任危机。",
    task:
      "你可以把群里的评论和投诉细节整理好，让AI帮你：1）起草一份公开回应（诚恳但不卑微）；2）设计补偿方案；3）制定防止再犯的流程。",
    hintCost: 1,
    data: `【投诉详情】
• 商品：XX牌原味酸奶 200ml
• 生产日期：2024年8月15日
• 保质期：21天（即9月5日到期）
• 购买日期：9月7日（赵阿姨提供小票）
• 原因：你上周进货时没有及时把旧批次从冰柜撤出

【赵阿姨在群里的原话】
「我在xx便利店买了过期酸奶！幸亏我看了日期，要是给孩子喝了呢？这种店太不负责任了！」

【群里的跟评情况】
- 「真的假的？我也经常在那买」×3
- 「以后不去了」×5
- 「应该举报」×2
- 「也许是无意的吧」×3
- 「老板平时人挺好的」×2

你的微信目前被3个人@了，手机一直在响。`,
    timeLimit: 300,
    scoringWeight: 1.1,
    rerollCost: 1,
    tags: ["crisis", "communication"],
    transition: "这次危机让你出了一身冷汗。但危机也是转机——处理得当，反而能让街坊们看到你的诚意。你暗暗发誓，再也不会让这种事发生。",
  },
  {
    id: "task_5",
    type: "main",
    title: "考虑扩张",
    description:
      "风波平息后，你的生意反而因祸得福——赵阿姨帮你澄清了态度，一些老顾客更信任你了。这时候，隔壁的打印店老板说要转让店铺。你的心动了：两间门面打通，就能做更多事。",
    challenge:
      "隔壁店铺转让，扩张机会摆在眼前，但你的资金有限。你需要算清楚这笔账，决定是扩张还是暂缓。",
    task:
      "你可以把扩张的成本、收益和你的财务数据整理后，让AI帮你：1）列出所有成本项和预期收益；2）计算回本周期；3）给出'建议扩张'或'建议暂缓'的结论及资金筹措方案。",
    hintCost: 2,
    data: `【扩张相关数据】
隔壁店铺：
  - 转让费：28,000元（含2个月押金）
  - 月租：2,000元（比你现在多一倍）
  - 面积：35平米（打通后共75平米）

预期收益：
  - 新增日营业额：约180-250元（可以做生鲜专区+快递代收点）
  - 快递代收：每月约800元（与菜鸟驿站合作）
  - 生鲜专区：月毛利约2,000-3,000元

额外成本：
  - 多请1名员工：2,500元/月
  - 冰柜/货架添置：约6,000元（一次性）
  - 生鲜损耗：约500元/月

你目前的财务状况：
  - 账面可用资金：15,000元
  - 每月净利润：约3,200元
  - 银行可贷额度：20,000元（信用贷，年利率6.8%）`,
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["expansion", "risk_analysis"],
    transition: "扩张还是不扩张？你盯着计算器上的数字反复盘算。不管最终选什么，你都已经不是那个只会守店的老实人了——你学会了用数据说话。",
    contract: {
      type: "lease",
      title: "店铺租赁及转让协议",
      parties: { partyA: "房东（隔壁打印店产权人）", partyB: "你的便利店" },
      terms: [
        "租赁标的：隔壁打印店门面，面积35平米",
        "转让费：28,000元（含2个月押金），一次性支付",
        "月租金：2,000元/月，每两年递增5%",
        "用途限制：仅限零售及服务类经营，不得转租",
        "装修条款：租方可自行装修，但不得改变承重结构，退租时恢复原状",
      ],
      financials: {
        amount: "转让费28,000元 + 月租2,000元",
        paymentTerms: "转让费签约时一次性支付，月租每月1号前支付",
        duration: "3年，期满可优先续租（需提前60天书面通知）",
      },
      risks: [
        "转让费不可退还，如经营不善无法收回",
        "双倍月租压力（现有3,500+新增2,000=5,500元/月）",
        "需额外投入冰柜货架等约6,000元，增加固定成本",
        "银行贷款2万年利率6.8%，每月增加利息支出约113元",
      ],
      specialConditions: [
        "如3个月内退租，房东退还1个月押金",
        "如合同期内转让，需支付房东转让费10%作为手续费",
      ],
    },
    decisionOptions: [
      {
        id: "task5_shop_opt_a",
        title: "大胆扩张",
        description: "盘下隔壁店铺，贷款补足资金缺口。风险最大，但如果成功，营业额可以翻倍。",
        scoreModifier: 3,
        revenueModifier: -6000,
        coinModifier: -1,
        traitChanges: [
          { trait: "riskAppetite", direction: 10, reason: "选择高风险扩张" },
          { trait: "innovationLevel", direction: 5, reason: "开创全新经营模式" },
        ],
        consequence: "你签下了隔壁店铺的转让合同，又从银行贷了2万。头三个月是最难的——双倍房租、新人工资、冰柜添置——月支出多了近8000元。但第四个月起，生鲜专区和快递代收开始有回头客了。你赌对了，但后背全是冷汗。",
      },
      {
        id: "task5_shop_opt_b",
        title: "暂缓扩张，优化现有空间",
        description: "不盘店铺，但在现有空间内做微改造：增设快递代收点、优化货架布局。小步试错，稳中求进。",
        scoreModifier: 1,
        revenueModifier: 1000,
        coinModifier: 1,
        traitChanges: [
          { trait: "riskAppetite", direction: -3, reason: "选择稳妥优化" },
          { trait: "dataDependency", direction: 3, reason: "基于数据做渐进决策" },
        ],
        consequence: "你没有扩张，而是花500元做了货架调整，又花300元接入菜鸟驿站。月增收约1000元——不多，但零风险。你告诉自己：等积累够了再说，也是一种策略。",
      },
      {
        id: "task5_shop_opt_c",
        title: "合伙扩张",
        description: "找一个合伙人共同投资扩张，分摊风险和收益。需要让出部分控制权，但资金压力小很多。",
        scoreModifier: 2,
        revenueModifier: -2000,
        coinModifier: 0,
        traitChanges: [
          { trait: "collaborationTendency", direction: 8, reason: "选择合伙经营" },
          { trait: "riskAppetite", direction: 3, reason: "适度承担风险" },
        ],
        consequence: "你找到了李姐——就是那个在小区摆了8年水果摊的大姐。她出2万现金，你出店铺和管理。两人一拍即合：生鲜专区由她供货，利润五五分。店变大了，你也不再是一个人扛了。",
      },
    ],
  },
  {
    id: "checkpoint_1",
    type: "checkpoint",
    title: "中场结算",
    description:
      "你已经走到经营的中段。停下来，看看自己的成绩，补充一些装备。",
    checkpoint: {
      shop: true,
      reportSummary: true,
      narrative:
        "你从账目混乱的守店人，变成了一个会用数据做决策的经营者。前方的路还很长，但你已经不再是当初那个迷茫的店主。",
    },
    transition: "经营过半。你望着门口的人来人往，突然觉得这家小店不再只是谋生的工具——它是你在这个社区扎根的证明。",
  },
  {
    id: "task_6",
    type: "main",
    title: "团队管理",
    description:
      "店开了半年，员工从你一个人变成了三人的小团队。但老员工李姐和新来的小张之间出现了矛盾：李姐嫌小张毛躁，小张嫌李姐管太宽。今天两人又因为理货的事吵了一架，你不得不出面。",
    challenge:
      "两个员工吵起来了，谁都不能少。你需要调解矛盾，让团队重新运转起来。",
    task:
      "你可以把两人的信息和冲突经过整理后，让AI扮演HR顾问，帮你：1）设计1对1调解谈话脚本；2）制定新排班制度减少交叉；3）建立员工反馈机制。",
    hintCost: 1,
    data: `【员工信息】
李姐（50岁，收银员，工作3年）：
  - 月薪：2,800元
  - 优势：熟悉老顾客、做事细心、从不迟到
  - 诉求：「我干了三年，新来的不听我的，这店还有没有规矩？」
  - 性格：爱操心、说话直、有时强势

小张（22岁，理货员，工作2个月）：
  - 月薪：2,200元
  - 优势：干活快、会用电脑、有想法
  - 诉求：「我不是按她习惯摆的，但我有自己的方法。她总盯着我不放。」
  - 性格：年轻气盛、自尊心强、有点叛逆

冲突事件：小张把饮料区重新按品牌分类，李姐说「原来的摆法老顾客都习惯了，你别乱动」，小张回「这样更合理」。

你的顾虑：李姐走了收银没人顶，小张走了理货来不及。两个都不能少。`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["management", "communication"],
    transition: "调解完，你发现管理比进货难多了。货物不会跟你吵架，但人会。你开始理解为什么有人说：小老板最大的挑战不是生意，而是人。",
  },
  {
    id: "task_7",
    type: "main",
    title: "节日营销",
    description:
      "中秋节快到了，这是下半年最重要的消费节点。隔壁连锁店已经挂出了「满100减20」的海报。你决定不跟他们打价格战，而是用社区温情来赢——但温情也得有方案。",
    challenge:
      "中秋是消费旺季，连锁店已经打起了价格战。你不想拼价格，但温情也得有方案，预算只有800元。",
    task:
      "你可以把社区画像和你的资源整理后，让AI帮你：1）策划一个社区温情主题的中秋活动；2）设计线上线下推广方案；3）估算新增客流和营业额提升。",
    hintCost: 1,
    data: `【社区画像】
• 总户数：约800户
• 人口结构：30-45岁上班族约40%，60岁以上老人约30%，儿童约20%
• 你店的辐射范围：步行5分钟内的3栋楼+1个老旧小区
• 客单价：平均18元

【你的资源】
• 老顾客微信群：186人（活跃度约60%）
• 可用的社区公告栏：2块（物业免费）
• 可联系的居委会：1个（之前赞助过社区活动）
• 可投入的预算：800元

【往年同期数据】
• 去年中秋前一周日营业额：约900元
• 平时日均：约620元`,
    hiddenData: `【竞争对手促销方案详情】
连锁店：「满100减20」「充值200送30」「到店即送月饼1块」
社区超市：「中秋礼盒8折」「满50抽奖」`,
    hiddenDataLabel: "竞争对手促销方案详情",
    hiddenDataCost: 1,
    timeLimit: 360,
    scoringWeight: 1.1,
    rerollCost: 1,
    tags: ["marketing", "planning"],
    transition: "中秋活动让你第一次尝到了'策划'的甜头。虽然预算不多，但你发现，用心比花钱更管用。社区里的街坊，要的其实不是便宜，而是被记住。",
  },
  {
    id: "event_trigger_2",
    type: "trigger",
    title: "命运转折",
    description: "中秋节刚过，一件影响你未来的大事发生了...",
    trigger: {
      pool: ["crisis_pool_B", "opportunity_pool_B"],
      drawCount: 1,
      crisisWeight: 0.5,
      opportunityWeight: 0.5,
    },
    transition: "你正沾沾自喜于中秋的业绩，生活却提醒你：别太得意。",
  },
  {
    id: "task_8",
    type: "main",
    title: "做出抉择",
    description:
      "前同事老周找到你，他在做社区团购，已经拉了3个小区的群，月流水6万。他想拉你入伙——你出店面做自提点，他出供应链。但这就意味着你要把一半精力分给团购，守店的时间会减少。",
    challenge:
      "老周拉你入伙做团购，但守店和团购不能兼顾。两条路各有利弊，你需要做出取舍。",
    task:
      "你可以把两条路径的数据整理后，让AI帮你：1）对比3年财务预测；2）评估各自风险；3）给出明确的取舍建议和理由。",
    hintCost: 2,
    data: `【合伙方案详情】
出资：你出2万元（占40%股份）
老周：出供应链资源+运营（占60%股份）
预计月收入：5,000-8,000元分红
但每天需投入6-8小时处理订单和配送
店面需划出20平米做自提点

【守店方案详情】
目前月净利润：约4,000元
稳定但增长空间有限
如果能接下菜鸟驿站：月增收约1,200元

【关键问题】
• 你的体力能否同时兼顾守店+团购？
• 老周靠谱吗？（他是你前同事，共事2年，人脉广但做事偶尔虎头蛇尾）
• 社区团购的风口还能持续多久？
• 如果合伙失败，你的2万元能拿回来吗？`,
    timeLimit: 360,
    scoringWeight: 1.3,
    rerollCost: 2,
    tags: ["decision", "career"],
    transition: "你终于做出了选择——不管选了哪条路，这一刻你都感到一种从未有过的清醒。决策的本质不是找到完美答案，而是敢于为不完美的答案负责。",
    contract: {
      type: "partnership",
      title: "社区团购合伙经营协议",
      parties: { partyA: "你的便利店", partyB: "老周（社区团购运营方）" },
      terms: [
        "合作模式：甲方出店面作为自提点，乙方出供应链及运营管理",
        "出资比例：甲方出资20,000元占40%股份，乙方以供应链资源及运营管理占60%股份",
        "利润分配：按出资比例分配（甲方40%，乙方60%）",
        "店面使用：甲方需划出20平米作为自提仓储区",
        "时间投入：甲方每日需投入6-8小时处理订单及配送",
        "决策机制：重大经营决策需双方协商一致，日常运营由乙方主导",
      ],
      financials: {
        amount: "甲方出资20,000元，预计月分红5,000-8,000元",
        paymentTerms: "分红按月结算，次月5号前支付上月分红",
        duration: "2年，期满可续约（需提前30天书面通知）",
      },
      risks: [
        "乙方做事虎头蛇尾的历史记录可能导致项目运营不稳定",
        "20,000元出资如项目失败可能无法全额收回",
        "甲方需分出大量精力处理团购，可能影响主业经营",
        "社区团购市场风口不确定性，政策风险较高",
      ],
      specialConditions: [
        "如连续3个月月分红低于3,000元，甲方有权要求退出并退还50%出资",
        "试用期内（前3个月）任何一方可无责退出，出资全额退还",
        "如乙方违约，需双倍退还甲方出资",
      ],
    },
    decisionOptions: [
      {
        id: "task8_shop_opt_a",
        title: "入伙团购",
        description: "和老周合伙做社区团购，你出店面做自提点，他出供应链。月收入可能翻倍，但要分出精力和店面空间。",
        scoreModifier: 3,
        revenueModifier: 5000,
        coinModifier: -1,
        traitChanges: [
          { trait: "riskAppetite", direction: 8, reason: "选择高风险高回报" },
          { trait: "collaborationTendency", direction: 5, reason: "与人合伙经营" },
        ],
        consequence: "你投了2万元入股。头两周订单不多，但老周运营能力强，第三周开始日均30单。你每天要花4小时处理自提，守店时间少了——但月底分红6000元到账的时候，你觉得值了。",
      },
      {
        id: "task8_shop_opt_b",
        title: "坚守守店",
        description: "专心经营便利店，接下菜鸟驿站增收。收入不如团购但有积累性，而且一切尽在掌控。",
        scoreModifier: 1,
        revenueModifier: 2000,
        coinModifier: 1,
        traitChanges: [
          { trait: "riskAppetite", direction: -5, reason: "选择稳定路线" },
          { trait: "dataDependency", direction: 3, reason: "基于现有数据做决策" },
        ],
        consequence: "你谢绝了老周，安心守店。菜鸟驿站接入了，每月多1200元。你把省下的精力用来优化选品和客户关系。有人笑你保守，但你知道：适合自己的路，才是最好的路。",
      },
      {
        id: "task8_shop_opt_c",
        title: "试水半合伙",
        description: "先试合作3个月，不出资只出场地，利润三七分。如果效果好再追加投入，效果不好也能退出。",
        scoreModifier: 2,
        revenueModifier: 3000,
        coinModifier: 0,
        traitChanges: [
          { trait: "riskAppetite", direction: 3, reason: "选择折中试水方案" },
          { trait: "innovationLevel", direction: 5, reason: "设计灵活合作模式" },
        ],
        consequence: "你跟老周谈了个试用方案：你只出场地，不出钱，3个月试合作。结果出乎意料——自提点流量给你带来了新客源，便利店营业额也涨了15%。有时候，不一定非要二选一，第三条路可能更好。",
      },
    ],
  },
  {
    id: "task_9",
    type: "main",
    title: "实施计划",
    description: "你已经做出了选择。现在，把它变成行动。坐而论道容易，起而行之难——你需要一份能落地的执行计划。",
    challenge:
      "选择已做，行动开始。你需要把决定变成一份能落地的3个月执行计划。",
    task:
      "你可以根据你的选择，让AI帮你：1）按周分解时间表；2）标注关键里程碑；3）列出所需资源及获取方式；4）识别3个最大风险并给出预案。",
    hintCost: 2,
    data: "（系统将根据你在上一关的选择，自动填充守店方案或转型方案的上下文）",
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["execution", "planning"],
    transition: "计划赶不上变化，但没有计划连变化的机会都没有。你把打印出来的计划贴在收银台后面——它既是路线图，也是你的军令状。",
  },
  {
    id: "event_trigger_3",
    type: "trigger",
    title: "最终考验",
    description: "就在你全力推进计划时，最后一个意外出现了...",
    trigger: {
      pool: ["crisis_pool_C", "opportunity_pool_C"],
      drawCount: 1,
      crisisWeight: 0.7,
      opportunityWeight: 0.3,
    },
    transition: "你以为熬过了最难的时候，但生活总有最后一道考题等着你。这一次，你发现自己比以前冷静得多。",
  },
  {
    id: "task_10",
    type: "main",
    title: "最终冲刺",
    description:
      "三个月的计划走到了尾声。你从那个连账都算不清的守店人，变成了一个会管人、会做营销的小老板。现在，你需要做一件事：复盘。",
    challenge:
      "三个月的经营之旅即将结束。你需要复盘所有决策，看看哪些做对了，哪些有遗憾。",
    task:
      "你可以把所有决策记录整理后，让AI帮你：1）按时间线梳理每个关键决策；2）标注哪些正确、哪些有遗憾；3）提炼3条最深的经营感悟。",
    hintCost: 1,
    data: "（系统自动汇总你在前9个任务中的关键决策和评分）",
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["review", "summary"],
  },
  {
    id: "checkpoint_final",
    type: "checkpoint",
    title: "最终结算",
    description: "你的经营之旅到此结束。无论结局如何，这段经历都已刻入你的决策基因。",
    checkpoint: {
      shop: false,
      reportSummary: true,
      isFinal: true,
      narrative:
        "你从一间混乱的小店开始，经历了竞争、危机、抉择、转型。这段路上最珍贵的不是赚了多少钱，而是你学会了如何思考。",
    },
  },
];

// ========== 42岁被裁者路线 ==========
const laidOffRoute: RouteStep[] = [
  {
    id: "task_1",
    type: "main",
    title: "失业第一天",
    description:
      "今天是你被裁后的第一个工作日。你坐在出租屋里，看着手机里的银行余额——32,600元，这是你全部的家当。但隔壁小区门口有个10平米的小卖部要转让，转让费8,000元。你决定搏一把。",
    challenge:
      "你手头只有3万出头，一个小卖部要转让。你需要判断值不值得盘，以及自己的钱够撑多久。",
    task:
      "你可以把自己的资金状况和小卖部信息整理后，让AI帮你：1）评估小卖部值不值得盘；2）计算手头的钱够撑多久；3）列出开业前必须搞定的5件事。",
    hintCost: 1,
    data: `【你的现状】
• 年龄：42岁，前互联网公司运营主管
• 被裁补偿：N+1共到手52,000元（已支付房租和信用卡后剩余32,600元）
• 月支出：房租3,200元 + 生活费2,500元 + 孩子教育1,500元 = 7,200元
• 可用资金：32,600元

【小卖部信息】
• 位置：老旧小区门口，临街
• 面积：10平米
• 转让费：8,000元（含押金2,000元+现有货架和冰柜）
• 月租：1,800元
• 上家说日均营业额约500元
• 周边情况：3栋老居民楼（约240户），1个幼儿园，方圆200米内没有其他便利店

【你的顾虑】
• 从来没做过生意，连进货渠道都没有
• 身体不太好，腰椎间盘突出，不能久站
• 妻子反对，说「你一个坐办公室的去卖货？丢人」`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["startup", "analysis"],
    transition: "你签下了转让合同，手抖了一下。32,600变成了24,600。你告诉自己：这不是花掉，是投资。但投资和赌博之间的界限，你暂时还看不清。",
  },
  {
    id: "task_2",
    type: "main",
    title: "第一次进货",
    description:
      "小卖部接手了，但货架空了一大半。你站在批发市场门口，被五花八门的商品和价格搞晕了。你以前管理过上亿的项目预算，却被几百块的进货难住了。",
    challenge:
      "货架空了一大半，你只有5000元进货预算，却不知道该进什么。你需要制定一份能赚钱的进货清单。",
    task:
      "你可以把店铺条件和消费特征整理后，让AI帮你：1）制定首月进货清单；2）优先保证高频刚需品；3）预估每类商品的周转天数。",
    hintCost: 1,
    data: `【店铺条件】
• 面积：10平米（含1台冰柜、3组货架、1个收银台）
• 冰柜容量：约0.5立方米（只能放饮料和少量冷冻品）
• 货架层数：3组×4层 = 12层
• 每层可陈列：约20-30件商品

【周边消费特征】（你的观察）
• 早上：上班族买早餐+饮料（7:00-9:00高峰）
• 中午：幼儿园家长接孩子买零食（11:00-12:00）
• 晚上：居民买日用品、啤酒饮料（17:00-21:00）
• 凌晨：基本没有客流

【你目前的资金】
• 可用现金：24,600元（转让费已付）
• 月固定支出：7,200元
• 首月进货预算：不超过5,000元

【批发市场信息】
• 饮料：指导价6-7折
• 零食：指导价5-6折
• 烟：毛利极低（约5%）但引流
• 日用品：毛利高（30-40%）但周转慢`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["purchasing", "planning"],
    transition: "你扛着两大袋货从批发市场走回来，腰疼得直不起来。但看着货架一点点填满，你心里有了一种奇怪的安全感——这是你的店，这些货是你的底气。",
  },
  {
    id: "task_3",
    type: "main",
    title: "学会定价",
    description:
      "开业第一周，你发现一个问题：你定的价格要么比隔壁超市贵、要么便宜到亏本。李姐（隔壁水果摊的大姐）好心告诉你：「你这价格不行，要按'感觉'来。」但你的'感觉'还不太靠谱。",
    challenge:
      "你定的价格要么比超市贵、要么亏本卖。你需要找到合理的定价，让客人不嫌贵、自己不亏钱。",
    task:
      "你可以把价格问题和周边参考整理后，让AI帮你：1）制定5类核心商品的定价原则；2）标出每类目标毛利率；3）区分'不能亏本'和'可以引流'的商品。",
    hintCost: 2,
    data: `【你目前的价格问题】
• 矿泉水：进价1.2元，你卖2元（隔壁超市1.5元）→ 客人嫌贵
• 方便面：进价2.8元，你卖3.5元（毛利率25%还行）
• 啤酒：进价3元，你卖3.5元（隔壁小卖部卖4元）→ 太便宜
• 薯片：进价4.5元，你卖5元（毛利才11%）→ 亏本
• 酱油：进价6元，你卖7元（这种调味品一年卖不了几瓶）

【你的目标】
• 月营业额至少12,000元（覆盖成本）
• 综合毛利率目标：30%以上
• 不能让客人觉得'这家店比超市还贵'`,
    hiddenData: `【周边竞品价格调查】
• 社区超市：价格低、SKU多，但远（步行10分钟）
• 水果摊李姐：水果和部分零食，价格适中
• 菜鸟驿站：不卖东西但人流量大`,
    hiddenDataLabel: "周边竞品价格调查",
    hiddenDataCost: 1,
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["pricing", "strategy"],
    transition: "定价这事儿让你领悟到一个道理：卖东西不是简单地'加个价'，而是一场心理博弈。太贵没人买，太便宜自己亏——中间那个甜蜜点，需要数据来帮你找。",
  },
  {
    id: "event_trigger_1",
    type: "trigger",
    title: "突发状况",
    description: "刚摸出点门道，意外就来了...",
    trigger: {
      pool: ["crisis_pool_A", "opportunity_pool_A"],
      drawCount: 1,
      crisisWeight: 0.6,
      opportunityWeight: 0.4,
    },
    transition: "你以为最难的是起步，没想到维持才是。做小生意就像走钢丝，随时可能来一阵风。",
  },
  {
    id: "task_4",
    type: "main",
    title: "融入社区",
    description:
      "开店一个月了，你发现一个残酷的事实：你的店虽然位置好，但街坊们还是习惯去老地方。你是个外来者——在这个住了三代人的社区里，你不属于任何一条人脉链。你需要快速建立信任。",
    challenge:
      "你是个外来者，街坊们不认识你也不信任你。你需要快速融入社区，让更多人走进你的店。",
    task:
      "你可以把社区社交地图和你的优势整理后，让AI帮你：1）设计一套低成本社区融入方案；2）找到2-3个社区KOL建立关系；3）规划30天行动路线。",
    hintCost: 1,
    data: `【社区社交地图】
• 居委会主任：张阿姨，60多岁，说话管用，你见过一次
• 快递小哥：小刘，每天来3趟，认识所有人
• 水果摊李姐：在这摆了8年，是社区信息中心
• 幼儿园保安：老王，接孩子的家长都认识他
• 广场舞队长：赵大妈，每天晚上带20多人跳操

【你目前的社交情况】
• 认识的居民：约15人（都是买东西时聊了几句）
• 微信好友（社区居民）：8人
• 业主群：你加进去了但从来没发过言
• 居委会活动：从没参加过

【你的个人优势】
• 互联网运营经验（你知道怎么做活动）
• 脾气好、有耐心
• 会用各种APP（外卖、团购、短视频）`,
    timeLimit: 300,
    scoringWeight: 1.1,
    rerollCost: 1,
    tags: ["community", "networking"],
    transition: "你开始主动跟每个人打招呼，记住了王大爷爱喝二锅头、刘阿姨的孩子上中班。这些琐碎的信息，编织成了你在社区的安全网。",
  },
  {
    id: "task_5",
    type: "main",
    title: "数字转型",
    description:
      "你发现越来越多的邻居在手机上下单买菜，你的小卖部客流被线上一点点蚕食。你管理过上亿的项目，现在却连一个外卖平台都不会接——该改变了。",
    challenge:
      "线上渠道在蚕食你的客流，你却连外卖平台都不会接。你需要找到最适合自己的数字化路径。",
    task:
      "你可以把目前的数字化水平和可选渠道整理后，让AI帮你：1）筛选最适合你的3个线上渠道；2）说明接入方法；3）制定1个月试运营计划，预算不超过500元/月。",
    hintCost: 2,
    data: `【你目前的数字化水平】
• 收款：微信收款码+支付宝（没有聚合码）
• 记账：手写笔记本
• 进货：批发市场现场采购（不会线上下单）
• 客户管理：无
• 外卖平台：都没接入

【可选的线上渠道】
1. 美团/饿了么外卖（佣金15-20%）
2. 微信社群团购（零佣金，需运营）
3. 抖音本地生活（需要拍短视频）
4. 菜鸟驿站代收点（加盟费1,000元）
5. 社区团购平台（多多买菜、橙心优选等自提点合作）

【你的客观条件】
• 店面太小，外卖打包影响在店客人
• 你自己一个人，高峰期忙不过来
• 手机是3年前的华为，还能用
• 你会用Excel，但不会做小程序`,
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["digital", "transformation"],
    transition: "你花了整整一个下午接入了微信社群团购。看着手机上第一笔线上订单，你突然觉得：42岁，人生才刚开始第二幕。",
    decisionOptions: [
      {
        id: "task5_laidoff_opt_a",
        title: "入驻外卖平台",
        description: "接入美团和饿了么，快速获取线上订单。但佣金高达15-20%，且需要全天候接单。",
        scoreModifier: 2,
        revenueModifier: -1500,
        coinModifier: 0,
        traitChanges: [
          { trait: "innovationLevel", direction: 5, reason: "接入外卖平台" },
          { trait: "riskAppetite", direction: 5, reason: "承担佣金风险" },
        ],
        consequence: "你花了500元押金接入了美团外卖。头两周日订单只有2-3单，但第三周开始增长到8单。问题是每单利润不到3块——你不甘心，决定研究如何提高客单价。",
      },
      {
        id: "task5_laidoff_opt_b",
        title: "社群+私域运营",
        description: "建立微信社群，零佣金运营。成本低但见效慢，需要持续投入精力维护关系。",
        scoreModifier: 1,
        revenueModifier: 2000,
        coinModifier: 1,
        traitChanges: [
          { trait: "collaborationTendency", direction: 5, reason: "建立社群关系" },
          { trait: "innovationLevel", direction: 8, reason: "创新私域运营模式" },
        ],
        consequence: "你建了一个「小刘的邻里好物」微信群，从8个好友开始，每天发商品和优惠。一个月后群里有了86人，线上订单占了你营业额的15%。零佣金，全是利润——你终于找到了自己的节奏。",
      },
      {
        id: "task5_laidoff_opt_c",
        title: "菜鸟驿站+社区团购",
        description: "接入菜鸟驿站引流，同时成为社区团购自提点。组合拳打法，一石二鸟。",
        scoreModifier: 2,
        revenueModifier: -1000,
        coinModifier: -1,
        traitChanges: [
          { trait: "collaborationTendency", direction: 8, reason: "合作接入平台" },
          { trait: "dataDependency", direction: 3, reason: "利用平台数据" },
        ],
        consequence: "你花1000元加盟了菜鸟驿站，又成为橙心优选的自提点。每天取快递的人多了，顺手买东西的也多了。虽然团购提成只有5%，但客流是真金白银。你的店，变成了社区的'据点'。",
      },
    ],
  },
  {
    id: "checkpoint_1",
    type: "checkpoint",
    title: "中场结算",
    description:
      "你已经走到经营的中段。停下来，看看自己的成绩，补充一些装备。",
    checkpoint: {
      shop: true,
      reportSummary: true,
      narrative:
        "你从一个被裁的中年人，变成了一个正在学会做小生意的新手。前方的路还很长，但你已经不是那个失业第一天手足无措的人了。",
    },
    transition: "中场休息。你靠着货架喝了一瓶自己店里的水，第一次觉得这水的味道还不错——这是你自己挣来的。",
  },
  {
    id: "task_6",
    type: "main",
    title: "家庭沟通",
    description:
      "妻子一直反对你开店。昨晚她终于说出了心里话：「你一个月才挣3000块，还不如去送外卖。孩子学费怎么办？房贷怎么办？」你的父母也在电话里劝你'找份正经工作'。",
    challenge:
      "妻子质疑你开店的决定，父母也劝你回去上班。你需要用事实和计划说服他们，但不能画饼。",
    task:
      "你可以把真实的经营数据和家庭财务压力整理后，让AI帮你：1）设计6个月改善计划；2）准备应对3个最尖锐质疑的话术；3）用诚恳但有力的方式呈现你的理由。",
    hintCost: 1,
    data: `【你的经营现状（真实数据）】
• 开店3个月，月均营业额：约8,500元
• 月均净利润：约2,800元（不到你之前工资的一半）
• 客流趋势：缓慢上升（第1月日均35人→第3月日均52人）
• 线上订单：从0增长到日均8单

【家庭财务压力】
• 房贷：每月3,200元
• 孩子学费（幼儿园）：每月1,500元
• 生活费：约3,000元
• 你的店铺月支出：约5,200元

【妻子的诉求】
• 月收入至少6,000元以上才'值得'
• 你每天工作14小时，身体越来越差
• 「同龄人都在上班，你在守店，说出去不好听」

【你的信念】
• 客流在增长，趋势是好的
• 你已经学会了基本经营，再坚持2-3个月应该能稳定
• 送外卖收入可能更高，但没有积累性`,
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["communication", "family"],
    transition: "你跟妻子谈了整整两个小时。她没有完全被说服，但同意再给你3个月。这3个月，你比任何时候都清楚：不只是店要活下去，你的承诺也要兑现。",
  },
  {
    id: "task_7",
    type: "main",
    title: "打造爆款",
    description:
      "你注意到一个现象：社区里有很多上班族早上来不及吃早餐，而你的店就在小区门口。附近500米内没有早餐店。这可能是一个突破口。",
    challenge:
      "社区很多人来不及吃早餐，你的店就在门口。你需要设计一个早餐专区，用最少的投入抓住这波需求。",
    task:
      "你可以把店铺条件和可选品类整理后，让AI帮你：1）筛选不超过8种早餐品类；2）计算毛利率和预期月增收；3）规划备货和出餐流程。",
    hintCost: 1,
    data: `【你的条件】
• 店门口可以摆1张折叠桌（约1.2米×0.6米）
• 有一台微波炉
• 有一个蒸锅（但不适合在店里长时间蒸煮）
• 冰柜里可以放冷冻半成品

【可选品类】
• 冷冻包子/烧麦（微波炉加热，2分钟）
• 茶叶蛋（提前煮好保温）
• 豆浆（冲泡型或预制袋装）
• 三明治（预制冷藏）
• 粥品（罐装加热）
• 玉米（提前煮好保温）
• 手抓饼（冷冻半成品，需煎制5分钟）
• 饭团（预制冷藏）`,
    hiddenData: `【周边早餐市场调查】
• 最近的早餐店：步行8分钟，包子铺，排队5-10分钟
• 连锁便利店早餐：需要走12分钟到地铁站
• 社区居民习惯：60%在家吃，30%路上买，10%不吃`,
    hiddenDataLabel: "周边早餐市场调查",
    hiddenDataCost: 1,
    timeLimit: 360,
    scoringWeight: 1.1,
    rerollCost: 1,
    tags: ["product", "innovation"],
    transition: "早餐专区的效果超出了你的预期——早上7点到9点，你的小卖部变成了社区最热闹的地方。你终于找到了自己的节奏：不是跟别人比价格，而是比方便。",
  },
  {
    id: "event_trigger_2",
    type: "trigger",
    title: "命运转折",
    description: "生意刚有起色，一个意外打乱了你的计划...",
    trigger: {
      pool: ["crisis_pool_B", "opportunity_pool_B"],
      drawCount: 1,
      crisisWeight: 0.5,
      opportunityWeight: 0.5,
    },
    transition: "你刚觉得自己站稳了脚跟，命运提醒你：站稳不等于站牢。",
  },
  {
    id: "task_8",
    type: "main",
    title: "做出抉择",
    description:
      "你原来的部门主管联系你，说公司缺人，愿意以80%的薪资（约12,000元/月）让你回去。同时，隔壁小区的物业经理提议：在他的小区开第二家店，你供货他出场地，利润五五分。",
    challenge:
      "前公司叫你回去，物业提议开分店，你还可以继续深耕。三条路摆在你面前，你只能选一条。",
    task:
      "你可以把三条路径的数据整理后，让AI帮你：1）对比各路风险和收益；2）给出1年后财务预测；3）分析哪条路最符合你的长期目标。",
    hintCost: 2,
    data: `【选项A：回公司上班】
• 月薪：12,000元（比之前少3,000元）
• 优势：稳定收入、社保公积金、不用操心
• 劣势：可能再次被裁、42岁上升空间有限、放弃已有经营积累
• 小卖部：需转让或交给妻子打理（她不太愿意）

【选项B：守店+开分店】
• 合伙方式：物业出场地（免租3个月），你出货和管理
• 预计分店月利润：2,000-3,000元（你的50%）
• 总收入预估：2,800+1,500 = 4,300元/月
• 风险：你一个人管两家店？精力跟得上吗？

【选项C：留在店里深耕】
• 目前月利润：约3,500元（早餐专区上线后提升）
• 预计6个月后：约5,000-6,000元/月
• 优势：你最了解这个社区、积累在增长
• 劣势：收入仍低于上班、长期天花板明显`,
    timeLimit: 360,
    scoringWeight: 1.3,
    rerollCost: 2,
    tags: ["decision", "career"],
    transition: "你盯着手机上主管发来的消息，又看了看店里正在买早餐的客人。两条完全不同的路，这一次你比任何时候都清醒。",
    decisionOptions: [
      {
        id: "task8_laidoff_opt_a",
        title: "回公司上班",
        description: "接受前公司80%薪资回归，稳定收入、社保公积金。但可能再次被裁，且放弃经营积累。",
        scoreModifier: 0,
        revenueModifier: 8000,
        coinModifier: 2,
        traitChanges: [
          { trait: "riskAppetite", direction: -8, reason: "选择回归稳定" },
          { trait: "dataDependency", direction: 3, reason: "基于理性分析做决定" },
        ],
        consequence: "你回到了格子间。月薪12000，五险一金，朝九晚六。但每天下班路过小卖部，你都会多看一眼。那个接手你店的新老板，把早餐专区做得风生水起。你告诉自己：没有遗憾，只有选择。",
      },
      {
        id: "task8_laidoff_opt_b",
        title: "开分店扩张",
        description: "和物业经理合伙开第二家店，你供货管理，他出场地。收入可能翻倍，但精力会被严重分散。",
        scoreModifier: 3,
        revenueModifier: -3000,
        coinModifier: -1,
        traitChanges: [
          { trait: "riskAppetite", direction: 8, reason: "选择扩张风险" },
          { trait: "collaborationTendency", direction: 5, reason: "合伙经营" },
        ],
        consequence: "你跟物业经理签了合伙协议。第一家店的利润养第二家店的亏损，头三个月你瘦了10斤。但第四个月，分店终于盈亏平衡了。两个店、五个员工——你从被裁的中年人，变成了一个小微企业主。",
      },
      {
        id: "task8_laidoff_opt_c",
        title: "深耕现有门店",
        description: "集中精力优化单店，把早餐专区做大、把社群做深。不冒进，但稳扎稳打。",
        scoreModifier: 1,
        revenueModifier: 3000,
        coinModifier: 1,
        traitChanges: [
          { trait: "riskAppetite", direction: -2, reason: "选择深耕策略" },
          { trait: "innovationLevel", direction: 3, reason: "优化现有模式" },
        ],
        consequence: "你拒绝了主管，也没开分店。把全部精力放在一家店上：早餐品类从6种增到12种，微信群扩到200人。月利润从3500涨到5500。不多，但每一分钱都是你自己挣的。有时候，少即是多。",
      },
    ],
  },
  {
    id: "task_9",
    type: "main",
    title: "实施计划",
    description: "选择已做，行动开始。你把前公司群里那些PPT技巧用在了自己的计划书上——这一次，你是自己的CEO。",
    challenge:
      "选择已做，行动开始。你需要把决定变成一份能落地的3个月执行计划。",
    task:
      "你可以根据你的选择，让AI帮你：1）按周分解时间表；2）标注关键里程碑；3）列出所需资源；4）识别最大风险并给出预案。",
    hintCost: 2,
    data: "（系统将根据你在上一关的选择，自动填充相关方案的上下文）",
    timeLimit: 360,
    scoringWeight: 1.2,
    rerollCost: 2,
    tags: ["execution", "planning"],
    transition: "计划执行到第二周就出了偏差——但这不再让你慌张。你已经习惯了：调整、迭代、再出发。这大概就是'创业者思维'吧。",
  },
  {
    id: "event_trigger_3",
    type: "trigger",
    title: "最终考验",
    description: "就在你全力推进计划时，最后一个意外出现了...",
    trigger: {
      pool: ["crisis_pool_C", "opportunity_pool_C"],
      drawCount: 1,
      crisisWeight: 0.7,
      opportunityWeight: 0.3,
    },
    transition: "你发现自己面对这次意外时，没有慌。三个月前你可能会，但现在不会了。这就是成长吗？",
  },
  {
    id: "task_10",
    type: "main",
    title: "最终冲刺",
    description:
      "三个月的计划走到了尾声。你从那个失业后手足无措的中年人，变成了一个能独当一面的小老板。不管最终结局如何，这段经历已经改变了你。现在，是时候复盘了。",
    challenge:
      "三个月的创业之旅即将结束。你需要复盘所有决策，看看哪些做对了，哪些有遗憾。",
    task:
      "你可以把所有决策记录整理后，让AI帮你：1）按时间线梳理每个关键决策；2）标注哪些正确、哪些有遗憾；3）提炼3条最深的人生感悟。",
    hintCost: 1,
    data: "（系统自动汇总你在前9个任务中的关键决策和评分）",
    timeLimit: 300,
    scoringWeight: 1.0,
    rerollCost: 1,
    tags: ["review", "summary"],
  },
  {
    id: "checkpoint_final",
    type: "checkpoint",
    title: "最终结算",
    description: "你的经营之旅到此结束。无论结局如何，这段经历都已刻入你的决策基因。",
    checkpoint: {
      shop: false,
      reportSummary: true,
      isFinal: true,
      narrative:
        "你从失业的阴霾中走出，在一间10平米的小店里重新找到了自己的位置。这段路教会你的，远不止怎么做生意。",
    },
  },
];

export const scenarioData: ScenarioData = {
  meta: {
    id: "small_business_v1",
    title: "小本经营破局",
    subtitle: "经营你的社区小店，用AI对话杀出一条路",
    version: "2.0",
    author: "决策回响",
    theme: "business",
    difficulty: "beginner",
    estimatedTime: "45分钟",
    icon: "🏪",
    description:
      "你是一家社区小店的店主。从账目混乱、竞争激烈到面临转型，你需要与AI深度对话，做出理性的经营决策。",
  },

  roles: [
    {
      id: "shop_owner",
      name: "社区小店主",
      description:
        "你经营着一家社区便利店，开了三年，生意下滑。你必须用AI找到出路。",
      startingResources: { decisionCoins: 5, maxItems: 3, baseMonthlyRevenue: 18600 },
      defaultSystemPrompt:
        "你是一位谨慎但渴望成长的社区小店主。你对街坊邻里充满感情，但也不得不面对残酷的商业竞争。请以这个身份思考问题。",
      backstory:
        "三年前，你用全部积蓄盘下了这间社区便利店。起初生意还不错，但最近一年，电商冲击、连锁店开到门口、老顾客逐渐流失……你决定不再坐以待毙，开始学会用AI来帮助自己做出更好的决策。",
    },
    {
      id: "laid_off",
      name: "42岁被裁者",
      description:
        "你刚被公司裁员，手头有3个月生活费。你决定盘下一家小卖部重新开始。",
      startingResources: { decisionCoins: 3, maxItems: 2, baseMonthlyRevenue: 15000 },
      defaultSystemPrompt:
        "你是一位42岁的被裁员工，刚盘下一家社区小卖部重新开始。你有丰富的职场经验但对实体经营完全陌生。请以这个身份思考问题。",
      backstory:
        "三个月前，你还在互联网公司做运营主管。裁员通知来得猝不及防——42岁，上有老下有小，简历投出去石沉大海。你决定不再等别人给你机会，而是自己创造一个。隔壁小区门口的小卖部在转让——你决定赌一把。",
    },
  ],

  // 角色专属路线
  routes: {
    shop_owner: shopOwnerRoute,
    laid_off: laidOffRoute,
  },

  eventPool: {
    crisis_pool_A: [
      {
        id: "crisis_a1",
        type: "crisis",
        title: "原料涨价风暴",
        description:
          "突然接到通知：面粉和食用油价格明天起上调30%。",
        task: "你需要判断是否紧急囤货，还是寻找替代供应商。时间紧迫，先算清楚再决定。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -8, narrative: "涨幅达50%，供应商趁火打劫。你的成本骤增。" },
            "2-3": { penalty: -5, narrative: "涨幅30%，和你得到的消息一致。" },
            "4-5": { penalty: -3, narrative: "涨幅15%，情况比预想的好一些。" },
            "6": { penalty: -1, narrative: "你的老供应商帮你压住了价，只涨了5%。" },
          },
        },
        mitigationCost: 2,
        tags: ["supply_chain", "crisis"],
      },
      {
        id: "crisis_a2",
        type: "crisis",
        title: "社区停电事故",
        description:
          "电力抢修，你的店铺所在街区将停电3天。冷藏商品面临变质风险。",
        task: "评估可能损失，设计应急方案减少损失。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -7, narrative: "停电持续5天，你损失了价值3000元的冷藏商品。" },
            "2-3": { penalty: -5, narrative: "停电3天，损失约1500元。" },
            "4-5": { penalty: -3, narrative: "停电仅1.5天，你及时转移了大部分商品。" },
            "6": { penalty: -1, narrative: "你提前得到消息，早有准备，损失微乎其微。" },
          },
        },
        mitigationCost: 2,
        tags: ["emergency", "crisis"],
      },
    ],
    opportunity_pool_A: [
      {
        id: "opp_a1",
        type: "opportunity",
        title: "社区文化节邀请",
        description:
          "居委会张阿姨亲自上门，邀请你参加下周六的社区文化节，免费提供一个3米展位。这是你打入社区核心圈的绝佳机会——去年文化节来了600多人，摊位旁就是居委会的义卖区，人流量最密集。但准备摊位需要至少2天时间，还要设计互动环节吸引路人。",
        task:
          "你获得了一次社区文化节参展机会。分析社区人群特点，设计一个能让人停下脚步、走进你店的互动方案，目标是将至少50个新面孔变成你的顾客。",
        optional: true,
        reward: { decisionCoins: 3, score: 5 },
        tags: ["marketing", "community"],
        followUpTask:
          "根据文化节参展方案，制定一份'社区活动转化计划'：列出3个能让路人记住你的互动方式、2个把参观者变成顾客的转化手段，以及1个活动后的跟进策略。",
        followUpData:
          "【社区文化节信息】\n• 时间：下周六9:00-17:00\n• 地点：社区中心广场\n• 去年人流：约600人，高峰10:00-12:00\n• 你的展位：3米×2米，有1张桌子、2把椅子\n• 允许：试吃、发放小样、扫码加群\n• 禁止：明火烹饪、高音喇叭\n• 周边摊位：居委会义卖、幼儿园表演、健康体检\n• 你的预算：约300元（试吃品+宣传物料）",
      },
      {
        id: "opp_a2",
        type: "opportunity",
        title: "网红探店",
        description:
          "一位本地美食探店博主「社区吃货小王」路过你的店，他有2.3万粉丝，视频平均播放量5000+。他说想免费帮你拍一条探店视频——但条件是你要配合他的拍摄节奏，而且视频风格由他定。你听说隔壁那家水果摊被探店后客流涨了40%，但也有人因为被拍到了不卫生的角落而翻车。",
        task:
          "你获得了一次网红探店机会。分析这位博主的风格和受众，判断合作风险，决定如何配合拍摄才能最大化正面效果、规避负面风险。",
        optional: true,
        reward: { decisionCoins: 2, score: 3, item: "口碑发酵" },
        tags: ["marketing", "social_media"],
        followUpTask:
          "根据探店观察，制定一份'我的店改进计划'，列出3个可立即学习的做法和2个需要警惕的问题。同时准备一段30秒的店铺亮点介绍，供博主拍摄时使用。",
        followUpData:
          "【探店记录】\n• 博主风格：接地气、强调性价比、喜欢拍店主故事\n• 拍摄时长：约40分钟（含采访+取景）\n• 博主要求：拍摄时不要刻意收拾，要'真实感'\n• 视频发布时间：拍摄后3-5天\n• 你的顾虑：冰柜里有过期风险的商品、货架个别处积灰\n• 博主过往案例：水果摊视频发布后客流涨40%，但另一家小餐馆因后厨曝光被差评\n• 你的店铺亮点：凌晨还开门、认识80%的顾客、可赊账、蔬菜水果当日新鲜",
      },
    ],
    crisis_pool_B: [
      {
        id: "crisis_b1",
        type: "crisis",
        title: "负面评价风波",
        description:
          "一位顾客在网上给了你一星差评，并附上模糊照片声称吃坏肚子。这条评价被转发了上百次。",
        task: "草拟一封公开回应信，澄清事实但不激化矛盾，并制定服务补救方案。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -8, narrative: "事件被本地媒体报道，客流锐减30%。" },
            "2-3": { penalty: -5, narrative: "负面评价在几个社区群里反复转发。" },
            "4-5": { penalty: -3, narrative: "大部分顾客选择相信你，但仍有少量质疑。" },
            "6": { penalty: -1, narrative: "你的老顾客自发为你辩护，舆论很快平息。" },
          },
        },
        mitigationCost: 3,
        tags: ["reputation", "crisis"],
      },
      {
        id: "crisis_b2",
        type: "crisis",
        title: "员工突然离职",
        description:
          "你唯一的得力助手——跟了你两年的老员工，因为家庭原因要搬离这个城市，下周就走。",
        task: "紧急招聘并培训新人，同时设计一个过渡期的排班方案。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -6, narrative: "两周内招不到合适的人，你自己顶班，累到几乎崩溃。" },
            "2-3": { penalty: -4, narrative: "找到一位新人，但上手慢，第一个月业绩下降。" },
            "4-5": { penalty: -2, narrative: "意外招到一位有经验的人，过渡平稳。" },
            "6": { penalty: 0, narrative: "老员工推荐了一位朋友来接替，无缝衔接。" },
          },
        },
        mitigationCost: 2,
        tags: ["staff", "crisis"],
      },
    ],
    opportunity_pool_B: [
      {
        id: "opp_b1",
        type: "opportunity",
        title: "政府补贴政策",
        description:
          "社区公告栏贴出通知：区商务局针对小微商户推出「数字化转型专项补贴」，最高可申领5000元。你需要提交一份详细的数字化改造计划书，经评审后按项目拨付。截止日期是下周五，隔壁奶茶店已经准备了一周的方案。这笔钱可以帮你接入外卖平台、升级收银系统、甚至做个小程序——但申请材料写不好，可能一分钱都拿不到。",
        task:
          "你获得了一笔政府补贴申请机会。分析你店最迫切的数字化需求，规划资金分配方案，撰写一份有说服力的申请计划书。",
        optional: true,
        reward: { decisionCoins: 4, score: 5 },
        tags: ["funding", "opportunity"],
        followUpTask:
          "审查补贴申请计划书，找出3个可能被评审质疑的薄弱环节，并为每个薄弱环节准备补充说明。同时列出如果只能拿到3000元（而非满额5000元），你会砍掉哪些项目。",
        followUpData:
          "【补贴申请条件】\n• 对象：注册在本区的小微商户（个体工商户可）\n• 补贴金额：按项目评审，最高5000元，拨付比例70%\n• 用途限制：仅限数字化相关（设备采购、平台接入、系统开发等）\n• 截止日期：下周五17:00\n• 评审标准：方案可行性40% + 预期效果30% + 资金合理性30%\n\n【你目前最迫切的数字化需求】\n1. 接入外卖平台（押金+设备约1500元）\n2. 升级智能收银系统（约2000元）\n3. 微信社群运营工具年费（约800元）\n4. 冰柜温控报警器（约700元，防止再出现过期商品）\n5. 店铺小程序开发（约3000元，含商品展示+线上下单）",
      },
      {
        id: "opp_b2",
        type: "opportunity",
        title: "合作邀约",
        description:
          "旁边小区的物业经理刘总找到你，提出合作方案：由你为小区300户住户提供每周一次的定制配送服务——住户在微信群下单，你统一采购并配送至小区门口自提点。刘总出物业资源（群+场地），你出商品和配送力。他拿出了一份合作合同，但你发现有些条款让你不太舒服。",
        task:
          "你获得了一次合作邀约。评估这个合作机会的商业价值和潜在风险，决定是否合作以及如何谈判合同条款。",
        optional: true,
        reward: { decisionCoins: 3, score: 4 },
        tags: ["partnership", "opportunity"],
        followUpTask:
          "审查对方提供的合作合同，找出3个潜在风险点，并给出修改建议。同时制定试运行方案，包括首月运营流程和退出机制。",
        followUpData:
          "【合同摘要】\n• 合作期限：2年，自动续约\n• 利润分配：你70%，物业30%\n• 违约金条款：任何一方提前终止需赔偿对方5000元\n• 配送频率：每周至少1次，住户下单后48小时内送达\n• 商品范围：日用品+生鲜食品，不得与物业自有团购冲突\n• 质量责任：商品质量问题由你全权负责，物业免责\n• 宣传推广：物业负责微信群推广，但你的品牌名不得出现在物业官方宣传中\n\n【你的疑问】\n• 物业自有团购是什么？会不会和我形成竞争？\n• 2年锁定期太长，万一亏本怎么办？\n• 5000元违约金是否合理？\n• 30%的利润分成是否过高？",
      },
    ],
    crisis_pool_C: [
      {
        id: "crisis_c1",
        type: "crisis",
        title: "天灾降临",
        description:
          "一场特大暴雨导致街道积水，你的店铺一楼被淹，部分货物和设备受损。",
        task: "评估损失，联系保险公司，并制定临时营业方案。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -10, narrative: "损失惨重，保险赔付缓慢，你几乎要从零开始。" },
            "2-3": { penalty: -7, narrative: "损失中等，需要停业一周进行清理和维修。" },
            "4-5": { penalty: -4, narrative: "损失较小，你很快恢复了营业。" },
            "6": { penalty: -2, narrative: "你提前做了防汛准备，损失微乎其微。" },
          },
        },
        mitigationCost: 3,
        tags: ["disaster", "crisis"],
      },
      {
        id: "crisis_c2",
        type: "crisis",
        title: "家人反对",
        description:
          "你的家人认为你开店太辛苦，收入也不稳定，强烈希望你关店去找一份安稳工作。",
        task: "用数据和你的愿景，准备一次关键的家庭沟通。",
        dice: {
          effect: "severity",
          mapping: {
            "1": { penalty: -6, narrative: "家人态度强硬，你感到前所未有的压力。" },
            "2-3": { penalty: -4, narrative: "家人情绪激动，沟通陷入僵局。" },
            "4-5": { penalty: -2, narrative: "家人愿意听你解释，但仍半信半疑。" },
            "6": { penalty: 0, narrative: "你的真诚和数据打动了家人，他们决定再给你半年时间。" },
          },
        },
        mitigationCost: 2,
        tags: ["personal", "crisis"],
      },
    ],
    opportunity_pool_C: [
      {
        id: "opp_c1",
        type: "opportunity",
        title: "意外投资",
        description:
          "一位三年前你在暴雨天帮忙搬过货的老顾客老陈，如今事业有成，主动找到你：「我一直记着你的好，我愿意无息借给你3万元支持你发展，不设还款期限。」这是天大的好事，但你也知道——人情债比银行贷款更难还。老陈说'不急还'，但他的妻子在旁边皱了皱眉头。",
        task:
          "你获得了一笔无息借款机会。分析这笔钱对你经营的战略意义，制定资金使用计划，同时考虑如何处理人情关系，既不辜负信任又不给自己太大压力。",
        optional: true,
        reward: { decisionCoins: 5, score: 6 },
        tags: ["funding", "opportunity"],
        followUpTask:
          "制定一份'3万元投资回报计划'：列出资金分配方案、预期收益时间表、以及一份非正式的'还款承诺书'（即使对方说不用还）。重点说明如何在6个月内让这笔钱产生可衡量的回报。",
        followUpData:
          "【老陈提供的信息】\n• 借款金额：3万元整\n• 利率：0（无息）\n• 还款期限：无硬性要求，但老陈说'两年内还了最好'\n• 用途：不限\n• 老陈的期待：希望你能'做起来'，他说'我不图你还钱，图你过得好'\n\n【你的资金缺口分析】\n• 最紧迫：冰柜老化需更换（约5000元）\n• 最期待：接入外卖平台+小程序（约4500元）\n• 最想要：扩大早餐专区设备（约3000元）\n• 储备用：3个月流动资金（约15000元）\n\n【人情风险】\n• 老陈的妻子似乎不太同意\n• 如果经营不善，你欠的不只是钱，还有情义\n• 社区里有人议论：'他凭什么借你这么多？是不是有什么条件？'",
      },
      {
        id: "opp_c2",
        type: "opportunity",
        title: "媒体采访",
        description:
          "本地电视台《都市生活》栏目正在制作一期「社区小店生存实录」专题，选中了你的店作为三个拍摄对象之一。编导说想拍你的'真实经营日常'，包括进货、理货、和顾客聊天。播出时段是黄金档，覆盖全市50万观众。你的店可能一夜之间被半个城市的人看到——但镜头也会暴露你的一切。",
        task:
          "你获得了一次电视采访机会。评估媒体曝光的利弊，决定如何呈现你的店铺形象，准备一段既有故事性又有数据支撑的采访内容。",
        optional: true,
        reward: { decisionCoins: 4, score: 5, item: "社区明星" },
        tags: ["media", "opportunity"],
        followUpTask:
          "根据采访提纲，准备一份'媒体应对手册'：包括3个你想传达的核心信息、2个你想回避的敏感话题及应对话术、以及1段面向镜头的30秒电梯演讲。同时制定采访后的流量承接方案。",
        followUpData:
          "【采访安排】\n• 栏目：《都市生活·社区小店生存实录》\n• 播出时间：下周六20:00，黄金档\n• 覆盖观众：约50万\n• 拍摄时长：半天（约4小时）\n• 采访内容：经营故事+日常跟拍+数据展示\n\n【编导提供的采访提纲】\n1. 你为什么选择开这家店？\n2. 经营中最难的时刻是什么？\n3. 你是如何应对竞争的？\n4. 你的收入能维持生活吗？\n5. 你觉得社区小店还有未来吗？\n\n【你的顾虑】\n• 第4题太直接，暴露收入低会不会被家人看到？\n• 拍摄时会拍到货架和冰柜，卫生情况经得起镜头吗？\n• 播出后会不会引来更多竞争对手？\n• 你不善言辞，紧张了可能会说错话\n\n【你的优势】\n• 你有真实的故事：被裁员/三年老店转型\n• 你有数据：用了哪些数字化工具、客流增长曲线\n• 你有社区口碑：老顾客愿意帮你说话",
      },
    ],
  },

  shop: {
    items: [
      { id: "item_reroll_dice", name: "幸运硬币", description: "重掷一次骰子。必须接受新结果。", cost: 3, effect: "reroll_dice", limit: 2 },
      { id: "item_skip_crisis", name: "贵人相助", description: "跳过下一个危机事件，自动视为最低损失。", cost: 5, effect: "skip_next_crisis", limit: 1 },
      { id: "item_expert_role", name: "专家名片", description: "为下一关指定AI必须扮演的专家角色，该关评分+2。", cost: 2, effect: "boost_score", params: { role: "资深商业顾问", scoreBonus: 2 }, limit: 1 },
      { id: "item_double_dice", name: "双面骰子", description: "下次掷骰子时，掷两个，选结果好的那个。", cost: 4, effect: "double_dice", limit: 1 },
    ],
  },

  scoring: {
    dimensions: [
      { key: "role_setting", name: "角色设定", weight: 1.0, description: "是否赋予AI具体、贴切的专家角色" },
      { key: "constraint", name: "约束清晰", weight: 1.0, description: "是否给出明确的限制条件" },
      { key: "information", name: "信息完整", weight: 1.0, description: "是否提供了足够的数据和背景" },
      { key: "iteration", name: "迭代深度", weight: 1.0, description: "是否进行了多轮追问和优化" },
      { key: "logic", name: "逻辑严谨", weight: 1.0, description: "最终结论和对话路径的逻辑是否自洽" },
    ],
    judgePrompt: `你是一位冷静而深邃的AI思维教练。你的任务是评估一名学员在"AI决策力推演"游戏中的表现。

评估输入：
- 情景描述：{cardTitle}
- 任务要求：{cardTask}
- 学员与AI的完整对话记录：{conversation}
- 学员提交的最终决策结论：{finalAnswer}

⚠️ 评分核心原则：本游戏评估的是学员的"决策思维能力"，而非"数据复述能力"。评分必须严格区分"原创分析"与"照搬数据"。

【严格扣分规则】
- 如果学员的最终答案大量复制或简单改写题目中提供的参考数据（data字段内容），而缺少自己的分析和推理，必须大幅扣分。
- 仅仅罗列数据、复述事实而不给出原创判断的答案，各维度得分不应超过4分。
- 如果最终答案只是把参考数据换个说法重新组织，没有新增任何洞见或行动方案，视为"无效思考"，总分不应超过20分。

【高分标准】
高分（7分以上）必须满足：
- 对参考数据进行了创造性应用，而非照搬
- 提出了数据中未直接给出的原创洞察和推理
- 给出了可执行、有针对性的行动决策
- 展现了学员自己的独立思考和判断能力

请从以下五个维度评估（每个维度1-10分）：
1. 角色设定：是否赋予了AI一个具体、恰当的专业角色？
2. 约束清晰：是否给出了明确的限制（字数、格式、禁区等）？
3. 信息完整：是否提供了足够的数据、背景信息帮助AI理解问题？（注意：此项评估的是学员向AI投喂信息的能力，而非最终答案中复述数据的多少）
4. 迭代深度：是否进行了多轮追问、优化、纠偏？
5. 逻辑严谨：最终结论是否基于原创推理和独立判断？是否展现了对问题的真正理解而非数据堆砌？

请严格输出JSON格式，不要包含任何额外说明：
{
  "scores": {
    "角色设定": 数字,
    "约束清晰": 数字,
    "信息完整": 数字,
    "迭代深度": 数字,
    "逻辑严谨": 数字
  },
  "total": 总分,
  "comment": "一段平和、理性、聚焦思维过程的100字评语，语气像一位智者，指出亮点与可改进点。如发现照搬数据的行为，必须在评语中明确指出。"
}`,
  },

  endings: [
    { id: "ending_great", title: "🏆 未来社区企业家", minScore: 42, maxScore: 60, description: "你在数字时代展现了卓越的理性决策力和AI协作能力。你不仅救活了一家小店，更开辟了一条属于自己的道路。", upgradeAdvice: "你已经掌握了核心心法。下次尝试更高难度的'职业转型'剧本，去面对更复杂的挑战。" },
    { id: "ending_good", title: "🧠 数字时代谋士", minScore: 28, maxScore: 41, description: "你具备良好的分析思维，在多次危机中展现了冷静和智慧。继续锤炼提示词艺术，你将无往不利。", upgradeAdvice: "你在约束条件和信息投喂方面表现不错，但可以更多尝试多轮追问，挖掘更深层的洞察。" },
    { id: "ending_ok", title: "⚖️ 边缘试探者", minScore: 14, maxScore: 27, description: "你在危机与机遇间徘徊，有些决策略显仓促，但你已经踏出了重要的一步。", upgradeAdvice: "建议回顾你的对话记录，寻找那些可以追问却没有追问的关键节点。那往往是思维深度的分水岭。" },
    { id: "ending_retry", title: "🌱 需要重启的创业者", minScore: 0, maxScore: 13, description: "这次推演并不顺利，但失败是决策的养料。每一次错误，都是你未来正确决策的基石。", upgradeAdvice: "试着在提示词中加入更多数据和约束条件，给AI一个更清晰的思考框架。再试一次，你会看到不同。" },
  ],

  strings: {
    welcome_title: "AI决策力大富翁 · 试炼",
    welcome_subtitle: "用与AI的深度对话，为你的虚拟生意杀出一条路。",
    start_button: "▶ 开始推演",
    select_role_title: "选择你的身份",
    submit_button: "提交决策成果",
    reroll_button: "支付决策币重做",
    next_level_button: "进入下一关",
    shop_title: "🧰 智慧商店",
    buy_button: "购买",
    dice_roll_button: "🎲 掷骰子",
    accept_opportunity: "接受挑战",
    decline_opportunity: "放弃机会",
    final_report_title: "📜 决策回响报告",
    play_again: "再玩一次",
    back_home: "返回首页",
  },
};
