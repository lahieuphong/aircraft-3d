import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bảo tàng Chứng tích Chiến tranh — Aircraft Digital Twin",
  applicationName: "War Remnants Museum Aircraft Digital Twin",
  description:
    "Trải nghiệm mô hình máy bay 3D trực tuyến của Bảo tàng Chứng tích Chiến tranh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#D3CFC2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
