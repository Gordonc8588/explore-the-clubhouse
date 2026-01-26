import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

// Rate limiting: Simple in-memory store (resets on server restart)
// For production, consider using Redis or Vercel KV
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // events per window
const RATE_WINDOW = 60 * 1000; // 1 minute window

function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(sessionId);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(sessionId, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// Event validation schema
const eventSchema = z.object({
  event_name: z.string().min(1).max(100),
  event_data: z.record(z.string(), z.unknown()).optional().default({}),
  session_id: z.string().max(100).optional(),
  page_url: z.string().max(500).optional(),
  utm_source: z.string().max(100).nullable().optional(),
  utm_medium: z.string().max(100).nullable().optional(),
  utm_campaign: z.string().max(100).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = eventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Rate limit by session ID (or IP if no session)
    const sessionId = data.session_id || request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(sessionId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Store event in database
    const supabase = createAdminClient();

    const { error } = await supabase.from('analytics_events').insert({
      event_name: data.event_name,
      event_data: data.event_data,
      session_id: data.session_id,
      page_url: data.page_url,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
    });

    if (error) {
      console.error('[Analytics Event] Database error:', error);
      // Don't expose database errors to client
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics Event] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
