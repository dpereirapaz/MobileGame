# Phase 2: Monetization & Soft Launch

**Duration:** 2–3 weeks (10–15 hours/week)  
**Prerequisite:** Phase 1 MVP validated with testers  
**Goal:** Integrate ads, analytics, and submit to stores for soft launch in Spain  
**Output:** Live app generating revenue in a controlled test market

---

## Tasks

### 2.1 — AdMob Integration
- [ ] Install: `npm install react-native-google-mobile-ads`
- [ ] Set up AdMob account and create app entries (iOS + Android)
- [ ] Create ad units:
  - **Interstitial**: shown between games (after game over, before new game starts)
  - **Rewarded video**: opt-in for undo last move, revive (one per game), or "perfect piece" power-up
  - **Banner**: small banner on menu screen only (never during gameplay)
- [ ] Implement ad loading and display logic:
  ```
  Interstitial: preload on app start, show after every 2nd game, preload next immediately
  Rewarded: preload when reward option becomes relevant, show on user tap
  Banner: load on menu screen mount
  ```
- [ ] Ad frequency cap: max 1 interstitial per 90 seconds
- [ ] Handle ad load failures gracefully (no empty screens or crashes)
- [ ] Test with AdMob test IDs before going live

### 2.2 — In-App Purchase Setup
- [ ] Install: `npx expo install expo-in-app-purchases` (or `react-native-iap`)
- [ ] Configure single IAP product:
  - "Remove Ads" — €4.99 one-time purchase
  - Disable all interstitial and banner ads when purchased
  - Rewarded videos remain available (opt-in, player-initiated)
- [ ] Implement purchase flow: button in settings, confirmation, receipt validation
- [ ] Restore purchases functionality (required by Apple)
- [ ] Test with sandbox accounts (Apple + Google)

### 2.3 — Firebase Analytics
- [ ] Install: `npx expo install expo-firebase-analytics` (or `@react-native-firebase/analytics`)
- [ ] Configure Firebase project with iOS + Android apps
- [ ] Track these events:

| Event | Parameters | Purpose |
|-------|-----------|---------|
| `game_start` | mode (zen/daily/sprint) | Session tracking |
| `game_end` | score, highest_tier, duration_seconds, merges_count | Core loop health |
| `piece_placed` | piece_shape, grid_fill_percentage | Difficulty curve data |
| `merge_triggered` | tier, chain_length | Mechanic engagement |
| `ad_shown` | type (interstitial/rewarded/banner) | Monetization tracking |
| `ad_reward_claimed` | reward_type (undo/revive/piece) | Rewarded ad value |
| `iap_purchase` | product_id | Revenue tracking |
| `tutorial_completed` | — | Onboarding funnel |
| `share_daily` | score | Virality tracking |

- [ ] Set up user properties: `install_date`, `total_games`, `preferred_mode`
- [ ] Configure Firebase dashboard with key funnels:
  - Install → First game → Second game → D1 return → D7 return
  - Game start → Ad shown → Ad completed (for rewarded)

### 2.4 — App Store Optimization (ASO)
- [ ] **App name:** "GridFlow: Merge Puzzle" (keyword-rich)
- [ ] **Subtitle/short desc:** "Place, Match & Merge Tiles"
- [ ] **Keywords (iOS):** puzzle,merge,block,tile,brain,grid,casual,tetris,2048,relax
- [ ] **Description:** Write compelling store description (first 3 lines matter most):
  ```
  Love Block Blast? Try the next evolution of tile puzzles.
  Place pieces on the grid. Match colors. Merge tiles to reach 
  higher tiers. How high can you go?
  
  ✦ Simple to learn, endlessly deep
  ✦ Daily Challenge — same board for everyone, share your score
  ✦ Sprint Mode — race the clock for 3 intense minutes
  ✦ No internet required — play anywhere, anytime
  ✦ Beautiful, minimal design that's easy on the eyes
  ```
- [ ] **Screenshots:** 5–6 screenshots showing:
  1. Gameplay mid-action (colorful board with merge happening)
  2. High-tier merge moment with "Chain ×3!" callout
  3. Daily Challenge with shareable score
  4. Sprint mode with timer
  5. Game modes selection screen
