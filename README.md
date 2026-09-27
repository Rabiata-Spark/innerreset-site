# InnerReset marketing site

The public static site for [innerreset.life](https://innerreset.life). It uses hand-written HTML, CSS, and vanilla JavaScript with no framework, bundler, or runtime third-party requests.

## Run locally

Serve the repository root over HTTP, then open the printed URL:

```sh
npx serve .
```

or:

```sh
python -m http.server 8000
```

Use the HTTP preview to test font loading, relative assets and legal routes consistently with production.

## Validate and publish

There is no application build or bundler. The checked-in HTML, CSS, JavaScript, fonts and optimized images are the deployable site.

```sh
node scripts/check-website.mjs
node --check main.js
git diff --check
```

The checks cover content/links, artwork hashes and dimensions, local fonts, keyboard tabs, mobile navigation and accessibility fallbacks. Merging a validated pull request into `main` triggers the GitHub Pages build. Confirm that build succeeds and verify the live domain before calling a release complete.

## Living Page assets

Current runtime artwork lives in `assets/living-page/`; its manifest records source provenance, hashes and output dimensions. Fonts are self-hosted with their licenses. Main website titles use Kaushan Script; the wordmark and supporting serif use Cinzel, with Inter for reading text.

Approved/rejected visual drafts and original generation history remain local under `.impeccable/mocks/` and `.impeccable/production/`. They are not deployment dependencies and are intentionally gitignored, as are `.dev/` previews and QA captures. Retain these local sources for future asset authoring.

`scripts/prepare-living-page-assets.mjs` prepares derivatives from the sibling app checkout and local source masters. It is an asset-authoring tool, not a required build step for deployment. Do not run historical media rebuild commands for the current landing page.

## Historical media tooling

Source masters are local working material under `.dev/art-masters/` and `.dev/motion-masters/`; they are intentionally gitignored. Generated, deployable derivatives live under `assets/`.

Install the pinned local tooling once:

```sh
cd scripts
npm install
```

When art masters change, rebuild responsive images and the Open Graph card:

```sh
npm run make:images
```

When motion masters change, rebuild the four seamless loops, posters, and manifest:

```sh
npm run make:loops
```

Or rebuild everything in order:

```sh
npm run make:assets
```

`make-loops.mjs` crossfades each clip’s final 0.72 seconds into its opening and shortens the result to approximately 9.36 seconds. M4’s black-padded master is cropped to its central 3:1 content band before being scaled to 1920×640. The script encodes VP9 WebM and fast-start H.264 MP4, enforces the 6 MB hero / 4 MB secondary budgets, extracts AVIF/WebP/JPG posters, removes superseded `ir-*` v1 files, and writes `assets/motion/manifest.json`.

These commands and the motion manifest belong to the previous site. The current Living Page landing uses static portraits and finite CSS transitions; it does not fetch the old motion manifest or autoplay audio/video.

## Hosting and DNS

GitHub Pages serves committed files directly. `CNAME` must remain exactly `innerreset.life`.
