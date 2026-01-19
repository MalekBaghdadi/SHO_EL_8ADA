import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sho El 8ada",
  description: "Sho El 8ada - Lunch Ideas Generator",
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
