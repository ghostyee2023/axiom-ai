# Task 5 - Revenue System Agent

## Summary
Added a revenue simulation system to the AI Decision Power Board Game. Revenue tracks simulated real business income in ¥ RMB, distinct from decision scores.

## Changes Made

### 1. gameStore.ts
- Added `RevenueEntry` interface with taskId, title, revenue, cumulative, reason fields
- Added `revenue: number` and `revenueHistory: RevenueEntry[]` to GameState
- Initialized both fields in the store defaults
- Added revenue calculation in `submitTask` action:
  - Base revenue from role's `baseMonthlyRevenue` (5-15% per task, randomized)
  - Score multiplier: `0.5 + (weightedTotal / 50) * 1.0` (better decisions → more revenue)
  - Crisis penalties: each penalty point = 1% of monthly revenue
  - Opportunity bonus: 3% of monthly revenue when opportunity accepted
  - RevenueEntry logged with reason string
- Added `revenue: 0, revenueHistory: []` to `resetGame`

### 2. scenario.ts
- Added `baseMonthlyRevenue: number` to `Role.startingResources` interface
- Shop owner: ¥18,600/month (convenience store)
- Laid-off worker: ¥15,000/month (small shop)

### 3. StatusBar.tsx
- Added `TrendingUp` icon import
- Added revenue selector from store
- Displayed revenue as `¥{amount}` with green (profit) / red (loss) color coding

### 4. ScoringResult.tsx
- Added `TrendingUp` icon import
- Added `revenueHistory` selector
- Added "本回合营收" card showing:
  - Net revenue for the task (green/red)
  - Cumulative total
  - Reason string (income, crisis loss, opportunity bonus breakdown)

### 5. EndingPage.tsx
- Added `revenue` and `revenueHistory` selectors
- Added "经营营收模拟" card (index=2) with:
  - Large profit/loss display (¥ with color)
  - "盈利" or "亏损" badge
  - Two-column breakdown: total income vs total crisis loss
  - Mini bar chart showing revenue trend across tasks
- Adjusted all StaggerItem indices to accommodate new card (3→4, 4→5, etc.)

## Design Decisions
- Revenue is completely separate from score - score measures AI decision quality, revenue simulates business outcomes
- Revenue formula ties to decision performance but includes randomness for realism
- Crisis events directly reduce revenue, making them feel like real business risks
- Opportunity acceptance can boost revenue, incentivizing risk-taking
- Realistic Chinese business amounts (¥ RMB, based on small shop monthly revenue)
