import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { UTMCapture } from "@/components/UTMCapture";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://exploretheclubhouse.co.uk"
  ),
  title: {
    default: "The Clubhouse | Children's Holiday Club",
    template: "%s | The Clubhouse",
  },
  description:
    "Outdoor holiday clubs for children during school holidays. Farm activities, nature exploration, and hands-on learning in a safe, fun environment.",
  keywords: [
    "children's holiday club",
    "kids activities",
    "school holiday childcare",
    "farm activities for kids",
    "outdoor learning",
    "holiday club booking",
    "South Queensferry",
    "Craigies Farm",
    "Edinburgh",
  ],
  authors: [{ name: "The Clubhouse" }],
  creator: "The Clubhouse",
  publisher: "The Clubhouse",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "The Clubhouse",
    title: "The Clubhouse | Children's Holiday Club",
    description:
      "Outdoor holiday clubs for children during school holidays at Craigies Farm, South Queensferry.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Clubhouse | Children's Holiday Club",
    description:
      "Outdoor holiday clubs for children during school holidays at Craigies Farm, South Queensferry.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "theme-color": "#7A7C4A",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://exploretheclubhouse.co.uk/#organization",
      name: "The Clubhouse",
      url: "https://exploretheclubhouse.co.uk",
      logo: {
        "@type": "ImageObject",
        url: "https://exploretheclubhouse.co.uk/icon-512.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+44-7907-879303",
        contactType: "customer service",
        email: "hello@exploretheclubhouse.co.uk",
      },
      sameAs: [
        "https://www.facebook.com/exploretheclubhouse",
        "https://www.instagram.com/exploretheclubhouse",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://exploretheclubhouse.co.uk/#localbusiness",
      name: "The Clubhouse",
      description:
        "Outdoor holiday clubs for children during school holidays at Craigies Farm, South Queensferry.",
      url: "https://exploretheclubhouse.co.uk",
      telephone: "+44-7907-879303",
      email: "hello@exploretheclubhouse.co.uk",
      address: {
        "@type": "PostalAddress",
        streetAddress: "West Craigie Farm",
        addressLocality: "South Queensferry",
        postalCode: "EH30 9AR",
        addressCountry: "GB",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 55.9897,
        longitude: -3.4044,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      priceRange: "££",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Meta Pixel Code */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
        <Navigation />
        {children}
        <CookieConsent />
        <GoogleAnalytics />
        <UTMCapture />
      </body>
    </html>
  );
}
