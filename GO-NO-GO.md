# Go / No-Go Decision Framework

Every phase has a gate. You evaluate metrics, make a binary decision, and either proceed, iterate, or kill. This prevents sunk-cost thinking and keeps the project disciplined.

---

## Gate 0 → 1: Prototype → Mobile MVP

**When:** After 1–2 weeks of prototype testing with 20–30 users

| Metric | GO | ITERATE (1 more week) | KILL / PIVOT |
|--------|----|-----------------------|--------------|
| Avg session duration | > 3 min | 2–3 min | < 2 min |
| Games per session | > 2.5 | 1.5–2.5 | < 1.5 |
| 48h return rate | > 20% | 10–20% | < 10% |
| "Would play again" (survey) | > 60% | 30–60% | < 30% |

**GO action:** Start Phase 1. Register developer accounts. Set up Expo project.

**ITERATE action:** Identify the weakest metric. Adjust the mechanic (difficulty, merge feedback, piece variety). Test for 1 more week with fresh users. If still not meeting GO after 2 iterations, trigger KILL.

**KILL action:** The core mechanic isn't fun enough. Don't build the mobile app. Options:
- Try a different merge mechanic (e.g., match by tier instead of color)
- Try a different core loop entirely (e.g., pattern matching, word puzzle)
- Shelve the project and revisit with fresh ideas in 4–6 weeks

---

## Gate 1 → 2: Mobile MVP → Monetization & Launch

**When:** After 5–10 testers have used the mobile app for at least 3 days

| Metric | GO | ITERATE | KILL |
|--------|----|---------|----- |
| Testers play 3+ games/sitting | Yes | Sometimes | Rarely |
| Merge mechanic understood without help | > 80% | 50–80% | < 50% |
| "Would install on my phone" | > 70% | 40–70% | < 40% |
| Crashes | 0 | 1–2 (reproducible) | Frequent |
| Performance (animation smoothness) | Solid 60fps | Occasional drops | Unplayable |

**GO action:** Begin Phase 2. Integrate ads and analytics. Prepare store submission.

**ITERATE action:** Fix the identified issues (UX confusion, performance, crashes). Re-test with the same or new testers. Budget 1 extra week.

**KILL action:** If the mobile experience fundamentally doesn't work (e.g., touch interactions feel wrong, RN performance isn't good enough), consider:
- Switching to a web app (PWA) instead of native
- Rebuilding with a different engine (e.g., Godot for better game performance)
- Shelving if the effort/reward ratio is too high

---

## Gate 2 → 3: Soft Launch → Iterate & Scale

**When:** After 2–3 weeks of soft launch in Spain with 200–500+ installs

| Metric | GO (Scale) | ITERATE | KILL |
|--------|-----------|---------|------|
| D1 retention | > 35% | 25–35% | < 25% |
| D7 retention | > 15% | 8–15% | < 8% |
| Avg session duration | > 4 min | 2–4 min | < 2 min |
| eCPM (interstitial) | > $5 | $3–5 | < $3 |
| eCPM (rewarded) | > $15 | $8–15 | < $8 |
| Crash rate | < 1% | 1–3% | > 3% |
| Store rating | > 4.0 | 3.5–4.0 | < 3.5 |

**GO action:** Begin Phase 3. Start A/B testing. Prepare market expansion. Increase UA budget.

**ITERATE action:** Focus on the weakest metric:
- Low D1 retention → first-session experience is weak (tutorial, difficulty curve, first-merge moment)
- Low D7 retention → not enough reason to come back (add Daily Challenge emphasis, streaks, notifications)
- Low session duration → merging isn't satisfying enough (more visual/audio feedback, adjust difficulty)
- Low eCPM → ad placement or format issue (test different ad networks, adjust frequency)
- Allow 2–4 weeks of iteration before re-evaluating.

**KILL action:** The game isn't retaining or monetizing at viable levels despite iteration. Options:
- Publish a retrospective (LinkedIn content — your audience would value the transparency)
- Extract learnings for a V2 with a different mechanic
- The total loss is ~€800–1,600 + your time — painful but not catastrophic

---

## Gate 3: Scale Decision (Month 4+)

**When:** After 4–6 weeks in Phase 3 with expanded markets

| Metric | SCALE AGGRESSIVELY | MAINTAIN | SUNSET |
|--------|-------------------|----------|--------|
| Monthly revenue | > €3,000 | €500–3,000 | < €500 |
| Organic install share | > 30% | 10–30% | < 10% |
| D30 retention | > 8% | 4–8% | < 4% |
| LTV / CPI ratio | > 1.5× | 1.0–1.5× | < 1.0× |
| DAU trend | Growing | Flat | Declining |

**SCALE action:** Increase UA to €2–5K/month. Expand to US/UK. Hire freelance help for content (themes, events). Consider this a real business, not just a side project.

**MAINTAIN action:** Keep the app live with minimal effort. Fix bugs, respond to reviews, run occasional A/B tests. It's generating some income as a passive asset.

**SUNSET action:** Stop spending on UA. Leave the app live (it costs nothing to maintain on stores). Move on. Document everything for future projects.

---

## Decision Log Template

Keep a running log of decisions. Paste this into a spreadsheet or Notion page:

| Date | Gate | Metrics Summary | Decision | Rationale | Next Action |
|------|------|----------------|----------|-----------|-------------|
| YYYY-MM-DD | 0→1 | Session: Xm, Return: X%, Fun: X% | GO / ITERATE / KILL | Why | What specifically |

---

## Emotional Guardrails

Building a side project while working full-time is emotionally taxing. These guardrails are as important as the metrics:

1. **Time-box decisions.** Don't agonize. Look at the metrics, make the call, move on.
2. **Sunk cost is not a reason to continue.** The €1,000 you spent is gone regardless. Only future expected value matters.
3. **Killing a project is a success.** You validated quickly and cheaply. Most people never ship anything.
4. **Share the journey.** Win or lose, the story of building and testing a game is great LinkedIn content for your audience.
5. **Set a hard deadline.** If you haven't reached Gate 2→3 within 4 months of starting, evaluate whether to continue or redirect energy elsewhere.
