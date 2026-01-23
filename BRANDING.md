# Explore the Clubhouse - Brand Guidelines

**UPDATED:** January 2026 - New Figma design system implemented

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

## Color Palette (Craigies Design System)

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Olive** | `#7A7C4A` | 122, 124, 74 | Primary brand color, navigation, alternating sections, status badges |
| **Cream** | `#F5F4ED` | 245, 244, 237 | Page backgrounds, light sections, base color |
| **Burnt Orange** | `#D4843E` | 212, 132, 62 | Primary CTAs, buttons, accents, highlights |
| **Dark Olive** | `#5A5C3A` | 90, 92, 58 | Headings, dark text, emphasis |

**CSS Variables:**
```css
--craigies-olive: #7a7c4a;
--craigies-cream: #f5f4ed;
--craigies-burnt-orange: #d4843e;
--craigies-dark-olive: #5a5c3a;
```

### Legacy Colors (Phased Out - Keep for Semantic Use Only)

| Name | Hex | Usage |
|------|-----|-------|
| **Forest Green** | `#2D5A3D` | Legacy - being phased out |
| **Meadow Green** | `#4A7C59` | Legacy - being phased out |
| **Sage** | `#87A878` | Legacy - being phased out |
| **Sunshine** | `#F5A623` | Legacy - being phased out |
| **Amber** | `#E8912D` | Morning session badges only |
| **Coral** | `#E07A5F` | Capacity warnings only |

### Neutral Colors (Retained)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Bark** | `#3D3D3D` | 61, 61, 61 | Legacy text (use Dark Olive instead) |
| **Stone** | `#6B7280` | 107, 114, 128 | Secondary text, metadata |
| **Pebble** | `#9CA3AF` | 156, 163, 175 | Placeholder text, disabled |
| **Cloud** | `#F3F4F6` | 243, 244, 246 | Borders, dividers |
| **White** | `#FFFFFF` | 255, 255, 255 | Cards on cream backgrounds |

### Semantic Colors (Always Available)

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Success messages, confirmations |
| **Warning** | `#F59E0B` | Warnings, capacity alerts |
| **Error** | `#EF4444` | Errors, validation, required fields |
| **Info** | `#3B82F6` | Information, tips |

---

## Typography (Craigies Design System)

### Font Family

**Heading Font:** Playfair Display (Serif)
- Elegant, classic serif typeface
- Professional and sophisticated
- Excellent for establishing visual hierarchy
- Use for: All headings (H1-H6), modal titles, section titles, card titles

**Body Font:** Nunito Sans (Sans-serif)
- Clean, readable sans-serif
- Excellent for longer text and UI elements
- Use for: Body text, form labels, paragraphs, buttons, navigation

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700&display=swap');
```

### Type Scale

| Name | Size | Weight | Line Height | Font | Usage |
|------|------|--------|-------------|------|-------|
| **Display** | 48-64px | 700-800 | 1.1 | Playfair Display | Hero headlines |
| **H1** | 36px / 2.25rem | 700 | 1.2 | Playfair Display | Page titles |
| **H2** | 30px / 1.875rem | 700 | 1.25 | Playfair Display | Section headings |
| **H3** | 24px / 1.5rem | 600-700 | 1.3 | Playfair Display | Card titles, subsections |
| **H4** | 20px / 1.25rem | 600 | 1.4 | Playfair Display | Small headings |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | Nunito Sans | Lead paragraphs |
| **Body** | 16px / 1rem | 400 | 1.6 | Nunito Sans | Default body text |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | Nunito Sans | Captions, metadata |
| **Tiny** | 12px / 0.75rem | 500 | 1.4 | Nunito Sans | Labels, badges |

### Color Usage in Typography
- **Headings**: Dark Olive (#5A5C3A)
- **Body text**: Dark Olive (#5A5C3A) or Stone (#6B7280) for secondary
- **On dark backgrounds**: White
- **Links**: Burnt Orange (#D4843E) with underline

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

## Component Patterns (Craigies Design System)

### Buttons

**Primary Button (CTA)**
- Background: Burnt Orange (`#D4843E`)
- Text: White
- Hover: Opacity 90%
- Font: Playfair Display, 600 weight
- Rounded: 8px (rounded-lg)
- Padding: 16px 32px (py-4 px-8)
- Transition: opacity

**Secondary Button**
- Border: 2px Dark Olive (`#5A5C3A`)
- Text: Dark Olive
- Hover: Opacity 80%
- Font: Playfair Display, 600 weight
- Background: Transparent

