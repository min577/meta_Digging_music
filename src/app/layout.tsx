import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigTown · 디깅타운",
  description:
    "혼자 듣지 마세요. 같은 곡을 함께 들으며 취향이 비슷한 사람을 발견하는 음악 디깅 메타버스.",
};

export const viewport: Viewport = {
  themeColor: "#FBF6EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="font-sans">
        <div className="device-shell">{children}</div>
      </body>
    </html>
  );
}
