// WCAG 2.1 contrast gate — pure math, no browser. Non-zero exit on failure.
// Pairings enumerate every fg/bg combination the page uses (brief §5: verify
// every pairing, including inside the dark terminal panel).

const TOKENS_FILE = new URL('../src/styles/tokens.css', import.meta.url);

function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg: string, bg: string): number {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const css = await Bun.file(TOKENS_FILE).text();
const tokens: Record<string, string> = {};
for (const [, name, value] of css.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) {
  tokens[name] = value;
}

// [fg, bg, minimum, note]
const PAIRINGS: [string, string, number, string][] = [
  ['text', 'bg', 4.5, 'body text'],
  ['text', 'surface', 4.5, 'body text on surface'],
  ['secondary', 'bg', 4.5, 'secondary text'],
  ['secondary', 'surface', 4.5, 'secondary on surface'],
  ['muted', 'bg', 4.5, 'muted text'],
  ['muted', 'surface', 4.5, 'muted on surface'],
  ['accent', 'bg', 4.5, 'links'],
  ['accent', 'surface', 4.5, 'links on surface'],
  ['structure', 'bg', 4.5, 'mono labels/tags'],
  ['structure', 'surface', 4.5, 'labels on surface'],
  ['panel-text', 'panel-bg', 4.5, 'terminal text'],
  ['accent-on-dark', 'panel-bg', 4.5, 'BLOCKED/WARNING keyword'],
  ['border', 'bg', 1.2, 'decorative border (advisory floor)'],
];

let failed = 0;
for (const [fg, bg, min, note] of PAIRINGS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.error(`FAIL  --${fg} / --${bg}: token missing from tokens.css`);
    failed++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${tokens[fg]} on ${tokens[bg]}  ${r.toFixed(2)}:1  (min ${min})  --${fg}/--${bg}  ${note}`);
  if (!ok) failed++;
}

if (failed) {
  console.error(`\ncheck:contrast — ${failed} pairing(s) below floor`);
  process.exit(1);
}
console.log('\ncheck:contrast — all pairings pass');
