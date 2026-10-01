const section = document.querySelector('#activity');
if (section) {
  const list = section.querySelector('[data-activity-list]');
  const status = section.querySelector('[data-activity-status]');
  const profile = section.querySelector('[data-strava-profile]');
  async function load() {
    try {
      const response = await fetch('/api/strava', {signal: AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (!data.connected) { section.hidden = true; return; }
      section.hidden = false;
      if (/^https:\/\/www\.strava\.com\/athletes\/\d+$/.test(data.profileUrl)) {
        profile.href = data.profileUrl;
        profile.hidden = false;
      }
      const activities = (data.activities || []).filter(item => /^\d+$/.test(item.id)).slice(0, 6);
      // Public tokens from Strava's "Embed on Blog" codes, never OAuth credentials.
      const embeds = await fetch('/strava-embeds.json', {signal: AbortSignal.timeout(5000)})
        .then(response => response.ok ? response.json() : {}).catch(() => ({}));
      // Only create cards when the official public embed code is complete.
      const ready = activities.filter(item => typeof embeds[item.id] === 'string' && /^[A-Za-z0-9_-]+$/.test(embeds[item.id]));
      status.textContent = data.unavailable ? 'Activity updates are temporarily unavailable. You can still visit my Strava profile.' : ready.length ? '' : 'Visit my Strava profile for my latest activities.';
      // Avoid recreating active embeds if the list has not changed.
      const signature = ready.map(item => `${item.id}:${embeds[item.id] || ''}`).join(',');
      if (list.dataset.ids === signature) return;
      list.dataset.ids = signature;
      list.replaceChildren();
      for (const activity of ready) {
        const card = document.createElement('article');
        card.className = 'strava-activity';
        const frame = document.createElement('div');
        const token = embeds[activity.id];
        frame.className = 'strava-embed-placeholder';
        frame.dataset.embedType = 'activity';
        frame.dataset.embedId = activity.id;
        frame.dataset.style = 'standard';
        frame.dataset.fromEmbed = 'false';
        frame.dataset.token = token;
        const link = document.createElement('a');
        link.href = `https://www.strava.com/activities/${activity.id}`;
        link.textContent = 'View activity on Strava ↗';
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        card.append(frame, link); list.append(card);
      }
      if (list.querySelector('.strava-embed-placeholder')) {
        document.querySelector('#strava-embed-loader')?.remove();
        const script = document.createElement('script');
        script.id = 'strava-embed-loader';
        script.src = 'https://strava-embeds.com/embed.js';
        script.onload = () => list.querySelectorAll('iframe').forEach(frame => {
          frame.title = 'Strava activity'; frame.loading = 'eager';
        });
        script.onerror = () => { status.textContent = 'Use the activity links below if the embeds cannot load.'; };
        document.body.append(script);
      }
    } catch {
      if (!section.hidden) status.textContent = 'Activity updates are temporarily unavailable.';
    }
  }
  load();
  // Refresh only while this page is visible; server shares a 15-minute cache.
  setInterval(() => { if (!document.hidden) load(); }, 900000);
}
