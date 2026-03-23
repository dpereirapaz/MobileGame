# Game Design Specification

## One-Line Pitch

Place colored tiles on a grid. Match 3+ adjacent tiles to merge them into higher tiers. Keep the board alive as long as possible.

## Core Loop

```
Generate 3 pieces → Player places all 3 → Check merges → Check line clears → Score → Repeat
                                                                                    ↓
                                                                         No valid placement?
                                                                                    ↓
                                                                              Game Over
```

Session length target: 3–5 minutes per game.

---

## Grid

- **Size:** 8×8 (64 cells)
- **Cell states:** Empty or occupied by a Tile
- **Tile properties:** color (1 of 6), tier (1–7)

## Colors

6 colors, chosen for high contrast and color-blindness accessibility:

| Name | Hex | Usage |
|------|-----|-------|
| Ruby | #E74C3C | Warm palette |
| Amber | #F39C12 | Warm palette |
| Emerald | #2ECC71 | Cool palette |
| Ocean | #3498DB | Cool palette |
| Violet | #9B59B6 | Cool palette |
| Coral | #E67E22 | Warm palette |

Each color should also have a distinct shape indicator (circle, square, diamond, triangle, star, hexagon) for color-blind players. Enable in Settings.

## Tile Tiers

| Tier | Visual | Points (base) |
|------|--------|---------------|
| 1 | Flat color | 10 |
| 2 | Subtle gradient | 30 |
| 3 | Brighter gradient | 90 |
| 4 | Gradient + subtle glow | 270 |
| 5 | Strong glow + shine | 810 |
| 6 | Pulsing glow | 2,430 |
| 7 | Rainbow border + glow | 7,290 |

Points follow a 3× multiplier per tier. Reaching tier 7 should be rare and feel monumental.

## Pieces

### Shapes

Pieces are polyominoes of size 1–5 cells. All cells in a piece share one color.

**Size 1 (monomino):**
- 1×1 single cell

**Size 2 (domino):**
- 1×2 horizontal, 2×1 vertical

**Size 3 (triomino):**
- 1×3 line, 3×1 line
- L-shapes (4 rotations)

**Size 4 (tetromino):**
- T, L, J, S, Z, I, O shapes
- Include all rotations as separate pieces

**Size 5 (pentomino) — rare:**
- Plus/cross shape
- Long L
- Only appear after score > 2,000

### Generation Rules

- Draw from a weighted pool: small pieces (1–2 cells) = 40%, medium (3 cells) = 35%, large (4–5 cells) = 25%
- As score increases, gradually shift weight toward larger pieces (difficulty curve)
- Color is random per piece, uniform distribution across 6 colors
- All 3 pieces generated at once. Player must place all 3 before getting new ones.
- **Anti-frustration:** Never generate 3 pieces that are ALL impossible to place on the current board (re-roll if needed, but this should be extremely rare if the board isn't almost full)

### Placement Rules

- Player drags a piece from the tray onto the grid
- All cells of the piece must land on empty grid cells
- Piece must be fully within bounds (no overflow)
- Once placed, cells become tier-1 tiles of the piece's color
- Cannot rotate pieces (simplicity — rotation adds complexity without enough fun payoff for this mechanic)

## Merge Mechanic

### Detection

After each piece placement:

1. Scan the entire grid for groups of 3+ **adjacent** tiles that share the **same color AND same tier**
2. Adjacent = horizontally or vertically connected (not diagonal)
3. Use flood-fill / BFS to identify contiguous groups
4. If multiple groups exist, process them simultaneously

### Resolution

For each merge group:

1. Remove all tiles in the group
2. Calculate centroid position (average of all tile positions, round to nearest cell)
3. Place a single new tile at the centroid: same color, tier + 1
4. If the centroid cell was occupied by a non-group tile, shift to the nearest empty cell within the group's footprint

### Chain Merges

After resolving all merges in a turn:

1. Check if the newly created higher-tier tiles form NEW groups with adjacent same-color, same-tier tiles
2. If yes, resolve those merges too
3. Repeat until no more merges are possible
4. Each chain step increments the combo counter

### Line Clears

After all merges resolve:

1. Check for any complete rows (all 8 cells filled)
2. Check for any complete columns (all 8 cells filled)
3. Clear all complete rows and columns (remove all tiles in them)
4. Line clears can happen alongside merges in the same turn
5. Award bonus points per line cleared

## Scoring

### Base Points

| Action | Points |
|--------|--------|
| Piece placement | 5 × piece_size |
| Merge (group) | tier_base_points × group_size |
| Chain bonus | merge_points × chain_step (×2 for chain 2, ×3 for chain 3, etc.) |
| Line clear | 100 × lines_cleared_simultaneously |
| Perfect clear (empty board) | 1,000 bonus |

### Combo System

Consecutive turns that trigger at least one merge increment the combo counter. A turn with no merge resets it.

| Combo | Multiplier |
|-------|-----------|
| 1 | 1.0× |
| 2 | 1.2× |
| 3 | 1.5× |
| 5 | 2.0× |
| 10 | 3.0× |

### Callouts

| Condition | Callout | Animation |
|-----------|---------|-----------|
| Chain ×2 | "Nice!" | Subtle pulse |
| Chain ×3 | "Excellent!" | Burst particles |
| Chain ×4+ | "INCREDIBLE!" | Screen shake + particles |
| Combo ×5 | "On Fire! 🔥" | Glow effect on score |
| Combo ×10 | "UNSTOPPABLE!" | Full-screen flash |
| Line clear | "Clear!" | Sweep animation |
| Perfect clear | "PERFECT! ✨" | Rainbow burst |

## Game Over

Triggered when: after generating 3 new pieces, NONE of them can be placed anywhere on the grid.

**Game Over Screen:**
- Final score (large, prominent)
- High score (if new record: celebration animation)
- Stats: tiles merged, highest tier reached, longest chain, longest combo
- Buttons: "Play Again", "Share", "Main Menu"
- Rewarded ad option: "Watch ad to revive" (one-time per game, clears bottom 2 rows)

## Game Modes

### Zen Mode (Default)
- Endless play, no timer
- Personal best score tracking
- Most relaxed experience

### Daily Challenge
- Same seed for all players worldwide (date-based deterministic RNG)
- One attempt per day (can replay but only first score counts)
- Shareable result: "GridFlow Daily #127 — 4,230 pts ⭐⭐⭐"
- Star rating: ⭐ = top 50%, ⭐⭐ = top 25%, ⭐⭐⭐ = top 10% (based on percentile thresholds, adjusted weekly from aggregate data)
- Calendar view showing daily history and streaks

### Sprint Mode
- 3-minute timer
- Same mechanics, but urgency changes the feel
- Timer visual: bar that depletes, changes from green → yellow → red in last 30s
- Final screen shows score + time breakdown (merges per minute, etc.)

## Difficulty Curve

The game gets harder organically as the board fills up. Additional difficulty levers:

- **Piece size distribution shifts:** More large pieces as score increases
- **Color count:** Start with 4 colors, introduce 5th at score 500, 6th at score 1,500
- **Adaptive difficulty (hidden):** After 3 consecutive losses, subtly increase small-piece frequency for 2 games. Never reveal this to the player.

## Accessibility

- Color-blind mode: add shape indicators to tiles
- Tap-to-place alternative to drag-and-drop
- Haptic feedback toggle
- Sound toggle
- Large text option for score displays
- No time-critical elements in Zen mode (Sprint is opt-in)
