# Explore the Clubhouse - Rebuild Plan

## Overview
A children's holiday club booking platform for parents. Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and Stripe.

**Business Model:** Seasonal holiday clubs (Easter, Summer, etc.) that run during school holidays, replacing school hours (8:30am - 3:30pm). Parents book places for their children, pay immediately, then provide child details after payment.

**Domain:** exploretheclubhouse.com
**Hosting:** Vercel
**Timeline:** ASAP - launch as quickly as possible

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Parent accounts | Guest checkout only | Less friction, simpler UX |
| Booking options | Fixed price per option | Admin sets prices for each option type |
| Multi-day bookings | Full days only | Half-day options only available for full week |
| Payment timing | Pay first, details after | Secures booking, reduces drop-off |
| Email service | Resend (transactional) | Simple API, custom domain setup |
| Newsletter service | Brevo | For marketing emails and updates |
| SMS service | Twilio | For critical reminders (day-before) |
| Overbooking handling | Waitlist | Auto-notify first on list, 24h to book |
| Cancellations | Admin discretion only | No self-service cancellation |
| Modifications | Add days only (self-service) | Parents can add more days, not remove |
| Age validation | Hard validation | Block booking if child outside age range |
| Long clubs (summer) | Week-by-week | Each week is a separate booking period |
| Analytics | Google Analytics | Full GA4 tracking |

---

## Detailed Requirements

### UI/UX Requirements
- **Visual style:** Warm & friendly (soft colors, welcoming imagery, balance of fun and trustworthy)
- **Mobile-first:** Most parents will book on phones - prioritize mobile UX
- **Navigation:** Home, Book Now (prominent CTA), About, Contact
- **Hero section:** Feature next upcoming club prominently with dates and CTA
- **Sold out clubs:** Display with 'Sold Out' badge, allow joining waitlist
- **Real-time availability:** Update capacity numbers as parents browse (websockets or polling)
- **Returning parents:** Fresh entry each time (no pre-filling for now)

### Booking Flow Requirements
- **Per-child age validation:** Only children within age range can be added; others rejected individually
- **Before payment:** Must tick both "Agree to T&Cs" AND "Acknowledge cancellation policy"
- **One club per booking:** Separate booking for each club (no cart system)
- **Promo codes:** Percentage-off codes only (e.g., 10% off)
- **Calendar integration:** ICS download + "Add to Google Calendar" button on confirmation

### Child Information Form (all fields required)
- Child name
- Date of birth
- Allergies/dietary requirements
- Medical notes (free text - sufficient for EpiPen/inhaler needs)
- Emergency contact name + phone
- **Consents (all required):**
  - Photo consent
  - Activity consent (water play, cooking, outdoor trips)
  - Medical consent (administer first aid, call emergency services)

### Incomplete Child Info Handling
- Send reminder emails at 24h and 48h
- Flag in admin dashboard for manual follow-up
- Allow completion later via email link
- Set cutoff deadline before club starts
- Allow late entry even after club ends (for records)

### Email Requirements
- **Sender:** Custom domain (bookings@exploretheclubhouse.com)
- **Confirmation email:** Comprehensive (booking ref, dates, times, price, location/address, parking info, contact details, what to bring, T&Cs link, drop-off instructions)
- **Reminders:** Email 7 days before AND 1 day before first booked day
- **SMS backup:** Twilio SMS on morning of first day (critical reminder)
- **Admin notification:** Email on every new booking

### Admin Requirements
- **Single admin user** (no role-based permissions needed)
- **Club setup:** Auto-generate days from date range, then allow edits (skip days, change capacity)
- **Daily register:** Print-friendly A4 format
- **Allergy display:** Warning icons on each child + dedicated summary section at top of daily register
- **Reporting:** Basic totals (revenue per club, booking count)
- **Financial details:** Use Stripe dashboard for detailed financial reporting

### Pages & Content
- **Navigation:** Home, Book Now, About, Contact
- **About page:** Company story + team bios with photos
- **Gallery:** Dedicated page with photos from past events
- **Footer:** Nav links, contact info, social media (Facebook + Instagram), T&Cs, Privacy Policy, Safeguarding links, newsletter signup
- **Legal pages:** Terms & Conditions, Privacy Policy, Safeguarding statement
- **Contact form:** Send to admin email AND store in database

### Waitlist Feature
- When spot opens: Auto-notify first person on waitlist
- Give them 24 hours to book before moving to next person
- Email notification with direct booking link

