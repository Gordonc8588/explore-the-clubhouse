/**
 * Print Ad PDF Document
 * Uses @react-pdf/renderer to generate print-ready PDFs
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { TEMPLATES } from '@/lib/print-ads/templates';
import { BRAND_COLORS, mmToPt } from '@/lib/print-ads/types';
import type { PrintAdType, PrintAdClubData } from '@/types/database';

// Register fonts (using Google Fonts URLs for now)
// In production, you'd host these fonts locally
Font.register({
  family: 'Playfair Display',
  src: 'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf',
  fontWeight: 700,
});

Font.register({
  family: 'Nunito Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/nunitosans/v15/pe0qMImSLYBIv1o4X1M8cceyI9tAcVwob5A.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/nunitosans/v15/pe0qMImSLYBIv1o4X1M8ccezI9tAcVwob5A.ttf',
      fontWeight: 600,
    },
  ],
});

// Props interface
interface PrintAdPdfDocumentProps {
  adType: PrintAdType;
  headline: string;
  bodyCopy: string;
  ctaText: string;
  mainImageUrl: string;
  flyerImageUrl?: string;
  clubData: PrintAdClubData;
}

/**
 * Create styles based on template type
 */
function createStyles(adType: PrintAdType) {
  const template = TEMPLATES[adType];
  const pageWidth = mmToPt(template.width);
  const pageHeight = mmToPt(template.height);
  const marginTop = mmToPt(template.margins.top);
  const marginRight = mmToPt(template.margins.right);
  const marginBottom = mmToPt(template.margins.bottom);
  const marginLeft = mmToPt(template.margins.left);
  const contentWidth = pageWidth - marginLeft - marginRight;

  return StyleSheet.create({
    page: {
      width: pageWidth,
      height: pageHeight,
      backgroundColor: BRAND_COLORS.cream,
      fontFamily: 'Nunito Sans',
    },
    container: {
      flex: 1,
      paddingTop: marginTop,
      paddingRight: marginRight,
      paddingBottom: marginBottom,
      paddingLeft: marginLeft,
    },
    // Image zone
    imageContainer: {
      width: contentWidth,
      height: mmToPt(template.zones.image.height || 50),
      marginBottom: 8,
      overflow: 'hidden',
    },
    mainImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    // Headline zone
    headline: {
      fontFamily: 'Playfair Display',
      fontSize: template.zones.headline.fontSize || 14,
      fontWeight: 700,
      color: BRAND_COLORS.darkOlive,
      marginBottom: 8,
      lineHeight: template.zones.headline.lineHeight || 1.2,
    },
    // Body copy zone
    bodyCopy: {
      fontFamily: 'Nunito Sans',
      fontSize: template.zones.body.fontSize || 9,
      fontWeight: 400,
      color: BRAND_COLORS.darkOlive,
      lineHeight: template.zones.body.lineHeight || 1.5,
      marginBottom: 12,
      textAlign: 'justify',
    },
    // CTA zone
    ctaContainer: {
      backgroundColor: BRAND_COLORS.burntOrange,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    ctaText: {
      fontFamily: 'Nunito Sans',
      fontSize: template.zones.cta.fontSize || 10,
      fontWeight: 600,
      color: BRAND_COLORS.white,
    },
    // Footer zone
    footer: {
      position: 'absolute',
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight,
      borderTopWidth: 1,
      borderTopColor: BRAND_COLORS.olive,
      paddingTop: 6,
    },
    footerText: {
      fontFamily: 'Nunito Sans',
      fontSize: template.zones.footer.fontSize || 7,
      color: BRAND_COLORS.olive,
      textAlign: 'center',
    },
    // Club info
    clubInfo: {
      fontFamily: 'Nunito Sans',
      fontSize: (template.zones.body.fontSize || 9) - 1,
      color: BRAND_COLORS.olive,
      marginBottom: 8,
    },
    clubName: {
      fontFamily: 'Playfair Display',
      fontWeight: 700,
      color: BRAND_COLORS.darkOlive,
    },
    // Flyer image (optional)
    flyerContainer: {
      marginTop: 8,
      marginBottom: 8,
      alignItems: 'center',
    },
    flyerImage: {
      maxWidth: contentWidth * 0.8,
      maxHeight: mmToPt(30),
      objectFit: 'contain',
    },
  });
}

/**
 * Format price for display (pence to pounds)
 */
function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}

/**
 * Print Ad PDF Document Component
 */
export function PrintAdPdfDocument({
  adType,
  headline,
  bodyCopy,
  ctaText,
  mainImageUrl,
  flyerImageUrl,
  clubData,
}: PrintAdPdfDocumentProps) {
  const styles = createStyles(adType);
  const template = TEMPLATES[adType];

  // Get the first price for display (or format all)
  const priceDisplay = clubData.prices.length > 0
    ? `From ${formatPrice(Math.min(...clubData.prices.map(p => p.price)))}`
    : '';

  return (
    <Document>
      <Page size={[mmToPt(template.width), mmToPt(template.height)]} style={styles.page}>
        <View style={styles.container}>
          {/* Main Image */}
          <View style={styles.imageContainer}>
            <Image src={mainImageUrl} style={styles.mainImage} />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{headline}</Text>

          {/* Club Info Line */}
          <Text style={styles.clubInfo}>
            <Text style={styles.clubName}>{clubData.name}</Text>
            {' • '}{clubData.dates}{' • Ages '}{clubData.age_range}
            {priceDisplay && ` • ${priceDisplay}`}
          </Text>

          {/* Body Copy */}
          <Text style={styles.bodyCopy}>{bodyCopy}</Text>

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>{ctaText}</Text>
          </View>

          {/* Flyer Image (optional) */}
          {flyerImageUrl && (
            <View style={styles.flyerContainer}>
              <Image src={flyerImageUrl} style={styles.flyerImage} />
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            exploretheclubhouse.com • {clubData.location}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default PrintAdPdfDocument;
