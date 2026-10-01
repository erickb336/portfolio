// Decode only the summary route supplied by Strava, never full GPS streams.
function decodeRoute(encoded) {
  if (typeof encoded !== 'string' || encoded.length > 20000) return [];
  let index = 0, lat = 0, lng = 0;
  const points = [];
  function next() {
    let result = 0, shift = 0, byte;
    do {
      if (index >= encoded.length || shift > 30) throw new Error('Invalid route');
      byte = encoded.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) throw new Error('Invalid route');
      result |= (byte & 31) << shift; shift += 5;
    } while (byte >= 32);
    return result & 1 ? ~(result >> 1) : result >> 1;
  }
  try {
    while (index < encoded.length) {
      lat += next(); lng += next();
      if (Math.abs(lat / 1e5) > 85 || Math.abs(lng / 1e5) > 180) return [];
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points.length > 1 ? points : [];
  } catch { return []; }
}
const section = document.querySelector('#activity');
if (section) {
  const list = section.querySelector('[data-activity-list]');
  const status = section.querySelector('[data-activity-status]');
  const profile = section.querySelector('[data-strava-profile]');
  let loading = false;
  let maps = [];
  let pendingMaps = [];
  const clearMaps = () => { maps.forEach(map => map.remove()); maps = []; pendingMaps = []; };
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
    article.append(node('p', 'STRAVA · ' + type, 'strava-sport'), node('h3', activity.name));
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
    const media = node('div', undefined, 'strava-media');
    const points = activity.sport === 'WeightTraining' ? [] : decodeRoute(activity.route);
    let photo = null;
    try {
      const url = new URL(activity.photo);
      if (url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'd3nn82uaxijpm6.cloudfront.net' || url.hostname.endsWith('.strava.com'))) photo = url.href;
    } catch {}
    if (points.length && typeof L !== 'undefined') {
      const canvas = node('div', undefined, 'strava-route');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Route for ' + activity.name);
      media.append(canvas);
      pendingMaps.push(() => {
        const map = L.map(canvas, {zoomControl:false, scrollWheelZoom:false, dragging:false, touchZoom:false, doubleClickZoom:false, boxZoom:false, keyboard:false, zoomAnimation:false, fadeAnimation:false});
        maps.push(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        const route = L.polyline(points, {color:'#fc4c02',weight:4,opacity:1}).addTo(map);
        map.fitBounds(route.getBounds(), {padding:[24,24],maxZoom:16,animate:false});
      });
    }
    if (photo) {
      const img = node('img', undefined, 'strava-photo');
      img.src = photo; img.alt = activity.name;
      img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      img.onerror = () => { img.remove(); if (!media.children.length) media.append(node('span', type, 'strava-media-label')); };
      media.append(img);
    }
    if (!media.children.length) media.append(node('span', type === 'Weight training' ? 'Strength session' : 'Outdoor session', 'strava-media-label'));
    if (points.length && photo) media.className += ' strava-media-pair';
    article.append(media);
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
      if (!data.connected) { section.hidden = true; clearMaps(); list.replaceChildren(); return; }
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
      clearMaps();
      list.replaceChildren(...activities.map(card));
      pendingMaps.forEach(render => render());
      pendingMaps = [];
    } catch {
      clearMaps(); list.replaceChildren(); delete list.dataset.ids;
      if (!section.hidden) status.textContent = 'Activity updates are temporarily unavailable.';
    } finally { loading = false; }
  }
  load();
  setInterval(() => { if (!document.hidden) load(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
}
