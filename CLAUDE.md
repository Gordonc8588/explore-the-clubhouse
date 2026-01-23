# Explore the Clubhouse

Children's holiday club booking platform. This is a live production business.

## Tech Stack

- **Framework**: Next.js 16 with App Router (React 19)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (Checkout sessions, webhooks)
- **Email**: Resend (bookings@exploretheclubhouse.com)
- **SMS**: Twilio
- **Styling**: Tailwind CSS 4
- **Images**: Cloudinary
- **Hosting**: Vercel (auto-deploy on push to main)

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (ALWAYS run before committing)
npm run lint     # ESLint
npm start        # Start production server
```

## Development Workflow

- Commit directly to main branch
- Auto-deploys to production via Vercel on push
- No staging environment - production only
- **Always run `npm run build` before committing to catch errors**
- **Ensure no TypeScript errors**
- **Test changes locally in browser before committing**

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Public pages (home, about, contact, gallery)
│   ├── (legal)/         # Terms, privacy, safeguarding
│   ├── clubs/           # Club listing and detail pages
│   ├── book/[clubSlug]/ # Multi-step booking form
│   ├── complete/        # Post-payment child info collection
│   ├── confirmation/    # Booking confirmation page
│   ├── add-days/        # Add extra days to existing booking
│   ├── admin/           # Admin dashboard (protected)
│   └── api/             # API routes
├── components/          # Reusable components
├── lib/                 # Utilities (supabase, stripe, email, sms, etc.)
└── types/               # TypeScript types (database.ts)
```

## Database Schema (Supabase)

Key tables:
- **clubs** - Holiday clubs (Easter, Summer, etc.) with dates, capacity, age range
- **club_days** - Individual days with morning/afternoon capacity (default 30 each)
- **booking_options** - Pricing options (Full Week, Single Day, etc.) with prices in pence
- **bookings** - Parent bookings with status (pending → paid → complete)
- **booking_days** - Links bookings to specific days/time slots
- **children** - Child info collected after payment (name, DOB, allergies, emergency contact)
- **promo_codes** - Discount codes with percentage off
- **waitlist** - Queue for sold-out clubs

All prices stored in **pence** (integers), formatted for display.

## Key Patterns

- **Server Components by default** - Only use `'use client'` when necessary
- **Match existing code patterns** - Keep things simple, avoid over-engineering
- **Zod validation** on all API inputs
- **Error handling** with try-catch in API routes
- **Dates** as ISO strings from DB, format with date-fns for display
- **Phone numbers** stored as strings

## API Routes

Public:
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle payment completion
- `POST /api/children` - Save child info after payment
- `POST /api/contact` - Contact form (rate-limited 5/min)
- `GET /api/calendar/[bookingId]` - Generate ICS file

Admin (cookie-protected):
- `POST /api/admin/login` - Admin login
- `POST /api/admin/clubs` - Create new club

## Admin Auth

Simple cookie-based auth:
- Cookie: `admin-session` (httpOnly, 24h expiry)
- Middleware protects `/admin/*` routes
- Login: `admin@exploretheclubhouse.co.uk`

## Email/SMS

- Resend for transactional emails (confirmations, reminders)
- Twilio for SMS (booking confirmation, day-of reminders)
- Email templates use inline HTML/CSS

## Database Changes

When making schema changes:
1. Create migration SQL file in `supabase/migrations/`
2. Use naming: `YYYYMMDDHHMMSS_description.sql`
3. Update `src/types/database.ts` to match

## Current Focus Areas

- Expanding admin dashboard features
- Marketing/SEO improvements

## Design System (Figma - Craigies Palette)

### Brand Colors (CSS Variables in globals.css)

**Current Design (Craigies):**
- Primary: Olive (#7A7C4A), Cream (#F5F4ED), Burnt Orange (#D4843E), Dark Olive (#5A5C3A)
- Typography: Playfair Display (serif) for all headings, Nunito Sans for body text
- Design Source: Figma design system implemented site-wide

**Legacy Colors (Phased Out):**
- Old Primary: Forest (#2D5A3D), Meadow (#4A7C59), Sage (#87A878)
- Old Accent: Sunshine (#F5A623), Amber (#E8912D), Coral (#E07A5F)
- Neutrals: Bark (#3D3D3D), Stone (#6B7280), Cloud (#F3F4F6), Pebble (#9CA3AF)

**Semantic Colors (Retained):**
- Success: #22C55E, Warning: #F59E0B, Error: #EF4444

### Component Patterns
- **Buttons**: Primary CTA uses burnt orange background with white text
- **Forms**: Burnt orange focus states, dark olive labels
- **Cards**: White on cream backgrounds with subtle shadows
- **Status Badges**: Olive for complete/active, burnt orange for paid/pending
- **Typography**: All headings use Playfair Display serif font

## Environment Variables

Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_SITE_URL`

## Important Notes

- This is a **live production business** - changes auto-deploy
- Use common sense with sensitive areas (payments, emails, database)
- When uncertain about business logic, make reasonable assumptions
- Always verify build passes before committing
