# Explore the Clubhouse

Children's holiday club booking platform - **Live Production Business**

## Overview

Explore the Clubhouse is a full-stack Next.js application for booking children's places at seasonal holiday clubs. Parents can browse upcoming clubs, book and pay online via Stripe, then provide child information after payment.

**Live Site:** [exploretheclubhouse.com](https://exploretheclubhouse.com)

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 + Craigies Design System (Figma)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout + Webhooks
- **Email**: Resend (bookings@exploretheclubhouse.com)
- **SMS**: Twilio
- **Images**: Cloudinary
- **Hosting**: Vercel (auto-deploy on push to main)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Stripe account (live and test keys)
- Resend account for emails
- Twilio account for SMS

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/explore-the-clubhouse.git
cd explore-the-clubhouse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (ALWAYS run before committing!)
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Design System

This project uses the **Craigies Design System** from Figma:

- **Colors**: Olive, Cream, Burnt Orange, Dark Olive
- **Typography**: Playfair Display (headings), Nunito Sans (body)
- **Components**: Consistent buttons, cards, forms, tables, modals

See [BRANDING.md](./BRANDING.md) for complete design guidelines.

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (marketing)/          # Public marketing pages
│   ├── (legal)/              # Legal pages (Terms, Privacy, Safeguarding)
│   ├── clubs/                # Club listings and details
│   ├── book/                 # Multi-step booking flow
│   ├── complete/             # Post-payment child info
│   ├── confirmation/         # Booking confirmation
│   ├── add-days/             # Add extra days
│   ├── admin/                # Admin dashboard (protected)
│   └── api/                  # API routes
├── components/               # Reusable React components
├── lib/                      # Utilities (Supabase, Stripe, email, SMS)
└── types/                    # TypeScript type definitions
```

## Key Features

### For Parents (Public)
- Browse upcoming holiday clubs
- Book places for multiple children
- Pay securely via Stripe Checkout
- Submit child details (allergies, emergency contacts) post-payment
- Receive email/SMS confirmations and reminders
- Add extra days to existing bookings
- Join waitlist for sold-out clubs

### For Admin (Single User)
- Manage clubs (create, edit, set capacity)
- View daily attendance registers (print-friendly)
- Manage bookings (view, cancel, refund via Stripe)
- View child details and medical information
- Manage promo codes
- Handle waitlists

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Technical reference for AI assistants
- **[BRANDING.md](./BRANDING.md)** - Complete design system guidelines
- **[PRD.md](./PRD.md)** - Product requirements document
- **[PLAN.md](./PLAN.md)** - Implementation roadmap

## Deployment

This project auto-deploys to Vercel on every push to `main`.

**⚠️ IMPORTANT:**
- This is a **live production business** - changes deploy immediately
- Always run `npm run build` before committing to catch errors
- Test changes locally in browser before pushing
- No staging environment exists

### Deployment Checklist
1. ✅ Test changes locally (`npm run dev`)
2. ✅ Run production build (`npm run build`)
3. ✅ Verify no TypeScript errors
4. ✅ Commit and push to main
5. ✅ Vercel auto-deploys (check deployment logs)

## Environment Variables

Required in production (see `.env.example`):

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

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Other
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_SITE_URL=
```

## Contributing

This is a private production project. When making changes:

1. Read [CLAUDE.md](./CLAUDE.md) for technical patterns
2. Follow the Craigies Design System in [BRANDING.md](./BRANDING.md)
3. Keep things simple - match existing code patterns
4. Test thoroughly before committing
5. Always run `npm run build` before pushing

## Database Schema

The database uses Supabase (PostgreSQL) with the following key tables:

- **clubs** - Holiday clubs with dates and capacity
- **club_days** - Individual days with morning/afternoon slots
- **booking_options** - Pricing options (Full Week, Single Day, etc.)
- **bookings** - Parent bookings with payment status
- **booking_days** - Links bookings to specific days
- **children** - Child information (collected post-payment)
- **promo_codes** - Discount codes
- **waitlist** - Queue for sold-out clubs

All prices are stored in **pence** (integers).

## Support

For issues or questions, contact the admin via the contact form at exploretheclubhouse.com/contact.

## License

Private - All Rights Reserved

---

**Built with ❤️ for children's outdoor learning**
