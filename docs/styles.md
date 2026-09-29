# Styles

Styling system defined in `src/styles/`.

---

## Design Tokens (`theme.css`)

The complete design system is defined as CSS custom properties.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--lpg-dark` | `#1B211A` | Text, dark backgrounds |
| `--lpg-green` | `#628141` | Primary brand color, buttons |
| `--lpg-light-green` | `#8BAE66` | Gradients, accents |
| `--lpg-tan` | `#EBD5AB` | Secondary text, highlights |
| `--lpg-cream` | `#FFFDF1` | Page background, cards |

### Chart Colors

Dedicated color tokens for chart visualizations (revenue, expenses, profit, etc.).

### Dark Mode

Dark mode variants are defined using OKLCH color space for perceptually uniform colors.

### Typography

- **Font family:** Courier New (monospace)
- **Base styles:** Defined for h1-h4, label, button, and input elements

### Border Radius

- **Base:** 1.5rem (24px)

---

## Tailwind CSS v4 (`tailwind.css`)

- Imports Tailwind CSS v4 with automatic source detection
- Includes `tw-animate-css` animation library
- Theme tokens registered via `@theme inline` block in `theme.css`

---

## Global Styles (`index.css`)

Entry point that imports:
1. `fonts.css` — custom font imports (currently empty)
2. `tailwind.css` — Tailwind initialization
3. `theme.css` — Design tokens and base styles

### Animations

- `pageFadeIn` — keyframe animation for page transitions
- `prefers-reduced-motion` — media query to disable animations for users who prefer reduced motion

---

## Component Styling Approach

Components use a combination of:
- **Tailwind utility classes** for layout and spacing
- **Inline styles** for dynamic values (colors, gradients, shadows)
- **CSS custom properties** for brand colors

### Common Patterns

- **Cards:** Cream background (`#FFFDF1`) with layered box shadows
- **Buttons:** Green gradient (`#628141` → `#8BAE66`) with inset highlights
- **Sidebar:** Dark background with green accent highlights
- **Tables:** Clean borders with hover states
- **Badges:** Color-coded by status (green/yellow/red)
