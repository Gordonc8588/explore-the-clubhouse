# PRD: Print Ads Creator

## Status: 📋 PLANNED

**Implementation Lead**: Ralphy
**Target**: Q1 2026

---

## Overview

Build a print advertisement creator within the admin panel that generates high-resolution PDF ads for newspapers and magazines. Users can select a club, upload/select images, use AI to generate editorial copy, preview the ad, and download print-ready PDFs.

### Goals

1. **Simplify print ad creation** - Non-technical staff can create professional print ads
2. **Maintain brand consistency** - Use Craigies brand colors, fonts, and styling
3. **Auto-populate club data** - Pull dates, prices, age range directly from clubs
4. **Print-ready output** - Generate PDFs at exact specifications for print publications

### Similar To

This feature mirrors the existing **Meta Ads** and **Newsletter** workflows:
- Select club → Upload images → AI generates copy → Preview → Export PDF

---

## User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Admin | Select a club and auto-populate ad details | I don't need to manually copy dates/prices |
| Admin | Get AI-generated editorial copy in third person | I get professional magazine-style copy |
| Admin | Preview the ad at exact print dimensions | I can see how it will look in the magazine |
| Admin | Download a print-ready PDF | I can send it directly to the publication |
| Admin | Reuse images from existing Cloudinary library | I don't need to re-upload photos |
| Admin | Save drafts and return later | I can work on ads over multiple sessions |

---

## Target Publications

### 1. Newsletter/Digital Ad
- **Copy length**: 80+ words minimum
- **Writing style**: Third person preferred
- **Images**: At least 1 photo (no text on photo)
- **Optional**: Flyer image at bottom
- **Dimensions**: 600px x 800px

### 2. Magazine Quarter Page
- **Dimensions**: 105mm x 148mm (A6 / A4 quarter)
- **Editorial**: 80 words
- **Resolution**: 300 DPI for print quality

---

## Technical Requirements

### Dependencies

```bash
npm install @react-pdf/renderer
```

### Database Schema

```sql
CREATE TYPE print_ad_status AS ENUM ('draft', 'final');
CREATE TYPE print_ad_type AS ENUM ('newsletter_digital', 'magazine_quarter_page');

CREATE TABLE print_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ad_type print_ad_type NOT NULL DEFAULT 'magazine_quarter_page',
  headline VARCHAR(100),
  body_copy TEXT,
  cta_text VARCHAR(50),
  main_image_url TEXT,
  flyer_image_url TEXT,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  club_data JSONB,
  status print_ad_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### TypeScript Types

```typescript
export type PrintAdStatus = 'draft' | 'final';
export type PrintAdType = 'newsletter_digital' | 'magazine_quarter_page';

export interface PrintAd {
  id: string;
  name: string;
  ad_type: PrintAdType;
  headline: string | null;
  body_copy: string | null;
  cta_text: string | null;
  main_image_url: string | null;
  flyer_image_url: string | null;
  club_id: string | null;
  club_data: {
    name: string;
    dates: string;
    age_range: string;
    location: string;
    prices: { option: string; price: number }[];
  } | null;
  status: PrintAdStatus;
  created_at: string;
  updated_at: string;
}
```

---

## Feature Breakdown

### Feature 1: Ad Creator UI

**Location**: `/admin/marketing/print-ads/create`

#### 1.1 Club Selector
- Dropdown to select active club
- Auto-populates: club name, dates, age range, location, pricing
- Caches club data in `club_data` JSONB for historical reference

#### 1.2 Image Picker
- Select from existing Cloudinary libraries (newsletter_images, meta_ad_images)
- Upload new images if needed
- Main image (required) + optional flyer image

#### 1.3 Copy Editor
- Headline field (max 100 chars)
- Body copy textarea with live word count (target: 80+ words)
- CTA text (max 50 chars)
- AI Generate button for copy

### Feature 2: AI Copy Generation

**Location**: `/api/admin/print-ads/generate`

#### 2.1 System Prompt
```
You are an expert print advertising copywriter for "The Clubhouse", a premium
children's holiday club on a working farm in the Scottish Borders.

Requirements:
- Write in THIRD PERSON (not addressing reader directly)
- Body copy: exactly 80 words minimum
- Professional magazine editorial tone
- Highlight unique farm experience
- Include dates, ages, and location naturally
- British English spelling

