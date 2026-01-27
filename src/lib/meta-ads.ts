/**
 * Meta Marketing API Client
 * Handles Facebook/Instagram ad creation and management
 */

import bizSdk from 'facebook-nodejs-business-sdk';

const { FacebookAdsApi, AdAccount, Campaign, AdSet, Ad, AdCreative, AdImage } = bizSdk;

// Environment configuration
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_SYSTEM_USER_TOKEN = process.env.META_SYSTEM_USER_TOKEN;
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;
const META_PAGE_ID = process.env.META_PAGE_ID;
const META_INSTAGRAM_ACTOR_ID = process.env.META_INSTAGRAM_ACTOR_ID;

// Validate required environment variables
function validateConfig() {
  const missing: string[] = [];
  if (!META_SYSTEM_USER_TOKEN) missing.push('META_SYSTEM_USER_TOKEN');
  if (!META_AD_ACCOUNT_ID) missing.push('META_AD_ACCOUNT_ID');
  if (!META_PAGE_ID) missing.push('META_PAGE_ID');

  if (missing.length > 0) {
    throw new Error(`Missing required Meta Ads config: ${missing.join(', ')}`);
  }
}

// Initialize the API with the system user token
let apiInitialized = false;

function initializeApi() {
  if (apiInitialized) return;

  validateConfig();
  FacebookAdsApi.init(META_SYSTEM_USER_TOKEN!);
  apiInitialized = true;
}

// Get the Ad Account instance
function getAdAccount() {
  initializeApi();
  return new AdAccount(`act_${META_AD_ACCOUNT_ID}`);
}

// =============================================================================
// TYPES
// =============================================================================

export interface CreateCampaignParams {
  name: string;
  objective: 'OUTCOME_AWARENESS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_SALES';
  status?: 'ACTIVE' | 'PAUSED';
  specialAdCategories?: string[];
}

export interface CreateAdSetParams {
  name: string;
  campaignId: string;
  dailyBudget?: number;  // In pence
  lifetimeBudget?: number;  // In pence
  startTime?: string;
  endTime?: string;
  targeting: TargetingConfig;
  billingEvent?: 'IMPRESSIONS' | 'LINK_CLICKS';
  optimizationGoal?: 'LINK_CLICKS' | 'LANDING_PAGE_VIEWS' | 'CONVERSIONS';
  status?: 'ACTIVE' | 'PAUSED';
}

export interface TargetingConfig {
  geoLocations?: {
    countries?: string[];
    cities?: Array<{ key: string; radius?: number; distanceUnit?: string }>;
    customLocations?: Array<{ latitude: number; longitude: number; radius: number }>;
  };
  ageMin?: number;
  ageMax?: number;
  genders?: number[];  // 1 = male, 2 = female
  interests?: Array<{ id: string; name: string }>;
  behaviors?: Array<{ id: string; name: string }>;
  customAudiences?: Array<{ id: string }>;
  excludedCustomAudiences?: Array<{ id: string }>;
}

export interface CreateAdParams {
  name: string;
  adSetId: string;
  creativeId: string;
  status?: 'ACTIVE' | 'PAUSED';
}

export interface CreateCreativeParams {
  name: string;
  imageHash?: string;
  imageUrl?: string;
  primaryText: string;
  headline: string;
  description?: string;
  linkUrl: string;
  callToAction: string;
}

export interface UploadImageResult {
  hash: string;
  url: string;
}

export interface AdInsightsParams {
  adId: string;
  datePreset?: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'lifetime';
  timeRange?: { since: string; until: string };
  fields?: string[];
}

export interface AdInsights {
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;  // In the account's currency (convert to pence)
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
}

// =============================================================================
// TARGETING PRESETS
// =============================================================================

