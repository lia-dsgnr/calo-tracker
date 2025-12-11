# Calorie-Tracking Web App for Urban Vietnamese Youth (18-25)

## Problem

Vietnamese youth want to eat healthier but:
- Western apps lack VN food data.
- Logging is slow and too scientific.
- Portions & names don’t match local eating culture.

## Solution

A Vietnamese-first, mobile-first calorie tracker that:
- Logs meals in <30 seconds,
- Supports street food & daily dishes,
- Encourages healthy awareness, not dieting,
- Fits the lifestyle of busy, on-the-go youth.

## Business Goals

- Grow to 10,000 active users in 6 months, primarily through organic social reach and word-of-mouth in major cities (HCMC & Hanoi).
- Reach 40% weekly retention by month 3, proving strong habit formation.
- Build strong brand recognition as the preferred health/calorie-tracking tool for Vietnamese youth, setting up future monetization (premium features, fitness partnerships).
- Create a Vietnamese food database of 2,000+ dishes within 3 months, leveraging both user-generated inputs and manual curation.
- Maintain high engagement with 5+ food-logging sessions per user per week.

## User Goals

- Track calories in <30 seconds per meal using a database of familiar Vietnamese dishes and portion sizes.
- Understand nutritional values of everyday foods (phở, bánh mì, cơm tấm, etc.) to guide healthier decisions.
- View simple, motivating progress dashboards (streaks, trends, achievements).
- Build sustainable, non-restrictive eating habits, focusing on awareness rather than dieting pressure.
- Use the app quickly and conveniently on mobile anywhere—street food, restaurants, or at home—without complexity.

## Target Users (18–25 Urban Vietnamese Youth)

**Primary audience:** 

- Gen Z living in HCMC & Hanoi, who eat mixed diets (street food, cơm văn phòng, fast food), want healthier habits but don’t want complexity.

**Key Segments:**

- Linh – Gym Rookie (20–22)
  - Wants fat loss, hates complex macro tracking, needs fast logging.

- My – Eat-Clean Student (24)
  - Wants accuracy, trusted data, Vietnamese portions.

- Trang – Busy Intern (22)
  - Eats out a lot, will drop off if logging takes >30 seconds.

- Casual Health Explorers
  - Curious, not strict; want learning without commitment.

## Change Requests

| # | Name | Request/Trigger | Type | Description | Dependencies / Conflicts |
|---|--------|-----------------|------|-------------|--------------------------|
| **1** | Account Management | We need users to create accounts so we can save their data and personalize the experience. | New Feature | Login, registration, profile setup; design auth screens, onboarding flow, profile settings, account states (logged out, logged in, session expired) | Baseline feature; all future changes require user context |
| **2** | Food Search, Manual Text Entry, Favorites List | Users need a way to log their meals — let them search our food database, type manually, and save favorites for quick access. | New Feature | Search UI with filters, manual calorie input form, save/manage favorites; design search results, empty states, recent items, favorites management | Builds on #1 (user-specific data); core logging flow before AI features |
| **3** | AI-Powered Food Scan | Typing is tedious. Can we let users just take a photo of their food and auto-detect calories? | New Feature | Camera scan UI to detect food and estimate calories; design capture screen, loading states, results display | Builds on #1, #2; alternative entry method to manual logging |
| **4** | Improve Portion Estimation UX | User research shows 40% don't trust the AI portions. They want to adjust but it's too hard. | Research + Enhancement | Research shows users distrust AI estimates; add manual adjustment controls, confidence indicators, edit flows | Builds on #3; may affect #2 (consistency of edit patterns) |
| **5** | Multi-User Support (Family/Couple Mode) | Couples and families want to share one subscription but track individually. Can we support multiple profiles? | New Feature | Profile switcher, shared vs individual meals, household dashboard; define user personas and navigation patterns | All screens must now handle user context |
| **6** | Stakeholder Pivot: De-emphasize AI Scan | Too many complaints about wrong detections. Stakeholder wants to make manual entry primary and move AI Scan to secondary. | Conflict | Move AI Scan to secondary action; redesign home screen hierarchy to promote manual entry | **Contradicts #3**; revisit IA, home screen, #2 prominence |
| **7** | Design System Standardization | We've shipped 6 features and nothing looks consistent. We need to clean this up before adding more. | Design System | Audit and unify components, tokens, spacing, interaction patterns across all features | Retroactive review of #1-6 |
| **8** | Social Challenges & Leaderboards | Users say they lose motivation alone. Can we add social features — challenges with friends, leaderboards? | New Feature | Challenge cards, progress visualizations, friend lists, notification patterns | Builds on #1 + #5; new component patterns needed |
| **9** | Premium Tier: Meal Planner, Payment/Subscription | We need to monetize. Let's gate some features behind a paid plan — which ones should be free vs premium? | Business Change | Free vs paid experience mapping; define gated features (AI Scan, Meal Planner, Social Challenges); design upgrade prompts, pricing UI, locked states with feature teasers, paywall patterns; Meal Planner screens: weekly meal calendar, suggested meals based on goals, grocery list generation | Affects #1, #3, #5, #8; new paywall patterns |
| **10** | B2B Pivot: Corporate Wellness | Sales team landed a corporate pilot. HR wants an admin dashboard to track employee wellness across teams. | Strategic Pivot | Admin dashboard for HR, team views vs individual views, onboarding for enterprise users | **Challenges all individual-user assumptions** |