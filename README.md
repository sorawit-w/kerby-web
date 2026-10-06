# kerby-web

The website and SWE field guide for [kerby](https://github.com/sorawit-w/kerby) — seven static pages,
built with Bun + Astro, deployed to GitHub Pages at
<https://kerby.sorawit.com/>.

## Develop

```
bun install
bun run dev      # local dev server
bun run build    # production build → dist/
bun run check    # build, regression tests, source, link and design checks
```

Deploys run through GitHub Actions only (`.github/workflows/deploy.yml`) on push
to `main`.

This repo is developed under the [kerby](https://github.com/sorawit-w/kerby)
guardrails. The hook bindings are per-machine (they point into your local kerby
install), so they live in `.claude/settings.local.json` (gitignored) rather than
being committed. To set them up on your machine, install kerby and run
`/kerby install`.

## Custom-domain runbook (when a domain is bought)

1. Add a CNAME DNS record pointing the domain → `sorawit-w.github.io`.
2. Set the custom domain in the repo's Pages settings (writes the `CNAME` file).
3. In `astro.config.mjs`: set `site` to the new domain and drop `base`.
4. Enable "Enforce HTTPS" in Pages settings.

## Guarded-path design

The homepage and all SWE guide pages explain conditions, evidence, responsibility,
and what happens when a condition is unmet. The settings bug walkthrough is an
explicitly illustrative story, not a recorded run. `DESIGN.md` defines the visual
contract. `src/data/bug-walkthrough.ts` supplies both the homepage and walkthrough.

`KERBY_REF` in the deploy workflow pins the source used by transcript and SWE
checks. Set `KERBY_REPO` to a local Kerby checkout containing that commit. PR CI
checks out the pin and fails when source verification cannot run. The weekly drift
job compares against upstream without changing the pin automatically.

`check:site` checks the seven routes, internal links and preserved fragment IDs
listed in `scripts/legacy-anchors.json`, plus illustrative labels and source links.
For a project-base check: `bun run build -- --base /kerby-web`, then
`SITE_BASE=/kerby-web bun run check:site`. Rebuild normally afterward.
