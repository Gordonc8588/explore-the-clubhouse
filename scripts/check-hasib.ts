import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("children")
    .select("name, photo_consent")
    .ilike("name", "%hasib%");

  if (error) { console.error(error); return; }
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
