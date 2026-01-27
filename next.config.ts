import type { NextConfig } from "next";

// Content Security Policy
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com https://www.gstatic.com https://www.google.com https://js.stripe.com https://upload-widget.cloudinary.com https://widget.cloudinary.com https://connect.facebook.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://res.cloudinary.com https://*.google-analytics.com https://www.googletagmanager.com https://*.stripe.com https://www.gstatic.com https://www.facebook.com https://*.fbcdn.net;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://www.google.com https://api.stripe.com https://api.cloudinary.com https://*.cloudinary.com https://www.facebook.com https://*.facebook.com;
  frame-src 'self' https://www.google.com https://js.stripe.com https://maps.google.com https://upload-widget.cloudinary.com https://widget.cloudinary.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, " ").trim();

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "craigiesclubhouse.co.uk",
          },
        ],
        destination: "https://exploretheclubhouse.co.uk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.craigiesclubhouse.co.uk",
          },
        ],
        destination: "https://exploretheclubhouse.co.uk/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
