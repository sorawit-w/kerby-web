---
version: alpha
name: kerby
description: Quiet, flat, warm off-white pages with one terracotta mark; on the landing page the dark terminal panel is the only proof the page makes.
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
    fontSize: 17px            # 1.0625rem on a 16px root; 19px (1.1875rem) at 900px and wider; weight not declared (Geist 400 and 500 are the only files loaded)
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

kerby is a gate that stands between an AI agent's action and your project. The page
that sells it has one job: demonstrate before you assert. So the visual identity is
quiet and flat, warm off-white, with a single terracotta mark, and the proof is a real
terminal transcript in the landing page's only dark element. The swe guide pages
(`/rulebooks/swe/`) are Read-mode documentation on the same system; they may use more
than one dark panel, and only for kerby output or swe line formats.

Audience: developers running Claude Code or Codex. The page should feel calm, exact, and
unhurried. Nothing decorative. If something is colored, it is because it carries meaning.

## Colors

Warm neutrals carry the page. Terracotta is the one color, and it is a mark, never a fill.
Every text foreground/background pairing the page uses is enumerated in
`scripts/check-contrast.ts` and must clear WCAG AA (4.5:1); that script is the gate for
contrast. One pairing is decorative and exempt: `border` on `neutral` (the card, footer,
and secondary CTA rule) is held only to a 1.2:1 advisory floor, so a border must never be
the sole carrier of meaning or text. The mark-not-fill rule itself is a design rule held by review, not by a script:
`check:discipline` rejects gradients and shadows, not an accent used as a fill.

- **Primary (#B0532F):** Terracotta. Shipped uses are link color and the CTA hover
  underline. The discipline (CONTEXT.md, accent-as-mark) also permits a keyword color or
  one status dot. Never a button fill, never a background, never a border wash.
- **Secondary (#4A4F5A):** Structure gray. Mono labels, the eyebrow line, the primary CTA
  border, and the terminal panel's border.
- **Tertiary (#E5936B):** Terracotta lightened until it clears AA on the dark panel.
  The BLOCKED and WARNING keywords inside the transcript, in bold. Nowhere else.
- **Neutral (#FAF8F4):** Page background. Never pure white.
- **Surface (#FFFDF9):** Cards and the install block, with a 1px `border` rule. The
  secondary CTA takes the same `border` color, which is what separates it from the primary.
- **Text (#1A1A1A / #3D3A36 / #71695B):** Body, supporting copy, muted footnotes.
- **Panel (#1F2022 / #ECECEE / #B8B8BD):** On the landing page, the terminal demo is the
  single sanctioned dark element. On guide pages, line-format and example panels use the
  same tokens. Panel text, and a dimmed tone for the typed command chrome, the cursor, and
  the `<placeholders>` in a line format.

## Typography

Three families, each with one role. Sizes are declared in rem against the 16px root;
pixel values above are the resolved sizes.

- **Display (h1, h2, tagline):** Schibsted Grotesk Variable. h1 at 3.25rem, 1.15 leading.
  h2 takes the browser default size. Neither heading declares a weight, so both render at
  the browser default bold. The tagline uses the display face at 1.35rem.
- **Body (body-md, body-sm):** Geist at 1.0625rem, 1.6 leading; 1.1875rem (19px) at 900px
  and wider, so lines in the 44rem column stay near 77 characters instead of ~86 (WCAG
  1.4.8 asks for 80 or fewer). Text that must stay above body size on guide pages (h3,
  blockquote, the overview's framing lines) is set in em, so it grows with body. Only the
  400 and 500 files are loaded; the only explicit weight declarations are 500 on CTA labels
  and 700 on card names and panel keywords.
- **Mono (label-sm, mono-panel):** JetBrains Mono Variable. The eyebrow label at 12px
  with 0.08em tracking. The transcript at 14px with 1.55 leading. Keywords inside the
  panel are bold.

## Layout

Single column, 44rem max width, centered. Sections carry 3.5rem vertical and 1.25rem
horizontal padding; vertical padding grows to 4.5rem at 720px and wider. Two sections
override that: the hero is tightened to 2rem top and 1.25rem bottom so the first lines of
the transcript land in the first desktop screenful, and the demo section sits at 0.5rem
top so it reads as the hero's continuation. At 900px and wider the terminal panel steps
out of the column to 48.25rem, centered, so the longest byte-copied verdict line fits
without scrolling sideways. Supporting hero copy narrows to 34rem. Cards go
two-up at 720px. There is no formal spacing scale: the front matter lists the values that recur or set
the section rhythm (0.25, 0.5, 1, 1.25, 1.5, 2, 3.5, 4.5rem), and components also use
0.35, 0.6, 0.75, 1.1, 1.2, and 1.75rem where the layout needed it.

## Shapes

One radius: 6px, on CTAs, cards, the install block, and the terminal panel. No other
radius exists on the page. The one exception is a status dot, which is a circle: the
terracotta "hook-enforced" dot, the hooks-switch knob, and the swimlane marks on the guide pages
(terracotta in the hooks lane, `secondary` elsewhere; a ring means "sometimes"). Borders are
1px; a few guide controls use 1.5px to mark the active state. No shadows, no gradients.

Browser surfaces: keyboard focus is a 2px terracotta outline at 2px offset (a mark, not a
fill). Selected text sits on the `border` color with `on-surface` text.

## Motion

Motion is feedback, never decoration, and nothing moves at rest except the verdict cycle.
Timing tokens live in `tokens.css`: `--motion-feedback` 120ms, `--motion-enter` 160ms,
`--motion-return` 100ms, on one ease-out curve (`--motion-ease`). Only transform and opacity
animate.

- Link arrows (`.arrow`) step 3px toward where they lead on mouse hover: right for →, down
  for ↓. 160ms out, 100ms back. Not on keyboard focus, touch, or reduced motion.
- Copy buttons show a ✓ beside "Copied" that fades in over 120ms; a keyboard press shows it
  at once. At rest the mark takes no space, so the button keeps its width.
- The verdict cycle has a Pause/Play control under the panel (WCAG 2.2.2), styled as quietly
  as a Copy button. It holds its space before the script shows it, so the page does not
  shift. The cycle also waits while the panel is off-screen or the tab is hidden.
- Reduced motion shows final states at once: no cycle (the three verdicts read as a list),
  no Pause control, no arrow movement, no fade.

## Do's and Don'ts

- Do keep terracotta a mark: keyword, underline, or dot. Never a fill.
- Do keep the page flat. `check:discipline` rejects any gradient or shadow in `src/` or `dist/`.
- Do keep exactly one dark element on the landing page, the terminal panel. Guide pages may
  use more, only for kerby output or swe line formats.
- Do add any new fg/bg pairing to `scripts/check-contrast.ts` before shipping it.
- Do write every internal URL base-aware; when Astro's `base` is set, `check:discipline`
  rejects root-absolute paths that escape it, and `check:site` fails any link or #fragment
  that does not resolve, including deep links listed in `scripts/legacy-anchors.json`.
- Don't introduce a second accent, a second radius, or a third body weight.
- Don't stage product output that is not real; transcripts are byte-copied from the kerby README.

## Voice

- Demonstrate before you assert. The transcript comes first; the claim follows it.
- Short declaratives. "Nothing unproven passes." is the register.
- Plain words; keep the tool's own terms (verdict, gate, transcript, BLOCKED).
- Real output only. Anything shown as kerby output is byte-copied from a real session,
  never paraphrased.
- Filled examples say so. A panel that fills swe's line formats with made-up values carries
  the label "example" on the panel itself. Line formats are rendered from anchored quotes
  in `src/data/swe.json`, never retyped.
