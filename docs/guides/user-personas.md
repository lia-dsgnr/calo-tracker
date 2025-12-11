# How to: User Personas

## Prerequisites

User personas require research input. You must have one of:
- Synthesized user interviews → `artifacts/`
- User surveys or feedback data
- Behavioral/analytics data
- Customer segment data

**No research?** Run `research-synthesis` first or conduct user interviews.

## Running with Claude Code

1. Open Claude Code in the project
2. Provide research files or reference existing ones in `artifacts/`
3. Enter prompt:

```
Create user personas from the research in artifacts/[filename].md
```

Or with uploaded files:
```
Create user personas from this research [attach files]
```

4. Review generated personas for research grounding
5. Output saves to `artifacts/`

## Quick Validation

Before finalizing, verify:
- [ ] Every attribute cites research evidence
- [ ] Goals and pain points are specific (not generic)
- [ ] Behaviours are observed, not assumed
- [ ] Quote is verbatim from research with source
- [ ] Personas are distinct (no overlapping needs)
- [ ] 2-4 personas maximum
- [ ] Primary persona clearly identified
- [ ] Accessibility needs addressed

## Common Mistakes

| Don't | Do |
|-------|-----|
| Generic goals: "Wants to do job better" | Specific: "Needs to prove ROI to justify budget" — 7/10 interviews |
| Assumed behaviour: "Probably checks email first" | Observed: "Starts day in Slack, checks dashboards before standup" — 5/8 observations |
| Made-up quote: "I just want things to work!" | Verbatim: "I spend 2 hours every Monday copying data between systems" — P4, interview-03.md |
| 8+ personas | 2-3 focused personas with clear priority |
| Ideal user you wish you had | Actual users from research |

## Persona Types

| Type | Purpose |
|------|---------|
| **Primary** | Main target user — design for first |
| **Secondary** | Important but not primary focus |
| **Accessibility** | Users with impairments (if research shows) |
| **Negative** | Who we are NOT designing for |

## Files

| What | Where |
|------|-------|
| Persona template | `.claude/templates/user-persona.md` |
| Skill instructions | `.claude/skills/user-persona/SKILL.md` |
| Save personas to | `artifacts/` |
