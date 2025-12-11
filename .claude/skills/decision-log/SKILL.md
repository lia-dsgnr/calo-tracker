---
name: decision-log
description: Document design decisions with rationale and trade-offs throughout project lifecycle. Use when choices impact scope, design, or implementation. Updates single living document per product.
---

# Decision Log

## When to Use

Triggers from docs/guides/README.md Common Feedback Triggers (lines 173-178):
- "Prototype test reveals flow issue" → Log why flow changed
- "Flow exposes persona gap" → Log persona addition rationale
- "Scope creep during design" → Log what was cut and why
- "Tech constraint changes design" → Log trade-off and alternatives
- Any time you choose between alternatives
- Any time you change an artifact based on new information
- Any time stakeholder input shifts direction

**Do NOT use for:**
- Implementation details (those go in git commits)
- Routine iterations without decision points
- Changes with only one viable option

## TodoWrite Integration

**When making decisions during work:**
- Identify decisions with alternatives or trade-offs
- Immediately add TodoWrite reminder: `"Log decision: [brief context]"`
- Continue work without loading decision log (context optimization)

**When Claude should add decision todos:**
- ✅ Multiple options evaluated (tabs vs hamburger vs hybrid)
- ✅ Artifact changes based on feedback/constraints
- ✅ Scope additions/cuts
- ✅ Technical constraints forcing design changes
- ✅ Trade-offs made (sacrificing X for Y)
- ❌ Implementation details (code-level choices)
- ❌ Routine iterations without alternatives
- ❌ Single obvious option

**Todo format:**
`"Log decision: [What changed] ([Brief why/context])"`

**When designer ready to log:**
- Designer sees todo in list
- Invokes skill: `"Log the [topic] decision from todos"` or `"Log decision from todos"`
- Claude loads log on-demand, updates, marks todo complete

## Decision Tier Guide

**Choose Quick when:**
- Change is obvious/minor
- < 5 min to explain context
- Affects single artifact
- No alternatives considered
- Examples: Color change, button placement, copy tweak

**Choose Standard when:**
- Most decisions fall here
- Multiple options considered
- Affects 1-3 artifacts
- Research/testing informed choice
- Examples: Navigation pattern, feature prioritization, persona addition

**Choose Major when:**
- Strategic/architectural impact
- Affects multiple artifacts
- Stakeholder alignment required
- Significant trade-offs
- Timeline/scope implications
- Examples: Platform choice, major scope cut, design system approach

## Process

1. **Check invocation source**
   - If invoked with "from todos" or similar: Search todos for decision log entries
   - If fresh decision: Proceed to gather info from user
   - If todo found: Extract context from todo description for step 4

2. **Check if log exists** - Follow naming conventions: `docs/guides/naming-conventions.md`
   - Location: `artifacts/[product]-decision-log.md`
   - If not found: Ask user for product name, create from template
   - If exists: Read to understand context and get next decision ID

3. **Determine decision tier** - Ask user if unclear:
   - "Is this a Quick (minor), Standard (typical), or Major (strategic) decision?"
   - Provide tier guide if they're unsure
   - Use todo context to suggest tier if available

4. **Gather decision details** - Based on tier:

   **Quick:** Need:
   - Date (today)
   - Phase (which phase currently in)
   - What changed
   - Why (1 sentence)

   **Standard:** Need:
   - Short title
   - Trigger (what prompted this)
   - Context (1-2 paragraphs)
   - Options considered (2-4 options)
   - Decision made
   - Rationale (why this option)
   - Trade-offs (what gained/lost)
   - Affected artifacts

   **Major:** Need:
   - Everything from Standard, plus:
   - Stakeholders involved
   - Decision type
   - Business impact
   - Full option analysis (pros/cons/effort/risk per option)
   - Success criteria
   - Rollback plan

5. **Assign decision ID**:
   - Quick: No ID needed
   - Standard: DEC-### (increment from last DEC ID in log)
   - Major: MAJ-### (increment from last MAJ ID in log)

