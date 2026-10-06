// Replay only on request. Exact readable source remains present without JS.
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
for (const details of document.querySelectorAll('#demo details')) {
  const button = details.querySelector('.replay');
  const output = details.querySelector('pre');
  const original = output.innerHTML;
  let timer;
  function finish() {
    clearInterval(timer);
    output.innerHTML = original;
    button.textContent = 'Replay output';
  }
  button.hidden = motion.matches;
  button.addEventListener('click', () => {
    if (timer) { finish(); timer = undefined; return; }
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
      else { finish(); timer = undefined; }
    }, 35);
  });
  details.addEventListener('toggle', () => {
    if (!details.open) { finish(); timer = undefined; }
  });
  motion.addEventListener('change', () => {
    finish(); timer = undefined; button.hidden = motion.matches;
  });
}
