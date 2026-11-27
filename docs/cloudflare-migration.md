# Cloudflare hosting migration

## Status — November 26, 2026

**Production is now hosted directly on Cloudflare at https://erickbenitez.com.** The domain has been detached from Sites. The old Sites project remains an archive, not a runtime or deployment dependency.

- Worker: `erick-portfolio`
- Test URL: https://erick-portfolio.erick-benitez336.workers.dev
- Account: `13502e5876b6e5a3e06c767683e76f05`
- D1: `erick-portfolio` (`6711ca39-fe00-4af7-8450-2dfca133423f`)
- Source: `wrangler.jsonc`; generated code and assets: `dist/server` and `dist/client`
- Existing `.openai/hosting.json` remains a historical reference.

The six database tables have been created from the existing migrations. The workstation daily history (56 rows), agent peaks (39 rows), live row, and encrypted Strava connection row were copied. Pending OAuth requests and rate-limit windows were deliberately not copied. The workstation bearer-secret hash was transferred securely from the existing Mac Keychain item.

Spotify and Strava were reauthorized directly. The Strava account was encrypted with a new Cloudflare secret, preserving its existing webhook subscription and limited `read,activity:read` scopes. Spotify uses `user-read-currently-playing`. Temporary local OAuth credentials were removed after installation.

## Deploy without Sites

```sh
npm ci
npm run build
npx wrangler deploy --dry-run
npx wrangler d1 migrations apply DB --remote
npx wrangler deploy
```

Wrangler uses the owner's Cloudflare login. Secrets belong in Cloudflare Worker secrets, never source, logs, or command arguments. Use `wrangler secret bulk` with protected stdin.

Required integrations:

- Spotify: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, optional `SPOTIFY_PROFILE_URL`.
- Strava: `STRAVA_ENCRYPTION_KEY`, `STRAVA_SETUP_KEY`, plus the encrypted authorized account in D1.
- Workstation: `WORKSTATION_INGEST_SECRET_SHA256` (already configured).

## Completed cutover

The custom domain is declared in `wrangler.jsonc`. Cloudflare manages its DNS and certificate. Google email and verification DNS records were preserved. Workstation history was refreshed immediately before cutover, and a fresh heartbeat reached the new D1 database afterward.

The previous apex DNS records were unproxied A records `172.66.3.26` and `162.159.143.30`. These are historical rollback references only: restoring Sites would also require reattaching its custom domain. The old Sites project and database were retained as an archive.

## Validation

- Build and Wrangler dry run passed.
- All five main pages return HTTP 200 through the production custom domain; removed Causes returns 404.
- Spotify returns current playback; Strava returns the connected account and six activities.
- Existing Strava webhook verification succeeds through the production domain.
- GitHub contributions and workstation history return HTTP 200.
- A fresh workstation heartbeat was observed in Cloudflare at 2026-11-27T00:13:30.623Z.
- Full suite: 49 pass, 3 fail, 1 skipped. Failures are old assertions expecting a bookshelf on Work/About and the removed short-name alias; these files were unchanged by the migration.
