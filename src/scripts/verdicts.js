// The page's only script (brief L6/§7): the verdict cycle.
// command typed at ~35ms/char → 300ms pause → verdict lines fade in one at a
// time (80ms stagger, 150ms opacity) → hold 4s → fade out 200ms → next.
//
// CLS 0 by construction: every frame's content is pre-rendered invisible and
// revealed with opacity only — no layout writes after play() starts. The
// block cursor is a background paint on the next unrevealed character.
// Pauses while document.hidden; no-op under reduced motion (the CSS static
// stack is the reduced-motion rendering).

const TYPE_MS = 35;
const CMD_PAUSE_MS = 300;
const LINE_STAGGER_MS = 80;
const LINE_FADE_MS = 150;
const HOLD_MS = 4000;
const FADE_OUT_MS = 200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function whileVisible(ms) {
  await sleep(ms);
  while (document.hidden) {
    await new Promise((r) =>
      document.addEventListener('visibilitychange', r, { once: true }),
    );
  }
}

function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stack = document.querySelector('#demo .transcripts');
  if (!stack) return;

  const sources = [...stack.querySelectorAll('.transcript')].map((el) => ({
    cmd: el.dataset.cmd,
    kw: el.dataset.kw,
    // verdict text = node text minus the command chrome line
    rest: el.textContent.slice(`$ ${el.dataset.cmd}\n${el.dataset.kw}`.length),
  }));

  // Animated layer shares the grid cell; statics keep holding the height.
  stack.classList.add('animating');
  const anim = document.createElement('pre');
  anim.className = 'transcript anim';
  anim.style.visibility = 'visible';
  stack.append(anim);

  async function play({ cmd, kw, rest }) {
    // Pre-render the full frame invisible — reveals below are opacity-only.
    const chars = [...`$ ${cmd}`].map((ch) => span('ch off', ch));
    const lines = (kw + rest).split('\n').map((text, i) => {
      const line = span('line off', '');
      line.style.transition = `opacity ${LINE_FADE_MS}ms`;
      if (i === 0 && kw) line.append(span('kw', kw), text.slice(kw.length) + '\n');
      else line.textContent = text + '\n';
      return line;
    });
    const cmdLine = span('cmd', '');
    cmdLine.append(...chars, span('ch cursor-pad off', '█'), '\n');
    anim.style.transition = '';
    anim.style.opacity = '1';
    anim.replaceChildren(cmdLine, ...lines);

    // 1. "type" the command — reveal chars; cursor paints the next cell
    for (let i = 0; i < chars.length; i++) {
      chars[i].classList.remove('off');
      chars[i + 1]?.classList.add('cursor');
      chars[i]?.classList.remove('cursor');
      if (i + 1 === chars.length) cmdLine.children[i + 1].classList.add('cursor');
      await whileVisible(TYPE_MS);
    }
    await whileVisible(CMD_PAUSE_MS);
    cmdLine.querySelector('.cursor')?.classList.remove('cursor');

    // 2. verdict lines, one at a time
    for (const line of lines) {
      line.classList.remove('off');
      await whileVisible(LINE_STAGGER_MS);
    }
    await whileVisible(LINE_FADE_MS + HOLD_MS);

    // 3. fade out, hand over
    anim.style.transition = `opacity ${FADE_OUT_MS}ms`;
    anim.style.opacity = '0';
    await whileVisible(FADE_OUT_MS);
  }

  (async () => {
    for (let i = 0; ; i = (i + 1) % sources.length) {
      await play(sources[i]);
    }
  })();
}

init();
