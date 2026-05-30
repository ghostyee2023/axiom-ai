# Task 6-7: Gameplay UI Components Redesign

## Summary
Redesigned all 4 gameplay UI components (StatusBar, TaskPanel, ChatPanel, DecisionPanel) to be much more vibrant, game-like, and fun, applying the new color palette (violet/cyan/gold/emerald/danger).

## Files Modified

### 1. `/home/z/my-project/src/app/globals.css`
- Updated CSS variables to new color palette (violet #8b5cf6 primary, cyan #06b6d4 secondary)
- Changed `:root` theme colors from cyan (#38bdf8) to violet (#8b5cf6)
- Updated `glass-card` to include gradient background and violet border
- Updated `.custom-scrollbar` to use violet accent
- Updated `.glow-accent` / `.glow-accent-strong` to use violet
- Added new glow classes: `.glow-gold`, `.glow-cyan`, `.glow-emerald`, `.glow-danger`
- Added `.pulse-glow-gold`, `.pulse-glow-cyan` pulse animations
- Added `.animate-icon-pulse` for subtle icon pulsing
- Added `.thinking-dot` animation for AI thinking indicator
- Added `.progress-bar-gradient` with animated shimmer (purple→cyan)
- Added `.gradient-border` pseudo-element effect
- Added `.btn-gradient-violet` with hover glow effect
- Added `.animate-unlock-reveal` (blur-to-clear reveal) for locked card unlocking
- Added `.animate-lock-shake` for locked icon animation
- Added `.animate-shimmer` for button shimmer effect
- Updated `.chat-bubble-user` with violet gradient
- Updated `.chat-bubble-ai` with violet-tinted background
- Updated `.level-start-glow` to use violet
- Updated scrollbar thumb colors to violet

### 2. `/home/z/my-project/src/components/game/StatusBar.tsx`
- HUD-style container with gradient background and decorative corner accents
- Progress bar uses animated gradient (purple→cyan) with `.progress-bar-gradient`
- Progress percentage displayed in large bold gradient text (purple→cyan)
- Step type badges with colored pill backgrounds (violet for main, amber for trigger/checkpoint)
- Score badge: amber background with pulsing trophy icon (`.animate-icon-pulse`)
- Decision coins badge: yellow/amber background with coin icon
- Items badge: emerald background with package icon
- Inventory items shown as emerald-tinted pills
- All stats have distinct colored badge containers

### 3. `/home/z/my-project/src/components/game/TaskPanel.tsx`
- Expert role indicator: amber left accent line + amber gradient background
- Double dice indicator: emerald left accent line + emerald gradient background
- **TaskCard**: 
  - Title card: violet/purple gradient background, 4px left violet accent border, corner decorative glow, violet time badge
  - Challenge card: amber/gold gradient background, 4px left gradient accent (amber→dark amber), warning corner glow, amber alert styling
  - DataSection: 3px left gradient border (purple→cyan), cyan icon color
  - LockedCard: complete redesign with:
    - 4 color schemes (amber/emerald/cyan/violet)
    - Animated lock icon (`.animate-lock-shake`) when locked
    - Blurred preview text for locked state
    - Unlock button with gradient background + hover glow effect
    - Unlocked state: `.animate-unlock-reveal` (blur-to-clear), glow effect, "已解锁" tag
    - Left accent line per color
- **CrisisEventCard**: red/orange danger gradient, 4px left danger gradient border, danger corner glow, pulsing shield icon, "⚠ 危机" badge
- **OpportunityEventCard**: emerald sparkle gradient, 4px left emerald gradient border, sparkle corner glow, pulsing star icon, "✨ 机遇" badge, reward pills with colored backgrounds
- **CheckpointCard**: gold/amber gradient, 4px left gold gradient border, gold corner glow, pulsing trophy icon, gradient score text
- Scoring hint: violet/cyan gradient background

### 4. `/home/z/my-project/src/components/game/ChatPanel.tsx`
- Top 2px gradient accent line (violet→cyan→violet)
- Chat header: violet-tinted background, Bot icon with green online dot (pulse), "AI 对话" label
- Empty state: gradient icon container with MessageCircle, more inviting copy
- AI thinking indicator: three animated dots (`.thinking-dot`) + "AI 正在思考" text
- Chat bubbles: 
  - User: violet gradient (`.chat-bubble-user`)
  - AI: violet-tinted dark background (`.chat-bubble-ai`) with Bot avatar badge (gradient purple square)
- Input area: dark background with violet border, focus glow effect (violet border + shadow)
- Send button: `.btn-gradient-violet` with hover glow
- Crisis hint bar: amber-tinted background with amber border

### 5. `/home/z/my-project/src/components/game/DecisionPanel.tsx`
- Container: violet gradient background, violet border with thicker top border
- Top gradient accent line (violet→cyan→violet)
- Toggle header: violet FileText icon, character count as violet pill badge
- Textarea: dark background with violet border, focus glow effect, character counter (0/500)
- Submit button: `.btn-gradient-violet` with shimmer overlay, Zap icon, bold "提交决策" text
- Loading state: spinner with gradient background

## Technical Details
- All existing functionality preserved (store calls, event handlers, conditional rendering)
- No new packages installed
- All components use "use client" directive
- Same exports and interfaces maintained
- Lint passes clean
- Dev server compiles successfully
