# Layer Progression System
## Game Design Document — Synapse

Version: 1.0
Date: 2026-03-29
Status: Approved

---

## 1. Overview

Synapse structures each run as a fixed three-layer neural network: Input Layer, Hidden Layer, and Output Layer. Each layer is an independent 4x4 grid played using the standard tile-placement and merge mechanics. A layer is "solved" when it contains a tile that meets or exceeds its tier threshold. Solving a layer triggers a manual wire-drawing Connection Phase, during which the player draws connections from neurons in the solved layer to neurons in the next layer. Those connections award charge boosts to the target neurons, causing them to spawn at higher starting tiers when the next layer activates. Completing the Output Layer (achieving a T7 tile) wins the run, logs the score, and begins a new run immediately.

---

## 2. Player Fantasy

The player feels like they are literally training a mind. Each layer is a small, manageable puzzle board — not overwhelming. The satisfaction of solving a layer transitions into a rewarding Connection Phase that feels like wiring synapses. Entering the next layer with charged neurons feels like a head start earned through skill. Winning the run (creating AGI in Layer 3) delivers a milestone moment: the screen communicates that something extraordinary just happened.

Primary MDA Aesthetics: Challenge (mastering each layer under board pressure), Discovery (learning which connection strategies boost Layer 2 and 3 most effectively), Narrative (the implicit story of building a mind layer by layer).

---

## 3. Detailed Rules

### 3.1 Run Structure

A run consists of exactly three layers played in sequence:

| Layer | Name | Solve Condition | Theme |
|---|---|---|---|
| 1 | Input Layer | Achieve T4 (Attention Head) tile | Perception |
| 2 | Hidden Layer | Achieve T5 (Transformer Block) tile | Processing |
| 3 | Output Layer | Achieve T7 (AGI) tile | Intelligence |

Layers are played one at a time. Layer 2 is locked until Layer 1 is solved and its Connection Phase completes. Layer 3 is locked until Layer 2 is solved and its Connection Phase completes.

### 3.2 Layer Grid Specification

Each layer uses a 4x4 grid (16 cells). All standard mechanics apply: piece placement, merge detection, chain merges. The 4x4 grid means board pressure arrives much faster than an 8x8 game, creating concentrated, high-stakes decisions.

### 3.3 Solve Condition (Tier Threshold)

A layer is solved the moment any tile on that layer's grid reaches or exceeds the layer's solve tier. This check fires immediately after any merge resolves (including chain merges).

- Layer 1 solve: any tile reaches T4 or higher
- Layer 2 solve: any tile reaches T5 or higher
- Layer 3 solve: any tile reaches T7 (run win)

When a layer is solved:
1. Freeze all input on that layer's grid.
2. All tiles currently on that layer's grid remain visible as "neurons."
3. Immediately enter the Connection Phase (Section 3.4).

### 3.4 Connection Phase

The Connection Phase is a dedicated interaction mode that activates immediately after a layer is solved. No piece generation occurs during this phase. The existing tiles on the solved layer become selectable "source neurons." The tiles on the next layer (all empty, shown as ghost outlines in a 4x4 grid) become selectable "target neurons."

#### 3.4.1 Tap Sequence

1. Player taps a source neuron on the solved layer (Layer N). The selected source neuron highlights with a glow border.
2. Player taps a target neuron on the next layer (Layer N+1). A visible wire animates between them. The connection is registered.
3. Repeat steps 1-2 to draw more connections.
4. When the player has drawn at least 3 connections, an "Activate Layer [N+1]" button becomes available.
5. Player taps "Activate Layer [N+1]" to end the Connection Phase and begin Layer N+1 play.

A source neuron may be re-tapped at any point before finalizing to deselect it. The player may also tap an existing wire to remove that connection and recover both its source and target slots.

#### 3.4.2 Connection Limits

| Rule | Value |
|---|---|
| Minimum connections required | 3 |
| Maximum connections per source neuron | 2 |
| Maximum connections per target neuron | 2 |
| Maximum total connections in a single Connection Phase | 8 |

#### 3.4.3 Charge Boost Formula

```
charge_contribution = floor(source_tier / 2), minimum 1
```

| Source Tier | Charge Contribution |
|---|---|
| T1 | 1 |
| T2 | 1 |
| T3 | 1 |
| T4 | 2 |
| T5 | 2 |
| T6 | 3 |
| T7 | 3 |

Starting tier applied to a target neuron when Layer N+1 activates:

```
starting_tier = min(total_charge + 1, 3)
```

| Total Charge | Starting Tier |
|---|---|
| 0 (no connections) | T1 (baseline) |
| 1 | T2 |
| 2 | T3 |
| 3+ | T3 (cap) |

#### 3.4.4 Charge Application at Layer Activation

When "Activate Layer N+1" is tapped:
1. The 4x4 grid for Layer N+1 initializes as empty (16 empty cells).
2. For each target neuron that received at least one connection: place a tile at that cell at its `starting_tier`. Color is randomly assigned.
3. Tiles placed via charge are NOT awarded placement points.
4. Standard play resumes: piece tray generates 3 pieces.

### 3.5 Fail States

#### 3.5.1 Per-Layer Fail State

A layer fails when, after generating a new piece tray, no piece in the tray can be placed anywhere on that layer's 4x4 grid.

On layer fail:
- The run ends immediately.
- Fail screen shows: layer reached, accumulated score, message "Layer [N] collapsed — network shutdown."
- No revival mechanic on Layer 1 or 2. Rewarded-ad revival available on Layer 3 only.
- After dismissal, a new run begins.