**Olive Button** (Alternative Primary)
- Background: Olive (`#7A7C4A`)
- Text: White
- Hover: Opacity 90%
- Used for: Admin actions, secondary CTAs

### Cards
- Background: White
- On: Cream background (`#F5F4ED`)
- Border: None or subtle shadow
- Border-radius: 16px (rounded-2xl)
- Shadow: 0 4px 6px rgba(122, 124, 74, 0.1)
- Padding: 24px (p-6) or 32px (p-8)

### Forms
- Input background: White
- Input border: 1px #D1D5DB (neutral gray)
- Focus border: Burnt Orange (`#D4843E`)
- Focus ring: 0 0 0 3px rgba(212, 132, 62, 0.1)
- Label: Body Small, Dark Olive, 500 weight
- Placeholder: #9CA3AF (Pebble)
- Error: Red border (#EF4444), red helper text

### Navigation
- Background: Olive (`#7A7C4A`)
- Text: White
- Active link: White with subtle underline
- Hover: Opacity 80%
- Logo: White on olive background
- Mobile menu: Full-screen overlay

### Status Badges
- **Complete/Active**: Olive background (rgba(122, 124, 74, 0.1)), Olive text
- **Paid/Pending**: Burnt Orange background (rgba(212, 132, 62, 0.1)), Burnt Orange text
- **Cancelled**: Red background, red text
- **Inactive**: Gray background, gray text

### Modals
- Overlay: Black with 50% opacity
- Card: White background, rounded-2xl
- Title: Playfair Display, Dark Olive
- Buttons: Burnt Orange (confirm), Dark Olive border (cancel)

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

## Code Implementation (Craigies Design System)

### CSS Custom Properties (Current)
```css
:root {
  /* Craigies Primary Colors */
  --craigies-olive: #7a7c4a;
  --craigies-cream: #f5f4ed;
  --craigies-burnt-orange: #d4843e;
  --craigies-dark-olive: #5a5c3a;

  /* Legacy Colors (Semantic Use Only) */
  --color-forest: #2D5A3D;
  --color-meadow: #4A7C59;
  --color-sage: #87A878;
  --color-sunshine: #F5A623;
  --color-amber: #E8912D;
  --color-coral: #E07A5F;

  /* Semantic Colors */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Neutrals */
  --color-bark: #3D3D3D;
  --color-stone: #6B7280;
  --color-pebble: #9CA3AF;
  --color-cloud: #F3F4F6;

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Nunito Sans', sans-serif;

  /* Shadows (Updated for Craigies) */
  --shadow-sm: 0 1px 3px rgba(122, 124, 74, 0.1);
  --shadow-md: 0 4px 6px rgba(122, 124, 74, 0.1);
  --shadow-lg: 0 10px 25px rgba(122, 124, 74, 0.15);

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

### Tailwind Config Colors (If needed)
```javascript
colors: {
  craigies: {
    olive: '#7a7c4a',
    cream: '#f5f4ed',
    'burnt-orange': '#d4843e',
    'dark-olive': '#5a5c3a',
  },
  // Keep legacy for backwards compatibility
  brand: {
    forest: '#2D5A3D',
    meadow: '#4A7C59',
    sage: '#87A878',
  },
}
```

---

## Quick Reference (Craigies Design System)

### When to use each Craigies color:

**Olive (#7A7C4A)**
- Navigation background
- Alternating section backgrounds
- Status badges (complete/active)
- Secondary CTAs
- Icon accents

**Cream (#F5F4ED)**
- Page backgrounds (instead of white)
- Light section backgrounds
- Base color for the site

**Burnt Orange (#D4843E)**
- Primary CTAs ("Book Now", "Sign Up", "Pay Now")
- Important buttons and actions
- Form input focus states
- Links and highlights
- Price displays
- Status badges (paid/pending)

**Dark Olive (#5A5C3A)**
- All headings (H1-H6)
- Primary text color
- Form labels
- Secondary button borders

### Design Principles

**Color Alternation**
- Use alternating Olive and Cream backgrounds for visual rhythm
- Always place white cards on Cream backgrounds for contrast

**Typography Hierarchy**
- Playfair Display for ALL headings (maintains elegance)
- Nunito Sans for all body text (maintains readability)
- Dark Olive for maximum legibility

**Interactive Elements**
- Burnt Orange for all primary actions
- Burnt Orange focus states for accessibility
- Olive for secondary actions

**Avoid**
- Don't use legacy colors (Forest, Meadow, Sage, Sunshine) except for semantic purposes
- Don't use Burnt Orange for large background areas (too vibrant)
- Don't mix old and new color systems
