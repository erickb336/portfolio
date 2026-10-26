const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'public, max-age=20, s-maxage=20');
  return new Response(JSON.stringify(data), {...init, headers});
}

async function spotifyToken(env, body) {
  const auth = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  return fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {'authorization': `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(body), signal: AbortSignal.timeout(5000)
  });
}

function sanitizeTrack(payload, isPlaying, playedAt = null) {
  const item = payload?.item || payload?.track;
  if (!item) return null;
  return {
    isPlaying,
    title: item.name,
    artist: item.artists?.map(artist => artist.name).join(', ') || 'Spotify',
    album: item.album?.name || '',
    albumImage: item.album?.images?.[0]?.url || null,
    trackUrl: item.external_urls?.spotify || 'https://open.spotify.com/',
    progressMs: isPlaying ? payload.progress_ms || 0 : 0,
    durationMs: item.duration_ms || 0,
    playedAt,
    profileUrl: null
  };
}

async function nowPlaying(env) {
  if (!env.SPOTIFY_REFRESH_TOKEN) return json({error: 'not_connected'}, {status: 503});
  const tokenResponse = await spotifyToken(env, {grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN});
  if (!tokenResponse.ok) return json({error: 'token_refresh_failed'}, {status: 503});
  const {access_token: accessToken} = await tokenResponse.json();
  if (typeof accessToken !== 'string' || !accessToken) return json({error: 'token_refresh_failed'}, {status: 503});
  const headers = {'authorization': `Bearer ${accessToken}`};
  const current = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {headers, signal: AbortSignal.timeout(5000)});
  if (!current.ok) return json({error: 'playback_unavailable'}, {status: 503});
  if (current.status !== 204) {
    const payload = await current.json();
    const track = sanitizeTrack(payload, Boolean(payload.is_playing));
    if (track) return json(track);
  }
  const recent = await fetch(`${SPOTIFY_API}/me/player/recently-played?limit=1`, {headers, signal: AbortSignal.timeout(5000)});
  if (!recent.ok) return json({error: 'playback_unavailable'}, {status: 503});
  const payload = await recent.json();
  const latest = payload.items?.[0];
  const track = sanitizeTrack(latest, false, latest?.played_at || null);
  return track ? json(track) : json({error: 'no_tracks'}, {status: 404});
}


// Only sanitized owner data enters this cache. Caller input never enters the key.
// This cache is local to a Cloudflare data center, not a global rate limiter.
export async function spotify(request, env) {
  if (request.method !== 'GET') {
    return new Response(null, {status: 405, headers: {Allow: 'GET', 'Cache-Control': 'no-store'}});
  }
  const key = new Request('https://erickbenitez.com/api/spotify');
  let cache;
  try {
    cache = await caches.open('portfolio-spotify-v1');
    const hit = await cache.match(key);
    if (hit) {
      const saved = await hit.json();
      return publicResponse(saved.body, saved.status, saved.ttl);
    }
  } catch {
    // A cache outage must not turn every visitor into another upstream request.
    return unavailable();
  }

  let body, status;
  try {
    const response = await nowPlaying(env);
    status = response.status;
    body = await response.json();
    if (response.ok && env.SPOTIFY_PROFILE_URL) body.profileUrl = env.SPOTIFY_PROFILE_URL;
  } catch {
    status = 503;
    body = {error: 'temporarily_unavailable'};
  }
  const ttl = status === 200 || status === 404 ? 20 : 5;
  // Store a 200 envelope so failures can also have a server-side cooldown.
  // Await the write before replying; no tokens or upstream errors enter it.
  try {
    await cache.put(key, Response.json({body, status, ttl}, {
      headers: {'Cache-Control': `public, max-age=${ttl}`}
    }));
  } catch {
    return unavailable();
  }
  return publicResponse(body, status, ttl);
}

function publicResponse(body, status, ttl) {
  return Response.json(body, {status, headers: {
    'Cache-Control': status === 200 ? `public, max-age=${ttl}` : 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }});
}

function unavailable() {
  return publicResponse({error: 'temporarily_unavailable'}, 503, 0);
}
