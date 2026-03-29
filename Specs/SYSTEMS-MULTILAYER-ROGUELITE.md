# Systems Spec: Multi-Layer Roguelite Mode
Version 1.0 — 2026-03-29
Author: systems-designer
Status: Approved with reconciliation (see Section 0)

---

## 0. Reconciliation with GDD (03-LAYER-PROGRESSION.md)

The systems designer originally proposed a turn-budget + score-target win
condition and an automatic seeding connection phase. These conflict with the
already-approved GDD. The following resolutions apply:

**WIN CONDITION (GDD governs):**
- Layer 1 solves when any tile reaches T4 (Attention Head)
- Layer 2 solves when any tile reaches T5 (Transformer Block)
- Layer 3 solves when any tile reaches T7 (AGI) → run win
- No turn budget or score target. Tier threshold is the solve condition.

**CONNECTION MECHANIC (GDD governs):**
- Player manually draws wires: tap source neuron → tap target neuron
- Minimum 3 connections required to activate next layer
- Max 8 total connections, max 2 per source/target
- Charge formula per GDD §3.4.3: floor(source_tier/2), min 1
- Starting tier = min(total_charge + 1, 3)

**LAYER MULTIPLIERS (this spec governs):**
- 1x / 3x / 9x as specified below — additive to GDD scoring

**LAYER COMPLETION BONUSES (GDD governs):**
- Already specified in GDD §5.1

**SCORE TARGETS in Section 4 are REPLACED** by GDD tier thresholds.
The worked examples in Section 9 use the revised system.

---

## 1. Overview

Mathematics, constants, and edge-case rules for the Multi-Layer Roguelite
mode. The base engine (engine.ts / engine-v2.ts) is not modified. All layer
mechanics are additive.

- Exactly 3 layers per run
- Failing any layer (board full, no moves) ends the run immediately
- Session target: under 5 minutes
- Board size: 4×4 per layer
- No speed bonus, no retries, no board carry-over between layers

---

## 2. Base Score Values (Unchanged from Engine)

| Tier Created | Points Awarded |
|---|---|
| T2 | 2 |
| T3 | 3 |
| T4 | 4 |
| T5 | 5 |
| T6 | 6 |
| T7 (AGI) | AGI_BONUS = 500 |

Placement awards no points. Score accumulates on merge resolution only.

---

## 3. Layer Multipliers

### 3.1 Formula

```
LayerMultiplier(N) = BASE_MULT ^ (N - 1)
  BASE_MULT = 3.0
```

| Layer | Multiplier |
|---|---|
| 1 (Input) | 1.0× |
| 2 (Hidden) | 3.0× |
| 3 (Output) | 9.0× |

### 3.2 Application Rule

Multiplier is applied to total base points earned within a layer AFTER all
merges resolve. Not applied per-merge.

```
LayerScore(N) = sum(all pointsEarned in layer N) × LayerMultiplier(N)
```

Animation shows base points during play; multiplied layer total revealed at
layer-clear screen.

### 3.3 Rationale

3.0 base mirrors the tier progression ratio. Layer 3 at comparable efficiency
outscores Layers 1+2 combined by ~2×, creating the intended escalating power
curve. The AGI_BONUS (500 base) becomes 4,500 at Layer 3's 9× — the climax
the run is designed around.

---

## 4. Win Condition (Tier Threshold — per GDD)

Each layer solves when a tile of the required tier is created:

| Layer | Solve Tier | Name |
|---|---|---|
| 1 (Input) | T4 | Attention Head |
| 2 (Hidden) | T5 | Transformer Block |
| 3 (Output) | T7 | AGI |

Solve fires on the frame the tile exists (after merge resolution). Layer 3
solve = run win, not a Connection Phase.

---

## 5. Connection Phase (Manual Wire Drawing — per GDD)

When Layer N solves, player manually draws wires:

1. Tap source neuron in Layer N (solved, frozen)
2. Tap target neuron in Layer N+1 (empty ghost grid)
3. Wire animates. Connection registered.
4. Minimum 3 connections → "Activate" button appears.
5. Player taps Activate → Layer N+1 seeds with charged neurons.

### 5.1 Charge Formula (from GDD §3.4.3)

```
charge_contribution = floor(source_tier / 2), minimum 1
starting_tier = min(total_charge + 1, 3)  // capped at T3
```

| Source Tier | Charge | Starting Tier if sole connection |
|---|---|---|
| T1–T2 | 1 | T2 |
| T3–T4 | 1–2 | T2–T3 |
| T5–T6 | 2–3 | T3 |
| T7 | 3 | T3 (capped) |

