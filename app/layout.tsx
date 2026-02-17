import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#DF9C20",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sho-el-8ada.vercel.app"),
  title: "Sho El 8ada | Lebanese Food Idea Generator",
  description: "Stop the daily argument. Discover thousands of Lebanese and international food combinations with our AI-powered selection engine.",
  keywords: ["lebanese food", "lunch ideas", "food generator", "sho el 8ada", "recipes", "lebanon dinner"],
  authors: [{ name: "Malek Baghdadi" }],
  openGraph: {
    title: "Sho El 8ada | The Ultimate Food Idea Generator",
    description: "Decide what to eat in seconds. AI-powered, contextual, and personalized suggestions.",
    url: "https://sho-el-8ada.vercel.app",
    siteName: "Sho El 8ada",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sho El 8ada Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sho El 8ada | Stop the food argument",
    description: "Personalized Lebanese food suggestions based on your cravings and current time.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
