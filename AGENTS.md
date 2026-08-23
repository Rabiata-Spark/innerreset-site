# innerreset-site — agent guide

Public marketing site for InnerReset, served by GitHub Pages at https://innerreset.life.

- Static only: hand-written HTML/CSS/vanilla JS. No frameworks, no build step, no bundler.
  What is committed is what ships.
- `index.html` at the root is the page. Keep CSS in `styles.css` and JS in `main.js` unless a
  packet says otherwise.
- `assets/brand/innerreset-mark.png` is the canonical logo. NEVER redraw, recolor, or substitute
  the mark; scale and glow only.
- `assets/screens/*.png` are real product screenshots (393x852). Never generate replacement UI.
- `assets/motion/` will hold four Kling-generated loops (webm/mp4 + poster). Until they exist,
  every motion slot must degrade to its static/CSS fallback.
- `.dev/` is gitignored working material (spec, concept image). Read it; never commit it, never
  reference it from the page.
- `CNAME` must keep exactly `innerreset.life`.
- Accessibility and performance rules of `.dev/SPEC.md` §21.5–21.6, §30, §32 are hard gates:
  reduced-motion support, no autoplay audio, semantic headings, keyboard focus states.
- Copy discipline: never describe the product as an AI companion/chat; no testimonials, store
  links, streaks, scores, or medical claims. `.dev/SPEC.md` §27–28 governs claims.
- Machine-specific user paths must never appear in any committed file.
