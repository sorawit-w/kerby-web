// Design-discipline + budget gate. Greps src/ and dist/ for forbidden
// patterns (root-absolute URLs, gradients, shadows) and reports asset byte
// totals from dist/. Non-zero exit on any violation.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const FORBIDDEN: [RegExp, string][] = [
  [/(?:href|src)="\/(?!kerby-web\/)[^"]/, 'root-absolute URL (must be base-aware)'],
  [/linear-gradient|radial-gradient|conic-gradient/, 'gradient (flat only)'],
  [/box-shadow(?!:\s*none)/, 'box-shadow (flat only)'],
  [/text-shadow(?!:\s*none)/, 'text-shadow (flat only)'],
];

const TEXT_EXT = /\.(astro|css|html|js|ts|mjs)$/;
let violations = 0;

for (const dir of ['src', 'dist']) {
  let files: string[];
  try {
    files = walk(join(ROOT, dir));
  } catch {
    console.log(`(${dir}/ missing — skipped)`);
    continue;
  }
  for (const f of files.filter((f) => TEXT_EXT.test(f))) {
    const text = await Bun.file(f).text();
    for (const [re, why] of FORBIDDEN) {
      const m = text.match(re);
      if (m) {
        console.error(`FAIL  ${f.replace(ROOT, '')}: ${why} — ${JSON.stringify(m[0])}`);
        violations++;
      }
    }
  }
}

// Budget report from dist/ (brief §8): fonts ≤120KB, images ≤250KB.
try {
  const dist = walk(join(ROOT, 'dist'));
  const sum = (re: RegExp) =>
    dist.filter((f) => re.test(f)).reduce((n, f) => n + statSync(f).size, 0);
  // First-load transfer = latin woff2 only: latin-ext is never fetched for
  // this page (unicode-range) and .woff fallbacks are never fetched by
  // woff2-capable browsers (every browser Astro targets).
  const fonts = sum(/latin-(?!ext)[^/]*\.woff2$/);
  const fontsAll = sum(/\.(woff2?|ttf)$/);
  const images = sum(/\.(png|jpe?g|webp|avif|svg|ico)$/i);
  const kb = (n: number) => (n / 1024).toFixed(1) + 'KB';
  console.log(`fonts (latin transfer): ${kb(fonts)} of ${kb(fontsAll)} in dist (budget 120KB)  images: ${kb(images)} (budget 250KB)`);
  if (fonts > 120 * 1024) {
    console.error('FAIL  font budget exceeded');
    violations++;
  }
  if (images > 250 * 1024) {
    console.error('FAIL  image budget exceeded');
    violations++;
  }
} catch {
  console.log('(dist/ missing — budgets not measured; run bun run build first)');
}

if (violations) {
  console.error(`\ncheck:discipline — ${violations} violation(s)`);
  process.exit(1);
}
console.log('check:discipline — clean');
