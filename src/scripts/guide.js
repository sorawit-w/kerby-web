// swe guide enhancements. The HTML is complete without this script: every
// lifecycle step is rendered top-down, the step nav is plain #step-N links,
// every task is rendered as a list, and every command is selectable text.
// This script adds three things:
//   - stepnav: marks the step you are reading in the sticky step nav, and
//     keeps that number in view when the nav scrolls sideways on a phone. It
//     runs under reduced motion too: a position mark is not an animation.
//   - picker: selectable examples, including deep links; reduced motion changes
//     animation only, never the available functionality.
//   - copyRows: a Copy button on each command row.
// The hooks switch is CSS only (:has) and needs no script.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}

// Switch immediately; pointer actions may briefly fade in the new example.
function reveal(items, index, animate = false) {
  items.forEach((item, i) => {
    item.getAnimations().forEach(animation => animation.cancel());
    item.hidden = i !== index;
  });
  if (animate && !reduce.matches) {
    const style = getComputedStyle(items[index]);
    items[index].animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: parseFloat(style.getPropertyValue('--motion-feedback')),
      easing: 'linear',
    });
  }
}
reduce.addEventListener('change', () => {
  if (reduce.matches) document.querySelectorAll('[data-choice]').forEach(item => {
    item.getAnimations().forEach(animation => animation.cancel());
  });
});

function stepnav(nav) {
  const links = [...nav.querySelectorAll('a[href^="#step-"]')];
  const steps = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (steps.length !== links.length || !steps.length) return;
  let current = -1;

  // Anchor jumps land below the pinned nav: CSS reads --stepnav-h for
  // scroll-margin-top. Re-measured on every update, so a jump target (height
  // + 12px) always sits above the "current" line (height + 24px).
  let height = 0;
  const measure = () => {
    if (nav.offsetHeight === height) return;
    height = nav.offsetHeight;
    document.documentElement.style.setProperty('--stepnav-h', `${height}px`);
  };

  function update() {
    measure();
    const line = height + 24; // a step is "current" once its top passes under the nav
    let i = -1;
    steps.forEach((step, j) => {
      if (step.getBoundingClientRect().top <= line) i = j;
    });
    // At the very bottom a short last step can never reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) i = steps.length - 1;
    nav.classList.toggle('is-stuck', nav.getBoundingClientRect().top <= 0 && i >= 0);
    if (i === current) return;
    current = i;
    links.forEach((a, j) => {
      if (j === i) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    // On a phone the numbers scroll sideways: keep the current one in view.
    if (i >= 0 && nav.scrollWidth > nav.clientWidth) {
      const a = links[i].getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      nav.scrollTo({
        left: nav.scrollLeft + a.left - n.left - (n.width - a.width) / 2,
        behavior: reduce.matches ? 'auto' : 'smooth',
      });
    }
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

function picker(root) {
  const choices = [...root.querySelectorAll('[data-choice]')];
  if (choices.length < 2) return;
  const bar = el('div', { class: 'choices', role: 'group', 'aria-label': root.dataset.picker || 'Choose' });
  const buttons = choices.map((choice, i) => {
    const b = el('button', { type: 'button', class: 'btn', 'aria-controls': choice.id, 'aria-pressed': 'false' }, choice.dataset.label);
    b.addEventListener('click', (event) => pick(i, true, event.detail > 0));
    bar.append(b);
    return b;
  });
  const live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  root.prepend(bar, live);
  root.classList.add('is-enhanced');

  function pick(i, user, animate = false) {
    reveal(choices, i, animate);
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    if (user) live.textContent = `Showing: ${choices[i].dataset.label}`;
  }
  function followHash() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return false; }
    const target = document.getElementById(id);
    const index = choices.findIndex((choice) => choice === target || choice.contains(target));
    if (index < 0) return false;
    pick(index, false);
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  }
  if (!followHash()) pick(0, false);
  window.addEventListener('hashchange', followHash);
}

// Copy buttons for command rows (components/guide/Command.astro). Only where
// the clipboard API exists; otherwise the command stays plain, selectable text.
function copyRows(rows) {
  if (!rows.length || !window.isSecureContext || !navigator.clipboard?.writeText) return;
  const live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  document.body.append(live);
  rows.forEach((row) => {
    const code = row.querySelector('code');
    const text = code.textContent.trim();
    const button = el('button', { type: 'button', class: 'copy', 'aria-label': `Copy ${text}` });
    const mark = el('span', { class: 'copy-mark', 'aria-hidden': 'true' }, '✓');
    const label = el('span', { class: 'copy-label' }, 'Copy');
    button.append(mark, label);
    let timer;
    button.addEventListener('click', async (event) => {
      clearTimeout(timer);
      button.toggleAttribute('data-instant', event.detail === 0);
      button.removeAttribute('data-copied');
      try {
        await navigator.clipboard.writeText(text);
        label.textContent = 'Copied';
        button.setAttribute('data-copied', '');
        live.textContent = `Copied ${text}`;
      } catch {
        // Clipboard refused: select the command so the reader can copy it by hand.
        window.getSelection().selectAllChildren(code);
        label.textContent = 'Selected';
        live.textContent = `${text} is selected. Copy it with your keyboard.`;
      }
      timer = setTimeout(() => {
        label.textContent = 'Copy';
        button.removeAttribute('data-copied');
        live.textContent = '';
      }, 1600);
    });
    row.append(button);
  });
}

document.querySelectorAll('[data-stepnav]').forEach(stepnav);
copyRows([...document.querySelectorAll('[data-copy-row]')]);
document.querySelectorAll('[data-picker]').forEach(picker);

