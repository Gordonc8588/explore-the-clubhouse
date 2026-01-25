import { createAdminClient } from "@/lib/supabase/server";
import { Send, Users, Mail, FileText } from "lucide-react";
import { NewslettersManager } from "./NewslettersManager";

export const dynamic = "force-dynamic";

async function getNewslettersData() {
  const supabase = createAdminClient();

  // Fetch newsletter stats
  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, status, recipient_count, sent_at")
    .order("created_at", { ascending: false });

  // Fetch active subscriber count
  const { count: activeSubscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact" })
    .is("unsubscribed_at", null);

  // Fetch clubs for the form
  const { data: clubs } = await supabase
    .from("clubs")
    .select("*")
    .order("start_date", { ascending: false });

  // Fetch promo codes for the form
  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  const sentNewsletters = newsletters?.filter((n) => n.status === "sent") || [];
  const draftNewsletters = newsletters?.filter((n) => n.status === "draft") || [];
  const totalRecipients = sentNewsletters.reduce(
    (sum, n) => sum + (n.recipient_count || 0),
    0
  );

  return {
    totalSent: sentNewsletters.length,
    totalDrafts: draftNewsletters.length,
    totalRecipients,
    activeSubscribers: activeSubscribers || 0,
    clubs: clubs || [],
    promoCodes: promoCodes || [],
  };
}

export default async function NewslettersPage() {
  const data = await getNewslettersData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Newsletters
          </h2>
          <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
            Create and send marketing newsletters to subscribers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Subscribers */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Users className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Active Subscribers
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.activeSubscribers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Newsletters Sent */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <Send className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Newsletters Sent
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.totalSent}
              </p>
            </div>
          </div>
        </div>

        {/* Total Recipients */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Mail className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Total Emails Sent
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.totalRecipients.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <FileText className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Draft Newsletters
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.totalDrafts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletters Manager (Client Component) */}
      <NewslettersManager
        initialClubs={data.clubs}
        initialPromoCodes={data.promoCodes}
      />
    </div>
  );
}
