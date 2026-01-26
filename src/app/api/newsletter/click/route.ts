import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Newsletter click tracking endpoint
 * Redirects user to target URL while logging the click
 *
 * Usage in newsletter: /api/newsletter/click?nid={newsletter_id}&email={subscriber_email}&url={target_url}
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get('nid');
  const email = searchParams.get('email');
  const targetUrl = searchParams.get('url');

  // Validate required params
  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Decode the target URL
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(targetUrl);
    // Validate it's a proper URL
    new URL(decodedUrl);
  } catch {
    // If URL is invalid, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Log the click asynchronously (don't wait for it)
  if (newsletterId && email) {
    const supabase = createAdminClient();

    // Fire and forget - don't block the redirect
    supabase
      .from('newsletter_clicks')
      .insert({
        newsletter_id: newsletterId,
        subscriber_email: decodeURIComponent(email),
        link_url: decodedUrl,
      })
      .then(({ error }) => {
        if (error) {
          console.error('[Newsletter Click] Failed to log click:', error);
        }
      });
  }

  // Redirect to the target URL
  return NextResponse.redirect(decodedUrl);
}
