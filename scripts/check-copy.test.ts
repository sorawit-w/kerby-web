import { describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkCopy, readPinnedReadme } from './check-copy';

const source = '## What it looks like when kerby says no\n\n```\nBLOCKED <force> & inspect\n```\n```\nBLOCKED env\n```\n```\nWARNING secret\n```\n';
const html = '<pre data-transcript="force-push">BLOCKED &lt;force&gt; &amp; inspect</pre><pre data-transcript="env-overwrite">BLOCKED env</pre><pre data-transcript="secret-scan">WARNING secret</pre>';
describe('pinned transcript fidelity', () => {
  test('decodes rendered text without marketing slogans or hidden markup', async () => {
    expect(await checkCopy(source, html)).toEqual([]);
  });
  test('rejects altered, missing and duplicated transcripts', async () => {
    expect((await checkCopy(source, html.replace('WARNING secret', 'ALL CLEAR'))).length).toBeGreaterThan(0);
    expect((await checkCopy(source, html.replace('data-transcript="env-overwrite"', ''))).length).toBeGreaterThan(0);
    expect((await checkCopy(source, html + '<pre data-transcript="force-push">duplicate</pre>')).length).toBeGreaterThan(0);
  });
  test('rejects missing source section and source repository', async () => {
    expect((await checkCopy('no source section', html)).length).toBeGreaterThan(0);
    expect(() => readPinnedReadme('/nonexistent-kerby-source', 'deadbeef')).toThrow();
  });
});

test('source follows the requested Git pin, not HEAD or working tree', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kerby-copy-test-'));
  const git = (...args: string[]) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test', GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test' } });
  try {
    git('init');
    writeFileSync(join(dir, 'README.md'), source);
    git('add', 'README.md');
    git('commit', '-m', 'Pinned source');
    const pin = git('rev-parse', 'HEAD').trim();
    writeFileSync(join(dir, 'README.md'), 'Changed source');
    git('commit', '-am', 'Later source');
    writeFileSync(join(dir, 'README.md'), 'Uncommitted source');
    expect(readPinnedReadme(dir, pin)).toBe(source);
    expect(readPinnedReadme(dir, 'HEAD')).toBe('Changed source');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CI rejects skipped SWE validation when source is unavailable', () => {
  const result = Bun.spawnSync([process.execPath, 'scripts/sync-swe.ts', '--check'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, CI: '1', KERBY_REPO: '/nonexistent-kerby-source' },
  });
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString()).toContain('Source validation is required');
});
