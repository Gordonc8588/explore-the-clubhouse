# Explore the Clubhouse - Brand Guidelines

## Brand Essence

**Who we are:** A children's holiday club offering outdoor, farm-based activities during school holidays.

**Brand Personality:**
- Warm & Welcoming - Parents feel their children are in caring hands
- Playful & Fun - Children are excited to attend
- Natural & Earthy - Connected to nature, animals, and outdoor learning
- Trustworthy & Professional - Parents can rely on us

**Tone of Voice:**
- Friendly and approachable (never corporate)
- Enthusiastic but not over-the-top
- Reassuring to parents, exciting to children
- Use "we" and "you" to feel personal

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Forest Green** | `#2D5A3D` | 45, 90, 61 | Primary brand color, headers, key UI elements |
| **Meadow Green** | `#4A7C59` | 74, 124, 89 | Secondary green, hover states, accents |
| **Sage** | `#87A878` | 135, 168, 120 | Subtle backgrounds, borders, disabled states |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sunshine** | `#F5A623` | 245, 166, 35 | CTAs, buttons, highlights, important actions |
| **Amber** | `#E8912D` | 232, 145, 45 | Hover state for sunshine, secondary accent |
| **Coral** | `#E07A5F` | 224, 122, 95 | Alerts, sale badges, warm highlights |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Bark** | `#3D3D3D` | 61, 61, 61 | Primary text |
| **Stone** | `#6B7280` | 107, 114, 128 | Secondary text, labels |
| **Pebble** | `#9CA3AF` | 156, 163, 175 | Placeholder text, disabled |
| **Cloud** | `#F3F4F6` | 243, 244, 246 | Backgrounds, cards |
| **Cream** | `#FEFDF8` | 254, 253, 248 | Page background (warm white) |
| **White** | `#FFFFFF` | 255, 255, 255 | Cards, inputs, clean surfaces |

### Supporting Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sky** | `#7DD3FC` | 125, 211, 252 | Info states, links, water activities |
| **Berry** | `#C084FC` | 192, 132, 252 | Special events, premium features |
| **Rose** | `#FDA4AF` | 253, 164, 175 | Soft highlights, decorative |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Success messages, confirmations |
| **Warning** | `#F59E0B` | Warnings, capacity alerts |
| **Error** | `#EF4444` | Errors, validation, required fields |
| **Info** | `#3B82F6` | Information, tips |

---

## Typography

### Font Family

**Primary Font:** Nunito
- Friendly, rounded sans-serif
- Excellent readability
- Child-friendly without being childish
- Use for: Headings, buttons, navigation, display text

**Secondary Font:** Nunito Sans (or Inter as fallback)
- Clean, readable for longer text
- Pairs perfectly with Nunito
- Use for: Body text, form labels, paragraphs

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600&display=swap');
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 48px / 3rem | 800 | 1.1 | Hero headlines |
| **H1** | 36px / 2.25rem | 700 | 1.2 | Page titles |
| **H2** | 30px / 1.875rem | 700 | 1.25 | Section headings |
| **H3** | 24px / 1.5rem | 600 | 1.3 | Card titles, subsections |
| **H4** | 20px / 1.25rem | 600 | 1.4 | Small headings |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | Lead paragraphs |
| **Body** | 16px / 1rem | 400 | 1.6 | Default body text |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | Captions, metadata |
| **Tiny** | 12px / 0.75rem | 500 | 1.4 | Labels, badges |

---

## Spacing & Layout

### Spacing Scale
Use Tailwind's default spacing scale with these common patterns:

| Context | Spacing |
|---------|---------|
| Page padding (mobile) | 16px (p-4) |
| Page padding (desktop) | 24-32px (p-6 to p-8) |
| Section spacing | 64-96px (py-16 to py-24) |
| Card padding | 24px (p-6) |
| Form field gap | 16px (gap-4) |
| Button padding | 12px 24px (py-3 px-6) |
| Inline element gap | 8px (gap-2) |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px (rounded-lg) |
| Cards | 16px (rounded-2xl) |
| Inputs | 8px (rounded-lg) |
| Badges/Tags | 9999px (rounded-full) |
| Images | 12px (rounded-xl) |
| Avatars | 9999px (rounded-full) |

### Shadows
Use soft, warm shadows:
- **Small:** `0 1px 3px rgba(45, 90, 61, 0.1)`
- **Medium:** `0 4px 6px rgba(45, 90, 61, 0.1)`
- **Large:** `0 10px 25px rgba(45, 90, 61, 0.15)`

---

## Component Patterns

### Buttons

