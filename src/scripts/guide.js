// swe guide enhancements. The HTML is complete without this script: every
// lifecycle step and every task is rendered as a list. This only turns those
// lists into a one-at-a-time stepper and a task picker. Under
// prefers-reduced-motion it does nothing — the full lists are the
// reduced-motion rendering, as the plan requires. The hooks switch is CSS
// only (:has) and needs no script.

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

function stepper(root) {
  const steps = [...root.querySelectorAll('[data-step]')];
  if (steps.length < 2) return;
  let current = 0;

  // Rail: one numbered button per step, grouped by phase.
  const rail = el('div', { class: 'rail', role: 'group', 'aria-label': 'Jump to a step' });
  const buttons = [];
  let group = null;
  steps.forEach((step, i) => {
    const phase = step.dataset.phase;
    if (!group || group.dataset.phase !== phase) {
      group = el('div', { class: 'group', 'data-phase': phase });
      group.append(el('span', { class: 'group-name' }, phase), el('div', { class: 'dots' }));
      rail.append(group);
    }
    const b = el('button', { type: 'button', 'aria-label': `Step ${i + 1}: ${step.dataset.title}` }, String(i + 1));
    b.addEventListener('click', () => go(i, true));
    group.querySelector('.dots').append(b);
    buttons.push(b);
  });

  const back = el('button', { type: 'button', class: 'btn' }, '← Back');
  const next = el('button', { type: 'button', class: 'btn' }, 'Next →');
  const status = el('p', { class: 'status' });
  const announce = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const controls = el('div', { class: 'controls' });
  controls.append(back, status, next, announce);
  back.addEventListener('click', () => go(current - 1, true));
  next.addEventListener('click', () => go(current + 1, true));

  root.prepend(rail);
  root.append(controls);
  root.classList.add('is-enhanced');

  root.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') go(current + 1, true);
    if (e.key === 'ArrowLeft') go(current - 1, true);
  });

  function go(i, user) {
    if (i < 0 || i >= steps.length) return;
    current = i;
    reveal(steps, i);
    buttons.forEach((b, j) => {
      b.classList.toggle('done', j < i);
      if (j === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    // Disabling the focused button drops focus to <body>; hand it across first.
    if (i === 0 && document.activeElement === back) next.focus();
    if (i === steps.length - 1 && document.activeElement === next) back.focus();
    back.disabled = i === 0;
    next.disabled = i === steps.length - 1;
    status.textContent = `Step ${i + 1} of ${steps.length}: ${steps[i].dataset.title}`;
    if (user) {
      announce.textContent = status.textContent; // announce changes, not the first render
      history.replaceState(null, '', `#${steps[i].id}`);
    }
  }

  const fromHash = () => steps.findIndex((s) => `#${s.id}` === location.hash);
  go(Math.max(fromHash(), 0), false);
  window.addEventListener('hashchange', () => {
    if (fromHash() >= 0) go(fromHash(), true);
  });
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

if (!reduce) {
  document.querySelectorAll('[data-stepper]').forEach(stepper);
  document.querySelectorAll('[data-picker]').forEach(picker);
}
