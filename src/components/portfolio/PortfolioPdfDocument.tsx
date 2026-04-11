/**
 * Portfolio Case Study PDF Document
 * Uses @react-pdf/renderer to generate a professional portfolio PDF
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';

// Brand colors
const COLORS = {
  olive: '#7A7C4A',
  cream: '#F5F4ED',
  burntOrange: '#D4843E',
  darkOlive: '#5A5C3A',
  white: '#FFFFFF',
  lightGray: '#E5E5E5',
  darkGray: '#3D3D3D',
};

// Styles
const styles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: COLORS.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.darkGray,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
  },
  coverPage: {
    backgroundColor: COLORS.cream,
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },

  // Cover page
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    color: COLORS.darkOlive,
    marginBottom: 10,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.olive,
    marginBottom: 40,
    textAlign: 'center',
  },
  coverMeta: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 5,
    textAlign: 'center',
  },
  coverUrl: {
    fontSize: 12,
    color: COLORS.burntOrange,
    marginTop: 20,
    textDecoration: 'none',
  },

  // Headers
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: COLORS.olive,
  },
  headerPage: {
    fontSize: 9,
    color: COLORS.olive,
  },

  // Section titles
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: COLORS.darkOlive,
    marginBottom: 15,
    marginTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.burntOrange,
    paddingBottom: 8,
  },
  subsectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: COLORS.darkOlive,
    marginBottom: 8,
    marginTop: 15,
  },
  subsubsectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: COLORS.olive,
    marginBottom: 5,
    marginTop: 10,
  },

  // Content
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: 'justify',
  },
  bulletList: {
    marginLeft: 15,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 10,
    color: COLORS.burntOrange,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Tables
  table: {
    marginBottom: 15,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.olive,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: COLORS.cream,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.darkGray,
  },

  // Screenshot placeholder
  screenshotContainer: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  screenshot: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  },
  screenshotPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotPlaceholderText: {
    fontSize: 10,
    color: COLORS.olive,
    fontStyle: 'italic',
  },
  screenshotCaption: {
    fontSize: 9,
    color: COLORS.olive,
    fontStyle: 'italic',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.cream,
    textAlign: 'center',
  },

  // Highlight box
  highlightBox: {
    backgroundColor: COLORS.cream,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.burntOrange,
    padding: 12,
    marginVertical: 10,
  },
  highlightText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: COLORS.darkOlive,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  statBox: {
    width: '25%',
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: COLORS.burntOrange,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.olive,
    textAlign: 'center',
  },

  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },

  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.olive,
  },
});

// Screenshot placeholder component
interface ScreenshotProps {
  src?: string;
  caption: string;
}

function Screenshot({ src, caption }: ScreenshotProps) {
  return (
    <View style={styles.screenshotContainer}>
      {src ? (
        <Image src={src} style={styles.screenshot} />
      ) : (
        <View style={styles.screenshotPlaceholder}>
          <Text style={styles.screenshotPlaceholderText}>[Screenshot: {caption}]</Text>
        </View>
      )}
      <Text style={styles.screenshotCaption}>{caption}</Text>
    </View>
  );
}

// Bullet list component
interface BulletListProps {
  items: string[];
}

function BulletList({ items }: BulletListProps) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// Props interface
export interface PortfolioPdfProps {
  screenshots?: {
    homepage?: string;
    clubListing?: string;
    bookingOption?: string;
    bookingDate?: string;
    bookingReview?: string;
    childInfo?: string;
    adminDashboard?: string;
    adminDaily?: string;
    adminBookings?: string;
    adminBookingDetail?: string;
    adminClubs?: string;
    adminPromoCodes?: string;
    newsletterEditor?: string;
    newsletterPreview?: string;
    subscribers?: string;
    metaAds?: string;
    adCreate?: string;
    printAds?: string;
    analyticsOverview?: string;
    analyticsFunnel?: string;
    analyticsCampaigns?: string;
    analyticsAds?: string;
    survey?: string;
    surveyAdmin?: string;
  };
}

/**
 * Portfolio PDF Document Component
 */
