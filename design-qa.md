# Living Page website — design QA

Date: 2026-09-27. Scope: local website rebuild, not a deployment.
Selected reference: `.impeccable/mocks/2026-09-27/B-two-ways.png`.
Owner selected B and required alternating male Hoshi / female Tiamat artwork.
Final independent disposition: **ship**. Remaining: **clear**.

## Reference comparison

The approved 1536×1024 comp was compared beside the opening at a 1536×1024 CSS
viewport, normalized to the same frame, in `.dev/qa/B-versus-final.png`
(reference left, implementation right).
Source portraits, full-page captures and the separate Mind state were also reviewed.

| Dimension | Result |
|---|---|
| Composition | Centered question, two open illustrated paths, central paint CTA, then four explanatory steps retained. |
| Identity | Exact current app comet mark and Cinzel/Inter replace the comp's approximate mark, invented tagline and generated serif, as recorded before implementation. |
| Material | Real app paper/paint exports and standalone ChatGPT illustrations; no CSS drawing or cropped page-comp art. |
| Representation | Hero Hoshi, hero Tiamat, library Hoshi, closing Tiamat. Both experiences remain open to everyone. |
| Content | Exact founder quote and attribution retained. Mind alone includes exact-word approval. Examples explicitly illustrative. |
| Responsive | Both paths remain visible on mobile; later content becomes one column. No horizontal overflow at verified narrow/mobile/tablet widths. |

## Capture inventory

All capture paths below are local, ignored QA evidence, not runtime dependencies.
Viewport sizes are CSS overrides. The browser provider's actual output rasters
are 1521×1014 for desktop, 1265×889 for narrow desktop and 375×812 for mobile.

| Capture | State / viewport |
|---|---|
| `.dev/qa/desktop-review-2.png` | Final opening, 1536×1024 |
| `.dev/qa/desktop-1280-review-2.png` | Final narrow desktop, 1280×900 |
| `.dev/qa/mobile-review-2.png` | Final opening, 390×844 |
| `.dev/qa/tablet-2.png` | Tablet reflow, 768×1024 |
| `.dev/qa/desktop-full-review-1.png` | Full desktop, all four portraits loaded |
| `.dev/qa/mobile-full-review-1.png` | Full mobile, all four portraits loaded |
| `.dev/qa/desktop-closing-review-1.png` | Tiamat listening visibly loaded on plum |
| `.dev/qa/mobile-closing-review-1.png` | Mobile closing; complete portrait also visible in full capture |
| `.dev/qa/desktop-mind-2.png` | Mind example selected |
| `.dev/qa/no-js-320.png` | Production HTML fixture with only the script removed, 320px |
| `.dev/qa/legal-320.png` | Concurrent v3 privacy update and French-language link preserved |

Full-page review-1 captures precede only the horizontal transparent-margin clip
repair; composition and content are otherwise final. Some early captures ran
before image/viewport settling. They were replaced, not accepted as evidence.

## Findings and repairs

The main batched desktop/mobile inspection found low-contrast painted heading
segments, crowded tablet layout, and incorrect listening-image intrinsic ratio.
Repairs: opaque semantic ink beneath a decorative paint overlay, an earlier
1050px responsive breakpoint, quieter opening-edge paint, adjusted optical
portrait scale and the actual 1000×667 listening-image dimensions.

The independent review then requested four bounded repairs. Its final verdict:

| Finding | Verdict |
|---|---|
| Closing Tiamat missing from early captures | Resolved: genuine navigation, settled lazy load and complete full-page captures establish the M/F/M/F sequence. |
| Subtitle crossed Hoshi ribbon | Resolved: clear paper around the narrower subtitle at both desktop widths. |
| Central CTA too small | Resolved: live button is 352×110px at 1536px, using the existing approved amber raster. |
| Unicode arrow decorations | Resolved: removed; underlined text links retained. |
| 1280px horizontal-scroll regression | Resolved: clip only horizontal transparent overflow, preserving vertical portrait extent. |

Final scrollWidth/clientWidth: 1265/1265 at 1280px, 1521/1521 at 1536px,
375/375 at 390px. Independent reviewer confirmed no visible clipping regression.
Two repair batches; no third code-repair round. Invalid viewport-transition
captures were replaced after settling. Final disposition: **ship**.

## Functional and implementation checks

- `node scripts/check-website.mjs`: **9 checks passed**. Covers landmarks and IDs,
  fragments, runtime references, founder/access truth, motion fallbacks, asset
  hashes/aspect ratios/budgets, tab click/arrows/Home/End, deep links, reduced-motion
  tab branch, menu/Escape/navigation focus and breakpoint reset.
- `node --check main.js`: exit 0. `git diff --check`: exit 0.
- `.dev/finalize-qa.mjs`: **18 local HTTP resource checks passed**, all status 200.
- Browser: Carry/Mind selection and keyboard movement, mobile menu/Escape/focus,
  FAQ disclosure and real anchor destinations verified. No email was sent.
- No-JS fixture: zero scripts, both experience panels visible, navigation visible,
  no overflow at 320px. Fixture is generated from production HTML, not alternate UI.
- Browser console error/warning inspection: empty.
- All four character images: complete and nonzero natural width before final
  full-page captures. Paper/plum transparency inspections passed.
- Runtime WebP masters: **1,381,220 bytes** excluding responsive alternatives;
  all 17 WebPs including alternatives: **1,840,698 bytes**. Every individual WebP
  is below 500 kB. Local fonts only; no animation framework or autoplay media.
- Shared legal CSS retains language navigation. Existing v3 English/French legal
  source and builder changes were made concurrently outside this task and preserved.

