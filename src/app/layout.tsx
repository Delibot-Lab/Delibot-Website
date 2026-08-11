import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialogProvider";
import { siteConfig } from "@/lib/site";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const title = `${siteConfig.name} | ${siteConfig.labName}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Delibot", "CBSH", "배달 로봇", "자율주행", "동아리", "로보틱스"],
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  verification: {
    google: "xAyYkYGezYlzmSkzhCwwrTl-nCGv6ewScASAFt9AnQc",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  // env(safe-area-inset-*)가 실제 값을 갖게 하려면 필요하다 (노치/홈 인디케이터 영역까지
  // 레이아웃을 확장). 채팅 입력창처럼 화면 맨 아래에 고정되는 요소에서 사용한다.
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.labName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/delibot-logo.png`,
  description: siteConfig.description,
  email: siteConfig.contactEmail,
  sameAs: [siteConfig.githubOrgUrl],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <ConfirmDialogProvider>
          <MotionProvider>
            <ScrollProgress />
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </MotionProvider>
        </ConfirmDialogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
