import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "LifeLink AI - Emergency Blood & Organ Donor Network",
  description: "AI-Powered Emergency Blood and Organ Donor Network. Connecting lives in seconds through automated matching, location intelligence, and SOS broadcasts.",
  keywords: ["blood donor", "organ donor", "emergency blood", "AI matching", "healthcare SaaS", "LifeLink AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-slatebg selection:bg-primary selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
