# STATUS — kerby-web

**Position:** P4 (meta & polish) complete on `feature/site-v1`; PR pending.
**Progress:** P0–P4 done · AC-remote (live deploy) blocked.

## Recent completions
- P0 scaffold + pipeline — 596565d
- P1 tokens/fonts/layout + check gates — 3b66f96
- P2 content + byte-copy gate — 2e7601b
- P3 verdict animation, CLS 0 — 0993a26
- P4 meta/OG/favicons/robots + html-validate — (HEAD)

## Next up
1. Open PR feature/site-v1 → main; codex review per user's PR workflow
2. AC-remote: needs Kiang — repo public, MIT LICENSE, Pages → GitHub Actions
3. After merge + flip: verify live URL, run Lighthouse mobile (≥95 ×4)
4. Kiang eyeballs: OG crop (public/og.jpg), hero crop, --accent-on-dark hue

## Blockers
- AC-remote + Lighthouse hard-gated on the repo flip (owner: Kiang)
