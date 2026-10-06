# Guarded-path redesign review

The site explains how SWE changes an agent’s work through conditions, evidence, responsibility, and an explicit response when a condition is unmet. The current mascot, stack, URLs, legacy anchors, and pinned rulebook semantics remain.

Source revision: `3c750e205dda90fc242c6063a1323ce8ff94bc29` (SWE 2.13.2, Kerby 10.2.2).

## Completed phases

- [x] Route/anchor inventory and typed illustrative story with anchored sources.
- [x] Shared shell, navigation, checkpoint vocabulary, responsive design system.
- [x] Homepage and complete illustrative settings-persistence walkthrough.
- [x] All five SWE guide pages redesigned without dropping reference coverage.
- [x] Pinned-source PR validation, regression cases, browser review, and screenshots.

## Automated evidence

`bun run check` passes: eight regression tests (19 assertions), seven built routes, internal links/fragments, legacy anchors, illustrative story/source references, contrast, flat-design discipline, asset budgets, three byte-exact transcripts, and 59 synchronized source anchors. Source checks executed against the pinned revision.

A separate build with `--base /kerby-web` passes site and transcript checks. PR CI repeats both configurations and requires available source data. Main/manual deployment triggers remain unchanged. Independent Gitleaks review of the implementation commit found no leaks.

## Browser evidence and limits

- All seven routes inspected at 375, 768, and 1440 pixels; no page-level horizontal overflow, broken images, or duplicate main headings found. Lifecycle also checked at 320 pixels.
- Final desktop/mobile screenshots below reflect the production build.
- Keyboard task selection, example configuration, copy feedback, visible focus, and horizontally scrollable tables checked. Clipboard feedback succeeded; clipboard bytes were not independently verified through the browser bridge.
- Deep links select the relevant enhanced example and place lifecycle content below the sticky navigation.
- Script-blocking CSP fixtures expose all overview/workflow examples and the complete walkthrough without JavaScript.
- Forced reduced-motion fixtures retain selection while disabling animation. This is a fixture check, not a native operating-system preference test.
- Doubled root text size checked on home, overview, and walkthrough; a small overview overflow was corrected. Native browser 200% zoom was not directly exercised.
- Semantic headings, regions, labels, and reading order inspected. A spoken screen-reader session and a comprehension study were not performed.

## Screenshots

| Page | Desktop (1440px) | Mobile (375px) |
|---|---|---|
| Home | [Desktop](redesign-screenshots/home-desktop.png) | [Mobile](redesign-screenshots/home-mobile.png) |
| SWE overview | [Desktop](redesign-screenshots/overview-desktop.png) | [Mobile](redesign-screenshots/overview-mobile.png) |
| Lifecycle | [Desktop](redesign-screenshots/lifecycle-desktop.png) | [Mobile](redesign-screenshots/lifecycle-mobile.png) |
| Workflows | [Desktop](redesign-screenshots/workflows-desktop.png) | [Mobile](redesign-screenshots/workflows-mobile.png) |
| Bug walkthrough | [Desktop](redesign-screenshots/walkthrough-desktop.png) | [Mobile](redesign-screenshots/walkthrough-mobile.png) |
| Hooks | [Desktop](redesign-screenshots/hooks-desktop.png) | [Mobile](redesign-screenshots/hooks-mobile.png) |
| Reference | [Desktop](redesign-screenshots/reference-desktop.png) | [Mobile](redesign-screenshots/reference-mobile.png) |

## Manual review

Run `bun run dev`. Follow “Follow a bug fix” from the homepage. At each checkpoint, identify the condition, evidence, responsibility, and response to failure. In Verify, follow the held branch back to investigation. Confirm the report remains explicitly illustrative.

Review the guide’s hooks table and genuine transcripts: a WARNING prefix in the secret-scan transcript still accompanies a blocking pre-commit result. Example configuration describes an example, never a detected machine state. Routine bug work does not introduce an invented approval pause.

Use keyboard navigation and native 200% zoom, reduced-motion preferences, and a screen reader for an additional assistive-technology review. These are remaining manual checks, not claimed automated coverage.

## Intent and outcome

INTENT: code does transcript-first promotion with broad enforcement claims; the task expects a guarded path with explicit conditions and responsibilities; the spec in DESIGN.md describes the old transcript-first design.

