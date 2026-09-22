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

const bookTrack = document.querySelector('.book-track');
if (bookTrack) {
  const controls = document.querySelector('.book-shelf-controls');
  const previous = controls.querySelector('[data-books-prev]');
  const next = controls.querySelector('[data-books-next]');
  controls.hidden = false;
  const updateBookControls = () => {
    previous.disabled = bookTrack.scrollLeft <= 2;
    next.disabled = bookTrack.scrollLeft + bookTrack.clientWidth >= bookTrack.scrollWidth - 2;
  };
  const moveBooks = direction => bookTrack.scrollBy({
    left: direction * (bookTrack.querySelector('.book-card').getBoundingClientRect().width + 18),
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
  previous.addEventListener('click', () => moveBooks(-1));
  next.addEventListener('click', () => moveBooks(1));
  bookTrack.addEventListener('scroll', updateBookControls, {passive: true});
  window.addEventListener('resize', updateBookControls);
  bookTrack.querySelectorAll('img').forEach(img => {
    const fallback = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
    img.addEventListener('error', fallback);
    if (img.complete && !img.naturalWidth) fallback();
  });
  updateBookControls();
}

document.querySelectorAll('.photo-deck').forEach(photoDeck => {
  const cards = [...photoDeck.querySelectorAll('.photo-card')];
  const dots = [...photoDeck.querySelectorAll('[data-photo-index]')];
  let current = 0;
  function showPhoto(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => { card.hidden = i !== current; });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    photoDeck.querySelector('.deck-count').textContent = `${current + 1} / ${cards.length}`;
    const dotTrack = photoDeck.querySelector('.deck-dots');
    dotTrack.scrollLeft = dots[current].offsetLeft - (dotTrack.clientWidth - dots[current].offsetWidth) / 2;
  }
  photoDeck.querySelector('.deck-controls').hidden = false;
  photoDeck.querySelector('[data-photo-prev]').addEventListener('click', () => showPhoto(current - 1));
  photoDeck.querySelector('[data-photo-next]').addEventListener('click', () => showPhoto(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showPhoto(i)));
  photoDeck.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  showPhoto(0);
});

if (document.querySelector('.photo-deck')) {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'photo-lightbox';
  lightbox.setAttribute('aria-label', 'Expanded photo');
  lightbox.innerHTML = '<div class="photo-lightbox-inner"><button class="photo-lightbox-close" type="button" aria-label="Close expanded photo">×</button><img alt=""></div>';
  document.body.append(lightbox);

  const expandedImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.photo-lightbox-close');
  let opener = null;

  function openPhoto(image) {
    opener = image;
    expandedImage.src = image.currentSrc || image.src;
    expandedImage.alt = image.alt;
    lightbox.showModal();
    closeButton.focus();
  }

  function closePhoto() {
    lightbox.close();
    opener?.focus();
  }

  document.querySelectorAll('.photo-card img').forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Expand photo: ${image.alt}`);
    image.addEventListener('click', () => openPhoto(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPhoto(image);
      }
    });
  });

  closeButton.addEventListener('click', closePhoto);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closePhoto();
  });
  lightbox.addEventListener('cancel', event => {
    event.preventDefault();
    closePhoto();
  });
}

const spotifyCard = document.querySelector('[data-spotify-card]');
if (spotifyCard) {
  const state = spotifyCard.querySelector('[data-spotify-state]');
  const title = spotifyCard.querySelector('[data-spotify-title]');
  const artist = spotifyCard.querySelector('[data-spotify-artist]');
  const art = spotifyCard.querySelector('[data-spotify-art]');
  const link = spotifyCard.querySelector('[data-spotify-link]');
  const progress = spotifyCard.querySelector('[data-spotify-progress]');
  let hasTrack = false;

  const refreshSpotify = () => fetch('/api/spotify', {
    cache: 'no-store',
    headers: {'Accept': 'application/json'}
  })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Spotify unavailable')))
    .then(track => {
      hasTrack = true;
      spotifyCard.dataset.playing = track.isPlaying ? 'true' : 'false';
      state.textContent = track.isPlaying ? 'Playing now' : 'Recently played';
      title.textContent = track.title;
      artist.textContent = `${track.artist} · ${track.album}`;
      link.href = track.trackUrl || link.href;
      link.textContent = 'Open this song ↗';
      link.hidden = false;
      if (track.albumImage) {
        art.innerHTML = '';
        const image = document.createElement('img');
        image.src = track.albumImage;
        image.alt = '';
        art.append(image);
      }
      if (track.isPlaying && track.durationMs) {
        progress.hidden = false;
        progress.querySelector('span').style.width = `${Math.min(100, Math.max(0, track.progressMs / track.durationMs * 100))}%`;
      } else {
        progress.hidden = true;
      }
    })
    .catch(() => {
      if (hasTrack) return;
      spotifyCard.dataset.playing = 'false';
      state.textContent = 'Spotify activity';
      title.textContent = 'Nothing playing right now';
      artist.textContent = 'Check back later to see what I’m listening to.';
      link.hidden = true;
    });

  refreshSpotify();
  window.setInterval(() => {
    if (!document.hidden) refreshSpotify();
  }, 10000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshSpotify();
  });
}
