# Tech Stack

## Architecture Overview

```
┌─────────────────────────────────────────┐
│              GridFlow App                │
├──────────────┬──────────────────────────┤
│   Screens    │  Menu | Game | Settings  │
├──────────────┼──────────────────────────┤
│  Components  │  Board | Tile | Tray     │
│              │  ScoreDisplay | GameOver  │
├──────────────┼──────────────────────────┤
│    State     │  Zustand store           │
│              │  AsyncStorage persist    │
├──────────────┼──────────────────────────┤
│  Game Logic  │  Pure TS functions       │
│  (no UI dep) │  Grid | Merge | Pieces   │
│              │  Scoring | RNG           │
├──────────────┼──────────────────────────┤
│  Services    │  AdMob | Firebase        │
│              │  IAP | Notifications     │
├──────────────┴──────────────────────────┤
│  React Native + Expo (EAS Build)        │
└─────────────────────────────────────────┘
```

## Core Dependencies

| Package | Purpose | Phase |
|---------|---------|-------|
| `expo` (~SDK 52) | App framework, build tooling | 1 |
| `react-native-reanimated` | 60fps animations (merges, drags, transitions) | 1 |
| `react-native-gesture-handler` | Drag-and-drop piece placement | 1 |
| `zustand` | Lightweight state management | 1 |
| `@react-native-async-storage/async-storage` | Persist high scores, game state, preferences | 1 |
| `expo-haptics` | Haptic feedback on placement, merge, clear | 1 |
| `expo-av` | Sound effects | 1 |
| `expo-splash-screen` | Splash screen control | 1 |
| `react-native-google-mobile-ads` | AdMob integration | 2 |
| `expo-in-app-purchases` | Remove Ads IAP | 2 |
| `@react-native-firebase/analytics` | Event tracking, funnels, retention | 2 |
| `@react-native-firebase/remote-config` | A/B testing feature flags | 3 |
| `expo-notifications` | Push notifications | 3 |
| `react-i18next` | Internationalization | 3 |

## Project Setup Commands

```bash
# Create project
npx create-expo-app@latest gridflow --template blank-typescript
cd gridflow

# Core dependencies (Phase 1)
npx expo install react-native-reanimated react-native-gesture-handler expo-haptics expo-av expo-splash-screen
npm install zustand @react-native-async-storage/async-storage

# Configure Reanimated in babel.config.js
# Add: plugins: ['react-native-reanimated/plugin']

# EAS Build setup
npm install -g eas-cli
eas init
eas build:configure

# Testing
npm install --save-dev jest @types/jest ts-jest
```

## Key Architecture Decisions

### Game logic is 100% pure TypeScript

All game mechanics live in `src/game/` as pure functions with zero React dependencies. This means:

- **Testable:** Unit test merge logic, piece generation, game-over detection without rendering
- **Portable:** The same logic was used in the Phase 0 web prototype
- **Claude Code friendly:** Pure algorithmic code is Claude's strongest domain

```typescript
// Example: src/game/merge.ts
export interface Tile {
  color: Color;
  tier: number;
}

export type Grid = (Tile | null)[][];

export function findMergeGroups(grid: Grid): MergeGroup[] {
  // BFS to find connected same-color, same-tier groups of 3+
  // Returns array of groups with positions and merge target
}

export function applyMerge(grid: Grid, group: MergeGroup): { grid: Grid; newTile: Tile; position: Position } {
  // Remove group tiles, place new tier+1 tile at centroid
  // Pure function — returns new grid, doesn't mutate
}

export function resolveChains(grid: Grid): MergeResult[] {
  // Repeatedly find and apply merges until no more groups exist
  // Returns full chain of merge events (for animation sequencing)
}
```

### State management with Zustand

Single store with clear slices. No boilerplate, no providers, easy to persist.

```typescript
// Example: src/stores/gameStore.ts
interface GameState {
  grid: Grid;
  pieces: Piece[];
  score: number;
  highScore: number;
  combo: number;
  gameState: 'menu' | 'playing' | 'game_over';
  mode: 'zen' | 'daily' | 'sprint';
  
  // Actions
  newGame: (mode: Mode) => void;
  placePiece: (pieceIndex: number, position: Position) => void;
  undo: () => void;  // rewarded ad feature
}
```

### Animation approach

Reanimated shared values drive all animations on the UI thread. Game events (merge, clear, combo) push to an animation queue that the components consume.

```
Game event → Store update → Animation queue → Reanimated worklets → 60fps render
```

No `setTimeout` or JS-thread animations. Everything runs on the UI thread via Reanimated worklets.

### Deterministic RNG for Daily Challenge

```typescript
// Seeded PRNG — same date = same pieces for all players
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

// Usage
const today = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
const rng = seededRandom(today); // Same sequence globally for the day
```

## Build & Deploy

```bash
# Development
npx expo start                          # Start dev server
npx expo start --ios                    # iOS simulator
npx expo start --android                # Android emulator

# Preview builds (testing)
eas build --platform ios --profile preview       # TestFlight build
eas build --platform android --profile preview   # APK for testing

# Production builds
eas build --platform ios --profile production     # App Store build
eas build --platform android --profile production # Google Play build

# Submit to stores
eas submit --platform ios                # Submit to App Store
eas submit --platform android            # Submit to Google Play

# Over-the-air updates (post-launch fixes without store review)
eas update --branch production --message "Fix merge animation bug"
```

## Folder Structure

```
gridflow/
├── app.json                  # Expo config
├── babel.config.js           # Reanimated plugin
├── eas.json                  # EAS Build profiles
├── src/
│   ├── game/                 # Pure game logic (no React)
│   │   ├── grid.ts           # Grid state, placement validation
│   │   ├── merge.ts          # Merge detection, chain resolution
│   │   ├── pieces.ts         # Piece shapes, generation
│   │   ├── scoring.ts        # Points, combos, streaks
│   │   ├── rng.ts            # Seeded RNG for Daily Challenge
│   │   └── __tests__/        # Unit tests for all game logic
│   ├── components/
│   │   ├── Board.tsx          # 8×8 grid renderer
│   │   ├── Tile.tsx           # Single tile with animations
│   │   ├── PieceTray.tsx      # 3-piece selection area
│   │   ├── DragPiece.tsx      # Draggable piece with ghost preview
│   │   ├── ScoreDisplay.tsx   # Score, combo, high score
│   │   ├── GameOver.tsx       # Game over overlay with stats
│   │   ├── Timer.tsx          # Sprint mode countdown
│   │   └── Callout.tsx        # "Perfect!", "Chain ×3!" popups
│   ├── screens/
│   │   ├── MenuScreen.tsx     # Mode selection, high scores
│   │   ├── GameScreen.tsx     # Main gameplay screen
│   │   └── SettingsScreen.tsx # Sound, notifications, IAP
│   ├── stores/
│   │   ├── gameStore.ts       # Zustand game state
│   │   └── settingsStore.ts   # Preferences (sound, theme)
│   ├── services/
│   │   ├── ads.ts             # AdMob wrapper
│   │   ├── analytics.ts       # Firebase event helpers
│   │   └── iap.ts             # IAP purchase flow
│   ├── utils/
│   │   ├── colors.ts          # Color palette definitions
│   │   ├── constants.ts       # Grid size, tier count, timing
│   │   └── haptics.ts         # Haptic feedback helpers
│   └── assets/
│       ├── sounds/            # Sound effect files
│       └── images/            # App icon, splash, etc.
├── __tests__/                 # Integration tests
└── scripts/                   # Build helpers, ASO tools
```
