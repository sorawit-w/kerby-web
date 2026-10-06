// The lifecycle steps of the swe guide. Each step names the swe section it
// summarizes. Numbers and line formats come from swe.json; the words are a
// plain summary of that section. Pages use STEPS.length, never a typed count.
import swe from './swe.json';
import { plain } from './swe-prose';

const { planThreshold, approvalGrade, recentCommits, costlyNewFiles, costlyEditedFiles } = swe.numbers;

export type Step = {
  phase: 'Set up' | 'Decide' | 'Build' | 'Finish';
  title: string;
  tag?: 'hook' | 'partly' | 'instructions';
  body: string[];
  lines?: string[];
  caption?: string;
  commands?: { title: string; ids: string[] }[];
  source: string;
};

// Each step names the swe section it summarizes. Numbers and line formats
// come from swe.json; the words here are a plain summary of that section.
export const STEPS: Step[] = [
  {
    phase: 'Set up',
    title: 'Install',
    body: [
      'Add kerby to your agent once per machine. Then run /kerby install once in each repo. It asks before every change it makes.',
      'First it adds one line to your agent file — CLAUDE.md, AGENTS.md, AI-CONTEXT.md or .cursorrules — so each session loads the rules. Then it shows the hooks in a table and asks: all, choose, or none. Last, it offers a git pre-commit hook that scans for secrets inside git itself.',
    ],
    commands: [
      { title: 'Once per machine, in Claude Code:', ids: ['install-marketplace', 'install-plugin'] },
      { title: 'Or with the cross-platform CLI, in a terminal:', ids: ['install-cli'] },
      { title: 'Then once per repo, in your agent:', ids: ['cmd-install'] },
    ],
    source: 'kerby README § Install; SKILL.md § install',
  },
  {
    phase: 'Set up',
    title: 'Load',
    body: [
      'At the start of each session, kerby picks the rulebook and reads its rules into the agent’s context.',
      'It picks from your lock file first, then from files in your repo such as package.json. When it cannot tell, it asks you. It never picks silently. It prints one line that says what it loaded.',
      'The line that install adds to your agent file does this for you. To load by hand, or to check later that the rules are still loaded:',
    ],
    commands: [{ title: 'In your agent:', ids: ['cmd-load', 'cmd-status'] }],
    lines: ['format-rulebook'],
    source: 'kerby SKILL.md § Rulebooks, selection',
  },
  {
    phase: 'Set up',
    title: 'Read the project',
    tag: 'instructions',
    body: [
      `Before any work, the agent reads what the project already knows: agent-context.yaml, the status and log in .kerby/, the knowledge base, CONTEXT.md, DESIGN.md, your agent file, and the last ${recentCommits} commits.`,
      'If agent-context.yaml is missing, the agent creates it.',
    ],
    source: 'BOOTSTRAP.md § 2',
  },
  {
    phase: 'Decide',
    title: 'Grade and route',
    tag: 'partly',
    body: [
      `The agent grades the task from 1 to ${swe.numbers.maxGrade} and picks a route, such as feature or bugfix.`,
      'It also says where it stopped on the decision ladder: is this needed at all, does the standard library do it, does the platform do it, does an installed package do it, can it be one line — and only then, new code. Both lines appear on every change, even a one-word fix.',
      'A hook warns when the agent edits a high-stakes file, because those files always need the full workflow.',
    ],
    lines: ['format-complexity', 'format-rung'],
    source: 'BOOTSTRAP.md § 1b, § 2.5, § 3',
  },
  {
    phase: 'Decide',
    title: 'Plan',
    tag: 'instructions',
    body: [
      'Before the first edit, the agent names the files, the change, and how it will check the result.',
      `From grade ${planThreshold}, it writes a full plan: the expected result and a table of test cases. From grade ${approvalGrade}, it stops and waits for your approval.`,
    ],
    lines: ['format-plan', 'format-plan-waived'],
    caption: 'If you say “just do it”, a full plan shrinks to the second line. It never disappears.',
    source: 'BOOTSTRAP.md § 4 Plan Gate',
  },
  {
    phase: 'Decide',
    title: 'Intent',
    tag: 'instructions',
    body: [
      'Before an edit that changes behavior, the agent writes three things: what the code does now, what the test or task expects, and what the docs say.',
      'If the three disagree, it does not edit yet. It tells you which one it trusts and why. The order of trust is: your own words, then the docs, then the tests, then the current code.',
    ],
    lines: ['format-intent'],
    source: 'references/intent-gate.md',
  },
  {
    phase: 'Build',
    title: 'Branch',
    tag: 'partly',
    body: [
      `The agent never works on a protected branch: ${plain('protected-branches')}. It creates a branch with a short typed name, such as fix/null-user.`,
      'It makes a separate git worktree only when there is a reason, such as two agents working at once, and it says the reason in one line. A hook blocks any commit on a protected branch.',
    ],
    lines: ['format-worktree'],
    source: 'BOOTSTRAP.md § 4 Branching',
  },
  {
    phase: 'Build',
    title: 'Build in small steps',
    tag: 'instructions',
    body: [
      'The agent works in a loop: pick one piece, do it, check it, commit it, log it, repeat. It prefers to write the test first.',
      `When something fails, it reads the code that causes it before it changes anything, and it cites the file and line. If your request is short and unclear, it asks one question before costly actions: starting sub-agents, creating more than ${costlyNewFiles} files, editing more than ${costlyEditedFiles}, installing packages, or a git action that cannot be undone.`,
    ],
    source: 'workflows/feature.md § 5; BOOTSTRAP.md § 4',
  },
  {
    phase: 'Build',
    title: 'Check',
    tag: 'instructions',
    body: [
      'Before each commit, the agent picks a quality gate from what is staged, runs it, and reads the whole output. Quick runs lint. Standard runs build, lint and test. Full adds end-to-end tests and a manual check.',
      'Nothing checks that a gate really ran. A reminder hook points out skipped tests at commit time, but it does not stop the commit.',
    ],
    source: 'references/quality-gates.md',
  },
  {
    phase: 'Build',
    title: 'Commit',
    tag: 'partly',
    body: [
      `After each finished piece, the agent commits only the files it changed. The message starts with a type, ${plain('commit-types')}.`,
      'At this moment the hooks check three things: no secret is staged, the branch is not protected, and STATUS.md states no version, SHA or PR number.',
    ],
    source: 'BOOTSTRAP.md § 4 Commit Discipline',
  },
  {
    phase: 'Build',
    title: 'Log',
    tag: 'instructions',
    body: [
      'After each commit, the agent adds an entry to .kerby/memory.log: the task, what it did, the files, the commit, and whether it is done or blocked.',
      'It also records facts it noticed, such as a slow build or a skipped test. Facts only, no advice — you decide what to act on.',
    ],
    source: 'BOOTSTRAP.md § 4 Commit Discipline',
  },
  {
    phase: 'Finish',
    title: 'Report',
    tag: 'instructions',
    body: [
      'The final report always gives you steps to check the work by hand, and one line that names what the agent chose not to build.',
      'When there was a full plan, each test case from it gets a result line. The agent stops any server it started. It never merges.',
    ],
    lines: ['format-skipped', 'format-outcome'],
    source: 'workflows/feature.md § 7; BOOTSTRAP.md § 4',
  },
  {
    phase: 'Finish',
    title: 'Save and resume',
    tag: 'partly',
    body: [
      'Before the conversation gets too long, the agent updates STATUS.md and the log and commits them, so the next session can start where this one stopped.',
      'Long conversations get compacted, and rules read earlier can be lost. In Claude Code, if you installed kerby’s session hook, it puts the rules back after a compaction. Otherwise, reload them by hand.',
    ],
    commands: [{ title: 'After a compaction, in your agent:', ids: ['cmd-status', 'cmd-reload'] }],
    source: 'BOOTSTRAP.md § 6; kerby SKILL.md § Compaction',
  },
];

