# Work Log - Task 6: Card Decision Agent

## Summary
Implemented a card-based decision selection system that presents players with 2-3 decision plan cards after scoring certain tasks. Each choice leads to different consequences/paths, making each playthrough unique.

## Changes Made

### 1. `/src/data/scenario.ts`
- Added `DecisionOption` interface with fields: `id`, `title`, `description`, `scoreModifier`, `revenueModifier`, `coinModifier`, `traitChanges`, `consequence`
- Added optional `decisionOptions?: DecisionOption[]` to `MainTask` interface
- Added decision options to 6 key tasks across both routes:
  - **Shop Owner Route**:
    - task_1 (盘清账目): 3 options - 全面数字化记账 / 精简手工记账 / 外包给会计公司
    - task_2 (优化成本): 3 options - 维持老供应商 / 全面切换新供应商 / 混合采购策略
    - task_5 (考虑扩张): 3 options - 大胆扩张 / 暂缓扩张 / 合伙扩张
    - task_8 (做出抉择): 3 options - 入伙团购 / 坚守守店 / 试水半合伙
  - **Laid-off Route**:
    - task_5 (数字转型): 3 options - 入驻外卖平台 / 社群+私域运营 / 菜鸟驿站+社区团购
    - task_8 (做出抉择): 3 options - 回公司上班 / 开分店扩张 / 深耕现有门店

### 2. `/src/store/gameStore.ts`
- Added `DecisionOption` import from scenario
- Added state: `decisionOptionPhase: boolean`, `selectedDecisionOption: DecisionOption | null`
- Added actions: `showDecisionOptions()`, `selectDecisionOption(option)`
- Modified `continueAfterScoring()`: now checks if current task has `decisionOptions`, and if so, sets `decisionOptionPhase: true` instead of advancing immediately
- `selectDecisionOption()`: applies score/revenue/coin modifiers, applies trait changes, adds to decision history, then auto-advances after 2.5s delay
- Updated `resetGame()` to include new state fields

### 3. `/src/components/game/DecisionOptionPanel.tsx` (NEW)
- Full-screen overlay with glassmorphism background
- 2-3 cards displayed in a responsive grid (1 col mobile, 3 col desktop)
- Each card has:
  - Unique accent color (violet/cyan/amber)
  - Title with index badge (A/B/C)
  - Description text
  - Modifier badges (score, coins, revenue)
  - Consequence preview box
  - Hover effects: scale up, glow, slight elevation
  - Selection effect: selected card scales up with highlight border and glow, unselected cards fade/blur
  - After selection: large check icon animation, consequence text displayed, auto-advances after 2.5s

### 4. `/src/components/game/ScoringResult.tsx`
- Modified "Action Buttons" section: if current task has `decisionOptions`, shows a "选择你的方案" button with Sparkles icon and multi-color gradient instead of the default "进入下一关" button
- Tasks without `decisionOptions` continue to work as before

### 5. `/src/app/page.tsx`
- Imported `DecisionOptionPanel` component
- Added `<DecisionOptionPanel />` overlay in the game page (always rendered, but returns null when `decisionOptionPhase` is false)

## Design Decisions
- Decision options are **optional** on tasks, so existing tasks without them work exactly as before
- The 2.5s delay after selection allows the player to read the consequence before advancing
- Each option has meaningful trade-offs: high risk/high reward, low risk/stable, or balanced middle ground
- Trait changes are tied to the nature of the choice (e.g., risky choices increase riskAppetite, collaborative choices increase collaborationTendency)
- Cards use distinct accent colors for visual differentiation
- The selection animation creates a "trading card" feel: selected card scales and glows, unselected cards fade out

## Testing
- Lint passes cleanly
- Dev server compiles without errors
- App returns HTTP 200
