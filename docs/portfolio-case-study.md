# Explore the Clubhouse - Portfolio Case Study

## Project Overview

**Client:** The Clubhouse (Craigies Farm, South Queensferry, Edinburgh)
**Project Type:** Full-Stack Web Application
**Timeline:** Complete build from ground up
**Status:** Live in Production
**URL:** https://exploretheclubhouse.co.uk

### Business Context

The Clubhouse is a children's holiday club operating at Craigies Farm, South Queensferry, near Edinburgh. They offer outdoor holiday programmes for children during school breaks (Easter, Summer, October half-term), featuring farm activities, nature exploration, and hands-on learning experiences.

The business required a complete digital solution to manage their booking operations, replace manual processes, and enable marketing automation to grow their customer base.

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.4 |
| **Language** | TypeScript | 5.x (strict mode) |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | Supabase (PostgreSQL) | Cloud |
| **Payments** | Stripe | 20.2.0 |
| **Email** | Resend | 6.8.0 |
| **SMS** | Twilio | 5.11.2 |
| **Images** | Cloudinary | 2.9.0 |
| **Analytics** | Google Analytics 4 + Meta Pixel | - |
| **Ads** | Meta Marketing API | SDK 24.0.1 |
| **AI** | Anthropic Claude | SDK 0.71.2 |
| **Charts** | Recharts | 3.7.0 |
| **PDF** | @react-pdf/renderer | 4.3.2 |
| **Hosting** | Vercel | Auto-deploy |

### Key Architecture Decisions

- **Server Components by Default**: Leverages React 19 and Next.js 16 server components for optimal performance
- **Edge Deployment**: Hosted on Vercel's edge network for global low-latency access
- **Type Safety**: Full TypeScript strict mode with Zod validation on all API inputs
- **Serverless Architecture**: All backend logic runs as serverless functions
- **Real-time Updates**: Supabase real-time subscriptions for live data

---

## Features Delivered

### 1. Public Marketing Website

#### Pages Implemented
- **Homepage**: Hero section with value proposition, feature highlights, testimonial carousel, gallery preview, CTAs
- **About Page**: Company story and philosophy
- **Contact Page**: Contact form with rate limiting and reCAPTCHA protection
- **Gallery**: Photo gallery with lightbox functionality
- **Club Listings**: Dynamic club cards showing active holiday programmes
- **Club Detail Pages**: Individual club information with availability calendar and booking CTAs

![Homepage Hero Section](./screenshots/homepage-hero.png)
*Homepage with hero section, value proposition, and call-to-action*

![Club Listing Page](./screenshots/club-listing.png)
*Club listing page showing available holiday programmes*

