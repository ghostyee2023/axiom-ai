---
Task ID: 3-5
Agent: main
Task: Redesign global CSS theme and WelcomePage/RoleSelection components to be vibrant, game-like, and fun

Work Log:
- Read worklog.md to understand previous work context (Task 1: layout redesign, Task 2: floating decision panel)
- Read current globals.css, WelcomePage.tsx, RoleSelection.tsx, gameStore.ts, and scenario.ts
- Identified the monotonous blue-only (#38bdf8) color scheme as the "死气沉沉" problem
- Completely rewrote globals.css with a vibrant game-like color palette:
  - Primary: Electric violet/purple (#8b5cf6)
  - Secondary: Cyan (#06b6d4)
  - Accent Gold: Amber (#f59e0b)
  - Danger: Red (#ef4444)
  - Success: Emerald (#10b981)
  - Background: Deep space navy gradient (#0a0e1a → #1a1040)
  - Cards: Semi-transparent purple glass with gradient borders
- Added new CSS utilities and animations:
  - `.game-bg` with radial gradient overlays for depth
  - `.gradient-border` with animated shifting gradient border
  - `.gradient-text-primary`, `.gradient-text-gold`, `.gradient-text-rainbow` for gradient text effects
  - `.btn-gradient` with animated gradient background + shimmer overlay
  - `.divider-ornament` for decorative section dividers
  - `.badge-gradient`, `.badge-gold`, `.badge-cyan`, `.badge-success`, `.badge-danger` for colorful tags
  - `@keyframes float` - gentle floating motion
  - `@keyframes shimmer` - shine sweep effect
  - `@keyframes gradient-shift` - animated gradient backgrounds
  - `@keyframes particle-float` - for background particles
  - `@keyframes pulse-ring` - expanding ring pulse
  - `@keyframes hero-card-enter` - staggered card entrance
  - `.glow-cyan`, `.glow-gold`, `.glow-success` - colored glow variants
  - Updated all existing glow/chat/glass styles to use the new purple palette
- Redesigned WelcomePage with:
  - Deep space gradient background with floating CSS particles (30 particles, purple/cyan/gold)
  - Pulsing ring effect on game icon + floating animation
  - Sparkle accents on the icon
  - Animated rainbow gradient text for the title
  - NEW: API Key input field with key icon, password type, stored via useGameStore
  - Helper text explaining optional usage
  - Animated gradient start button with shimmer overlay and sparkle icons
  - Redesigned rules section with gradient border, colorful per-rule icons and backgrounds
  - Bottom meta info as colorful gradient badges
- Redesigned RoleSelection with:
  - RPG character card style with per-role color palette
  - shop_owner: purple/violet with Shield icon
  - laid_off: cyan/teal with Sword icon
  - Animated gradient border that becomes solid gradient on hover
  - Hover effects: scale up, glow shadow, icon rotation, chevron reveal
  - Radial gradient glow overlay on hover
  - Top accent line per role color
  - Gradient text for role names
  - Colorful stat badges (gold for coins, purple for items)
  - Staggered entrance animation with delay
  - Background particles
  - Decorative star divider ornament
  - Bottom hint text
- Kept all existing functionality: startGame, selectRole, apiKey/setApiKey
- Lint passes clean, dev server compiles successfully

Stage Summary:
- Complete visual overhaul from monotonous blue to vibrant purple/cyan/gold game theme
- Deep space gradient backgrounds with CSS particle effects
- RPG-style character selection cards with per-role colors and hover animations
- API Key input added to WelcomePage
- All existing game functionality preserved
- New CSS utilities available for other components to use
