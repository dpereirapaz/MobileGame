# Monetization Strategy

## Philosophy

Follow the Block Blast model: **ads-first, player-friendly, no paywalls.**

The game is 100% free to play. No mechanic is gated behind payment. Ads are the primary revenue engine. IAP exists only as a convenience (remove ads) and cosmetic layer.

Players who never pay should have the full gameplay experience. Players who pay should feel good about it, not pressured.

---

## Revenue Streams

### 1. Interstitial Ads (~70% of revenue)

| Parameter | Value |
|-----------|-------|
| Format | Full-screen, skippable after 5s |
| Trigger | After game over, before "Play Again" loads |
| Frequency | Every 2nd game (skip every other game) |
| Frequency cap | Max 1 interstitial per 90 seconds |
| Expected eCPM | $5–15 (varies by geo, higher in US/UK/DE) |

**Rules:**
- NEVER interrupt gameplay
- NEVER show during a game session
- Always show between sessions (natural break point)
- Preload next ad immediately after showing one
- If ad fails to load, skip gracefully (no blank screen)

### 2. Rewarded Video Ads (~20% of revenue)

| Reward | Trigger | Value to Player |
|--------|---------|-----------------|
| Undo last move | Button appears after any placement | Corrects a mistake, saves a game |
| Revive | Game over screen, one-time offer | Clears bottom 2 rows, continues game |
| Perfect piece | During gameplay, optional button | Next piece is the ideal shape/color for current board |

| Parameter | Value |
|-----------|-------|
| Format | 15–30 second non-skippable video |
| Expected eCPM | $15–30 (high engagement, opt-in) |
| Limit | Undo: 2 per game. Revive: 1 per game. Perfect piece: 1 per game. |

**Rules:**
- Always player-initiated (never forced)
- Clear value proposition shown before ad plays
- Reward delivered immediately after ad completion
- If ad fails to load, grant reward anyway (goodwill > revenue on edge cases)

### 3. Remove Ads IAP (~5–10% of revenue)

| Product | Price | Effect |
|---------|-------|--------|
| Remove Ads | €4.99 (one-time) | Disables all interstitial and banner ads permanently |

**Rules:**
- Rewarded video ads remain available (they provide gameplay value)
- "Restore Purchases" button in Settings (Apple requirement)
- Small, non-intrusive purchase prompt after 10th game: "Enjoying GridFlow? Remove ads for €4.99"
- Never show the prompt more than once per week

### 4. Cosmetic Themes (Phase 3, stretch goal)

| Product | Price | Content |
|---------|-------|---------|
| Tile theme pack | €0.99–€1.99 | Alternative tile colors/styles (neon, pastel, earthy, monochrome) |
| Board background | €0.99 | Dark, light, wood, marble, gradient |
| All themes bundle | €4.99 | Everything in one purchase |

**Rules:**
- Zero gameplay impact
- Preview before purchase
- Low priority — only implement if retention warrants continued investment

---

## Revenue Projections

Conservative estimates based on industry benchmarks for puzzle games in Europe:

| DAU | Monthly Interstitial Rev | Monthly Rewarded Rev | Monthly IAP Rev | Total Monthly |
|-----|------------------------|---------------------|-----------------|---------------|
| 1,000 | €200–400 | €50–100 | €25–50 | **€275–550** |
| 5,000 | €1,000–2,000 | €250–500 | €125–250 | **€1,375–2,750** |
| 10,000 | €2,000–4,000 | €500–1,000 | €250–500 | **€2,750–5,500** |
| 50,000 | €10,000–20,000 | €2,500–5,000 | €1,250–2,500 | **€13,750–27,500** |

**Assumptions:**
- 2 interstitials per DAU per day, eCPM $8
- 15% of DAU watch at least 1 rewarded video per day, eCPM $20
- 2% of cumulative installs purchase Remove Ads (€4.99)
- 30% platform fee applied to IAP (Apple/Google cut)

---

## Ad Implementation Checklist

- [ ] Register AdMob account at admob.google.com
- [ ] Create iOS app entry + ad units (interstitial, rewarded, banner)
- [ ] Create Android app entry + ad units
- [ ] Use test ad IDs during development (mandatory — live ads in dev = policy violation)
- [ ] Implement ad preloading on app start
- [ ] Handle all error states (no fill, network error, timeout)
- [ ] Comply with GDPR: show consent dialog before first ad (use Google UMP SDK)
- [ ] Comply with Apple ATT: request tracking permission on first launch
- [ ] Test ad flow on physical devices before submission

## GDPR & Privacy

- [ ] Implement Google UMP (User Messaging Platform) consent dialog
- [ ] Respect user choice: if consent denied, show only non-personalized ads (lower eCPM but compliant)
- [ ] Privacy policy page: disclose data collection (analytics events, ad identifiers)
- [ ] No user accounts, no email collection, no personal data beyond anonymous analytics
- [ ] Host privacy policy on GitHub Pages or similar (link in app store listing + Settings screen)
