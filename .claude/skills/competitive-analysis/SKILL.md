---
name: competitive-analysis
description: Research and analyze competitors for a product or feature. Use when user asks about competitors, market landscape, or competitive positioning.
---

# Competitive Analysis

## When to Use
- "Who are our competitors?"
- "Analyze the competitive landscape for X"
- "How does X compare to competitors?"

## Process

1. **Clarify scope** - Ask: product/feature name, industry, known competitors (if any)
2. **Research in Claude.ai** (manual step) - User runs Deep Research with prompt:
   > "Analyze competitors for [product] in [industry]. For each competitor, find: value proposition, ideal customer profile, jobs-to-be-done (as outcomes), key features, concrete workflows, pricing model, notable customers, strengths, weaknesses."
3. **Format output** - Claude.ai outputs pre-formatted (see `.claude/templates/competitive-analysis-claude-ai-instructions.md`)
4. **Validate** - Run through checklist below
5. **Save** - `docs/[product]-competitive-analysis-YYYY-MM-DD.md`
   - See `docs/guides/conventions.md` for naming rules and path updates

## Validation Checklist

Before finalizing analysis:
- [ ] Each competitor has all required fields populated
- [ ] All claims cite specific sources (URLs listed)
- [ ] JTBD phrased as outcomes, not features
- [ ] Positioning opportunities identified (not just feature gaps)
- [ ] Market overview provides context, not just competitor list
- [ ] Strengths/weaknesses tied to user outcomes
- [ ] 5-7 competitors maximum (unless justified)

## Anti-Patterns

**Feature matrix without WHY**
```
Competitor A has: Calendar, Notifications, Dashboard
Competitor B has: Calendar, Reports, API
```
Why this fails: Tells WHAT they have, not WHY users choose them.

**Outcome-focused analysis** (correct)
```
Competitor A: Users hire for "reduce meeting conflicts" (calendar + smart scheduling)
Competitor B: Users hire for "track team productivity" (automated reports + time tracking)
```

**Listing 12+ competitors**
Analysis paralysis. Pick 5-7 most relevant to your positioning.

**Subjective judgment without context**
Wrong: "Competitor X has a better UX"
Right: "Competitor X: 2-click checkout vs our 5-click (source: user reviews on G2)"

**Speculating on internal strategy**
Wrong: "They're probably pivoting to enterprise"
Right: "Recent pricing changes suggest enterprise focus (source: pricing page archived on date)"

## Constraints

- Maximum 5-7 competitors unless user requests more
- Do not speculate on competitor revenue or internal strategy
- Cite sources for all claims
