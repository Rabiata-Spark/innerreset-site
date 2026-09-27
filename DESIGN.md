---
name: InnerReset
description: A Living Page for private expression and personal audio worth keeping.
colors:
  paper: "#f7f0e6"
  ivory: "#fff9f0"
  plum: "#221c24"
  ink: "#4c3c4d"
  muted: "#71616a"
  carry: "#94562e"
  mind: "#70518a"
  action: "#443447"
  rule: "#4c3c4d30"
  dark-text: "#f4e9df"
  dark-muted: "#c4b3c3"
  dark-rule: "#c4b3c344"
typography:
  display:
    fontFamily: "Kaushan Script, Georgia, serif"
    fontSize: "clamp(2.8rem, 4.25vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0"
  headline:
    fontFamily: "Kaushan Script, Georgia, serif"
    fontSize: "clamp(2rem, 3.4vw, 3.3rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  navigation:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  tab:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 500
    lineHeight: 1.65
rounded:
  focus: "2px"
spacing:
  small: "0.5rem"
  group: "1rem"
  component: "1.5rem"
  column: "2rem"
  gutter: "clamp(1.25rem, 4.5vw, 5rem)"
  section: "clamp(4rem, 7.5vw, 7.5rem)"
components:
  paint-button:
    backgroundColor: "transparent"
    textColor: "{colors.plum}"
    padding: "1.25rem 2.5rem"
  experience-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.tab}"
  experience-tab-carry-selected:
    textColor: "{colors.carry}"
  experience-tab-mind-selected:
    textColor: "{colors.mind}"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
  menu-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0.4rem 0.9rem"
---

# Design System: InnerReset

## Overview

**Creative North Star: "The Living Page"**

InnerReset is a warm, matte page for private expression, finished personal audio, and words worth returning to. Paper, painted marks, whole illustrated figures, and authored typography make the experience human and quietly deliberate.

Warm paper and ivory support reading; deep plum gives the library and closing chapters a more intimate register. The exact comet-and-three-stars mark anchors the identity. Hoshi and Tiamat receive equal care and represent all experiences. This system replaces the previous cinematic black and ring identity under the Owner's approved identity replacement.

**Key Characteristics:**

- Warm paper and deep-plum chapters
- Brush-written Kaushan Script titles, Cinzel supporting type and clear Inter reading text
- Real paint rasters beneath live, accessible language
- Whole, static Hoshi and Tiamat portraits
- Open editorial groups, fine rules, and restrained one-time motion

## Colors

Warm neutral grounds hold amber Carry and violet Mind accents without turning the page into a glowing interface.

### Primary

- **Action Plum:** Headings and primary language on paper.
- **Carry Amber:** Carry titles, selected Carry tabs, and warm link feedback.
- **Mind Violet:** Mind titles, selected Mind tabs, and keyboard focus.

### Neutral

- **Warm Paper / Ivory:** Opening and footer ground / main reading ground.
- **Deep Plum:** Dark chapter background and painted-action text.
- **Reading Ink / Muted Ink:** Main copy / secondary explanations.
- **Paper Rule:** Quiet dividers separating meaning without enclosing it.
- **Dark Text / Dark Muted / Dark Rule:** The corresponding reading and divider roles within plum chapters.

**The Grounded Paint Rule.** Use the supplied paint rasters as material; retain a readable solid text layer beneath any paint texture.

## Typography

**Display Font:** Kaushan Script Regular, with Georgia fallback.
**Supporting Serif:** Cinzel Medium for the wordmark, controls and secondary headings.
**Body Font:** Inter, with Arial fallback.

**Character:** Kaushan Script gives the nine main landing titles actual brush-written letterforms, with pressure-shaped strokes and a naturally uneven baseline. This is the Owner's explicit website-title correction on 2026-09-27; it supersedes the earlier textured-Cinzel title treatment, not the native app's identity. Cinzel retains the wordmark, controls and secondary headings. Inter handles explanations, navigation and practical details. All fonts are locally hosted.

### Hierarchy

- **Display:** Fluid hero question; closing statements use a related responsive scale.
- **Headline:** Section statements with balanced wrapping and generous room.
- **Title:** Kaushan Script for the two main experience titles; Cinzel for smaller artifact names and process structure.
- **Body:** Inter, usually at the base size or slightly below it, with contextual line heights up to 1.85. General paragraphs cap at 70 characters; narrower explanatory columns shorten further.
- **Navigation:** Quiet sentence-case Inter, with touch area supplied independently of font size.
- **Tabs:** Cinzel identifies the two experience choices.

**The Live Words Rule.** Headings and action labels remain real text. No duplicated glyph layers, rasterized words or JavaScript are required for title rendering.