Output JSON:
{
  "headline": "Short punchy headline (max 8 words)",
  "bodyCopy": "80+ word editorial paragraph in third person...",
  "ctaText": "Call to action (max 4 words)"
}
```

#### 2.2 Context Provided
- Club data (name, dates, age range, prices)
- Main image URL (for vision analysis)
- Optional admin notes/guidance

### Feature 3: Live Preview

**Location**: `PrintAdPreview.tsx`

#### 3.1 Preview Features
- HTML representation at correct aspect ratio
- Real-time updates as content changes
- Toggle between ad types (quarter page, digital)
- Shows actual dimensions label

#### 3.2 Styling
- Uses Craigies brand colors (Olive, Cream, Burnt Orange, Dark Olive)
- Playfair Display for headlines
- Nunito Sans for body text
- Matches PDF output exactly

### Feature 4: PDF Generation

**Location**: `/api/admin/print-ads/pdf`

#### 4.1 PDF Document
- Uses `@react-pdf/renderer`
- Registers Playfair Display and Nunito Sans fonts
- Exact dimensions: 105mm x 148mm (quarter page)
- 300 DPI resolution for print quality

#### 4.2 Template Zones
- Image zone (top portion)
- Headline zone
- Body copy zone
- CTA zone
- Footer zone (website, contact info)

### Feature 5: Ad Management

**Location**: `/admin/marketing/print-ads`

#### 5.1 List View
- Shows all print ads in card/table format
- Filter by status (draft/final)
- Shows preview thumbnail, name, type, status, date

#### 5.2 Actions
- Edit (returns to form)
- Download PDF
- Duplicate (creates new draft)
- Delete (with confirmation)
- Mark as Final

---

## File Structure

```
src/
├── app/
│   └── admin/
│       └── marketing/
│           └── print-ads/
│               ├── page.tsx                    # List page
│               ├── PrintAdsManager.tsx         # List client component
│               ├── create/
│               │   ├── page.tsx                # Create page
│               │   └── PrintAdForm.tsx         # Form client component
│               └── [id]/
│                   └── page.tsx                # Edit page
│   └── api/
│       └── admin/
│           └── print-ads/
│               ├── route.ts                    # GET list, POST create
│               ├── [id]/route.ts               # GET, PATCH, DELETE
│               ├── generate/route.ts           # AI copy generation
│               └── pdf/route.ts                # PDF generation
├── components/
│   └── print-ads/
│       ├── PrintAdPreview.tsx                  # Live preview
│       ├── PrintAdPdfDocument.tsx              # @react-pdf document
│       ├── ClubSelector.tsx                    # Club dropdown
│       └── PrintAdImagePicker.tsx              # Image selector
└── lib/
    └── print-ads/
        ├── templates.ts                        # Dimensions, zones, colors
        └── types.ts                            # TypeScript types
```

---

## API Routes

### `GET /api/admin/print-ads`
Returns list of all print ads with status filter support.

### `POST /api/admin/print-ads`
Creates new print ad draft.

### `GET /api/admin/print-ads/[id]`
Returns single print ad with full details.

### `PATCH /api/admin/print-ads/[id]`
Updates print ad fields.

### `DELETE /api/admin/print-ads/[id]`
Deletes print ad.

### `POST /api/admin/print-ads/generate`
Generates AI copy based on club data and image.

### `POST /api/admin/print-ads/pdf`
Generates and returns PDF file for download.

---

## Brand Guidelines

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Olive | #7A7C4A | Primary brand, backgrounds |
| Cream | #F5F4ED | Page background |
| Burnt Orange | #D4843E | CTAs, accents |
| Dark Olive | #5A5C3A | Headings, text |

### Typography
| Element | Font | Weight |
|---------|------|--------|
| Headlines | Playfair Display | 700 |
| Body | Nunito Sans | 400 |
| CTA | Nunito Sans | 600 |

### Print Specifications
| Spec | Value |
|------|-------|
| Quarter Page Size | 105mm x 148mm |
| Resolution | 300 DPI |
| Color Mode | RGB (CMYK conversion may be needed) |
| Margins | 8mm |
| Bleed | 3mm (optional for professional print) |

---

## Success Metrics

1. **Time to create ad**: Target < 5 minutes from start to PDF download
2. **Word count accuracy**: AI generates 80-100 words consistently
3. **PDF quality**: Prints correctly at specified dimensions
4. **User satisfaction**: Admin can create ads without design skills
