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
    body: new URLSearchParams(body)
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
  const headers = {'authorization': `Bearer ${accessToken}`};
  const current = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {headers});
  if (current.ok && current.status !== 204) {
    const payload = await current.json();
    const track = sanitizeTrack(payload, Boolean(payload.is_playing));
    if (track) return json(track);
  }
  const recent = await fetch(`${SPOTIFY_API}/me/player/recently-played?limit=1`, {headers});
  if (!recent.ok) return json({error: 'playback_unavailable'}, {status: 503});
  const payload = await recent.json();
  const latest = payload.items?.[0];
  const track = sanitizeTrack(latest, false, latest?.played_at || null);
  return track ? json(track) : json({error: 'no_tracks'}, {status: 404});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/spotify') {
        const response = await nowPlaying(env);
        if (!response.ok || !env.SPOTIFY_PROFILE_URL) return response;
        const payload = await response.json();
        payload.profileUrl = env.SPOTIFY_PROFILE_URL;
        return json(payload);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('Spotify integration error', error);
      if (url.pathname.startsWith('/api/')) return json({error: 'temporarily_unavailable'}, {status: 503});
      return new Response('Temporarily unavailable', {status: 503});
    }
  }
};
