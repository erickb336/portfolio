# Spotify cache review

Prepared on 2026-10-25. User authorized publication with a 15-second song-change target. No hosting rule changes.

The Spotify handler caches sanitized owner playback for 5 seconds. Requests
with query strings and cache-busting headers share the same cache entry.
Failures have a five-second server cooldown. A numeric provider Retry-After
extends it, capped at one hour. Empty history has a five-second
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
server caching. The expiry check confirms a new fetch after 5 seconds.
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

No live load test was performed. After publication, verify named cache support
and the deployed polling script. A controlled Spotify song change still needs
manual timing; provider latency and failures prevent a strict 15-second guarantee.

References:
- https://developers.cloudflare.com/workers/runtime-apis/cache/
- https://developers.cloudflare.com/waf/rate-limiting-rules/

## Product decisions preserved or affected

- No layout, bookshelf, agent animation, or activity chart changes.
- Agent status still polls every five seconds while visible; this change is Spotify-only.
- The frontend checks on load, every five seconds while visible, and when visible
  again. It uses cache: no-store, so browser caching does not add another window.
  The proposed server cache can add up to 5 seconds of track staleness, plus
  up to five seconds until the next check, excluding network and provider delays.
  The existing progress bar animates locally from the sampled playback position.
- If nothing plays, preserve the existing No Activity UI. The API can still
  return the most recent track, but the UI hides its title while paused.
- Cache outages now make Spotify temporarily unavailable instead of bypassing
  the cache. This intentionally prioritizes protection over playback availability.
- Provider failures use a five-second minimum cooldown; numeric Retry-After can
  extend that to one hour. No stale song is deliberately served after expiry.
- No new credentials, tracking, personal-data collection, or database schema.
- No new service dependency or hosting subscription. Fewer upstream calls do
  not guarantee a reduction in Worker request charges.
- Edge quotas and traffic thresholds still require separate approval.

## Refresh tradeoff

The five-second server cache plus five-second frontend poll targets roughly
10 seconds of application delay, leaving room within the requested 15 seconds
for normal network/provider latency. Hidden tabs do not poll. Requests do not
overlap and the browser request times out after 10 seconds. A failed refresh
shows unavailable rather than retaining an old Playing now claim.

For a single visitor, five-second polling can make more upstream calls than the
previous ten-second poll. Multiple visitors share the server cache. This is an
abuse/load improvement, not a guaranteed reduction for every traffic pattern.
