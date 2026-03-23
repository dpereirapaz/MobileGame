# GridFlow — Mobile Game Side Business

## What Is This?

GridFlow is a tile-merge puzzle game for iOS and Android. Players place colored tiles on an 8×8 grid; matching 3+ adjacent same-color tiles merges them into higher-tier tiles worth exponentially more points. The game ends when no pieces can be placed.

**Positioning:** "Block Blast meets 2048" — the satisfying grid placement mechanic everyone already knows, with a merge layer that adds strategic depth.

## Why This Game?

- Block Blast earned ~$17.5M/month from ads alone with zero IAP, proving simple puzzle games still dominate
- Merge is the fastest-growing puzzle sub-genre (2025–2026)
- The core mechanic is 100% algorithmic — no content pipeline, no narrative, no character art
- Entire codebase is JS/TS — ideal for Claude Code pair-programming

## Project Structure

The plan is split into **4 phases**, each with its own spec file. Every phase gates on specific metrics before proceeding to the next.

| Phase | File | Duration | Goal |
|-------|------|----------|------|
| 0 | [00-PROTOTYPE.md](./00-PROTOTYPE.md) | 1–2 weeks | Web prototype to validate core loop |
| 1 | [01-MOBILE-MVP.md](./01-MOBILE-MVP.md) | 3–4 weeks | Ship to App Store / Google Play |
| 2 | [02-MONETIZATION-AND-LAUNCH.md](./02-MONETIZATION-AND-LAUNCH.md) | 2–3 weeks | Ads, analytics, soft launch |
| 3 | [03-ITERATE-AND-SCALE.md](./03-ITERATE-AND-SCALE.md) | Ongoing | A/B testing, UA, expansion |

Supporting docs:

| File | Contents |
|------|----------|
| [TECH-STACK.md](./TECH-STACK.md) | Architecture, dependencies, project setup |
| [GAME-DESIGN.md](./GAME-DESIGN.md) | Complete game mechanics specification |
| [MONETIZATION.md](./MONETIZATION.md) | Revenue model, ad strategy, pricing |
| [GO-NO-GO.md](./GO-NO-GO.md) | Decision framework with kill/go metrics at each gate |

## How to Use with Claude Code

Each phase file is structured as a task list. When starting a phase:

1. Open the phase file and the relevant supporting docs
2. Work through tasks sequentially — each task is scoped for a single Claude Code session
3. Check off tasks as you complete them
4. At the end of each phase, evaluate against the Go/No-Go criteria before proceeding

## Budget Summary

| Item | Cost |
|------|------|
| Apple Developer Program | €99/year |
| Google Play Console | €25 (one-time) |
| Claude Pro subscription | €20/month |
| Sound effects | €30–100 |
| UA test budget (soft launch) | €500–1,000 |
| **Total to soft launch** | **€800–€1,600** |

## Target Demographics

- **Primary:** Women aged 28–45 who play during commutes, breaks, and downtime
- **Secondary:** Men 25–40 who enjoy puzzle/strategy games
- **Session profile:** 3–5 minute sessions, 3–4x daily
- **Motivation:** Stress relief, mental stimulation, "one more game" satisfaction
