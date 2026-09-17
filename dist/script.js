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
