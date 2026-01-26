# PRD: Meta Ads Manager

## Status: 📋 PLANNED

**Implementation Lead**: Ralphy
**Target**: Q1 2026

---

## Overview

Build an in-house Meta (Facebook/Instagram) ads creation and management system directly within the admin panel. Users can upload images, use AI to generate ad creative, preview ads in multiple formats, publish directly to Meta, and track performance—all without leaving the admin dashboard.

### Goals

1. **Simplify ad creation** - Non-technical staff can create professional ads
2. **Maintain brand consistency** - AI enforces Craigies brand guidelines
3. **Reduce friction** - No need to switch to Meta Ads Manager
4. **Track ROI** - Connect ad spend to actual bookings

### Similar To

This feature mirrors the existing **Newsletter AI Generator** workflow:
- Upload images → AI generates content → Preview → Publish → Track

---

## User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Admin | Upload images and get AI-generated ad copy | I don't need copywriting skills |
| Admin | Preview how ads look on FB/IG before publishing | I can ensure quality |
| Admin | Publish ads directly from the admin panel | I don't need to use Ads Manager |
| Admin | See ad performance alongside booking data | I can measure ROI |
| Admin | Create ads for upcoming clubs quickly | I can promote new clubs efficiently |

---

## Technical Requirements

### Meta Business Setup (Prerequisites)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Meta Business Manager account | ⏳ Required | business.facebook.com |
| Ad Account | ⏳ Required | Connected to Business Manager |
| Meta App | ⏳ To create | developers.facebook.com |
| System User | ⏳ To create | For API authentication |
| System User Token | ⏳ To generate | `ads_management` permission |
| Payment method | ⏳ Required | For ad spend |

### Environment Variables

```env
# Meta Ads API
META_APP_ID=
META_APP_SECRET=
META_SYSTEM_USER_TOKEN=
META_AD_ACCOUNT_ID=
META_PAGE_ID=
META_INSTAGRAM_ACTOR_ID=
```

---

## Feature Breakdown

### Feature 1: Ad Creative Generator (AI)

**Location**: `/admin/marketing/ads/create`

#### 1.1 Image Upload
- Reuse existing `ImageUploader` component from newsletters
- Support 1-10 images per ad
- Images stored in Cloudinary
- Save to ad image library for reuse

#### 1.2 AI Content Generation
- Use Claude API (same pattern as newsletter generator)
- Input:
  - Uploaded images (analyzed with vision)
  - Selected club (optional)
  - Promo code (optional)
  - Ad objective (awareness/traffic/conversions)
  - Rough notes/guidance (optional)
- Output:
  - Primary text (main copy, 125 chars recommended)
  - Headline (40 chars max)
  - Description (30 chars max)
  - Multiple variants for A/B testing (optional)

#### 1.3 AI System Prompt Guidelines
```
- Tone: Warm, friendly, parent-focused
- Brand: Craigies Clubhouse / Explore the Clubhouse
- Include: Clear value proposition, urgency if applicable
- Avoid: Clickbait, ALL CAPS, excessive punctuation
- Format: Compliant with Meta ad policies
- CTA: Drive to booking page
```

### Feature 2: Ad Preview

**Component**: `AdPreview.tsx`

#### 2.1 Preview Formats
| Placement | Dimensions | Preview |
|-----------|------------|---------|
| Facebook Feed | 1:1, 4:5 | Desktop + Mobile |
| Instagram Feed | 1:1, 4:5 | Mobile |
| Instagram Stories | 9:16 | Mobile |
| Facebook Stories | 9:16 | Mobile |
| Audience Network | 16:9 | Banner |

#### 2.2 Preview Features
- Toggle between placements
- Show ad with actual images and copy
- Character count warnings (over limit)
- Brand/page name display
- CTA button preview

### Feature 3: Ad Publishing

**API Route**: `/api/admin/ads/publish`

#### 3.1 Campaign Structure (Meta Hierarchy)
```
Campaign (objective: CONVERSIONS)
  └── Ad Set (targeting, budget, schedule)
        └── Ad (creative: images + copy)
```

#### 3.2 Publishing Flow
1. Create Campaign (if not exists for this club)
2. Create Ad Set with:
   - Budget (daily or lifetime)
   - Schedule (start/end dates)
   - Targeting (location, age, interests)
   - Placements (automatic or manual)