#### 3.5.2 Win State

Layer 3 is solved (T7 tile achieved). Run-win screen shows: "AGI Achieved," final run score, run stats, options to begin a new run.

---

## 4. Complete Game Loop

### 4.1 Run Start

Layer 1 (Input Layer) grid initializes: 4x4 empty. Piece tray generates 3 pieces.

### 4.2 Play Loop (per layer)

```
Generate 3 pieces → Player places all 3 → Detect merges → Resolve merges →
Award score → Check solve condition → If solved: Connection Phase →
If not: Check fail condition → If fail: Run Over → If not: Generate 3 new pieces → Repeat
```

### 4.3 Connection Phase (Layer N → Layer N+1)

1. Layer N grid freezes. All tiles become selectable source neurons.
2. Layer N+1 grid appears as ghost outlines (16 empty target neurons).
3. Player draws 3 to 8 connections following Section 3.4 rules.
4. Player taps "Activate Layer N+1."
5. Charge tiles spawn on Layer N+1 grid according to Section 3.4.4.

### 4.4 Layer 3 Exception

There is no Connection Phase after Layer 3. Solving Layer 3 (T7) ends the run immediately.

---

## 5. Scoring

### 5.1 Layer Completion Bonus

| Layer Solved | Condition | Bonus |
|---|---|---|
| Layer 1 | Solved at T4 (minimum) | 500 pts |
| Layer 1 | Solved with T5+ tile | 750 pts |
| Layer 2 | Solved at T5 (minimum) | 1,500 pts |
| Layer 2 | Solved with T6+ tile | 2,500 pts |
| Layer 3 | Solved at T7 (run win) | 5,000 pts |

### 5.2 Connection Bonus

```
connection_bonus = 25 × source_tier  (per connection drawn)
```

### 5.3 Run Score

Total accumulated score across all 3 layers, including layer completion bonuses and connection bonuses. Partial runs log accumulated score on fail.

---

## 6. Edge Cases

### 6.1 Insufficient Source Neurons

If fewer source neurons exist than can satisfy the minimum connection requirement, the minimum reduces:

```
effective_minimum = min(3, available_sources × max_connections_per_source)
```

UI shows: "Limited connections available — activate when ready."

### 6.2 Target Neuron Fully Connected

Tapping a target with 2 incoming connections is rejected with a visual shake. Player must choose a different target.

### 6.3 Charge Tile Color Conflicts

If two adjacent charged tiles at Layer N+1 activation share the same color and tier, they immediately merge. This is intentional — a legitimate high-reward outcome for skilled connection play.

### 6.4 Piece Tray at Layer Boundaries

Active tray pieces are discarded when Connection Phase begins. A fresh tray generates when Layer N+1 activates.

---

## 7. Tuning Knobs

| Knob | Default | Range |
|---|---|---|
| Layer 1 solve tier | T4 | T3–T5 |
| Layer 2 solve tier | T5 | T4–T6 |
| Layer 3 solve tier | T7 | T6–T7 |
| Minimum connections | 3 | 2–5 |
| Max connections per source | 2 | 1–3 |
| Max connections per target | 2 | 1–3 |
| Max total connections | 8 | 4–12 |
| Charge cap (max starting tier) | T3 | T2–T4 |
| Layer 1 min completion bonus | 500 | 200–1000 |
| Layer 1 exceed completion bonus | 750 | 400–1500 |
| Layer 2 min completion bonus | 1,500 | 750–3000 |
| Layer 3 win bonus | 5,000 | 2000–10000 |
| Connection point value per tier | 25 | 10–50 |

All values stored in `/assets/data/layer-config.json`, not hardcoded.

---

## 8. Acceptance Criteria

### Functional

- F1: Run starts with Layer 1 active, Layers 2 and 3 locked.
- F2: Layer 1 solve fires when any tile reaches T4+, on the same frame the tile exists.
- F3: Layer 2 solve fires when any tile reaches T5+.
- F4: Layer 3 solve fires when any tile reaches T7 — ends run with win state, no Connection Phase.
- F5: Connection Phase blocks all piece placement input until "Activate" is tapped.
- F6: A T4 source contributes exactly charge 2 to its target.
- F7: A target with total charge 2 starts at T3. Total charge 0 starts at T1.
- F8: Charge cap clamps all starting tiers at T3 maximum.
- F9: Minimum connections reduces correctly per Section 6.1.
- F10: A target with 2 incoming connections rejects a third tap with visual feedback.
- F11: Global maximum of 8 connections disables further drawing once reached.
- F12: Charged tiles at Layer N+1 activation immediately participate in merge detection.
- F13: Layer completion bonuses apply exactly once per layer at solve moment.
- F14: Connection bonuses apply when "Activate" is tapped.
- F15: Discarded tray pieces at Connection Phase start are not awarded points.
- F16: Rewarded-ad revival offered only on Layer 3 fail.

### Experiential

- E1: A new player reaches the Connection Phase within the first 2 runs.
- E2: Connection Phase takes 15–45 seconds for an experienced player.
- E3: Players express "building toward something" when completing a layer (>60% in post-playtest survey).
- E4: Layer starting with all 8 charge targets at T3 still requires real play to reach solve condition.
- E5: Fail at Layer 2 or 3 feels like meaningful progress loss, not arbitrary.
