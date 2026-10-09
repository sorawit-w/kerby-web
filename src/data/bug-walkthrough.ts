// The bug walkthrough (pages/rulebooks/swe/bug-walkthrough.astro): one made-up
// bug, followed through swe's bugfix route. The story is illustrative, never
// captured agent output; each step links the swe rule it follows, read from
// an anchored quote in swe.json (check:swe fails if the source moves).
import swe from './swe.json';
import { anchor } from './swe-prose';

export type WalkStep = {
  id: string;
  stage: string;
  condition: string;
  action: string;
  evidence: string;
  unmet: string;
  sources: { id: string; label: string }[];
};

export const SCENARIO = 'The app says my settings were saved, but they disappear after refresh.';

const GRADE = 3;
const { planThreshold, approvalGrade } = swe.numbers;

export const WALK: WalkStep[] = [
  {
    id: 'understand',
    stage: 'Understand',
    condition: 'The failure can be repeated, and “saved” has a clear meaning.',
    action: 'Turn email notifications off, save, then refresh. Compare what the page says with what it loads.',
    evidence: 'off → Save → “Saved” appears → refresh → notifications are on again.',
    unmet: 'If the failure cannot be repeated, ask for the missing steps instead of guessing at a fix.',
    sources: [{ id: 'walkthrough-reproduce', label: 'reproduce first' }],
  },
  {
    id: 'explain',
    stage: 'Explain',
    condition: 'The code shows the cause, and the intended behavior is checked.',
    action: 'Trace Save and page load. Save updates memory only; a refresh reads the old stored value.',
    evidence: 'SettingsForm.tsx never calls the existing preferences store. The docs say saved settings survive a refresh.',
    unmet: 'If the code, the task and the docs disagree, say so and name which one wins. Ask only when that order cannot decide it.',
    sources: [
      { id: 'format-intent', label: 'the INTENT line' },
      { id: 'toml-intent-gate', label: 'the intent gate' },
    ],
  },
  {
    id: 'plan',
    stage: 'Plan',
    condition: 'The files, the change and the check are written down before any edit.',
    action: 'Take the bugfix route: connect Save to the existing store, and test a save followed by a fresh read.',
    evidence: `grade ${GRADE}. That is below ${planThreshold}, so one plan line is enough, and there is no approval stop (that starts at ${approvalGrade}).`,
    unmet: 'If the fix turns out to be wider, grade and plan again before going on.',
    sources: [
      { id: 'format-plan', label: 'the plan line' },
      { id: 'plan-threshold', label: 'plan threshold' },
      { id: 'approval-grade', label: 'approval grade' },
    ],
  },
  {
    id: 'fix',
    stage: 'Fix',
    condition: 'A regression test fails before the change and passes after it.',
    action: 'Write a test that saves the setting, recreates the page and reads it back. Then make the fix.',
    evidence: 'before the fix the test reads “on”, so it catches the bug. After the fix it reads “off”.',
    unmet: 'If the test passes before the fix, it does not capture this bug. Fix the test first.',
    sources: [{ id: 'walkthrough-regression', label: 'failing test first' }],
  },
  {
    id: 'verify',
    stage: 'Verify',
    condition: 'The original steps now work, and the project checks pass with fresh output.',
    action: 'Save, refresh and confirm the setting stays. Then run the build, lint and tests.',
    evidence: 'the setting stays off after a refresh, and can be switched back on.',
    unmet: 'If a refresh still loses the value, the work is held. A passing test alone does not count.',
    sources: [
      { id: 'gates-standard', label: 'the standard checks' },
      { id: 'iron-law', label: 'the iron law' },
    ],
  },
  {
    id: 'report',
    stage: 'Report',
    condition: 'The handoff names the cause, the change, the checks that ran, what was not checked, and how to verify.',
    action: 'Report what changed and what was really run. Leave the change for your review; the agent never merges.',
    evidence: 'turn notifications off, save, refresh, confirm they stay off; then repeat with on.',
    unmet: 'If a check was not run, say so. Never fill the gap with “should work”.',
    sources: [
      { id: 'walkthrough-finish', label: 'finish checklist' },
      { id: 'iron-law', label: 'the iron law' },
      { id: 'do-not-merge', label: 'do not merge' },
    ],
  },
];

// A source link at the pinned commit. anchor() throws on an unknown id, so a
// bad id fails the build instead of rendering a dead link.
export function sourceLink(id: string) {
  anchor(id);
  const { file } = swe.anchors.find((a) => a.id === id)!;
  return `https://github.com/${swe.source_repo}/blob/${swe.source_sha}/${file}`;
}
