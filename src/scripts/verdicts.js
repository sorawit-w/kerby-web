// Animate once per opening when visible; retain readable source without JS.
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
for (const details of document.querySelectorAll('#demo details')) {
  const button = details.querySelector('.replay');
  const output = details.querySelector('pre');
  const original = output.innerHTML;
  let timer;
  let played = false;
  function finish() {
    clearInterval(timer);
    timer = undefined;
    output.innerHTML = original;
    button.textContent = 'Replay output';
  }
  button.hidden = motion.matches;
  function play() {
    if (motion.matches || !details.open || timer) return;
    played = true;
    const walker = document.createTreeWalker(output, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const text of node.textContent.split(/(\s+)/)) {
        const word = document.createElement('span');
        word.textContent = text;
        word.className = 'reveal-word';
        word.style.opacity = '0';
        words.push(word);
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    button.textContent = 'Show full output';
    let next = 0;
    timer = setInterval(() => {
      if (document.hidden) return;
      if (next < words.length) words[next++].style.opacity = '1';
      else finish();
    }, 35);
  }
  function playWhenVisible() {
    if (played || motion.matches || !details.open) return;
    const rect = output.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) play();
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) playWhenVisible();
    else if (timer) finish();
  });
  observer.observe(output);
  button.addEventListener('click', () => {
    if (timer) finish();
    else play();
  });
  details.addEventListener('toggle', () => {
    if (!details.open) { finish(); played = false; }
    else playWhenVisible();
  });
  motion.addEventListener('change', () => {
    finish(); button.hidden = motion.matches;
  });
}