3. Upload images to Meta Ad Library
4. Create Ad with creative
5. Submit for Meta review
6. Poll for review status

#### 3.3 Targeting Presets
| Preset | Configuration |
|--------|---------------|
| Local Parents | 25-45 age, 20mi radius, interests: parenting, children's activities |
| School Holiday | Above + behavior: parents with school-age children |
| Retargeting | Website visitors (requires pixel audience) |
| Lookalike | Similar to past bookers (requires source audience) |

#### 3.4 Budget Options
- Daily budget: £5, £10, £20, £50, custom
- Lifetime budget: Total spend over campaign duration
- Suggested budget based on audience size

### Feature 4: Ad Management

**Location**: `/admin/marketing/ads`

#### 4.1 Ad List View
- All ads with status badges
- Filters: status, date range, club
- Quick actions: pause, resume, duplicate
- Thumbnail preview

#### 4.2 Ad Statuses
| Status | Description | Actions |
|--------|-------------|---------|
| Draft | Not submitted | Edit, Delete, Publish |
| Pending Review | Submitted to Meta | View |
| Active | Running | Pause, View Stats |
| Paused | Manually paused | Resume, Edit |
| Rejected | Failed Meta review | View Reason, Edit, Resubmit |
| Completed | Schedule ended | Duplicate, View Stats |

#### 4.3 Ad Detail View
- Full creative preview
- Performance metrics
- Edit (if draft/rejected)
- Duplicate functionality

### Feature 5: Performance Analytics

**Location**: `/admin/analytics/ads`

#### 5.1 Metrics to Track (from Meta API)
| Metric | Description |
|--------|-------------|
| Impressions | Times ad was shown |
| Reach | Unique people who saw ad |
| Clicks | Link clicks |
| CTR | Click-through rate |
| CPC | Cost per click |
| CPM | Cost per 1000 impressions |
| Spend | Total amount spent |
| Conversions | Purchase events (via pixel) |
| ROAS | Return on ad spend |

#### 5.2 Dashboard Components
- KPI cards (spend, conversions, ROAS)
- Performance chart (spend vs conversions over time)
- Ad comparison table
- Attribution to bookings (via UTM + pixel)

#### 5.3 Booking Attribution
- Ads link to: `exploretheclubhouse.com/clubs?utm_source=facebook&utm_medium=paid&utm_campaign={ad_id}`
- Match `utm_campaign` to ad ID in bookings table
- Calculate revenue attributed to each ad

---

## Database Schema

### meta_ads
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Internal name |
| club_id | uuid | FK → clubs (nullable) |
| promo_code_id | uuid | FK → promo_codes (nullable) |
| objective | text | awareness/traffic/conversions |
| primary_text | text | Main ad copy |
| headline | text | Short headline |
| description | text | Optional description |
| cta_type | text | LEARN_MORE/BOOK_NOW/SHOP_NOW |
| cta_url | text | Destination URL |
| image_urls | text[] | Cloudinary URLs |
| targeting_preset | text | local_parents/school_holiday/etc |
| custom_targeting | jsonb | Custom targeting config |
| budget_type | text | daily/lifetime |
| budget_amount | integer | In pence |
| schedule_start | timestamptz | When to start |
| schedule_end | timestamptz | When to end (nullable) |
| status | text | draft/pending/active/paused/rejected/completed |
| meta_campaign_id | text | Meta API campaign ID |
| meta_adset_id | text | Meta API ad set ID |
| meta_ad_id | text | Meta API ad ID |
| meta_review_status | text | pending/approved/rejected |
| meta_rejection_reason | text | If rejected |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| published_at | timestamptz | |

### meta_ad_metrics
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| ad_id | uuid | FK → meta_ads |
| date | date | Metrics date |
| impressions | integer | |
| reach | integer | |
| clicks | integer | |
| spend | integer | In pence |
| conversions | integer | Purchase events |
| created_at | timestamptz | |

### meta_ad_images (library)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| url | text | Cloudinary URL |
| public_id | text | Cloudinary public ID |
| label | text | User label |
| description | text | For AI context |
| tags | text[] | Searchable tags |
| width | integer | |
| height | integer | |
| aspect_ratio | text | 1:1, 4:5, 9:16 |
| meta_image_hash | text | Meta's image hash after upload |
| created_at | timestamptz | |

