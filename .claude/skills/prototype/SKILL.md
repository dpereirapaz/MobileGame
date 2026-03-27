---
name: prototype
description: "Rapid prototyping workflow. Skips normal standards to quickly validate a game concept or mechanic. Produces throwaway code and a structured prototype report."
argument-hint: "[concept-description]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

When this skill is invoked:

1. **Read the concept description** from the argument. Identify the core
   question this prototype must answer.

2. **Read CLAUDE.md** for project context and the current tech stack.

3. **Create a prototype plan**: Define in 3-5 bullet points the minimum
   viable prototype. What is the core question? What is the absolute
   minimum code needed to answer it?

4. **Create the prototype directory**: `prototypes/[concept-name]/`

5. **Implement the prototype** in the isolated directory. Every file must begin with:
   ```
   // PROTOTYPE - NOT FOR PRODUCTION
   // Question: [Core question being tested]
   // Date: [Current date]
   ```
   Standards are intentionally relaxed:
   - Hardcode values freely
   - Use placeholder assets
   - Skip error handling
   - Use the simplest approach that works

6. **Test the concept**: Run the prototype. Observe behavior.

7. **Generate the Prototype Report** at `prototypes/[concept-name]/REPORT.md`:

```markdown
## Prototype Report: [Concept Name]

### Hypothesis
[What we expected to be true]

### Approach
[What we built, how long it took, what shortcuts we took]

### Result
[What actually happened -- specific observations]

### Metrics
- Feel assessment: [specific -- "response felt sluggish at 200ms delay"]
- Iteration count: [how many attempts to get it working]

### Recommendation: [PROCEED / PIVOT / KILL]
[One paragraph explaining the recommendation with evidence]

### If Proceeding
[What needs to change for production-quality implementation]

### Lessons Learned
[Discoveries that affect other systems or future work]
```

8. **Output a summary** with the core question, result, and recommendation.

### Important Constraints

- Prototype code must NEVER import from production source files
- Production code must NEVER import from prototype directories
- If recommendation is PROCEED, production implementation is written from scratch
- Total prototype effort should be timeboxed to 1-3 days
