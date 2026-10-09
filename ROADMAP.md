# ROADMAP — kerby-web

Status legend: [ ] planned · [~] in progress · [x] done

### Phase 0 — Scaffold & pipeline
- [x] Bun + Astro scaffold, base-path config, deploy workflow (withastro/action@v6)
- [ ] Placeholder live at https://sorawit-w.github.io/kerby-web/ (pends: repo public + Pages enabled — human step)

### Phase 1 — Foundation
- [x] Design tokens (`src/styles/tokens.css`), self-hosted fonts (Fontsource, latin subsets)
- [x] Base layout with semantic landmarks; terminal panel shell (grid-cell stacking)
- [x] Check scripts: `check:contrast`, `check:discipline`

### Phase 2 — Content
- [x] Four sections + footer per copy pack (byte-copy transcripts from kerby README)
- [x] Images copied from kerby repo and optimized to budget
- [x] `check:copy` byte-fidelity gate

### Phase 3 — Animation
- [x] Verdict-cycle animation, reduced-motion static fallback, CLS 0
- [x] Pause control (WCAG 2.2.2) and off-screen pause for the verdict cycle
- [x] Copy buttons on the landing install commands (shared with the swe guide)

### Phase 4 — Meta & polish
- [x] OG image, favicons, meta description, robots.txt
- [ ] Lighthouse ≥ 95 ×4 (mobile) on the deployed URL

### Deferred (do not build)
Custom domain (runbook in README) · analytics · release badge · dark theme · launch posts