### 5.2 Connection Scoring (this spec)

```
connection_bonus = 25 × source_tier  (per connection drawn)
```

Applied when "Activate" is tapped, before layer transition.

### 5.3 Seed Positions (deterministic)

When charges are applied to Layer N+1, positions are determined by the
player's wire choices. If the player draws 3 wires, exactly 3 cells in
Layer N+1 receive charge. The player controls which cells — this is the
strategic depth of the Connection Phase.

The following reference table shows expected advantage by source tier:

| Source Tier | Charge | Target starts at |
|---|---|---|
| T1–T3 | 1 | T2 (saves 1 merge) |
| T4–T6 | 2 | T3 (saves 2 merges) |
| T7 | 3 | T3 capped (saves 2 merges) |

---

## 6. Run Scoring

### 6.1 Formula

```
RunScore = Σ LayerScore(N) for all layers played
         + Σ connection_bonus for all connections drawn
         + Σ layer_completion_bonus (per GDD §5.1)

LayerScore(N) = LayerBaseScore(N) × LayerMultiplier(N)
```

Partial layers (failed) still contribute their accumulated LayerBaseScore × multiplier.

### 6.2 Layer Completion Bonuses (from GDD §5.1)

| Layer | Condition | Bonus |
|---|---|---|
| Layer 1 | Solved at T4 | 500 pts |
| Layer 1 | Solved with T5+ | 750 pts |
| Layer 2 | Solved at T5 | 1,500 pts |
| Layer 2 | Solved with T6+ | 2,500 pts |
| Layer 3 | Solved at T7 | 5,000 pts |

These are flat bonuses, not multiplied by LayerMultiplier.

### 6.3 Run Score Display

```
Layer 1 base: [X] pts × 1.0 = [X] pts
Layer 2 base: [X] pts × 3.0 = [X] pts
Layer 3 base: [X] pts × 9.0 = [X] pts
Completion bonuses: [X] pts
Connection bonuses: [X] pts
─────────────────────────────
TOTAL RUN SCORE: [X] pts
```

For Layer 1, suppress multiplier display (1.0× adds no information).
For Layers 2 and 3, animate multiplier reveal as "score pop" after raw total.

---

## 7. Tuning Parameters

```typescript
// synapse/src/game/layerConstants.ts

export const BASE_MULT = 3.0;         // layer multiplier base
export const LAYER_SOLVE_TIERS = [4, 5, 7] as const;  // T4, T5, T7
export const LAYER_SIZE = 4;          // 4×4 grid per layer
export const MIN_CONNECTIONS = 3;
export const MAX_CONNECTIONS = 8;
export const MAX_CONNECTIONS_PER_SOURCE = 2;
export const MAX_CONNECTIONS_PER_TARGET = 2;
export const CHARGE_CAP = 3;          // max starting tier from charges
export const CONNECTION_POINT_VALUE = 25;  // per-tier per-connection bonus

// Layer completion bonuses
export const LAYER_COMPLETION_BONUSES = {
  layer1_min: 500,
  layer1_exceed: 750,
  layer2_min: 1500,
  layer2_exceed: 2500,
  layer3_win: 5000,
} as const;
```

### 7.1 Safe Ranges

| Parameter | Default | Safe Range |
|---|---|---|
| BASE_MULT | 3.0 | 2.0–5.0 |
| CONNECTION_POINT_VALUE | 25 | 10–50 |
| CHARGE_CAP | 3 | 2–4 |
| MIN_CONNECTIONS | 3 | 2–5 |
| MAX_CONNECTIONS | 8 | 4–12 |

### 7.2 Critical Constraints

**Charge cap T3:** Hard cap. T4+ seeds reduce merges needed for AGI from ~18 to ~6 — trivialises Layer N+1.

**BASE_MULT < 5.0:** Above 5.0, a single Layer 3 run can dwarf Layer 1+2 combined to the point where early layers feel inconsequential.

**MIN_CONNECTIONS ≥ 2:** Below 2, the Connection Phase loses strategic depth.

---

## 8. Feedback Loops

### 8.1 Positive Loops (Intentional)

**P1: Skill → High-tier source → T3 seeds → Easier Layer N+1**
Connecting from a T5 source gives target T3 start. T3 is one merge away from
T4, which gives the player an early high-tier tile with fewer placements.

**P2: Chain merges → High base points → Strong LayerScore**
Chain merges compound within a single turn. A T2→T3→T4 chain yields 2+3+4=9
base points in one placement. At Layer 3's 9× multiplier: 81 run points from
one move.

