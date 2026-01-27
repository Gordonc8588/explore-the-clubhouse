import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// Resend webhook event types
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookEvent {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Bounce-specific fields
    bounce?: {
      message: string;
    };
    // Click-specific fields
    click?: {
      link: string;
    };
  };
}

/**
 * Verify Resend webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('resend-signature');

  // Verify signature if present (Resend signs webhooks)
  if (signature) {
    try {
      const isValid = verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('[Resend Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } catch {
      console.error('[Resend Webhook] Signature verification error');
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    console.error('[Resend Webhook] Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log(`[Resend Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'email.bounced':
        await handleBounce(event);
        break;

      case 'email.complained':
        await handleComplaint(event);
        break;

      case 'email.delivered':
        console.log(
          `[Resend Webhook] Email delivered to ${event.data.to.join(', ')}`
        );
        break;

      case 'email.opened':
        console.log(
          `[Resend Webhook] Email opened by ${event.data.to.join(', ')}`
        );
        break;

      case 'email.clicked':
        await handleClick(event);
        break;

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[Resend Webhook] Error processing ${event.type}: ${errorMessage}`
    );
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle bounced emails - unsubscribe from newsletter
 */
async function handleBounce(event: ResendWebhookEvent): Promise<void> {
  const emails = event.data.to;
  const bounceMessage = event.data.bounce?.message || 'Unknown bounce reason';

  console.log(
    `[Resend Webhook] Email bounced for ${emails.join(', ')}: ${bounceMessage}`
  );

  const supabase = createAdminClient();

  // Unsubscribe bounced emails from newsletter
  for (const email of emails) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .is('unsubscribed_at', null);

    if (error) {
      console.error(
        `[Resend Webhook] Failed to unsubscribe bounced email ${email}:`,
        error
      );
    } else {
      console.log(
        `[Resend Webhook] Unsubscribed bounced email: ${email}`
      );
    }
  }
}

/**
 * Handle email clicks - store in newsletter_clicks for analytics
 */
async function handleClick(event: ResendWebhookEvent): Promise<void> {
  const emails = event.data.to;
  const clickedLink = event.data.click?.link;

  if (!clickedLink) {
    console.log('[Resend Webhook] Click event without link URL');
    return;
  }

  console.log(
    `[Resend Webhook] Link clicked by ${emails.join(', ')}: ${clickedLink}`
  );

  // Extract newsletter_id from utm_campaign parameter in the clicked URL
  let newsletterId: string | null = null;
  try {
    const url = new URL(clickedLink);
    newsletterId = url.searchParams.get('utm_campaign');
  } catch {
    console.log('[Resend Webhook] Could not parse clicked URL');
  }

  if (!newsletterId) {
    console.log('[Resend Webhook] No newsletter_id found in clicked URL');
    return;
  }

  const supabase = createAdminClient();

  // Store click for each recipient (usually just one)
  for (const email of emails) {
    const { error } = await supabase
      .from('newsletter_clicks')
      .insert({
        newsletter_id: newsletterId,
        subscriber_email: email.toLowerCase(),
        link_url: clickedLink,
      });

    if (error) {
      console.error(
        `[Resend Webhook] Failed to store click for ${email}:`,
        error
      );
    } else {
      console.log(
        `[Resend Webhook] Stored click: newsletter=${newsletterId}, email=${email}`
      );
    }
  }
}

/**
 * Handle spam complaints - unsubscribe from newsletter
 */
async function handleComplaint(event: ResendWebhookEvent): Promise<void> {
  const emails = event.data.to;

  console.log(
    `[Resend Webhook] Spam complaint received from ${emails.join(', ')}`
  );

  const supabase = createAdminClient();

  // Unsubscribe complaining emails from newsletter
  for (const email of emails) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .is('unsubscribed_at', null);

    if (error) {
      console.error(
        `[Resend Webhook] Failed to unsubscribe complained email ${email}:`,
        error
      );
    } else {
      console.log(
        `[Resend Webhook] Unsubscribed complained email: ${email}`
      );
    }
  }
}
