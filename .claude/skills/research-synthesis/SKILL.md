---
name: research-synthesis
description: Synthesize research inputs into actionable insights. Handles user interviews, stakeholder meetings, analytics data, and general research. Use when asked to analyze, summarize, or extract insights from research materials.
---

# Research Synthesis

## When to Use
- "Synthesize these interviews"
- "What are the key findings from this research?"
- "Summarize the stakeholder feedback"
- "What patterns do you see in this data?"

## Process

1. **Identify input type** - Ask if unclear:
   - User interviews/transcripts
   - Stakeholder meetings/notes
   - Metrics/analytics/data
   - Articles/reports/docs

2. **Locate input files** - Check `docs/` first. If not found:
   - Ask user: "Where are your [input type] files located?"
   - Accept file uploads directly in chat
   - Accept pasted content inline
   - Supported formats: `.md`, `.txt`, `.csv`, `.pdf`, `.docx`

3. **Extract and analyze** - For each input type, capture key information:
   - Interviews: Pain points, goals, behaviors, quotes, workarounds
   - Stakeholder: Requirements, constraints, priorities, concerns
   - Analytics: Patterns, anomalies, trends, drop-off points
   - Research: Findings, methodologies, citations, conclusions

4. **Synthesize** - Look for:
   - Patterns (what repeats?)
   - Contradictions (what conflicts?)
   - Gaps (what's missing?)
   - Surprises (what's unexpected?)

5. **Format output** - Use template: `.claude/templates/research-synthesis.md`

6. **Save** - Store in `docs/[product]-[topic]-YYYY-MM-DD.md`
   - Topic: Optional, defaults to "research-synthesis" if not specified
   - Use specific topic if research is scoped (e.g., "onboarding", "pricing")
   - If file exists, auto-increment: `-2`, `-3`, etc.
   - Example: `accountee-onboarding-2025-12-04.md` or `accountee-onboarding-2025-12-04-2.md`

## Validation Checklist

Before finalizing synthesis:
- [ ] Every finding cites specific source
- [ ] Patterns show frequency (X of Y sources)
- [ ] Contradictions acknowledged, not hidden
- [ ] Gaps explicitly called out
- [ ] Recommendations link to findings
- [ ] Source log complete and accurate
- [ ] No invented quotes or data points

## Anti-Patterns

❌ **Vague sourcing**
```markdown
Key Findings:
1. Users want faster performance
2. Dashboard is confusing
```
Why this fails: No source attribution. Could be from 1 person or 100.

✅ **Specific sourcing**
```markdown
Key Findings:
1. Performance issues mentioned in 8 of 12 interviews (docs/interviews-01-12.md)
2. Dashboard navigation: 5 participants failed task completion (analytics-2025-11.csv)
```

❌ **Cherry-picking positive feedback**
Highlighting only quotes that support desired direction. Include contradictions.

❌ **Over-generalizing from small samples**
"All users prefer option A" (based on 3 interviews)
✅ "3 of 3 interviewed users preferred option A. Small sample - validate with larger group."

❌ **Inventing or paraphrasing quotes**
"Users basically said they hate the old design"
✅ Use exact quote: "This interface is frustrating" - User 7, line 42

❌ **Ignoring gaps**
Pretending you have complete data when you don't.
✅ "No data on mobile usage patterns - recommend follow-up study"

## Error Handling

**No input files found:**
- Ask user: "Where are your [input type] files located?"
- Offer to accept uploads or pasted content
- Do not proceed without valid input

**Empty or corrupted file:**
- Notify user: "File X appears empty or unreadable"
- Request alternative format or re-upload
- Skip corrupted file, process remaining files

**Insufficient data for synthesis:**
- If <3 sources: "Limited data - findings may not be representative"
- Recommend additional research before proceeding
- Clearly flag sample size limitations

**Contradictory data without context:**
- Don't ignore contradictions
- Present both sides: "Source A shows X, Source B shows Y"
- Recommend follow-up investigation

**Cannot create output directory:**
- Ask user: "Where should I save this synthesis?"
- Offer to output inline in chat
- Provide copy-paste ready markdown

**Unsupported file format:**
- List supported: `.md`, `.txt`, `.csv`, `.pdf`, `.docx`
- Ask user to convert or paste content directly

## Constraints
- Always cite which source a finding came from
- Flag confidence level when extrapolating
- Do not invent data points
