# Task 2 - Rewrite scenario.ts with challenge/hintCost/hiddenData model

## Agent: full-stack-developer

## Summary
Completed full rewrite of `/home/z/my-project/src/data/scenario.ts` with the new challenge/锦囊/hiddenData model.

## Changes Made

### 1. MainTask Interface Updated
Added 5 new fields:
- `challenge: string` - Core problem shown freely, no AI mention
- `hintCost: number` - Decision coins to unlock strategy tip (锦囊)
- `hiddenData?: string` - Hard-to-get data behind paywall
- `hiddenDataLabel?: string` - Label for hidden data
- `hiddenDataCost?: number` - Cost to unlock hidden data

### 2. All 20 Tasks Rewritten (10 per route)
Each task now has:
- `description` - narrative setup (unchanged)
- `challenge` - core problem in second person ("你需要..."), NEVER mentions AI
- `task` - 锦囊/strategy tip, CAN mention AI, costs coins
- `hintCost` - 1 for easy tasks, 2 for complex tasks

### 3. Competitor Data Moved to hiddenData
| Route | Task | Moved Data | Label | Cost |
|-------|------|-----------|-------|------|
| shop_owner | task_3 (应对竞争) | 连锁便利店详细情报 | 竞争对手情报（实地调查） | 1 |
| shop_owner | task_7 (节日营销) | 竞争对手促销动态 | 竞争对手促销方案详情 | 1 |
| laid_off | task_3 (学会定价) | 周边价格参考 | 周边竞品价格调查 | 1 |
| laid_off | task_7 (打造爆款) | 周边早餐竞争 | 周边早餐市场调查 | 1 |

### 4. Event Card Tasks Updated
Removed all "让AI帮你" phrasing from 10 event cards across all pools.

### 5. task_10 Description Updated (shop_owner)
Changed from "会用AI做决策、会管人、会做营销" to "会管人、会做营销的小老板"

## Verification
- Lint passes cleanly
- Dev server compiles without errors
- Store already supports new fields (Task 3 agent updated it)