- [ ] **App icon:** Final version, clean and recognizable
- [ ] **Category:** Games > Puzzle (primary), Games > Board (secondary)
- [ ] **Age rating:** 4+ (no objectionable content)
- [ ] **Privacy policy:** Create a simple privacy policy page (can use a generator; host on GitHub Pages)

### 2.5 — Soft Launch Configuration
- [ ] **Territory:** Spain only (iOS) / Spain, Portugal (Android — Google allows less granular)
- [ ] **Language:** English first (Spanish localization in Phase 3 if metrics warrant)
- [ ] **Pricing:** Free with ads
- [ ] Submit to App Store Review (allow 24–72 hours)
- [ ] Submit to Google Play Review (usually faster, 1–24 hours)
- [ ] Set up Crashlytics (via Firebase) for crash reporting

### 2.6 — Initial User Acquisition
- [ ] **Organic push (€0):**
  - LinkedIn post about the game launch (your network sees it)
  - WhatsApp/Telegram to personal contacts
  - Reddit: r/iOSGaming, r/AndroidGaming, r/IndieGaming, r/puzzlegames
  - Post in Barcelona expat/tech groups
- [ ] **Paid UA test (€200–500):**
  - TikTok Ads: 15-second screen recording showing a satisfying merge chain
  - Instagram Reels: similar creative, targeting Spain, women 25–45, interests: puzzle games, Candy Crush, casual games
  - Budget: €10–20/day for 2 weeks
  - Goal: 200–500 installs to generate meaningful analytics data
- [ ] **Creative format:** UGC-style (phone screen recording, no voiceover, captions like "This merge was SO satisfying 🤯")

### 2.7 — Monitoring Dashboard
- [ ] Set up a simple daily monitoring routine (Firebase dashboard + spreadsheet):

| Metric | Check Frequency | Target |
|--------|----------------|--------|
| Daily installs | Daily | Growing or stable |
| DAU | Daily | Tracking trend |
| D1 retention | After day 2 | > 35% |
| D7 retention | After day 8 | > 15% |
| Avg session duration | Weekly | > 4 minutes |
| Games per session | Weekly | > 2.5 |
| eCPM (interstitial) | Weekly | > $5 |
| eCPM (rewarded) | Weekly | > $15 |
| Crash rate | Daily | < 1% |
| Ad completion rate (rewarded) | Weekly | > 70% |

---

## Decision Gate (After 2–3 Weeks of Soft Launch)

| Metric | Go to Phase 3 | Iterate | Kill / Major Pivot |
|--------|--------------|---------|-------------------|
| D1 retention | > 35% | 25–35% | < 25% |
| D7 retention | > 15% | 8–15% | < 8% |
| Session duration | > 4 min | 2–4 min | < 2 min |
| eCPM | > $5 | $3–5 | < $3 |
| Crash rate | < 1% | 1–3% | > 3% |
| Qualitative (reviews) | Positive | Mixed | Negative |

**If "Iterate":** Identify the weakest metric and address it specifically (e.g., low retention → adjust difficulty curve; low eCPM → test ad placements; low session length → add more "juice" to merges).

---

## Claude Code Session Guide

**Session 1** (~3 hrs): Task 2.1  
"Integrate react-native-google-mobile-ads with interstitial ads between games, rewarded video for undo/revive, and banner on menu. Include frequency cap and preloading logic."

**Session 2** (~2 hrs): Task 2.2  
"Add a 'Remove Ads' one-time IAP at €4.99 using expo-in-app-purchases. Include purchase flow, receipt validation, restore purchases, and conditional ad display."

**Session 3** (~2 hrs): Task 2.3  
"Set up Firebase Analytics with these custom events [paste event table]. Configure user properties and build a funnel tracking install → first game → D1 return."

**Session 4** (~2 hrs): Tasks 2.4 + 2.5  
"Prepare app store submission: finalize metadata, generate screenshot frames, configure for Spain-only soft launch, submit to both stores."

**Session 5** (~1 hr): Task 2.6  
"Create TikTok/Instagram ad creatives — record satisfying gameplay clips, add captions, prepare ad campaign structure targeting Spain women 25–45."