**Brush-written titles.** Use Kaushan Script's real 400 weight, zero added tracking and no synthetic bold. The letterform itself supplies the brush character: no multicolored text overlay, clipping texture or filter. Keep solid plum on paper, amber for Carry, violet for Mind and ivory on plum; forced colors uses system text. Existing responsive sizes and authored breaks remain, with natural wrapping for the new face. The unmodified font and OFL license are bundled under `assets/fonts`; provenance is in `KaushanScript-source.json`.

## Layout

A fluid shell stops at 92rem; gutters and section intervals use the frontmatter scales. Open columns and generous changes in spacing organize the story. Fine rules separate steps, examples, library entries, and FAQ answers. Ordinary content is not wrapped in ornamental cards.

The root landing composition is documented in `.impeccable/surfaces/index-html.md`: a centered question, equal illustrated paths, and one clear early-access action. This specific composition is not a requirement for every future surface. Preserve the priority of question, experience labels, and primary action when adapting it.

At 1050px and below, major editorial columns stack, the hero retains two parallel paths with the action beneath, the process becomes two columns, and navigation becomes an enhanced disclosure. At 380px and below, compact type and process arrangements retain the same hierarchy. The supported minimum viewport is 320px. Wide legal tables scroll inside their own container; page-level horizontal scrolling is not part of the system. A 1600px adjustment increases hero portrait room.

## Elevation & Depth

Depth comes from actual paper and paint imagery, tonal chapter changes, and overlapping illustration, not box shadows or luminous halos. Text, links, and navigation sit on the page plane.

**The Matte Page Rule.** Keep ordinary surfaces flat; use the approved material imagery and spacing to establish depth.

## Shapes

The exact comet-and-three-stars mark is `assets/brand/innerreset-mark.png`; scale it proportionally without redrawing, recoloring, or distorting it. Whole portraits use contain fitting and preserve heads and hands. Male and female figures alternate across the current landing sequence M/F/M/F, with equal optical care and no gender-based experience routing.

Primary actions inherit the irregular silhouette of the amber paint raster. Editorial groups are open and largely square, with hairline separators. The small focus radius exists for keyboard outlines, not as a general card treatment.

## Components

### Painted action

A live Cinzel label sits over `assets/living-page/paint-amber.webp`, rendered by a decorative pseudo-element. Base minimum height is 5rem; the hero enlarges the action to support its priority, then adapts at the compact breakpoint. Hover brightens the raster over 200ms; press moves the link down 1px. The destination is an actual early-access email link. Forced colors replaces the paint with a visible border and system text.

### Experience choices

Two open, serif choices sit on a shared hairline. Selected Carry uses amber; selected Mind uses violet, with a 2px bottom rule. JavaScript supplies tablist/tab/tabpanel semantics, roving focus, Left/Right/Home/End selection, and visible-panel switching. Without JavaScript, these are ordinary anchors and both examples remain readable. The examples are illustrative semantic content, not reconstructed app screens or playable audio.

### Navigation and text links

The exact mark and live InnerReset wordmark lead a quiet text navigation. Links have at least 44px interaction height. Hover adds or strengthens an underline and may use Carry amber. Global keyboard focus uses a 2px Mind outline with 5px offset.

Below the compact breakpoint, the JavaScript menu updates expanded state; Escape closes it and restores focus, while selecting a section moves focus to that section. Without JavaScript the navigation stays visible. A skip link exposes the main content directly.

### FAQ

Native details and summary provide independently openable answers. Fine top/bottom rules, browser disclosure markers, and amber open-state text carry the state. Keep the control semantic; no replacement glyph icon is needed.

### Material and motion

Use the actual light/dark page rasters and amber/violet/ivory paint rasters. Whole portraits stay static. The hero text settles once over 750ms, the action paint reveals once over 1000ms, process paint reveals once over 900ms with short stagger, and an example switch settles over 420ms. The shared easing is recorded in the sidecar. Reduced motion disables animation, transition, and smooth scrolling; no-JavaScript content remains visible. No looping artwork or autoplay audio belongs to the delivered experience.

## Do's and Don'ts

### Do:

- **Do** preserve the exact comet mark and whole static portrait artwork.
- **Do** keep real text readable beneath decorative paint.
- **Do** give both experiences equal care and treat gender as representation, never feature routing.
- **Do** preserve keyboard access, visible focus, reduced motion, and readable no-JavaScript content.
- **Do** keep examples explicitly illustrative and early-access actions truthful.

### Don't:

- **Don't** reintroduce the superseded ring mark or cinematic black identity.
- **Don't** replace supplied paint with invented CSS illustrations.
- **Don't** fabricate native app screens, testimonials, store availability, or playable audio.
- **Don't** distort portraits, animate their body parts, or introduce looping or autoplay audio.
