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

Opening `index.html` directly is not supported because the motion manifest is fetched from the same origin.

## Rebuild media

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

The page fetches the manifest once. Video sources are attached only when a motion slot approaches the viewport, playback pauses outside the viewport, and reduced-motion users receive posters without video sources.

## Hosting and DNS

GitHub Pages serves committed files directly. `CNAME` must remain exactly `innerreset.life`.
