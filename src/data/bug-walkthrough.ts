import swe from './swe.json';

export type Checkpoint = {
  id: string;
  stage: string;
  condition: string;
  action: string;
  evidence: string[];
  responsibility: 'Agent instruction' | 'Hook check' | 'Your decision';
  unmet: string;
  sources: string[];
};

export const SCENARIO = 'The app says my settings were saved, but they disappear after refresh.';
export const EXAMPLE_GRADE = 3;

// Editorial scenario, never captured agent output. The source IDs connect
// each checkpoint's method to the synchronized, pinned SWE rulebook.
export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'understand',
    stage: 'Understand',
    condition: 'The failure is reproducible, and “saved” has a clear meaning.',
    action: 'Change the email-notification setting, save it, then refresh. Compare what the page says with what it loads.',
    evidence: [
      'Example reproduction: switch notifications off → Save → “Saved” appears → refresh → notifications are on again.',
      'Expected behavior: a saved preference remains off after refresh.',
    ],
    responsibility: 'Agent instruction',
    unmet: 'If the failure cannot be reproduced, ask for the missing steps instead of guessing at a fix.',
    sources: ['walkthrough-reproduce'],
  },
  {
    id: 'explain',
    stage: 'Explain',
    condition: 'The cause is supported by code, and the intended behavior is checked.',
    action: 'Trace Save and page initialization. In this example, Save updates memory; refresh reloads the unchanged stored preference.',
    evidence: [
      'Illustrative source: SettingsForm.tsx updates component state but never calls the existing preferences store.',
      'The reproduction expects persistence; the example product documentation says saved settings survive refresh.',
    ],
    responsibility: 'Agent instruction',
    unmet: 'Surface any conflict between code, task, and documentation, and state which authority controls. Ask for a decision only if that order cannot resolve it or a consequential change has no specification.',
    sources: ['format-intent', 'toml-intent-gate'],
  },
  {
    id: 'plan',
    stage: 'Plan',
    condition: 'The files, focused change, and verification are visible before editing.',
    action: 'Use the bugfix route. Connect Save to the existing preferences store and cover saving followed by a fresh read.',
    evidence: [
      'Illustrative files: SettingsForm.tsx and SettingsForm.test.tsx; no storage migration or new persistence API.',
      `Example grade ${EXAMPLE_GRADE}: ${EXAMPLE_GRADE >= swe.numbers.planThreshold ? 'a full plan with expected results' : 'one plan line'}; ${EXAMPLE_GRADE >= swe.numbers.approvalGrade ? 'stop for approval' : 'no grade-based approval stop'}.`,
    ],
    responsibility: 'Agent instruction',
    unmet: 'If the investigation reveals a wider change, reassess the grade and plan before expanding the fix.',
    sources: ['format-plan', 'plan-threshold', 'approval-grade'],
  },
  {
    id: 'fix',
    stage: 'Fix',
    condition: 'A regression check fails before the change and passes after the focused fix.',
    action: 'Write a check that saves the preference, recreates the page, and reads it back. Then use the existing store before reporting success.',
    evidence: [
      'Before the fix, the example check reads the old value after recreation: failure.',
      'After the fix, the same check reads the saved value: condition satisfied for this check, not proof of the whole change.',
    ],
    responsibility: 'Agent instruction',
    unmet: 'If the check already passes before the fix, it has not captured this bug. Correct the reproduction or the check first.',
    sources: ['walkthrough-regression'],
  },
  {
    id: 'verify',
    stage: 'Verify',
    condition: 'The original behavior works and the relevant project checks pass with fresh evidence.',
    action: 'Save, refresh, and confirm the preference remains. Check related saving behavior and run the required build, lint, and tests for this logic change.',
    evidence: [
      'Example success condition: the preference remains off after refresh and can be saved back to on.',
      'A real run must record the actual commands and results; no execution results are claimed by this walkthrough.',
    ],
    responsibility: 'Agent instruction',
    unmet: 'If refresh still loses the value, keep the work held and return to investigation. A passing isolated test does not resolve the failed behavior.',
    sources: ['gates-standard', 'iron-law'],
  },
  {
    id: 'report',
    stage: 'Report',
    condition: 'The handoff states the cause, change, checks, limitations, and how to verify.',
    action: 'Report what was changed and actually checked, record project state, and leave the change ready for human review.',
    evidence: [
      'Illustrative summary: Save changed only memory; the fix now writes through the existing preferences store.',
      'Manual instructions: turn notifications off, save, refresh, confirm off; then repeat with on. Identify any browsers or related settings not exercised.',
    ],
    responsibility: 'Agent instruction',
    unmet: 'If evidence is missing or a check was not run, say so. Do not replace that gap with a completion claim.',
    sources: ['walkthrough-finish', 'iron-law', 'do-not-merge'],
  },
];

export function checkpointSource(id: string) {
  const source = swe.anchors.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Bug walkthrough: unknown source anchor ${id}`);
  return {
    ...source,
    href: `https://github.com/${swe.source_repo}/blob/${swe.source_sha}/${source.file}`,
  };
}
