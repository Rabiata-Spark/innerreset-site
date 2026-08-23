---
name: InnerReset
description: Cinematic editorial space for turning private expression into a personal artifact.
colors:
  inner-black: "#050608"
  raised-black: "#0E0F13"
  warm-cream: "#F7E7CA"
  champagne: "#F0C88D"
  artifact-gold: "#D99A4C"
  deep-bronze: "#A96F32"
  primary-text: "#EEEAE3"
  secondary-text: "#B8B4AD"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3.125rem, 5.7vw, 5.125rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  editorial-object: "16px"
  device: "48px"
  control: "999px"
spacing:
  compact: "12px"
  component: "24px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.warm-cream}"
    textColor: "{colors.inner-black}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 23px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.warm-cream}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 23px"
    height: "50px"
  editorial-card:
    backgroundColor: "{colors.raised-black}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.editorial-object}"
    padding: "44px"
---

# Design System: InnerReset

## Overview

**Creative North Star: "The Private Resonance Chamber"**

InnerReset inhabits a near-black editorial space where a person’s words feel held, shaped, and returned as an object. Warm metallic typography and rules supply human ceremony; ember, rose, and violet appear only as emitted energy around real artifacts and the canonical mark.

The system is intimate and cinematic without becoming spa-like, mystical, or technical-dashboard chrome. Quiet negative space makes the few luminous moments feel consequential.

**Key Characteristics:**

- Near-black fields with warm, readable foregrounds
- Real product screens treated as private artifacts
- Editorial serif scale paired with precise sans-serif controls
- Light emitted from the mark and artifact media, never flat neon decoration
- Hairline structure, restrained depth, and deliberate quiet

## Colors

Black owns the field; warm cream and champagne carry language and action, while amber, rose, and violet are atmospheric light rather than interface fills.

### Primary

- **Warm Cream:** The clearest headline and primary-action voice.
- **Champagne:** Labels, lines, and quiet ceremonial accents.
- **Artifact Gold:** Small points of emphasis and warm emitted light.

### Secondary

- **Ember / Rose / Violet Light:** CSS gradient light around artifact imagery. These hues do not become flat buttons, panels, or body copy.

### Neutral

- **Inner Black:** Dominant page field.
- **Raised Black:** Editorial objects that need a barely perceptible surface change.
- **Primary Text:** High-contrast reading copy.
- **Secondary Text:** The minimum body-copy gray against black; never dim it further for substantive text.

**The Emitted Spectrum Rule.** Rose and violet describe energy around a real artifact; they never become freestanding decorative UI color.

## Typography

**Display Font:** Fraunces (with Georgia fallback)  
**Body Font:** Inter (with Arial fallback)

**Character:** The display face makes emotional statements feel authored and worth pausing over. The sans-serif remains quiet, exact, and highly readable in navigation, explanations, and actions.

### Hierarchy

- **Display** (600, responsive up to 5.125rem, 0.98): Hero and closing promises only.
- **Headline** (600, responsive 2.625–4.75rem, 1.05): Section-scale emotional statements.
- **Title** (600, responsive 1.375–2.6875rem, 1.1): Experiences and ordered moves.
- **Body** (400, 1rem, 1.6–1.75): Supporting copy, held to roughly 65–75 characters per line.
- **Label** (600, 0.625–0.75rem, tracked uppercase): Navigation details and required section dividers.

**The Serif Has Weight Rule.** Fraunces is reserved for promises, artifact names, and meaningful structure; controls and explanations stay sans-serif.

## Layout

The global shell is fluid with a 1440px maximum and generous side gutters. Desktop hero composition is a 44/56 editorial split; four moves form a single row and experiences form three columns. Tablet moves to a 2×2 sequence and two-column experiences with the third spanning the width. Mobile is deliberately recomposed: copy first, one dominant phone with one partial companion, compact move rows, stacked experiences, and a contained scroll-snap screen strip.

Section boundaries are warm hairlines with large vertical intervals. Tight spacing belongs inside a copy group; generous space separates changes in meaning. Wide content never creates page-level horizontal overflow.

## Elevation & Depth

Depth is a hybrid of near-black tonal layering, offset black shadows beneath physical device frames, and colored atmospheric light behind media. Wide, soft shadows make screenshots feel held above the field; zero-offset colored glow is never used as structural elevation.

**The Artifact Depth Rule.** Objects may lift; ordinary copy and navigation remain on the page plane.

## Shapes

Editorial cards use restrained 16px corners. Phone frames follow the screenshot silhouette at approximately 48px. Pill geometry is reserved for compact actions. Circular forms belong to the canonical mark and motion motifs; they are never substituted for the mark itself.

## Components

### Buttons

- **Shape:** Compact pill with a 50px minimum touch height.
- **Primary:** Warm cream fill, inner-black text, and a subtle internal highlight.
- **Secondary:** Transparent black field, fine champagne border, and warm text.
- **Hover / Focus:** Luminance and border clarity shift without scale jumps; keyboard focus is a 2px warm-cream outline with 4px offset.

### Cards / Containers

- **Corner Style:** Editorial object radius, not oversized dashboard softness.
- **Background:** Raised black with one low-opacity warm border.
- **Shadow Strategy:** Offset ambient depth, never a competing border-plus-halo stack.
- **Internal Padding:** Responsive from 28px to 44px.

### Navigation

Navigation is small warm sans-serif text on the black field. It remains structurally quiet until scrolling, when a translucent black surface and hairline appear. Mobile uses a semantic disclosure with 48px rows and an explicit early-access action.

### Device Composition

Real 393×852 product screenshots sit in thin dark CSS frames with a directional black shadow. Rear devices may rotate slightly and reduce luminance; the front device remains upright, sharp, and dominant.

### Motion Field

Every motion slot is the same semantic figure pattern: a stable poster/static layer, a CSS fallback, and an optional lazy decorative video. Motion is muted, viewport-bound, and completely absent under reduced-motion preferences.

## Do's and Don'ts

### Do:

- **Do** use the canonical mark by scaling or glowing the unchanged source image.
- **Do** keep real product screenshots legible and visually dominant over atmosphere.
- **Do** maintain secondary reading text at or above the established contrast floor.
- **Do** pace each page with dense artifact moments followed by genuine quiet.

### Don't:

- **Don't** flatten ember, rose, or violet into generic neon UI accents.
- **Don't** introduce botanical, beige, social, gamified, or dashboard visual grammar.
- **Don't** use generated or reconstructed app UI in place of real screens.
- **Don't** animate the logo’s geometry, ring count, rotation, or proportions.
