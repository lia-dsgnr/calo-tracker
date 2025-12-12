# Naming Conventions

Single source of truth for artifact naming and file organization.

## Core Principle

One repo = one product. No product prefix needed.

## File Naming Pattern

```
[ARTIFACT-CODE][YYMMDD]-[slug](-[increment]).md
```

### Components

| Component | Required | Format | Example |
|-----------|----------|--------|---------|
| Artifact code | Yes | 2-4 uppercase letters | `COMP` |
| Date | Yes | YYMMDD | `250609` |
| Slug | Yes | 2-4 words, kebab-case, max 30 chars | `freshbooks-pricing` |
| Increment | No | `-2`, `-3`, etc. (only if collision) | `-2` |

### Examples

```
COMP250609-market-leaders.md
JTBD250609-onboarding-flow.md
PERS250609-smb-owner.md
RSYN250609-user-interviews.md
COMP250609-freshbooks-pricing-2.md   # second competitive analysis same day
```

## Artifact Codes

| Artifact | Code | Description |
|----------|------|-------------|
| Competitive Analysis | `COMP` | Market and competitor research |
| Decision Log | `DLOG` | Design decisions and rationale |
| Feature List | `FEAT` | Feature specifications from scope |
| Information Architecture | `IA` | Site maps and content structure |
| JTBD | `JTBD` | Jobs to be done statements |
| Product Requirement Document | `PRD` | Product requirements and specifications |
| Research Synthesis | `RSYN` | Synthesized research findings |
| Sample Data | `DATA` | Mock or test data sets |
| Scope Definition | `SCOP` | Feature scope and requirements |
| Task List | `TASK` | Feature task breakdowns and acceptance criteria |
| Testing Plan | `TEST` | Test strategies and coverage plans |
| User Flow | `FLOW` | Task flows and interaction sequences |
| User Interview | `INTV` | Interview notes and transcripts |
| User Journey Map | `JMAP` | End-to-end user experience maps |
| User Persona | `PERS` | User persona definitions |

## Slug Rules

1. **Concise** - 2-4 words that describe the content
2. **Kebab-case** - Lowercase, hyphens between words
3. **No dates** - Date is already in the filename
4. **Descriptive** - Should answer "what is this about?"

### Good Slugs

- `freshbooks-pricing`
- `onboarding-pain-points`
- `smb-owner-profile`
- `beta-user-feedback`

### Bad Slugs

- `analysis` (too vague)
- `competitive-analysis-december` (redundant with code and date)
- `this-is-a-very-long-slug-that-goes-on-forever` (too long)

## Same-Day Collisions

When creating multiple artifacts of the same type on the same day:

- First: `COMP250609-freshbooks-pricing.md`
- Second: `COMP250609-xero-features-2.md`
- Third: `COMP250609-wave-onboarding-3.md`

Increment appends at the end, before the extension.

## File Paths

All artifacts save to `artifacts/`

## Templates

Templates are in `.claude/templates/` with YAML frontmatter:

```yaml
---
template: [artifact-type]
version: 1
---
```

## Quick Reference

```
Pattern:  [CODE][YYMMDD]-[slug](-[increment]).md

Codes:    COMP  DATA  DLOG  FEAT  FLOW  IA  INTV  JMAP  JTBD  PERS  PRD  RSYN  SCOP  TASK  TEST

Example:  JTBD250609-checkout-friction.md
```
