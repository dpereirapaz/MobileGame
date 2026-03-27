---
name: balance-check
description: "Analyzes game balance data files, formulas, and configuration to identify outliers, broken progressions, degenerate strategies, and economy imbalances. Use after modifying any balance-related data or design."
argument-hint: "[system-name|path-to-data-file]"
user-invocable: true
allowed-tools: Read, Glob, Grep
---

When this skill is invoked:

1. **Identify the balance domain** from the argument.

2. **Read relevant data files** from `assets/data/` and `design/balance/`.

3. **Read the design document** for the system being checked.

4. **Perform analysis**:

   For **combat balance**:
   - Calculate DPS for all weapons/abilities at each power tier
   - Check time-to-kill at each tier
   - Identify any options that dominate all others (strictly better)
   - Check if defensive options can create unkillable states

   For **economy balance**:
   - Map all resource faucets and sinks with flow rates
   - Project resource accumulation over time
   - Check for infinite resource loops
   - Verify gold sinks scale with gold generation

   For **progression balance**:
   - Plot the XP curve and power curve
   - Check for dead zones (no meaningful progression for too long)
   - Check for power spikes (sudden jumps in capability)
   - Verify content gates align with expected player power

   For **score/mechanic balance** (applicable to Synapse):
   - Check scoring curve across difficulty levels
   - Verify combo multipliers don't create runaway scores
   - Check that all mechanics contribute meaningfully to score

5. **Output the analysis**:

```
## Balance Check: [System Name]

### Data Sources Analyzed
- [List of files read]

### Health Summary: [HEALTHY / CONCERNS / CRITICAL ISSUES]

### Outliers Detected
| Item/Value | Expected Range | Actual | Issue |
|-----------|---------------|--------|-------|

### Degenerate Strategies Found
- [Strategy description and why it is problematic]

### Recommendations
| Priority | Issue | Suggested Fix | Impact |
|----------|-------|--------------|--------|
```
