import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact" })
      .is("unsubscribed_at", null);

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching subscriber count:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}
