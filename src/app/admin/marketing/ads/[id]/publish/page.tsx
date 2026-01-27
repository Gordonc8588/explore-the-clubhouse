import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { PublishAdClient } from "./PublishAdClient";

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

  return ad;
}

export default async function PublishAdPage({ params }: PageProps) {
  const { id } = await params;
  const ad = await getAd(id);

  if (!ad) {
    notFound();
  }

  // If already published, redirect to detail page
  if (ad.status !== "draft") {
    redirect(`/admin/marketing/ads/${id}`);
  }

  return <PublishAdClient ad={ad} />;
}
