// Hand-written meaning for the swe guide. Facts — ids, tiers, versions,
// numbers, line formats — come from swe.json (scripts/sync-swe.ts). This file
// only says what those facts mean, in plain words for readers whose first
// language may not be English: short sentences, one idea each, the tool's own
// terms kept as they are.
//
// coverage() runs at build time: a hook, route or command that swe.json names
// without an entry here fails the build, so a new upstream hook can never ship
// on the guide undescribed.
import swe from './swe.json';

export type HookProse = {
  name: string;
  stops: string;
  does: string;
  gaps: string;
  off: string;
};

// Keyed by hook script name (swe.json hooks[].script / base.hooks[].script).
export const HOOKS: Record<string, HookProse> = {
  'protect-git.sh': {
    stops: 'Force push, history rewrites, wholesale discards, and commits on a protected branch.',
    name: 'Destructive git and protected branches',
    does:
      'Stops git commands that can lose work: force push, push to a protected branch, reset --hard, clean -f, branch -D, and checkout . or restore . that throw away all local changes. It also stops a commit while you are on a protected branch.',
    gaps:
      'It reads the command as text, so a command that only mentions these words can be blocked too. That is on purpose: blocking too much is the safe side. Some indirect forms are not seen, such as a path held in a variable.',
    off:
      'The data-loss blocks cannot be turned off by a variable. You run those commands yourself in a terminal. For one commit you approved on a protected branch, the agent may use CODING_RULES_ALLOW_PROTECTED_COMMIT=1 in front of that one git commit.',
  },
  'protect-env.sh': {
    stops: 'Editing or overwriting an existing .env file.',
    name: 'Existing .env files',
    does:
      'Stops the agent from editing or overwriting an existing .env file. git cannot restore a real .env, because it is not tracked. The agent gives you the variable names to add yourself. Template files such as .env.example are allowed.',
    gaps: 'It watches the Edit and Write tools. A shell command that writes to .env directly is not seen.',
    off: 'No variable turns it off. Decline it at install, or remove it from your settings file on purpose.',
  },
  'status-provenance-check.sh': {
    stops: 'A commit whose STATUS.md states a version, a SHA, or a PR number.',
    name: 'Version numbers in STATUS.md',
    does:
      'Stops a commit when .kerby/STATUS.md states a version, a commit SHA, or a PR or issue number. STATUS.md says where the work stands. Git and the log already record what happened.',
    gaps:
      'If its guard script is missing, it lets the commit through and says so. A commit started with git -C or after cd … && is not recognised.',
    off: 'No variable turns it off. Decline it at install.',
  },
  'warn-env-read.sh': {
    stops: 'Nothing. It reminds the agent not to print .env secrets.',
    name: 'Reading .env files',
    does: 'When the agent reads a .env file, it reminds the agent never to print the secret values.',
    gaps: 'It watches the Read tool only. cat .env in a shell is not seen.',
    off: 'CODING_RULES_HOOK_DISABLED=warn-env-read',
  },
  'route-high-stakes.sh': {
    stops: 'Nothing. It reminds the agent that high-stakes files need the full workflow.',
    name: 'High-stakes files',
    does:
      'When the agent edits a high-stakes file — migrations, auth, payments, infrastructure, CI — it reminds the agent that this change needs the full feature or bugfix workflow, not quick-task.',
    gaps: 'Values that shape production traffic, such as timeouts or rate limits, have no file pattern. That category stays the agent’s judgment.',
    off: 'CODING_RULES_HOOK_DISABLED=route-high-stakes',
  },
  'hollow-test-check.sh': {
    stops: 'Nothing. It flags skipped tests and reminds the agent to run the gates.',
    name: 'Hollow tests and gate reminder',
    does:
      'At commit time, it counts focused or skipped tests (.only, .skip) and always-true assertions in the staged test lines, and reminds the agent to run lint, tests and build. It never stops the commit.',
    gaps: 'It cannot see fakes that only show up when tests run, such as a test run that matched zero tests.',
    off: 'CODING_RULES_HOOK_DISABLED=hollow-test-check',
  },
  'pre-commit-check.sh': {
    stops: 'A commit that contains a secret, such as an API key or token.',
    name: 'Secrets in staged changes (from base)',
    does:
      'Scans what you are about to commit for secrets such as API keys and tokens. It uses gitleaks or betterleaks when installed, and a smaller built-in pattern list when not. This hook belongs to the base floor, so every rulebook has it.',
    gaps:
      'It reads the commit command before it runs. git add x && git commit in one command is not fully seen. The optional git pre-commit hook covers that case.',
    off: 'No variable turns it off. It is a security floor; the only way to stop it is to remove it from your settings file.',
  },
};

