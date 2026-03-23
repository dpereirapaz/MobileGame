# Phase 1: Mobile MVP

**Duration:** 3–4 weeks (15–20 hours/week)  
**Prerequisite:** Phase 0 prototype validated (met Go criteria)  
**Goal:** Ship a polished, playable game to TestFlight and internal testing  
**Tech:** React Native + Expo  
**Output:** A working app on iOS and Android, ready for monetization layer

---

## Pre-Requisites Checklist

Before starting Phase 1, confirm:
- [ ] Phase 0 Go criteria met (session > 3 min, > 20% return, positive qualitative feedback)
- [ ] Apple Developer account registered (€99/year) — takes 24–48h to approve
- [ ] Google Play Console account registered (€25 one-time)
- [ ] Lessons from prototype documented: what mechanics worked, what felt off, feedback notes

---

## Tasks

### 1.1 — Project Setup
- [ ] Create Expo project: `npx create-expo-app@latest gridflow --template blank-typescript`
- [ ] Install core dependencies:
  ```
  npx expo install react-native-reanimated react-native-gesture-handler
  npm install zustand
  ```
- [ ] Configure Reanimated plugin in `babel.config.js`
- [ ] Set up project structure:
  ```
  src/
    game/          # Core game logic (port from prototype)
      grid.ts      # Grid state, placement validation
      merge.ts     # Merge detection, chain resolution
      pieces.ts    # Piece generation, shapes
      scoring.ts   # Score calculation, combos
    components/    # React Native UI components
      Board.tsx
      Tile.tsx
      PieceTray.tsx
      ScoreDisplay.tsx
      GameOver.tsx
    screens/       # App screens
      GameScreen.tsx
      MenuScreen.tsx
    stores/        # Zustand state
      gameStore.ts
    utils/
      colors.ts
      constants.ts
    assets/        # Sounds, images
  ```
- [ ] Set up EAS Build: `eas init` and `eas build:configure`

### 1.2 — Port Core Game Logic
- [ ] Port grid logic from prototype to TypeScript modules (pure functions, no React dependency)
- [ ] Port merge logic with chain detection
- [ ] Port piece generation with shape definitions
- [ ] Port scoring system
- [ ] Write unit tests for: merge detection, chain merging, game-over detection, piece placement validation
- [ ] Run tests: `npm test` — all pass

> **Tip for Claude Code:** The prototype code is your spec. Ask Claude to "port this React component's game logic into pure TypeScript functions with unit tests" — keep game logic separate from rendering.

### 1.3 — Grid & Tile Rendering
- [ ] Build `Board` component: 8×8 grid using `View` with flexbox
- [ ] Build `Tile` component with Reanimated animations:
  - Appear animation (scale from 0 → 1)
  - Merge animation (pulse + color shift)
  - Clear animation (fade out + slide)
- [ ] Tile visuals by tier:
  - Tier 1: flat color
  - Tier 2: slight gradient
  - Tier 3: brighter gradient + subtle glow
  - Tier 4+: increasingly saturated + glow effect
- [ ] Color palette: 5–6 distinct, accessible colors (test with color blindness simulator)

### 1.4 — Piece Tray & Placement
- [ ] Build `PieceTray` component showing 3 current pieces
- [ ] Implement drag interaction using `react-native-gesture-handler`:
  - `PanGestureHandler` for drag
  - Ghost preview overlay on grid during drag
  - Haptic feedback on valid placement (`expo-haptics`)
  - Snap-back animation on invalid placement
- [ ] Alternative: tap piece to select → tap grid to place (accessibility)
- [ ] Visual: selected piece highlighted, valid placement cells subtly indicated

### 1.5 — Game Flow
- [ ] Implement full game loop via Zustand store:
  - `newGame()` → reset grid, generate first 3 pieces
  - `placePiece(piece, position)` → validate, place, check merges, check clears, update score
  - `generatePieces()` → new set of 3 after all placed
  - `checkGameOver()` → verify at least one piece fits
- [ ] Game states: `menu | playing | game_over`
- [ ] Persist high score with AsyncStorage
- [ ] Persist current game state (resume after app close)

