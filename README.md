# Erick Benitez-Ramos — Portfolio

My personal portfolio: software engineering experience, projects, current interests, reading, photography, and milestones.

**Live site:** [erickbenitez.com](https://erickbenitez.com)

## Built with

- HTML, CSS, and vanilla JavaScript
- Responsive purple-and-black design with dark/light themes
- Clickable highlights deck and an AWS career timeline
- Search metadata, social preview, sitemap, and robots.txt

## Run locally

From the repository root, with Python 3 installed:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. No build step or package installation is required.

## Files

- `dist/index.html`: page content and metadata
- `dist/styles.css`: styling and responsive layout
- `dist/script.js`: theme switching and highlight navigation
- `dist/og.png`: social preview image
- `dist/robots.txt` and `dist/sitemap.xml`: crawler discovery

## Hosting

The live site is hosted on OpenAI Sites. Cloudflare manages the domain and DNS. This repository contains the public site source; publishing here does not automatically deploy the live site. Hosting configuration and credentials are excluded.
