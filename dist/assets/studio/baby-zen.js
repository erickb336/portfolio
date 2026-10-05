// Decorative peeks stay within empty section padding. No visitor data is stored.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const spots = [...document.querySelectorAll('#work, #github, #contact')];
let stopped = false;
let previous;
let timer;
const buttons = spots.map(section => {
  section.classList.add('baby-zen-spot');
  const button = document.createElement('button');
  button.className = 'baby-zen-peek';
  button.type = 'button';
  button.setAttribute('aria-label', 'Hide baby Zen for this visit');
  button.tabIndex = -1;
  const image = document.createElement('img');
  image.src = '/assets/studio/images/baby-zen-peek.png';
  image.alt = '';
  image.width = image.height = 48;
  button.append(image);
  button.addEventListener('click', () => { stopped = true; reset(); });
  button.addEventListener('animationend', () => { button.classList.remove('is-peeking'); button.tabIndex = -1; });
  section.append(button);
  return button;
});
function reset() {
  clearTimeout(timer);
  buttons.forEach(button => { button.classList.remove('is-peeking'); button.tabIndex = -1; });
}
function peek() {
  if (stopped || motion.matches || document.hidden) return;
  const visible = buttons.filter(button => {
    const box = button.parentElement.getBoundingClientRect();
    return box.bottom > 120 && box.bottom < innerHeight - 12;
  });
  const choices = visible.filter(button => button !== previous);
  const next = (choices.length ? choices : visible)[0];
  if (next) { next.classList.add('is-peeking'); next.tabIndex = 0; previous = next; }
  timer = setTimeout(peek, 10000);
}
function restart() { reset(); if (!stopped && !motion.matches && !document.hidden) timer = setTimeout(peek, 1800); }
document.addEventListener('visibilitychange', restart);
motion.addEventListener('change', restart);
restart();
