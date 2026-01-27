/**
 * Import historical contacts as confirmed newsletter subscribers
 * Run with: npx tsx scripts/import-historical-subscribers.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import * as path from "path";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Typo corrections map
const typoFixes: Record<string, string> = {
  "kwh88@hotmail.con": "kwh88@hotmail.com",
  "sscobers@gnail.com": "sscobers@gmail.com",
  "vmortimer@jotmail.co.uk": "vmortimer@hotmail.co.uk",
};

// Duplicates to remove (keep the .com version)
const duplicatesToRemove = new Set([
  "leeruncimans@hotmail.co.uk", // keep leeruncimans@hotmail.com
]);

async function importSubscribers() {
  console.log("📧 Starting historical subscriber import...\n");

  // Read the Excel file
  const filePath = path.join(process.cwd(), "Contacts_1769499648.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  // Extract emails from columns A (Contacts) and C (Email/Unnamed: 2)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const rawEmails: string[] = [];

  for (const row of data) {
    // Check column A (index 0)
    if (row[0] && typeof row[0] === "string") {
      const email = row[0].trim().toLowerCase();
      if (emailPattern.test(email)) {
        rawEmails.push(email);
      }
    }
    // Check column C (index 2)
    if (row[2] && typeof row[2] === "string") {
      const email = row[2].trim().toLowerCase();
      if (emailPattern.test(email)) {
        rawEmails.push(email);
      }
    }
  }

  console.log(`Found ${rawEmails.length} raw email entries`);

  // Clean emails: fix typos and deduplicate
  const cleanedEmails = new Set<string>();

  for (let email of rawEmails) {
    // Apply typo fixes
    if (typoFixes[email]) {
      console.log(`  Fixed typo: ${email} → ${typoFixes[email]}`);
      email = typoFixes[email];
    }

    // Skip known duplicates
    if (duplicatesToRemove.has(email)) {
      console.log(`  Skipping duplicate: ${email}`);
      continue;
    }

    cleanedEmails.add(email);
  }

  const emailList = Array.from(cleanedEmails).sort();
  console.log(`\n✅ Cleaned to ${emailList.length} unique emails\n`);

  // Check which emails already exist
  const { data: existingSubscribers, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .in("email", emailList);

  if (fetchError) {
    console.error("Error fetching existing subscribers:", fetchError);
    process.exit(1);
  }

  const existingEmails = new Set(
    existingSubscribers?.map((s) => s.email.toLowerCase()) || []
  );
  console.log(`Found ${existingEmails.size} emails already in database`);

  // Filter to only new emails
  const newEmails = emailList.filter((email) => !existingEmails.has(email));
  console.log(`${newEmails.length} new emails to import\n`);

  if (newEmails.length === 0) {
    console.log("🎉 All emails already imported!");
    return;
  }

  // Prepare records for insert
  const now = new Date().toISOString();
  const records = newEmails.map((email) => ({
    email,
    source: "historical_import",
    subscribed_at: now,
    confirmed_at: now, // Mark as confirmed since they previously engaged
    confirmation_token: null,
    unsubscribed_at: null,
  }));

  // Insert in batches of 100
  const batchSize = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert(batch);

    if (insertError) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
      failed += batch.length;
    } else {
      imported += batch.length;
      console.log(
        `  Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} subscribers`
      );
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Already existed: ${existingEmails.size}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}`);
  }
  console.log(`   📊 Total unique subscribers: ${imported + existingEmails.size}`);
}

importSubscribers().catch(console.error);
