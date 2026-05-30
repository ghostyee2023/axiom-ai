# Task 3 - Store Update Agent Work Record

## Task
Update `/home/z/my-project/src/store/gameStore.ts` to support the new "锦囊" (hint) and hidden data unlocking system.

## Changes Made

### 1. New State Fields (GameState interface)
- `unlockedHints: string[]` — Array of task IDs whose hints (锦囊) have been unlocked
- `unlockedHiddenData: string[]` — Array of task IDs whose hidden data has been unlocked

### 2. New Action Signatures (GameState interface)
- `unlockHint: () => void` — Unlock the strategy hint for the current task
- `unlockHiddenData: () => void` — Unlock hidden data for the current task

### 3. Store Initialization
- Both new fields initialized as `[]` in the store default values

### 4. unlockHint Implementation
- Validates current task type is "main"
- Checks if hint already unlocked (returns early if so)
- Reads `hintCost` from task (via type cast for new field), falls back to `rerollCost` if not present
- Deducts decision coins and adds taskId to `unlockedHints`

### 5. unlockHiddenData Implementation
- Validates current task type is "main"
- Checks if hidden data already unlocked (returns early if so)
- Reads `hiddenDataCost` from task (via type cast), returns early if 0 or not set
- Deducts decision coins and adds taskId to `unlockedHiddenData`

### 6. selectRole Update
- Resets `unlockedHints: []` and `unlockedHiddenData: []`

### 7. resetGame Update
- Includes `unlockedHints: []` and `unlockedHiddenData: []` in full reset

### 8. applyStep Update
- Added comment noting hints/hidden data start locked for each new task (no auto-unlock behavior needed since arrays persist across tasks)

### 9. sendChatMessage Update
- Renamed `cardTask` to `cardChallenge`
- For main tasks: uses `challenge` field (accessed via type cast) as the freely shown problem, falling back to `task` if `challenge` absent
- System prompt shows "挑战描述" instead of "任务要求"
- Only includes `task` content (策略锦囊) if taskId is in `unlockedHints`
- Only includes `hiddenData` if taskId is in `unlockedHiddenData` and the field exists
- `hiddenDataLabel` conditionally included in prompt
- Fixed `cardContext` to use `cardChallenge`

## Backward Compatibility
- All new fields accessed via `Record<string, unknown>` type cast since the MainTask interface is being updated by another agent
- Falls back to existing fields (`task`, `rerollCost`) when new fields are absent

## Verification
- `bun run lint` passes cleanly with no errors
