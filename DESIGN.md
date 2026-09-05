---
version: alpha
name: kerby
description: Quiet, flat, warm off-white page with one terracotta mark; the dark terminal panel is the only proof the page makes.
colors:
  primary: "#B0532F"        # --accent — terracotta. A MARK, never a fill: keyword color, link underline/hover, one status dot
  secondary: "#4A4F5A"      # --structure — mono labels, eyebrow, CTA borders, panel border
  tertiary: "#E5936B"       # --accent-on-dark — the BLOCKED/WARNING keyword inside the dark panel only
  neutral: "#FAF8F4"        # --bg — page ground, never pure white
  surface: "#FFFDF9"        # --surface — cards, install block
  on-surface: "#1A1A1A"     # --text — body and headings
  text-secondary: "#3D3A36" # --secondary — supporting copy
  text-muted: "#71695B"     # --muted — footnotes, separators
  border: "#E6DFD4"         # --border — card and footer rules
  panel-bg: "#1F2022"       # --panel-bg — the single sanctioned dark element
  panel-text: "#ECECEE"     # --panel-text
  panel-dim: "#B8B8BD"      # --panel-dim — typed command chrome and cursor
typography:
  h1:
    fontFamily: Schibsted Grotesk Variable
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.15
  h2:
    fontFamily: Schibsted Grotesk Variable
    fontSize: 1.5em
    fontWeight: 700
    lineHeight: 1.15
  tagline:
    fontFamily: Schibsted Grotesk Variable
    fontSize: 21.6px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Geist
    fontSize: 15.3px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: JetBrains Mono Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0.08em
  mono-panel:
    fontFamily: JetBrains Mono Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: 0
  sm: 6px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 56px
  "3xl": 72px
---

# kerby — DESIGN.md

Transcribed from the shipped site: `src/styles/tokens.css`, `src/styles/global.css`, and
the component style blocks. This file documents; the CSS is the source of truth. If the
two disagree, fix the CSS or this file, never a downstream consumer.

## Overview

kerby is a gate that stands between an AI agent's action and your project. The page
that sells it has one job: demonstrate before you assert. So the visual identity is
quiet and flat, warm off-white, with a single terracotta mark, and the proof is a real
terminal transcript in the page's only dark element.

Audience: developers running Claude Code or Codex. The page should feel calm, exact, and
unhurried. Nothing decorative. If something is colored, it is because it carries meaning.

## Colors

Warm neutrals carry the page. Terracotta is the one color, and it is a mark, never a fill.
Every foreground/background pairing the page uses is enumerated in
`scripts/check-contrast.ts` and must clear WCAG AA (4.5:1); the script is the gate.

- **Primary (#B0532F):** Terracotta. Appears only as keyword color, link color and
  underline, or one status dot. Never a button fill, never a background, never a border
  wash. `check:discipline` and `check:contrast` hold this floor mechanically.
- **Secondary (#4A4F5A):** Structure gray. Mono labels, the eyebrow line, CTA borders, and
  the terminal panel's border.
- **Tertiary (#E5936B):** Terracotta lightened until it clears AA on the dark panel.
  Used for the BLOCKED and WARNING keywords inside the transcript. Nowhere else.
- **Neutral (#FAF8F4):** Page background. Never pure white.
- **Surface (#FFFDF9):** Cards and the install block, with a 1px `border` rule.
- **Text (#1A1A1A / #3D3A36 / #71695B):** Body, supporting copy, muted footnotes.
- **Panel (#1F2022 / #ECECEE / #B8B8BD):** The terminal demo is the single sanctioned
  dark element. Panel text, and a dimmed tone for the typed command chrome and cursor.

## Typography

Three families, each with one role. Sizes are relative to a 17px body.

- **Display (h1, h2, tagline):** Schibsted Grotesk Variable. h1 at 52px, tight 1.15
  leading. The tagline uses the display face at 21.6px, regular weight.
- **Body (body-md, body-sm):** Geist at 17px, 1.6 leading, weights 400 and 500 only. 500
  is reserved for CTA labels.
- **Mono (label-sm, mono-panel):** JetBrains Mono Variable. The eyebrow label at 12px
  with 0.08em tracking. The transcript at 14px with 1.55 leading. Keywords inside the
  panel are bold.

## Layout

Single column, 44rem max width, centered. Sections carry 3.5rem vertical and 1.25rem
horizontal padding; vertical padding grows to 4.5rem at 720px and wider. Supporting hero
copy narrows further to 34rem. Cards go two-up at 720px. Spacing steps are 0.25rem
multiples with 1rem as the working unit; the hero is deliberately tightened so the first
lines of the transcript land in the first desktop screenful.

## Shapes

One radius: 6px, on CTAs, cards, the install block, and the terminal panel. No other
radius exists on the page. Borders are 1px. No shadows, no gradients.

## Do's and Don'ts

- Do keep terracotta a mark: keyword, underline, or dot. Never a fill.
- Do keep the page flat. `check:discipline` rejects any gradient or shadow in `src/` or `dist/`.
- Do keep exactly one dark element, the terminal panel.
- Do add any new fg/bg pairing to `scripts/check-contrast.ts` before shipping it.
- Do write every internal URL base-aware; root-absolute paths fail `check:discipline`.
- Don't introduce a second accent, a second radius, or a third body weight.
- Don't stage product output that is not real; transcripts are byte-copied from the kerby README.

## Voice

- Demonstrate before you assert. The transcript comes first; the claim follows it.
- Short declaratives. "Nothing unproven passes." is the register.
- Plain words; keep the tool's own terms (verdict, gate, transcript, BLOCKED).
- Real output only. Anything shown as kerby output is byte-copied from a real session,
  never paraphrased.
