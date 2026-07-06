# ROADMAP — kerby-web

Status legend: [ ] planned · [~] in progress · [x] done

### Phase 0 — Scaffold & pipeline
- [~] Bun + Astro scaffold, base-path config, deploy workflow (withastro/action@v6)
- [ ] Placeholder live at https://sorawit-w.github.io/kerby-web/ (pends: repo public + Pages enabled — human step)

### Phase 1 — Foundation
- [ ] Design tokens (`src/styles/tokens.css`), self-hosted fonts (Fontsource, latin subsets)
- [ ] Base layout with semantic landmarks; terminal panel shell (grid-cell stacking)
- [ ] Check scripts: `check:contrast`, `check:discipline`

### Phase 2 — Content
- [ ] Four sections + footer per copy pack (byte-copy transcripts from kerby README)
- [ ] Images copied from kerby repo and optimized to budget
- [ ] `check:copy` byte-fidelity gate

### Phase 3 — Animation
- [ ] Verdict-cycle animation (the page's only script), reduced-motion static fallback, CLS 0

### Phase 4 — Meta & polish
- [ ] OG image, favicons, meta description, robots.txt
- [ ] Lighthouse ≥ 95 ×4 (mobile) on the deployed URL

### Deferred (do not build)
Custom domain (runbook in README) · analytics · release badge · dark theme · launch posts