export const TARGETING_PRESETS: Record<string, TargetingConfig> = {
  local_parents: {
    geoLocations: {
      customLocations: [
        { latitude: 51.2548, longitude: -0.7507, radius: 32 }  // 20 miles from Farnham area
      ]
    },
    ageMin: 25,
    ageMax: 45,
    // Note: Interest targeting IDs need to be looked up via the Targeting Search API
    // These are placeholder examples
  },
  school_holiday: {
    geoLocations: {
      customLocations: [
        { latitude: 51.2548, longitude: -0.7507, radius: 32 }
      ]
    },
    ageMin: 25,
    ageMax: 50,
  },
  retargeting: {
    // Requires custom audience setup
    geoLocations: {
      countries: ['GB']
    }
  },
  lookalike: {
    // Requires lookalike audience creation from source audience
    geoLocations: {
      countries: ['GB']
    }
  }
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Create a new campaign
 */
export async function createCampaign(params: CreateCampaignParams): Promise<string> {
  const adAccount = getAdAccount();

  const campaign = await adAccount.createCampaign([], {
    name: params.name,
    objective: params.objective,
    status: params.status || 'PAUSED',
    special_ad_categories: params.specialAdCategories || [],
  });

  return campaign.id;
}

/**
 * Create a new ad set within a campaign
 */
export async function createAdSet(params: CreateAdSetParams): Promise<string> {
  const adAccount = getAdAccount();

  // Convert pence to pounds/currency units (Meta expects whole currency units in some cases)
  const budget = params.dailyBudget
    ? { daily_budget: params.dailyBudget }
    : { lifetime_budget: params.lifetimeBudget };

  const targeting: Record<string, unknown> = {
    geo_locations: params.targeting.geoLocations ? {
      countries: params.targeting.geoLocations.countries,
      cities: params.targeting.geoLocations.cities,
      custom_locations: params.targeting.geoLocations.customLocations?.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        radius: loc.radius,
        distance_unit: 'kilometer'
      }))
    } : undefined,
    age_min: params.targeting.ageMin,
    age_max: params.targeting.ageMax,
    genders: params.targeting.genders,
    interests: params.targeting.interests,
    behaviors: params.targeting.behaviors,
    custom_audiences: params.targeting.customAudiences,
    excluded_custom_audiences: params.targeting.excludedCustomAudiences,
  };

  // Remove undefined values
  Object.keys(targeting).forEach(key => {
    if (targeting[key] === undefined) delete targeting[key];
  });

  const adSetParams: Record<string, unknown> = {
    name: params.name,
    campaign_id: params.campaignId,
    ...budget,
    billing_event: params.billingEvent || 'IMPRESSIONS',
    optimization_goal: params.optimizationGoal || 'LINK_CLICKS',
    targeting,
    status: params.status || 'PAUSED',
  };

  if (params.startTime) {
    adSetParams.start_time = params.startTime;
  }
  if (params.endTime) {
    adSetParams.end_time = params.endTime;
  }

  const adSet = await adAccount.createAdSet([], adSetParams);

  return adSet.id;
}

/**
 * Upload an image to Meta's ad library
 */
export async function uploadImage(imageUrl: string): Promise<UploadImageResult> {
  const adAccount = getAdAccount();

  const image = await adAccount.createAdImage([], {
    url: imageUrl,
  });

  // The response includes the image hash
  const imageData = image._data?.images;
  const firstImage = imageData ? Object.values(imageData)[0] as { hash: string; url: string } : null;

  if (!firstImage) {
    throw new Error('Failed to upload image to Meta');
  }

  return {
    hash: firstImage.hash,
    url: firstImage.url,
  };
}

/**
 * Create an ad creative with image and copy
 */
export async function createAdCreative(params: CreateCreativeParams): Promise<string> {
  const adAccount = getAdAccount();

  const objectStorySpec: Record<string, unknown> = {
    page_id: META_PAGE_ID,
    link_data: {
      image_hash: params.imageHash,
      link: params.linkUrl,
      message: params.primaryText,
      name: params.headline,
      description: params.description,
      call_to_action: {
        type: params.callToAction,
        value: {
          link: params.linkUrl,
        },
      },
    },
  };

  // Add Instagram actor if configured
  if (META_INSTAGRAM_ACTOR_ID) {
    objectStorySpec.instagram_actor_id = META_INSTAGRAM_ACTOR_ID;
  }

  const creative = await adAccount.createAdCreative([], {
    name: params.name,
    object_story_spec: objectStorySpec,
  });

  return creative.id;
}

