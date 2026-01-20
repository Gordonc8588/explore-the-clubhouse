# Product Requirements Document: Explore the Clubhouse

## Product Overview

**Product Name:** Explore the Clubhouse
**Domain:** exploretheclubhouse.com
**Hosting:** Vercel
**Timeline:** ASAP - launch as quickly as possible

### Description
A children's holiday club booking platform for parents. Parents can browse seasonal holiday clubs (Easter, Summer, etc.), book places for their children, pay online, then provide child details after payment.

### Business Model
- Seasonal holiday clubs that run during school holidays
- Operating hours: 8:30am - 3:30pm (replacing school hours)
- Parents book places, pay immediately via Stripe, then provide child details post-payment
- Guest checkout only (no parent accounts required)

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (admin only)
- **Payments:** Stripe Checkout
- **Transactional Email:** Resend
- **Newsletter:** Brevo
- **SMS:** Twilio
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Date Utilities:** date-fns
- **Calendar:** ics (for ICS file generation)
- **Analytics:** Google Analytics 4

### Dependencies to Install
```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js zod react-hook-form lucide-react resend twilio ics date-fns
```

---

## User Roles

### Parents (Public Users)
- Browse available holiday clubs
- Book places for children
- Pay via Stripe Checkout
- Submit child information post-payment
- Receive email/SMS confirmations and reminders
- Add extra days to existing bookings
- Join waitlist for sold-out clubs

### Admin (Single User)
- Manage clubs (create, edit, set capacity)
- View daily attendance registers
- Manage bookings (view, cancel, refund)
- View child details and medical information
- Manage promo codes
- Manage waitlists

---

## Features & Requirements

### F1: Marketing Pages

#### F1.1: Home Page
- Hero section featuring next upcoming club with dates and prominent CTA
- Value proposition for parents
- Trust signals (professional appearance, secure payment indicators)

#### F1.2: About Page
- Company story
- Team bios with photos

#### F1.3: Gallery Page
- Photo gallery from past holiday clubs

#### F1.4: Contact Page
- Contact form (name, email, phone optional, message)
- Form submissions saved to database AND emailed to admin
- Display contact information (address, phone, email)

#### F1.5: Legal Pages
- Terms & Conditions
- Privacy Policy (GDPR-compliant)
- Safeguarding Statement

#### F1.6: Navigation
- Header with: Home, Book Now (prominent CTA), About, Contact
- Mobile-responsive hamburger menu

#### F1.7: Footer
- Navigation links
- Contact information
- Social media links (Facebook, Instagram)
- Newsletter signup form (integrates with Brevo)
- Legal page links (Terms, Privacy, Safeguarding)

---

### F2: Club Listings & Details

#### F2.1: Club Listing Page (Book Now)
- Display all active clubs
- Show club name, dates, age range, image
- "Sold Out" badge for full clubs
- "Join Waitlist" button for sold-out clubs

#### F2.2: Club Detail Page
- Club information: name, description, dates, times, age range
- Booking options with prices
- Real-time availability calendar (websockets or polling)
- Capacity indicators per day/slot
- CTA to start booking

#### F2.3: Availability Display
- Visual calendar showing available days
- Morning/afternoon capacity numbers
- Real-time updates when other users book

---

### F3: Booking Flow

#### F3.1: Multi-Step Booking Form
**Step 1: Select Booking Option**
- Full Week (Full Day) - £150
- Full Week (Mornings) - £80
- Full Week (Afternoons) - £80
- Single Day - £35
- Multiple Days - £35/day

**Step 2: Date Selection (if applicable)**
- Calendar showing available dates
- Select specific dates for single/multi-day options

**Step 3: Parent Details**
- Name (required)
- Email (required)
- Phone (required)

**Step 4: Number of Children**
- Select number of children
- Per-child age validation against club age range (reject individual children outside range)

**Step 5: Promo Code (optional)**
- Input field for discount code
- Percentage-off discounts only

**Step 6: Review & Consent**
- Show booking summary and total price
- Required checkboxes:
  - [ ] I agree to the Terms & Conditions
  - [ ] I acknowledge the cancellation policy
- Proceed to payment button

#### F3.2: Payment Processing
- Redirect to Stripe Checkout
- Handle successful payment → redirect to child info form
- Handle cancelled payment → return to booking page
- Race condition protection: block checkout if capacity filled during booking

#### F3.3: Stripe Webhook Handling
- On `checkout.session.completed`:
  - Update booking status to 'paid'
  - Create booking_days records
  - Update promo code usage count (if used)
  - Send confirmation email to parent
  - Send notification email to admin

---

### F4: Post-Payment Child Information

