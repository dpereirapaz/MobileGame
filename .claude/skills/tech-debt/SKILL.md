---
name: tech-debt
description: "Track, categorize, and prioritize technical debt across the codebase. Scans for debt indicators, maintains a debt register, and recommends repayment scheduling."
argument-hint: "[scan|add|prioritize|report]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
---

When this skill is invoked:

1. **Parse the subcommand** from the argument:
   - `scan` — Scan the codebase for tech debt indicators
   - `add` — Add a new tech debt entry manually
   - `prioritize` — Re-prioritize the existing debt register
   - `report` — Generate a summary report of current debt status

2. **For `scan`**:
   - Search the codebase for debt indicators:
     - `TODO` comments (count and categorize)
     - `FIXME` comments (these are bugs disguised as debt)
     - `HACK` comments (workarounds that need proper solutions)
     - Files over 500 lines (potential god objects)
     - Functions over 50 lines (potential complexity)
   - Categorize each finding:
     - **Architecture Debt**: Wrong abstractions, missing patterns, coupling issues
     - **Code Quality Debt**: Duplication, complexity, naming, missing types
     - **Test Debt**: Missing tests, flaky tests, untested edge cases
     - **Documentation Debt**: Missing docs, outdated docs, undocumented APIs
     - **Performance Debt**: Known slow paths, unoptimized queries, memory issues
   - Update the debt register at `docs/tech-debt-register.md`

3. **For `prioritize`**:
   - Read the debt register
   - Score each item by: `(impact_if_unfixed * frequency_of_encounter) / fix_effort`
   - Re-sort the register by priority score
   - Recommend which items to include in the next sprint

4. **For `report`**:
   - Read the debt register
   - Generate summary statistics: total items by category, total estimated fix effort
   - Flag any items that have been in the register for more than 3 sprints

### Debt Register Format

```markdown
## Technical Debt Register
Last updated: [Date]
Total items: [N] | Estimated total effort: [T-shirt sizes summed]

| ID | Category | Description | Files | Effort | Impact | Priority | Added | Sprint |
|----|----------|-------------|-------|--------|--------|----------|-------|--------|
```

### Rules
- Tech debt is not inherently bad — it is a tool. The register tracks conscious decisions.
- Every debt entry must explain WHY it was accepted
- "Scan" should run at least once per sprint to catch new debt
