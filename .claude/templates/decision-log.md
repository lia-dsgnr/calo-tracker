---
template: decision-log
version: 1
product: [Product Name]
created: [YYYY-MM-DD]
last_updated: [YYYY-MM-DD]
---

# Decision Log: [Product Name]

Active record of design decisions, rationale, and trade-offs throughout product lifecycle.

## How to Use This Log

**Decision Tiers:**
- **Quick:** Minor changes (< 5 min context). Single line with rationale.
- **Standard:** Most decisions. Includes context, alternatives, rationale.
- **Major:** Architectural/strategic shifts. Full documentation with stakeholder impact.

**When to log:** See Common Feedback Triggers in docs/guides/README.md (lines 173-178)

**TodoWrite Integration:**
- Claude adds todo reminder when making decisions: `"Log decision: [context]"`
- Invoke skill when ready: `"Log the [topic] decision from todos"`
- After logging, todo marked complete

---

## Quick Decisions

Single-line entries for minor changes. Format: `[Date] [Phase] - [What changed] → [Why]`

- 2025-12-08 [Explore] - Button placement moved to bottom → Better thumb reach on mobile testing
- 2025-12-06 [Define] - Removed "archive" from scope → Low user demand (2/12 interviews)

---

## Standard Decisions

### [DEC-001] [Short Decision Title]
**Date:** [YYYY-MM-DD]
**Phase:** [Discover | Define | Explore | Validate | Deliver]
**Trigger:** [What prompted this decision - reference README feedback triggers]
**Affected Artifacts:** `[artifact-filename.md]`, `[artifact-filename.md]`

**Context:**
[What situation or constraint required a decision]

**Options Considered:**
1. **Option A:** [Description] - [Pros/Cons]
2. **Option B:** [Description] - [Pros/Cons]
3. **Option C:** [Description] - [Pros/Cons]

**Decision:** [Which option chosen]

**Rationale:**
[Why this option over others. Evidence from research/testing.]

**Trade-offs:**
- **Gained:** [What we get]
- **Lost:** [What we sacrifice]
- **Risk:** [What could go wrong]

**Git Reference:** [commit hash or "See commits 2025-12-08"]

---

## Major Decisions

### [MAJ-001] [Strategic Decision Title]
**Date:** [YYYY-MM-DD]
**Phase:** [Phase name]
**Stakeholders Involved:** [Names/roles]
**Decision Type:** [Architecture | Scope | Strategy | Technical Constraint]
**Affected Artifacts:** `[list all impacted files]`

**Background:**
[Detailed context. What led to needing this decision?]

**Business Impact:**
[How does this affect product goals, timeline, users?]

**Options Analyzed:**

#### Option 1: [Name]
**Description:** [Full description]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Estimated Effort:** [Time/resources]
**Risk Assessment:** [High/Medium/Low + why]

#### Option 2: [Name]
[Same structure]

#### Option 3: [Name]
[Same structure]

**Decision:** [Chosen option]

**Rationale:**
[Detailed reasoning with evidence. Reference research, testing data, constraints.]

**Trade-offs Accepted:**
- [What we're giving up]
- [Risks we're accepting]
- [Assumptions we're making]

**Success Criteria:**
- [ ] [How we'll know this was the right choice]
- [ ] [Metrics or outcomes to validate]

**Rollback Plan:**
[If this fails, what's plan B?]

**Git Reference:** [commit hash range]

---

## Decision Index

Quick reference for finding decisions:

| ID | Date | Title | Phase | Impact |
|----|------|-------|-------|--------|
| MAJ-001 | 2025-12-08 | [Title] | Define | High |
| DEC-001 | 2025-12-07 | [Title] | Explore | Medium |

---

## Patterns Learned

Capture recurring themes or lessons as they emerge:

**[Pattern Name]:**
[What we learned that might apply to future decisions]

---

## Notes

- Each decision links to affected artifacts
- Git commits show what changed; this log explains why
- Update index when adding decisions
- Use decision IDs for cross-referencing in other artifacts
