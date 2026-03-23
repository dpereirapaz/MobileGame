# Phase 3: Iterate & Scale

**Duration:** Ongoing (5–10 hours/week maintenance + periodic sprints)  
**Prerequisite:** Phase 2 soft launch metrics meet Go criteria  
**Goal:** Optimize retention and revenue, then expand to larger markets  

---

## 3A — Optimization Sprint (Weeks 1–4)

### A/B Testing Framework
- [ ] Implement a simple feature flag system (Firebase Remote Config, free tier)
- [ ] Define test variants for each experiment
- [ ] Run each test for minimum 7 days with 500+ users per variant

### Priority A/B Tests

| Test | Variant A (Control) | Variant B | Success Metric |
|------|-------------------|-----------|----------------|
| Ad frequency | Interstitial every 2 games | Every 3 games | D7 retention (keep if B improves retention without killing revenue) |
| Difficulty curve | Current piece distribution | Easier early game (more small pieces for first 10 turns) | D1 retention |
| Merge feedback | Current animations | Enhanced: screen shake + particle burst on chain ×3+ | Session duration, games per session |
| Rewarded ad value | Undo last move | Undo + "see best placement" hint | Rewarded ad engagement rate |
| Color palette | Current 6 colors | 5 colors (simpler, faster decisions) | Games per session |
| Daily Challenge sharing | Text-only share | Text + emoji grid (Wordle-style) | Share rate |

### Retention Improvements
- [ ] **Push notifications** (if opted in via `expo-notifications`):
  - Daily Challenge reminder at player's usual play time
  - "Your streak is X days!" when they miss a day
  - Never more than 1/day, easy opt-out
- [ ] **Win streak tracking** with visual rewards:
  - Streak counter on main screen
  - Small visual reward at milestones (5, 10, 25 games without losing)
  - Streak doesn't reset on Daily Challenge (only Zen/Sprint)
- [ ] **Progressive difficulty hints:**
  - After 3 consecutive losses, subtly improve piece generation for 2 games
  - Never reveal this to the player (Block Blast's "god mode" approach)
- [ ] **Onboarding refinement:**
  - Track tutorial completion rate
  - If < 80%, simplify or shorten the tutorial
  - Consider guided first game instead of static screens

### Monetization Optimization
- [ ] **Ad mediation:** If DAU > 5K, add Meta Audience Network as secondary demand alongside AdMob (increases eCPM through competition)
- [ ] **Rewarded video placement audit:** Test new rewarded ad moments:
  - "Double your score" at game over
  - "Preview next 3 pieces" during game
  - "Extra time" in Sprint mode (+30 seconds)
- [ ] **Cosmetic IAP (low priority):** If retention is strong and players engage deeply:
  - Tile color themes (€0.99–€1.99 each)
  - Board background themes
  - Bundle: all themes for €4.99

---

## 3B — Market Expansion (Week 4+)

### Expansion Decision

Only expand if soft launch market (Spain) shows:
- D7 retention > 15% consistently
- Positive unit economics: LTV > 1.5× CPI
- Stable or growing organic installs

### Expansion Roadmap

| Stage | Markets | Timing | UA Budget |
|-------|---------|--------|-----------|
| Wave 1 | France, Italy, Germany, Portugal | Week 4–5 | €500–1K/month |
| Wave 2 | UK, Netherlands, Nordics | Week 8+ | €1K–2K/month |
| Wave 3 | US, Canada, Australia | Week 12+ | €2K–5K/month |
| Wave 4 | LATAM (Brazil, Mexico), SE Asia | Week 16+ | Test budget |

### Localization
- [ ] **Wave 1 localization:**
  - Spanish (already your local market)
  - French, Italian, German (store listing only — game has minimal text)
  - Use Claude to translate store metadata
- [ ] **In-game text is minimal:** Score, "Game Over", mode names, tutorial — easy to localize
- [ ] **Cultural adaptation:** None needed — abstract puzzle game is culturally neutral

### Scaling UA
- [ ] **TikTok Ads:** Scale what worked in Spain to new markets
  - Localize caption text
  - Test new creatives: side-by-side "Block Blast vs GridFlow" comparisons
  - Target competitor audiences: Block Blast, 2048, Woodoku players
- [ ] **Apple Search Ads (ASA):** Bid on competitor keywords
  - "block blast", "merge puzzle", "2048", "tile game", "puzzle game free"
  - Start low ($0.30–0.50 CPT), optimize based on conversion
- [ ] **Organic growth levers:**
  - Daily Challenge sharing (Wordle effect): make share text compelling
  - TikTok organic: post satisfying merge compilations, tag #puzzlegame #mobilegame
  - Reddit community engagement: share dev journey updates in r/IndieGaming

---

## 3C — Feature Roadmap (Month 3+)

Only build these if retention and revenue justify continued investment.

### Priority 1 — If D30 Retention > 8%
- [ ] **Leaderboards:** Global and friends (via Game Center / Google Play Games)
- [ ] **Weekly tournaments:** 7-day competition, same conditions for all players
- [ ] **Statistics screen:** total games, best chain, tiles merged, favorite mode

### Priority 2 — If DAU > 10K
- [ ] **Seasonal events:** Themed boards (holiday colors, special tile shapes) with limited-time rewards
- [ ] **Social features:** Challenge a friend via share link
- [ ] **Widgets:** iOS/Android home screen widget showing Daily Challenge status

### Priority 3 — If Revenue > €5K/month
- [ ] **Subscription option:** "GridFlow+" at €2.99/month — no ads, exclusive themes, early access to new modes
- [ ] **New game modes:** Puzzle mode (pre-set boards with specific objectives), Multiplayer (real-time or async)
- [ ] **Second game:** Apply learnings to a new mechanic in the same genre

---

## Long-Term Success Metrics

| Metric | Target (Month 6) | Stretch (Month 12) |
|--------|------------------|-------------------|
| DAU | 10,000 | 50,000 |
| Monthly revenue | €3,000 | €15,000 |
| D30 retention | > 8% | > 12% |
| App Store rating | > 4.3 | > 4.5 |
| Organic install % | > 30% | > 50% |
| Markets live | 10+ countries | Global |

---

## Claude Code Session Guide

**Optimization sessions** (~2 hrs each):  
"Implement Firebase Remote Config for A/B testing with these feature flags [list]. Set up variant assignment and event tracking for each experiment."

"Add push notification support with expo-notifications. Send a Daily Challenge reminder at the user's usual play time and a streak reminder if they miss a day."

"Add a win streak system with visual milestones, and implement adaptive difficulty that subtly improves piece generation after 3 consecutive losses."

**Expansion sessions** (~1–2 hrs each):  
"Add i18n support using react-i18next with locale files for ES, FR, IT, DE. Localize all in-game strings and store metadata."

"Integrate Apple Search Ads attribution tracking and set up conversion events for UA campaign optimization."
