/**
 * Portfolio PDF Generation
 * POST /api/admin/portfolio/pdf - Generate portfolio case study PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { renderToBuffer } from '@react-pdf/renderer';
import { PortfolioPdfDocument } from '@/components/portfolio/PortfolioPdfDocument';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Validation schema for screenshot URLs
const screenshotsSchema = z.object({
  homepage: z.string().url().optional(),
  clubListing: z.string().url().optional(),
  bookingOption: z.string().url().optional(),
  bookingDate: z.string().url().optional(),
  bookingReview: z.string().url().optional(),
  childInfo: z.string().url().optional(),
  adminDashboard: z.string().url().optional(),
  adminDaily: z.string().url().optional(),
  adminBookings: z.string().url().optional(),
  adminBookingDetail: z.string().url().optional(),
  adminClubs: z.string().url().optional(),
  adminPromoCodes: z.string().url().optional(),
  newsletterEditor: z.string().url().optional(),
  newsletterPreview: z.string().url().optional(),
  subscribers: z.string().url().optional(),
  metaAds: z.string().url().optional(),
  adCreate: z.string().url().optional(),
  printAds: z.string().url().optional(),
  analyticsOverview: z.string().url().optional(),
  analyticsFunnel: z.string().url().optional(),
  analyticsCampaigns: z.string().url().optional(),
  analyticsAds: z.string().url().optional(),
  survey: z.string().url().optional(),
  surveyAdmin: z.string().url().optional(),
}).optional();

/**
 * Convert URL to base64 data URI for embedding in PDF
 */
async function urlToBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const buffer = await response.arrayBuffer();
    const mediaType = response.headers.get('content-type') || 'image/png';
    return `data:${mediaType};base64,${Buffer.from(buffer).toString('base64')}`;
  } catch {
    console.warn(`Could not fetch image: ${url}`);
    return undefined;
  }
}

/**
 * POST /api/admin/portfolio/pdf
 * Generate portfolio case study PDF
 *
 * Body (optional):
 * {
 *   screenshots: {
 *     homepage: "https://...",
 *     adminDashboard: "https://...",
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body (may be empty)
    let body: { screenshots?: Record<string, string> } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    // Validate screenshots if provided
    const validationResult = screenshotsSchema.safeParse(body.screenshots);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const screenshotUrls = validationResult.data || {};

    // Convert screenshot URLs to base64 for embedding
    const screenshots: Record<string, string | undefined> = {};
    for (const [key, url] of Object.entries(screenshotUrls)) {
      if (url) {
        screenshots[key] = await urlToBase64(url);
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      PortfolioPdfDocument({ screenshots })
    );

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `explore-the-clubhouse-portfolio-${timestamp}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as downloadable file
    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/admin/portfolio/pdf:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