The Impeccable detector ran once. It flagged Inter (binding app identity),
aphoristic cadence (including the protected founder quote), and design-token
differences against the superseded cinematic DESIGN.md. The reviewer adjudicated
the page against current identity; the documenter records the finished system.
No second detector pass was run.

## Limitations and delivery boundary

This is a local static-site build. No commit, push, merge, deployment, app-store
release or native app artwork selection was performed. The early-access action
uses the existing email destination. Production hosting, email delivery,
real-device Safari/VoiceOver and a full WCAG audit are not claimed. The actual
OS reduced-motion setting was not changed: CSS suppression and the JavaScript
branch were checked in source/unit tests. No animation-quality claim relies on
a still screenshot alone. The independent review source-checked motion.

New Hoshi images came from the requested normal ChatGPT conversation. Its routed
image-model version is not exposed. Original PNGs retain prompt metadata; WebP
outputs use adjacent prompt JSON because the embedding utility does not support
WebP. The final social card is a screenshot export of the real built hero,
not a generated replacement interface.

## Brush-painted title refinement — 2026-09-27 follow-up (superseded)

Owner requested brush-painted titles on the current preview. The app amendment
`TYPE_INFORMATION_REFINEMENT_2026_09_27.md` and its approved Journey specimen
informed the material, without importing the native app's 90% size adjustment.
Cinzel Medium, wording, nine existing painted-heading targets, layout, portraits
and interactions are unchanged. Existing amber/violet rasters now repeat at
letter scale with more visible pigment variation. Carry and Mind retain their
respective hues. Paper and plum use separate luminance treatments over solid
semantic text; no bitmap words, new font, gradient or new visual asset was added.
Controls, body text and the wordmark stay clean.

An independent read-only typography assessment and separate mechanical scan
preceded editing. One batched initial desktop/mobile/dark inspection found the
paint too faint, followed by one material-only repair and one confirmation
round. Final captures: `.dev/qa/title-desktop-final.png`,
`.dev/qa/title-mobile-final.png`, `.dev/qa/title-dark-final.png` and
`.dev/qa/title-320-final.png`. Text remains aligned with its decorative copy;
all nine copies are aria-hidden and non-interactive. Desktop and mobile
scroll/client widths: 1521/1521 and 375/375. At 320px available content width:
320/320, with matching heading/overlay widths and positions. The browser's
335px override includes a 15px scrollbar; a 320px override leaves only 305px
available, below the site's existing 320px minimum. No layout rule changed.

- `node scripts/check-website.mjs`: **10 checks passed**, including the new
  title-scope, live-text, line-break, contrast-preference and forced-color guards.
- `node --check main.js` and `git diff --check`: exit 0.
- Browser console warnings/errors: empty.
- Final typography detector: 74 findings, unchanged from the before scan:
  one Inter warning (required identity) and 73 existing font-size documentation
  advisories. No new finding. Sizes were deliberately preserved in this task.
- Increased contrast and reduced transparency now suppress the decoration;
  forced colors already did. These preference fallbacks were source-tested,
  not tested by changing the user's OS settings.

No new independent shipping verdict is implied by the earlier rebuild verdict.
This focused refinement was visually confirmed on desktop, mobile, narrow
content and plum. Browser zoom, real-device Safari/VoiceOver and a full WCAG
audit were not performed in this follow-up. The existing solid no-JS fallback
is preserved. Local only; no commit, deployment or social-card regeneration.

## Actual brush-font correction — 2026-09-27

The Owner rejected the above texture-only approach: the letterforms themselves
must look written with a brush. The nine main titles now use self-hosted
**Kaushan Script Regular 400**. Cinzel remains on the wordmark, controls and
secondary headings; Inter remains on body text. Existing copy, responsive size
rules, layout, imagery and behavior are unchanged. Wrapping naturally follows
the new face's metrics. Solid plum, Carry amber, Mind violet and ivory replace
the multicolored clipped textures. All decorative heading clones and their
JavaScript have been removed. The font renders without JavaScript.

Source: the official Google Fonts `ofl/kaushanscript` distribution. The original
210,672-byte TTF, SIL OFL license, source URLs and SHA-256 are bundled in
`assets/fonts/KaushanScript-*`. No third-party font service runs in the page.

The independent typographic assessment recommended regular 400, zero extra
tracking, no synthetic weight, solid colors and testing the narrow experience
titles. The implementation follows those constraints. Batched desktop/mobile
inspection confirmed the actual brush silhouette and clear separation from
body/secondary roles; no visual repair was needed. Captures:

- `.dev/qa/brush-font-desktop.png`: desktop opening, 1536px CSS override.
- `.dev/qa/brush-font-mobile.png`: mobile opening, 390px override.
- `.dev/qa/brush-font-320.png`: 320px content area (335px override with scrollbar).
- `.dev/qa/brush-font-dark.png`: brush titles on the plum library chapter.

Independent focused screenshot confirmation: **pass** for the supplied desktop,
mobile and 320px hero/process captures, with clearly different brush-written
letterforms and no visible clipping or overlap. Other below-fold titles were
outside that independent confirmation; the main agent inspected the plum
library capture. Browser warning/error log was empty.

Scroll/client widths remain 1521/1521, 375/375 and 320/320. Computed family is
Kaushan Script, weight 400; heading-clone count is zero. Forced colors retains
system text. Font and provenance integrity are checked in the updated test.

`node scripts/check-website.mjs`: **10 checks passed**. `node --check main.js`
and `git diff --check`: exit 0. Design/provenance JSON parses. Type detector:
74 before and after, no new findings (required Inter warning and 73 existing
size-documentation advisories). Font-failure behavior and forced colors were
source-checked; live font failure, 200% zoom, OS preference changes and
real-device Safari/VoiceOver were not exercised. This is a local font correction,
not an app identity change, deployment or social-card update.
