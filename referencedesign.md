---
version: alpha
name: Vercel Minimal
description: A restrained, high-contrast landing-page system with generous whitespace and a technical, product-led tone.
colors:
  primary: "#171717"
  secondary: "#6b7280"
  tertiary: "#e5e7eb"
  neutral: "#fafafa"
  surface: "#ffffff"
  on-surface: "#171717"
  border: "#e5e7eb"
  muted: "#f5f5f5"
  error: "#dc2626"
typography:
  headline-display:
    fontFamily: Geist Sans
    fontSize: 64px
    fontWeight: 400
    lineHeight: 64px
    letterSpacing: -3.84px
  headline-lg:
    fontFamily: Geist Sans
    fontSize: 50px
    fontWeight: 400
    lineHeight: 56px
    letterSpacing: -3.36px
  headline-md:
    fontFamily: Geist Sans
    fontSize: 39px
    fontWeight: 400
    lineHeight: 47px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Geist Sans
    fontSize: 31px
    fontWeight: 400
    lineHeight: 37px
    letterSpacing: 0px
  body-xl:
    fontFamily: Geist Sans
    fontSize: 24px
    fontWeight: 400
    lineHeight: 36px
    letterSpacing: -0.96px
  body-lg:
    fontFamily: Geist Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: -0.32px
  body-md:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0px
  label-md:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  label-sm:
    fontFamily: Geist Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.02em
  nav-sm:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  mono-sm:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 2px
  sm: 12px
  md: 20px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 12px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 12px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 12px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 12px"
    height: "40px"
  button-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 12px"
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
---

## Overview

This system feels stark, modern, and highly confident, with almost no decorative noise. It is built for a technical audience that values clarity, speed, and product credibility over flourish. The mood is spacious and editorial, but the contrast and geometry keep it distinctly engineered rather than luxurious.

## Colors

- **Primary (#171717):** The core ink tone used for headline text, primary buttons, and key brand marks. It reads as near-black without becoming harsh pure black.
- **Surface (#ffffff):** The base container color for the few elements that need to feel lifted from the page. It supports the minimal, gallery-like composition.
- **Neutral (#fafafa):** The dominant page background, creating a soft off-white field that reduces glare and preserves the airy feel.
- **Border (#e5e7eb):** A subtle cool gray used for hairline borders around secondary actions and cards. It keeps structure visible without introducing visual weight.
- **Muted (#f5f5f5):** A gentle tonal layer for subdued UI surfaces, chips, and low-emphasis treatments.
- **Secondary (#6b7280):** A restrained gray for supporting text and secondary information when needed.
- **On-surface (#171717):** The default text color on light surfaces, matching the primary ink for consistency.
- **Error (#dc2626):** Reserved for destructive states and validation messaging; it should remain sparse in this system.

## Typography

The system uses Geist Sans across nearly all UI text, with Geist Mono available for code-adjacent or technical content. Headlines are light in weight and rely on strong negative letter spacing, especially at display sizes, which gives the brand a crisp, contemporary look. Body text is compact and legible, with a slightly tightened rhythm that supports dense but breathable layouts.

Use `headline-display`, `headline-lg`, and `headline-md` for major page hierarchy and marketing copy. `body-xl`, `body-lg`, and `body-md` support hero descriptions and general prose, while `body-sm` handles supporting details. `label-md` and `label-sm` fit buttons, navigation, and metadata; labels are medium-weight rather than all-caps, with minimal letter spacing, reflecting the interface’s understated tone. The navigation and button text are straightforward and sentence case, not stylistically embellished.

## Layout

The layout is built around a very wide, fluid canvas with a fixed-feeling center composition and large amounts of negative space. Content is arranged in a three-part hero structure: navigation at the top, a centered visual anchor in the middle, and supporting brand proof near the bottom. Spacing values are restrained and repetitive, using a small scale with `xs`, `sm`, `md`, `lg`, and `xl` to preserve calm rhythm.

Section padding should feel generous rather than packed, with large margins around the hero and strong separation between navigation, copy, and logo row. Cards and small surfaces use tight internal padding, but the overall page should remain expansive. The system favors alignment and breathing room over dense grids.

## Elevation & Depth

Depth is extremely subtle and mostly expressed through contrast, not shadow stacks. Interactive surfaces rely on borders, tonal separation, and solid fills rather than heavy elevation. When depth appears, it is soft and minimal, as seen in the slight halo around the central triangular mark and the thin button outlines.

Cards use a light border and flat fill instead of pronounced shadows. Primary actions invert to dark fills for emphasis, while secondary actions remain white with a gray border. This creates hierarchy through tonal contrast instead of motion-heavy or shadow-heavy treatment.

## Shapes

The shape language is rounded and controlled, with pill-shaped controls dominating interactive elements. Buttons, inputs, and chips should use `rounded.full` for the cleanest match to the screenshot. Larger panels and cards use `rounded.md`, which keeps surfaces soft without making the composition playful.

Overall, the geometry feels precise and engineered: circles are avoided, corners are gently softened, and major shapes remain simple.

## Components

Buttons are the most visible interactive element. Use `button-primary` for the main call to action: dark fill, white text, pill radius, and compact 40px height. Use `button-secondary` for secondary actions: white fill, dark text, and a subtle border. `button-primary-hover` and `button-secondary-hover` should shift only tone, not shape or weight. Button text should use `label-md` and stay sentence case.

Cards should be quiet containers with `card`: light background, thin border, `rounded.md`, and moderate internal padding. They should not cast noticeable shadows. Inputs should mirror buttons in their pill form, but remain visually quieter and use a white surface with the on-surface text color. Chips should be small, unobtrusive, and rounded full, with a muted background and `label-sm` typography.

Links should behave like plain text rather than stylized controls. They may be underlined or minimally emphasized, but they should never compete with the primary action. Navigation items should stay simple and lightweight, matching the understated top bar in the screenshot.

## Do's and Don'ts

- Do keep the page light, open, and high-contrast with a strong black-on-off-white relationship.
- Do use pill-shaped controls for primary and secondary actions.
- Do maintain generous whitespace around hero content and major visual anchors.
- Do rely on thin borders and tonal shifts instead of deep shadows.
- Don’t introduce saturated accent colors unless they are strictly functional.
- Don’t add heavy gradients, glass effects, or decorative texture.
- Don’t make headings bold or overly condensed; keep the typography light and spacious.
- Don’t over-round cards or large containers beyond the restrained `rounded.md` language.