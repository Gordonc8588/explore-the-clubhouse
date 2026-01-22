import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClubEditForm } from "./ClubEditForm";

interface ClubEditPageProps {
  params: Promise<{ id: string }>;
}

async function getClubData(clubId: string) {
  if (clubId === "new") {
    return null;
  }

  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("clubs")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      start_date,
      end_date,
      morning_start,
      morning_end,
      afternoon_start,
      afternoon_end,
      min_age,
      max_age,
      is_active,
      club_days(
        id,
        date,
        morning_capacity,
        afternoon_capacity,
        is_available
      ),
      booking_options(
        id,
        name,
        description,
        option_type,
        time_slot,
        price_per_child,
        sort_order,
        is_active
      )
    `)
    .eq("id", clubId)
    .single();

  if (error || !club) {
    return null;
  }

  return club;
}

export default async function ClubEditPage({ params }: ClubEditPageProps) {
  const { id } = await params;
  const isNewClub = id === "new";

  let clubData = null;
  if (!isNewClub) {
    clubData = await getClubData(id);
    if (!clubData) {
      notFound();
    }
  }

  return <ClubEditForm clubId={id} initialData={clubData} isNew={isNewClub} />;
}
