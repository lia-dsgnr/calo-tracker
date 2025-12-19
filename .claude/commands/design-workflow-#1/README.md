# Design Workflow #1

This package contains 9 markdown command files for structured design thinking and problem framing.

## Workflow Sequence

1. **1-reframe-problem.md** - Generate 3-5 problem framings
2. **2-list-assumptions.md** - Identify and risk-rate assumptions
3. **3-form-hypothesis.md** - Create testable hypotheses
4. **4-solution-approaches.md** - Propose 4-6 solution approaches
5. **5-cross-domain-inspiration.md** - Find analogies from other domains
6. **6-solution-tradeoffs.md** - Analyze benefits/costs per approach
7. **7-ux-interaction-changes.md** - Define UX flows and interaction patterns
8. **8-scope-and-metrics.md** - Define scope boundaries and success metrics
9. **9-visual-gallery.md** - Generate HTML gallery of all visual outputs


## Usage Pattern

You can chain these commands sequentially:

1. Start with `1-reframe-problem.md`
2. Pick the best framing
3. Run `2-list-assumptions.md`
4. Validate highest-risk assumptions
5. Run `3-form-hypothesis.md`
6. Then `4-solution-approaches.md`
7. Then `5-cross-domain-inspiration.md`
8. Then `6-solution-tradeoffs.md`
9. Select top 2-3 approaches
10. Run `7-ux-interaction-changes.md` to define UX flows
11. Run `8-scope-and-metrics.md` to define boundaries and success metrics
12. Finally `9-visual-gallery.md` to consolidate outputs

### Key Decision Points

- **After Step 2:** Choose which problem framing to pursue
- **After Step 4:** Decide which assumptions need validation before proceeding
- **After Step 5:** Select your primary hypothesis to test
- **After Step 8:** Narrow down to 2-3 finalist solution approaches

### Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DESIGN WORKFLOW #1 - DEPENDENCY DIAGRAM                   │
└─────────────────────────────────────────────────────────────────────────────┘

EXTERNAL INPUTS
  ├── Problem statement
  ├── User context / Personas
  └── Constraints (optional)
          │
          ▼
┌──────────────────────┐
│  1-reframe-problem   │──────────────────────────────────────────┐
│  Output: 3-5 framings│                                          │
└──────────┬───────────┘                                          │
           │ selected framing                                     │
           ▼                                                      │
┌──────────────────────┐                                          │
│  2-list-assumptions  │                                          │
│  Output: Risk-rated  │                                          │
│  assumptions         │                                          │
└──────────┬───────────┘                                          │
           │ high-risk assumptions                                │
           ▼                                                      │
┌──────────────────────┐                                          │
│  3-form-hypothesis   │────────────────────────────────────┐     │
│  Output: Testable    │                                    │     │
│  hypothesis          │                                    │     │
└──────────┬───────────┘                                    │     │
           │ problem framing + user priorities              │     │
           ▼                                                │     │
┌──────────────────────┐                                    │     │
│ 4-solution-approaches│────────────────────────────┐       │     │
│  Output: 4-6 solution│                            │       │     │
│  approaches          │                            │       │     │
└──────────┬───────────┘                            │       │     │
           │ solution approaches                    │       │     │
     ┌─────┴─────┐                                  │       │     │
     ▼           ▼                                  │       │     │
┌────────────┐ ┌────────────────┐                   │       │     │
│5-cross-dom │ │6-solution-     │◄──────────────────┘       │     │
│inspiration │ │tradeoffs       │                           │     │
│Output:     │ │Output: Trade-  │                           │     │
│Patterns    │ │off matrix      │                           │     │
└────────────┘ └───────┬────────┘                           │     │
                       │ selected 2-3 approaches            │     │
           ┌───────────┴───────────┐                        │     │
           ▼                       ▼                        │     │
    ┌────────────────┐ ┌─────────────────┐                  │     │
    │7-ux-interact   │ │8-scope-and-     │◄─────────────────┘     │
    │Output: UX flows│ │metrics          │◄───────────────────────┘
    │                │ │Output: Scope +  │
    │                │ │Success metrics  │
    └───────┬────────┘ └────────┬────────┘
            │                   │
            └─────────┬─────────┘
                      │ all visual outputs
                      ▼
             ┌──────────────────┐
             │ 9-visual-gallery │
             │ Output: HTML     │
             │ consolidated page│
             └──────────────────┘
```

### Alternative Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                        FULL WORKFLOW                            │
│  1 → 2 → 3 → 4 → 5 → 6 → 7 → 8                                │
│  │         │         │                                          │
│  │         │         └─ Tradeoffs                               │
│  │         └─────────── Approaches                              │
│  └───────────────────── Reframe                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   QUICK VALIDATION MODE                         │
│              (When time is limited)                             │
│                                                                 │
│  1 ──→ 2 ──→ 3 ──────────────→ 6 ──────────────→ 8            │
│  │     │     │                  │                  │            │
│  │     │     │                  │                  │            │
│  Reframe    Assumptions    Tradeoffs      Scope & Metrics      │
│        Pick                                                     │
│       Framing                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   DEEP RESEARCH MODE                            │
│           (When exploring new territory)                        │
│                                                                 │
│  1 → 2 → 3 → 4 → 5 → 6 → 7 → 8                                │
│                                                                 │
│  All steps included for comprehensive analysis                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ITERATION MODE                               │
│          (Refining existing solutions)                          │
│                                                                 │
│           ┌──────── Start here if you have ────────┐           │
│           │         existing solutions              │           │
│           ▼                                         │           │
│  ... ──→ 6 ──→ 7 ──→ 8                            │           │
│          │                                          │           │
│     Tradeoffs   UX    Scope &                      │           │
│                       Metrics                       │           │
│                                                     │           │
│  Or start at 7 if you've already selected:         │           │
│  ... ──────────────────→ 7 ──→ 8                   │           │
│                       UX     Scope &                │           │
│                              Metrics                │           │
└─────────────────────────────────────────────────────────────────┘
```

### Legend
```
──→  Sequential flow
 │   Decision/selection point
...  Previous steps (context exists)
```

## Tips

- Chain commands: Use output from one as input for the next
- Mix input methods: Attach project brief, paste specific details
- Choose output format based on your context (presentation vs. documentation)
- Iterate: Re-run commands as understanding deepens
- Use `9-visual-gallery.md` at the end to consolidate all visual outputs into a single HTML page