const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';
const REDIRECT_URI = 'https://erickbenitez.com/spotify/callback';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'public, max-age=20, s-maxage=20');
  return new Response(JSON.stringify(data), {...init, headers});
}

function cookieValue(request, name) {
  const match = request.headers.get('cookie')?.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
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

function connect(request, env) {
  const state = crypto.randomUUID();
  const url = new URL(`${SPOTIFY_ACCOUNTS}/authorize`);
  url.search = new URLSearchParams({
    client_id: env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'user-read-currently-playing user-read-recently-played user-read-private',
    state
  });
  return new Response(null, {
    status: 302,
    headers: {
      location: url.toString(),
      'set-cookie': `spotify_oauth_state=${encodeURIComponent(state)}; Path=/spotify/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'cache-control': 'no-store'
    }
  });
}

async function callback(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const expectedState = cookieValue(request, 'spotify_oauth_state');
  const code = url.searchParams.get('code');
  if (!code || !state || state !== expectedState) return new Response('Spotify authorization could not be verified.', {status: 400});
  const tokenResponse = await spotifyToken(env, {grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI});
  if (!tokenResponse.ok) return new Response('Spotify authorization failed.', {status: 502});
  const tokens = await tokenResponse.json();
  const profileResponse = await fetch(`${SPOTIFY_API}/me`, {headers:{'authorization':`Bearer ${tokens.access_token}`}});
  const profile = profileResponse.ok ? await profileResponse.json() : null;
  const escaped = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Spotify connected</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#07050d;color:#f7f3ff;font:16px system-ui}.card{width:min(680px,calc(100% - 48px));padding:36px;border:1px solid #443c54;background:#100d18}h1{margin-top:0;color:#1ed760}code{display:block;overflow-wrap:anywhere;padding:18px;background:#07050d;color:#c8ffda}</style><main class="card"><h1>Spotify connected.</h1><p>Your private connection is ready. Return to Codex so it can finish enabling the activity card.</p><code id="refresh-token">${escaped(tokens.refresh_token)}</code><code id="profile-url">${escaped(profile?.external_urls?.spotify)}</code></main>`, {headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','set-cookie':'spotify_oauth_state=; Path=/spotify/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'}});
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
      if (url.pathname === '/spotify/connect') return connect(request, env);
      if (url.pathname === '/spotify/callback') return await callback(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('Spotify integration error', error);
      if (url.pathname.startsWith('/api/')) return json({error: 'temporarily_unavailable'}, {status: 503});
      return new Response('Temporarily unavailable', {status: 503});
    }
  }
};