#### F4.1: Child Information Form
- Accessible at `/complete/[bookingId]`
- Display booking summary at top
- For each child (all fields required):
  - Child name
  - Date of birth
  - Allergies/dietary requirements
  - Medical notes (free text for EpiPen/inhaler needs)
  - Emergency contact name
  - Emergency contact phone
  - Photo consent checkbox
  - Activity consent checkbox (water play, cooking, outdoor trips)
  - Medical consent checkbox (first aid, emergency services)

#### F4.2: Form Behavior
- Validate all required fields
- Save all children in single transaction
- Update booking status to 'complete'
- Redirect to confirmation page
- Allow late entry (form accessible even after club ends)
- Show completed state if already submitted (prevent re-submission)

#### F4.3: Incomplete Form Handling
- Send reminder emails at 24h and 48h after payment
- Flag in admin dashboard for manual follow-up

---

### F5: Confirmation & Notifications

#### F5.1: Confirmation Page
- Booking reference number
- Club name and dates booked
- Children attending (if info completed)
- Payment amount
- "What happens next" information
- ICS file download button
- "Add to Google Calendar" button
- Link to add more days (if applicable)

#### F5.2: Email Notifications (via Resend)
**Sender:** bookings@exploretheclubhouse.com

| Email | Trigger | Content |
|-------|---------|---------|
| Parent Confirmation | Payment success | Booking ref, dates, times, price, location, parking, contact, what to bring, T&Cs link, drop-off instructions, link to complete child info |
| Parent Complete | Child form submitted | Full confirmation with child details |
| 7-Day Reminder | 7 days before first day | Upcoming club reminder |
| 1-Day Reminder | 1 day before first day | Tomorrow reminder with drop-off details |
| Incomplete Reminder | 24h & 48h post-payment | Reminder to complete child info |
| Admin Notification | New booking | Booking details alert |
| Waitlist Notification | Spot available | 24h to book link |

#### F5.3: SMS Notifications (via Twilio)
- Morning-of reminder on first booked day (critical backup)

---

### F6: Waitlist Feature

#### F6.1: Join Waitlist
- Form on sold-out club pages
- Collect: parent name, email, phone, number of children, preferred option
- Assign queue position

#### F6.2: Waitlist Processing
- When spot opens: auto-notify first person on waitlist
- Give 24 hours to book before moving to next person
- Email notification with direct booking link

---

### F7: Add Days Feature

#### F7.1: Add Days Page
- Accessible from confirmation page or email link
- Show available additional days for the club
- Select days to add
- Create new Stripe checkout for additional amount

---

### F8: Admin Dashboard

#### F8.1: Admin Authentication
- Single admin user (email/password via Supabase Auth)
- Protected routes via Next.js middleware

#### F8.2: Dashboard Home
- Today's attendance count
- This week's bookings summary
- Incomplete bookings alert (paid but child info not submitted)
- Recent contact form submissions

#### F8.3: Daily View
- All children attending on specific date
- Morning vs afternoon breakdown
- **Allergy summary section at top** (highlighted warnings)
- Child details with warning icons for allergies/medical
- Emergency contact information
- **Print-friendly A4 register format**

#### F8.4: Bookings List
- All bookings with filters (club, status, date range)
- Search by parent name/email
- Quick status indicators
- Basic totals (revenue per club, booking count)

#### F8.5: Booking Detail
- Full booking information
- All children with details
- Status change actions (cancel, refund via Stripe)

#### F8.6: Club Management
- Create/edit clubs
- **Auto-generate days from date range**, then allow edits
- Skip specific days
- Adjust capacity per day
- Manage booking options and prices

#### F8.7: Waitlist Management
- View all waitlists by club
- Queue positions and status
- Manually notify next person if needed

#### F8.8: Promo Codes
- Create percentage-off codes
- Set validity dates
- Set max uses
- Restrict to specific clubs (optional)

---

## Database Schema

### clubs
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

### club_days
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| date | date | |
| morning_capacity | integer | Max children for morning slot |
| afternoon_capacity | integer | Max children for afternoon slot |
| is_available | boolean | Can disable specific days |
| created_at | timestamptz | |

### booking_options
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

### bookings
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
| promo_code_id | uuid | FK → promo_codes (nullable) |
| stripe_payment_intent_id | text | |
| stripe_checkout_session_id | text | |
| created_at | timestamptz | |

### booking_days
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| booking_id | uuid | FK → bookings |
| club_day_id | uuid | FK → club_days |
| time_slot | text | full_day / morning / afternoon |
| created_at | timestamptz | |

### children
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

### waitlist
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| club_id | uuid | FK → clubs |
| parent_name | text | |
| parent_email | text | |
| parent_phone | text | |
| num_children | integer | |
| booking_option_id | uuid | FK → booking_options |
| status | text | waiting / notified / expired / booked |
| notified_at | timestamptz | |
| expires_at | timestamptz | 24h after notification |
| position | integer | Queue position |
| created_at | timestamptz | |