// Plain words for each hook trigger (swe.json hooks[].matcher).
export const WHEN: Record<string, string> = {
  Bash: 'Before a shell command runs',
  'Edit|Write': 'Before a file is written or edited',
  Read: 'Before a file is read',
};

// Keyed by route name (swe.json routes[], parsed from the complexity line).
export const ROUTES: Record<string, { when: string; steps: string }> = {
  investigate: {
    when: 'You asked a question or asked for an explanation. No change.',
    steps: 'No edits, no branch, no commit. The answer cites the file and line it is based on.',
  },
  'new-project': {
    when: 'There is no code yet.',
    steps: 'Branch, set up the project files and tests, write the first glossary and status, then stop for review.',
  },
  'adopt-existing': {
    when: 'The repo has code but no kerby files yet. This is the prepare command.',
    steps: 'Reads the code and git history, then proposes context files. Each file is shown as a diff and needs your yes.',
  },
  feature: {
    when: 'A new feature, an improvement, a refactor — and every change to a high-stakes file.',
    steps: 'Branch, agree on the request, plan, then build in small committed steps, check, and report.',
  },
  bugfix: {
    when: 'Something is broken.',
    steps: 'Reproduce it, find the cause with evidence, write a failing test, fix the cause, and commit.',
  },
  'quick-task': {
    when: 'A small, low-risk change: docs, config, one file.',
    steps: 'States what will change, makes the change, checks the diff stayed small, commits, and logs.',
  },
};

// Keyed by command name (swe.json commands[]). The one-line description on the
// page is the manifest's own; this adds what it writes and what it never does.
export const COMMANDS: Record<string, { writes: string; never: string }> = {
  audit: {
    writes: 'A report under .kerby/audits/, as Markdown and HTML.',
    never: 'Never edits your code, commits, or merges. It also says which rules a static audit cannot check.',
  },
  prepare: {
    writes: 'agent-context.yaml, CONTEXT.md, first knowledge entries, a STATUS stub and a log entry — each one only after you approve its diff.',
    never: 'Never runs your gates, installs tools, branches, commits, or writes secret values.',
  },
};

export const STATE_FILES: { file: string; holds: string; shared: string }[] = [
  { file: 'agent-context.yaml', holds: 'Project facts the agent needs: stack, commands, and the plan threshold.', shared: 'Committed' },
  { file: '.kerby/memory.log', holds: 'What happened, one entry per piece of work. Only added to, never edited.', shared: 'Committed' },
  { file: '.kerby/STATUS.md', holds: 'Where things stand now: phase, next steps, blockers. Never versions or SHAs.', shared: 'Committed' },
  { file: '.kerby/knowledge/', holds: 'What was decided and learned: decisions, conventions, lessons.', shared: 'Committed' },
  { file: 'CONTEXT.md', holds: 'The project’s own glossary. The agent uses these words in code and prose.', shared: 'Committed' },
  { file: 'ROADMAP.md', holds: 'The feature list, and follow-ups that were left for later on purpose.', shared: 'Committed' },
  { file: '.kerby/BLOCKERS.md', holds: 'Created only when the agent is stuck after its retry limit.', shared: 'Committed' },
  { file: '.kerby/rulebooks.lock', holds: 'Which rulebooks this machine loads.', shared: 'This machine only' },
];

export type Term = { id: string; term: string; meaning: string };

