# PRD: Website Analytics System

## Status: ✅ FULLY OPERATIONAL

**Implementation Date**: January 26, 2026
**Key Commits**: `e501c63`, `c30a274`, `6ecc1d3`

---

## Implementation Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Feature 1: UTM Parameter Capture | ✅ Done | `/src/lib/utm.ts` |
| Feature 2: UTM Storage in Bookings | ✅ Done | Checkout + webhook updated |
| Feature 3: Analytics Core Library | ✅ Done | `/src/lib/analytics.ts` |
| Feature 4: Booking Funnel Tracking | ✅ Done | BookingForm.tsx + ClubViewTracker |
| Feature 5: Purchase Event (Server) | ✅ Done | Stripe webhook |
| Feature 6: Meta Pixel Integration | ✅ Done | Inline in layout.tsx head |
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

## Environment Variables

| Variable | Status | Value/Notes |
|----------|--------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ✅ Set | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | ✅ Set | `1302476551052016` (Craigies Clubhouse Pixel) |
| `META_CONVERSIONS_API_TOKEN` | ✅ Set | Server-side purchase tracking |
| `GA_API_SECRET` | ⏳ Optional | For server-side GA4 events |
| `CRON_SECRET` | ⏳ Optional | For cron job authentication |

---

## Meta Pixel Debugging (Jan 26, 2026)

### Issues Found & Fixed

**Issue 1: Newline in Environment Variable**
- The Pixel ID had a trailing `\n` character causing JavaScript syntax error
- Fix: Added `.trim()` to env variable usage in layout.tsx

**Issue 2: Content Security Policy (CSP) Blocking Facebook**
- `next.config.ts` had strict CSP that didn't include Facebook domains
- The browser blocked `connect.facebook.net/en_US/fbevents.js`
- Fix: Added Facebook domains to CSP:
  ```
  script-src: + https://connect.facebook.net
  img-src: + https://www.facebook.com
  connect-src: + https://www.facebook.com https://*.facebook.com
  ```

**Debugging Method:**
- Used Playwright to load site and monitor network requests
- Console showed CSP violation error that wasn't visible in browser

### Working Configuration

- **Pixel**: Craigies Clubhouse Pixel (ID: `1302476551052016`)
- **Location**: Inline `<script>` in `<head>` section of `src/app/layout.tsx`
- **Events**: PageView on all pages, ViewContent, AddToCart, InitiateCheckout tracked

---

## Verification Checklist

- [x] Database migration applied to Supabase
- [x] Vercel cron job configured (`vercel.json`)
- [x] Meta Pixel ID set in Vercel env vars
- [x] Meta Conversions API token set
- [x] CSP updated to allow Facebook domains
- [x] Meta Pixel firing (verified via Playwright)
- [x] Events appearing in Meta Events Manager
- [ ] Test full booking flow end-to-end
- [ ] Verify purchase event in Meta after real transaction

---

## Files Summary

### Created
```
src/lib/
├── analytics.ts           # Core tracking functions
├── analytics-queries.ts   # Dashboard data queries
├── meta-conversions.ts    # Server-side Meta API
└── utm.ts                 # UTM parameter handling

src/components/
├── UTMCapture.tsx                   # Client-side UTM capture
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
└── 20260126100000_add_analytics.sql

vercel.json                            # Cron config
```

### Modified
- `src/app/layout.tsx` - Meta Pixel in head, UTMCapture component
- `src/app/admin/layout.tsx` - Analytics nav section
- `src/app/book/[clubSlug]/BookingForm.tsx` - Funnel tracking
- `src/app/clubs/[slug]/page.tsx` - View tracking
- `src/app/api/checkout/route.ts` - UTM storage
- `src/app/api/stripe/webhook/route.ts` - Purchase tracking
- `src/lib/email.ts` - Newsletter UTM links
- `src/types/database.ts` - New types
- `next.config.ts` - Added Facebook to CSP

---

## What's Next

### Immediate
1. **Test end-to-end booking** - Complete a test purchase and verify Meta Purchase event
2. **Check GA4 events** - Verify funnel events appear in Google Analytics

### Future Enhancements
1. **GA4 Server-side tracking** - Add `GA_API_SECRET` for Measurement Protocol
2. **Custom audiences** - Create Meta audiences from pixel events
3. **Conversion value optimization** - Pass revenue to Meta for ROAS tracking
4. **A/B testing integration** - Track experiment variants in analytics
5. **Dashboard improvements** - Add more visualizations, export features
6. **Newsletter click tracking** - Wire up `/api/newsletter/click` endpoint to wrap newsletter links, enabling per-subscriber click tracking in the database (currently only UTM tracking is active)
