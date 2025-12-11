# Decision Log Guide

How designers use the Decision Log throughout the DPA process.

## What is the Decision Log?

Single document capturing design decisions, rationale, and trade-offs throughout project lifecycle.

**Purpose:**
- Explain WHY choices were made (git shows WHAT changed)
- Document alternatives considered
- Track trade-offs accepted
- Enable future teams to understand past reasoning

**Format:** `artifacts/decision-log.md`

**Updated:** Continuously throughout all phases (not just Phase 4)

---

## When to Log Decisions

Reference: docs/guides/README.md Common Feedback Triggers (lines 173-178)

| Trigger | Example | Log What |
|---------|---------|----------|
| **Prototype test reveals flow issue** | Users can't find checkout button | Why you moved it, alternatives tried, testing results |
| **Flow exposes persona gap** | Power users need advanced mode | Why you added persona variant, research supporting it |
| **Scope creep during design** | Stakeholder requests analytics dashboard | What you cut, why, trade-offs accepted |
| **Tech constraint changes design** | API limits force pagination | Constraint details, design adaptations, alternatives considered |
| **Direction shifts** | New competitor changes positioning | Strategic shift rationale, impact on artifacts |

**General rule:** If you chose between 2+ options, log it.

---

## How Decision Logging Works

**TodoWrite Integration** prevents forgetting while optimizing context:

### When Claude makes a decision during work:
1. Claude identifies decision with alternatives (e.g., "I chose tabs over hamburger menu")
2. Adds TodoWrite reminder: `"Log decision: Navigation changed to tabs (prototype testing showed hamburger failed)"`
3. Continues work without loading decision log (context optimization)

### When designer ready to log:
1. Designer sees todo in list
2. Invokes skill: `"Log the navigation decision from todos"` or `"Log decision from todos"`
3. Claude:
   - Reads todo context
   - Loads decision log on-demand
   - Asks clarifying questions (tier, alternatives, rationale)
   - Updates log
   - Marks todo complete
   - Unloads log from context

### Benefits:
- ✅ Never forgets (TodoWrite persists across sessions)
- ✅ Context optimized (log loaded only when needed)
- ✅ Designer controls timing (not automatic spam)
- ✅ Survives context compaction

---

## Decision Tiers

Choose appropriate detail level:

### Quick Decisions
**When:** Minor changes, obvious choice, < 5 min context

**Format:** Single line
```
- 2025-12-08 [Explore] - Changed primary button color from blue to green → Better contrast ratio (WCAG AAA)
```

**Time to log:** < 1 minute

**Examples:**
- Color adjustments for accessibility
- Button placement tweaks
- Copy changes based on A/B testing
- Icon selection

---

### Standard Decisions
**When:** Most decisions (2+ alternatives, affects 1-3 artifacts)

**Format:** Full structure with context/options/rationale/trade-offs

**Example:**
```markdown
### DEC-012 Primary navigation pattern

**Date:** 2025-12-08
**Phase:** Explore
**Trigger:** Prototype testing showed users couldn't find settings (6/10 failed)
**Affected Artifacts:** `accountee-user-flow-2025-12.md`, `accountee-prototype-v2.fig`

**Context:**
Initial hamburger menu hid critical functions. Users expected persistent navigation.

**Options Considered:**
1. **Tabs (4-5 items):** Always visible, clear mental model. Con: Limited scalability.
2. **Hamburger menu:** Scales well, clean UI. Con: Low discoverability (testing confirmed).
3. **Hybrid (tabs + hamburger):** Best of both. Con: Complexity, inconsistent patterns.

**Decision:** Tabs

**Rationale:**
Testing data: 9/10 users found tabs immediately vs 4/10 for hamburger. App has 4 core sections (Expenses, Budget, Reports, Settings) - fits tab limit. Mobile-first users expect bottom tabs (iOS convention).

**Trade-offs:**
- **Gained:** Immediate discoverability, thumb-friendly mobile navigation
- **Lost:** Can't add 6th section without redesign
- **Risk:** Future feature requests may not fit tab model

**Git Reference:** Commit a3f9821
```

**Time to log:** 5-10 minutes

**Examples:**
- Navigation patterns
- Feature prioritization
- Persona additions
- Layout structures
- Information architecture changes

---

### Major Decisions
**When:** Strategic/architectural, affects multiple artifacts, stakeholder alignment

**Format:** Complete analysis with business impact, stakeholder involvement, rollback plan

