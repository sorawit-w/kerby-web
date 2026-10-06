---
version: alpha
name: kerby
description: A guarded path to completion. Warm editorial pages make conditions, evidence, responsibility and next actions visible.
colors:
  primary: "#B0532F"        # --accent — terracotta. A mark, never a fill. Shipped uses: link color, CTA hover underline
  secondary: "#4A4F5A"      # --structure — mono labels, eyebrow, the primary CTA border, panel border
  tertiary: "#E5936B"       # --accent-on-dark — the BLOCKED/WARNING keyword inside the dark panel; the only keyword color
  neutral: "#FAF8F4"        # --bg — page ground, never pure white
  surface: "#FFFDF9"        # --surface — cards, install block
  on-surface: "#1A1A1A"     # --text — body and headings
  text-secondary: "#3D3A36" # --secondary — supporting copy
  text-muted: "#71695B"     # --muted — footnotes, separators
  border: "#E6DFD4"         # --border — card and footer rules, the secondary CTA border
  panel-bg: "#1F2022"       # --panel-bg — the landing terminal panel; on guide pages, swe line-format panels
  panel-text: "#ECECEE"     # --panel-text
  panel-dim: "#B8B8BD"      # --panel-dim — typed command chrome and cursor
typography:
  h1:
    fontFamily: Schibsted Grotesk Variable
    fontSize: 52px            # 3.25rem; weight is not declared (browser default bold)
    lineHeight: 1.15
  h2:
    fontFamily: Schibsted Grotesk Variable
    lineHeight: 1.15          # size and weight are not declared (browser defaults)
  tagline:
    fontFamily: Schibsted Grotesk Variable
    fontSize: 21.6px          # 1.35rem
    lineHeight: 1.6
  body-md:
    fontFamily: Geist
    fontSize: 17px            # 1.0625rem on a 16px root; weight not declared (Geist 400 and 500 are the only files loaded)
    lineHeight: 1.6
  body-sm:
    fontFamily: Geist
    fontSize: 14.4px          # 0.9rem; components also use 0.85rem (13.6px) and 0.95rem (15.2px)
    lineHeight: 1.6
  label-sm:
    fontFamily: JetBrains Mono Variable
    fontSize: 12px            # 0.75rem
    lineHeight: 1.6
    letterSpacing: 0.08em
  mono-panel:
    fontFamily: JetBrains Mono Variable
    fontSize: 14px            # 0.875rem
    lineHeight: 1.55
rounded:
  sm: 6px                     # the only radius declared anywhere
spacing:                    # anchors observed in the CSS; see Layout for the off-scale values
  xs: 4px
  sm: 8px
  md: 16px
  md-lg: 20px               # 1.25rem — the most-used gap and the horizontal section padding
  lg: 24px
  xl: 32px
  "2xl": 56px
  "3xl": 72px
---

# kerby — DESIGN.md

Transcribed from the shipped site: `src/styles/tokens.css`, `src/styles/global.css`, and
the component style blocks. The YAML front matter is the token authority for UI work;
the shipped CSS (`tokens.css` for colors and families, `global.css` and the component
styles for sizes, spacing, and radius) implements it. If the two disagree, either fix the CSS to match or amend this
file on purpose, never a downstream consumer.

## Overview

The site explains a guarded path to completion for SWE adopters. A reader should understand how their agent works differently, what permits advancement, who checks a condition, and what happens when it is unmet. The current head-and-neck pixel mascot remains the guardian identity; the interface explains the conditions.

The approved redesign replaces the previous transcript-first single-column design. The homepage introduces the method through one illustrative settings bug; all guide pages use the same responsibility and checkpoint language.

## Layout and hierarchy

