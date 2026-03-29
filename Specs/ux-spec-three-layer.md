# Synapse — 3-Layer UX Specification

Version: 1.0  
Date: 2026-03-29  
Status: Approved  

**Decisions locked:**
- Wire interaction: two-tap model (tap source → tap destination)
- Max connections: 8 total (per GDD §3.4.2)
- Connection Phase: source layer locked — no placement during connection drawing
- Output win: T7 in Output layer → 4-beat victory sequence + bottom sheet modal
- TierChain: keep as-is; layer headers own per-layer progress communication

---

## 1. Screen Layout

### Layout Diagram

```
┌─────────────────────────────────────────┐  ← 390px viewport
│  SYNAPSE          COMPUTE    PB    [↺]  │  ← ScoreBar (48px)
│─────────────────────────────────────────│
│  [INPUT] ─────────────── [GOAL: T4]     │  ← Layer header (28px)
│  ┌─────────────────────────┐            │
│  │  · · · · │ · · · · │   │            │  ← 4x4 grid (184px tall)
│  │  · · · · │ · · · · │   │            │     (4 × 44px + 8px padding)
│  │  · · · · │ · · · · │   │            │
│  │  · · · · │ · · · · │   │            │
│  └─────────────────────────┘            │
│                                         │
│  ════╦═════════╦════════╦══════         │  ← Wire zone (40px SVG overlay)
│       ║         ║        ║              │
│  ════╩═════════╩════════╩══════         │
│                                         │
│  [HIDDEN] ────────────── [LOCKED 🔒]   │  ← Layer header (28px)
│  ┌─────────────────────────┐            │
│  │  ░ ░ ░ ░ │ ░ ░ ░ ░ │   │            │  ← 4x4 grid, locked (dimmed)
│  └─────────────────────────┘            │
│                                         │
│  [OUTPUT] ─────────────── [LOCKED 🔒]  │
│  ┌─────────────────────────┐            │
│  │  ░ ░ ░ ░ │ ░ ░ ░ ░ │   │            │
│  └─────────────────────────┘            │
│                                         │
│  P › LL › HL › AH › TB › FM › AGI     │  ← TierChain (24px)
│  ─────────────────────────────────────  │
│  PLACE A NEURON — 3 ADJACENT MERGE      │  ← Hint bar (20px)
└─────────────────────────────────────────┘
```

### Grid Sizing

- Cell size: 44px (unchanged `--cell-size`)
- Layer grid: 176px × 176px (4 × 44px) with 8px container padding → 184px
- Layer block (header + grid): ~220px
- Wire zone between layers: 40px (SVG overlay)
- Full page height estimate: ~832px (fits iPhone 14; ~165px scroll on iPhone SE)

### Viewport Management

On layer unlock, call `scrollIntoView({ behavior: 'smooth', block: 'center' })` on the newly active layer. User can still scroll freely. Locked layers stay in DOM (dimmed, not hidden).

---

## 2. Visual Language for Layers

### Layer Identity

**Input Layer (active):** Normal grid (`--surface`, halftone texture). Goal chip: `GOAL: T4` in `--accent` outline.

**Locked layers:** `opacity: 0.35` on layer block. `background-color: var(--bg)` cells. Scrim overlay `rgba(15,14,10,0.55)`. Lock label `⊘` in `--text-dim`.

**Hidden Layer (unlocked):** Halftone texture fades in over 400ms. Left border accent `border-left: 2px solid var(--n-memory)`. Charge indicators appear.

**Output Layer (unlocked):** Faint ambient glow `box-shadow: 0 0 40px rgba(200,240,96,0.06)` on container.

### Charged Neurons

**T2 start (charge 1):**
- Ring: `box-shadow: 0 0 0 2px rgba(200,240,96,0.5), [tier glow]`
- Badge: `⚡` top-right of cell, 7px, `--accent`
- Label: `LL+` (tier abbreviation with `+`)

**T3 start (charge 2, from T5+ source):**
- Double ring: `box-shadow: 0 0 0 2px var(--accent), 0 0 0 5px rgba(200,240,96,0.25)`
- Label: `HL++`

### Wires

All wires live in a `ConnectionLayer` SVG component absolutely positioned in the wire zone.

| State | Stroke | Width | Dash | Opacity |
|-------|--------|-------|------|---------|
| Committed (phase ended) | `--n-planning` | 1.5 | none | 0.25 (ghost) |
| Committed (during phase) | `--n-planning` | 1.5 | none | 0.55 |
| Active / being drawn | `--accent` | 2 | 4 3 marching | 0.9 |
| Min met pulse | `--accent` | 2 | none | 0.7 → fade |

Wire draw animation: `stroke-dasharray` at full path length → `stroke-dashoffset` animates to 0 over 350ms `ease-out`. Then style transitions to committed state over 400ms.

