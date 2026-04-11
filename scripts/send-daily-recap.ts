/**
 * Send a daily recap newsletter to all parents booked for the week containing
 * the given date — including single-day bookings on other days of that week.
 *
 * Usage:
 *   npx tsx scripts/send-daily-recap.ts check [date]   # Preview recipients
 *   npx tsx scripts/send-daily-recap.ts send  [date]   # Actually send
 *
 * date defaults to today (YYYY-MM-DD). Week = Monday–Friday of that date's week.
 *
 * You will be prompted for the newsletter subject before anything runs.
 *
 * Examples:
 *   npx tsx scripts/send-daily-recap.ts check
 *   npx tsx scripts/send-daily-recap.ts check 2026-04-08
 *   npx tsx scripts/send-daily-recap.ts send  2026-04-08
 */
import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWeekBounds(dateStr: string): { weekStart: string; weekEnd: string } {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay(); // 0 = Sun, 1 = Mon … 6 = Sat
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: friday.toISOString().slice(0, 10),
  };
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const mode = process.argv[2];
  const dateArg = process.argv[3];

  if (!mode || !["check", "send"].includes(mode)) {
    console.log("Usage:");
    console.log("  npx tsx scripts/send-daily-recap.ts check [date]");
    console.log("  npx tsx scripts/send-daily-recap.ts send  [date]");
    console.log("");
    console.log("date defaults to today (YYYY-MM-DD)");
    process.exit(1);
  }

  // Resolve date
  const today = new Date().toISOString().slice(0, 10);
  const recapDate = dateArg || today;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recapDate)) {
    console.error(`Invalid date format: "${recapDate}". Use YYYY-MM-DD.`);
    process.exit(1);
  }

  const { weekStart, weekEnd } = getWeekBounds(recapDate);

  console.log(`\nRecap date : ${recapDate}`);
  console.log(`Week range : ${weekStart} – ${weekEnd}`);

  // Ask for newsletter subject
  const subject = await prompt("\nNewsletter subject (must match exactly): ");

  if (!subject) {
    console.error("No subject provided.");
    process.exit(1);
  }

  // 1. Find the newsletter
  const { data: newsletter, error: newsletterError } = await supabase
    .from("newsletters")
    .select("*")
    .eq("subject", subject)
    .single();

  if (newsletterError || !newsletter) {
    console.error("\nNewsletter not found. Subject must match exactly:");
    console.error(`  "${subject}"`);
    if (newsletterError) console.error(newsletterError.message);
    process.exit(1);
  }

  console.log(`\nNewsletter found:`);
  console.log(`  ID:      ${newsletter.id}`);
  console.log(`  Subject: ${newsletter.subject}`);
  console.log(`  Status:  ${newsletter.status}`);

  if (newsletter.status === "sent") {
    console.warn("\n⚠️  This newsletter has already been marked as sent.");
    console.warn("Continuing will send it again to this week's parents.");
  }

  // 2. Find all parents with a paid booking for any day in this week
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
    .gte("club_days.date", weekStart)
    .lte("club_days.date", weekEnd)
    .in("bookings.status", ["paid", "complete"]);

  if (bookingDaysError) {
    console.error("Error querying booking days:", bookingDaysError.message);
    process.exit(1);
  }

  if (!bookingDays || bookingDays.length === 0) {
    console.error(`\nNo paid bookings found for week ${weekStart} – ${weekEnd}`);
    process.exit(1);
  }

  // Deduplicate emails
  const emailSet = new Set<string>();
  for (const row of bookingDays) {
    const booking = (Array.isArray(row.bookings) ? row.bookings[0] : row.bookings) as {
      parent_email: string;
      status: string;
    } | null;
    if (booking?.parent_email) {
      emailSet.add(booking.parent_email.toLowerCase().trim());
    }
  }

  const parentEmails = Array.from(emailSet).sort();

  console.log(`\nParents with a booking this week (${weekStart} – ${weekEnd}):`);
  console.log(`  Total unique emails: ${parentEmails.length}`);
  parentEmails.forEach((email, i) => console.log(`  ${i + 1}. ${email}`));

  if (mode === "check") {
    console.log(`\nRun with "send" to send the recap to these ${parentEmails.length} parents:`);
    console.log(
      `  npx tsx scripts/send-daily-recap.ts send${dateArg ? ` ${recapDate}` : ""}`
    );
    return;
  }

  // 3. Send
  console.log(`\n--- SENDING recap newsletter to ${parentEmails.length} parents ---\n`);

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
    // Mark newsletter as sent
    await supabase
      .from("newsletters")
      .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: result.sentCount })
      .eq("id", newsletter.id);

    console.log(`\n✅ Recap sent to ${result.sentCount} parents and newsletter marked as sent.`);
  }
}

main().catch(console.error);
