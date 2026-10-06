// Validate shipped routes, preserved deep links, and the illustrative story contract.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import astroConfig from '../astro.config.mjs';
import legacy from './legacy-anchors.json';

const ROOT = new URL('..', import.meta.url).pathname;
export type Page = { ids: Set<string>; links: string[]; text: string };
export async function parsePage(html: string): Promise<Page> {
  const page: Page = { ids: new Set(), links: [], text: '' };
  await new HTMLRewriter().on('[id]', { element(el) { page.ids.add(el.getAttribute('id')!); } })
    .on('[href], [src]', { element(el) { for (const attr of ['href', 'src']) { const value = el.getAttribute(attr); if (value) page.links.push(value); } } })
    .on('body', { text(chunk) { page.text += chunk.text; } })
    .transform(new Response(`<body>${html}</body>`)).text();
  return page;
}
export function checkLinks(pages: Map<string, Page>, assets: Set<string>, base: string, anchors: Record<string, string[]>): string[] {
  const failures: string[] = [];
  const prefix = `/${base.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '');
  const origin = 'https://kerby.sorawit.com';
  for (const [route, page] of pages) {
    for (const id of anchors[route] ?? []) if (!page.ids.has(id)) failures.push(`${route}: missing legacy anchor #${id}`);
    for (const href of page.links) {
      let url: URL;
      try { url = new URL(href, `${origin}${prefix}${route}`); } catch { failures.push(`${route}: invalid URL ${href}`); continue; }
      if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) continue;
      if (prefix && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) { failures.push(`${route}: ${href} escapes base ${prefix}`); continue; }
      let path: string;
      try { path = decodeURIComponent(url.pathname.slice(prefix.length)) || '/'; } catch { failures.push(`${route}: invalid path ${href}`); continue; }
      const targetRoute = path.endsWith('index.html') ? path.slice(0, -10) : path.endsWith('/') ? path : `${path}/`;
      const target = pages.get(targetRoute);
      if (!target) {
        if (!assets.has(path.replace(/^\//, ''))) failures.push(`${route}: missing local target ${href}`);
        continue;
      }
      if (url.hash) {
        let fragment: string;
        try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { failures.push(`${route}: invalid fragment ${href}`); continue; }
        if (!target.ids.has(fragment)) failures.push(`${route}: missing fragment ${href}`);
      }
    }
  }
  return failures;
}
type Checkpoint = { id: string; stage: string; condition: string; action: string; evidence: readonly string[]; responsibility: string; unmet: string; sources: readonly string[] };
type Sources = { source_repo: string; source_sha: string; anchors: { id: string; file: string }[] };
export function checkStory(checkpoints: readonly Checkpoint[], swe: Sources, home: Page, walkthrough: Page): string[] {
  const failures: string[] = [];
  for (const [name, page] of [['homepage', home], ['walkthrough', walkthrough]] as const) {
    if (!/illustrative/i.test(page.text)) failures.push(`${name}: missing illustrative disclosure`);
  }
  const known = new Map(swe.anchors.map(anchor => [anchor.id, anchor]));
  const seen = new Set<string>();
  for (const checkpoint of checkpoints) {
    if (seen.has(checkpoint.id)) failures.push(`duplicate checkpoint ${checkpoint.id}`);
    seen.add(checkpoint.id);
    if (!walkthrough.ids.has(checkpoint.id)) failures.push(`walkthrough: missing checkpoint #${checkpoint.id}`);
    for (const key of ['stage', 'condition', 'action', 'responsibility', 'unmet'] as const) if (!checkpoint[key]?.trim()) failures.push(`${checkpoint.id}: missing ${key}`);
    if (!checkpoint.evidence.length || checkpoint.evidence.some(item => !item.trim())) failures.push(`${checkpoint.id}: missing evidence`);
    if (!checkpoint.sources.length) failures.push(`${checkpoint.id}: missing source references`);
    for (const id of checkpoint.sources) {
      const anchor = known.get(id);
      if (!anchor) { failures.push(`${checkpoint.id}: unknown source anchor ${id}`); continue; }
      const expected = `https://github.com/${swe.source_repo}/blob/${swe.source_sha}/${anchor.file}`;
      if (!walkthrough.links.some(link => link.split('#')[0] === expected)) failures.push(`${checkpoint.id}: missing rendered source ${id}`);
    }
  }
  return failures;
}
if (import.meta.main) {
  const dist = join(ROOT, 'dist');
  const assets = new Set<string>();
  const pages = new Map<string, Page>();
  const walk = async (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else {
        const path = relative(dist, file);
        assets.add(path);
        if (path.endsWith('index.html')) pages.set(`/${path.slice(0, -10)}`, await parsePage(readFileSync(file, 'utf8')));
      }
    }
  };
  await walk(dist);
  const failures = checkLinks(pages, assets, process.env.SITE_BASE || astroConfig.base || '/', legacy);
  const routes = ['/', '/rulebooks/swe/', '/rulebooks/swe/lifecycle/', '/rulebooks/swe/workflows/', '/rulebooks/swe/bug-walkthrough/', '/rulebooks/swe/hooks/', '/rulebooks/swe/reference/'];
  for (const route of routes) if (!pages.has(route)) failures.push(`missing route ${route}`);
  const { CHECKPOINTS } = await import('../src/data/bug-walkthrough');
  const swe = JSON.parse(readFileSync(join(ROOT, 'src/data/swe.json'), 'utf8'));
  if (CHECKPOINTS.length !== 6) failures.push('walkthrough must have all six stages');
  const home = pages.get('/');
  const story = pages.get('/rulebooks/swe/bug-walkthrough/');
  if (home && story) failures.push(...checkStory(CHECKPOINTS, swe, home, story));
  failures.forEach(failure => console.error(`FAIL  ${failure}`));
  if (failures.length) process.exit(1);
  console.log('check:site — seven routes, local links, legacy anchors and illustrative source references verified');
}
