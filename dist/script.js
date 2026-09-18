const root = document.documentElement;
const themeButton = document.getElementById('theme');
function setTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}
try { if (localStorage.getItem('portfolio-cyberpunk-theme')) setTheme(localStorage.getItem('portfolio-cyberpunk-theme')); } catch {}
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('portfolio-cyberpunk-theme', theme); } catch {}
});
document.getElementById('year').textContent = new Date().getFullYear();

const deck = document.querySelector('.highlight-deck');
if (deck) {
  const cards = [...deck.querySelectorAll('.highlight-card')];
  const dots = [...deck.querySelectorAll('[data-deck-index]')];
  let current = 0;
  function showHighlight(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => { card.hidden = i !== current; });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    deck.querySelector('.deck-count').textContent = `${current + 1} / ${cards.length}`;
  }
  deck.querySelector('.deck-controls').hidden = false;
  deck.querySelector('[data-deck-prev]').addEventListener('click', () => showHighlight(current - 1));
  deck.querySelector('[data-deck-next]').addEventListener('click', () => showHighlight(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showHighlight(index)));
  deck.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showHighlight(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}
