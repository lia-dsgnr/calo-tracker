---
name: userflow
description: Generate user flow diagrams from JTBD files. Use when asked to create user flows, explore job approaches, or visualize how users accomplish jobs.
---

# JTBD to User Flow

## Purpose

Take a JTBD file as input, brainstorm approaches for a selected job, and generate high-level user flow diagrams in D2 format for feature exploration/ideation.

## Dependencies

Requires a JTBD file. Run `jtbd` skill first if no JTBD document exists.

## When to Use

- "Create a user flow for this job"
- "How could users accomplish [job]?"
- "Explore approaches for [job]"
- "Generate user flow from JTBD"
- "draw userflow"
- "ideate userflow"
- "brainstorming userflow"

## Process

### Step 1: Locate JTBD Input

**If user provides file path:**
- Read the specified JTBD file

**If no path provided:**
- Search `artifacts/` for files matching `*-jtbd-*.md`
- If multiple found → ask user to pick one
- If none found → ask user for file path or paste content

### Step 2: Parse & Present Jobs

Extract all jobs from the JTBD file and present as numbered list:

```
Found 5 jobs in accountee-jtbd-2025-12-04.md:

1. [Functional] Record expenses quickly - "When I receive a receipt..."
2. [Functional] Track spending by category - "When I review my month..."
3. [Emotional] Feel confident about finances - "When tax season approaches..."
4. [Functional] Generate reports for accountant - "When my accountant asks..."
5. [Social] Appear organized to investors - "When presenting to stakeholders..."

Which job would you like to explore? (enter number)
```

### Step 3: Validate Job Type

**If functional job** → proceed to brainstorming

**If emotional/social job** → ask clarifying questions:
- "This is an emotional job. What specific actions might help users feel [outcome]?"
- "What triggers this feeling? What would resolve it?"
- "Should we explore a functional job that supports this emotional need instead?"

### Step 4: Brainstorm Approaches

For the selected job, propose 2-4 different approaches:

```
Job: "When I receive a receipt, I want to record it quickly, so I can stay on top of expenses"

Possible approaches:
A) Manual entry - User types expense details into a form
B) Photo capture - User takes photo, app extracts details via OCR
C) Email forwarding - User forwards receipt email, app parses it
D) Bank sync - App imports transaction, user just confirms category

Which approaches should I generate flows for? (e.g., "A, B" or "all")
```

### Step 5: Generate D2 User Flows

For each selected approach, generate a D2 file following this structure:

**D2 Shape Mapping:**

| Element | Shape | Color | D2 Syntax |
|---------|-------|-------|-----------|
| Start/End point | Circle | Black fill, white text | `shape: circle` + `style.fill: "#000000"` + `style.font-color: "#FFFFFF"` |
| User Action | Rectangle | Light blue fill | `shape: rectangle` + `style.fill: "#ADD8E6"` |
| Decision (yes/no) | Diamond | Light red fill | `shape: diamond` + `style.fill: "#FFCCCB"` |
| UI Screen/Page | Document | Green fill | `shape: document` + `style.fill: "#90EE90"` |
| Sequence | Arrow | Black | `->` (default black) |

**D2 Template:**

```d2
direction: right

# Start
start: Start {
  shape: circle
  style.fill: "#000000"
  style.font-color: "#FFFFFF"
}

start -> first-screen

# Screen → Action → Screen pattern
first-screen: Screen Name {
  shape: document
  style.fill: "#90EE90"
}

first-screen -> user-action

user-action: Tap "Button" {
  shape: rectangle
  style.fill: "#ADD8E6"
}

user-action -> next-screen

next-screen: Next Screen {
  shape: document
  style.fill: "#90EE90"
}

# Decision example
next-screen -> decision-point

decision-point: Condition? {
  shape: diamond
  style.fill: "#FFCCCB"
}

decision-point -> yes-action: Yes
decision-point -> no-action: No

yes-action: Action A {
  shape: rectangle
  style.fill: "#ADD8E6"
}

no-action: Action B {
  shape: rectangle
  style.fill: "#ADD8E6"
}

# Both paths converge
yes-action -> end-screen
no-action -> end-screen

end-screen: Confirmation {
  shape: document
  style.fill: "#90EE90"
}

end-screen -> done

# End
done: End {
  shape: circle
  style.fill: "#000000"
  style.font-color: "#FFFFFF"
}
```

**Flow Guidelines:**
- Keep flows high-level: 5-8 steps maximum
- Follow Screen → Action → Screen alternating pattern
- Include decision points only when essential
- Focus on happy path first, add one alternative path if needed

### Step 6: Save & Present

1. Save D2 file to `artifacts/FLOW[YYMMDD]-[slug].d2`
   - Use kebab-case for slug (2-4 words, max 30 chars)
   - Example: `FLOW251209-record-expenses-photo.d2`

2. Describe the flow in plain text:
   ```
   Flow: Start → Home Screen → Tap "Add Expense" → Camera Screen →
   Take Photo → Review Screen → Details correct? →
   Yes: Save → Confirmation → End
   No: Edit → Save → Confirmation → End
   ```

3. Ask: "Would you like to refine this flow or generate another approach?"

## Error Handling

| Situation | Response |
|-----------|----------|
| No JTBD file found | Ask user for file path or paste content |
| Multiple JTBD files | Present list, ask user to choose |
| Emotional/social job selected | Ask clarifying questions before proceeding |
| Job statement too vague | Ask for more context about trigger and outcome |
| User wants to change approach mid-flow | Start fresh with new approach |

## Validation Checklist

Before finalizing each user flow:
- [ ] Direction set to `right` (left-to-right layout)
- [ ] Start node uses black circle with white text
- [ ] End node uses black circle with white text
- [ ] All screens use green document shape
- [ ] All actions use light blue rectangle shape
- [ ] All decisions use light red diamond shape
- [ ] Flow follows Screen → Action → Screen pattern
- [ ] 5-8 steps maximum (high-level)
- [ ] File saved to `artifacts/` with `FLOW[YYMMDD]-[slug].d2` naming

## Constraints

- This is for **feature exploration**, not implementation specs
- Keep diagrams high-level (5-8 steps)
- Focus on core path, not edge cases
- Do not include technical details or API calls
- Every flow must start with Start and end with End nodes