### 1.6 — Game Modes
- [ ] **Zen Mode** (default): endless play, no timer, personal best tracking
- [ ] **Daily Challenge**: seeded random (date-based) so all players get the same board
  - Deterministic RNG: `seed = YYYYMMDD` → same pieces in same order for everyone
  - Show "Daily Score" separately from Zen high score
  - Shareable result (text format, like Wordle): "GridFlow Daily #127 — 4,230 pts ⭐⭐⭐"
- [ ] **Sprint Mode**: 3-minute timer, score as much as possible
  - Countdown timer with visual urgency (color shift in last 30s)
  - Final score + stats (merges, chains, highest tier reached)

### 1.7 — Visual Polish
- [ ] App icon: clean, geometric, recognizable at small size (design with AI tools or Figma)
- [ ] Splash screen via `expo-splash-screen`
- [ ] Menu screen: game title, mode selection, high scores
- [ ] Color theme: dark background, vibrant tiles (high contrast, battery-friendly on OLED)
- [ ] Typography: one clean sans-serif font (Inter or system font)
- [ ] Score callouts: animated text ("Perfect!", "Chain ×3!") using Reanimated

### 1.8 — Sound Design
- [ ] Source sound effects (freesound.org or similar, CC0 license):
  - Tile placement: soft click
  - Merge: satisfying chime (pitch increases with tier)
  - Chain merge: escalating chime sequence
  - Line clear: swoosh
  - Game over: gentle descending tone
- [ ] Implement with `expo-av`
- [ ] Mute toggle in settings (persist preference)
- [ ] No background music in MVP (consider for later)

### 1.9 — Testing & Performance
- [ ] Test on physical devices: iPhone (recent + older model), Android (mid-range)
- [ ] Profile animations: ensure 60fps during merges and drags
- [ ] Test with large boards (near game-over state with many tiles)
- [ ] Test offline functionality (no network required for gameplay)
- [ ] Build TestFlight version: `eas build --platform ios --profile preview`
- [ ] Build Android APK: `eas build --platform android --profile preview`
- [ ] Distribute to 5–10 testers for feedback (TestFlight + direct APK)

---

## Tester Feedback Checklist

Ask testers to evaluate:
- [ ] Is the merge mechanic intuitive? Did you understand it without the tutorial?
- [ ] Does the game feel satisfying? What moments feel best?
- [ ] What frustrated you?
- [ ] How many games did you play in one sitting?
- [ ] Would you install this on your phone?
- [ ] Any crashes or performance issues?

---

## Decision Gate

| Signal | Action |
|--------|--------|
| Testers play 3+ games per sitting, find merging satisfying, no major bugs | → Proceed to Phase 2 |
| Mechanic confusion, mixed satisfaction, some bugs | → Spend 1 extra week on polish and UX, re-test |
| Fundamental mechanic issues, testers don't engage | → Revisit game design, consider mechanic pivot |

---

## Claude Code Session Guide

**Session 1** (~3 hrs): Tasks 1.1 + 1.2  
"Set up an Expo TypeScript project with this folder structure. Port these game logic functions from the prototype into pure TS modules with Jest unit tests."

**Session 2** (~3 hrs): Task 1.3  
"Build the Board and Tile React Native components with Reanimated animations for tile appearance, merge effects, and line clear animations."

**Session 3** (~3 hrs): Task 1.4  
"Implement drag-and-drop piece placement using react-native-gesture-handler with ghost preview, haptic feedback, and snap-back on invalid placement."

**Session 4** (~2 hrs): Task 1.5  
"Wire up the full game loop with a Zustand store, including game state persistence with AsyncStorage."

**Session 5** (~2 hrs): Task 1.6  
"Add Daily Challenge mode with deterministic RNG seeded by date, and Sprint mode with a 3-minute countdown timer."

**Session 6** (~2 hrs): Tasks 1.7 + 1.8  
"Add menu screen, splash screen, color theme, score callouts, and integrate sound effects using expo-av."

**Session 7** (~2 hrs): Task 1.9  
"Optimize performance, fix any bugs, configure EAS Build for TestFlight and Android APK, prepare for tester distribution."
