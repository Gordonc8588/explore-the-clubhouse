/**
 * Send a newsletter to parents attending Easter Week 1 (April 6-10, 2026) only.
 * Run with:
 *   npx tsx scripts/send-newsletter-to-easter-week1.ts check   # Preview recipients
 *   npx tsx scripts/send-newsletter-to-easter-week1.ts send    # Actually send
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Change this to the newsletter subject to confirm you're targeting the right one
const NEWSLETTER_SUBJECT = "Ducklings, lambs and woolly soap at Easter Club 🐣";

// Easter Week 1 date range
const WEEK_START = "2026-04-06";
const WEEK_END = "2026-04-10";

async function main() {
  const mode = process.argv[2]; // "check" or "send"

  if (!mode || !["check", "send"].includes(mode)) {
    console.log("Usage:");
    console.log("  npx tsx scripts/send-newsletter-to-easter-week1.ts check");
    console.log("  npx tsx scripts/send-newsletter-to-easter-week1.ts send");
    process.exit(1);
  }

  // 1. Find the newsletter
  const { data: newsletter, error: newsletterError } = await supabase
    .from("newsletters")
    .select("*")
    .eq("subject", NEWSLETTER_SUBJECT)
    .single();

  if (newsletterError || !newsletter) {
    console.error("Newsletter not found. Subject must match exactly:");
    console.error(`  "${NEWSLETTER_SUBJECT}"`);
    console.error(newsletterError);
    process.exit(1);
  }

  console.log(`\nNewsletter found:`);
  console.log(`  ID:      ${newsletter.id}`);
  console.log(`  Subject: ${newsletter.subject}`);
  console.log(`  Status:  ${newsletter.status}`);

  if (newsletter.status === "sent") {
    console.error("\n⚠️  This newsletter has already been sent to the full list.");
    console.error("Proceeding will send it again to Easter Week 1 parents.");
    if (mode === "send") {
      console.error("Continuing anyway as you passed 'send'...");
    }
  }

  // 2. Find parent emails with paid bookings for Easter Week 1
  // Join: bookings -> booking_days -> club_days (filtered by date range)
  const { data: bookingDays, error: bookingDaysError } = await supabase
    .from("booking_days")
    .select(`
      bookings!inner(
        parent_email,
        status
      ),
      club_days!inner(
        date
      )
    `)
    .gte("club_days.date", WEEK_START)
    .lte("club_days.date", WEEK_END)
    .in("bookings.status", ["paid", "complete"]);

  if (bookingDaysError) {
    console.error("Error querying booking days:", bookingDaysError);
    process.exit(1);
  }

  if (!bookingDays || bookingDays.length === 0) {
    console.error(`\nNo paid bookings found for Easter Week 1 (${WEEK_START} – ${WEEK_END})`);
    process.exit(1);
  }

  // Deduplicate emails
  const emailSet = new Set<string>();
  for (const row of bookingDays) {
    const booking = (Array.isArray(row.bookings) ? row.bookings[0] : row.bookings) as { parent_email: string; status: string } | null;
    if (booking?.parent_email) {
      emailSet.add(booking.parent_email.toLowerCase().trim());
    }
  }

  const parentEmails = Array.from(emailSet).sort();

  console.log(`\nParents attending Easter Week 1 (${WEEK_START} – ${WEEK_END}):`);
  console.log(`  Total unique emails: ${parentEmails.length}`);
  parentEmails.forEach((email, i) => console.log(`  ${i + 1}. ${email}`));

  if (mode === "check") {
    console.log(`\nRun with "send" to send the newsletter to these ${parentEmails.length} parents:`);
    console.log(`  npx tsx scripts/send-newsletter-to-easter-week1.ts send`);
    return;
  }

  // 3. Send
  console.log(`\n--- SENDING newsletter to ${parentEmails.length} parents ---\n`);

  // Fetch featured club if set
  let club = null;
  if (newsletter.featured_club_id) {
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", newsletter.featured_club_id)
      .single();
    club = data;
  }

  // Fetch promo code if set
  let promoCode = null;
  if (newsletter.promo_code_id) {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("id", newsletter.promo_code_id)
      .single();
    promoCode = data;
  }

  const { sendNewsletter } = await import("../src/lib/email");
  const result = await sendNewsletter(newsletter, parentEmails, club, promoCode);

  console.log(`\nResult:`);
  console.log(`  Success:    ${result.success}`);
  console.log(`  Sent count: ${result.sentCount}`);
  if (result.errors.length > 0) {
    console.log(`  Errors:     ${result.errors.join(", ")}`);
  }

  if (result.success) {
    console.log(`\n✅ Newsletter sent to ${result.sentCount} Easter Week 1 parents.`);
    console.log(`Note: Newsletter status in DB was NOT updated to "sent" (this was a targeted send, not the main list).`);
  }
}

main().catch(console.error);