export const GLOSSARY: Term[] = [
  { id: 'rulebook', term: 'rulebook', meaning: 'A folder of rules for one kind of work, plus the checks that enforce them. swe is the rulebook for software engineering.' },
  { id: 'gate', term: 'gate', meaning: 'The point where kerby checks an action before it happens.' },
  { id: 'verdict', term: 'verdict', meaning: 'The result of a gate: the action passes, or it is blocked. There is no third option.' },
  { id: 'hook', term: 'hook', meaning: 'A small script your agent tool runs at a fixed moment, such as before a shell command. A hook can block the action.' },
  { id: 'hook-enforced', term: 'hook-enforced', meaning: 'A rule a hook checks. The agent cannot skip it while the hook is installed.' },
  { id: 'instructions-only', term: 'instructions only', meaning: 'A rule the agent follows because it read it. Nothing stops the agent if it does not. kerby’s own docs call this behavioral.' },
  { id: 'tier', term: 'tier', meaning: 'How a hook is offered at install. Locked: comes with any hook install and cannot be skipped on its own. Recommended: a blocking hook you can skip, and /kerby status keeps saying it is not enforcing. Optional: a hook that only warns, which you can skip.' },
  { id: 'floor', term: 'floor', meaning: 'The base rules every rulebook gets, such as the secret scan. No rulebook can turn them off.' },
  { id: 'grade', term: 'grade', meaning: `How big a task is, from 1 to ${swe.numbers.maxGrade}. The grade decides how much planning is needed.` },
  { id: 'route', term: 'route', meaning: 'The workflow a task follows, such as feature or bugfix. The task type picks it.' },
  { id: 'rung', term: 'rung', meaning: 'A step on the decision ladder: do I need this at all, does the standard library do it, … only then write new code.' },
  { id: 'plan-gate', term: 'plan gate', meaning: 'The rule that the agent states its plan before the first edit.' },
  { id: 'intent-gate', term: 'intent gate', meaning: 'Before changing behavior, the agent writes what the code does, what the test expects, and what the docs say. If they disagree, it stops and tells you.' },
  { id: 'protected-branch', term: 'protected branch', meaning: 'A branch the agent never works on directly, such as main.' },
  { id: 'quality-gate', term: 'quality gate', meaning: 'The checks that prove work is done: lint, build and tests, in three sizes — Quick, Standard and Full.' },
  { id: 'compaction', term: 'compaction', meaning: 'When a long conversation is shortened to fit the model’s context window. Rules read earlier can be lost, so kerby reloads them.' },
];

// Build-time coverage: anything swe.json names must be described here.
export function coverage() {
  const missing = [
    ...[...swe.hooks, ...swe.base.hooks].filter((h) => !HOOKS[h.script!]).map((h) => `no prose for hook ${h.script} (src/data/swe-prose.ts HOOKS)`),
    ...[...swe.hooks, ...swe.base.hooks].filter((h) => !WHEN[h.matcher as string]).map((h) => `no prose for trigger ${h.matcher} (src/data/swe-prose.ts WHEN)`),
    ...swe.routes.filter((r) => !ROUTES[r]).map((r) => `no prose for route ${r} (src/data/swe-prose.ts ROUTES)`),
    ...swe.commands.filter((c: { name: string }) => !COMMANDS[c.name]).map((c: { name: string }) => `no prose for command ${c.name} (src/data/swe-prose.ts COMMANDS)`),
    ...swe.commands
      .filter((c: { name: string }) => !swe.anchors.some((a) => a.id === `cmd-${c.name}`))
      .map((c: { name: string }) => `no copy-able line for command ${c.name} (add anchor cmd-${c.name} in scripts/sync-swe.ts)`),
  ];
  if (missing.length) throw new Error(`swe guide: ${missing.join('; ')}`);
}

// Look up an anchored quote by id; a typo fails the build instead of rendering blank.
export function anchor(id: string): string {
  const a = swe.anchors.find((x) => x.id === id);
  if (!a) throw new Error(`swe guide: unknown anchor "${id}" — add it to ANCHORS in scripts/sync-swe.ts`);
  return a.quote;
}

// The command a reader pastes into their agent: the anchored README line up
// to its " # " comment.
export const command = (id: string) => anchor(id).split(/\s+#\s/)[0].trim();

// Markdown-free text of an anchor, for prose and table cells.
export const plain = (id: string) => anchor(id).replace(/\*\*/g, '').replace(/`/g, '');

// An example line built FROM a format: each <placeholder> in the anchored
// format is replaced, in order, by one value. A format that gains or loses a
// placeholder upstream fails the build here instead of leaving a stale
// example. `pick` chooses one option from a literal list in the format, such
// as "match | mismatch | not exercised"; it fails if that list is gone.
export function fill(id: string, values: string[], pick?: { from: string; to: string }): string {
  const format = anchor(id);
  const holes = format.match(/<[^<>]+>/g) ?? [];
  if (holes.length !== values.length) {
    throw new Error(`swe guide: format "${id}" has ${holes.length} placeholders, example gives ${values.length}`);
  }
  let i = 0;
  let line = format.replace(/<[^<>]+>/g, () => values[i++]);
  if (pick) {
    if (!line.includes(pick.from)) throw new Error(`swe guide: format "${id}" no longer contains "${pick.from}"`);
    line = line.replace(pick.from, pick.to);
  }
  return line;
}
