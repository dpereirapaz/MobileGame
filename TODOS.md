# TODOS

## TODO-001 — Phase 1 score formula alignment

**What:** Reconcile the prototype compute formula with the full GAME-DESIGN.md scoring system before Phase 1 scoring is implemented.

**Why:** The prototype uses a simplified formula (each merge awards `tier_output` points, +500 override for AGI). GAME-DESIGN.md defines a richer formula: `tier_base_points × group_size` with chain multipliers (×2 for chain 2, ×3 for chain 3, etc.) and a combo system (1.0–3.0× multiplier). These produce different numbers — if Phase 1 uses the GAME-DESIGN.md formula without reconciliation, prototype high scores won't be comparable.

**Pros:** Ensures leaderboard numbers are consistent from prototype through Phase 1. Avoids a surprise formula change mid-development.

**Cons:** Minor design work (~1 hour human / ~10min CC). Low urgency until Phase 1 starts.

**Context:** Prototype formula was simplified to reduce session scope (turbo prototype is 2 sessions). Full formula is in `Specs/GAME-DESIGN.md` under "Scoring". The prototype stores `personalBest` in localStorage — if the formula changes, old bests become invalid.

**Depends on:** Prototype validation (Gate 0→1). Only relevant if proceeding to Phase 1.

---

## TODO-002 — GameState API shape for Phase 1 multi-piece tray

**What:** Design the Phase 1 `GameState` shape and API signature before Phase 1 coding starts. The prototype uses `placeNeuron(state, row, col): GameState` — one neuron per turn. Phase 1 adds a 3-piece tray.

**Why:** The current API actively resists the Phase 1 tray feature. Adding a tray requires either tray state in `GameState` (breaking change) or a new function signature like `placeFromTray(state, trayIndex, row, col)`. Deciding this upfront avoids a surprise refactor mid-Phase 1.

**Pros:** Phase 1 starts with a designed API, not an improvised one. Prototype code can be written to minimize the Phase 1 delta (e.g., don't tightly couple the React layer to `placeNeuron`'s current signature).

**Cons:** Premature if the prototype fails Gate 0→1. Don't design this before the prototype validates.

**Context:** The approved design doc (office-hours) explicitly lists "multi-piece tray (3 pieces per turn)" as the first post-validation backlog item. Candidate Phase 1 API: `GameState` gains a `tray: Piece[]` field; `placeFromTray(state, trayIndex, row, col): GameState` replaces `placeNeuron`. Phase 1 spec TBD post-prototype (design doc says "run /plan-eng-review at start of Phase 1").

**Depends on:** Gate 0→1 (prototype validation). Run /office-hours for Phase 1 first.