### Add Days Modification
- Self-service: Parent can add days and pay immediately online
- Available from confirmation/booking page
- New Stripe checkout for additional amount

---

## User Flows

### Parent Booking Flow
```
Home → Book Now → Club Detail → Select Booking Option → Select Dates (if applicable)
→ Enter Parent Details → Enter Number of Children → Agree to T&Cs + Cancellation Policy
→ Review → Pay (Stripe Checkout) → Child Info Form → Confirmation Page
```

### Admin Flow
```
Login → Dashboard (today's attendance, alerts, incomplete bookings)
→ Daily View (register with child details, allergies highlighted)
→ Bookings List (search, filter, manage)
→ Club Management (create/edit clubs, pricing)
```

---

## Tech Stack & Project Setup

### Initialize Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Additional Dependencies
- `@supabase/supabase-js` - Database client
- `@supabase/ssr` - Server-side Supabase helpers for Next.js
- `stripe` + `@stripe/stripe-js` - Payment processing
- `zod` - Form validation
- `react-hook-form` - Form handling
- `lucide-react` - Icons
- `resend` - Transactional email sending
- `twilio` - SMS notifications
- `ics` - Generate calendar files for download
- `date-fns` - Date manipulation utilities

### Project Structure
```
src/
├── app/
│   ├── (marketing)/              # Static pages group
│   │   ├── page.tsx              # Home (hero with next club)
│   │   ├── about/page.tsx        # Company story + team
│   │   ├── gallery/page.tsx      # Photo gallery from past clubs
│   │   └── contact/page.tsx      # Contact form
│   ├── (legal)/                  # Legal pages
│   │   ├── terms/page.tsx        # Terms & Conditions
│   │   ├── privacy/page.tsx      # Privacy Policy
│   │   └── safeguarding/page.tsx # Safeguarding statement
│   ├── clubs/
│   │   ├── page.tsx              # Club listings (Book Now page)
│   │   └── [slug]/page.tsx       # Club detail + booking options
│   ├── book/
│   │   └── [clubSlug]/page.tsx   # Multi-step booking form
│   ├── complete/
│   │   └── [bookingId]/page.tsx  # Post-payment child info form
│   ├── confirmation/
│   │   └── [bookingId]/page.tsx  # Final confirmation + calendar download
│   ├── add-days/
│   │   └── [bookingId]/page.tsx  # Add days to existing booking
│   ├── waitlist/
│   │   └── [clubId]/page.tsx     # Join waitlist for sold-out club
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/page.tsx
│   │   ├── day/[date]/page.tsx   # Daily attendance (printable)
│   │   ├── bookings/
│   │   │   ├── page.tsx          # Bookings list + search
│   │   │   └── [id]/page.tsx     # Booking detail
│   │   ├── clubs/
│   │   │   ├── page.tsx          # Club management
│   │   │   ├── new/page.tsx      # Create new club
│   │   │   └── [id]/page.tsx     # Edit club
│   │   ├── waitlist/page.tsx     # View all waitlists
│   │   └── promo-codes/page.tsx  # Manage promo codes
│   ├── api/
│   │   ├── stripe/
│   │   │   └── webhook/route.ts
│   │   ├── contact/route.ts      # Contact form submission
│   │   ├── newsletter/route.ts   # Newsletter signup (Brevo)
│   │   └── calendar/[bookingId]/route.ts  # ICS file download
│   └── layout.tsx
├── components/
│   ├── ui/                       # Reusable UI (buttons, inputs, cards)
│   ├── navigation.tsx            # Main nav with Book Now CTA
│   ├── footer.tsx                # Links + newsletter signup
│   ├── club-card.tsx
│   ├── availability-calendar.tsx
│   ├── booking-form/             # Multi-step booking components
│   ├── child-info-form.tsx
│   ├── consent-checkboxes.tsx    # T&Cs + cancellation checkboxes
│   ├── calendar-buttons.tsx      # ICS + Google Calendar
│   └── admin/                    # Admin-specific components
│       ├── daily-register.tsx    # Printable register
│       └── allergy-summary.tsx   # Allergy alerts section
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookies)
│   │   └── admin.ts              # Service role client
│   ├── stripe.ts
│   ├── email.ts                  # Resend integration
│   ├── sms.ts                    # Twilio integration
│   ├── calendar.ts               # ICS generation
│   └── utils.ts
└── types/
    └── database.ts               # Generated Supabase types
```