**Primary Button (CTA)**
- Background: Sunshine (`#F5A623`)
- Text: Bark (`#3D3D3D`)
- Hover: Amber (`#E8912D`)
- Font: Nunito, 600 weight
- Rounded: 8px
- Padding: 12px 24px

**Secondary Button**
- Background: Forest Green (`#2D5A3D`)
- Text: White
- Hover: Meadow Green (`#4A7C59`)

**Outline Button**
- Border: 2px Forest Green
- Text: Forest Green
- Hover: Forest Green background, White text

### Cards
- Background: White
- Border: 1px Cloud (`#F3F4F6`) or none
- Border-radius: 16px
- Shadow: Medium
- Padding: 24px

### Forms
- Input background: White
- Input border: 1px Stone (`#6B7280`)
- Focus border: 2px Forest Green
- Focus ring: 3px Sage with 30% opacity
- Label: Body Small, Stone color, 500 weight
- Error: Red border, red helper text

### Navigation
- Background: White or Cream
- Active link: Forest Green with Sage underline
- Hover: Meadow Green
- Mobile menu: Full-screen overlay with Cream background

---

## Imagery Guidelines

### Photography Style
- Authentic, candid shots of children engaged in activities
- Natural lighting preferred (golden hour ideal)
- Show real farm/outdoor environments
- Include diverse children
- Focus on joy, discovery, and hands-on learning
- Avoid overly staged or stock-photo feel

### Image Treatment
- Slight warm color grade
- Rounded corners (12px)
- Optional: Soft shadow for lifted effect

### Icons
- Use Lucide React icons
- Stroke width: 2px
- Size: 20-24px for inline, 32-48px for features
- Color: Match text color or Forest Green for accents

---

## Logo Usage

### Clear Space
Maintain minimum clear space equal to the height of the "E" in "Explore" on all sides.

### Minimum Size
- Digital: 120px width minimum
- Print: 30mm width minimum

### Color Variations
1. **Full color** - Primary logo on light backgrounds
2. **White** - On dark/colored backgrounds
3. **Forest Green monotone** - Single color applications

### Don'ts
- Don't stretch or distort
- Don't add effects (shadows, outlines)
- Don't place on busy backgrounds without contrast
- Don't change the colors outside approved palette

---

## Accessibility

### Color Contrast
All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Contrast-Safe Combinations
| Background | Text | Ratio |
|------------|------|-------|
| Cream | Bark | 12.5:1 |
| White | Bark | 13.2:1 |
| Forest Green | White | 7.2:1 |
| Sunshine | Bark | 4.8:1 |
| Cloud | Bark | 11.8:1 |

### Focus States
All interactive elements must have visible focus indicators:
- Focus ring: 3px Sunshine with offset
- Or: 2px Forest Green outline with 2px offset

---

## Code Implementation

### Tailwind Config Colors
```javascript
colors: {
  brand: {
    forest: '#2D5A3D',
    meadow: '#4A7C59',
    sage: '#87A878',
    sunshine: '#F5A623',
    amber: '#E8912D',
    coral: '#E07A5F',
  },
  neutral: {
    bark: '#3D3D3D',
    stone: '#6B7280',
    pebble: '#9CA3AF',
    cloud: '#F3F4F6',
    cream: '#FEFDF8',
  },
  accent: {
    sky: '#7DD3FC',
    berry: '#C084FC',
    rose: '#FDA4AF',
  }
}
```

### CSS Custom Properties
```css
:root {
  /* Primary */
  --color-forest: #2D5A3D;
  --color-meadow: #4A7C59;
  --color-sage: #87A878;

  /* Accent */
  --color-sunshine: #F5A623;
  --color-amber: #E8912D;
  --color-coral: #E07A5F;

  /* Neutrals */
  --color-bark: #3D3D3D;
  --color-stone: #6B7280;
  --color-pebble: #9CA3AF;
  --color-cloud: #F3F4F6;
  --color-cream: #FEFDF8;

  /* Typography */
  --font-display: 'Nunito', sans-serif;
  --font-body: 'Nunito Sans', 'Inter', sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(45, 90, 61, 0.1);
  --shadow-md: 0 4px 6px rgba(45, 90, 61, 0.1);
  --shadow-lg: 0 10px 25px rgba(45, 90, 61, 0.15);

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## Quick Reference

### When to use each green:
- **Forest Green** - Primary actions, headers, key branding moments
- **Meadow Green** - Hover states, secondary elements, supporting content
- **Sage** - Backgrounds, borders, subtle decorative elements

### When to use Sunshine:
- Primary CTAs ("Book Now", "Sign Up")
- Price highlights
- Important notifications
- Action-required states

### When NOT to use Sunshine:
- Large background areas (too bright)
- Body text (poor readability)
- Error states (use red instead)
