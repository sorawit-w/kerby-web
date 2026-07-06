# STATUS — kerby-web

**Position:** Implementation complete and merged to `main` via PR #1 (squash).
Live deploy pending Kiang's repo-settings flip (account settings reserved to him).

## Realized vs Expected (graded plan, kerby §7)
- P0 pipeline — AC-local ✅ (build green, base-path correct); AC-remote ⏳ (Pages off)
- P1 foundation — ✅ 14/14 contrast pairings; fonts 110.8KB ≤120KB
- P2 content — ✅ byte-copy 0 diffs @ kerby `86612ea`; images 240.6KB ≤250KB
- P3 animation — ✅ CLS 0 (measured); reduced-motion static; keyword color holds
- P4 meta — ✅ html-validate clean, budgets met, OG/favicons/robots; Lighthouse ⏳ (needs live URL)
- **outcome: match** on every agent-closable AC. AC-remote + Lighthouse deferred to
  the deploy, exactly as the AC-local/AC-remote split in the plan predicted.

## Review
7 rounds of local `codex review --base main`; every finding real, all resolved and
merged. Final review clean.

## Remaining (Kiang — account settings, reserved)
1. Repo → **Public** (this is the launch moment; D5 launch/distribution is yours)
2. Settings → **Pages → Source: GitHub Actions**
3. Re-run the latest `Deploy to GitHub Pages` workflow (or push any commit)
Then the site is live at https://sorawit-w.github.io/kerby-web/ and P4's Lighthouse
AC can run. Offered: I'll do the post-flip verification (zero-404, Lighthouse ≥95×4)
when you're back.

## Notes
- LICENSE ships in the repo, so GitHub will detect MIT once main is public.
- The first deploy run before the flip fails at `deploy-pages` (Pages not enabled) —
  expected, not a code failure.
