---
id: PER-01
type: Persona
priority: Primary
role: Young Office Worker
department: Personal Health
status: Active
last_updated: 2025-12-11
related_jtbd_ids:
  - JTBD-001
research_sources:
  - user-insights.md
  - RSYN251211-vietnam-calorie-tracker.md
  - strategic-insights.md
---

# Persona: Linh Nguyen

> "As a busy professional, I want to see my weekly calorie trends at a glance, so that I can adjust my weekend eating without obsessive daily checking." — Young Professional segment, user-insights.md

## 1. Profile

**Bio:** Linh is a 27-year-old marketing coordinator at a mid-sized tech company in Ho Chi Minh City. She works long hours, often eating lunch at her desk or grabbing phở with colleagues after work. She wants to be healthier but doesn't have time for complicated tracking systems. She tried MyFitnessPal once but gave up after a week because it was too slow and didn't have Vietnamese foods.

| Attribute | Detail | Evidence |
| :-------- | :----- | :------- |
| **Role** | Young office worker, 25-32 years old | user-insights.md (Young Professional segment) |
| **Experience Level** | Beginner to calorie tracking, tried and abandoned other apps | strategic-insights.md ("Most apps overload new users") |
| **Team Context** | Works with colleagues, eats socially at lunch/dinner | user-insights.md ("lunch break with colleagues") |
| **Primary Device(s)** | Mobile (smartphone) | user-insights.md ("Access the app seamlessly on mobile devices") |
| **Environment** | Office, restaurants, street vendors, late-night eateries; often spotty internet | user-insights.md ("work offline and sync when connected", "late-night phở") |

## 2. Goals

| Goal | Evidence |
| :--- | :------- |
| Log entire meals with one tap at regular restaurants | user-insights.md (Young Professional story) |
| See weekly calorie trends at a glance without obsessive daily checking | user-insights.md (Young Professional story) |
| Set daily calorie target based on height and weight | user-insights.md (Young Professional story) |
| Track meals in under 30 seconds | user-insights.md ("under 30 seconds per meal"), RSYN251211 |

## 3. Pain Points & Frustrations

| Pain Point | Evidence |
| :--------- | :------- |
| Foreign apps have 10-12s load times (MyFitnessPal) | strategic-insights.md (Vulnerability 1) |
| Foreign portion sizes don't match Vietnamese reality (cups vs bát cơm) | strategic-insights.md (Vulnerability 2), competitor-overview.md |
| Current apps interrupt social meals with complicated logging | user-insights.md ("tracking doesn't interrupt my lunch break") |
| Internet connectivity issues prevent logging late at night | user-insights.md ("work offline and sync when connected") |

## 4. Behaviours (Observed)

| Behaviour | Evidence |
| :-------- | :------- |
| Eats at regular restaurants repeatedly (habitual patterns) | user-insights.md ("eating at regular restaurants") |
| Works late hours, eats late-night meals | user-insights.md ("working late hours", "late-night phở") |
| Prefers weekly review over daily obsession | user-insights.md ("without obsessive daily checking") |
| Abandoned previous tracking apps due to friction | strategic-insights.md ("Most apps overload new users") |

## 5. Motivations

| Motivation | Evidence |
| :--------- | :------- |
| Wants clear benchmark for success (goal-oriented) | user-insights.md ("clear benchmark for success") |
| Desires sustainable awareness without restrictive dieting | user-insights.md ("awareness rather than punishment") |
| Values efficiency - doesn't want tracking to interrupt life | user-insights.md ("tracking doesn't interrupt my lunch break") |

## 6. Accessibility Needs

| Need | Detail | Evidence |
| :--- | :----- | :------- |
| None identified in research | No accessibility-specific research conducted | Recommend inclusive testing |

## 7. Technical Context (For Dev & QA)

| Constraint | Detail | Evidence |
| :--------- | :----- | :------- |
| **Screen Resolution** | Mobile-first, portrait orientation | user-insights.md ("seamlessly on mobile devices") |
| **Connectivity** | Spotty internet, needs offline capability | user-insights.md ("work offline and sync when connected") |
| **Input Method** | Touch, one-handed use while eating | user-insights.md ("one tap") |

## 8. Behavioural Traits (For AI Context)

| Trait | Detail | Evidence |
| :---- | :----- | :------- |
| **Decision Making Style** | Fast scanner, wants quick actions | user-insights.md ("one tap", "at a glance") |
| **Tolerance for Errors/Delays** | Low - abandoned slow apps | strategic-insights.md (MyFitnessPal 10-12s = abandonment) |
| **Frequency of Use** | Daily logging, weekly review | user-insights.md ("daily intake", "weekly calorie trends") |
| **Cognitive Load Preference** | Minimal UI, progressive disclosure | strategic-insights.md ("friction low") |

## 9. User Story Mapping

* **Related Epics:** `EPIC-001` (Core Logging), `EPIC-002` (Vietnamese Food Database)
* **Common User Scenarios:**
  - Logging lunch at desk between meetings using one-tap for a regular restaurant meal
  - Reviewing weekly trends on Sunday to plan healthier weekday choices
  - Logging late-night phở offline and syncing the next morning

## 10. Confidence & Gaps

**Confidence:** Moderate (Based on 3 sources, consistent patterns on speed/friction needs)

**Research Sources:**
- User stories document (1) - Undated
- Research synthesis (1) - 2025-12-11
- Strategic insights (1) - Undated

**Assumptions (require validation):**
- [ ] Weekly review cadence is preferred over daily (no quantitative data)
- [ ] One-tap logging for "regular restaurants" means saved meal presets
- [ ] Offline usage is common enough to prioritize

**Known Gaps:**
- No direct interview transcripts with this segment
- No data on specific device models or OS preferences
- No data on income level or willingness to pay for premium

**Recommended Validation:**

| Assumption | Method | Phase |
|------------|--------|-------|
| Weekly review preference | User interviews, analytics on feature usage | Phase 1 |
| Offline usage frequency | Analytics tracking, user surveys | Phase 1 |
| Premium conversion likelihood | Pricing surveys, A/B tests | Phase 3 |
