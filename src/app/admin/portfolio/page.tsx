/**
 * Portfolio PDF Generator
 * Admin page to generate portfolio case study PDF with screenshots
 */

'use client';

import { useState } from 'react';

interface ScreenshotField {
  key: string;
  label: string;
  description: string;
}

const SCREENSHOT_FIELDS: ScreenshotField[] = [
  { key: 'homepage', label: 'Homepage', description: 'Homepage with hero section' },
  { key: 'clubListing', label: 'Club Listing', description: 'Club listing page' },
  { key: 'bookingOption', label: 'Booking - Options', description: 'Booking flow option selection' },
  { key: 'bookingDate', label: 'Booking - Dates', description: 'Booking flow date selection' },
  { key: 'bookingReview', label: 'Booking - Review', description: 'Booking flow review step' },
  { key: 'childInfo', label: 'Child Info Form', description: 'Post-payment child information' },
  { key: 'adminDashboard', label: 'Admin Dashboard', description: 'Admin dashboard home' },
  { key: 'adminDaily', label: 'Daily Attendance', description: 'Daily attendance view' },
  { key: 'adminBookings', label: 'Bookings List', description: 'Bookings management table' },
  { key: 'adminBookingDetail', label: 'Booking Detail', description: 'Individual booking detail' },
  { key: 'adminClubs', label: 'Club Management', description: 'Club management interface' },
  { key: 'adminPromoCodes', label: 'Promo Codes', description: 'Promo code management' },
  { key: 'newsletterEditor', label: 'Newsletter Editor', description: 'AI-powered newsletter editor' },
  { key: 'newsletterPreview', label: 'Newsletter Preview', description: 'Newsletter preview' },
  { key: 'subscribers', label: 'Subscribers', description: 'Subscriber management' },
  { key: 'metaAds', label: 'Meta Ads Dashboard', description: 'Meta ads campaign list' },
  { key: 'adCreate', label: 'Ad Creation', description: 'Ad creation with AI copy' },
  { key: 'printAds', label: 'Print Ads', description: 'Print ad designer' },
  { key: 'analyticsOverview', label: 'Analytics Overview', description: 'Analytics dashboard' },
  { key: 'analyticsFunnel', label: 'Conversion Funnel', description: 'Funnel analysis' },
  { key: 'analyticsCampaigns', label: 'Campaign Analytics', description: 'Campaign performance' },
  { key: 'analyticsAds', label: 'Ads Analytics', description: 'Meta ads analytics' },
  { key: 'survey', label: 'Survey Flow', description: 'Market research survey' },
  { key: 'surveyAdmin', label: 'Survey Admin', description: 'Survey analytics dashboard' },
];

export default function PortfolioPage() {
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (key: string, value: string) => {
    setScreenshots((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Filter out empty URLs
      const validScreenshots = Object.fromEntries(
        Object.entries(screenshots).filter(([, url]) => url && url.trim())
      );

      const response = await fetch('/api/admin/portfolio/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshots: Object.keys(validScreenshots).length > 0 ? validScreenshots : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `explore-the-clubhouse-portfolio-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const filledCount = Object.values(screenshots).filter((url) => url && url.trim()).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--craigies-dark-olive)] mb-2">
          Portfolio PDF Generator
        </h1>
        <p className="text-[var(--craigies-olive)]">
          Generate a professional PDF case study for your portfolio. Screenshots are optional
          but recommended for a polished presentation.
        </p>
      </div>

      {/* Quick Generate */}
      <div className="bg-[var(--craigies-cream)] rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--craigies-dark-olive)] mb-1">
              Quick Generate
            </h2>
            <p className="text-sm text-[var(--craigies-olive)]">
              Generate PDF now with {filledCount} screenshot{filledCount !== 1 ? 's' : ''} added
            </p>
          </div>
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="px-6 py-3 bg-[var(--craigies-burnt-orange)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
        )}
      </div>

      {/* Screenshots Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-[var(--craigies-olive)] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Screenshots (Optional)</h2>
          <p className="text-sm text-white/80 mt-1">
            Add Cloudinary or other image URLs to include screenshots in the PDF
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {SCREENSHOT_FIELDS.map((field) => (
            <div key={field.key} className="px-6 py-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--craigies-dark-olive)]">
                  {field.label}
                </span>
                <span className="text-sm text-[var(--craigies-olive)] ml-2">
                  ({field.description})
                </span>
                <input
                  type="url"
                  value={screenshots[field.key] || ''}
                  onChange={(e) => handleUrlChange(field.key, e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)] focus:border-transparent text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">How to add screenshots:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Take screenshots of each admin page and public page</li>
          <li>Upload them to Cloudinary (or any image host)</li>
          <li>Paste the URLs in the fields above</li>
          <li>Click &quot;Generate PDF&quot; to create the portfolio document</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">
          Tip: Screenshots with dimensions around 1200x800px work best.
        </p>
      </div>

      {/* Markdown Download */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Markdown Version</h3>
        <p className="text-sm text-gray-600 mb-4">
          A markdown version of this case study is also available at:
        </p>
        <code className="block bg-gray-100 px-4 py-2 rounded text-sm text-gray-700">
          /docs/portfolio-case-study.md
        </code>
      </div>
    </div>
  );
}