---

## Database Schema (Supabase)

### Tables

**clubs** (Holiday clubs - e.g., "Easter 2026 Holiday Club")
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | text | Unique, URL-friendly |
| name | text | e.g., "Easter Holiday Club 2026" |
| description | text | |
| image_url | text | |
| start_date | date | First day of club |
| end_date | date | Last day of club |
| morning_start | time | e.g., 08:30 |
| morning_end | time | e.g., 12:00 |
| afternoon_start | time | e.g., 12:00 |
| afternoon_end | time | e.g., 15:30 |
| min_age | integer | |
| max_age | integer | |
| is_active | boolean | Default true |
| created_at | timestamptz | |

**club_days** (Each operating day of a club)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| date | date | |
| morning_capacity | integer | Max children for morning slot |
| afternoon_capacity | integer | Max children for afternoon slot |
| is_available | boolean | Can disable specific days |
| created_at | timestamptz | |

**booking_options** (Pricing options for each club)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| name | text | e.g., "Full Week", "Single Day" |
| description | text | |
| option_type | text | full_week / single_day / multi_day |
| time_slot | text | full_day / morning / afternoon |
| price_per_child | integer | In pence |
| sort_order | integer | Display order |
| is_active | boolean | |
| created_at | timestamptz | |

**Example booking options for "Easter Holiday Club 2026":**
| Name | Option Type | Time Slot | Price |
|------|-------------|-----------|-------|
| Full Week (Full Day) | full_week | full_day | £150 |
| Full Week (Mornings) | full_week | morning | £80 |
| Full Week (Afternoons) | full_week | afternoon | £80 |
| Single Day | single_day | full_day | £35 |
| Multiple Days | multi_day | full_day | £35/day |

**bookings**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| booking_option_id | uuid | FK → booking_options |
| parent_name | text | |
| parent_email | text | |
| parent_phone | text | |
| num_children | integer | |
| total_amount | integer | In pence |
| status | text | pending/paid/cancelled/refunded/complete |
| stripe_payment_intent_id | text | |
| stripe_checkout_session_id | text | |
| created_at | timestamptz | |

**booking_days** (Which specific days are booked)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| booking_id | uuid | FK → bookings |
| club_day_id | uuid | FK → club_days |
| time_slot | text | full_day / morning / afternoon |
| created_at | timestamptz | |

**children** (Child details collected post-payment)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| booking_id | uuid | FK → bookings |
| name | text | Required |
| date_of_birth | date | Required |
| allergies | text | Required |
| medical_notes | text | Required |
| emergency_contact_name | text | Required |
| emergency_contact_phone | text | Required |
| photo_consent | boolean | Required |
| activity_consent | boolean | Required |
| medical_consent | boolean | Required |
| created_at | timestamptz | |

**waitlist** (Parents waiting for spots)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| parent_name | text | |
| parent_email | text | |
| parent_phone | text | |
| num_children | integer | |
| booking_option_id | uuid | FK → booking_options (preferred option) |
| status | text | waiting / notified / expired / booked |
| notified_at | timestamptz | When notification sent |
| expires_at | timestamptz | 24h after notification |
| position | integer | Queue position |
| created_at | timestamptz | |

**promo_codes**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| code | text | Unique, uppercase |
| discount_percent | integer | e.g., 10 for 10% off |
| valid_from | timestamptz | |
| valid_until | timestamptz | |
| max_uses | integer | Null = unlimited |
| times_used | integer | Default 0 |
| club_id | uuid | FK → clubs (null = all clubs) |
| is_active | boolean | Default true |
| created_at | timestamptz | |

**contact_submissions** (Contact form entries)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| email | text | |
| phone | text | Optional |
| message | text | |
| status | text | new / read / replied |
| created_at | timestamptz | |

**newsletter_subscribers**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | Unique |
| subscribed_at | timestamptz | |
| source | text | footer / booking / etc. |

---

## Implementation Phases

### Phase 1: Project Setup + Static Marketing Pages

**Tasks:**
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up Supabase project and environment variables
3. Configure Tailwind with brand colors, fonts (user will provide assets)
4. Set up Google Analytics
5. Create shared layout with navigation (Home, Book Now CTA, About, Contact) and footer
6. Build static pages:
   - **Home** - Hero featuring next club, value proposition, CTA
   - **About** - Company story + team bios with photos
   - **Gallery** - Photo gallery from past clubs
   - **Contact** - Contact form (saves to DB + emails admin)
   - **Terms & Conditions** - Legal page
   - **Privacy Policy** - GDPR-compliant
   - **Safeguarding** - Safeguarding statement