The approved redesign replaces that old design premise. No engine or SWE rule changes, new mascot artwork, or live execution claims were introduced. Rollback is a revert of the single redesign PR; no migration is required.

## Review refinement: console and mascot

Console output now offers opt-in word-by-word replay with an immediate “Show full output” control. Reduced motion leaves the complete static transcript. BLOCKED, WARNING, and INTENT use the existing AA-safe panel accent, including source-format and illustrative intent lines. Browser keyboard checks confirmed replay/stop behavior and rendered keyword color; the full check suite passes with transcript fidelity intact.

The shared header and browser/touch icons now derive from the existing portrait. Retired full-body icon assets were removed. The original screenshot gallery above predates this small refinement.

## Micro-interaction refinement

Primary and read-next links now have restrained pointer-hover arrow movement. Console disclosure chevrons reflect open/closed state. Copy success retains explicit feedback and adds a checkmark without changing the button width. Workflow examples use an opacity-only entrance for pointer input; keyboard selection is immediate. Shared timing tokens and reduced-motion handling keep these behaviors consistent.

The full check suite passes. Browser checks verified keyboard disclosure state, stable copy width before/after success, immediate keyboard example selection, rapid successive example selection, and no overflow at 375px. The existing source transcripts remain byte-identical.

## Supplied mockup reconciliation

Rebuilt the homepage around the user's supplied reference: split hero, editorial scenario quote, connected six-stage path with a return branch, verification detail, compact responsibility columns, and a small SWE call to action. The shared footer is now one compact desktop row with the original portrait, tagline, and links; mobile stacks the links below the identity. Required source transcripts, installation commands, and secondary rulebook information remain available.

Refreshed the homepage desktop, hero, and mobile screenshots. Guide screenshots above predate this shared header/footer refinement. Production-browser review covered desktop and mobile homepage composition, the shared footer on the SWE overview, and overflow checks at 320px, 375px, and 768px. Full `bun run check` passes, including pinned source validation and transcript fidelity.

## Guardian positioning

The homepage now leads with Kerby's repository-defined identity: “The gate guardian for agentic work.” A genuine SWE force-push refusal explains condition, check, and consequence alongside the hero. Its output excerpt shares the same transcript data as the existing source-validated consoles. The illustrative settings-bug narrative follows as “See it with SWE”; rulebooks remain the mechanism rather than the headline benefit.

Updated homepage metadata and design guidance. Full checks pass with pinned-source validation executed; production screenshots reviewed at 1440px and 375px, with no mobile page overflow. Refreshed homepage screenshots accompany this revision.


## Compact hero example

Replaced the hero's condition/check/consequence definition list with a short command-to-blocked-outcome sequence. The panel is explicitly labeled as one SWE Git-hook example and states the installation requirement. Editorial explanation uses ordinary page styling; the exact animated transcripts remain in the linked hook-check section. Updated homepage screenshots. Full checks pass; desktop visual review and 375px overflow check completed.

## Visual designer pass on the hero example

Two independent design agents identified the rail/arrow/divider collision and inconsistent text insets. Replaced that construction with one light outlined frame and two consistently padded rows, plus an SVG stop icon and explicit “Blocked before execution” label. Installation context stays outside the frame. A follow-up desktop screenshot review found no material visual issue; mobile rendering was also inspected at 375px with no horizontal overflow. Full checks pass. Homepage screenshots refreshed.

## Subtractive homepage revision

Reduced the homepage to four sections: guardian introduction with a moderate original portrait, genuine hook transcripts, a compact SWE preview, and installation. Removed the duplicate hero hook example and standalone responsibility/verification explanations from the homepage; the full guides and walkthrough retain that detail. The SWE preview links into the same six stages, rendered in two compact rows on mobile. Secondary rulebook content remains in a native disclosure. Console transcripts now wrap on narrow screens; their exact text and animation behavior remain intact.

Full `bun run check` passes, including pinned source validation. Production rendering inspected at 1440px and 375px; no page overflow at 375px. Updated homepage screenshots show this revision. Existing guide screenshots and guide content are unaffected by this pass. The PR remains open for review; the live original is unchanged.
