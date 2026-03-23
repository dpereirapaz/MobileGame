# Phase 0: Web Prototype

**Duration:** 1–2 weeks (10–15 hours total)  
**Goal:** Validate that the core merge-placement mechanic is fun before investing in mobile  
**Tech:** Plain React (Vite or Next.js) — no mobile tooling yet  
**Output:** A playable browser game you can share via URL

---

## Why Prototype First?

Building the full mobile app takes 6+ weeks and real money (developer accounts, assets, etc.). The prototype answers the only question that matters early on: **is the core loop fun enough to retain players?**

If the answer is no, you pivot the mechanic at near-zero cost. If yes, you proceed to Phase 1 with confidence.

---

## Tasks

### 0.1 — Project Setup
- [ ] Create a new React project: `npm create vite@latest gridflow-prototype -- --template react-ts`
- [ ] Set up basic project structure: `src/game/`, `src/components/`, `src/utils/`
- [ ] Install minimal dependencies: none beyond React (keep it lean)
- [ ] Deploy to Vercel/Netlify for easy sharing (free tier)

### 0.2 — Grid Rendering
- [ ] Render an 8×8 grid using CSS Grid or Canvas
- [ ] Each cell can be: empty, or contain a tile with a color + tier (1–7)
- [ ] Tile visuals: simple colored squares with a number or icon indicating tier
- [ ] Grid should be responsive — works on both desktop and mobile browser

### 0.3 — Piece Generation
- [ ] Generate a tray of 3 pieces (below the grid)
- [ ] Piece shapes: monominos (1×1), dominoes (1×2, 2×1), triominoes (L-shape, line), tetrominoes (T, L, S, Z, I, O)
- [ ] Each piece has a single color (random from palette of 5–6 colors)
- [ ] Weight distribution: favor smaller pieces early, increase larger pieces as score grows
- [ ] All 3 pieces must be placed before new ones generate

### 0.4 — Piece Placement
- [ ] Drag-and-drop or tap-to-select-then-tap-to-place interaction
- [ ] Ghost preview: show where the piece will land as the player hovers/drags
- [ ] Validate placement: piece must fit within grid, all cells must be empty
- [ ] On valid placement: fill cells with the piece's color at tier 1
- [ ] On invalid: snap back / reject with visual feedback

### 0.5 — Merge Logic (Core Innovation)
- [ ] After each piece placement, scan for groups of 3+ adjacent same-color tiles (flood fill / BFS)
- [ ] Adjacent = horizontal + vertical (not diagonal)
- [ ] When a group is found: remove all tiles in the group, place a single tile of the same color at tier+1 in the centroid position
- [ ] Chain merges: if the newly created higher-tier tile forms a new group with adjacent same-tier same-color tiles, merge again
- [ ] Score: base points for merge (tier × group_size), multiplier for chains

### 0.6 — Row/Column Clearing
- [ ] When a full row or column is filled (all 8 cells occupied), clear the entire row/column
- [ ] This works alongside merges — placement can trigger both merge and line clear
- [ ] Line clears award bonus points
- [ ] Visual: satisfying sweep animation

### 0.7 — Game Over Detection
- [ ] After generating a new set of 3 pieces, check if ANY of them can be placed anywhere on the grid
- [ ] If none can be placed → game over
- [ ] Display final score, high score (localStorage), and "Play Again" button

### 0.8 — Scoring & Feedback
- [ ] Score display: current score, high score
- [ ] Combo counter: tracks consecutive merges/clears within a single turn
- [ ] Visual feedback: "Perfect!", "Excellent!", "Chain ×3!" callouts
- [ ] Simple CSS animations: tile pop-in, merge glow, line clear sweep
- [ ] No sound in prototype (save for Phase 1)

### 0.9 — Polish & Share
- [ ] Add a brief tutorial overlay on first play (3–4 screens explaining the mechanic)
- [ ] Make it mobile-browser-friendly (touch events, viewport meta)
- [ ] Deploy to a public URL
- [ ] Create a short screen recording / GIF for sharing

---

## Validation Plan

Share the prototype with 20–30 people across these channels:
- Personal contacts (WhatsApp/Telegram groups)
- r/WebGames, r/IndieGaming on Reddit
- LinkedIn post (your network of tech professionals)
- 2–3 Discord game dev communities

### What to Measure

Use a simple analytics snippet (Plausible or a custom event logger) to track:

| Metric | Target | Kill Threshold |
|--------|--------|----------------|
| Average session duration | > 3 minutes | < 2 minutes |
| Games played per session | > 2.5 | < 1.5 |
| Return visits within 48h | > 20% | < 10% |
| Qualitative: "I want to play again" | > 60% in feedback | < 30% |

### Decision Gate

| Signal | Action |
|--------|--------|
| All targets met | → Proceed to Phase 1 (Mobile MVP) |
| Mixed results (some targets met) | → Iterate on the mechanic for 1 more week, then re-test |
| All kill thresholds hit | → Pivot: try a different core mechanic (e.g., pure merge without grid placement, or pattern-matching variant) |

---

## Claude Code Session Guide

**Session 1** (~2–3 hrs): Tasks 0.1 + 0.2 + 0.3  
Prompt: "Set up a React TypeScript project with an 8×8 grid game board and a piece tray that generates 3 random polyomino pieces with colors."

**Session 2** (~2–3 hrs): Tasks 0.4 + 0.5  
Prompt: "Implement drag-and-drop piece placement on the grid with ghost preview, and add merge logic: when 3+ adjacent same-color tiles touch, merge them into one higher-tier tile at the centroid."

**Session 3** (~2 hrs): Tasks 0.6 + 0.7 + 0.8  
Prompt: "Add row/column clearing, game-over detection when no pieces can be placed, scoring with combo tracking, and CSS animations for merges and clears."

**Session 4** (~1–2 hrs): Task 0.9  
Prompt: "Add a tutorial overlay, make it mobile-browser responsive, deploy to Vercel, and add basic analytics to track session duration and games per session."
