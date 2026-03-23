# Design System — Synapse

## Product Context
- **What this is:** A neural network-themed mobile puzzle game. Place neurons on an 8×8 grid, merge same-tier clusters to build more powerful nodes, and race to reach AGI.
- **Who it's for:** Tech/AI-curious players, 25–40. Lapsed strategy gamers who follow AI news, respect good design, and hate intrusive ads.
- **Space/industry:** Mobile puzzle games — competing with 1010!, 2048 variants, and Merge Dragons
- **Project type:** Mobile app (React Native/Expo) — game UI

## Aesthetic Direction
- **Direction:** Phosphor Lab — the feeling of a researcher's notebook rendered in terminal light
- **Decoration level:** Intentional — subtle halftone dot texture on grid cells (PCB/graph paper), faint grid lines, no decorative blobs or gradients
- **Mood:** Precise without coldness. The quiet before you start something that might matter. A research lab at 2am — warm, focused, alive. Not a SaaS dashboard. Not a candy game.
- **Key principle:** Every AI product in 2025 uses dark mode + Inter + purple gradients. Synapse uses warm dark + monospace + acid chartreuse. The differentiation is intentional.

## Typography
- **Display/Hero:** Instrument Serif — scholarly warmth, literary authority. Used for hero copy, game title, and narrative moments.
- **Tier names/Labels:** JetBrains Mono — renders tier names (PERCEPTRON, AGI) like terminal output. Delightful for the target audience. All-caps, tracked out.
- **UI/Labels/Body:** Geist — clean, technical, not Inter. Used for all UI chrome, descriptions, settings.
- **Scores/Compute:** DM Mono — clinical precision. Every number in the game (FLOPs, combo multipliers, timers) renders in this font. Tabular-nums enabled.
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  ```
- **Scale:**
  | Level | Size | Font | Usage |
  |-------|------|------|-------|
  | Hero | 48–88px | Instrument Serif | Game title, marketing |
  | Display | 28–42px | Instrument Serif | Section headers |
  | Tier label | 7–13px | JetBrains Mono | Neuron labels, tier chips |
  | Score | 22–64px | DM Mono | Compute display, game over |
  | Body | 15–17px | Geist | Descriptions, tooltips |
  | Caption | 9–12px | JetBrains Mono | Section labels, eyebrows |

## Color
- **Approach:** Restrained + one electric accent. Everything is warm and muted — the accent is reserved for moments that matter.

### Core Palette
```css
--bg:         #0F0E0A;  /* Warm near-black — NOT cold dark mode */
--surface:    #1C1A13;  /* Card/panel backgrounds */
--surface2:   #252218;  /* Elevated surfaces, active states */
--grid-line:  #2E2B1F;  /* Grid cells, dividers, borders */
--text:       #E8E0C8;  /* Primary text — warm off-white, never pure white */
--text-muted: #9A9178;  /* Secondary text */
--text-dim:   #5C5843;  /* Labels, captions */
--accent:     #C8F060;  /* Acid chartreuse — merge events, AGI, achievements ONLY */
--accent-dim: #8AAA3A;  /* Accent hover/pressed state */
```

### Neuron Type Colors (muted, scientific — not saturated game primaries)
```css
--n-language:   #4A9EBF;  /* Steel blue — entry level, cool, slightly uncertain */
--n-vision:     #7BAE7F;  /* Sage green */
--n-reasoning:  #C4956A;  /* Warm terracotta */
--n-memory:     #7C4FA8;  /* Dusty violet — the ONE purple, earned at tier 4+ */
--n-planning:   #5C8A8A;  /* Teal slate */
--n-creativity: #D4875A;  /* Burnt sienna */
```

### Semantic Colors
```css
--success: #7BAE7F;
--warning: #C4956A;
--error:   #C46A6A;
--info:    #4A9EBF;
```

### Tier → Neuron Type Mapping
| Tier | Name | Color variable |
|------|------|----------------|
| 1 | Perceptron | --n-language |
| 2 | Linear Layer | --n-vision |
| 3 | Hidden Layer | --n-reasoning |
| 4 | Attention Head | --n-memory |
| 5 | Transformer Block | --n-planning |
| 6 | Foundation Model | --n-creativity |
| 7 | AGI | --accent (pulsing) |

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable (generous whitespace in menus; compact only inside the game board)
- **Scale:**
  ```
  2xs:  2px   xs:  4px   sm:  8px   md: 16px
  lg:  24px   xl: 32px  2xl: 48px  3xl: 64px
  ```

## Layout
- **Approach:** Grid-disciplined for the game board (it IS a grid); editorial for marketing/menu screens
- **Game board:** 8×8 fixed grid, cells with halftone dot texture (radial-gradient PCB pattern)
- **Max content width:** 960px
- **Border radius:**
  ```
  sm:   4px   (buttons, chips)
  md:   8px   (cards, modals)
  lg:  12px   (game board, large panels)
  full: 9999px (pills, neuron nodes)
  ```

## Motion
- **Approach:** Intentional — not flashy. Motion is always meaningful, never decorative.
- **Merge animation:** 1.2s deliberate sequence — neurons draw together with arcing connection lines, pause for a half-beat, then collapse into the new tier. Single resonant tone. No particles. No screen flash.
- **AGI pulse:** Continuous slow pulse (2s ease-in-out) on the AGI node — breathing, alive.
- **Easing:**
  ```
  enter: ease-out   exit: ease-in   move: ease-in-out
  ```
- **Duration:**
  ```
  micro:  50–100ms   short: 150–250ms
  medium: 250–400ms  long:  400–700ms
  merge:  1200ms (intentionally slow — weight matters)
  ```

## Design Risks (Intentional Departures)
These are deliberate — do not "fix" them:

1. **Warm dark background** — Not the cold dark of SaaS. The yellow undertone of `#0F0E0A` reads as warm and aged. Never replace with pure black or a blue-tinted dark.
2. **Monospace tier names** — PERCEPTRON, AGI etc. render in JetBrains Mono all-caps. This is intentional terminal-output flavor for the tech audience. Do not switch to a rounded sans.
3. **Slow merge animations** — 1.2s feels long. That's the point. The weight communicates that something real happened. Do not speed this up to match typical game feedback loops.
4. **Muted neuron colors** — The 6 neuron types use desaturated scientific colors, not saturated game primaries. The merge animation and tier progression do the dopamine work, not the colors.
5. **One accent, used sparingly** — `#C8F060` appears ONLY for merges, AGI, achievements, and active states. If it appears everywhere it loses meaning.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | Warm dark background (#0F0E0A) over warm light | More cinematic and game-like; chartreuse accent pops dramatically against dark |
| 2026-03-23 | Acid chartreuse (#C8F060) as sole accent | Both primary designer and independent subagent converged on phosphor green independently |
| 2026-03-23 | JetBrains Mono for tier names | Terminal-output feel — delightful signal to target audience (tech/AI-curious, 25–40) |
| 2026-03-23 | Slow 1.2s merge animation | Respects player intelligence; weight communicates significance |
| 2026-03-23 | Halftone dot grid texture | PCB/graph paper texture signals physical craft; differentiates from frictionless puzzle game norms |
| 2026-03-23 | Initial design system created | Created by /design-consultation based on office-hours product context + competitive landscape research |
