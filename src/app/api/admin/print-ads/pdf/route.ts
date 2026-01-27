/**
 * Print Ad PDF Generation
 * POST /api/admin/print-ads/pdf - Generate and download PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { renderToBuffer } from '@react-pdf/renderer';
import { PrintAdPdfDocument } from '@/components/print-ads/PrintAdPdfDocument';
import type { PrintAd } from '@/types/database';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Validation schema for PDF generation
const pdfSchema = z.object({
  printAdId: z.string().uuid().optional(),
  printAdData: z.object({
    adType: z.enum(['newsletter_digital', 'magazine_quarter_page']),
    headline: z.string(),
    bodyCopy: z.string(),
    ctaText: z.string(),
    mainImageUrl: z.string().url(),
    flyerImageUrl: z.string().url().optional(),
    clubData: z.object({
      name: z.string(),
      dates: z.string(),
      age_range: z.string(),
      location: z.string(),
      prices: z.array(z.object({
        option: z.string(),
        price: z.number(),
      })),
    }),
  }).optional(),
}).refine(data => data.printAdId || data.printAdData, {
  message: 'Either printAdId or printAdData must be provided',
});

/**
 * POST /api/admin/print-ads/pdf
 * Generate PDF for a print ad
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = pdfSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { printAdId, printAdData } = validationResult.data;

    let adData: {
      name: string;
      adType: 'newsletter_digital' | 'magazine_quarter_page';
      headline: string;
      bodyCopy: string;
      ctaText: string;
      mainImageUrl: string;
      flyerImageUrl?: string;
      clubData: {
        name: string;
        dates: string;
        age_range: string;
        location: string;
        prices: { option: string; price: number }[];
      };
    };

    if (printAdId) {
      // Fetch print ad from database
      const supabase = createAdminClient();
      const { data: printAd, error } = await supabase
        .from('print_ads')
        .select('*')
        .eq('id', printAdId)
        .single();

      if (error || !printAd) {
        return NextResponse.json(
          { error: 'Print ad not found' },
          { status: 404 }
        );
      }

      // Validate required fields
      if (!printAd.headline || !printAd.body_copy || !printAd.main_image_url || !printAd.club_data) {
        return NextResponse.json(
          { error: 'Print ad is incomplete. Please fill in all required fields.' },
          { status: 400 }
        );
      }

      adData = {
        name: printAd.name,
        adType: printAd.ad_type as 'newsletter_digital' | 'magazine_quarter_page',
        headline: printAd.headline,
        bodyCopy: printAd.body_copy,
        ctaText: printAd.cta_text || 'Book Now',
        mainImageUrl: printAd.main_image_url,
        flyerImageUrl: printAd.flyer_image_url || undefined,
        clubData: printAd.club_data as {
          name: string;
          dates: string;
          age_range: string;
          location: string;
          prices: { option: string; price: number }[];
        },
      };
    } else if (printAdData) {
      adData = {
        name: 'Print Ad',
        adType: printAdData.adType,
        headline: printAdData.headline,
        bodyCopy: printAdData.bodyCopy,
        ctaText: printAdData.ctaText,
        mainImageUrl: printAdData.mainImageUrl,
        flyerImageUrl: printAdData.flyerImageUrl,
        clubData: printAdData.clubData,
      };
    } else {
      return NextResponse.json(
        { error: 'No print ad data provided' },
        { status: 400 }
      );
    }

    // Fetch image and convert to base64 for embedding in PDF
    let mainImageBase64: string | undefined;
    try {
      const imageResponse = await fetch(adData.mainImageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
      mainImageBase64 = `data:${mediaType};base64,${Buffer.from(imageBuffer).toString('base64')}`;
    } catch (imageError) {
      console.warn('Could not fetch main image:', imageError);
      // Continue without embedded image - will use URL directly
    }

    let flyerImageBase64: string | undefined;
    if (adData.flyerImageUrl) {
      try {
        const imageResponse = await fetch(adData.flyerImageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
        flyerImageBase64 = `data:${mediaType};base64,${Buffer.from(imageBuffer).toString('base64')}`;
      } catch (imageError) {
        console.warn('Could not fetch flyer image:', imageError);
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      PrintAdPdfDocument({
        adType: adData.adType,
        headline: adData.headline,
        bodyCopy: adData.bodyCopy,
        ctaText: adData.ctaText,
        mainImageUrl: mainImageBase64 || adData.mainImageUrl,
        flyerImageUrl: flyerImageBase64 || adData.flyerImageUrl,
        clubData: adData.clubData,
      })
    );

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = adData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `clubhouse-${sanitizedName}-${timestamp}.pdf`;

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
    console.error('Error in POST /api/admin/print-ads/pdf:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
