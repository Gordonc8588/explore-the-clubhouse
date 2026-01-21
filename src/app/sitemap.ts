import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Use direct Supabase client to avoid cookie dependencies for sitemap generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exploretheclubhouse.co.uk";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/clubs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/safeguarding`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Dynamic club pages
  let clubPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: clubs, error } = await supabase
      .from("clubs")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (!error && clubs) {
      clubPages = clubs.map((club) => ({
        url: `${baseUrl}/clubs/${club.slug}`,
        lastModified: new Date(club.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error fetching clubs for sitemap:", error);
  }

  return [...staticPages, ...clubPages];
}
