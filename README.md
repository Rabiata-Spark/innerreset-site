# InnerReset marketing site

The public, static marketing site for [innerreset.life](https://innerreset.life). It is built with hand-written HTML, CSS, and vanilla JavaScript; there is no framework, build step, or bundler.

## Run locally

Serve the repository root with any static file server, then open the printed local URL. For example:

```sh
npx serve .
```

or:

```sh
python -m http.server 8000
```

Opening `index.html` directly is not recommended because motion-asset availability checks use HTTP `HEAD` requests.

## Motion assets

Production MP4 clips and posters live in `assets/motion/`. `manifest.json` maps each motion slot to its clip and poster; update that manifest when replacing an asset rather than hard-coding media paths in the page.

The manifest is fetched once. Video sources are attached only when their slot intersects the viewport, and are never attached when reduced motion is requested. If the manifest cannot load, every slot keeps its CSS/static fallback silently.

## Hosting and DNS

GitHub Pages serves the committed files directly. `CNAME` maps the Pages site to `innerreset.life`; the domain’s DNS records must continue to point to GitHub Pages. Keep `CNAME` unchanged.
