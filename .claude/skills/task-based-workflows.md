# Task-Specific Workflows

> This document defines which phases from the main design process apply to each task type.

---

## Typical Design Task Types

- Research (user + domain)
- New Feature
- Enhancement
- Prototype
- Design Exploration
- Design System
- Quick Fix
- UX Writing

---

## The 4 Design Phases

| Phase | Sub-phases | Description |
|-------|------------|-------------|
| **Phase 1: Discover** | 1.1 Gather, 1.2 Generate | Collect inputs, conduct research, generate insights |
| **Phase 2: Define** | 2.1 Align, 2.2 Create Structure | Align on scope, create information architecture |
| **Phase 3: Explore** | 3.1 Create Solution, 3.2 Validate | Design solutions, test and validate |
| **Phase 4: Deliver** | 4.1 Deliver | Finalize, hand-off, and QC |

---

## Task-Phase Matrix

Different design tasks follow different paths through the main workflow. Use this matrix to determine which phases apply to your task.

**Legend:** R = Required | O = Optional | — = Skip

| Phase | Sub-phase | Deliverables | Research | New Feature | Enhancement | Prototype | Design Exploration | Design System | Quick Fix | UX Writing |
|-------|-----------|--------------|:--------:|:-----------:|:-----------:|:---------:|:------------------:|:-------------:|:---------:|:----------:|
| **1. Discover** | 1.1 Gather | Task List, Time Constraint | R | R | R | R | R | R | — | O |
| | 1.2 Generate | User Research, Market Research | R | R | R | R | O | R | O | R |
| **2. Define** | 2.1 Align | User Persona, User Journey Map, Research Synthesis, Scope, JTBD, User Story | R | R | R | O | R | R | — | O |
| | 2.2 Create Structure | Feature List, User Flow | R | R | R | O | R | R | — | O |
| **3. Explore** | 3.1 Create Solution | Information Architecture, Visual Solution, Design System | — | R | R | R | R | R | R | R |
| | 3.2 Validate | Test Plan, Prototype, Test Decision, Decision Log, Impact Map | O | R | O | R | R | R | — | O |
| **4. Deliver** | 4.1 Deliver | Finalized Design, Handoff Specs, Released Solution | — | R | R | R | O | R | R | R |

---

## Task Type Definitions

| Task Type | Description | Typical Duration |
|-----------|-------------|------------------|
| **Research** | User research, domain research, competitive analysis, discovery | Variable |
| **New Feature** | Building new functionality from scratch | Full cycle |
| **Enhancement** | Improving or extending existing features | Medium cycle |
| **Prototype** | Build prototype for testing or stakeholder buy-in | Short cycle |
| **Design Exploration** | Blue-sky thinking, concept exploration | Variable |
| **Design System** | Create/update design system components and patterns | Medium cycle |
| **Quick Fix** | Minor changes (typos, spacing, colors, small bugs) | Minimal |
| **UX Writing** | Microcopy, content design, messaging | Short cycle |

---

## Workflow Summaries by Task Type

| Task Type | Description | Phases | Deliverables | Must Have | Nice to Have | Risks |
|-----------|-------------|--------|--------------|-----------|--------------|-------|
| **Research** | Discovery-focused | Discover → Define | Research Synthesis, User Persona, Journey Map | User Research → Synthesis | Journey Map, Market Research | Assumption-based decisions |
| **New Feature** | Full design cycle | Discover → Define → Explore → Deliver | Scope, User Story, Feature List, User Flow, Final UI, Handoff | Scope, JTBD → User Story → Feature List → User Flow → IA, Design System | Research Synthesis, Prototype | Scope creep, Poor usability |
| **Enhancement** | Lighter alignment | Discover → Define → Explore → Deliver | Scope, Final UI, Handoff | Existing Docs, Scope, Design System | Updated Flow, User Research | Breaking existing features |
| **Prototype** | Rapid validation | Discover → Explore → Deliver | Prototype, Test Decision, Decision Log | Visual Solution, Test Plan | User Flow, Decision Log | No design direction |
| **Design Exploration** | Creative, flexible | Discover → Define → Explore | Visual Concepts, Decision Log, Impact Map | Problem Statement, Decision Log | Research Synthesis, Impact Map | Unfocused exploration |
| **Design System** | Component-focused | Discover → Define → Explore → Deliver | Components, Specs, Pattern Docs | Visual Patterns, Specs, Scope | Pattern Docs, Cross-team Align | Abstract components |
| **Quick Fix** | Minimal workflow | Explore → Deliver | Updated UI, Handoff | Design System, Problem Definition | Original Design Context | Visual inconsistency |
| **UX Writing** | Content-focused | Discover → Explore → Deliver | Microcopy Specs, Guidelines, Handoff | Visual Solution, IA, Voice Guidelines | User Research, Content Inventory | Poor content fit |

---

## User Story Format

**As a** [user type/persona],
**I want** [action/capability],
**So that** [benefit/value].

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

### Notes

- **User Story** is Required (R) for New Feature, Optional (O) for other task types
- **Design System** is a downstream dependency for: New Feature, Enhancement, Quick Fix
- **Research** outputs feed into all other task types via Research Synthesis
- **Prototype** has no full Deliver phase — it's for demonstration/testing, not production
- **Design Exploration** has most phases optional to allow creative freedom