**Example:**
```markdown
### MAJ-003 Platform decision: Web-first vs native mobile

**Date:** 2025-12-08
**Phase:** Define
**Stakeholders Involved:** Lead Designer (Sarah), CTO (Mike), Product Manager (Alex)
**Decision Type:** Architecture
**Affected Artifacts:** All Phase 3 artifacts (flows, prototypes, design system)

**Background:**
User research showed 70% mobile usage (accountee-synthesis-2025-12.md), but budget limits development resources. Must choose platform strategy before design work begins.

**Business Impact:**
- Timeline: Native adds 3 months
- Budget: Native = 2x development cost
- User satisfaction: Mobile-first users expect native features (offline, push)

**Options Analyzed:**

#### Option 1: Progressive Web App (PWA)
**Description:** Single codebase, works on mobile and desktop, installable
**Pros:**
- Faster to market (1 codebase)
- Lower development cost
- Easier maintenance

**Cons:**
- Limited offline capability
- No push notifications on iOS
- Perceived as "less professional" by 4/12 interview participants

**Estimated Effort:** 6 months
**Risk Assessment:** Medium (iOS limitations may frustrate users)

#### Option 2: Native Mobile (iOS + Android)
**Description:** Platform-specific apps, full native features
**Pros:**
- Best user experience
- Full offline support
- Native features (push, biometrics)

**Cons:**
- 2x development time
- Separate codebases = harder maintenance
- Desktop web version still needed

**Estimated Effort:** 9 months
**Risk Assessment:** High (resource constraints, delayed launch)

**Decision:** Progressive Web App (PWA)

**Rationale:**
Time-to-market critical for competitive positioning (2 new competitors launched Q4). User research shows core job ("track expenses accurately") doesn't require native features. Offline sync can be added in v2 after validating product-market fit. Budget constraints make native unviable for MVP.

**Trade-offs Accepted:**
- Sacrificing iOS push notifications (alternative: email/SMS reminders)
- Offline limited to service worker caching (not full offline mode)
- Some users may perceive as "less serious" (mitigate with premium design quality)

**Success Criteria:**
- [ ] Launch by Q1 2026 (3 months earlier than native)
- [ ] Mobile web usage remains >60% after launch
- [ ] <10% of users request native app features in feedback

**Rollback Plan:**
If mobile web adoption <40% after 3 months, evaluate native build for v2. PWA foundation enables code reuse.

**Git Reference:** Commits 2025-12-08 through 2025-12-15 (design system setup)
```

**Time to log:** 20-30 minutes

**Examples:**
- Platform choices
- Major scope cuts
- Design system approaches
- Technical architecture shifts
- Pivots based on market changes

---

## Workflow Integration

### Phase 1 (Discover)
**Common decisions:**
- Scope: What research to conduct
- Prioritization: Which user segments to focus on
- Synthesis: How to handle contradictory data

**Example:** "DEC-001: Prioritized small business owners over freelancers based on market size analysis"

### Phase 2 (Define)
**Common decisions:**
- Scope: Feature inclusion/exclusion
- Prioritization: Task sequencing
- Architecture: Information structure

**Example:** "MAJ-001: Cut offline mode from MVP to hit launch date, added to v2 roadmap"

### Phase 3 (Explore)
**Common decisions:**
- Design patterns: Navigation, layouts, interactions
- Visual direction: Design system choices
- Technical constraints: Platform limitations

**Example:** "DEC-008: Tabs over hamburger menu based on prototype testing"

### Phase 4 (Validate + Deliver)
**Common decisions:**
- Test failures: How to address issues
- Scope adjustments: What to ship vs defer
- Trade-offs: Quality vs timeline

**Example:** "DEC-015: Shipped with known iOS scrolling bug (low severity, affects 2% users) to hit launch date"

---

## Decision Log vs Git Commits

| Aspect | Decision Log | Git Commits |
|--------|--------------|-------------|
| **What** | WHY choices made | WHAT changed |
| **Content** | Rationale, alternatives, trade-offs | Code/artifact diffs |
| **Audience** | Future designers, stakeholders | Developers, version control |
| **Scope** | Design decisions | Implementation changes |
| **Linking** | Reference commit hashes | Reference decision IDs in commit messages |

**Example linking:**
```
Decision Log (DEC-012):
"Git Reference: Commit a3f9821"

Git Commit (a3f9821):
"Update user flow to tabs navigation (per DEC-012)"
```

---

## Using the Skill

### From TodoWrite reminder:
```
"Log the navigation decision from todos"
```

Claude will:
- Find decision todo
- Extract context from todo description
- Ask for tier (Quick/Standard/Major)
- Gather missing details (alternatives, rationale, trade-offs)
- Update decision log
- Mark todo complete

### Fresh decision (no todo):
```
"Log decision: We changed navigation to tabs after prototype testing"
```

Claude will:
- Ask which tier
- Gather full context
- Request alternatives considered
- Document rationale and trade-offs
- Update decision log

**Skill location:** `.claude/skills/decision-log/SKILL.md`

---

## Real-World Example: Accountee

Trace a decision through artifacts with TodoWrite workflow:

### 1. Research reveals issue (Phase 1)
**File:** `accountee-synthesis-onboarding-2025-12.md`
```markdown
Finding: 8/12 users abandoned signup at phone verification step
```

### 2. Claude makes decision during Define phase
**Action:** While updating scope, Claude evaluates options and adds todo:
```
Todo: "Log decision: Removed phone verification from MVP (8/12 users abandoned, email-only sufficient)"
```

