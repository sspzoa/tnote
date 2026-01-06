import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type React from "react";
import { Providers } from "@/shared/lib/provider";

export const metadata: Metadata = {
  title: "Tnote - 티노트",
  description: "선생님을 위한 학생 관리 서비스",
  openGraph: {},
};

export const viewport: Viewport = {
  themeColor: "#0083ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Analytics />
        <SpeedInsights />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
