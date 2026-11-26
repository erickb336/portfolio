# Cloudflare hosting migration

## Status — November 26, 2026

The independent Cloudflare deployment is prepared. **The production domain still points to OpenAI Sites.** Do not detach the old hosting until Spotify and Strava work on Cloudflare.

- Worker: `erick-portfolio`
- Test URL: https://erick-portfolio.erick-benitez336.workers.dev
- Account: `13502e5876b6e5a3e06c767683e76f05`
- D1: `erick-portfolio` (`6711ca39-fe00-4af7-8450-2dfca133423f`)
- Source: `wrangler.jsonc`; generated code and assets: `dist/server` and `dist/client`
- Existing `.openai/hosting.json` remains a historical reference.

The six database tables have been created from the existing migrations. The workstation daily history (56 rows), agent peaks (39 rows), live row, and encrypted Strava connection row were copied. Pending OAuth requests and rate-limit windows were deliberately not copied. The workstation bearer-secret hash was transferred securely from the existing Mac Keychain item.

The copied Strava connection cannot be decrypted without the old encryption key. Reconnect it before switching the domain; do not merely set a new encryption key and attempt to use the old ciphertext. Preserve the existing Strava webhook callback when reconnecting, or explicitly replace this portfolio's old subscription after cutover. Do not delete unrelated subscriptions.

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

## Remaining cutover work

1. Finish Spotify authorization and install its credentials; verify `/api/spotify` succeeds.
2. Reconnect Strava, re-encrypt the account with a new Cloudflare secret, and verify the correct athlete and public activities. Keep scopes limited to `read,activity:read`.
3. Refresh workstation history from Sites immediately before cutover so new daily values are retained.
4. Attach `erickbenitez.com` as a Worker custom domain and add the custom-domain route to `wrangler.jsonc`. Preserve Google email and verification DNS records.
5. Verify all pages, assets, Spotify, Strava photos, webhook behavior, and live workstation updates through the custom domain.
6. Detach the custom domain from Sites only after successful cutover. Update README and AGENTS.md to make Cloudflare the production publishing workflow, and push to GitHub `main`.

Current apex DNS rollback records are two unproxied A records: `172.66.3.26` and `162.159.143.30`. Do not delete the old Sites project or its database as part of an unverified cutover.

## Validation so far

- Build and Wrangler dry run passed.
- All five main pages return HTTP 200 on the independent Worker.
- GitHub contributions and workstation history return HTTP 200.
- Full suite: 49 pass, 3 fail, 1 skipped. Failures are old assertions expecting a bookshelf on Work/About and the removed short-name alias; these files were unchanged by the migration.
- Spotify and Strava are not yet configured on the independent Worker. Production remains on Sites.
