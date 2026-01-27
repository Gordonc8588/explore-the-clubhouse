/**
 * Print Ads - Template definitions
 * Defines dimensions, zones, and styling for each ad type
 */

import type { PrintAdTemplate } from './types';
import type { PrintAdType } from '@/types/database';

// =============================================================================
// TEMPLATE DEFINITIONS
// =============================================================================

/**
 * Magazine Quarter Page Template
 * Standard A4 quarter page: 105mm x 148mm
 * For print publications at 300 DPI
 */
const magazineQuarterPage: PrintAdTemplate = {
  id: 'magazine_quarter_page',
  name: 'Magazine Quarter Page',
  description: 'A4 quarter page (105mm x 148mm) for print magazines',
  width: 105,
  height: 148,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  zones: {
    image: {
      y: 8,
      height: 50,
    },
    headline: {
      y: 62,
      fontSize: 14,
      lineHeight: 1.2,
    },
    body: {
      y: 80,
      fontSize: 9,
      lineHeight: 1.5,
    },
    cta: {
      y: 125,
      fontSize: 10,
    },
    footer: {
      y: 135,
      height: 13,
      fontSize: 7,
    },
  },
  isDigital: false,
};

/**
 * Newsletter/Digital Ad Template
 * Standard digital format: 600px x 800px
 * For newsletters and social media
 */
const newsletterDigital: PrintAdTemplate = {
  id: 'newsletter_digital',
  name: 'Newsletter / Digital Ad',
  description: 'Digital format (600x800px) for newsletters and social',
  // Convert pixels to mm (assuming 72 DPI for screen)
  // 600px at 72dpi = 211.67mm, 800px = 282.22mm
  width: 211.67,
  height: 282.22,
  margins: { top: 15, right: 15, bottom: 15, left: 15 },
  zones: {
    image: {
      y: 15,
      height: 100,
    },
    headline: {
      y: 120,
      fontSize: 24,
      lineHeight: 1.2,
    },
    body: {
      y: 155,
      fontSize: 12,
      lineHeight: 1.6,
    },
    cta: {
      y: 230,
      fontSize: 14,
    },
    footer: {
      y: 260,
      height: 22,
      fontSize: 10,
    },
  },
  isDigital: true,
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * All available templates indexed by type
 */
export const TEMPLATES: Record<PrintAdType, PrintAdTemplate> = {
  magazine_quarter_page: magazineQuarterPage,
  newsletter_digital: newsletterDigital,
};

/**
 * Get template by type
 */
export function getTemplate(type: PrintAdType): PrintAdTemplate {
  return TEMPLATES[type];
}

/**
 * Get all templates as array (for dropdowns)
 */
export function getAllTemplates(): PrintAdTemplate[] {
  return Object.values(TEMPLATES);
}

/**
 * Default template type
 */
export const DEFAULT_TEMPLATE_TYPE: PrintAdType = 'magazine_quarter_page';

// =============================================================================
// PRINT SPECIFICATIONS
// =============================================================================

/**
 * Print specifications for professional output
 */
export const PRINT_SPECS = {
  /** Resolution for print quality */
  dpi: 300,
  /** Bleed area in mm (for professional printing) */
  bleed: 3,
  /** Safe area inset in mm (keep important content within) */
  safeArea: 5,
  /** Color mode note */
  colorMode: 'RGB (may require CMYK conversion for professional print)',
};

/**
 * Contact/footer information for ads
 */
export const FOOTER_INFO = {
  website: 'exploretheclubhouse.com',
  phone: '01onal 123 456', // Placeholder - should come from config
  location: 'Craigies Farm, Scottish Borders',
};