export function PortfolioPdfDocument({ screenshots = {} }: PortfolioPdfProps) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Explore the Clubhouse</Text>
        <Text style={styles.coverSubtitle}>Portfolio Case Study</Text>

        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={styles.coverMeta}>Client: The Clubhouse</Text>
          <Text style={styles.coverMeta}>Location: Craigies Farm, South Queensferry, Edinburgh</Text>
          <Text style={styles.coverMeta}>Project Type: Full-Stack Web Application</Text>
          <Text style={styles.coverMeta}>Status: Live in Production</Text>
        </View>

        <Link src="https://exploretheclubhouse.co.uk" style={styles.coverUrl}>
          exploretheclubhouse.co.uk
        </Link>
      </Page>

      {/* Project Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Project Overview</Text>
        </View>

        <Text style={styles.sectionTitle}>Project Overview</Text>

        <Text style={styles.subsectionTitle}>Business Context</Text>
        <Text style={styles.paragraph}>
          The Clubhouse is a children's holiday club operating at Craigies Farm, South Queensferry,
          near Edinburgh. They offer outdoor holiday programmes for children during school breaks
          (Easter, Summer, October half-term), featuring farm activities, nature exploration, and
          hands-on learning experiences.
        </Text>
        <Text style={styles.paragraph}>
          The business required a complete digital solution to manage their booking operations,
          replace manual processes, and enable marketing automation to grow their customer base.
        </Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            This project demonstrates end-to-end capability in building production-ready web
            applications with complex business logic, third-party integrations, and comprehensive
            admin tooling.
          </Text>
        </View>

        <Text style={styles.subsectionTitle}>Project Deliverables</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>25+</Text>
            <Text style={styles.statLabel}>Frontend Pages</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>45+</Text>
            <Text style={styles.statLabel}>API Routes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>20</Text>
            <Text style={styles.statLabel}>Database Tables</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Integrations</Text>
          </View>
        </View>
      </Page>

      {/* Technical Architecture */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Technical Architecture</Text>
        </View>

        <Text style={styles.sectionTitle}>Technical Architecture</Text>

        <Text style={styles.subsectionTitle}>Technology Stack</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Layer</Text>
            <Text style={[styles.tableHeaderCell, { width: '45%' }]}>Technology</Text>
            <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Version</Text>
          </View>
          {[
            ['Framework', 'Next.js (App Router)', '16.1.4'],
            ['Language', 'TypeScript', '5.x (strict)'],
            ['UI Library', 'React', '19.2.3'],
            ['Styling', 'Tailwind CSS', '4.x'],
            ['Database', 'Supabase (PostgreSQL)', 'Cloud'],
            ['Payments', 'Stripe', '20.2.0'],
            ['Email', 'Resend', '6.8.0'],
            ['SMS', 'Twilio', '5.11.2'],
            ['Images', 'Cloudinary', '2.9.0'],
            ['Analytics', 'GA4 + Meta Pixel', '-'],
            ['Ads', 'Meta Marketing API', '24.0.1'],
            ['AI', 'Anthropic Claude', '0.71.2'],
            ['Hosting', 'Vercel', 'Auto-deploy'],
          ].map((row, i) => (
            <View key={i} style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{row[0]}</Text>
              <Text style={[styles.tableCell, { width: '45%' }]}>{row[1]}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{row[2]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>Key Architecture Decisions</Text>
        <BulletList items={[
          'Server Components by Default: Leverages React 19 and Next.js 16 for optimal performance',
          'Edge Deployment: Hosted on Vercel\'s edge network for global low-latency access',
          'Type Safety: Full TypeScript strict mode with Zod validation on all API inputs',
          'Serverless Architecture: All backend logic runs as serverless functions',
          'Real-time Updates: Supabase real-time subscriptions for live data',
        ]} />
      </Page>

      {/* Public Website */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Public Website</Text>
        </View>

        <Text style={styles.sectionTitle}>Public Marketing Website</Text>

        <Text style={styles.subsectionTitle}>Pages Implemented</Text>
        <BulletList items={[
          'Homepage: Hero section, feature highlights, testimonial carousel, gallery preview',
          'About Page: Company story and philosophy',
          'Contact Page: Contact form with rate limiting and reCAPTCHA protection',
          'Gallery: Photo gallery with lightbox functionality',
          'Club Listings: Dynamic club cards showing active holiday programmes',
          'Club Detail Pages: Information with availability calendar and booking CTAs',
          'Legal Pages: Privacy policy, terms & conditions, safeguarding policy',
        ]} />

        <Screenshot src={screenshots.homepage} caption="Homepage with hero section and call-to-action" />

        <Text style={styles.subsectionTitle}>Design Implementation</Text>
        <BulletList items={[
          'Custom brand design system based on Figma designs ("Craigies Palette")',
          'Primary Colors: Olive (#7A7C4A), Cream (#F5F4ED), Burnt Orange (#D4843E)',
          'Typography: Playfair Display (serif) for headings, Nunito Sans for body text',
          'Mobile-responsive design throughout',
          'Custom animations and accessibility features (focus states, ARIA labels)',
        ]} />
      </Page>

      {/* Booking System */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Booking System</Text>
        </View>

        <Text style={styles.sectionTitle}>Multi-Step Booking System</Text>

        <Text style={styles.paragraph}>
          A complete e-commerce booking flow optimised for conversion with real-time
          availability tracking and seamless payment processing.
        </Text>

        <Text style={styles.subsectionTitle}>Booking Flow Steps</Text>
        <BulletList items={[
          'Step 1 - Option Selection: Choose booking type (Full Week, Single Day, Multi-Day)',
          'Step 2 - Date Selection: Interactive calendar showing real-time availability',
          'Step 3 - Children Count: Select number of children (1-5 per booking)',
          'Step 4 - Parent Details: Name, email, phone collection with validation',
          'Step 5 - Promo Code: Optional discount code application',
          'Step 6 - Review & Pay: Order summary and Stripe Checkout redirect',
        ]} />

        <Screenshot src={screenshots.bookingOption} caption="Booking flow - Option selection with pricing" />

        <Text style={styles.subsectionTitle}>Technical Features</Text>
        <BulletList items={[
          'Real-time capacity tracking per day/session (AM/PM)',
          'Visual availability indicators (green = available, amber = low, red = full)',
          'Price calculation with multi-child support',
          'Promo code system with validation, usage limits, and club-specific codes',
          'Analytics event tracking at each funnel step',
          'Stripe Checkout integration for PCI compliance',
        ]} />
      </Page>

      {/* Admin Dashboard */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Admin Dashboard</Text>
        </View>

        <Text style={styles.sectionTitle}>Admin Dashboard</Text>

        <Text style={styles.paragraph}>
          A comprehensive back-office system for business operations, including daily
          attendance tracking, booking management, club configuration, and promo codes.
        </Text>

        <Screenshot src={screenshots.adminDashboard} caption="Admin dashboard with key metrics and recent activity" />

        <Text style={styles.subsectionTitle}>Dashboard Features</Text>
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Dashboard Home</Text>
            <BulletList items={[
              'Today\'s attendance count',
              'Week\'s bookings',
              'Monthly revenue',
              'Incomplete bookings alert',
              'Recent bookings table',
            ]} />
          </View>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Daily Attendance</Text>
            <BulletList items={[
              'Date picker navigation',
              'Full child roster',
              'AM/PM session breakdown',
              'Emergency contacts',
              'Print-ready format',
            ]} />
          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Bookings Management</Text>
            <BulletList items={[
              'Searchable bookings table',
              'Filter by status/date',
              'Individual booking details',
              'UTM attribution data',
            ]} />
          </View>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Club Management</Text>
            <BulletList items={[
              'Create/edit holiday clubs',
              'Configure capacity/age ranges',
              'Image upload via Cloudinary',
              'Manage pricing tiers',
            ]} />
          </View>
        </View>
      </Page>

      {/* Marketing Suite */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Marketing Suite</Text>
        </View>

        <Text style={styles.sectionTitle}>Marketing Suite</Text>

        <Text style={styles.subsectionTitle}>Newsletter System</Text>
        <BulletList items={[
          'Double Opt-in: Email confirmation required for GDPR compliance',
          'AI-Powered Content Generation: Claude AI integration for writing newsletters',
          'Conversation Workflow: Iterative refinement with AI assistant',
          'Image Library: Upload and label images for reuse',
          'Featured Clubs: Auto-include club details with pricing',
          'Test Email: Preview before publishing',
          'Batch Sending: Resend API batch processing (100 per batch)',
          'Click Tracking: Track newsletter link clicks for attribution',
        ]} />

        <Screenshot src={screenshots.newsletterEditor} caption="AI-powered newsletter editor with conversation workflow" />

        <Text style={styles.subsectionTitle}>Meta Ads Management</Text>
        <BulletList items={[
          'Campaign Creation: Create campaigns with objectives (Awareness, Traffic, Sales)',
          'AI Copy Generation: Headlines and descriptions powered by Claude',
          'Targeting Presets: Local parents, school holidays, retargeting, lookalike audiences',
          'Budget Management: Daily or lifetime budgets with scheduling',
          'Publish to Meta: Direct API integration',
          'Performance Metrics: Sync impressions, clicks, spend, conversions from Meta',
        ]} />
      </Page>

      {/* Analytics */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Analytics Dashboard</Text>
        </View>

        <Text style={styles.sectionTitle}>Analytics Dashboard</Text>

        <Screenshot src={screenshots.analyticsOverview} caption="Analytics overview with KPIs, revenue chart, and traffic sources" />

        <Text style={styles.subsectionTitle}>Overview Dashboard</Text>
        <BulletList items={[
          'KPI cards: Total bookings, revenue, conversion rate, average booking value',
          'Revenue trend chart (30-day line graph)',
          'Traffic sources pie chart',
          'Date range picker for custom analysis',
        ]} />

        <Text style={styles.subsectionTitle}>Conversion Funnel</Text>
        <Text style={styles.paragraph}>
          Visual funnel analysis tracking 9 steps from View Club through to Purchase Complete,
          with step-by-step conversion rates and drop-off analysis.
        </Text>

        <Screenshot src={screenshots.analyticsFunnel} caption="9-step conversion funnel with drop-off analysis" />

        <Text style={styles.subsectionTitle}>Campaign & Ads Analytics</Text>
        <BulletList items={[
          'UTM campaign tracking with revenue and conversion attribution',
          'Meta ads performance: Impressions, reach, clicks, CTR, CPC, CPM',
          'Spend tracking and ROI calculations',
          'Daily metrics with date filtering',
        ]} />
      </Page>

      {/* Integrations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Integrations</Text>
        </View>

        <Text style={styles.sectionTitle}>Third-Party Integrations</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Service</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Purpose</Text>
            <Text style={[styles.tableHeaderCell, { width: '55%' }]}>Features</Text>
          </View>
          {[
            ['Supabase', 'Database', 'PostgreSQL, Row Level Security, real-time'],
            ['Stripe', 'Payments', 'Checkout, webhooks, PCI compliant'],
            ['Resend', 'Email', 'Transactional, newsletters, batch sending'],
            ['Twilio', 'SMS', 'Booking confirmations, reminders'],
            ['Cloudinary', 'Images', 'Transformations, optimisation, CDN'],
            ['GA4', 'Analytics', 'Page views, ecommerce, funnels'],
            ['Meta Pixel', 'Ad Tracking', 'Conversions, retargeting'],
            ['Meta CAPI', 'Server Track', 'Bypasses ad blockers'],
            ['Meta Ads API', 'Ad Mgmt', 'Create/manage campaigns'],
            ['reCAPTCHA', 'Security', 'Contact form spam prevention'],
            ['Claude AI', 'AI', 'Content generation'],
          ].map((row, i) => (
            <View key={i} style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={[styles.tableCell, { width: '20%', fontFamily: 'Helvetica-Bold' }]}>{row[0]}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{row[1]}</Text>
              <Text style={[styles.tableCell, { width: '55%' }]}>{row[2]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>SEO Implementation</Text>
        <BulletList items={[
          'Dynamic page titles and meta descriptions',
          'OpenGraph and Twitter Card tags for social sharing',
          'JSON-LD structured data (Organization + LocalBusiness)',
          'Dynamic XML sitemap with database-driven club pages',
          'Robots.txt with proper disallow rules',
          'Next.js Image optimisation and lazy loading',
        ]} />

        <Text style={styles.subsectionTitle}>Security & Compliance</Text>
        <BulletList items={[
          'Cookie-based admin authentication (24h, httpOnly)',
          'Stripe handles all payment card data (PCI compliant)',
          'Zod schema validation on all API inputs',
          'Rate limiting on public endpoints',
          'GDPR compliant: Double opt-in, consent checkboxes, unsubscribe',
          'Cookie consent banner',
        ]} />
      </Page>

      {/* Technologies Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>Explore the Clubhouse - Case Study</Text>
          <Text style={styles.headerPage}>Summary</Text>
        </View>

        <Text style={styles.sectionTitle}>Technologies Demonstrated</Text>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Development</Text>
            <BulletList items={[
              'Full-Stack: Next.js, React, Node.js',
              'Language: TypeScript (strict mode)',
              'Database: PostgreSQL, Supabase',
              'Styling: Tailwind CSS 4',
            ]} />

            <Text style={styles.subsubsectionTitle}>Payments & Commerce</Text>
            <BulletList items={[
              'Stripe API & webhooks',
              'Checkout sessions',
              'Promo code system',
            ]} />

            <Text style={styles.subsubsectionTitle}>Communications</Text>
            <BulletList items={[
              'Email: Resend (transactional + marketing)',
              'SMS: Twilio',
              'Newsletter system with double opt-in',
            ]} />
          </View>
          <View style={styles.column}>
            <Text style={styles.subsubsectionTitle}>Analytics & Marketing</Text>
            <BulletList items={[
              'Google Analytics 4',
              'Meta Pixel & Conversions API',
              'Meta Marketing API for ads',
              'Custom first-party analytics',
            ]} />

            <Text style={styles.subsubsectionTitle}>AI & Automation</Text>
            <BulletList items={[
              'Claude API for content generation',
              'AI-powered newsletter writing',
              'Ad copy generation',
            ]} />

            <Text style={styles.subsubsectionTitle}>Infrastructure</Text>
            <BulletList items={[
              'Vercel hosting (auto-deploy)',
              'Cloudinary for images',
              'DNS & email deliverability',
              'CI/CD workflow',
            ]} />
          </View>
        </View>

        <View style={[styles.highlightBox, { marginTop: 30 }]}>
          <Text style={[styles.highlightText, { textAlign: 'center' }]}>
            This project demonstrates end-to-end capability in building production-ready
            web applications with complex business logic, third-party integrations, and
            comprehensive admin tooling for a live business.
          </Text>
        </View>

        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.olive, marginBottom: 5 }}>
            Live at:
          </Text>
          <Link src="https://exploretheclubhouse.co.uk" style={[styles.coverUrl, { fontSize: 14 }]}>
            exploretheclubhouse.co.uk
          </Link>
        </View>
      </Page>
    </Document>
  );
}

export default PortfolioPdfDocument;
