# PRD: Website Analytics System

## Status: ✅ IMPLEMENTED

**Implementation Date**: January 26, 2026
**Commits**: `e501c63`, `c30a274`

---

## Implementation Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Feature 1: UTM Parameter Capture | ✅ Done | `/src/lib/utm.ts` |
| Feature 2: UTM Storage in Bookings | ✅ Done | Checkout + webhook updated |
| Feature 3: Analytics Core Library | ✅ Done | `/src/lib/analytics.ts` |
| Feature 4: Booking Funnel Tracking | ✅ Done | BookingForm.tsx + ClubViewTracker |
| Feature 5: Purchase Event (Server) | ✅ Done | Stripe webhook |
| Feature 6: Meta Pixel Integration | ✅ Done | `/src/components/MetaPixel.tsx` |
| Feature 7: Meta Conversions API | ✅ Done | `/src/lib/meta-conversions.ts` |
| Feature 8: Newsletter UTM Links | ✅ Done | `/src/lib/email.ts` |
| Feature 9: Newsletter Attribution | ✅ Done | Webhook stores attribution |
| Feature 10: First-Party Analytics | ✅ Done | `/api/analytics/event` |
| Feature 11: Dashboard - Overview | ✅ Done | `/admin/analytics` |
| Feature 12: Dashboard - Funnel | ✅ Done | `/admin/analytics/funnel` |
| Feature 13: Dashboard - Campaigns | ✅ Done | `/admin/analytics/campaigns` |
| Feature 14: Dashboard - Newsletters | ✅ Done | `/admin/analytics/newsletters` |
| Feature 15: Data Cleanup Job | ✅ Done | Vercel cron at 3am UTC |

---

## Post-Implementation Setup

### ✅ Completed
- [x] Database migration applied to Supabase
- [x] Vercel cron job configured (`vercel.json`)
- [x] Code deployed to production

### ⏳ Pending Environment Variables

Add to Vercel Dashboard → Settings → Environment Variables:

| Variable | Status | Where to Get It |
|----------|--------|-----------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ✅ Already set | - |
| `NEXT_PUBLIC_META_PIXEL_ID` | ⏳ Needed | Facebook Business Manager → Events Manager |
| `META_CONVERSIONS_API_TOKEN` | ⏳ Needed | Events Manager → Settings → Generate Token |
| `GA_API_SECRET` | ⏳ Optional | GA4 Admin → Data Streams → Measurement Protocol |
| `CRON_SECRET` | ⏳ Optional | Generate random string for cron auth |

---

## Verification Checklist

After setting environment variables:

- [ ] Visit site with `?utm_source=test&utm_medium=test` → check sessionStorage
- [ ] Install Meta Pixel Helper extension → verify pixel fires
- [ ] Complete test booking → check GA4 DebugView for events
- [ ] View `/admin/analytics` → dashboard loads with data
- [ ] Send test newsletter → verify UTM links appended
- [ ] Click newsletter link → complete booking → check attribution

---

## Files Created

```
src/lib/
├── analytics.ts           # Core tracking functions
├── analytics-queries.ts   # Dashboard data queries
├── meta-conversions.ts    # Server-side Meta API
└── utm.ts                 # UTM parameter handling

src/components/
├── MetaPixel.tsx                    # Meta Pixel script
├── analytics/ClubViewTracker.tsx    # View tracking
└── admin/analytics/
    ├── KPICard.tsx
    ├── DateRangePicker.tsx
    ├── RevenueChart.tsx
    ├── FunnelChart.tsx
    ├── SourcePieChart.tsx
    └── CampaignTable.tsx

src/app/admin/analytics/
├── page.tsx              # Overview dashboard
├── funnel/page.tsx       # Funnel analysis
├── campaigns/page.tsx    # Campaign performance
└── newsletters/page.tsx  # Newsletter attribution

src/app/api/
├── analytics/event/route.ts           # Event collection
├── admin/analytics/overview/route.ts  # Overview API
├── admin/analytics/funnel/route.ts    # Funnel API
├── admin/analytics/campaigns/route.ts # Campaigns API
├── admin/analytics/newsletters/route.ts
├── newsletter/click/route.ts          # Click tracking
└── cron/cleanup-analytics/route.ts    # 90-day cleanup

supabase/migrations/
└── 20260126100000_add_analytics.sql   # DB migration

vercel.json                            # Cron config
```

## Files Modified

- `src/app/layout.tsx` - Added MetaPixel
- `src/app/admin/layout.tsx` - Added Analytics nav
- `src/app/book/[clubSlug]/BookingForm.tsx` - Funnel tracking
- `src/app/clubs/[slug]/page.tsx` - View tracking
- `src/app/api/checkout/route.ts` - UTM storage
- `src/app/api/stripe/webhook/route.ts` - Purchase tracking
- `src/lib/email.ts` - Newsletter UTM links
- `src/types/database.ts` - New types

---

## Original PRD (Reference)

<details>
<summary>Click to expand original requirements</summary>

### Feature 1: UTM Parameter Capture
Capture and persist UTM parameters from marketing campaigns.

### Feature 2: UTM Storage in Bookings
Pass captured UTM parameters through checkout.

### Feature 3: Analytics Core Library
Centralized analytics library for GA4 and first-party tracking.

### Feature 4: Booking Funnel Event Tracking
Track each step of the booking funnel.

### Feature 5: Purchase Event Tracking (Server-Side)
Track purchases via Stripe webhook.

### Feature 6: Meta Pixel Integration
Add Meta (Facebook) Pixel for tracking.

### Feature 7: Meta Conversions API (Server-Side)
Track purchases server-side via Meta API.

### Feature 8: Newsletter UTM Links
Auto-add UTM parameters to newsletter links.

### Feature 9: Newsletter Attribution
Track which bookings came from which newsletters.

### Feature 10: First-Party Analytics Storage
Store analytics events in our database.

### Feature 11-14: Analytics Dashboard
Admin dashboard with overview, funnel, campaigns, and newsletters pages.

### Feature 15: Data Cleanup Job
Delete analytics events older than 90 days.

</details>