7. Footer with nav links, social (Facebook + Instagram), newsletter signup, legal links
8. Mobile-first responsive design with warm & friendly aesthetic

**Files to create:**
- `src/app/layout.tsx`
- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/gallery/page.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/(legal)/terms/page.tsx`
- `src/app/(legal)/privacy/page.tsx`
- `src/app/(legal)/safeguarding/page.tsx`
- `src/app/api/contact/route.ts`
- `src/app/api/newsletter/route.ts`
- `src/components/navigation.tsx`
- `src/components/footer.tsx`
- `src/lib/supabase/client.ts` (for contact form)

**Verification:**
- Run `npm run dev` and verify all pages render
- Check mobile responsiveness at various breakpoints
- Verify navigation between pages works
- Test contact form submission (saves to DB, sends email)
- Test newsletter signup (saves to DB, syncs to Brevo)
- Verify GA tracking fires on page views

---

### Phase 2: Club Data + Public Listings

**Tasks:**
1. Create Supabase tables: `clubs`, `club_days`, `booking_options`, `waitlist`
2. Set up Supabase client helpers (browser + server)
3. Generate TypeScript types from database schema
4. Seed sample club data (e.g., "Easter Holiday Club 2026")
5. Build club listing page (Book Now page) showing active clubs
   - Display "Sold Out" badge for full clubs
   - Show "Join Waitlist" button for sold-out options
6. Build club detail page showing:
   - Club info (dates, times, age range)
   - Available booking options with prices
   - **Real-time** calendar view with availability (websockets or polling)
   - Per-child age validation warning
7. Build waitlist join page for sold-out clubs
8. Set up real-time Supabase subscriptions for availability updates

**Files to create/modify:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/types/database.ts`
- `src/app/clubs/page.tsx` (Book Now page)
- `src/app/clubs/[slug]/page.tsx`
- `src/app/waitlist/[clubId]/page.tsx`
- `src/components/club-card.tsx`
- `src/components/availability-calendar.tsx`
- Update Home page hero to feature next upcoming club

**Verification:**
- Clubs display correctly from database
- Club detail pages show booking options and real-time availability
- Capacity calculation works (test by adding fake bookings to DB)
- Sold-out status displays correctly with waitlist option
- Real-time updates work when another user books (test in 2 browsers)

---

### Phase 3: Booking + Payment Flow

**Tasks:**
1. Create Supabase tables: `bookings`, `booking_days`, `promo_codes`
2. Set up Stripe account and environment variables
3. Build multi-step booking form:
   - Step 1: Select booking option (full week, single day, multi-day, etc.)
   - Step 2: If single day or multi-day → select specific date(s) from calendar
   - Step 3: Enter parent details (name, email, phone)
   - Step 4: Enter number of children + validate ages against club range (per-child)
   - Step 5: Apply promo code (optional, percentage off)
   - Step 6: Review total price + checkboxes:
     - ☐ I agree to the Terms & Conditions
     - ☐ I acknowledge the cancellation policy
4. Create Stripe Checkout session on form submit
5. Handle Stripe redirect back (success/cancel URLs)
6. Set up Stripe webhook to:
   - Update booking status to 'paid' on `checkout.session.completed`
   - Create booking_days records based on selected option/dates
   - Update promo code usage count if used
7. Block checkout if capacity filled during booking (race condition protection)

