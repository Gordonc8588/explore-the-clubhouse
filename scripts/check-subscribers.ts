import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Get total count
  const { count: total } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  // Get confirmed count
  const { count: confirmed } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null);

  // Get by source
  const { data: sources } = await supabase
    .from("newsletter_subscribers")
    .select("source")
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null);

  const sourceCounts: Record<string, number> = {};
  sources?.forEach((s) => {
    sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1;
  });

  console.log("📊 Newsletter Subscribers Summary");
  console.log("================================");
  console.log("Total subscribers:", total);
  console.log("Confirmed & active (can receive newsletters):", confirmed);
  console.log("");
  console.log("By source:");
  Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log("  " + source + ":", count);
    });
}

check();
