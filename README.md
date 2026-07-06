# kerby-web

The promo page for [kerby](https://github.com/sorawit-w/kerby) — one static page,
built with Bun + Astro, deployed to GitHub Pages at
<https://sorawit-w.github.io/kerby-web/>.

## Develop

```
bun install
bun run dev      # local dev server
bun run build    # production build → dist/
bun run check    # copy / contrast / discipline gates
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
