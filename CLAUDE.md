# Claude Code Game Studios — Agent Architecture

Indie game development managed through coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

## Project: Synapse

- **Stack**: TypeScript / React / Vite (web game)
- **Source**: `synapse/` directory
- **Design System**: See `DESIGN.md` — always read before making visual/UI decisions
- **Specs**: See `Specs/` for game design documents

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question → Options → Decision → Draft → Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

## Specialist Agents (`.claude/agents/`)

| Agent | Use for |
|-------|---------|
| `game-designer` | Core loops, mechanics design, progression, economy |
| `systems-designer` | Combat formulas, progression curves, math modeling |
| `lead-programmer` | Code architecture, API design, code review, refactoring |
| `gameplay-programmer` | Implementing designed mechanics as code |
| `ui-programmer` | UI systems, HUDs, menus, data binding |
| `ux-designer` | User flows, interaction design, accessibility, onboarding |
| `technical-director` | Architecture decisions, tech choices, performance strategy |
| `producer` | Sprint planning, milestone tracking, risk management |
| `prototyper` | Rapid throwaway prototypes to validate concepts |
| `performance-analyst` | Profiling, bottlenecks, optimization strategy |
| `qa-lead` | Test strategy, bug triage, release quality gates |

## Skills (`/slash-commands`)

**Game development skills** (from `.claude/skills/`):
`/start`, `/code-review`, `/design-review`, `/playtest-report`, `/balance-check`, `/bug-report`, `/sprint-plan`, `/prototype`, `/tech-debt`

**gstack skills** (web browsing, QA, deployment):
`/browse`, `/qa`, `/qa-only`, `/design-review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/review`, `/investigate`, `/retro`, `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/codex`, `/cso`, `/autoplan`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/setup-browser-cookies`, `/setup-deploy`, `/document-release`, `/gstack-upgrade`

> Use `/browse` for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

## Automated Hooks (`.claude/hooks/`)

- **SessionStart**: Loads project context, detects documentation gaps
- **PreToolUse**: Validates commits (design doc sections, JSON, hardcoded values) and pushes
- **PostToolUse**: Validates asset naming conventions
- **PreCompact**: Dumps session state before context compression
- **Stop**: Logs session summary
- **SubagentStart**: Audit trail of agent invocations

## Design System

Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
