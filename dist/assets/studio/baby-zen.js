const playground = document.querySelector('.baby-zen-playground');
const pause = playground?.querySelector('.baby-zen-pause');
pause?.addEventListener('click', () => {
  const paused = playground.toggleAttribute('data-paused');
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Play baby Zen' : 'Pause baby Zen';
});
