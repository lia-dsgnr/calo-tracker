## Input

**Required:** Solution approaches, Hypothesis, User goals, Available resources
**Optional:** Timeline context, Dependencies, Technical constraints, Current baseline metrics, Analytics infrastructure

📎 Attach file OR paste inline below

---

## Command

### Part 1: Define Scope

Define what's in scope and out of scope for the current implementation phase.

**In Scope (MVP):**
- List the specific approaches/features to implement
- For each, specify the core functionality included
- Note any simplified versions vs. full vision

**Out of Scope (Future):**
- List approaches/features explicitly excluded
- Explain why each is deferred (complexity, dependencies, validation needed)
- Note which are "future opportunities" vs. "won't do"

**Scope boundaries:**
- Technical boundaries (what systems are touched)
- User boundaries (which personas are served)
- Feature boundaries (what interactions are supported)

**Dependencies:**
- What must exist before this can ship
- What can be built in parallel
- External dependencies (APIs, data, approvals)

### Part 2: Define Success Metrics

Define success metrics for the selected solution approaches.

**Primary success indicators:**
- 2-3 key metrics that prove the hypothesis
- Target values or thresholds for success
- Measurement method and data source

**Leading indicators:**
- Early signals that predict primary success
- Observable within first week of launch
- Actionable if trending wrong

**Guardrail metrics:**
- What should NOT get worse
- Acceptable trade-off ranges
- Red flags that require immediate action

**Per-approach metrics:**
For each solution approach, specify:
- Specific metric(s) to validate this approach
- Success threshold
- Failure threshold (when to reconsider)

---

## Output Format (choose one)

### Format 1: OKR-Style Canvas ⭐ Recommended
Objectives (scope) paired with Key Results (metrics) - industry standard, easy to review

```
Objective: [What we're building]
├── In Scope: [features]
├── KR1: [metric] → [target]
├── KR2: [metric] → [target]
└── Out of Scope: [deferred items]
```

### Format 2: Goals-Signals-Metrics (GSM) Framework
Google's approach connecting user goals → observable signals → measurable metrics
- Clear causality chain from user intent to measurement
- Prevents vanity metrics by requiring signal justification

### Format 3: Definition of Done Checklist
Simple checklist format with:
- Scope items as checkbox tasks
- Success criteria as acceptance criteria
- Metrics as verification steps with pass/fail thresholds
