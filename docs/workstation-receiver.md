# Workstation receiver

Receives only aggregate counts from [agent-heartbeat](https://github.com/erickb336/agent-heartbeat). The local daemon does not expose an inbound port. This change adds the receiving API; it does not add visitor tracking or a note inbox.

- `POST /api/workstation/heartbeat`: authenticated heartbeat and daily usage correction messages.
- `GET /api/workstation/status`: public sanitized status, with no caching.
- `WORKSTATION_INGEST_SECRET_SHA256`: hosting secret containing the SHA-256 of the daemon's dedicated bearer token. The original token remains in the Mac Keychain and travels only in the HTTPS authorization header.

The v1 schema, fixtures and MIT license are preserved under `contract/workstation`. Validation is generated with pinned Ajv 8.20.0 at build time, so the Worker never evaluates dynamic code. `server/workstation/validate.js` preserves the reference validator's consistency and value-free error rules.

Three new D1 tables hold the live lease, daily usage snapshots and a bounded rolling rate-limit window. An authenticated caller can send ten requests per rolling second. Invalid authorization never writes to D1. No request bodies, IPs, identifiers or secrets are logged by this handler.

Live and daily writes use a D1 transactional batch. The live update checks observation order atomically. Its following daily update is conditional on SQLite `changes()`, so rejected or duplicate heartbeats cannot update totals. Daily corrections can replace totals downward; they never extend the live lease. A correction newer than a heartbeat remains intact.

The receiver caps leases at 300 seconds. The daemon normally uses 90 seconds while agents run and 300 seconds while idle. A clean stop uses zero. A disconnected tracker reports an unknown agent count. Today's last reported token total remains available; Seattle midnight selects the new date, with no fallback to yesterday.

## Verification

`npm run build` regenerates the validator and Worker. `npm test` checks all contract samples, authentication, size and UTF-8 limits, clock skew, ordering, duplicate reports, corrections, rate limiting, partial coverage, expiry, day rollover and the bundled Worker.

The tracker uses undocumented local formats. Codex approval waits can count as active according to the tracker's documented limitation. This receiver cannot correct an inaccurate observation from the sender.
