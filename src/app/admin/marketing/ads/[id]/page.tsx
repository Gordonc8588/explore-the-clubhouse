import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdDetailClient } from "./AdDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAd(id: string) {
  const supabase = createAdminClient();

  const { data: ad, error } = await supabase
    .from("meta_ads")
    .select(`
      *,
      club:clubs(id, name, slug),
      promo_code:promo_codes(id, code, discount_percent)
    `)
    .eq("id", id)
    .single();

  if (error || !ad) {
    return null;
  }

  // Fetch metrics if ad has been published
  let metrics = null;
  if (ad.meta_ad_id) {
    const { data: metricsData } = await supabase
      .from("meta_ad_metrics")
      .select("*")
      .eq("ad_id", id)
      .order("date", { ascending: false })
      .limit(30);

    metrics = metricsData;
  }

  return { ad, metrics };
}

export default async function AdDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getAd(id);

  if (!data) {
    notFound();
  }

  return <AdDetailClient ad={data.ad} metrics={data.metrics} />;
}
