# How to: Competitive Analysis

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

**For a feature:**
```
Competitive analysis for [feature] as a feature in [product category]
```

4. Wait for Deep Research to complete
5. Copy the output
6. Save to `docs/01-discover/market-research/[name]-competitive-analysis.md`

## Quick Validation

Before saving, scan for:
- [ ] 5-7 competitors (not more)
- [ ] Sources listed at bottom
- [ ] JTBD are outcomes, not features

## Files

| What | Where |
|------|-------|
| Claude.ai setup + format | `.claude/templates/competitive-analysis-claude-ai-instructions.md` |
| Save reports to | `docs/01-discover/market-research/` |
