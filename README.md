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

## Strava activity cards

The About page automatically shows custom cards for the six latest public runs, walks, and weight-training activities among the account's latest 100 uploads. No per-activity embed code is required. Cards show title, sport, activity date/time, duration, distance/elevation where relevant, and the primary photo when Strava provides one. Cards include an orange route on an OpenStreetMap basemap when Strava supplies a summary route. Full GPS streams and full photo galleries are not included. Leaflet is vendored at version 1.9.4 with its license.

The Worker keeps OAuth credentials encrypted and publishes only allowlisted activity fields. Private activities, other athletes, raw start/end coordinates, full GPS streams, health metrics, and private notes are excluded. Only the summary route is displayed; a missing summary is never replaced with the full route. A webhook clears the cached feed on activity changes and refreshes it. Visits also refresh the shared upstream cache after 15 minutes; visible pages check the site endpoint every minute. Photos require a bounded detail request only for activities that report photos. Deauthorization deletes the connection.

The owner explicitly requested public API-based cards. This is not a private display: anyone can read the published summaries. Strava platform approval remains unverified.


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

## Studio design

The published home, About, and Journal pages use a dark-only charcoal theme in `dist/assets/studio/`. Existing photo carousels, centered photo dialogs, book controls, Spotify polling, and Strava feeds are preserved. The home page includes the full experience timeline and all six projects.

The GitHub calendar loads public contribution counts through `/api/github/contributions`, cached for six hours at the edge. It needs no token. A dated bundled snapshot is the fallback if GitHub is unavailable or changes its calendar markup. No private repository metadata is fetched.
