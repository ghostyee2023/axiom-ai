# Task 3 - Contract Preview Agent

## Task
Add a feature where tasks involving contracts can generate an online previewable contract document that the AI can reference during conversation and analysis.

## Implementation Summary

### Files Modified
1. **`src/data/scenario.ts`** - Added `ContractData` interface and `contract?` field to `MainTask`, populated contract data for 3 tasks
2. **`src/components/game/ContractPreview.tsx`** - New component with ContractPreviewButton and ContractPreview overlay
3. **`src/components/game/TaskPanel.tsx`** - Integrated ContractPreviewButton and ContractPreview overlay
4. **`src/store/gameStore.ts`** - Added `contractVisible` state, `setContractVisible` action, and contract data injection into AI system prompt

### Key Design Decisions
- Added contracts to task_2 (supply), task_5 (lease), and task_8 (partnership) in the shop owner route
- Contract overlay uses professional document styling with red seal stamps, section headers, and type badges
- Contract data is automatically injected into AI system prompt so AI can reference specific clauses without manual copy
- Copy button generates plain text version for pasting into chat for explicit discussion
- Used Tailwind animate-in classes for smooth entrance animation (avoiding useEffect/setState lint issues)

### Verification
- ESLint passes with zero errors
- Dev server compiles successfully