6. **Format entry** - Use template format for chosen tier

7. **Update decision log**:
   - Add entry to appropriate section (newest first)
   - Update index if Standard/Major
   - Update last_updated date in frontmatter
   - Save to `artifacts/[product]-decision-log.md`

8. **Complete workflow**:
   - If invoked from todo: Mark todo as completed
   - Show added entry to user
   - Ask if anything missing

## Validation Checklist

Before finalizing entry:
- [ ] Tier appropriate for decision scope
- [ ] Trigger clearly stated (if Standard/Major)
- [ ] All affected artifacts listed by filename
- [ ] Rationale references evidence (research, testing, constraints)
- [ ] Trade-offs explicitly documented
- [ ] ID assigned (if Standard/Major) and unique
- [ ] Index updated (if Standard/Major)
- [ ] Frontmatter last_updated is current date
- [ ] Git reference included if implementation already done
- [ ] Todo marked complete if applicable

## Anti-Patterns

❌ **Solution without alternatives**
```markdown
### DEC-001 Use tabs for navigation
**Decision:** We'll use tabs.
**Rationale:** Tabs are good for navigation.
```
Why this fails: No context on what else was considered.

✅ **Options evaluated**
```markdown
### DEC-001 Use tabs for navigation
**Options Considered:**
1. **Tabs:** Persistent, clear mental model. Con: Limited to 5 options.
2. **Hamburger menu:** Scales well. Con: Hidden, lower discoverability.
3. **Bottom nav:** Thumb-friendly. Con: iOS/Android conventions differ.

**Decision:** Tabs

**Rationale:** User testing (accountee-test-results-2025-12.md) showed 9/10 users found tabs immediately vs 4/10 for hamburger menu. App has 4 core sections (fits tab limit).
```

❌ **Vague rationale**
"We chose this because it's better."

✅ **Evidence-based rationale**
"Prototype testing revealed 60% of users couldn't find settings in hamburger menu. Tabs reduced time-to-settings from 12s to 3s."

❌ **Wrong tier**
Major decision documented as Quick.

✅ **Tier matches impact**
Platform choice = Major (affects all artifacts, timeline, team)
Button color = Quick (isolated change)

❌ **Missing trade-offs**
Only documenting benefits, not costs.

✅ **Balanced trade-offs**
"Gained: Better discoverability. Lost: Screen real estate. Risk: Tab labels may not translate well."

❌ **Ignoring affected artifacts**
Not linking decision to files it impacts.

✅ **Clear artifact links**
"Affected Artifacts: `accountee-user-flow-2025-12.md`, `accountee-personas-2025-12.md`"

## Error Handling

**No decision log exists:**
- Ask: "What's the product name for this log?"
- Create from template: `artifacts/[product]-decision-log.md`
- Set created date to today
- Initialize with frontmatter only

**User unsure which tier:**
- Show tier guide from "Decision Tier Guide" section
- Ask questions: "How many artifacts affected? Were alternatives considered? Strategic impact?"
- Recommend tier based on answers

**Missing required information:**
- For Standard/Major: Don't proceed without context, options, rationale
- Ask: "What alternatives did you consider?" or "What triggered this decision?"
- Don't invent information

**Decision already logged:**
- Check log before adding
- Ask: "This seems similar to [ID]. Is this an update or new decision?"
- If update: Add note to existing entry rather than duplicate

**Cannot write to artifacts/:**
- Ask user: "Where should I save the decision log?"
- Offer to output entry inline for manual addition
- Provide copy-paste ready markdown

**Todo not found:**
- If invoked "from todos" but no matching todo exists
- Ask: "I don't see a decision log todo. Should I log this as a fresh decision?"
- Proceed with gathering info from user

## Constraints

- One log per product (not per artifact)
- Always link to affected artifact filenames
- Always document trade-offs (not just benefits)
- Always reference evidence (research, testing, constraints)
- Never invent alternatives that weren't actually considered
- Never use tier for vanity (Major for minor decisions)
- Always mark todo complete if invoked from todo
