# CONTEXT — kerby-web domain glossary

Terms used in this repo's code, checks, and prose. Use these words consistently.

- **verdict** — kerby's binary output for an action: it passes, or it is
  `BLOCKED`/`WARNING`-held. The three demo transcripts on the page are real
  verdicts, byte-copied from the kerby README.
- **transcript** — one verdict block as it appeared in a real session; the
  unit `check:copy` byte-compares against the source README.
- **byte-copy (`[bc]`)** — a string that must match its source
  character-for-character; enforced by `scripts/check-copy.ts`, never edited
  in place.
- **the panel** — the terminal demo (`src/components/Demo.astro`), the page's
  single sanctioned dark element; `aria-hidden` visuals + sr-only accessible
  copy.
- **animation chrome** — content that exists only inside the aria-hidden
  panel to stage the verdict (the typed `$ command` lines); never asserted as
  product output, never byte-copy checked.
- **pause control** — the Pause/Play button under the panel (WCAG 2.2.2). It
  sits outside the aria-hidden panel and outside `.sr-transcripts`, and is
  hidden under reduced motion, where nothing moves.
- **motion tokens** — `--motion-feedback`, `--motion-enter`,
  `--motion-return`, `--motion-ease` in `tokens.css`; the only timings for
  hover and copy feedback. See DESIGN.md § Motion.
- **legacy anchor** — an `id` that existing deep links point at, listed in
  `scripts/legacy-anchors.json`; `check:site` fails if one disappears.
- **accent-as-mark** — the design discipline: terracotta appears only as
  keyword color, link underline/hover, or one status dot — never a fill;
  `check:contrast` + `check:discipline` hold the floor mechanically.
- **base path** — `/kerby-web` (GitHub Pages project page); every internal
  URL must be base-aware via imports or `import.meta.env.BASE_URL`.