- Site width: 76rem including 2rem horizontal padding (1.25rem below 600px).
- Reading measure: 65ch; wide diagrams and tables can use the available column.
- Homepage split hero: desktop two columns, stacked below 960px.
- Guide shell: 12rem left navigation rail, 4rem gap, flexible reading column; in-flow navigation below 960px.
- Guide section dividers and lifecycle step dividers share 3rem of vertical padding. Inset checkpoint dividers share a 1.5rem gap before their first heading or label, with no additional first-child top margin. Section separators use pale borders; checkpoint boundaries use a 1px slate line. These rules live in `guide.css`, not page-local overrides.
- Facts nested inside a step or section have no divider. Use medium-weight labels, aligned descriptions, and clear space between pairs; stack each label above its description on mobile. The shared `.facts` pattern provides this hierarchy without browser-default indentation.
- Checkpoints: condition, agent action, evidence, unmet-condition response and linked rulebook sources.
- Workflow paths become vertical on narrow screens. Setup is distinguished from task execution.
- Fluid homepage heading 2.5–4.6rem; guide heading 2.25–3.25rem. Body 17px / 1.6. Explicit hierarchy comes from space, type and rules.

## Color and shape

The front-matter palette remains canonical. Warm stone and charcoal dominate; terracotta is a mark, never a button or block fill. Slate boundary lines carry structure. Pale borders are decorative only. Use no gradients or shadows. Radius remains 6px. Dark panels are reserved for genuine transcripts or explicitly labeled source-format examples; no dark-panel count requirement remains.

Normal text pairings must pass AA 4.5:1; meaningful non-text indicators and focus boundaries must pass 3:1. A state always has a written label. Accent usage stays restrained rather than washing every checkpoint in color.

## Typography and imagery

Schibsted Grotesk for headings, Geist for body, JetBrains Mono for labels and code. Keep current font assets and their existing budget. Use the original mascot only: portrait in navigation and generated browser icons, original portrait at moderate size in the homepage introduction. No generated replacements. Preserve intrinsic image sizes to prevent layout shifts.

## Responsibility and state vocabulary

- **Agent instruction:** the agent is instructed to satisfy the condition; a script does not certify the result.
- **Hook check:** a supported, installed hook checks a specific action. Its result can block or warn; describe which.
- **Your decision:** a person supplies intent, review or approval where required.
- **Held:** editorial progress state for missing evidence; never present it as a captured output unless it is one.
- **Blocked / Warning:** preserve literal output when quoting; do not imply a warning always blocks.
- **Condition satisfied:** scoped to the named condition, not proof that the entire task is correct.

## Interaction and accessibility

Genuine console transcripts animate once when an open panel enters the viewport, and again when reopened. Scrolling away finishes the output rather than looping or replaying on every scroll. Keep replay and show-full-output controls; reduced motion keeps static output. Highlight status prefixes BLOCKED: and WARNING: with the AA-safe panel accent. Structured field labels (including INTENT:) use consistent medium-weight neutral text, with the colon included. Separate logical format entries with spacing; preserve their source text and newlines. Use native links, details, checkboxes and buttons. All substantive content is available without JavaScript. Selectable examples honor URL fragments; reduced motion disables movement, not functionality. Keyboard focus is a 2px terracotta outline with adequate offset. Sticky navigation must not obscure jump targets. Tables and code can scroll within their own bounds, never force page overflow.

Pointer-hover arrows move 3px on primary and read-next links (160ms ease-out, 100ms return). Console chevrons rotate to reflect disclosure state with the same timing. Copy success fades in a checkmark over 120ms; its text remains explicit and its width stable. Example selectors update immediately with a 120ms opacity-only entrance for pointer input. Keyboard actions and reduced motion show final states immediately; repeated actions replace rather than queue animations. Timing tokens live in `tokens.css`.

## Content provenance

Facts, inventories and formats come from the pinned source. Explanations are editorial and linked to supporting sources. Invented examples say “illustrative” at the point of use and claim no actual execution results. Real transcripts remain byte-identical, selected by stable data-transcript IDs. Checks must not freeze marketing slogans.

## Validation

Keep check:contrast, check:discipline, check:copy, check:swe and check:site passing. Fonts remain within 120KB of Latin transfer and shipped images within 250KB. Every internal link uses the base-aware URL helper. Verify all seven routes on mobile/tablet/desktop, keyboard access, no-JavaScript output, reduced motion and preserved anchors.