### Connection Phase State

- Source layer header: `CONNECTION PHASE` banner replaces label — `--accent` text, `rgba(200,240,96,0.08)` bg, pulses 1.5s loop
- Hint bar: `TAP SOURCE NEURON IN INPUT` → after source tap → `NOW TAP TARGET IN HIDDEN`
- Wire zone background: `rgba(200,240,96,0.03)` fill (barely visible signal)

---

## 3. Touch Interaction Flows

### 3A. Placing a Neuron

```
TAP EMPTY CELL
  ├─ Locked layer → layer border pulses --error (150ms), no placement
  ├─ Animating → skip to final state (existing behavior)
  └─ Valid:
      → T1 neuron placed (neuronEnter bounce, 220ms)
      → BFS merge resolution
      → Solve check: highestTier >= solveAtTier?
          └─ YES → Victory beat (400ms) → Connection Phase
```

### 3B. Drawing a Wire (Connection Phase)

```
STEP 1: Tap occupied neuron in Layer N
  ├─ Empty cell → shake, ignore
  ├─ Wrong layer → hint: "TAP A NEURON IN INPUT FIRST"
  └─ Valid source:
      → Source gets accent selection ring
      → pendingSource = {row, col}
      → Hint: "NOW TAP A NEURON IN HIDDEN"

STEP 2: Tap neuron in Layer N+1
  ├─ Empty cell → hint: "TAP AN OCCUPIED NEURON IN HIDDEN"
  ├─ Re-tap same source → deselect (cancel)
  └─ Valid destination:
      → Wire draws itself (350ms)
      → connectionCount++
      → Destination gets ⚡ badge + charge tier
      → Counter updates: "2 / 3 CONNECTED"
      → connectionCount >= 3 → ACTIVATE button appears
```

### 3C. Canceling Mid-Draw

1. Re-tap selected source neuron → clears selection (selection ring fades 150ms)
2. Tap empty space outside any grid → same effect

No drag-to-cancel. Connection Phase cannot be exited without completing it.

### 3D. Activate Button

Appears in hint bar position when `connectionCount >= 3`:
- Full-width, `background: var(--accent)`, `color: var(--bg)`
- JetBrains Mono, uppercase, 11px, height 36px
- Pulses `scale(1.0 → 1.02 → 1.0)` on 1.5s loop
- Additional wires can still be drawn before tapping Activate (up to max 8)
- `aria-label="Activate Hidden Layer — N connections made"`

---

## 4. Ten Polish Improvements

### 1. Layer Unlock Sequence (3-beat transition, ~1.4s total)

- **Beat 1 (0–200ms):** Full-width `--accent` flash at 20% opacity. ACTIVATE button scales 1.1 → vanishes.
- **Beat 2 (200–600ms):** Wires pulse `--n-planning` → `--accent` → back. Locked layer scrim dissolves (opacity 0.55 → 0).
- **Beat 3 (600ms–1400ms):** Halftone texture fades in on new layer. Layer label fades from `LOCKED` to name. Charged neurons appear with `neuronEnter`, staggered 80ms per cell (row-major). Viewport scrolls to center new layer.

### 2. Goal Chip with Live Progress Indicator

Layer header goal chip shows: `BEST: T3 → T4`. Highest tier updates with a counter-flip animation (300ms). When target reached, chip turns full `--accent` and solve beat fires.

### 3. Pre-Tap Charge Preview

During Connection Phase, hovering/touchstart on empty destination cell shows a ghost neuron at `T2` (or `T3` if source is T5+) at `opacity: 0.35` with ⚡ badge. Vanishes on touchend/mouseleave.

### 4. Wire "Would Connect" Preview

When a source is selected, all occupied destination neurons gain a faint accent ring (`box-shadow` at 30% opacity). A ghost wire follows the user's touch position in real time as a dashed SVG path from source to cursor/finger.

### 5. Neuron Entry Stagger on Layer Unlock

Charged neurons in newly unlocked layer stagger `neuronEnter` animation by 60ms per cell in reading order. Max stagger 240ms (4 cells wide × 60ms). CSS: `animation-delay: calc(var(--stagger-index) * 60ms)` set inline.

### 6. Persistent Ghost Wires

After Connection Phase, drawn wires persist as ghost connections at `opacity: 0.25` in wire zones permanently. Long-press shows tooltip: `INPUT T4 → HIDDEN (charged)`. By Output layer, the screen shows the full network diagram.

### 7. Layer Status Eyebrow Text

8px JetBrains Mono, `--text-dim`, above each layer header:
- Active: `ACTIVE LAYER`
- Completed: `SOLVED — CONNECTED`
- Locked: `LOCKED — SOLVE LAYER N FIRST`

### 8. Haptic Feedback

