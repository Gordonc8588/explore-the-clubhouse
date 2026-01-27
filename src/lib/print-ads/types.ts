/**
 * Print Ads - Type definitions and constants
 * Used for generating newspaper/magazine advertisements
 */

import type { PrintAdType, PrintAdClubData } from '@/types/database';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const BRAND_COLORS = {
  olive: '#7A7C4A',
  cream: '#F5F4ED',
  burntOrange: '#D4843E',
  darkOlive: '#5A5C3A',
  white: '#FFFFFF',
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

/** Zone definition within a template (positions in mm) */
export interface TemplateZone {
  y: number;          // Top position in mm
  height?: number;    // Optional height in mm
  fontSize?: number;  // Font size in points
  lineHeight?: number;// Line height multiplier
}

/** Template zone definitions */
export interface TemplateZones {
  image: TemplateZone;
  headline: TemplateZone;
  body: TemplateZone;
  cta: TemplateZone;
  footer: TemplateZone;
}

/** Margin definition */
export interface TemplateMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Full template configuration */
export interface PrintAdTemplate {
  id: PrintAdType;
  name: string;
  description: string;
  /** Width in mm */
  width: number;
  /** Height in mm */
  height: number;
  /** Margins in mm */
  margins: TemplateMargins;
  /** Content zone definitions */
  zones: TemplateZones;
  /** Whether this is a digital format (vs print) */
  isDigital: boolean;
}

// =============================================================================
// FORM DATA TYPES
// =============================================================================

/** Data for creating/editing a print ad */
export interface PrintAdFormData {
  name: string;
  adType: PrintAdType;
  clubId: string | null;
  clubData: PrintAdClubData | null;
  headline: string;
  bodyCopy: string;
  ctaText: string;
  mainImageUrl: string | null;
  flyerImageUrl: string | null;
}

/** AI generation request */
export interface GenerateCopyRequest {
  clubId: string;
  adType: PrintAdType;
  mainImageUrl?: string;
  notes?: string;
}

/** AI generation response */
export interface GenerateCopyResponse {
  headline: string;
  bodyCopy: string;
  ctaText: string;
}

/** PDF generation request */
export interface GeneratePdfRequest {
  printAdId?: string;
  printAdData?: {
    adType: PrintAdType;
    headline: string;
    bodyCopy: string;
    ctaText: string;
    mainImageUrl: string;
    flyerImageUrl?: string;
    clubData: PrintAdClubData;
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Word count result */
export interface WordCount {
  count: number;
  isValid: boolean;
  message: string;
}

/** Validation result for print ad form */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Minimum word count for body copy */
export const MIN_WORD_COUNT = 80;

/** Maximum word count for body copy (soft limit) */
export const MAX_WORD_COUNT = 150;

/** Maximum headline length */
export const MAX_HEADLINE_LENGTH = 100;

/** Maximum CTA text length */
export const MAX_CTA_LENGTH = 50;

/** 1mm in PDF points (1 point = 0.3528mm) */
export const MM_TO_PT = 2.834645;

/** Convert mm to points */
export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

/** Convert points to mm */
export function ptToMm(pt: number): number {
  return pt / MM_TO_PT;
}

/** Count words in text */
export function countWords(text: string): WordCount {
  const trimmed = text.trim();
  if (!trimmed) {
    return { count: 0, isValid: false, message: 'Body copy is required' };
  }

  const count = trimmed.split(/\s+/).filter(word => word.length > 0).length;

  if (count < MIN_WORD_COUNT) {
    return {
      count,
      isValid: false,
      message: `Need ${MIN_WORD_COUNT - count} more words (minimum ${MIN_WORD_COUNT})`,
    };
  }

  if (count > MAX_WORD_COUNT) {
    return {
      count,
      isValid: true, // Soft limit - still valid but warn
      message: `${count} words (consider trimming to ~${MAX_WORD_COUNT})`,
    };
  }

  return {
    count,
    isValid: true,
    message: `${count} words`,
  };
}
