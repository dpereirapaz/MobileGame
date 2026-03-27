---
name: start
description: "First-time onboarding — asks where you are, then guides you to the right workflow. No assumptions."
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, Glob, Grep, AskUserQuestion
---

# Guided Onboarding

This skill is the entry point for new users or sessions. It asks first, then
routes you to the right workflow.

## Workflow

### 1. Detect Project State (Silent)

Before asking anything, silently gather context:

- **Engine/Stack configured?** Read `CLAUDE.md` and `Specs/` for tech stack
- **Game concept exists?** Check for `Specs/` files or `design/gdd/game-concept.md`
- **Source code exists?** Glob for source files in `synapse/src/` or `src/`
- **Design docs exist?** Count markdown files in `Specs/` and `design/gdd/`
- **Production artifacts?** Check for files in `production/sprints/` or `TODOS.md`

### 2. Ask Where the User Is

> **Welcome to the Synapse project!**
>
> Where are you at right now?
>
> **A) Fresh session** — I want to pick up where I left off
>
> **B) New feature** — I have a specific feature or mechanic to design/build
>
> **C) Bug fix** — Something is broken and I need to fix it
>
> **D) Polish/QA** — The feature works, I want to improve quality or test it

### 3. Route Based on Answer

#### If A: Fresh session
- Share what was found in Step 1
- Check `TODOS.md` for pending tasks
- Recommend the most logical next step based on project state

#### If B: New feature
- Ask for a brief description of the feature
- Recommend path: `/design-review` → `game-designer` agent → `gameplay-programmer` agent → `/code-review`

#### If C: Bug fix
- Ask for a brief description of the bug
- Recommend: `/bug-report` to document → `lead-programmer` agent to triage → fix → `/code-review`

#### If D: Polish/QA
- Recommend: `/playtest-report new` for structured testing → `/balance-check` if balance-related → `/code-review` for code quality

### 4. Confirm Before Proceeding

After presenting the recommended path, ask the user which step they'd like to take first. Never auto-run the next skill.

### 5. Hand Off

When the user chooses their next step, offer to run it for them or let them invoke it themselves.
