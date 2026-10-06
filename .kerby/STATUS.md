# STATUS — kerby-web

**Position:** The swe rulebook guide is live under /rulebooks/swe/ (overview, lifecycle,
workflows, hooks, reference) and the landing swe card links to it. Work on the guide is
done; nothing is open.

## What keeps it true
- `bun run check` runs check:swe: every number, id, tier, command and quoted line on the
  guide is read from kerby at the pinned KERBY_REF in deploy.yml, and fails if one drifts.
- drift.yml runs weekly against kerby main and opens one `kerby-drift` issue when something
  the site shows has changed. Moving the pin stays a human decision.

## Next up (none started)
- A recorded real `/kerby status` session, to replace the labeled status format.
- Copy buttons on the landing page Install block.
- A guide for the skill-authoring rulebook (its card says "Guide coming").
- Reading test of the overview with 2–3 readers whose first language is not English.

## Notes
- kerby upstream still disagrees with itself on retry figures and the threat-model table;
  logged, not fixed.
- Local branches from the merged guide work remain; they were squash-merged, so git does
  not mark them merged.
