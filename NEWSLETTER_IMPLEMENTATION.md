# Newsletter Implementation

## Overview
Implemented a fully functional newsletter signup system with dual storage strategy: primary storage in Supabase with optional sync to Brevo for marketing campaigns.

## What Was Implemented

### 1. API Route: `/api/newsletter`
**File**: `src/app/api/newsletter/route.ts`

Features:
- Zod validation for email inputs
- Rate limiting (5 requests/minute, same as contact form)
- Saves to Supabase `newsletter_subscribers` table (primary)
- Optionally syncs to Brevo (graceful failure if API key not set)
- Handles duplicate email detection (409 conflict)
- Tracks signup source (footer, contact-page, etc.)

### 2. Reusable Component: `NewsletterSignup`
**File**: `src/components/NewsletterSignup.tsx`

Features:
- Client component with form state management
- Two variants: `footer` (compact) and `standalone` (larger)
- Loading states with disabled inputs during submission
- Error handling with user-friendly messages
- Success confirmation message
- Follows Craigies design system (olive/burnt orange palette)

### 3. Updated Locations

**Footer** (`src/components/Footer.tsx`):
- Replaced TODO with working newsletter form
- Uses `NewsletterSignup` component with `source="footer"`
- Appears on all pages site-wide

**Contact Page** (`src/app/(marketing)/contact/page.tsx`):
- Replaced non-functional form with `NewsletterSignup`
- Uses `source="contact-page"` for tracking
- Standalone variant for prominence

## Database Schema
Already existed in Supabase:

```sql
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'footer'
);
```

## Environment Variables

### Required (already configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional (for Brevo sync):
- `BREVO_API_KEY` - If not set, emails only save to Supabase

## Brevo Configuration

If you want to enable Brevo syncing:

1. Get API key from Brevo dashboard
2. Add to `.env.local` and Vercel environment variables:
   ```
   BREVO_API_KEY=xkeysib-xxxxx
   ```
3. (Optional) Create a contact list in Brevo and update `listIds` array in `route.ts` line 32

The system works without Brevo - it will just log that sync is skipped.

## Testing Checklist

- [x] Build succeeds with no TypeScript errors
- [ ] Test footer signup on homepage
- [ ] Test contact page signup
- [ ] Verify email saves to Supabase
- [ ] Test duplicate email (should show friendly error)
- [ ] Test rate limiting (5 requests in 60 seconds)
- [ ] Test error states (disconnect internet)
- [ ] (Optional) Verify Brevo sync if API key configured

## Admin View (Future Enhancement)

You may want to add an admin page to view newsletter subscribers:
- List all subscribers with email and signup date
- Filter by source
- Export to CSV
- Manual add/remove

This can be added to `/admin/newsletter` following existing admin patterns.

## Benefits of This Implementation

1. **Reliable** - Emails always saved to Supabase first
2. **Flexible** - Can switch email providers without data loss
3. **Consistent** - Follows contact form patterns (rate limiting, validation)
4. **User-friendly** - Clear feedback on success/errors
5. **Reusable** - Component can be added to any page
6. **Tracked** - Source field tracks where signups came from
