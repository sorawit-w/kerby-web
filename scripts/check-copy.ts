// Compare readable, stable transcript nodes to README at the same pin as sync:swe.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const IDS = ['force-push', 'env-overwrite', 'secret-scan'];
export function pinnedRef(): string {
  const ref = process.env.KERBY_REF || readFileSync(join(ROOT, '.github/workflows/deploy.yml'), 'utf8').match(/^\s*KERBY_REF:\s*([0-9a-f]{7,40})\s*$/m)?.[1];
  if (!ref) throw new Error('KERBY_REF missing from deploy.yml');
  return ref;
}
export function readPinnedReadme(repo: string, ref: string): string {
  return execFileSync('git', ['-C', repo, 'show', `${ref}:README.md`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function decodeText(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, entity: string) => {
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10));
    return named[entity] ?? whole;
  });
}
export async function checkCopy(readme: string, html: string): Promise<string[]> {
  const heading = '## What it looks like when kerby says no';
  const start = readme.indexOf(heading);
  if (start < 0) return ['README transcript source section missing'];
  const end = readme.indexOf('\n## ', start + 1);
  const fences = [...readme.slice(start, end < 0 ? undefined : end).matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map(m => m[1].replace(/\n$/, ''));
  if (fences.length < 3) return ['README transcript source has fewer than three transcripts'];
  const failures: string[] = [];
  for (const [index, id] of IDS.entries()) {
    let count = 0;
    let text = '';
    await new HTMLRewriter().on(`pre[data-transcript="${id}"]`, {
      element() { count++; },
      text(chunk) { text += chunk.text; },
    }).transform(new Response(html)).text();
    if (count !== 1) failures.push(`${id}: expected one transcript, found ${count}`);
    if (decodeText(text).replace(/\n$/, '') !== fences[index]) failures.push(`${id}: rendered transcript differs from pinned README`);
  }
  return failures;
}
if (import.meta.main) {
  const repo = process.env.KERBY_REPO || join(homedir(), 'projects/kerby');
  try {
    const ref = pinnedRef();
    const readme = readPinnedReadme(repo, ref);
    const failures = await checkCopy(readme, await Bun.file(join(ROOT, 'dist/index.html')).text());
    for (const failure of failures) console.error(`FAIL  ${failure}`);
    if (failures.length) process.exit(1);
    console.log(`check:copy — three transcripts match ${ref} (source: ${repo})`);
  } catch (error) {
    console.error(`check:copy — FAILED: pinned source or build unavailable. Set KERBY_REPO to a checkout containing the pin.\n${error}`);
    process.exit(1);
  }
}