| Event | Pattern |
|-------|---------|
| Neuron placed | `[15]` |
| Merge triggered | `[30, 20, 30]` |
| Solve tier reached | `[50, 30, 80]` |
| Wire drawn | `[20]` |
| Min connections met | `[20, 10, 20, 10, 40]` |
| Locked cell tap | `[8]` |

Implemented in `useHaptics()` hook. Respects `prefers-reduced-motion`.

### 9. First-Run Silent Onboarding (No Tutorial Text)

- **Beat 1 (game start):** Animated `--accent` arrow points to empty cell adjacent to pre-placed T1 neurons. Pulses twice, fades. No text.
- **Beat 2 (after first merge):** Goal chip pulses twice. TierChain highlights T1→T2 for 1.5s.
- **Beat 3 (highestTier reaches T3):** Goal chip briefly scales 1.0→1.1→1.0 with glow. Eyebrow text: `ALMOST THERE`.

Fires once per device (localStorage flag). Reduced motion: static arrow, no animations.

### 10. 4-Beat AGI Victory Sequence (Output Layer Win)

- **Beat 1 (0–500ms):** AGI halo expands to fill entire Output grid. All Output neurons pulse in AGI light.
- **Beat 2 (500ms–1200ms):** All wires in both zones pulse `--n-planning` → `--accent`. Screen slow-flash `--accent` at 8% opacity (400ms in, 400ms out).
- **Beat 3 (1200ms–2000ms):** Layer labels illuminate in sequence 200ms apart. TierChain lights T1→T7 at 120ms per tier.
- **Beat 4 (2000ms+):** Bottom sheet modal slides up `translateY(100% → 0)` over 400ms `ease-out`. Shows final compute + options.

---

## 5. Information Architecture

### Always Visible
| Element | Component |
|---------|-----------|
| Compute + Personal Best | `ScoreBar` |
| New game button | `ScoreBar` |
| Layer name + eyebrow status | `LayerHeader` |
| Goal chip | `LayerHeader` |
| TierChain | `TierChain` |

### Contextually Visible
| Element | Trigger |
|---------|---------|
| `CONNECTION PHASE` banner | Connection Phase active |
| Connection count `N / 3` | Connection Phase active |
| ACTIVATE button | `connectionCount >= 3` |
| Charge indicator on cell | Neuron is charged |
| `BEST: T3 → T4` progress | Layer has ≥1 neuron |
| Ghost wire preview | Source selected + hovering destination |

### Hidden Until Needed
| Element | Reveal condition |
|---------|-----------------|
| Wire zone SVG | Connection Phase activates |
| ACTIVATE button | 3+ connections drawn |
| Victory sequence | T7 in Output layer |
| Layer unlock animation | Layer locked → active transition |
| First-run nudge | First session only |

---

## 6. Component Map

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `LayerSection` | `components/LayerSection.tsx` | Wraps header + grid per layer |
| `LayerHeader` | `components/LayerHeader.tsx` | Name, eyebrow, goal chip, connection count |
| `ConnectionLayer` | `components/ConnectionLayer.tsx` | SVG wire overlay between two layers |
| `ActivateButton` | `components/ActivateButton.tsx` | Shown when min connections met |

### Modified Components

| Component | Change |
|-----------|--------|
| `Grid.tsx` | 8×8 → 4×4. Accept `layerId` prop for aria-labeling |
| `Cell.tsx` | Add `isCharged`, `chargeLevel`, `isConnPhaseSource`, `isConnPhaseTarget`, `unlockStaggerIndex` props |
| `App.tsx` | Multi-layer state, connection phase state machine, viewport scroll |
| `AGIModal.tsx` | Bottom sheet variant for win sequence |
| `TierChain.tsx` | Add `activeTier` prop for live tier illumination |
| `tokens.css` | Add `--layer-grid-width: 176px`, `--wire-zone-height: 40px` |

---

## 7. Accessibility

### LayerHeader
- `role="region"` + `aria-label="Input Layer, goal: Attention Head T4"`
- Goal chip: `aria-live="polite"`
- `CONNECTION PHASE` banner: `role="status"` + `aria-live="assertive"`

### ConnectionLayer SVG
- `role="img"` + `aria-label="Network connections between layers"`
- Each wire: `<title>Connection from Input T4 at row 2 col 3 to Hidden at row 1 col 1</title>`
- Ghost wire: `aria-hidden="true"`

### Locked Layers
- Grid: `aria-disabled="true"` + `aria-label="Hidden Layer, locked — solve Input Layer to unlock"`
- Cells: `tabindex="-1"`

### Connection Phase Keyboard Flow
- Tab navigates occupied source neurons; Enter/Space selects
- After selection, Tab moves to destination layer
- `aria-live="polite"` announces: "2 of 3 connections made"

### Reduced Motion
- All Connection Phase animations: instant, no pulses, no stagger
- Victory sequence: skip beats 1–3, show modal directly