---

## API Routes

### Admin Routes (cookie-protected)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/ads` | List ads with filters |
| POST | `/api/admin/ads` | Create draft ad |
| GET | `/api/admin/ads/[id]` | Get ad details |
| PATCH | `/api/admin/ads/[id]` | Update draft ad |
| DELETE | `/api/admin/ads/[id]` | Delete draft ad |
| POST | `/api/admin/ads/generate` | AI generate ad content |
| POST | `/api/admin/ads/publish` | Publish ad to Meta |
| POST | `/api/admin/ads/[id]/pause` | Pause active ad |
| POST | `/api/admin/ads/[id]/resume` | Resume paused ad |
| POST | `/api/admin/ads/[id]/duplicate` | Duplicate ad as draft |
| GET | `/api/admin/ads/[id]/metrics` | Get ad performance |
| GET | `/api/admin/ads/metrics/sync` | Sync metrics from Meta |
| GET/POST/DELETE | `/api/admin/ads/images` | Image library CRUD |
| GET | `/api/admin/ads/targeting-presets` | Get targeting presets |

### Webhook Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/meta/webhook` | Meta ad status updates (optional) |

---

## File Structure

```
src/app/admin/marketing/ads/
├── page.tsx                    # Ad list
├── create/page.tsx             # Create new ad
├── [id]/page.tsx               # Ad detail/edit
├── AdsManager.tsx              # Client component for list
├── AdForm.tsx                  # Create/edit form with AI
├── AdPreview.tsx               # Multi-format preview
├── ImageUploader.tsx           # Reuse from newsletters
└── TargetingSelector.tsx       # Targeting preset picker

src/app/admin/analytics/ads/
└── page.tsx                    # Ad performance dashboard

src/app/api/admin/ads/
├── route.ts                    # CRUD operations
├── generate/route.ts           # AI content generation
├── publish/route.ts            # Publish to Meta
├── [id]/
│   ├── route.ts                # Single ad operations
│   ├── pause/route.ts
│   ├── resume/route.ts
│   ├── duplicate/route.ts
│   └── metrics/route.ts
├── images/route.ts             # Image library
├── metrics/
│   └── sync/route.ts           # Sync from Meta API
└── targeting-presets/route.ts

src/lib/
├── meta-ads.ts                 # Meta Marketing API client
└── meta-ads-queries.ts         # Dashboard queries

src/types/
└── database.ts                 # Add Meta ads types

supabase/migrations/
└── YYYYMMDDHHMMSS_add_meta_ads.sql
```

---

## UI/UX Design

### Ad Creation Flow (3 Steps)

**Step 1: Upload & Configure**
- Image uploader (drag & drop, library)
- Select club (optional, populates details)
- Select promo code (optional)
- Choose objective (awareness/traffic/conversions)
- Add rough notes for AI (optional)

**Step 2: Generate & Edit**
- Click "Generate with AI"
- Review generated content:
  - Primary text (with char count)
  - Headline (with char count)
  - Description (with char count)
- Edit any field manually
- Regenerate individual fields
- Generate variants (optional)

**Step 3: Targeting & Budget**
- Select targeting preset or customize
- Set budget (daily/lifetime)
- Set schedule (start/end dates)
- Review estimated reach
- Preview in all placements
- Save as draft or publish

### Design Patterns
- Match existing admin UI (Craigies palette)
- Playfair Display headings, Nunito Sans body
- Burnt orange CTAs, olive accents
- Mobile-responsive (but desktop-primary for admin)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Create database tables and types
2. Set up Meta App and System User
3. Create `/lib/meta-ads.ts` API client
4. Basic CRUD routes for ads
5. Ad list page in admin

### Phase 2: AI Creative Generation (Week 2)
1. Build AdForm component with image upload
2. Implement `/api/admin/ads/generate` with Claude
3. Create AI system prompt for ad copy
4. Build edit/review UI for generated content
5. Image library functionality

### Phase 3: Preview System (Week 3)
1. Build AdPreview component
2. Implement all placement formats (FB Feed, IG Feed, Stories)
3. Desktop/mobile toggle
4. Character limit warnings
5. Save as draft functionality

### Phase 4: Publishing (Week 4)
1. Implement Meta Marketing API integration
2. Campaign/AdSet/Ad creation flow
3. Image upload to Meta
4. Status polling for review
5. Error handling for rejections

