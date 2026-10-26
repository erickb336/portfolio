# Spotify cache review

Prepared locally on 2026-10-25. No deployment or hosting rule changes.

The Spotify handler caches sanitized owner playback for 20 seconds. Requests
with query strings and cache-busting headers share the same cache entry.
Failures have a five-second server cooldown. Empty history has a 20-second
cooldown. Error responses tell browsers not to cache them.

Each upstream request has a five-second timeout. Playback errors stop the
lookup rather than making another request for recent tracks. No current track
still falls back to recent history. Cache failures return 503 rather than
bypassing the cache. This trades availability during a cache outage for fewer
upstream requests. Logs contain a fixed event name, not exception details.

## Evidence

Run from this checkout:

    npm run build
    HEARTBEAT_REFERENCE=/Users/erickb336/workspace/agent-heartbeat npm test

The Spotify tests exercise the real handler and bundled Worker with simulated
Spotify and Cache API responses. 101 sequential calls within one cache window
make two upstream requests (token plus playback), compared with 202 without
server caching. The expiry check confirms a new fetch after 20 seconds.
Provider errors, recent-track fallback, empty history, unsupported methods,
cache failures, and credential markers are checked separately.

## Limits and edge controls

This is an upstream-load improvement, not flood protection. Cache API entries
are local to a data center and can be evicted. Concurrent cold misses can each
fetch Spotify. No global quota or cross-request promise is claimed.

All anonymous calls still reach the Worker. The heartbeat's D1 limiter runs
only after authentication; invalid bearer attempts therefore do not consume
that limit. Public status reads also need edge protection against floods.
GitHub uses a named cache but fetches upstream if cache access fails. Strava
uses persisted feed caching and backoff. These routes were not changed here.

The available Sites tools and hosting manifest expose no WAF rule configuration.
Existing edge policies and account entitlements remain unverified. Do not infer
that no rules exist. A hosting operator should confirm control over BOTH the
custom domain and the generated Sites hostname before applying rules.

Suggested policy for operator review (not applied):
- Public API reads: use per-IP limits with room for the five-second status poll,
  multiple tabs and shared networks. Choose thresholds from actual traffic.
- Heartbeat: apply a separate pre-authentication request limit, allowing normal
  tracker bursts and reconnects. Keep the existing authenticated D1 limit.
- Invalid credentials: where supported, count 401 responses separately. Never
  put a bearer token in a rule, log, or rate-limit key.
- Prefer API-compatible blocks/429s to browser challenges for the daemon.
- Do not apply one blanket rule to Strava webhooks or OAuth callbacks.

No live load test or deployed Cache API validation was performed. Confirm named
cache support and normal Spotify playback after an approved deployment.

References:
- https://developers.cloudflare.com/workers/runtime-apis/cache/
- https://developers.cloudflare.com/waf/rate-limiting-rules/
