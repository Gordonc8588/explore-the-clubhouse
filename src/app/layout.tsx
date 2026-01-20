import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

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
  title: {
    default: "Explore the Clubhouse | Children's Holiday Club",
    template: "%s | Explore the Clubhouse",
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
  ],
  authors: [{ name: "Explore the Clubhouse" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Explore the Clubhouse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
