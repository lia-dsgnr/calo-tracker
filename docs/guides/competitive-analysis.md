# Competitive Analysis

## One-Time Setup

1. Create a Claude.ai project
2. Add custom instructions from `.claude/templates/competitive-analysis-claude-ai-instructions.md`

## Running Analysis

1. Open your Claude.ai project
2. Enable **Deep Research** mode
3. Enter prompt:

**For a product:**
```
Competitive analysis for [product] in [industry]
```

```
Competitive analysis for Notion in the productivity software market
```

```
Competitive analysis for Figma in the design tools industry
```

```
Competitive analysis for our CRM platform targeting small businesses
```

**For a feature:**
```
Competitive analysis for [feature] as a feature in [product category]
```

```
Competitive analysis for AI writing assistants as a feature in note-taking apps
```

```
Competitive analysis for real-time collaboration features in design tools
```

```
Competitive analysis for invoice automation features in accounting software
```

**For a specific scope:**
```
Competitive analysis for project management tools focused on creative agencies
```

```
Competitive analysis for mobile banking apps in the European market
```

```
Competitive analysis for video conferencing features targeting remote-first teams
```

4. Wait for Deep Research to complete
5. Copy the output
6. Save to `artifacts/`

## Files

| What | Where |
|------|-------|
| Claude.ai setup + format | `.claude/templates/competitive-analysis-claude-ai-instructions.md` |
| Save reports to | `artifacts/` |
