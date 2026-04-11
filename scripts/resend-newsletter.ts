import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CSV_PATH = "/Users/gordoncalder/Downloads/emails-sent-1774028192311.csv";
const NEWSLETTER_SUBJECT = "18 days to go – book a spot for your little farmer!";
const NEWSLETTER_ID = "93444d6f-b345-40c3-ade4-a1e0f8e6f833";

async function main() {
  const mode = process.argv[2]; // "check" or "send"

  // Parse CSV
  const csv = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = csv.split("\n").filter(l => l.trim());

  // Find failed newsletter emails
  const failedEmails: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const subject = cols[2];
    const to = cols[4];
    const lastEvent = cols[8];
    if (subject === NEWSLETTER_SUBJECT && lastEvent === "failed") {
      failedEmails.push(to.toLowerCase().trim());
    }
  }

  console.log(`Found ${failedEmails.length} failed newsletter deliveries:\n`);
  failedEmails.forEach((email, i) => console.log(`  ${i + 1}. ${email}`));

  if (mode === "send") {
    console.log(`\n--- SENDING newsletter to ${failedEmails.length} failed recipients ---\n`);

    // Fetch the newsletter
    const { data: newsletter } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", NEWSLETTER_ID)
      .single();

    if (!newsletter) {
      console.error("Newsletter not found!");
      return;
    }

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

    // Dynamic import of sendNewsletter
    const { sendNewsletter } = await import("../src/lib/email");

    const result = await sendNewsletter(newsletter, failedEmails, club, promoCode);

    console.log(`\nResult:`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Sent count: ${result.sentCount}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(", ")}`);
    }
  } else {
    console.log(`\nRun with "send" argument to resend to these ${failedEmails.length} recipients:`);
    console.log(`  npx tsx scripts/resend-newsletter.ts send`);
  }
}

main();