**P3: Efficient Layer 3 → AGI + 4,500 run points**
AGI_BONUS (500 base) × 9× = 4,500 run points. This is the session's climax
and the primary replay motivation.

### 8.2 Negative Loops (Intentional)

**N1: Minimum connections → Minimum charge → Weaker Layer N+1**
Drawing only 3 T1-source wires gives 3 T2-start cells. Drawing 8 T5-source
wires gives up to 8 T3-start cells. Strategic wire choice matters.

**N2: Board full in Output layer → Run ends, no AGI**
The tension throughout is that the 4×4 board fills fast. Every placement
decision is meaningful because board death ends a 9× multiplier opportunity.

---

## 9. Worked Example — Full 3-Layer Run

### Layer 1 (1.0×, solve at T4)

Board: 4×4, 2 T1 seeds pre-placed at (1,1) and (1,2).

Efficient play builds 3 adjacent T1s → T2 merge → chain to T3 (3-in-column
of T2) → eventually 3 T3s → T4 merge. T4 creation scores +4 base. Solve fires.

Typical Layer 1 base score before solve: 20–40 pts.
LayerScore(1) = 30 × 1.0 = 30 pts.

Connection phase: player draws 6 wires from T4 source (2 connections max) and
T3 sources. Charge of T4 = floor(4/2) = 2 → targets start at T3. T3 charge =
floor(3/2) = 1 → targets start at T2.

Connection bonus: 2×(25×4) + 4×(25×3) = 200 + 300 = 500 pts.
Layer completion bonus: 500 pts (solved at T4 minimum).

### Layer 2 (3.0×, solve at T5)

Layer starts with 2 T3-charged cells and 4 T2-charged cells (from connections).
Player has 6 pre-boosted cells. A T3 group fires on first adjacent T3 placement.
Efficient play reaches T5.

Typical Layer 2 base score: 60–100 pts.
LayerScore(2) = 80 × 3.0 = 240 pts.
Layer completion bonus: 1,500 pts.

### Layer 3 (9.0×, solve at T7)

Starts with T3-charged cells from Layer 2 connections. First move may chain.
AGI creation scores +500 base = +4,500 run points.

Typical Layer 3 base score: 550–800 pts.
LayerScore(3) = 650 × 9.0 = 5,850 pts.
Layer win bonus: 5,000 pts.

### Total Run Score (typical skilled run)
```
Layer 1 score:          30 pts
Connection bonus L1:   500 pts
Completion bonus L1:   500 pts
Layer 2 score:         240 pts
Connection bonus L2:   400 pts
Completion bonus L2: 1,500 pts
Layer 3 score:       5,850 pts
Completion bonus L3: 5,000 pts
─────────────────────────────
TOTAL:              14,020 pts
```

Struggling run (fails Layer 2): ~800 pts.
Perfect run (all T5+ connections, dual AGI): ~25,000+ pts.

---

## 10. Edge Cases

### 10.1 Win and Fail Same Turn (Board Full + Solve)
If placing a tile fills the board AND creates the solve tier, WIN takes
priority. Check order: resolve merge → check solve → check game-over.

### 10.2 AGI Created, Layer Not Output
If AGI (T7) is somehow created in Layer 1 or 2 (board is 4×4, very unlikely
but possible with all T6 tiles), it scores 500 base points but does NOT win
the run. Solve condition for Layer 1 is T4 — T7 satisfies it (T7 ≥ T4).
Layer 2 solve at T5 — T7 satisfies it too. The run proceeds normally.

### 10.3 All Cells Charged at Layer Activation
Max 8 connections → max 8 charged cells (out of 16). Board never starts full.

### 10.4 Connection Phase with One Source Neuron
Per GDD §6.1: effective_minimum = min(3, available_sources × 2). With 1
source: min(3, 2) = 2 connections required.

### 10.5 Multiple AGI in One Merge Pass
Engine resolves all groups simultaneously. Two T6 groups → 2 AGI tiles →
+1,000 base points. At Layer 3: +9,000 run points. Valid. No special handling.

---

## 11. Acceptance Criteria

| Metric | Target |
|---|---|
| Layer 1 clear rate (casual player) | > 60% of runs |
| Layer 2 clear rate (given L1 clear) | > 40% of runs |
| Layer 3 clear rate (given L2 clear) | > 25% of runs |
| Full run rate | ~10% of all runs |
| Mean full run score | 10,000–20,000 pts |
| AGI creation feel | "climactic" — score reveal shows 4,500+ pt jump |
