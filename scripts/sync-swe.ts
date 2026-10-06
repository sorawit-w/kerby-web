// swe data gate. Reads the swe rulebook from the kerby repo AT THE PINNED
// COMMIT (never the checkout's HEAD) and builds src/data/swe.json — the only
// place the guide pages get ids, tiers, versions, numbers and line formats.
//
//   bun scripts/sync-swe.ts           write src/data/swe.json
//   bun scripts/sync-swe.ts --check   rebuild in memory, fail on any difference
//   … --check --drift                 same, ignoring source_sha / kerby_version
//
// The pin: $KERBY_REF if set (CI and drift.yml set it), else the KERBY_REF:
// line in .github/workflows/deploy.yml — one pin for check:copy and this.
// The repo: $KERBY_REPO, else ~/projects/kerby (same default as check-copy).
// --check fails when source is missing in CI; local missing-source checks are explicit skips.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CHECK = process.argv.includes('--check');
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'src/data/swe.json');
const KERBY_REPO = process.env.KERBY_REPO || join(homedir(), 'projects/kerby');
const SWE = 'skills/kerby/rulebooks/swe';
const BASE = 'skills/kerby/rulebooks/base';

// Every quote must appear in its file at the pin (blockquote markers dropped,
// whitespace collapsed). Pages render these strings; they never retype them.
// Add an anchor here when a page needs a new number, format or quotation.
const ANCHORS: { id: string; file: string; quote: string }[] = [
  { id: 'walkthrough-reproduce', file: `${SWE}/workflows/bugfix.md`, quote: 'Document the reproduction: what you did, what happened, what should have happened.' },
  { id: 'walkthrough-regression', file: `${SWE}/workflows/bugfix.md`, quote: 'Write a failing test that captures the bug (the test MUST fail before your fix)' },
  { id: 'walkthrough-finish', file: `${SWE}/workflows/bugfix.md`, quote: '**Manual verification instructions provided**' },
  { id: 'format-complexity', file: `${SWE}/BOOTSTRAP.md`, quote: 'complexity: <N> (trigger: <≤8-word reason>) → route: <investigate | new-project | adopt-existing | feature | bugfix | quick-task>' },
  { id: 'format-rung', file: `${SWE}/BOOTSTRAP.md`, quote: 'rung: <N> — <≤8-word reason>' },
  { id: 'format-plan', file: `${SWE}/BOOTSTRAP.md`, quote: 'plan: <files> — <change> — <check>' },
  { id: 'format-plan-waived', file: `${SWE}/BOOTSTRAP.md`, quote: 'plan: <files> — <change> — <check> (full plan waived: user opt-out "<quoted phrase>")' },
  { id: 'format-intent', file: `${SWE}/references/intent-gate.md`, quote: 'INTENT: code does <X>; the failing check/task expects <Y>; the spec (README/docs/docstring) says <Z>' },
  { id: 'format-skipped', file: `${SWE}/BOOTSTRAP.md`, quote: 'skipped: <what you did not build> — add when <trigger>' },
  { id: 'skipped-none', file: `${SWE}/BOOTSTRAP.md`, quote: '`skipped: none`' },
  { id: 'format-outcome', file: `${SWE}/BOOTSTRAP.md`, quote: 'outcome: <case> — match | mismatch | not exercised' },
  { id: 'format-smallest', file: `${SWE}/workflows/feature.md`, quote: 'smallest: <the least you can build that fully satisfies the request>' },
  { id: 'format-deferring', file: `${SWE}/workflows/feature.md`, quote: 'deferring: <items, comma-separated> | none' },
  { id: 'format-worktree', file: `${SWE}/BOOTSTRAP.md`, quote: 'creating worktree at .worktrees/<branch-name> — trigger: <which>' },
  { id: 'plan-threshold', file: `${SWE}/BOOTSTRAP.md`, quote: 'use the default **4**' },
  { id: 'approval-grade', file: `${SWE}/BOOTSTRAP.md`, quote: '**Grade ≥ 7:** after the plan, **STOP and get user approval**' },
  { id: 'protected-branches', file: `${SWE}/BOOTSTRAP.md`, quote: 'main, master, dev, develop, staging, release/*, trunk' },
  { id: 'ladder-low', file: `${SWE}/workflows/feature.md`, quote: '| Low (1–3) | Single file, config, typo | Handle directly. Self-review when done. |' },
  { id: 'ladder-med', file: `${SWE}/workflows/feature.md`, quote: '| Med (4–6) | Multiple related files, moderate logic | **Plan + Expected Outcomes** (below), then implement. Self-check when done. |' },
  { id: 'ladder-high', file: `${SWE}/workflows/feature.md`, quote: '| High (7–8) | Multi-file, design decisions, new patterns | **Plan + Expected Outcomes, get user approval before starting.** QA sub-agent when done. |' },
  { id: 'ladder-critical', file: `${SWE}/workflows/feature.md`, quote: '| Critical (9–10) | Cross-cutting, architectural, breaking | Plan + approval + staged rollout. QA sub-agent when done. |' },
  { id: 'gates-quick', file: `${SWE}/references/quality-gates.md`, quote: '| **Quick** | Single-file edits, config, docs, comments, formatting — none of which any gate reads | `{lint_command}` only |' },
  { id: 'gates-standard', file: `${SWE}/references/quality-gates.md`, quote: '| **Standard** | Multi-file changes, logic changes, new functions | `{build_command} && {lint_command} && {test_command}` |' },
  { id: 'gates-full', file: `${SWE}/references/quality-gates.md`, quote: '| **Full** | Cross-cutting changes, dependency updates, public API changes | Standard + E2E (if applicable) + manual spot-check |' },
  { id: 'warning-opinionated', file: `${SWE}/README.md`, quote: 'This rulebook is **deliberately, aggressively opinionated.**' },
  { id: 'warning-token-cost', file: `${SWE}/README.md`, quote: 'there is a real input-token cost' },
  { id: 'format-rulebook', file: 'skills/kerby/SKILL.md', quote: 'rulebook: <id>@<version> (<origin>) — source: explicit | pinned | intent | detected | chosen' },
  { id: 'prime-directive', file: `${SWE}/BOOTSTRAP.md`, quote: 'Clarity over cleverness. Safety over speed. Never leave the repo broken.' },
  { id: 'iron-law', file: `${SWE}/BOOTSTRAP.md`, quote: 'No completion claims without fresh evidence.' },
  { id: 'do-not-merge', file: `${SWE}/BOOTSTRAP.md`, quote: 'Do NOT merge — leave for human review' },
  { id: 'commit-types', file: `${SWE}/BOOTSTRAP.md`, quote: 'one of `feat` `fix` `chore` `docs` `refactor` `test` `perf` `build` `ci`' },
  { id: 'quick-task-fit', file: `${SWE}/BOOTSTRAP.md`, quote: 'no new logic/refactor, ≤~50 LOC, no schema/contract changes' },
  { id: 'high-stakes-migrations', file: `${SWE}/BOOTSTRAP.md`, quote: '**Schema migrations:**' },
  { id: 'high-stakes-auth', file: `${SWE}/BOOTSTRAP.md`, quote: '**Authentication / authorization:**' },
  { id: 'high-stakes-payments', file: `${SWE}/BOOTSTRAP.md`, quote: '**Payments / billing:**' },
  { id: 'high-stakes-infra', file: `${SWE}/BOOTSTRAP.md`, quote: '**Infrastructure:**' },
  { id: 'high-stakes-ci', file: `${SWE}/BOOTSTRAP.md`, quote: '**CI/CD:**' },
  { id: 'high-stakes-traffic', file: `${SWE}/BOOTSTRAP.md`, quote: '**Production-traffic-shaping values:**' },
  { id: 'recent-commits', file: `${SWE}/BOOTSTRAP.md`, quote: '`git log --oneline -20`' },
  { id: 'costly-new-files', file: `${SWE}/BOOTSTRAP.md`, quote: 'Creating >3 new files' },
  { id: 'costly-edited-files', file: `${SWE}/BOOTSTRAP.md`, quote: 'Modifying >5 existing files in one pass' },
  // Commands a reader copies into their agent, exactly as kerby's READMEs
  // write them. The page shows the part before " # "; the comment stays here.
  { id: 'install-marketplace', file: 'README.md', quote: '/plugin marketplace add sorawit-w/kerby' },
  { id: 'install-plugin', file: 'README.md', quote: '/plugin install kerby@kerby' },
  { id: 'install-cli', file: 'README.md', quote: 'npx skills add sorawit-w/kerby' },
  { id: 'cmd-hooks', file: 'README.md', quote: '/kerby hooks # read-only: what `install` would register, and what is bound now' },
  { id: 'cmd-load', file: 'skills/kerby/README.md', quote: '/kerby load # explicit' },
  { id: 'cmd-reload', file: 'skills/kerby/README.md', quote: "/kerby reload # after compaction, if the hook's re-injected block is missing" },
  { id: 'cmd-status', file: 'skills/kerby/README.md', quote: '/kerby status # check whether rules are still loaded' },
  { id: 'cmd-install', file: 'skills/kerby/README.md', quote: '/kerby install # persistent per-project setup' },
  { id: 'cmd-prepare', file: 'skills/kerby/README.md', quote: '/kerby swe prepare # onboard an existing repo (populate context)' },
  { id: 'cmd-audit', file: 'skills/kerby/README.md', quote: '/kerby swe audit # conformance audit → HTML report (incremental)' },
  // How kerby (the engine) treats swe: the status panel format, the trust
  // prompt, fail-closed loading, and real manifest blocks the guide quotes.
  { id: 'status-loaded', file: 'skills/kerby/SKILL.md', quote: '**kerby: loaded.** Detected `<id list>` markers in current context.' },
  { id: 'status-row', file: 'skills/kerby/SKILL.md', quote: '<id> — <kind> — declared: <enforcement> — effective: <enforcement>' },
  { id: 'status-unregistered', file: 'skills/kerby/SKILL.md', quote: 'not registered (behavioral only)' },
  { id: 'trust-prompt', file: 'skills/kerby/SKILL.md', quote: 'Approve and pin? [y/n]' },
  { id: 'fail-closed', file: 'skills/kerby/SKILL.md', quote: 'If the loader cannot complete — validator crash, invalid manifest, unreadable declared file — the rules are NOT loaded' },
  {
    id: 'toml-destructive-git',
    file: `${SWE}/rulebook.toml`,
    quote: 'id = "destructive-git"\nkind = "code"\nneeds = ["branch"]\nenforcement = "hard"\nenforcer = "hooks/protect-git.sh"\nevent = "PreToolUse"\nmatcher = "Bash"\nseverity = "block"\nfloor = true',
  },
  {
    id: 'toml-intent-gate',
    file: `${SWE}/rulebook.toml`,
    quote: 'id = "intent-gate-on-behavior-change"\nkind = "prose"\nbody = "references/intent-gate.md"\nenforcement = "behavioral"\nseverity = "block"\ntoken_cost = "low"',
  },
  { id: 'toml-audit', file: `${SWE}/rulebook.toml`, quote: 'name = "audit"\nbody = "commands/audit.md"' },
];

