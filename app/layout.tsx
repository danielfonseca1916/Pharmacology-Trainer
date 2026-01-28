import { SessionMonitor } from "@/components/SessionMonitor";
import { SkipLink } from "@/components/SkipLink";
import { I18nProvider } from "@/lib/i18n";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharmacology Trainer",
  description: "Educational pharmacology training platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <SkipLink />
        <SessionProvider>
          <SessionMonitor />
          <I18nProvider>{children}</I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
