import { expect, test } from 'bun:test';
import { checkLinks, parsePage } from './check-site';

test('checks fragments and legacy anchors using parsed HTML', async () => {
  const home = await parsePage('<main id="main"><a href="/guide/#step">Guide</a></main>');
  const guide = await parsePage('<h1 id="step">Step</h1>');
  const pages = new Map([['/', home], ['/guide/', guide]]);
  expect(checkLinks(pages, new Set(), '/', { '/': ['main'] })).toEqual([]);
  expect(checkLinks(pages, new Set(), '/', { '/': ['lost'] }).join()).toContain('lost');
  const broken = await parsePage('<a href="/guide/#missing">Missing</a>');
  expect(checkLinks(new Map([['/', broken], ['/guide/', guide]]), new Set(), '/', {}).join()).toContain('missing');
});

test('checks configured base, relative links and missing assets', async () => {
  const page = await parsePage('<a href="../guide/#step">OK</a><img src="/mascot.png"><a href="https://elsewhere.test/">External</a>');
  const guide = await parsePage('<h1 id="step">Step</h1>');
  const failures = checkLinks(new Map([['/', page], ['/guide/', guide]]), new Set(['mascot.png']), '/kerby-web/', {});
  expect(failures.join()).toContain('escapes base');
  const valid = await parsePage('<a href="/kerby-web/guide/#step">OK</a><img src="/kerby-web/mascot.png">');
  expect(checkLinks(new Map([['/', valid], ['/guide/', guide]]), new Set(['mascot.png']), '/kerby-web/', {})).toEqual([]);
});
