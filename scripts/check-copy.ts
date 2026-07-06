// Byte-fidelity gate. Extracts the three verdict transcripts from the kerby
// README ("What it looks like when kerby says no") and byte-compares them
// against the rendered page's accessible transcript nodes (entity-decoded
// textContent; trailing-newline normalization only). Also checks the
// [byte-copy] marketing strings. Compares dist/ only — run bun run build first.
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Byte-copy source of truth is the live kerby README (brief L9). Path is the
// local clone by default, overridable for CI/other machines. When the clone
// isn't present the gate skips LOUDLY rather than hard-failing — `bun run
// check` stays runnable anywhere, and the full gate runs wherever the source
// is checked out (author's machine, or CI with KERBY_REPO set).
const KERBY_REPO = process.env.KERBY_REPO || join(homedir(), 'projects/kerby');
const SECTION = 'What it looks like when kerby says no';
const DIST_HTML = new URL('../dist/index.html', import.meta.url).pathname;

// [byte-copy] strings owned by the brief's copy pack (not README-sourced).
const BC_STRINGS = [
  'The gate guardian for agentic work. Nothing unproven passes.',
  'This is not prose about the product. This is the product.',
  "No tone to argue with. The gate is open or it isn't.",
];

function decode(html: string): string {
  return html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// --- source of truth ---------------------------------------------------------
if (!(await Bun.file(join(KERBY_REPO, 'README.md')).exists())) {
  console.error(
    `check:copy — SKIPPED: kerby source not found at ${KERBY_REPO}.\n` +
      `  Set KERBY_REPO to a kerby checkout to run the byte-copy gate.\n` +
      `  (The three transcripts still ship in src/components/Demo.astro;\n` +
      `   this gate verifies them against the live README.)`,
  );
  process.exit(0);
}
const sha = execSync('git rev-parse --short HEAD', { cwd: KERBY_REPO }).toString().trim();
const readme = await Bun.file(join(KERBY_REPO, 'README.md')).text();

const sectionStart = readme.indexOf(`## ${SECTION}`);
if (sectionStart < 0) {
  console.error(`FAIL  README section "${SECTION}" not found (source moved?)`);
  process.exit(1);
}
const nextHeading = readme.indexOf('\n## ', sectionStart + 1);
const section = readme.slice(sectionStart, nextHeading < 0 ? undefined : nextHeading);
const fences = [...section.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) =>
  m[1].replace(/\n$/, ''),
);
if (fences.length < 3) {
  console.error(`FAIL  expected 3 fenced transcripts in README section, found ${fences.length}`);
  process.exit(1);
}

// --- rendered page -----------------------------------------------------------
const html = await Bun.file(DIST_HTML).text();
const srBlock = html.match(/sr-transcripts[^>]*>([\s\S]*?)<\/div>/);
if (!srBlock) {
  console.error('FAIL  .sr-transcripts block not found in dist/index.html');
  process.exit(1);
}
const rendered = [...srBlock[1].matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)].map((m) =>
  decode(m[1]).replace(/\n$/, ''),
);

// --- compare -----------------------------------------------------------------
let failed = 0;
fences.slice(0, 3).forEach((src, i) => {
  if (rendered[i] === src) {
    console.log(`ok    transcript ${i + 1} byte-matches README`);
  } else {
    console.error(`FAIL  transcript ${i + 1} differs from README:`);
    console.error(`  source:   ${JSON.stringify(src)}`);
    console.error(`  rendered: ${JSON.stringify(rendered[i])}`);
    failed++;
  }
});

const pageText = decode(html);
for (const s of BC_STRINGS) {
  if (pageText.includes(s)) {
    console.log(`ok    [byte-copy] present: ${JSON.stringify(s.slice(0, 40))}…`);
  } else {
    console.error(`FAIL  [byte-copy] string missing: ${JSON.stringify(s)}`);
    failed++;
  }
}

console.log(`\nsource: ${KERBY_REPO} @ ${sha}`);
if (failed) {
  console.error(`check:copy — ${failed} mismatch(es)`);
  process.exit(1);
}
console.log('check:copy — all byte-copy strings match');
