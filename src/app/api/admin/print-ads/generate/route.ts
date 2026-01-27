/**
 * Print Ad AI Copy Generation
 * POST /api/admin/print-ads/generate - Generate editorial copy using Claude AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { format } from 'date-fns';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Validation schema for generate request
const generateSchema = z.object({
  clubId: z.string().uuid(),
  adType: z.enum(['newsletter_digital', 'magazine_quarter_page']),
  mainImageUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// Format date range for display
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${format(start, 'd')}–${format(end, 'd MMMM yyyy')}`;
}

// Format price for display (pence to pounds)
function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

// System prompt for print ad editorial copy generation
const SYSTEM_PROMPT = `You are an expert print advertising copywriter for "The Clubhouse", a premium children's holiday club set on a working farm in the Scottish Borders.

## About The Clubhouse
The Clubhouse offers unforgettable farm experiences for children during school holidays. Activities include:
- Animal care: feeding lambs, collecting eggs, grooming ponies
- Nature exploration: woodland walks, pond dipping, bug hunts
- Creative activities: seasonal crafts, den building, outdoor cooking
- Active play: adventure playground, games, team challenges
- Farm education: learning about sustainable farming and countryside life

## Print Editorial Writing Style
You are writing for a LOCAL MAGAZINE or NEWSLETTER - this requires THIRD PERSON editorial style, NOT direct advertising copy.

### Critical Requirements:
1. Write in THIRD PERSON - Do NOT address the reader directly
   - BAD: "Give your children an adventure they'll never forget"
   - GOOD: "Children discover the magic of farm life through hands-on experiences"

2. BODY COPY must be EXACTLY 80-100 words - this is a strict requirement
   - Count your words carefully
   - The magazine requires a minimum of 80 words
   - Do not exceed 100 words

3. Editorial tone - write as if a journalist is describing the club
   - Focus on what makes the experience special
   - Describe activities and benefits objectively
   - Include practical details (dates, ages, location) naturally within the copy

4. British English spelling throughout (colour, favourite, programme)

## Content Structure:
- HEADLINE: 5-8 words, punchy, describes the experience
- BODY COPY: 80-100 words, third person editorial describing the club
- CTA TEXT: 3-4 words, simple call to action

## Response Format
Respond with ONLY valid JSON (no markdown code blocks):
{
  "headline": "Your editorial headline here (5-8 words)",
  "bodyCopy": "Your 80-100 word editorial paragraph in third person...",
  "ctaText": "Book Now"
}`;

/**
 * POST /api/admin/print-ads/generate
 * Generate AI editorial copy for print ad
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = generateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { clubId, adType, mainImageUrl, notes } = validationResult.data;
    const supabase = createAdminClient();

    // Fetch club details
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*, booking_options(*)')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Build context for AI
    const dateRange = formatDateRange(club.start_date, club.end_date);
    const ageRange = `${club.min_age}–${club.max_age} years`;

    // Get pricing info
    const prices = club.booking_options
      ?.filter((opt: { is_active: boolean }) => opt.is_active)
      ?.map((opt: { name: string; price_per_child: number }) => `${opt.name}: ${formatPrice(opt.price_per_child)}`)
      ?.join(', ') || 'Contact for pricing';

    // Build the user prompt with club context
    let userPrompt = `Generate editorial copy for a ${adType === 'magazine_quarter_page' ? 'magazine quarter-page print ad' : 'newsletter/digital ad'}.

## Club Details:
- Club Name: ${club.name}
- Dates: ${dateRange}
- Ages: ${ageRange}
- Location: Craigies Farm, Scottish Borders
- Pricing: ${prices}
${club.description ? `- Description: ${club.description}` : ''}

## Requirements:
- Headline: 5-8 words
- Body Copy: EXACTLY 80-100 words in third person editorial style
- CTA Text: 3-4 words`;

    if (notes) {
      userPrompt += `\n\n## Additional Notes from Admin:\n${notes}`;
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build messages array - include image if provided
    const messages: Anthropic.MessageParam[] = [];

    if (mainImageUrl) {
      // Fetch image and convert to base64 for vision
      try {
        const imageResponse = await fetch(mainImageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';

        messages.push({
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: userPrompt + '\n\nAnalyze the image above and incorporate relevant visual elements into the copy.',
            },
          ],
        });
      } catch (imageError) {
        console.warn('Could not fetch image for analysis:', imageError);
        messages.push({
          role: 'user',
          content: userPrompt,
        });
      }
    } else {
      messages.push({
        role: 'user',
        content: userPrompt,
      });
    }

    // Generate copy with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract text response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let generatedCopy;
    try {
      // Clean up response (remove markdown code blocks if present)
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }

      generatedCopy = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate the generated content has required fields
    if (!generatedCopy.headline || !generatedCopy.bodyCopy || !generatedCopy.ctaText) {
      return NextResponse.json(
        { error: 'AI response missing required fields' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      headline: generatedCopy.headline,
      bodyCopy: generatedCopy.bodyCopy,
      ctaText: generatedCopy.ctaText,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/print-ads/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
