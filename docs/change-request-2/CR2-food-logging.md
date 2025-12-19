# Change Request #2: Food Logging

* Scope: `SCOP251211-food-search-favorites.md`

* Analysis: `CR2-FoodLogging.md`

## 1. Context & Problem

* **User goal:** Quickly find and log meals from food database

* **Context of use:** Busy, distracted environments (office staff, interns, housewives)

* **Constraints:** Time pressure, distractions, need for accuracy

* **Problem statement:** Users drop off early because logging feels effortful (scrolling long lists)

## 2. Problem Framings
**Goal:** Make sure you’re solving the right thing.

* **Recognition vs Recall:** Users must recall food names instead of recognizing familiar options

* **Attention Fragmentation:** Multi-step search flow demands too much focus

* **Data Overload:** Database shows thousands of items, but users need ~20–30 personal foods

* **Timing Mismatch:** Logging required at inconvenient moments

* **Effort-to-Value Perception:** High effort now, distant reward later

* **-->Selected Framing:** Recognition vs. Recall Problem

## 3. Assumptions & Risks

* **User behavior:** Repetitive meals, recognition faster than typing, memory accuracy

* **Context:** Meals logged near mealtime, predictable routines, identifiable restaurant/home meals

* **Constraints:** Database consistency, ability to surface frequent items, privacy comfort

* **Highest-risk assumptions:**

  * Users eat repetitively

  * Same item = truly same

  * Logging happens near mealtime

  * Database consistency

* **Assumption Map:** [Assumption Map](all-artifacts.html#bubble-chart)

* **Suggested validation:** Quick user interviews or survey asking "How many different meals did you eat this week?" and "Do you eat the same lunch regularly?" to test the repetition assumption before building.

## 4. Hypothesis

```
If we prioritize Favorites as the primary logging method (with Search as secondary),
then logging completion rate will increase by 20%+,
for young professionals ([Linh persona](../../docs/personas/PERS251211-a-young-professional.md)),
because they eat repeat meals and want one-tap logging, not searching.
```

## 5. Solution Approaches (6 options)

1. **Smart Favorites Grid** – One‑tap logging of top foods (speed).

2. **Contextual Suggestions** – Predict meals based on time/location (effort).

3. **Personal Food Library** – User‑curated collection (control).

4. **Visual Meal Timeline** – Scrollable history with photos (clarity).

5. **Search with Personal Boost** – Personalized ranking in search results (trust).

6. **Meal Templates & Combos** – Save multi‑item meals (accuracy).

| Approach | Speed | Effort | Control | Clarity | Trust | Setup Required |
|----------|-------|--------|---------|---------|-------|----------------|
| Smart Favorites Grid | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★☆☆ | ★★★☆☆ | None |
| Contextual Suggestions | ★★★★☆ | ★★★★★ | ★☆☆☆☆ | ★★★☆☆ | ★★☆☆☆ | Time (learning) |
| Personal Food Library | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★★ | High |
| Visual Meal Timeline | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ | None |
| Search with Personal Boost | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ | None |
| Meal Templates | ★★★★☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★★ | Medium |

**Artifact:** [Persona → Solution Fit Map](all-artifacts.html#persona-fit)

---
#### Cross-Domain Inspiration:

| Approach | Domain Inspiration | Key Pattern |
|----------|-------------------|-------------|
| Smart Favorites Grid | Music Streaming (Spotify) | "Recently played" as default home state |
| Contextual Suggestions | Smart Home (Nest/HomeKit) | Predictive automation from context signals |
| Personal Food Library | Password Managers (1Password) | User-curated vault with full control |
| Visual Meal Timeline | Photo Management (Google Photos) | Time-based visual browsing |
| Search with Personal Boost | E-commerce (Amazon) | Purchase history shapes search ranking |
| Meal Templates & Combos | Developer Tools (VS Code) | Snippets/macros for repetitive sequences |

* **How other domains solve it/What to steal:** [Cross-Industry Patterns](all-artifacts.html#cross-industry)

  ---

#### Trade-off Comparison

| Approach | Trade-off | Best for |
|----------|-----------|----------|
| Favorites Grid | Fastest, but limited slots | Routine eaters |
| Contextual Suggestions | Zero effort, but predictions may miss | Office workers |
| Personal Library | Full control, but setup burden | Health-conscious trackers |
| Timeline | Intuitive browsing, but scroll fatigue | Visual thinkers |
| Boosted Search | Trusted results, but still requires typing | Search-comfortable users |
| Templates | Multi-item accuracy, but setup overhead | Home cooks |


## 6. Solution Scope


This PR focuses on **three complementary approaches**:

1. **Smart Favorites Grid** (Speed)

2. **Search with Personal Boost** (Trust & Scale)

3. **Visual Meal Timeline** (Clarity & Context)


## 7. In Scope (UX/Interaction Changes)

### User flow

* **Artifact:** [User Flow Diagram](user-flow.md)

### What's new

**Favorites System Redesign**

- Transformed favorites from a simple list to a responsive grid layout (2-3 columns)
- New card design with emoji, food name, calories, usage count, and quick-remove heart icon
- Collapsible grid showing first 9 items with "Show all/less" toggle
- Suggestions Grid:
    - Redesigned to match the favorites grid layout
    - Added ability to hide individual suggestions (persisted)
    - Visual feedback for favorited items

**Inline Food Search**

- Added search bar directly in the Quick Add header with auto-focus
- Results grouped into Favorites, Recently Logged, and All Foods sections
- Each result shows emoji, name with match highlighting, source label, and heart toggle

**Timeline Tabs**

- Replaced long scrolling history with tabbed navigation (Today, Yesterday, weekday names, Older)
- Simplified timeline cards focused on quick scanning and "Log again" action

* **Artifact:** [Solution Space Landscape](all-artifacts.html#solution-landscape)
  
***

## 8. Out of Scope

**Templates Hidden**

- Temporarily disabled half-implemented templates feature (code preserved for later)

***

## 9. Success Metrics

**Primary success indicators**

* Reduced time-to-log for repeat meals

* Increased % of logs from non-search entry points

* Improved week-1 and week-4 retention

**Leading indicators**

* Favorites grid tap rate

* Search keystrokes before selection

* “Log again” usage from recent meals

***

## 10. Risks & Known Limitations

**Potential risks**

* Cold start for new users

* Favorites becoming stale

* Users ignoring new UI and defaulting to search

**Safeguards**

* Fallback to global search

* No hard blocking of existing flows

* Metrics in place to detect early failure