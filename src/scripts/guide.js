// swe guide enhancements. The HTML is complete without this script: every
// lifecycle step is rendered top-down, the step nav is plain #step-N links,
// and every task is rendered as a list. This script adds two things:
//   - stepnav: marks the step you are reading in the sticky step nav, and
//     keeps that number in view when the nav scrolls sideways on a phone. It
//     runs under reduced motion too: a position mark is not an animation.
//   - picker: turns the task list into one-at-a-time choices. Under
//     prefers-reduced-motion it does nothing; the full list is that rendering.
// The hooks switch is CSS only (:has) and needs no script.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}

// Show one item, hide the rest; replay the entrance on the shown item.
function reveal(items, index) {
  items.forEach((item, i) => {
    item.hidden = i !== index;
    item.classList.remove('entering');
  });
  void items[index].offsetWidth; // restart the CSS animation
  items[index].classList.add('entering');
}

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
        behavior: reduce ? 'auto' : 'smooth',
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
    b.addEventListener('click', () => pick(i, true));
    bar.append(b);
    return b;
  });
  const live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  root.prepend(bar, live);
  root.classList.add('is-enhanced');

  function pick(i, user) {
    reveal(choices, i);
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    if (user) live.textContent = `Showing: ${choices[i].dataset.label}`;
  }
  pick(0, false);
}

document.querySelectorAll('[data-stepnav]').forEach(stepnav);
if (!reduce) document.querySelectorAll('[data-picker]').forEach(picker);
