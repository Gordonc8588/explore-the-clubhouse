import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  createCampaign,
  createAdSet,
  createAdCreative,
  createAd,
  uploadImage,
  isMetaAdsConfigured,
  type CreateCampaignParams,
  type CreateAdSetParams,
  type TargetingConfig,
} from "@/lib/meta-ads";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

// Add UTM parameters to a URL for attribution tracking
function addUtmParams(
  baseUrl: string,
  params: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content?: string;
  }
): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", params.utm_source);
    url.searchParams.set("utm_medium", params.utm_medium);
    url.searchParams.set("utm_campaign", params.utm_campaign);
    if (params.utm_content) {
      url.searchParams.set("utm_content", params.utm_content);
    }
    return url.toString();
  } catch {
    // If URL parsing fails, append params manually
    const separator = baseUrl.includes("?") ? "&" : "?";
    const utmString = `utm_source=${params.utm_source}&utm_medium=${params.utm_medium}&utm_campaign=${params.utm_campaign}${params.utm_content ? `&utm_content=${params.utm_content}` : ""}`;
    return `${baseUrl}${separator}${utmString}`;
  }
}

const targetingSchema = z.object({
  preset: z.string(),
  ageMin: z.number().min(18).max(65),
  ageMax: z.number().min(18).max(65),
  genders: z.array(z.number()),
  radius: z.number().min(1).max(200),
  latitude: z.number(),
  longitude: z.number(),
});