### Phase 5: Management (Week 5)
1. Pause/resume functionality
2. Duplicate ad feature
3. Status badges and filtering
4. Ad detail view
5. Rejection handling UI

### Phase 6: Analytics (Week 6)
1. Metrics sync from Meta Reporting API
2. Build analytics dashboard
3. Attribution to bookings
4. ROAS calculations
5. Performance comparison table

---

## Meta API Reference

### Key Endpoints

```
# Campaign
POST /{ad_account_id}/campaigns
GET /{campaign_id}

# Ad Set
POST /{ad_account_id}/adsets
GET /{adset_id}

# Ad Creative
POST /{ad_account_id}/adcreatives
POST /{ad_account_id}/adimages

# Ad
POST /{ad_account_id}/ads
GET /{ad_id}
POST /{ad_id} (to update status)

# Insights (metrics)
GET /{ad_id}/insights
GET /{ad_account_id}/insights
```

### Required Permissions
- `ads_management` - Create and manage ads
- `ads_read` - Read ad performance
- `business_management` - Access Business Manager
- `pages_read_engagement` - For page-linked ads

### Rate Limits
- Standard: 200 calls/hour per ad account
- Batch requests recommended for metrics sync

---

## Error Handling

### Meta API Errors
| Error | Handling |
|-------|----------|
| Invalid token | Prompt to refresh System User token |
| Ad rejected | Show rejection reason, allow edit + resubmit |
| Budget too low | Show minimum budget requirement |
| Image too small | Show dimension requirements |
| Rate limited | Queue and retry with backoff |
| Policy violation | Show specific policy violated |

### User Feedback
- Clear error messages (not raw API errors)
- Actionable next steps
- Link to Meta policies if relevant

---

## Security Considerations

- System User token stored in env vars (never client-side)
- All ad operations server-side only
- Admin auth required for all routes
- Audit log for ad publishes (who, when, what)
- Budget limits configurable (prevent accidental overspend)

---

## Success Criteria

- [ ] Admin can create ad from images in under 5 minutes
- [ ] AI generates on-brand, policy-compliant copy
- [ ] Ads publish successfully to Meta on first attempt (>90%)
- [ ] Performance metrics visible within 24 hours of ad start
- [ ] Booking attribution accurately tracks ad-driven revenue
- [ ] No accidental overspend (budget controls working)

---

## Future Enhancements

1. **A/B Testing** - Auto-generate multiple variants, let Meta optimize
2. **Carousel Ads** - Multiple images in single ad
3. **Video Ads** - Support video upload and preview
4. **Audience Builder** - Custom audience creation from pixel data
5. **Automated Rules** - Pause ads if ROAS drops below threshold
6. **Scheduling Templates** - Pre-built campaigns for each club type
7. **Bulk Operations** - Create multiple ads at once
8. **Instagram Shopping** - Product tags (if applicable)
9. **Lead Ads** - Collect leads directly in Meta (no landing page)
10. **Messenger Ads** - Click-to-Messenger campaigns

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| `facebook-nodejs-business-sdk` | Meta Marketing API client |
| Existing: Claude API | AI content generation |
| Existing: Cloudinary | Image storage |
| Existing: Supabase | Database |

---

## Questions to Resolve

1. **Budget approval workflow** - Should there be spending limits requiring approval?
2. **Multiple ad accounts** - Will you ever have more than one ad account?
3. **Team access** - Who should be able to create/publish ads?
4. **Notification preferences** - Email alerts for ad rejections/completions?

---

## Appendix: Meta Ad Specifications

### Image Specs
| Placement | Ratio | Min Size | Recommended |
|-----------|-------|----------|-------------|
| Feed | 1.91:1 to 1:1 | 600x600 | 1080x1080 |
| Stories | 9:16 | 500x888 | 1080x1920 |
| Carousel | 1:1 | 600x600 | 1080x1080 |

### Text Specs
| Element | Recommended | Maximum |
|---------|-------------|---------|
| Primary text | 125 chars | 2200 chars |
| Headline | 40 chars | 255 chars |
| Description | 30 chars | 255 chars |

### CTA Options
- LEARN_MORE
- BOOK_NOW
- SHOP_NOW
- SIGN_UP
- CONTACT_US
- GET_OFFER
