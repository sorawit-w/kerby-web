// Exact README transcripts; check:copy validates these against the pinned source.
export const TRANSCRIPTS = [
  `BLOCKED: git push --force / -f
Reason: destructive git command — data loss is hard or impossible to undo.
If you really need this, run it yourself in a terminal.
See kerby guardrails (hooks/protect-git.sh).`,
  `BLOCKED: '.env' already exists — replacing it would overwrite its current contents.
Env files are the one class git cannot restore — a real .env is gitignored, so an
overwrite has no undo. Hand the required variables to the user to add themselves:
  <VAR>=<value>
Placeholders belong in .env.example / .env.template / .env.sample — a regular file,
named absolutely, which is neither a symlink nor a hard link to another file.
See kerby guardrails (references/guardrails.md § Environment Files).`,
  `WARNING: gitleaks detected possible secrets in staged changes.
Output suppressed so the secret isn't echoed here — inspect locally with
'gitleaks stdin --redact', or allowlist a false positive in the scanner's config.`,
];