const budgetSchema = z.object({
  budgetType: z.enum(["daily", "lifetime"]),
  amount: z.number().min(100), // minimum 100 pence (£1)
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const publishSchema = z.object({
  adId: z.string().uuid(),
  targeting: targetingSchema,
  budget: budgetSchema,
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMetaAdsConfigured()) {
    return NextResponse.json(
      { error: "Meta Ads API is not configured. Please check environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { adId, targeting, budget } = parsed.data;

    const supabase = createAdminClient();

    // Fetch the ad from database
    const { data: ad, error: adError } = await supabase
      .from("meta_ads")
      .select("*")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    // Validate ad has required fields
    if (!ad.primary_text || !ad.headline) {
      return NextResponse.json(
        { error: "Ad is missing required content (primary text or headline)" },
        { status: 400 }
      );
    }

    if (!ad.image_urls || ad.image_urls.length === 0) {
      return NextResponse.json(
        { error: "Ad has no images" },
        { status: 400 }
      );
    }

    // Update ad status to publishing
    await supabase
      .from("meta_ads")
      .update({ status: "publishing" })
      .eq("id", adId);

    try {
      // Step 1: Upload first image to Meta
      console.log("Uploading image to Meta...");
      const imageResult = await uploadImage(ad.image_urls[0]);
      console.log("Image uploaded, hash:", imageResult.hash);

      // Step 2: Create Campaign
      console.log("Creating campaign...");
      const campaignParams: CreateCampaignParams = {
        name: `${ad.name} - Campaign`,
        objective: (ad.objective as CreateCampaignParams["objective"]) || "OUTCOME_TRAFFIC",
        status: "PAUSED", // Start paused, user can activate after review
        specialAdCategories: [], // Add if needed for specific categories
      };
      const campaignId = await createCampaign(campaignParams);
      console.log("Campaign created:", campaignId);

      // Step 3: Create Ad Set
      console.log("Creating ad set...");
      const targetingConfig: TargetingConfig = {
        geoLocations: {
          customLocations: [
            {
              latitude: targeting.latitude,
              longitude: targeting.longitude,
              radius: targeting.radius,
            },
          ],
        },
        ageMin: targeting.ageMin,
        ageMax: targeting.ageMax,
        genders: targeting.genders.length > 0 ? targeting.genders : undefined,
      };

      // Build start/end time strings
      const startTime = budget.startTime
        ? `${budget.startDate}T${budget.startTime}:00`
        : `${budget.startDate}T00:00:00`;
      const endTime = budget.endTime
        ? `${budget.endDate}T${budget.endTime}:00`
        : `${budget.endDate}T23:59:59`;

      const adSetParams: CreateAdSetParams = {
        name: `${ad.name} - Ad Set`,
        campaignId: campaignId,
        targeting: targetingConfig,
        billingEvent: "IMPRESSIONS",
        optimizationGoal: "LINK_CLICKS",
        status: "PAUSED",
        startTime,
        endTime,
      };

      // Set budget based on type
      if (budget.budgetType === "daily") {
        adSetParams.dailyBudget = budget.amount;
      } else {
        adSetParams.lifetimeBudget = budget.amount;
      }

      const adSetId = await createAdSet(adSetParams);
      console.log("Ad Set created:", adSetId);

      // Step 4: Create Ad Creative with UTM tracking
      console.log("Creating ad creative...");

      // Add UTM parameters to the destination URL for attribution tracking
      const baseUrl = ad.cta_url || "https://exploretheclubhouse.com/clubs";
      const urlWithUtm = addUtmParams(baseUrl, {
        utm_source: "facebook",
        utm_medium: "paid",
        utm_campaign: adId,
        utm_content: ad.name.toLowerCase().replace(/\s+/g, "_"),
      });

      const creativeId = await createAdCreative({
        name: `${ad.name} - Creative`,
        imageHash: imageResult.hash,
        primaryText: ad.primary_text,
        headline: ad.headline,
        description: ad.description || undefined,
        linkUrl: urlWithUtm,
        callToAction: ad.cta_type || "LEARN_MORE",
      });
      console.log("Creative created:", creativeId);

      // Step 5: Create Ad
      console.log("Creating ad...");
      const metaAdId = await createAd({
        name: ad.name,
        adSetId: adSetId,
        creativeId: creativeId,
        status: "PAUSED",
      });
      console.log("Ad created:", metaAdId);

      // Step 6: Update database with Meta IDs
      const updateData = {
        status: "pending_review",
        meta_campaign_id: campaignId,
        meta_adset_id: adSetId,
        meta_creative_id: creativeId,
        meta_ad_id: metaAdId,
        meta_image_hash: imageResult.hash,
        budget_type: budget.budgetType,
        budget_amount: budget.amount,
        schedule_start: budget.startDate,
        schedule_end: budget.endDate,
        targeting_preset: targeting.preset,
        custom_targeting: targeting,
        published_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("meta_ads")
        .update(updateData)
        .eq("id", adId);

      if (updateError) {
        console.error("Failed to update ad record:", updateError);
        // Don't fail the whole operation - the ad was created in Meta
      }

      return NextResponse.json({
        success: true,
        message: "Ad published successfully and pending Meta review",
        data: {
          campaignId,
          adSetId,
          creativeId,
          adId: metaAdId,
        },
      });
    } catch (metaError) {
      // Revert status on failure
      await supabase
        .from("meta_ads")
        .update({ status: "draft" })
        .eq("id", adId);

      console.error("Meta API Error:", metaError);

      // Parse Meta API error message
      let errorMessage = "Failed to publish ad to Meta";
      if (metaError instanceof Error) {
        const message = metaError.message;

        // Common Meta API errors
        if (message.includes("(#3)") || message.includes("does not have the capability")) {
          errorMessage = "Your Facebook App doesn't have ads_management permission. Please go to developers.facebook.com, select your app, and request the 'ads_management' permission under App Review.";
        } else if (message.includes("OAuthException")) {
          errorMessage = "Authentication failed. Please check your Meta API token.";
        } else if (message.includes("budget")) {
          errorMessage = "Budget is too low. Please increase your budget.";
        } else if (message.includes("targeting")) {
          errorMessage = "Invalid targeting options. Please adjust your audience settings.";
        } else if (message.includes("image")) {
          errorMessage = "Failed to upload image. Please try a different image.";
        } else if (message.includes("permissions")) {
          errorMessage = "Insufficient permissions. Please check your Meta Business account setup.";
        } else {
          errorMessage = message;
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error publishing ad:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to publish ad";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
