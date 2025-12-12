
---
# **Visual Guidelines — Calorie Tracker App (General Look & Feel)**

*A high-level creative-direction brief optimised for AI coding tools.*

---

## **1. Visual Identity Overview**

The app aims for a **warm, soft, wellbeing-centric aesthetic**. Nothing clinical or tech-cold. The interface should feel **gentle, wellness-oriented, and human** — like a mindful lifestyle companion rather than a hard-core fitness tracker.

Key qualities:

* Warm, rounded, calm
* Light, breathable spacing
* Friendly but not childish
* Soft shadows + big radii for comfort
* Neutral tones with pops of colour for highlights
* Clean structure with subtle depth

---

## **2. Colour System (Tokens)**

Use the existing palette families as the *foundation of the visual language*, mapped into tokens.

### **Colour Families (no dark mode for now)**

* **Mindful Brown** → primary neutrals, titles, icons, borders
* **Optimistic Gray** → backgrounds, dividers, disabled states, secondary text
* **Serenity Green** → success, healthy range, add-actions
* **Empathy Orange** → warnings, calorie highs, charts, CTAs
* **Zen Yellow** → highlights, badges, subtle attention cues
* **Kind Purple** → optional accent (weekly insights, achievements)

All colours scale from 10–100 (lightest → darkest).

### **Example Token Naming**

```
color.mindfulBrown.100
color.optimisticGray.40
color.serenityGreen.60
color.empathyOrange.50
color.zenYellow.30
color.kindPurple.20
```

Primary UI usage:

* **Primary text:** mindfulBrown.90
* **Secondary text:** optimisticGray.60
* **Background:** gray10–20
* **Cards:** white or gray10
* **Primary CTA:** serenityGreen.60 or empathyOrange.60
* **Critical/warning:** empathyOrange.70–80
* **Charts:** use hues per theme (green for intake goals, orange for over-limit, yellow for trends)

---

## **3. Typography**

### **Typeface**

**Urbanist** (Google Fonts, by Corey Hu)

### **Type Scale**

* **H1:** 28–32 semibold
* **H2:** 22–24 semibold
* **H3:** 18–20 semibold
* **Body L:** 16 regular
* **Body M:** 14 regular
* **Caption:** 12 regular
* **Numerical data (calories, macros):** tabular, semibold 18–24 depending on context

Tone: clean, geometric, approachable.

---

## **4. Spacing & Layout**

Keep everything airy and uncluttered.

* **Screen padding:** 16–20px
* **Card padding:** 16–20px
* **Component vertical spacing:** 12–16px
* **Section gaps:** 24px
* **Charts:** generous margins (16px top/bottom)
* **Touch target minimum:** 44px

Mobile-first layout: designed for **360px minimum width**.

---

## **5. Shapes & Radii**

Rounded, pill-heavy design language.

* **Cards:** 16–24px
* **Buttons:** fully rounded (pill)
* **FABs:** full circle
* **Charts & chips:** 12–16px
* **Input fields:** 16–20px

Overall feel: soft, cushiony, friendly.

---

## **6. Iconography**

* Simple line icons
* Rounded corners and soft curves
* Weight: 1.5–2px
* Colour: mindfulBrown.80 or optimisticGray.70
* Filled icons only for strong states (success, completed, errors)

---

## **7. Visual Hierarchy & Composition Principles**

### **Hierarchy**

* High contrast for important nutritional numbers
* Lower contrast for metadata (time, category)
* Use colour states sparingly to avoid overwhelming the user
* Use green for "within goal", orange for "over", grey for "no data"

### **Composition**

* Use **vertical stacking** for clarity
* **Cards** are the basic container unit
* **Charts** should always be framed inside padded cards
* Never place elements edge-to-edge; maintain breathing room
* Avoid harsh dividers; use subtle gray20 lines or spacing-as-separator

---

## **8. Interaction Feel**

Even though you’re not shipping micro-animations yet, define the feel:

* Soft easing (cubic-bezier curves, not linear)
* 150–250ms transitions
* Gentle opacity fades
* Slight scale on FAB tap (0.97 → 1.0)

The vibe: smooth, reassuring, nothing twitchy.

---

## **9. Component Style Summary (High-Level)**

### **Buttons**

* Pill shape
* Filled states use green or orange
* Ghost buttons use brown or gray outlines
* Label weight: medium
* Icons inline, right-aligned when applicable

### **Cards**

* White or gray10 background
* Rounded 20–24px
* Shadow very soft: 0–4px blur, low opacity
* Clear content grouping inside (title, number, chart)

### **Inputs**

* Rounded
* Soft border (gray30–40)
* Slight inner padding (12–16px)

### **Charts**

* Rounded bar/line caps
* Warm gradient allowed (if subtle)
* Neutral background grid lines
* Big tap targets on interactive charts

---

## **10. Tone & Emotional Feel**

The experience should feel like:

* a supportive daily wellness companion
* calm and not judgemental
* clear without being aggressive
* warm rather than clinical

Visual keywords: **soft, balanced, gentle, modern, delightful**.