### 3. Designer logs decision later
**Designer:** "Log the phone verification decision from todos"

**Claude updates:** `accountee-decision-log.md`
```markdown
### DEC-004 Remove phone verification from MVP

**Date:** 2025-12-08
**Phase:** Define
**Trigger:** Scope creep during design (stakeholder wanted phone + email)
**Affected Artifacts:** `accountee-scope-2025-12.md`, `accountee-user-flow-2025-12.md`

**Context:**
Research showed 8/12 users abandoned signup at phone verification. Stakeholder requested both phone and email for security.

**Options Considered:**
1. **Email only:** Simplest, proven to work. Con: Lower security perception.
2. **Phone only:** Reduces friction vs both. Con: SMS costs, international issues.
3. **Both (optional):** Maximum flexibility. Con: Complexity, abandonment risk.

**Decision:** Email only, defer phone to v2

**Rationale:**
Abandonment rate (67%) unsustainable for MVP. Competitor analysis shows 3/5 SMB apps use email-only initially. Can add phone verification post-launch if fraud detected.

**Trade-offs:**
- **Gained:** 78% signup completion (up from 40%)
- **Lost:** Perceived security for enterprise segment
- **Risk:** Higher fraud potential (mitigate with IP tracking)

**Git Reference:** Commit b7c4932
```

**Todo:** Marked complete automatically

### 4. Artifacts updated (Phase 2)
**Files:**
- `accountee-scope-2025-12.md`: Phone verification moved to v2
- `accountee-user-flow-2025-12.md`: Signup flow simplified

**Git commit b7c4932:**
```
"Remove phone verification step (per DEC-004)

- Update scope: defer phone to v2
- Simplify signup flow to email-only
- Add IP tracking for fraud detection"
```

### 5. Validation (Phase 4)
**File:** `accountee-test-results-2025-12.md`
```markdown
Result: Signup completion increased from 40% to 78%
```

**Decision log captured:**
- Why removed (research data)
- Alternatives considered (phone-only, both, email-only)
- Trade-off (security vs conversion)
- Success metric validated

---

## Tips

### Do:
- Log as you decide (don't batch at end)
- Reference specific evidence (research files, test results)
- Document alternatives even if obvious in hindsight
- Update index after Standard/Major decisions
- Link affected artifacts by filename
- Use TodoWrite reminders for decisions made during work

### Don't:
- Log every minor implementation detail
- Invent alternatives you didn't actually consider
- Skip trade-offs (always document what you sacrificed)
- Duplicate git commit info (they're complementary, not redundant)
- Delay logging (context fades quickly)
- Ignore todos (they prevent forgetting)

---

## Common Questions

### Q: How detailed should Quick decisions be?
A: Single line. If you need more than 1 sentence of context, use Standard.

### Q: Do I need to log decisions that feel obvious?
A: If you chose between 2+ options, yes. "Obvious" is hindsight bias. Future teams need your reasoning.

### Q: What if I realize a decision was wrong later?
A: Add new decision entry explaining what changed and why. Don't edit the old entry (git history captures evolution).

### Q: Should every artifact change get logged?
A: No. Only changes involving choice/trade-offs. Routine iterations don't need entries.

### Q: How does TodoWrite integration work?
A: Claude adds todo when making decisions with alternatives. You invoke skill when ready ("Log the [topic] decision from todos"). After logging, todo marked complete. This prevents forgetting while keeping decision log out of persistent context.

### Q: What if I don't see a decision todo?
A: Invoke skill directly: "Log decision: [context]". Claude will gather info from scratch. TodoWrite is helper, not requirement.

### Q: How do I handle decisions that span multiple phases?
A: Add entries at each decision point. Reference earlier entries. Example: "DEC-009 revisits MAJ-001 based on new constraint."

### Q: Can I edit the decision log file directly?
A: Yes. It's markdown. Skill just helps with formatting and context optimization. Manual edits work fine.

---

## Validation Checklist

Before calling a decision "logged":
- [ ] Entry in correct tier section
- [ ] All required fields completed
- [ ] Alternatives documented (if Standard/Major)
- [ ] Rationale cites evidence
- [ ] Trade-offs explicitly stated
- [ ] Affected artifacts listed by filename
- [ ] Index updated (if Standard/Major)
- [ ] Frontmatter last_updated is current
- [ ] Todo marked complete (if applicable)

---

## References

| Resource | Purpose | Location |
|----------|---------|----------|
| Decision log template | Structure and format | `.claude/templates/decision-log.md` |
| Decision log skill | How Claude logs decisions | `.claude/skills/decision-log/SKILL.md` |
| Naming conventions | File naming rules | `docs/guides/conventions.md` |
| README feedback triggers | When to log decisions | `docs/guides/README.md` lines 173-178 |
| Phase 1 onboarding | Phase workflow context | `docs/guides/phase1-onboarding.md` |