### promo_codes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| code | text | Unique, uppercase |
| discount_percent | integer | e.g., 10 for 10% |
| valid_from | timestamptz | |
| valid_until | timestamptz | |
| max_uses | integer | Null = unlimited |
| times_used | integer | Default 0 |
| club_id | uuid | FK → clubs (null = all clubs) |
| is_active | boolean | Default true |
| created_at | timestamptz | |

### contact_submissions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| email | text | |
| phone | text | Optional |
| message | text | |
| status | text | new / read / replied |
| created_at | timestamptz | |

### newsletter_subscribers
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | Unique |
| subscribed_at | timestamptz | |
| source | text | footer / booking / etc. |

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Home
│   │   ├── about/page.tsx
│   │   ├── gallery/page.tsx
│   │   └── contact/page.tsx
│   ├── (legal)/
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── safeguarding/page.tsx
│   ├── clubs/
│   │   ├── page.tsx              # Book Now listing
│   │   └── [slug]/page.tsx       # Club detail
│   ├── book/
│   │   └── [clubSlug]/page.tsx   # Multi-step booking
│   ├── complete/
│   │   └── [bookingId]/page.tsx  # Child info form
│   ├── confirmation/
│   │   └── [bookingId]/page.tsx  # Confirmation page
│   ├── add-days/
│   │   └── [bookingId]/page.tsx  # Add days
│   ├── waitlist/
│   │   └── [clubId]/page.tsx     # Join waitlist
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── login/page.tsx
│   │   ├── day/[date]/page.tsx   # Daily register
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clubs/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── waitlist/page.tsx
│   │   └── promo-codes/page.tsx
│   ├── api/
│   │   ├── stripe/
│   │   │   └── webhook/route.ts
│   │   ├── contact/route.ts
│   │   ├── newsletter/route.ts
│   │   └── calendar/[bookingId]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── navigation.tsx
│   ├── footer.tsx
│   ├── club-card.tsx
│   ├── availability-calendar.tsx
│   ├── booking-form/
│   ├── child-info-form.tsx
│   ├── consent-checkboxes.tsx
│   ├── calendar-buttons.tsx
│   └── admin/
│       ├── daily-register.tsx
│       └── allergy-summary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── stripe.ts
│   ├── email.ts
│   ├── sms.ts
│   ├── calendar.ts
│   └── utils.ts
└── types/
    └── database.ts
```

---

## Environment Variables

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
ADMIN_EMAIL=
```

---

## Design Guidelines

- **Visual Style:** Warm & friendly (soft colors, welcoming imagery)
- **Mobile-First:** Most parents will book on phones
- **Trust Signals:** Clear pricing, secure payment badges
- **Accessibility:** WCAG compliant color contrast, keyboard navigation, proper form labels
- **Print Styles:** Daily register must be print-friendly A4 format

---

## Implementation Phases

### Phase 1: Project Setup + Marketing Pages
1. Initialize Next.js with TypeScript + Tailwind
2. Create layout with navigation and footer
3. Build Home, About, Gallery, Contact pages
4. Build legal pages (Terms, Privacy, Safeguarding)
5. Set up contact form + newsletter signup
6. Configure Google Analytics

### Phase 2: Club Data + Listings
1. Create Supabase tables (clubs, club_days, booking_options)
2. Set up Supabase clients
3. Build club listing page (Book Now)
4. Build club detail page with availability
5. Implement real-time availability updates
6. Build waitlist join page

### Phase 3: Booking + Payment
1. Create Supabase tables (bookings, booking_days, promo_codes)
2. Set up Stripe
3. Build multi-step booking form
4. Implement Stripe Checkout
5. Set up Stripe webhooks
6. Implement promo codes

### Phase 4: Child Information
1. Create Supabase table (children)
2. Build child information form
3. Implement form validation
4. Handle incomplete form reminders

### Phase 5: Confirmation + Notifications
1. Build confirmation page
2. Set up Resend for emails
3. Set up Twilio for SMS
4. Implement all email templates
5. Build Add Days page
6. Implement calendar download

### Phase 6: Admin Dashboard
1. Set up admin authentication
2. Build dashboard home
3. Build daily view with printable register
4. Build bookings list and detail pages
5. Build club management pages
6. Build waitlist and promo code management

---

## Success Criteria

- Parents can complete full booking flow on mobile in under 5 minutes
- Admin can view daily attendance with one click
- All emails deliver successfully with custom domain
- Real-time availability prevents overbooking
- Print-friendly daily registers with allergy highlights