/**
 * Create an ad using an existing creative
 */
export async function createAd(params: CreateAdParams): Promise<string> {
  const adAccount = getAdAccount();

  const ad = await adAccount.createAd([], {
    name: params.name,
    adset_id: params.adSetId,
    creative: { creative_id: params.creativeId },
    status: params.status || 'PAUSED',
  });

  return ad.id;
}

/**
 * Get ad insights/metrics
 */
export async function getAdInsights(params: AdInsightsParams): Promise<AdInsights | null> {
  initializeApi();

  const ad = new Ad(params.adId);

  const fields = params.fields || [
    'impressions',
    'reach',
    'clicks',
    'spend',
    'ctr',
    'cpc',
    'cpm',
    'actions',
  ];

  const insightsParams: Record<string, unknown> = {};

  if (params.datePreset) {
    insightsParams.date_preset = params.datePreset;
  } else if (params.timeRange) {
    insightsParams.time_range = params.timeRange;
  }

  try {
    const insights = await ad.getInsights(fields, insightsParams);

    if (!insights || insights.length === 0) {
      return null;
    }

    const data = insights[0]._data as {
      impressions?: string;
      reach?: string;
      clicks?: string;
      spend?: string;
      ctr?: string;
      cpc?: string;
      cpm?: string;
      actions?: Array<{ action_type: string; value: string }>;
    };

    // Extract conversions from actions array
    const conversions = data.actions?.find(
      (a) => a.action_type === 'purchase'
    )?.value || '0';

    return {
      impressions: parseInt(data.impressions || '0'),
      reach: parseInt(data.reach || '0'),
      clicks: parseInt(data.clicks || '0'),
      spend: Math.round(parseFloat(data.spend || '0') * 100),  // Convert to pence
      ctr: parseFloat(data.ctr || '0'),
      cpc: Math.round(parseFloat(data.cpc || '0') * 100),  // Convert to pence
      cpm: Math.round(parseFloat(data.cpm || '0') * 100),  // Convert to pence
      conversions: parseInt(conversions),
    };
  } catch (error) {
    console.error('Error fetching ad insights:', error);
    return null;
  }
}

/**
 * Update ad status (pause/resume)
 */
export async function updateAdStatus(adId: string, status: 'ACTIVE' | 'PAUSED'): Promise<void> {
  initializeApi();

  const ad = new Ad(adId);
  await ad.update([], { status });
}

/**
 * Update ad set status
 */
export async function updateAdSetStatus(adSetId: string, status: 'ACTIVE' | 'PAUSED'): Promise<void> {
  initializeApi();

  const adSet = new AdSet(adSetId);
  await adSet.update([], { status });
}

/**
 * Get ad review status
 */
export async function getAdReviewStatus(adId: string): Promise<{
  status: string;
  reviewFeedback?: string;
}> {
  initializeApi();

  const ad = new Ad(adId);
  const result = await ad.get(['effective_status', 'review_feedback']);
  const data = result._data as {
    effective_status: string;
    review_feedback?: { global?: string };
  };

  return {
    status: data.effective_status,
    reviewFeedback: data.review_feedback?.global,
  };
}

/**
 * Check if Meta Ads API is configured
 */
export function isMetaAdsConfigured(): boolean {
  return !!(
    META_SYSTEM_USER_TOKEN &&
    META_AD_ACCOUNT_ID &&
    META_PAGE_ID
  );
}

/**
 * Get configuration info (for debugging)
 */
export function getConfigInfo(): {
  configured: boolean;
  adAccountId: string | undefined;
  pageId: string | undefined;
  instagramActorId: string | undefined;
} {
  return {
    configured: isMetaAdsConfigured(),
    adAccountId: META_AD_ACCOUNT_ID,
    pageId: META_PAGE_ID,
    instagramActorId: META_INSTAGRAM_ACTOR_ID,
  };
}
