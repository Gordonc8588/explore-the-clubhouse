import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

// Simple admin auth check
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has('admin-session');
}

export async function POST() {
  // Require admin auth
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = (process.env.RESEND_FROM_EMAIL || 'hello@exploretheclubhouse.co.uk').trim().replace(/\\n$/, '');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@exploretheclubhouse.co.uk').trim().replace(/\\n$/, '');

  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  console.log(`[TestEmail] Sending test email to: "${adminEmail}" from: "${fromEmail}"`);

  try {
    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: adminEmail,
      subject: 'Test Email - Admin Notification Check',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify admin notifications are working.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>From: ${fromEmail}</p>
        <p>To: ${adminEmail}</p>
      `,
    });

    if (error) {
      console.error('[TestEmail] Resend error:', JSON.stringify(error));
      return NextResponse.json({
        success: false,
        error: error.message,
        errorDetails: error,
        config: { fromEmail, adminEmail }
      }, { status: 500 });
    }

    console.log(`[TestEmail] Success, messageId: ${data?.id}`);
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      config: { fromEmail, adminEmail }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TestEmail] Exception:', errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      config: { fromEmail, adminEmail }
    }, { status: 500 });
  }
}