**Files to create:**
- `src/lib/stripe.ts`
- `src/app/book/[clubSlug]/page.tsx` (multi-step form)
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/components/booking-form/`
  - `option-select.tsx`
  - `date-select.tsx`
  - `parent-details.tsx`
  - `children-count.tsx`
  - `promo-code.tsx`
  - `review-step.tsx`
- `src/components/consent-checkboxes.tsx`

**Verification:**
- Complete full booking flow with Stripe test cards (4242...)
- Test each booking option type (full week, single day, multi-day)
- Test promo code application (valid, invalid, expired, max uses)
- Test age validation (child outside range rejected)
- Verify booking + booking_days records created correctly
- Verify webhook fires and updates status to 'paid'
- Test cancelled payment returns to booking page
- Test race condition: two users booking last spot simultaneously

---

### Phase 4: Post-Payment Child Information Forms

**Tasks:**
1. Create Supabase table: `children`
2. Build post-payment form at `/complete/[bookingId]`:
   - Secure access via unique booking ID (UUID)
   - Display booking summary at top (club, dates, amount paid)
   - For each child (based on num_children), ALL REQUIRED:
     - Child name
     - Date of birth
     - Allergies/dietary requirements
     - Medical notes (free text)
     - Emergency contact name + phone
     - Photo consent checkbox
     - Activity consent checkbox (water play, cooking, outdoor trips)
     - Medical consent checkbox (first aid, emergency services)
3. Validate all required fields before submission
4. Save all children to database in single transaction
5. Update booking status to 'complete'
6. Redirect to final confirmation page
7. Allow late entry (form accessible even after club ends, for records)

**Files to create:**
- `src/app/complete/[bookingId]/page.tsx`
- `src/components/child-info-form.tsx`
- `src/app/api/children/route.ts` (or use server action)

**Verification:**
- After payment, parent is redirected to child form
- Form shows correct number of child sections
- All fields validated as required
- All children saved to database correctly
- Booking status updates to 'complete'
- Cannot re-submit form (already completed) - shows completed state
- Old booking links still work (allow late entry)

---

### Phase 5: Confirmation Pages + Emails + Notifications

**Tasks:**
1. Build final confirmation page at `/confirmation/[bookingId]`:
   - Booking reference number
   - Club name and dates booked
   - Children attending (if info completed)
   - Payment amount
   - What happens next info
   - **ICS download** button
   - **Add to Google Calendar** button
   - Link to add more days (if applicable)
2. Set up Resend for transactional email (with custom domain: bookings@exploretheclubhouse.com)
3. Set up Twilio for SMS notifications
4. Create email templates (comprehensive content):
   - **Parent confirmation** (on payment): booking ref, dates, times, price, location/address, parking info, contact details, what to bring, T&Cs link, drop-off instructions, link to complete child info
   - **Parent complete** (after child form): full confirmation with child details
   - **7-day reminder**: upcoming club reminder
   - **1-day reminder**: tomorrow reminder with drop-off details
   - **Admin notification**: new booking alert
   - **Incomplete info reminder** (24h and 48h after payment if not completed)
   - **Waitlist notification**: spot available, 24h to book
5. Set up SMS notifications:
   - Morning-of SMS reminder via Twilio (critical backup)
6. Build Add Days page at `/add-days/[bookingId]`:
   - Show available days for the club
   - Allow adding days, create new Stripe checkout for additional amount

**Files to create:**
- `src/lib/email.ts` (Resend integration)
- `src/lib/sms.ts` (Twilio integration)
- `src/lib/calendar.ts` (ICS generation)
- `src/lib/email-templates/`
  - `booking-confirmation.tsx`
  - `booking-complete.tsx`
  - `reminder-7day.tsx`
  - `reminder-1day.tsx`
  - `admin-notification.tsx`
  - `incomplete-reminder.tsx`
  - `waitlist-notification.tsx`
- `src/app/confirmation/[bookingId]/page.tsx`
- `src/app/add-days/[bookingId]/page.tsx`
- `src/app/api/calendar/[bookingId]/route.ts` (ICS download)
- `src/components/calendar-buttons.tsx`

**Verification:**
- Complete full booking flow
- Check parent receives comprehensive confirmation email
- Check admin receives notification email
- Test ICS download and Google Calendar link
- Test 7-day and 1-day reminder emails (can use test dates)
- Test incomplete info reminder emails
- Test waitlist notification when spot opens
- Test SMS delivery via Twilio
- Test Add Days flow with payment

---

### Phase 6: Admin Dashboard

**Tasks:**
1. Set up admin authentication (Supabase Auth with email/password, single admin user)
2. Protect `/admin/*` routes with Next.js middleware
3. Build admin pages:
   - **Dashboard** (`/admin`):
     - Today's attendance count
     - This week's bookings summary
     - Incomplete bookings alert (paid but child info not submitted)
     - Recent contact form submissions
   - **Daily View** (`/admin/day/[date]`):
     - All children attending on specific date
     - Morning vs afternoon breakdown
     - **Allergy summary section at top** (highlighted warnings)
     - Child details with **warning icons** for allergies/medical
     - Emergency contact info
     - **Print-friendly A4 register format**
   - **Bookings List** (`/admin/bookings`):
     - All bookings with filters (club, status, date range)
     - Search by parent name/email
     - Quick status indicators
     - Basic totals (revenue per club, booking count)
   - **Booking Detail** (`/admin/bookings/[id]`):
     - Full booking info
     - All children with details
     - Status change actions (cancel, refund via Stripe - admin discretion)
   - **Club Management** (`/admin/clubs`):
     - View/create/edit clubs
     - **Auto-generate days from date range**, then allow edits
     - Manage club days and capacity (skip days, change capacity)
     - Manage booking options and prices
   - **Waitlist Management** (`/admin/waitlist`):
     - View all waitlists by club
     - Manually notify next person if needed
   - **Promo Codes** (`/admin/promo-codes`):
     - Create/edit percentage-off codes
     - Set validity dates, max uses, club restrictions
4. Add Stripe refund integration for cancellations (admin discretion)
5. Contact form submissions view with read/replied status

**Files to create:**
- `src/middleware.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/day/[date]/page.tsx`
- `src/app/admin/bookings/page.tsx`
- `src/app/admin/bookings/[id]/page.tsx`
- `src/app/admin/clubs/page.tsx`
- `src/app/admin/clubs/new/page.tsx`
- `src/app/admin/clubs/[id]/page.tsx`
- `src/app/admin/waitlist/page.tsx`
- `src/app/admin/promo-codes/page.tsx`
- `src/components/admin/daily-register.tsx` (printable)
- `src/components/admin/allergy-summary.tsx`

**Verification:**
- Admin login/logout works
- Unauthorized access redirects to login
- Daily view shows correct headcount and child details
- Allergy/medical warnings display prominently
- Print daily register produces A4-friendly output
- Booking list filters and search work correctly
- Cancel/refund flow works with Stripe
- Club creation with auto-generated days works
- Promo code CRUD works
- Waitlist management works

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=bookings@exploretheclubhouse.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Newsletter (Brevo)
BREVO_API_KEY=

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=  # For admin notifications
```

---

## Design Guidelines

- **Branding**: User will provide brand colors, logo, and fonts - integrate these into Tailwind config
- **Layout**: Clean, mobile-first responsive design
- **Trust signals**: Clear pricing, secure payment badges, professional appearance
- **Accessibility**: WCAG compliant color contrast, keyboard navigation, proper form labels
- **Imagery**: Placeholder images initially, replace with real photos when available

---

## Prerequisites (User to Provide)

Before starting implementation:

### Phase 1 Prerequisites
1. **Supabase Project**
   - Create project at supabase.com
   - Provide: Project URL, Anon Key, Service Role Key

2. **Brand Assets** (user confirmed: all ready)
   - Logo (SVG preferred, PNG acceptable)
   - Brand colors (primary, secondary, accent - hex codes)
   - Font preferences (Google Font name or custom font files)
   - Team photos for About page
   - Gallery photos from past clubs

3. **Content**
   - About page text (company story, team bios)
   - Terms & Conditions document
   - Privacy Policy document
   - Safeguarding statement
   - Contact information (address, phone, email)

4. **Google Analytics**
   - Create GA4 property
   - Provide: Measurement ID (G-XXXXXXXXXX)

5. **Social Media Links**
   - Facebook page URL
   - Instagram profile URL

### Phase 3 Prerequisites
6. **Stripe Account**
   - Create account at stripe.com (test mode initially)
   - Provide: Publishable Key, Secret Key
   - We'll set up webhook secret together

### Phase 5 Prerequisites
7. **Resend Account** (for transactional email)
   - Create account at resend.com
   - Set up custom domain (exploretheclubhouse.com) for better deliverability
   - Configure SPF, DKIM, DMARC records
   - Provide: API Key

8. **Twilio Account** (for SMS)
   - Create account at twilio.com
   - Purchase a UK phone number
   - Provide: Account SID, Auth Token, Phone Number

9. **Brevo Account** (for newsletters)
   - Create account at brevo.com
   - Provide: API Key

### Production
10. **Domain**
    - exploretheclubhouse.com
    - DNS access for Vercel deployment + email setup

---

## Next Steps

**Phase 1: Project Setup + Static Marketing Pages** will establish the foundation:
- Initialize Next.js project with TypeScript + Tailwind
- Integrate brand assets into design system
- Build Home, About, Gallery, Contact pages + legal pages
- Create shared navigation and footer with newsletter signup
- Set up Google Analytics

Once Phase 1 is complete and approved, we proceed through each subsequent phase incrementally.

**Priority:** ASAP - launch as quickly as possible.