function skip(why: string): never {
  if (process.env.CI || process.env.REQUIRE_KERBY_SOURCE === '1') {
    console.error(`check:swe — FAILED: ${why} Source validation is required.`);
    process.exit(1);
  }
  console.error(`check:swe — SKIPPED: ${why}\n  Set KERBY_REPO to a kerby checkout that has the pinned commit to run this gate.`);
  process.exit(0);
}

function pinnedRef(): string {
  if (process.env.KERBY_REF) return process.env.KERBY_REF;
  const yml = readFileSync(join(ROOT, '.github/workflows/deploy.yml'), 'utf8');
  const m = yml.match(/^\s*KERBY_REF:\s*([0-9a-f]{7,40})\s*$/m);
  if (!m) throw new Error('KERBY_REF line not found in .github/workflows/deploy.yml');
  return m[1];
}

const git = (...args: string[]) =>
  execFileSync('git', ['-C', KERBY_REPO, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const REF = pinnedRef();
if (!existsSync(join(KERBY_REPO, '.git'))) {
  if (CHECK) skip(`no kerby git checkout at ${KERBY_REPO}.`);
  throw new Error(`no kerby git checkout at ${KERBY_REPO}`);
}
let sha: string;
try {
  sha = git('rev-parse', '--verify', `${REF}^{commit}`).trim();
} catch {
  if (CHECK) skip(`commit ${REF} is not in ${KERBY_REPO} (git fetch there first).`);
  throw new Error(`commit ${REF} is not in ${KERBY_REPO}`);
}
const show = (path: string) => git('show', `${sha}:${path}`);

// --- manifests -----------------------------------------------------------------
type Check = Record<string, unknown> & { id: string; kind: string; severity?: string; floor?: boolean; enforcer?: string };

// Tier per script: floor → locked, else block → recommended, else optional.
// A script hosting several checks takes the highest (contract § Hook tiers).
function hooksOf(checks: Check[]) {
  const byScript = new Map<string, Check[]>();
  for (const c of checks) if (c.enforcer) byScript.set(c.enforcer, [...(byScript.get(c.enforcer) ?? []), c]);
  return [...byScript].map(([enforcer, cs]) => ({
    script: enforcer.split('/').pop(),
    enforcer,
    event: cs[0].event,
    matcher: cs[0].matcher,
    tier: cs.some((c) => c.floor) ? 'locked' : cs.some((c) => c.severity === 'block') ? 'recommended' : 'optional',
    blocks: cs.some((c) => c.severity === 'block'),
    checks: cs.map((c) => c.id),
  }));
}

const swe = Bun.TOML.parse(show(`${SWE}/rulebook.toml`)) as any;
const base = Bun.TOML.parse(show(`${BASE}/rulebook.toml`)) as any;

// --- anchors -------------------------------------------------------------------
const norm = (s: string) => s.replace(/^[ \t]*>[ \t]?/gm, '').replace(/\s+/g, ' ');
const fileCache = new Map<string, string>();
const missing: string[] = [];
const anchors = ANCHORS.map((a) => {
  if (!fileCache.has(a.file)) {
    try {
      fileCache.set(a.file, norm(show(a.file)));
    } catch {
      fileCache.set(a.file, ''); // file absent at this commit — every anchor in it fails below
    }
  }
  if (!fileCache.get(a.file)!.includes(norm(a.quote))) missing.push(`${a.id} (${a.file})`);
  return a;
});
if (missing.length) {
  for (const m of missing) console.error(`FAIL  anchor not found at ${sha.slice(0, 7)}: ${m}`);
  console.error(`check:swe — ${missing.length} anchor(s) no longer match the source; update the guide and ANCHORS together`);
  process.exit(1);
}
const quote = (id: string) => ANCHORS.find((a) => a.id === id)!.quote;
const num = (id: string) => Number(quote(id).match(/\d+/)![0]);

const data = {
  source_repo: 'sorawit-w/kerby',
  source_sha: sha,
  version: swe.version,
  kerby_version: show('skills/kerby/VERSION').trim(),
  description: swe.description,
  numbers: {
    planThreshold: num('plan-threshold'),
    approvalGrade: num('approval-grade'),
    recentCommits: num('recent-commits'),
    costlyNewFiles: num('costly-new-files'),
    costlyEditedFiles: num('costly-edited-files'),
    maxGrade: Number(quote('ladder-critical').match(/–(\d+)\)/)![1]),
  },
  routes: quote('format-complexity').match(/route: <([^>]+)>/)![1].split(' | '),
  checks: swe.check as Check[],
  hooks: hooksOf(swe.check),
  commands: swe.command,
  base: { version: base.version, hooks: hooksOf(base.check), checks: base.check as Check[] },
  anchors,
};

const json = JSON.stringify(data, null, 2) + '\n';

if (!CHECK) {
  await Bun.write(OUT, json);
  console.log(`sync:swe — wrote src/data/swe.json from ${KERBY_REPO} @ ${sha.slice(0, 7)} (swe ${data.version})`);
  process.exit(0);
}

// --- check ---------------------------------------------------------------------
function diff(a: unknown, b: unknown, path = ''): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((k) => diff((a as any)[k], (b as any)[k], path ? `${path}.${k}` : k));
  }
  return [`${path || '(root)'}: committed ${JSON.stringify(a)} ≠ source ${JSON.stringify(b)}`];
}

// --drift (used by .github/workflows/drift.yml against kerby main): ignore the
// fields that only say WHICH commit was read — they always differ from a newer
// commit — and report only changes the guide pages actually show.
const PROVENANCE = process.argv.includes('--drift') ? ['source_sha', 'kerby_version'] : [];
const committed = existsSync(OUT) ? await Bun.file(OUT).json() : {};
for (const k of PROVENANCE) {
  delete committed[k];
  delete (data as Record<string, unknown>)[k];
}
const problems = diff(committed, data);
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error(`check:swe — src/data/swe.json is out of date with ${sha.slice(0, 7)}; run: bun run sync:swe`);
  process.exit(1);
}
console.log(`check:swe — swe.json matches ${KERBY_REPO} @ ${sha.slice(0, 7)} (swe ${data.version}, ${ANCHORS.length} anchors)`);
