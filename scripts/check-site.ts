// check:site — every built page exists, every same-site link and #fragment
// resolves, and the deep links people already use (legacy-anchors.json)
// still land. Reads dist/, so run it after the build. Honors the base path.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import astroConfig from '../astro.config.mjs';
import legacy from './legacy-anchors.json';

const ROOT = new URL('..', import.meta.url).pathname;
const ORIGIN = new URL(astroConfig.site!).origin;

const ROUTES = [
  '/',
  '/rulebooks/swe/',
  '/rulebooks/swe/lifecycle/',
  '/rulebooks/swe/workflows/',
  '/rulebooks/swe/bug-walkthrough/',
  '/rulebooks/swe/hooks/',
  '/rulebooks/swe/reference/',
];

export type Page = { ids: Set<string>; links: string[] };

export async function parsePage(html: string): Promise<Page> {
  const page: Page = { ids: new Set(), links: [] };
  await new HTMLRewriter()
    .on('[id]', {
      element(el) {
        page.ids.add(el.getAttribute('id')!);
      },
    })
    .on('[href], [src]', {
      element(el) {
        for (const attr of ['href', 'src']) {
          const value = el.getAttribute(attr);
          if (value) page.links.push(value);
        }
      },
    })
    .transform(new Response(`<body>${html}</body>`))
    .text();
  return page;
}

export function checkLinks(
  pages: Map<string, Page>,
  assets: Set<string>,
  base: string,
  anchors: Record<string, string[]>,
): string[] {
  const failures: string[] = [];
  const prefix = `/${base.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '');
  for (const [route, page] of pages) {
    for (const id of anchors[route] ?? []) {
      if (!page.ids.has(id)) failures.push(`${route}: missing legacy anchor #${id}`);
    }
    for (const href of page.links) {
      let url: URL;
      try {
        url = new URL(href, `${ORIGIN}${prefix}${route}`);
      } catch {
        failures.push(`${route}: invalid URL ${href}`);
        continue;
      }
      if (url.origin !== ORIGIN || !['http:', 'https:'].includes(url.protocol)) continue;
      if (prefix && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
        failures.push(`${route}: ${href} escapes base ${prefix}`);
        continue;
      }
      let path: string;
      try {
        path = decodeURIComponent(url.pathname.slice(prefix.length)) || '/';
      } catch {
        failures.push(`${route}: invalid path ${href}`);
        continue;
      }
      const targetRoute = path.endsWith('index.html')
        ? path.slice(0, -10)
        : path.endsWith('/')
          ? path
          : `${path}/`;
      const target = pages.get(targetRoute);
      if (!target) {
        if (!assets.has(path.replace(/^\//, ''))) failures.push(`${route}: missing local target ${href}`);
        continue;
      }
      if (url.hash) {
        let fragment: string;
        try {
          fragment = decodeURIComponent(url.hash.slice(1));
        } catch {
          failures.push(`${route}: invalid fragment ${href}`);
          continue;
        }
        if (!target.ids.has(fragment)) failures.push(`${route}: missing fragment ${href}`);
      }
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
      if (entry.isDirectory()) {
        await walk(file);
        continue;
      }
      const path = relative(dist, file);
      assets.add(path);
      if (path.endsWith('index.html')) {
        pages.set(`/${path.slice(0, -10)}`, await parsePage(readFileSync(file, 'utf8')));
      }
    }
  };
  await walk(dist);

  const failures = checkLinks(pages, assets, process.env.SITE_BASE || astroConfig.base || '/', legacy);
  for (const route of ROUTES) if (!pages.has(route)) failures.push(`missing route ${route}`);

  failures.forEach((failure) => console.error(`FAIL  ${failure}`));
  if (failures.length) process.exit(1);
  console.log(`check:site — ${ROUTES.length} routes, local links, fragments and legacy anchors verified`);
}
