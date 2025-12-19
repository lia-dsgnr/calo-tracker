---
id: PER-02
type: Persona
priority: Secondary
role: University Student
department: Personal Health
status: Active
last_updated: 2025-12-11
related_jtbd_ids:
  - JTBD-002
research_sources:
  - user-insights.md
  - RSYN251211-vietnam-calorie-tracker.md
  - strategic-insights.md
---

# Persona: Minh Tran

> "As a first-time calorie tracker, I want a simple onboarding that explains how the app works in under 2 minutes, so that I'm not overwhelmed by complicated nutrition science." — Health-Conscious Student segment, user-insights.md

## 1. Profile

**Bio:** Minh is a 21-year-old university student in Hanoi studying business administration. He recently noticed he's gained weight since starting university and wants to be more mindful of what he eats. He grabs bánh mì between classes and eats at the campus cafeteria daily. He's never tracked calories before and is intimidated by nutrition apps that feel too scientific. He needs something free, fast, and simple.

| Attribute | Detail | Evidence |
| :-------- | :----- | :------- |
| **Role** | University student, 18-24 years old, first-time calorie tracker | user-insights.md (Health-Conscious Student segment) |
| **Experience Level** | Beginner - no prior calorie tracking experience | user-insights.md ("first-time calorie tracker") |
| **Team Context** | Studies alone but eats socially at cafeteria with classmates | user-insights.md ("common cafeteria meals") |
| **Primary Device(s)** | Mobile (smartphone), likely mid-range Android | user-insights.md ("seamlessly on mobile devices") |
| **Environment** | University campus, cafeteria, street vendors between classes; always rushed | user-insights.md ("between classes", "busy") |

## 2. Goals

| Goal | Evidence |
| :--- | :------- |
| Quickly log bánh mì breakfast between classes | user-insights.md (Health-Conscious Student story) |
| See calorie content of common cafeteria meals without research | user-insights.md (Health-Conscious Student story) |
| Complete onboarding in under 2 minutes | user-insights.md (Health-Conscious Student story) |
| Use core features for free (budget constraint) | user-insights.md (Health-Conscious Student story) |

## 3. Pain Points & Frustrations

| Pain Point | Evidence |
| :--------- | :------- |
| Overwhelmed by complicated nutrition science in other apps | user-insights.md ("not overwhelmed by complicated nutrition science") |
| Doesn't have time for lengthy logging between classes | user-insights.md ("between classes", "busy") |
| Can't afford premium app subscriptions on student budget | user-insights.md ("student on a budget", "healthy eating doesn't require financial investment") |
| Doesn't know calorie content of Vietnamese cafeteria food | user-insights.md ("make informed choices without researching every dish") |

## 4. Behaviours (Observed)

| Behaviour | Evidence |
| :-------- | :------- |
| Eats on the go between classes | user-insights.md ("between classes") |
| Relies on cafeteria and street food (bánh mì, campus meals) | user-insights.md ("bánh mì breakfast", "cafeteria meals") |
| Watches weight but lacks knowledge about nutrition | user-insights.md ("watching my weight", "make informed choices") |
| Abandons complex apps quickly | strategic-insights.md ("Most apps overload new users") |

## 5. Motivations

| Motivation | Evidence |
| :--------- | :------- |
| Wants to make informed choices about eating | user-insights.md ("make informed choices") |
| Desires awareness without complicated science | user-insights.md ("not overwhelmed by complicated nutrition science") |
| Values simplicity and speed over depth | user-insights.md ("quickly log", "under 2 minutes") |

## 6. Accessibility Needs

| Need | Detail | Evidence |
| :--- | :----- | :------- |
| None identified in research | No accessibility-specific research conducted | Recommend inclusive testing |

## 7. Technical Context (For Dev & QA)

| Constraint | Detail | Evidence |
| :--------- | :----- | :------- |
| **Screen Resolution** | Mobile-first, likely mid-range device | user-insights.md ("seamlessly on mobile devices") |
| **Connectivity** | Campus WiFi, may be unreliable in outdoor areas | Inferred from university context |
| **Input Method** | Touch, quick one-handed use while walking | user-insights.md ("quickly log", "between classes") |

## 8. Behavioural Traits (For AI Context)

| Trait | Detail | Evidence |
| :---- | :----- | :------- |
| **Decision Making Style** | Needs guidance, wants suggestions not choices | user-insights.md ("make informed choices without researching") |
| **Tolerance for Errors/Delays** | Medium - will abandon if onboarding is slow | user-insights.md ("under 2 minutes") |
| **Frequency of Use** | Daily, meal-by-meal logging | user-insights.md ("daily intake") |
| **Cognitive Load Preference** | Minimal - avoid nutrition science jargon | user-insights.md ("not overwhelmed by complicated nutrition science") |

## 9. User Story Mapping

* **Related Epics:** `EPIC-001` (Core Logging), `EPIC-003` (Onboarding)
* **Common User Scenarios:**
  - Logging bánh mì from a street vendor while walking to class
  - Looking up calories for cafeteria cơm tấm before deciding to eat it
  - Completing onboarding during a 5-minute break between lectures

## 10. Confidence & Gaps

**Confidence:** Moderate (Based on 3 sources, consistent patterns on simplicity and budget needs)

**Research Sources:**
- User stories document (1) - Undated
- Research synthesis (1) - 2025-12-11
- Strategic insights (1) - Undated

**Assumptions (require validation):**
- [ ] Students will adopt calorie tracking if it's free and simple enough
- [ ] 2-minute onboarding threshold is accurate
- [ ] Mid-range Android devices are primary (no device data)

**Known Gaps:**
- No direct interview transcripts with students
- No data on specific university contexts or eating patterns
- No data on social influence (do friends use calorie apps?)
- No data on retention - do students stick with it after initial curiosity?

**Recommended Validation:**

| Assumption | Method | Phase |
|------------|--------|-------|
| 2-minute onboarding tolerance | A/B test onboarding lengths, measure completion | Phase 1 |
| Free tier conversion to active users | Cohort analysis, activation metrics | Phase 1 |
| Device distribution | Analytics tracking | Phase 1 |
