(() => {
  const summaries = document.querySelectorAll('#reading .book-card details summary');
  if (!summaries.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'review-dialog';
  dialog.setAttribute('aria-labelledby', 'review-dialog-title');
  dialog.innerHTML = '<button class="review-dialog-close" aria-label="Close review" autofocus>×</button><header class="review-dialog-header"><img class="review-dialog-cover" alt=""><div><p class="review-dialog-eyebrow">MY BOOK REVIEW</p><h2 id="review-dialog-title"></h2></div></header><div class="review-dialog-body"></div>';
  document.body.append(dialog);
  const close = dialog.querySelector('button');
  let trigger;
  const finish = () => dialog.close();
  close.addEventListener('click', finish);
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) finish();
  }});
  dialog.addEventListener('close', () => { document.body.classList.remove('review-modal-open'); trigger?.focus(); });
  summaries.forEach(summary => {
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => {
      event.preventDefault();
      trigger = summary;
      const card = summary.closest('.book-card');
      const cover = card.querySelector('img');
      const image = dialog.querySelector('img');
      image.src = cover.src;
      image.alt = cover.alt;
      dialog.querySelector('h2').textContent = card.querySelector('h4').textContent;
      const body = dialog.querySelector('.review-dialog-body');
      body.replaceChildren();
      const text = card.querySelector('.book-review').textContent.trim();
      const paragraphs = text.replace('My take away', '\n\nMy take away').replace('On earth like in Hell', '\n\nOn earth like in Hell').split(/\n\s*\n/);
      paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.append(p); });
      document.body.classList.add('review-modal-open');
      dialog.showModal();
    });
  });
})();
