// Publish an allowlisted summary of this owner's public activities; credentials stay encrypted.
const ORIGIN = 'https://erickbenitez.com';
const API = 'https://www.strava.com/api/v3';
const TYPES = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'WeightTraining']);
const encoder = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);
const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const reply = (body, status = 200) => Response.json(body, {status, headers: {'cache-control': 'no-store'}});
const logFailure = () => console.error(JSON.stringify({event: 'strava_operation_failed'}));

async function key(env) {
  if (!env.STRAVA_ENCRYPTION_KEY) throw new Error('Strava not configured');
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(env.STRAVA_ENCRYPTION_KEY));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function seal(env, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await key(env), encoder.encode(JSON.stringify(value)));
  return `${encode(iv)}.${encode(encrypted)}`;
}
export async function unseal(env, value) {
  const [iv, ciphertext] = value.split('.');
  const plain = await crypto.subtle.decrypt({name: 'AES-GCM', iv: decode(iv)}, await key(env), decode(ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function equalSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !b) return false;
  const k = await crypto.subtle.importKey('raw', encoder.encode(b), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign('HMAC', k, encoder.encode(b));
  return crypto.subtle.verify('HMAC', k, signature, encoder.encode(a));
}
const stateRow = env => env.DB.prepare('SELECT * FROM strava_state WHERE id = 1').first();
async function saveAuth(env, auth) {
  await env.DB.prepare('UPDATE strava_state SET encrypted = ? WHERE id = 1').bind(await seal(env, auth)).run();
}
async function boundedJSON(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  let body = ''; let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new Error('Body too large'); }
      body += decoder.decode(value, {stream: true});
    }
    return JSON.parse(body + decoder.decode());
  } finally { reader.releaseLock(); }
}
async function postForm(url, body) {
  return fetch(url, {method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams(body), signal: AbortSignal.timeout(8000)});
}
async function token(env, auth) {
  if (auth.expiresAt > now() + 120) return auth.accessToken;
  const response = await postForm('https://www.strava.com/oauth/token', {
    client_id: auth.clientId, client_secret: auth.clientSecret,
    grant_type: 'refresh_token', refresh_token: auth.refreshToken
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      await env.DB.prepare('DELETE FROM strava_state WHERE id = 1').run();
    }
    throw new Error('Token unavailable');
  }
  const result = await response.json();
  auth.accessToken = result.access_token;
  auth.refreshToken = result.refresh_token;
  auth.expiresAt = result.expires_at;
  // Persist rotated refresh tokens before using the new access token.
  await saveAuth(env, auth);
  return auth.accessToken;
}
export function publicActivities(activities, athleteId) {
  return activities.filter(activity =>
    Number.isSafeInteger(activity.id) && activity.id > 0 &&
    String(activity.athlete?.id) === String(athleteId) &&
    activity.visibility === 'everyone' && activity.private !== true &&
    TYPES.has(activity.sport_type || activity.type)
  ).sort((a, b) => Date.parse(b.start_date) - Date.parse(a.start_date))
    .slice(0, 6).map(activity => ({
      id: String(activity.id),
      name: typeof activity.name === 'string' ? activity.name.slice(0, 200) : 'Activity',
      sport: activity.sport_type || activity.type,
      startDate: Number.isFinite(Date.parse(activity.start_date)) ? activity.start_date : null,
      timezone: typeof activity.timezone === 'string' ? activity.timezone.replace(/^\(GMT[^)]+\)\s*/, '') : 'UTC',
      distance: metric(activity.distance),
      movingTime: metric(activity.moving_time),
      elapsedTime: metric(activity.elapsed_time),
      elevation: metric(activity.total_elevation_gain),
      photo: publicPhoto(activity.photos?.primary?.urls),
      photos: [publicPhoto(activity.photos?.primary?.urls)].filter(Boolean),
      mediaVersion: 3,
      route: typeof activity.map?.summary_polyline === 'string' && activity.map.summary_polyline.length <= 20000 ? activity.map.summary_polyline : null,
    }));
}
const metric = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
export function publicPhoto(urls) {
  for (const value of Object.entries(urls || {}).sort(([a], [b]) => Number(b) - Number(a)).map(([, value]) => value)) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password &&
          (['d3nn82uaxijpm6.cloudfront.net', 'dgtzuqphqg23d.cloudfront.net'].includes(url.hostname) || url.hostname.endsWith('.strava.com'))) return url.href;
    } catch {}
  }
  return null;
}
async function sync(env, force = false) {
  const stamp = now();
  const lease = await env.DB.prepare('UPDATE strava_state SET lock_until = ? WHERE id = 1 AND lock_until < ? AND (? = 1 OR synced_at < ?) RETURNING *')
    .bind(stamp + 60, stamp, force ? 1 : 0, stamp - 900).first();
  if (!lease) return;
  try {
    const auth = await unseal(env, lease.encrypted);
    const accessToken = await token(env, auth);
    const response = await fetch(`${API}/athlete/activities?per_page=100&page=1`, {
      headers: {authorization: `Bearer ${accessToken}`}, signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Activity list unavailable');
    const activities = await response.json();
    if (!Array.isArray(activities)) throw new Error('Invalid activity list');
    const feed = publicActivities(activities, auth.athleteId);
    // The summary endpoint omits photos. Fetch details only for cards with photos.
    await Promise.all(feed.map(async (item, index) => {
      const summary = activities.find(activity => String(activity.id) === item.id);
      if (!summary?.total_photo_count) return;
      try {
        const detailResponse = await fetch(`${API}/activities/${item.id}`, {
          headers: {authorization: `Bearer ${accessToken}`}, signal: AbortSignal.timeout(5000)
        });
        if (detailResponse.status === 404) { feed[index] = null; return; }
        if (!detailResponse.ok) return; // A missing photo must not hide a valid activity.
        const detail = await detailResponse.json();
        const safe = publicActivities([detail], auth.athleteId)[0];
        feed[index] = safe?.id === item.id ? {...safe, route: item.route} : null;
        if (!feed[index]) return;
        // A detail response only includes the primary photo. Request the album separately.
        const photosResponse = await fetch(`${API}/activities/${item.id}/photos?size=1200&photo_sources=1`, {
          headers: {authorization: `Bearer ${accessToken}`}, signal: AbortSignal.timeout(5000)
        });
        if (photosResponse.ok) {
          const album = await photosResponse.json();
          if (Array.isArray(album)) {
            const photos = [...new Set(album.map(photo => publicPhoto(photo?.urls)).filter(Boolean))];
            if (photos.length) feed[index].photos = photos;
          }
        }
      } catch { /* Render summary without a photo during a transient failure. */ }
    }));
    await env.DB.prepare('UPDATE strava_state SET feed = ?, synced_at = ?, lock_until = 0 WHERE id = 1 AND lock_until = ? AND revision = ?')
      .bind(JSON.stringify(feed.filter(Boolean)), stamp, stamp + 60, lease.revision).run();
  } catch {
    // Back off after upstream failures and avoid serving stale personal data.
    await env.DB.prepare('UPDATE strava_state SET lock_until = ? WHERE id = 1 AND lock_until = ?')
      .bind(stamp + 300, stamp + 60).run();
    logFailure();
  }
}
async function feed(env) {
  if (!env.DB || !env.STRAVA_ENCRYPTION_KEY) return reply({connected: false, activities: []});
  const before = await stateRow(env);
  const oldFormat = before && JSON.parse(before.feed).some(item => item.mediaVersion !== 3);
  await sync(env, Boolean(oldFormat));
  const row = await stateRow(env);
  if (!row) return reply({connected: false, activities: []});
  const auth = await unseal(env, row.encrypted);
  const stale = row.synced_at < now() - 3600;
  return reply({connected: true, activities: stale ? [] : JSON.parse(row.feed), unavailable: stale,
    profileUrl: `https://www.strava.com/athletes/${auth.athleteId}`});
}
function html(body, status = 200, cookie = null) {
  const headers = {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Connect Strava</title><link rel="stylesheet" href="/strava-setup.css"></head><body><main>${body}</main></body></html>`, {status, headers});
}
const clearCookie = 'strava_state=; Path=/strava/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
function setupPage() {
  return html(`<h1>Connect your Strava</h1><p>Owner setup for Erick’s portfolio. Only public runs, walks, and weight-training activities will be shown.</p>
  <form id="strava-setup"><label>Setup key<input name="setupKey" type="password" required autocomplete="off"></label>
  <label>Client ID<input name="clientId" required inputmode="numeric"></label>
  <label>Client Secret<input name="clientSecret" type="password" required autocomplete="off"></label>
  <label>Your athlete ID<input name="athleteId" required inputmode="numeric"></label>
  <p class="hint">The athlete ID is the number at the end of your Strava profile URL. Set the app’s callback domain to <strong>erickbenitez.com</strong>.</p>
  <button>Continue to Strava</button><p id="status" role="status"></p></form><script src="/strava-setup.js"></script>`);
}
async function connect(request, env) {
  if (request.headers.get('origin') !== ORIGIN) return reply({error: 'Invalid origin'}, 403);
  if (!env.DB || !env.STRAVA_SETUP_KEY || !env.STRAVA_ENCRYPTION_KEY) return reply({error: 'Connection setup is not ready yet.'}, 503);
  const body = await boundedJSON(request);
  if (!await equalSecret(body.setupKey, env.STRAVA_SETUP_KEY)) return reply({error: 'Invalid setup key.'}, 403);
  if (!/^\d{1,20}$/.test(body.clientId) || !/^\d{1,20}$/.test(body.athleteId) || typeof body.clientSecret !== 'string' || body.clientSecret.length < 10 || body.clientSecret.length > 200) return reply({error: 'Check your app details.'}, 400);
  const state = crypto.randomUUID();
  const auth = {clientId: body.clientId, clientSecret: body.clientSecret, athleteId: body.athleteId};
  await env.DB.batch([
    env.DB.prepare('DELETE FROM strava_pending WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO strava_pending (state, encrypted, expires_at) VALUES (?, ?, ?)').bind(state, await seal(env, auth), now() + 600)
  ]);
  const target = new URL('https://www.strava.com/oauth/authorize');
  target.search = new URLSearchParams({client_id: auth.clientId, redirect_uri: `${ORIGIN}/strava/callback`, response_type: 'code', approval_prompt: 'force', scope: 'read,activity:read', state});
  return Response.json({url: target.href}, {headers: {'cache-control': 'no-store', 'set-cookie': `strava_state=${state}; Path=/strava/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`}});
}
async function subscribe(env, auth) {
  // Reuse this app's subscription if already connected; never delete another app's callback.
  const query = new URLSearchParams({client_id: auth.clientId, client_secret: auth.clientSecret});
  const response = await fetch(`${API}/push_subscriptions?${query}`, {signal: AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error('Subscription check failed');
  const subscriptions = await response.json();
  const callback = `${ORIGIN}/api/strava/webhook/${auth.webhookKey}`;
  if (subscriptions.length) {
    const existing = subscriptions.find(item => item.callback_url === callback);
    if (!existing) throw new Error('App already has a different webhook');
    auth.subscriptionId = existing.id;
  } else {
    const result = await postForm(`${API}/push_subscriptions`, {client_id: auth.clientId, client_secret: auth.clientSecret, callback_url: callback, verify_token: auth.webhookKey});
    if (!result.ok) throw new Error('Subscription creation failed');
    auth.subscriptionId = (await result.json()).id;
  }
  await saveAuth(env, auth);
}
async function callback(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith('strava_state='))?.slice(13);
  if (!state || !await equalSecret(state, cookie)) return html('<h1>Connection expired</h1><p>Return to the setup link and try again.</p>', 400, clearCookie);
  const pending = await env.DB.prepare('DELETE FROM strava_pending WHERE state = ? AND expires_at > ? RETURNING *').bind(state, now()).first();
  if (!pending || !url.searchParams.get('code') || !(url.searchParams.get('scope') || '').split(',').includes('activity:read')) return html('<h1>Connection not completed</h1><p>Please try again and allow access to your activities.</p>', 400, clearCookie);
  const auth = await unseal(env, pending.encrypted);
  const response = await postForm('https://www.strava.com/oauth/token', {client_id: auth.clientId, client_secret: auth.clientSecret, grant_type: 'authorization_code', code: url.searchParams.get('code')});
  if (!response.ok) return html('<h1>Could not connect</h1><p>Please check the app details and try again.</p>', 400, clearCookie);
  const result = await response.json();
  if (String(result.athlete?.id) !== auth.athleteId) return html('<h1>Different Strava account</h1><p>Sign in to the account matching the athlete ID you entered.</p>', 403, clearCookie);
  const existing = await stateRow(env);
  const old = existing ? await unseal(env, existing.encrypted) : null;
  Object.assign(auth, {accessToken: result.access_token, refreshToken: result.refresh_token, expiresAt: result.expires_at,
    webhookKey: old?.clientId === auth.clientId ? old.webhookKey : crypto.randomUUID(), subscriptionId: null});
  await env.DB.prepare('INSERT INTO strava_state (id, encrypted, feed, synced_at, lock_until) VALUES (1, ?, ?, 0, 0) ON CONFLICT(id) DO UPDATE SET encrypted=excluded.encrypted, feed=excluded.feed, synced_at=0, lock_until=0')
    .bind(await seal(env, auth), '[]').run();
  let subscribed = true;
  try { await subscribe(env, auth); } catch { subscribed = false; logFailure(); }
  await sync(env, true);
  return html(`<h1>Strava connected</h1><p>${subscribed ? 'New public runs, walks, and lifts will appear automatically.' : 'Your account is connected, but automatic activity notifications could not be enabled. Please return to Codex to finish this step.'}</p><p><a href="/about/#activity">View your activity section</a></p>`, 200, clearCookie);
}
async function webhook(request, env, suppliedKey, ctx) {
  const row = await stateRow(env);
  if (!row) return reply({ok: true});
  const auth = await unseal(env, row.encrypted);
  if (!await equalSecret(suppliedKey, auth.webhookKey)) return reply({error: 'Not found'}, 404);
  if (request.method === 'GET') {
    const url = new URL(request.url);
    if (url.searchParams.get('hub.mode') !== 'subscribe' || !await equalSecret(url.searchParams.get('hub.verify_token'), auth.webhookKey)) return reply({error: 'Invalid verification'}, 403);
    return reply({'hub.challenge': url.searchParams.get('hub.challenge')});
  }
  if (request.method !== 'POST') return reply({error: 'Method not allowed'}, 405);
  const event = await boundedJSON(request);
  if (String(event.owner_id) !== String(auth.athleteId) || event.subscription_id !== auth.subscriptionId) return reply({ok: true});
  if (event.object_type === 'athlete' && event.updates?.authorized === 'false') {
    await env.DB.prepare('DELETE FROM strava_state WHERE id = 1').run();
  } else if (event.object_type === 'activity') {
    // Drop cached IDs first: never retain a deleted or newly-private activity during a refresh.
    await env.DB.prepare('UPDATE strava_state SET feed = ?, synced_at = 0, revision = revision + 1 WHERE id = 1').bind('[]').run();
    ctx.waitUntil(sync(env, true).catch(logFailure));
  }
  return reply({ok: true});
}
export async function handleStrava(request, env, ctx) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/strava') && !path.startsWith('/strava/')) return null;
  try {
    if (path === '/api/strava' && request.method === 'GET') return await feed(env);
    if (path === '/strava/setup' && request.method === 'GET') return setupPage();
    if (path === '/strava/connect' && request.method === 'POST') return await connect(request, env);
    if (path === '/strava/callback' && request.method === 'GET') return await callback(request, env);
    if (path.startsWith('/api/strava/webhook/')) return await webhook(request, env, path.split('/').pop(), ctx);
    return reply({error: 'Not found'}, 404);
  } catch { logFailure(); return reply({error: 'Strava is temporarily unavailable.'}, 503); }
}
