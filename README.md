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
