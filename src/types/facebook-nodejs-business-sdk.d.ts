/**
 * Type declarations for facebook-nodejs-business-sdk
 * These are minimal types for the functionality we use
 */

declare module 'facebook-nodejs-business-sdk' {
  export class FacebookAdsApi {
    static init(accessToken: string): FacebookAdsApi;
  }

  export class AdAccount {
    constructor(id: string);

    createCampaign(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<{ id: string; _data: Record<string, unknown> }>;

    createAdSet(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<{ id: string; _data: Record<string, unknown> }>;

    createAdCreative(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<{ id: string; _data: Record<string, unknown> }>;

    createAd(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<{ id: string; _data: Record<string, unknown> }>;

    createAdImage(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<{ id: string; _data: { images: Record<string, { hash: string; url: string }> } }>;

    getInsights(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<Array<{ _data: Record<string, unknown> }>>;
  }

  export class Campaign {
    constructor(id: string);
    get(fields: string[]): Promise<{ _data: Record<string, unknown> }>;
    update(fields: string[], params: Record<string, unknown>): Promise<void>;
  }

  export class AdSet {
    constructor(id: string);
    get(fields: string[]): Promise<{ _data: Record<string, unknown> }>;
    update(fields: string[], params: Record<string, unknown>): Promise<void>;
  }

  export class Ad {
    constructor(id: string);
    get(fields: string[]): Promise<{ _data: Record<string, unknown> }>;
    update(fields: string[], params: Record<string, unknown>): Promise<void>;
    getInsights(
      fields: string[],
      params: Record<string, unknown>
    ): Promise<Array<{ _data: Record<string, unknown> }>>;
  }

  export class AdCreative {
    constructor(id: string);
    get(fields: string[]): Promise<{ _data: Record<string, unknown> }>;
  }

  export class AdImage {
    constructor(id: string);
    get(fields: string[]): Promise<{ _data: Record<string, unknown> }>;
  }

  const sdk: {
    FacebookAdsApi: typeof FacebookAdsApi;
    AdAccount: typeof AdAccount;
    Campaign: typeof Campaign;
    AdSet: typeof AdSet;
    Ad: typeof Ad;
    AdCreative: typeof AdCreative;
    AdImage: typeof AdImage;
  };

  export default sdk;
}
