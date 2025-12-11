---
name: jtbd
description: Generate Jobs to Be Done statements from research. Use when asked to identify user jobs, create JTBD statements, or understand what users are trying to accomplish.
---

# Jobs to Be Done

## Dependencies

Requires research input. Run `research-synthesis` skill first if raw research hasn't been synthesized.

## When to Use
- "What jobs are users trying to do?"
- "Create JTBD from this research"
- "Why are users hiring our product?"

## Process

1. **Require research input** - Do not invent jobs. Must have:
   - Synthesized interviews (preferred) → `artifacts/`
   - User feedback
   - Behavioral data

2. **If research files not found** (check `artifacts/` first):
   - Ask user: "Where are your research files located?"
   - Accept file uploads directly in chat
   - Accept pasted research content inline
   - Supported formats: `.md`, `.txt`, `.pdf`, `.docx`

3. **Extract jobs** - Look for:
   - Struggles and workarounds
   - Goals mentioned repeatedly
   - Triggers that cause action
   - Desired outcomes

4. **Write job statements** using format:
   ```
   When [situation/trigger],
   I want to [motivation/action],
   So I can [desired outcome].
   ```

5. **Classify each job:**
   - **Functional** - Task to accomplish
   - **Emotional** - How they want to feel
   - **Social** - How they want to be perceived

6. **Determine scope** - Ask user if not clear from context:
   - "What scope/feature is this JTBD for?" (e.g., expense-tracking, onboarding, budget-management)
   - If entire product or unclear, use `jtbd` without scope
   - Sanitize to kebab-case (lowercase, hyphens only)

7. **Format output** - Use template: `.claude/templates/jtbd.md`

8. **Save** - Follow naming conventions: `docs/guides/naming-conventions.md`
   - Pattern: `JTBD[YYMMDD]-[scope-slug].md`
   - Examples:
     - `JTBD251209-expense-tracking.md`
     - `JTBD251209-onboarding-flow.md`
     - `JTBD251209-budget-management.md`
   - Save to `artifacts/`
   - If file exists same day, auto-increment: `-2`, `-3`

## Validation Checklist

Before finalizing JTBD:
- [ ] Every job has research evidence cited
- [ ] Statements follow format: When/I want to/So I can
- [ ] Type assigned (Functional/Emotional/Social)
- [ ] No solutions disguised as jobs
- [ ] No features disguised as jobs
- [ ] Frequency indicated for each job
- [ ] 5-7 primary jobs maximum
- [ ] Job hierarchy shows relationships

## Anti-Patterns

❌ **Solution-focused statement**
```markdown
When I open the app,
I want to see a dashboard,
So I can view my data.
```
Why this fails: "Dashboard" is a solution, not a job.

✅ **Job-focused statement**
```markdown
When I start my workday,
I want to quickly assess what needs my attention,
So I can prioritize effectively.
```

❌ **Feature as a job**
"I want filtering so I can filter items"
"I want to export to CSV"
These describe features, not underlying jobs.

✅ **Job behind the feature**
"I want to narrow down options so I can find relevant items faster"
"I want to share data with my team so we can make decisions together"

❌ **Invented job without evidence**
```markdown
Job 3: Track productivity
**Evidence:** Users probably want this
```

✅ **Evidence-backed job**
```markdown
Job 3: Track productivity
**Evidence:** "I need to justify my time to clients" - 6 of 10 freelancers (interviews-03.md)
```

❌ **Vague outcome**
"So I can be productive"
"So I can work better"

✅ **Specific outcome**
"So I can finish client work before the 5pm deadline"
"So I can reduce errors in my deliverables"

❌ **Missing trigger/situation**
"I want to organize my tasks"
✅ "When my inbox hits 50+ emails, I want to organize tasks so I don't miss deadlines"

## Error Handling

**No research input available:**
- Stop: "JTBD requires research foundation. Cannot proceed."
- Guide user: "Run research-synthesis skill first, or provide research files"
- Do not invent jobs from assumptions

**Empty or corrupted file:**
- Notify user: "File X appears empty or unreadable"
- Request alternative format or re-upload
- Do not proceed without valid research

**Research lacks job evidence:**
- If research contains only feature requests: "This data describes solutions, not jobs. Need underlying motivations."
- Ask: "Can you provide user interviews or behavioral context?"
- Recommend deeper discovery research

**Unable to extract jobs from research:**
- Flag to user: "Research doesn't reveal clear jobs. May need different questions."
- Suggest interview questions focused on triggers and outcomes
- Don't force-fit jobs where none exist

**Too many jobs identified (10+):**
- Prioritize by frequency and impact
- Ask user: "Focus on top 5-7, or document all with priority ranking?"
- Create hierarchy to show relationships

**Cannot create output directory:**
- Ask user: "Where should I save this JTBD document?"
- Offer to output inline in chat
- Provide copy-paste ready markdown

**Unsupported file format:**
- List supported: `.md`, `.txt`, `.pdf`, `.docx`
- Ask user to convert or paste content directly

## Constraints
- Every job must cite research evidence
- Limit to 5-7 primary jobs
- Do not confuse solutions with jobs ("I want to click a button" is not a job)
- Do not confuse features with jobs ("I want filtering" is not a job)
