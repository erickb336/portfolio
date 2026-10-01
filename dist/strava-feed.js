const section = document.querySelector('#activity');
if (section) {
  const list = section.querySelector('[data-activity-list]');
  const status = section.querySelector('[data-activity-status]');
  const profile = section.querySelector('[data-strava-profile]');
  let loading = false;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const duration = seconds => {
    const minutes = Math.floor(seconds / 60);
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m ${Math.floor(seconds % 60)}s`;
  };
  function card(activity) {
    const article = node('article', undefined, 'strava-activity strava-custom-card');
    const type = activity.sport === 'WeightTraining' ? 'Weight training' : activity.sport === 'Walk' ? 'Walk' : 'Run';
    article.append(node('p', type, 'strava-sport'), node('h3', activity.name));
    if (activity.startDate && Number.isFinite(Date.parse(activity.startDate))) {
      const time = node('time');
      time.dateTime = activity.startDate;
      const options = {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', timeZoneName:'short', timeZone:activity.timezone || 'UTC'};
      try { time.textContent = new Intl.DateTimeFormat('en-US', options).format(new Date(activity.startDate)); }
      catch { time.textContent = new Intl.DateTimeFormat('en-US', {...options, timeZone:'UTC'}).format(new Date(activity.startDate)); }
      article.append(time);
    }
    const stats = node('dl', undefined, 'strava-stats');
    function stat(label, value) {
      const pair = node('div');
      pair.append(node('dt', label), node('dd', value)); stats.append(pair);
    }
    if (activity.sport !== 'WeightTraining' && activity.distance > 0) stat('Distance', `${(activity.distance / 1609.344).toFixed(2)} mi`);
    stat('Time', duration(activity.sport === 'WeightTraining' ? activity.elapsedTime || activity.movingTime : activity.movingTime || activity.elapsedTime));
    if (activity.sport !== 'WeightTraining' && activity.elevation > 0) stat('Elevation', `${Math.round(activity.elevation * 3.28084)} ft`);
    article.append(stats);
    if (typeof activity.photo === 'string') {
      try {
        const url = new URL(activity.photo);
        if (url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'd3nn82uaxijpm6.cloudfront.net' || url.hostname.endsWith('.strava.com'))) {
          const img = node('img'); img.src = url.href; img.alt = activity.name;
          img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; img.onerror = () => img.remove();
          article.append(img);
        }
      } catch {}
    }
    const link = node('a', 'View on Strava ↗');
    link.href = `https://www.strava.com/activities/${activity.id}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    article.append(link);
    return article;
  }
  async function load() {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch('/api/strava', {signal: AbortSignal.timeout(25000), cache:'no-store'});
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (!data.connected) { section.hidden = true; list.replaceChildren(); return; }
      section.hidden = false;
      if (/^https:\/\/www\.strava\.com\/athletes\/\d+$/.test(data.profileUrl)) {
        profile.href = data.profileUrl; profile.hidden = false;
      }
      const activities = (data.activities || []).filter(item => /^\d+$/.test(item.id) && typeof item.name === 'string' &&
        ['Run','TrailRun','VirtualRun','Walk','WeightTraining'].includes(item.sport)).slice(0, 6);
      status.textContent = data.unavailable ? 'Activity updates are temporarily unavailable. Visit my Strava profile for the latest.' : activities.length ? '' : 'No public activities to share yet.';
      const signature = JSON.stringify(activities);
      if (list.dataset.ids === signature) return;
      list.dataset.ids = signature;
      list.replaceChildren(...activities.map(card));
    } catch {
      list.replaceChildren(); delete list.dataset.ids;
      if (!section.hidden) status.textContent = 'Activity updates are temporarily unavailable.';
    } finally { loading = false; }
  }
  load();
  setInterval(() => { if (!document.hidden) load(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
}
