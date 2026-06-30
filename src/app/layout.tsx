import type { Metadata } from "next";
import { Space_Grotesk, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-schibsted-grotesk",
});

export const metadata: Metadata = {
  title: "Aegis — Creative Intelligence Pipeline",
  description:
    "Turn competitor landing pages into compliance-checked ad variations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${schibstedGrotesk.variable}`}>
      <body className="bg-aegis-black font-body antialiased">{children}</body>
    </html>
  );
}