#### Design Implementation
- Custom brand design system based on Figma designs ("Craigies Palette")
- **Primary Colors**: Olive (#7A7C4A), Cream (#F5F4ED), Burnt Orange (#D4843E)
- **Typography**: Playfair Display (serif) for headings, Nunito Sans for body text
- Mobile-responsive design throughout
- Custom animations and accessibility features

---

### 2. Multi-Step Booking System

A complete e-commerce booking flow optimised for conversion:

#### Booking Flow Steps
1. **Option Selection**: Choose booking type (Full Week, Single Day, Multi-Day packages)
2. **Date Selection**: Interactive calendar showing real-time availability
3. **Children Count**: Select number of children (1-5 per booking)
4. **Parent Details**: Name, email, phone collection with validation
5. **Promo Code**: Optional discount code application
6. **Review & Pay**: Order summary and Stripe Checkout redirect

![Booking Flow - Option Selection](./screenshots/booking-option-select.png)
*Step 1: Selecting booking option with pricing*

![Booking Flow - Date Selection](./screenshots/booking-date-select.png)
*Step 2: Interactive calendar with availability indicators*

![Booking Flow - Review](./screenshots/booking-review.png)
*Final review step before Stripe checkout*

#### Technical Features
- Real-time capacity tracking per day/session
- Visual availability indicators (green/amber/red)
- Price calculation with multi-child support
- Promo code system with validation
- Analytics event tracking at each funnel step

---

### 3. Post-Payment Information Collection

Secure flow after payment to collect child data:

- Child's full name and date of birth
- Allergies and medical conditions
- Two emergency contacts
- Authorised pickup persons
- Activity consents

![Child Information Form](./screenshots/child-info-form.png)
*Post-payment child information collection form*

---

### 4. Admin Dashboard

A comprehensive back-office system for business operations:

#### Dashboard Home

![Admin Dashboard Home](./screenshots/admin-dashboard.png)
*Admin dashboard showing key metrics: today's attendance, bookings, revenue, and recent activity*

- Today's attendance count
- Week's bookings
- Monthly revenue
- Incomplete bookings alert
- Recent bookings table

#### Daily Attendance View

![Daily Attendance View](./screenshots/admin-daily-view.png)
*Daily attendance view with child roster and emergency contacts*

- Date picker navigation
- Full child roster for selected date
- Morning/afternoon session breakdown
- Emergency contact quick-access
- Print-ready format

#### Bookings Management

![Bookings Management](./screenshots/admin-bookings.png)
*Searchable bookings table with filters*

![Booking Detail](./screenshots/admin-booking-detail.png)
*Individual booking detail view with full information*

- Searchable bookings table
- Filter by status, date range
- Individual booking detail view
- UTM attribution data for marketing analysis

#### Club Management

![Club Management](./screenshots/admin-clubs.png)
*Club management interface for creating and editing holiday programmes*

- Create/edit holiday clubs
- Configure dates, capacity, age ranges
- Set session times (AM/PM)
- Image upload via Cloudinary
- Manage booking options and pricing

#### Promo Code Management

![Promo Codes](./screenshots/admin-promo-codes.png)
*Promo code management with usage tracking*

- Create discount codes
- Set percentage off and validity periods
- Maximum usage limits
- Club-specific or global codes
- Usage statistics tracking

---

### 5. Marketing Suite

#### Newsletter System

![Newsletter Editor](./screenshots/admin-newsletter-editor.png)
*AI-powered newsletter editor with conversation workflow*

![Newsletter Preview](./screenshots/admin-newsletter-preview.png)
*Newsletter preview before sending*

- **AI-Powered Content Generation**: Claude AI integration
- **Conversation Workflow**: Iterative refinement with AI
- **Image Library**: Upload and label images for reuse
- **Featured Clubs**: Auto-include club details with pricing
- **Promo Code Integration**: Styled discount boxes
- **Test Email**: Preview before publishing
- **Batch Sending**: Resend API integration

#### Subscriber Management

![Subscriber List](./screenshots/admin-subscribers.png)
*Newsletter subscriber management*

- View all subscribers with confirmation status
- Subscription source tracking
- Export capabilities

#### Meta Ads Management

![Meta Ads Dashboard](./screenshots/admin-meta-ads.png)
*Facebook/Instagram ad campaign management*

![Ad Creation](./screenshots/admin-ad-create.png)
*Ad creation with AI-generated copy and targeting options*

- **Campaign Creation**: Create campaigns with objectives
- **AI Copy Generation**: Headlines and descriptions
- **Targeting Presets**: Local parents, school holidays, retargeting
- **Budget Management**: Daily or lifetime budgets
- **Publish to Meta**: Direct API integration
- **Performance Metrics**: Sync from Meta

#### Print Ad Designer

![Print Ad Designer](./screenshots/admin-print-ads.png)
*Print ad designer with PDF export*

- Newsletter and magazine formats
- AI-generated copy
- Live preview
- PDF export for printing

---

### 6. Analytics Dashboard

#### Overview

![Analytics Overview](./screenshots/admin-analytics-overview.png)
*Analytics dashboard with KPIs, revenue chart, and traffic sources*

- KPI cards: Bookings, revenue, conversion rate, average value
- Revenue trend chart (30-day)
- Traffic sources pie chart
- Date range picker

#### Conversion Funnel

![Conversion Funnel](./screenshots/admin-analytics-funnel.png)
*9-step conversion funnel with drop-off analysis*

Visual funnel analysis tracking:
1. View Club → 2. Start Booking → 3. Select Option → 4. Select Dates → 5. Enter Children → 6. Enter Details → 7. Apply Promo → 8. Initiate Payment → 9. Purchase Complete

#### Campaign Performance

![Campaign Analytics](./screenshots/admin-analytics-campaigns.png)
*UTM campaign tracking with ROI analysis*

- UTM campaign tracking
- Revenue per campaign
- Conversion rate by source

#### Ads Analytics

![Ads Analytics](./screenshots/admin-analytics-ads.png)
*Meta ads performance dashboard*

- Impressions, reach, clicks
- CTR, CPC, CPM metrics
- Spend and conversion tracking

---

### 7. Market Research Survey

![Survey Flow](./screenshots/survey-flow.png)
*Multi-step market research survey*

![Survey Admin](./screenshots/admin-survey.png)
*Survey analytics dashboard with response charts*

- 7-step wizard with auto-save
- Question-by-question analytics
- CSV export
- GDPR compliant

---

## Third-Party Integrations

| Service | Purpose | Features |
|---------|---------|----------|
| **Supabase** | Database | PostgreSQL, Row Level Security, real-time |
| **Stripe** | Payments | Checkout, webhooks, PCI compliant |
| **Resend** | Email | Transactional, newsletters, batch sending |
| **Twilio** | SMS | Booking confirmations, reminders |
| **Cloudinary** | Images | Transformations, optimisation, CDN |
| **Google Analytics 4** | Web Analytics | Page views, ecommerce, funnels |
| **Meta Pixel** | Ad Tracking | Conversions, retargeting |
| **Meta Conversions API** | Server Tracking | Bypasses ad blockers |
| **Meta Marketing API** | Ad Management | Create/manage campaigns |
| **reCAPTCHA v3** | Bot Protection | Contact form spam prevention |
| **Brevo** | CRM Sync | Optional subscriber sync |
| **Anthropic Claude** | AI | Content generation |

---

## SEO Implementation

### Technical SEO
- Dynamic page titles and meta descriptions
- OpenGraph and Twitter Card tags
- JSON-LD structured data (Organization + LocalBusiness)
- Dynamic XML sitemap with database-driven club pages
- Robots.txt with proper disallow rules

### Performance
- Next.js Image optimisation
- Server components (reduced client JS)
- Edge deployment on Vercel
- Cloudinary automatic format optimisation

---

## Infrastructure & DevOps

### Hosting & Deployment
- **Platform**: Vercel with auto-deploy on push to main
- **SSL**: Automatic HTTPS
- **CDN**: Global edge network

### Email Deliverability
- Custom domain: bookings@exploretheclubhouse.com
- SPF, DKIM, DMARC configured
- HTML + plain text multipart emails

### Development Workflow
- Git version control
- TypeScript strict mode
- Build validation before commits
- ESLint code quality

---

## Database Schema

20 tables including:

| Table | Purpose |
|-------|---------|
| `clubs` | Holiday club definitions |
| `club_days` | Daily capacity (AM/PM) |
| `booking_options` | Pricing tiers |
| `bookings` | Parent bookings with UTM data |
| `children` | Child information |
| `promo_codes` | Discount codes |
| `newsletter_subscribers` | Email list |
| `newsletters` | Campaign content |
| `meta_ads` | Ad campaigns |
| `analytics_events` | First-party tracking |
| `survey_responses` | Survey data |

---

## Security & Compliance

- Cookie-based admin authentication (24h, httpOnly)
- Stripe handles all payment card data
- Zod schema validation on all API inputs
- Rate limiting on public endpoints
- GDPR compliant (double opt-in, consent, unsubscribe)
- Cookie consent banner

---

## Project Deliverables Summary

| Category | Count |
|----------|-------|
| Frontend Pages | 25+ |
| API Routes | 45+ |
| Database Tables | 20 |
| Email Templates | 6 |
| Third-Party Integrations | 12 |
| Admin Modules | 15+ |
| Reusable Components | 50+ |

---

## Technologies Demonstrated

- **Full-Stack Development**: Next.js, React, Node.js, TypeScript
- **Database Design**: PostgreSQL, Supabase
- **Payment Integration**: Stripe API, webhooks
- **Email Systems**: Transactional and marketing
- **SMS Integration**: Twilio
- **Cloud Services**: Vercel, Cloudinary, Supabase
- **Analytics**: GA4, Meta Pixel, custom tracking
- **Advertising APIs**: Meta Marketing API
- **AI Integration**: Claude API
- **PDF Generation**: Server-side rendering
- **SEO**: Structured data, sitemaps
- **Security**: Authentication, validation, GDPR

---

*This project demonstrates end-to-end capability in building production-ready web applications with complex business logic, third-party integrations, and comprehensive admin tooling.*
