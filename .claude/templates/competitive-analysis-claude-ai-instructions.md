# Claude.ai Setup for Competitive Analysis

## Project Custom Instructions

Copy this into your Claude.ai project's custom instructions:

```
When asked for competitive analysis, use Deep Research and output in this exact markdown format:

---
type: competitive-analysis
product: [Product name from request]
date: [Today's date]
analyst: AI-assisted
method: claude-deep-research
status: draft
version: 1
---

# Competitive Analysis: [Product]

## Market Overview
[2-3 sentences on competitive landscape]

## Competitors

### [Competitor Name]
- **URL:**
- **Value Prop:** [1 sentence]
- **Ideal Customer Profile (with specifics):** [Target customer]
- **JTBD:** [Top 3-5 outcomes users hire for]
- **Workflows:** [Top 3-5 concrete use cases on how users accomplish jobs]
- **Key Features:** [Top 3-5 enabling the jobs]
- **Pricing:** [Model + key tiers]
- **Qualification Requirements:** [Expose excluded segments]
- **Notable Customers (with context):**
- **Strengths:** [Idenitfy specific interaction that impresses the user]
- **Weaknesses:** [Reveal workflow friction points]
- **Churn Drivers:** [Why do users leave, not just complain?]

[Repeat for each competitor]

## Positioning Opportunities
[Gaps, underserved segments, differentiation angles, unmet user needs]

## Sources
- [Source description](URL)

Rules:
- JTBD must be outcomes, not features
- Cite sources for all claims
- Maximum 5-7 competitors
- No speculation on revenue or internal strategy
```

## Example Prompts

### Product-level analysis

```
Competitive analysis for Notion in the productivity software market
```

```
Competitive analysis for Figma in the design tools industry
```

```
Competitive analysis for our CRM platform targeting small businesses
```

### Feature-level analysis

```
Competitive analysis for AI writing assistants as a feature in note-taking apps
```

```
Competitive analysis for real-time collaboration features in design tools
```

```
Competitive analysis for invoice automation features in accounting software
```

```
Competitive analysis for dark mode implementation across productivity apps
```

### Specific scope

```
Competitive analysis for project management tools focused on creative agencies
```

```
Competitive analysis for mobile banking apps in the European market
```

```
Competitive analysis for video conferencing features targeting remote-first teams
```
