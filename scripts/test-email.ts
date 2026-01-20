import { config } from 'dotenv';
import { Resend } from 'resend';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  const toEmail = process.argv[2];

  if (!toEmail) {
    console.error('Usage: npx tsx scripts/test-email.ts <your-email@example.com>');
    process.exit(1);
  }

  console.log('Sending test email...');
  console.log(`From: ${process.env.RESEND_FROM_EMAIL}`);
  console.log(`To: ${toEmail}`);

  const { data, error } = await resend.emails.send({
    from: `The Clubhouse <${process.env.RESEND_FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Test Email - Resend is Working!',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #2D5A3D;">Resend Test Email</h1>
        <p>If you're reading this, Resend is configured correctly for The Clubhouse!</p>
        <p style="color: #666; font-size: 14px;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send:', error);
    process.exit(1);
  }

  console.log('Email sent successfully!');
  console.log('Message ID:', data?.id);
}

sendTestEmail();
