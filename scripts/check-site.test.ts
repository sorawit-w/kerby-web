import { expect, test } from 'bun:test';
import { checkLinks, checkStory, parsePage } from './check-site';

test('checks fragments and legacy anchors using parsed HTML', async () => {
  const home = await parsePage('<main id="main"><a href="/guide/#step">Guide</a></main>');
  const guide = await parsePage('<h1 id="step">Step</h1>');
  expect(checkLinks(new Map([['/', home], ['/guide/', guide]]), new Set(), '/', { '/': ['main'] })).toEqual([]);
  expect(checkLinks(new Map([['/', home], ['/guide/', guide]]), new Set(), '/', { '/': ['lost'] }).join()).toContain('lost');
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
test('rejects missing source anchors and missing illustrative disclosure', () => {
  const checkpoint = { id: 'understand', stage: 'Understand', condition: 'Reproduced', action: 'Refresh', evidence: ['Lost'], responsibility: 'Agent instruction', unmet: 'Investigate', sources: ['intent'] };
  const swe = { source_repo: 'sorawit-w/kerby', source_sha: 'abc', anchors: [{ id: 'intent', file: 'rules.md' }] };
  const page = { ids: new Set(['understand']), links: ['https://github.com/sorawit-w/kerby/blob/abc/rules.md'], text: 'Illustrative example' };
  expect(checkStory([checkpoint], swe, page, page)).toEqual([]);
  expect(checkStory([checkpoint], swe, page, { ...page, links: [] }).join()).toContain('missing rendered source');
  expect(checkStory([{ ...checkpoint, sources: ['unknown'] }], swe, page, page).join()).toContain('unknown');
  expect(checkStory([checkpoint], swe, { ...page, text: 'Real run' }, page).join()).toContain('illustrative');
});
