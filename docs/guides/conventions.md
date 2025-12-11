# DPA Conventions

Single source of truth for naming and file organization.

## File Naming

All artifacts follow this pattern:

```
[product]-[artifact-type]-YYYY-MM-DD.md
```

### Rules

1. **Product prefix** - Use product/feature name (e.g., `accountee`, `invoice-automation`)
2. **Date suffix** - Prevents overwrites, enables version history
3. **Auto-increment** - If file exists same day, append `-2`, `-3`, etc.
4. **Kebab-case** - Lowercase, hyphens (no spaces or underscores)

### Artifact Patterns

| Artifact | Pattern | Example |
|----------|---------|---------|
| Research Synthesis | `[product]-[topic]-YYYY-MM-DD.md` | `accountee-onboarding-2025-12-04.md` |
| Competitive Analysis | `[product]-competitive-analysis-YYYY-MM-DD.md` | `accountee-competitive-analysis-2025-12-04.md` |
| JTBD | `[product]-jtbd-YYYY-MM-DD.md` | `accountee-jtbd-2025-12-04.md` |
| User Personas | `[product]-personas-YYYY-MM-DD.md` | `accountee-personas-2025-12-04.md` |

### Same-Day Collisions

If file already exists:
- First: `accountee-jtbd-2025-12-04.md`
- Second: `accountee-jtbd-2025-12-04-2.md`
- Third: `accountee-jtbd-2025-12-04-3.md`

## File Paths

**Current:** All artifacts save to `docs/`

**Note:** Paths will be updated when team finalizes folder structure. See `.claude/handoffs/HANDOFF-2025-12-04-docs-organization.md` for options.

## Templates

All templates are in `.claude/templates/` with YAML frontmatter:

```yaml
---
template: [artifact-type]
version: 1
---
```

## Skills

Skills reference templates and follow these conventions. Each skill includes the pattern inline for visibility.
