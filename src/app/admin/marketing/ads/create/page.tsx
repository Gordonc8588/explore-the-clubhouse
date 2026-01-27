import { createAdminClient } from "@/lib/supabase/server";
import { AdForm } from "./AdForm";

async function getFormData() {
  const supabase = createAdminClient();

  // Fetch active clubs
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, slug, start_date, end_date")
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  // Fetch active promo codes
  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("id, code, discount_percent")
    .eq("is_active", true)
    .order("code", { ascending: true });

  return {
    clubs: clubs || [],
    promoCodes: promoCodes || [],
  };
}

export default async function CreateAdPage() {
  const data = await getFormData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Create New Ad
        </h2>
        <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
          Create a Facebook &amp; Instagram ad with AI-generated copy
        </p>
      </div>

      {/* Ad Form */}
      <AdForm clubs={data.clubs} promoCodes={data.promoCodes} />
    </div>
  );
}
