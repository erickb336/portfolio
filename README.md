# Erick Benitez-Ramos — Portfolio

My personal website combines my software engineering portfolio with a journal about the people, places, and experiences that have shaped my life.

**Live site:** [erickbenitez.com](https://erickbenitez.com)

## What’s included

- Selected engineering work and career experience
- Notes on what I’m currently building and exploring
- An About page covering my background and interests
- A photo journal featuring family, growing up, Korea, Mexico, and Seattle
- Books I have read and want to read
- Live Spotify activity with links to the current song and my profile
- Search metadata, structured data, a sitemap, and social preview images

## Built with

- Semantic HTML
- CSS with responsive layouts and light/dark themes
- Vanilla JavaScript
- A small Cloudflare Worker-compatible endpoint for Spotify activity
- OpenAI Sites hosting

## Run locally

From the repository root, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The pages and interactions work without installing dependencies or running a build. The Spotify card uses a hosted server endpoint, so its live data is available on the published website rather than through the local static server.

## Project structure

```text
dist/
├── index.html          # Main portfolio page
├── about/              # About page
├── journal/            # Photo journal
├── books/              # Bookshelf
├── photos/             # Optimized site photography
├── sample/             # Shared page styles
├── server/index.js     # Spotify activity endpoint
├── script.js           # Site interactions
└── styles.css           # Main-page styling
```

`scripts/prepare-worker-assets.mjs` prepares the static assets for the hosted Worker deployment.

## Publishing

The production site is published through the existing OpenAI Sites project. Successful site publications are also committed and pushed to this repository’s `main` branch.

Spotify credentials are stored as encrypted hosting secrets and are never committed to the repository.

## Strava activity embeds

The About page can show the six latest public runs, walks, and weight-training activities among the account's latest 100 uploads. Strava's official embed script renders each activity; its supported layout determines whether photos are shown. The section remains hidden until an account is connected.

The Worker discovers activity IDs, stores a small shared feed, and refreshes it at most every 15 minutes when visited. A Strava webhook invalidates the feed when activities change; deauthorization removes the saved account. Deleted/private activities are removed from the cache before refreshing. Only activity IDs and the profile URL reach the public feed endpoint. We do not copy photos or expose API tokens. Public API-to-embed use is not explicitly exempted by Strava's API agreement; platform approval remains unverified.

### Owner connection

1. Create an app at `https://www.strava.com/settings/api` (Strava currently requires a subscription). Use `erickbenitez.com` as Authorization Callback Domain.
2. Configure random `STRAVA_ENCRYPTION_KEY` and `STRAVA_SETUP_KEY` hosting secrets. Preserve the encryption key across deployments; changing it makes existing encrypted connections unreadable.
3. Publish with the `DB` D1 binding and generated `drizzle/` migrations.
4. Open `https://erickbenitez.com/strava/setup`. Enter the setup key, Client ID, Client Secret, and your numeric athlete ID. These are sent directly to the backend; never commit them or put them in a URL query string.
5. Approve `read,activity:read` on Strava. The callback validates a one-use state, secure browser cookie, granted scope, and expected athlete ID. It saves encrypted credentials and registers the webhook. A different existing webhook is not deleted automatically.
6. Verify a real public run, walk, and lift after connecting. No live activity/photo validation is possible before authorization.

Credentials and rotating tokens are encrypted with AES-GCM before D1 storage. Setup is owner-key protected; visitors cannot attach their own accounts. Do not expose setup keys or the private webhook callback URL. Connection pages are excluded from indexing.

### Development

Run `npm ci` once, `npm test` for the Strava checks, and `npm run build` to bundle the Worker and prepare static assets. The static preview does not run Strava or Spotify endpoints. Server source lives in `server/`; `dist/server/index.js` is generated. Database schema is in `db/schema.ts`; generate append-only migrations with `npm run db:generate`.
