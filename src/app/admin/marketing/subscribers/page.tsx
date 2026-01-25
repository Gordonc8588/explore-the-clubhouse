import { createAdminClient } from "@/lib/supabase/server";
import { Users, UserPlus, TrendingUp, Tag } from "lucide-react";
import { SubscribersTable } from "./SubscribersTable";

export const dynamic = "force-dynamic";

async function getSubscribersData() {
  const supabase = createAdminClient();

  // Fetch all subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, subscribed_at, source")
    .order("subscribed_at", { ascending: false });

  if (!subscribers) {
    return {
      subscribers: [],
      sources: [],
      totalSubscribers: 0,
      weekGrowth: 0,
      monthGrowth: 0,
      sourceBreakdown: [],
    };
  }

  // Get unique sources
  const sources = ["All Sources", ...Array.from(new Set(subscribers.map((s) => s.source)))];

  // Calculate date ranges
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Calculate stats
  const totalSubscribers = subscribers.length;
  const weekGrowth = subscribers.filter(
    (s) => new Date(s.subscribed_at) >= weekAgo
  ).length;
  const monthGrowth = subscribers.filter(
    (s) => new Date(s.subscribed_at) >= monthAgo
  ).length;

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  subscribers.forEach((s) => {
    sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1;
  });
  const sourceBreakdown = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));

  // Transform for client
  const transformedSubscribers = subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    subscribedAt: s.subscribed_at,
    source: s.source,
  }));

  return {
    subscribers: transformedSubscribers,
    sources,
    totalSubscribers,
    weekGrowth,
    monthGrowth,
    sourceBreakdown,
  };
}

export default async function SubscribersPage() {
  const data = await getSubscribersData();

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
            Newsletter Subscribers
          </h2>
          <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
            Manage email subscribers and track growth
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
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
                Total Subscribers
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.totalSubscribers}
              </p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <UserPlus className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                This Week
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                +{data.weekGrowth}
              </p>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                This Month
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                +{data.monthGrowth}
              </p>
            </div>
          </div>
        </div>

        {/* Top Source */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <Tag className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Top Source
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.sourceBreakdown[0]?.source || "—"}
              </p>
              <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                {data.sourceBreakdown[0]?.count || 0} subscribers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table (Client Component) */}
      <SubscribersTable subscribers={data.subscribers} sources={data.sources} />
    </div>
  );
}
