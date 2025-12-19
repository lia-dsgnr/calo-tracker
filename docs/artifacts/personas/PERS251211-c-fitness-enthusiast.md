---
id: PER-03
type: Persona
priority: Tertiary
role: Fitness Enthusiast
department: Personal Health
status: Active
last_updated: 2025-12-11
related_jtbd_ids:
  - JTBD-003
research_sources:
  - user-insights.md
  - RSYN251211-vietnam-calorie-tracker.md
  - strategic-insights.md
---

# Persona: Khoa Pham

> "As someone who's tried multiple diet apps, I want Vietnamese portion sizes that match real-world servings, so that I'm not constantly converting Western measurements." — Fitness Enthusiast segment, user-insights.md

## 1. Profile

**Bio:** Khoa is a 29-year-old fitness enthusiast who works out 4-5 times per week at a gym in District 1, Ho Chi Minh City. He meal preps on Sundays and is serious about hitting his macro targets to support muscle growth. He's frustrated that international apps like MyFitnessPal don't understand Vietnamese food - he's tired of guessing whether his bún bò Huế is 400 or 600 calories. He wants precision without the hassle of manual calculations.

| Attribute | Detail | Evidence |
| :-------- | :----- | :------- |
| **Role** | Fitness-focused adult, works out regularly, experienced with nutrition tracking | user-insights.md (Fitness Enthusiast segment) |
| **Experience Level** | Experienced - has tried multiple diet apps, understands macros | user-insights.md ("tried multiple diet apps", "macronutrient breakdowns") |
| **Team Context** | Solo fitness journey, may follow fitness influencers | Inferred from "detail-oriented person" |
| **Primary Device(s)** | Mobile (smartphone), may use fitness wearables | user-insights.md ("seamlessly on mobile devices") |
| **Environment** | Gym, home kitchen (meal prep), occasional restaurants | user-insights.md ("meal-prep recipes", "homemade dishes") |

## 2. Goals

| Goal | Evidence |
| :--- | :------- |
| Adjust daily calorie goals based on activity level | user-insights.md (Fitness Enthusiast story) |
| See macronutrient breakdowns (protein, carbs, fat) for Vietnamese foods | user-insights.md (Fitness Enthusiast story) |
| Create custom food entries for meal-prep recipes | user-insights.md (Fitness Enthusiast story) |
| Get Vietnamese portion sizes that match real-world servings | user-insights.md (Fitness Enthusiast story) |

## 3. Pain Points & Frustrations

| Pain Point | Evidence |
| :--------- | :------- |
| Constantly converting Western measurements to Vietnamese portions | user-insights.md ("constantly converting Western measurements") |
| International apps don't have accurate Vietnamese food data | strategic-insights.md (Vulnerability 2), competitor-overview.md |
| Can't accurately track homemade Vietnamese dishes | user-insights.md ("track homemade dishes accurately") |
| Activity-based calorie adjustment not intuitive in current apps | user-insights.md ("adjust my daily calorie goals based on activity level") |

## 4. Behaviours (Observed)

| Behaviour | Evidence |
| :-------- | :------- |
| Works out regularly, needs nutrition to support training | user-insights.md ("works out regularly", "supports my training") |
| Meal preps homemade dishes | user-insights.md ("meal-prep recipes") |
| Detail-oriented, wants precision in tracking | user-insights.md ("detail-oriented person") |
| Has tried and abandoned multiple international diet apps | user-insights.md ("tried multiple diet apps") |

## 5. Motivations

| Motivation | Evidence |
| :--------- | :------- |
| Nutrition supports training goals (muscle, performance) | user-insights.md ("nutrition supports my training without under-eating") |
| Wants balanced nutrition beyond just calories | user-insights.md ("balanced nutrition beyond just calories") |
| Values accuracy and precision over simplicity | user-insights.md ("detail-oriented", "track homemade dishes accurately") |

## 6. Accessibility Needs

| Need | Detail | Evidence |
| :--- | :----- | :------- |
| None identified in research | No accessibility-specific research conducted | Recommend inclusive testing |

## 7. Technical Context (For Dev & QA)

| Constraint | Detail | Evidence |
| :--------- | :----- | :------- |
| **Screen Resolution** | Mobile-first, may use tablet for meal planning | user-insights.md ("seamlessly on mobile devices") |
| **Connectivity** | Generally good (urban gym, home WiFi) | Inferred from urban fitness context |
| **Input Method** | Touch, willing to spend time for accuracy | user-insights.md ("detail-oriented") |

## 8. Behavioural Traits (For AI Context)

| Trait | Detail | Evidence |
| :---- | :----- | :------- |
| **Decision Making Style** | Detail-oriented, wants full information | user-insights.md ("detail-oriented person") |
| **Tolerance for Errors/Delays** | Low for data accuracy, medium for speed | user-insights.md ("accurately", "real-world servings") |
| **Frequency of Use** | Multiple times daily (every meal + snacks) | user-insights.md ("daily calorie goals", "nutrition supports my training") |
| **Cognitive Load Preference** | Full detail - wants macros, not just calories | user-insights.md ("macronutrient breakdowns") |

## 9. User Story Mapping

* **Related Epics:** `EPIC-002` (Vietnamese Food Database), `EPIC-004` (Custom Foods & Recipes)
* **Common User Scenarios:**
  - Creating a custom entry for his Sunday meal-prep chicken cơm tấm recipe
  - Adjusting calorie target higher on gym days, lower on rest days
  - Looking up exact macros for bún bò Huế with Vietnamese portion sizes

## 10. Confidence & Gaps

**Confidence:** Moderate (Based on 3 sources, consistent patterns on precision and Vietnamese localization needs)

**Research Sources:**
- User stories document (1) - Undated
- Research synthesis (1) - 2025-12-11
- Strategic insights (1) - Undated

**Assumptions (require validation):**
- [ ] Fitness enthusiasts will pay premium for macro tracking features
- [ ] Custom recipe creation is a high-value feature worth development investment
- [ ] This segment is large enough in Vietnam to prioritize

**Known Gaps:**
- No data on Vietnamese fitness culture or gym membership rates
- No data on overlap with wearable device usage
- No data on preferred fitness tracking integrations (Strava, Apple Health, etc.)
- No interview data on what "accurate" means to this segment

**Recommended Validation:**

| Assumption | Method | Phase |
|------------|--------|-------|
| Premium conversion for macro features | Feature usage analytics, pricing surveys | Phase 2 |
| Custom recipe feature demand | Feature request tracking, beta testing | Phase 2 |
| Segment size in Vietnam | Market research, competitor analysis | Phase 1 |
