import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClientWrapper } from "@/components/layout/client-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "러브라인 게임 - 하트시그널 스타일 실시간 매칭 게임",
    template: "%s | 러브라인 게임",
  },
  description:
    "오프라인 미팅과 모임에서 즐기는 하트시그널 스타일의 실시간 매칭 게임. 익명으로 서로를 지목하고 매칭되어 특별한 순간을 만들어보세요.",
  keywords: [
    "러브라인",
    "게임",
    "매칭",
    "하트시그널",
    "미팅",
    "모임",
    "오프라인",
  ],
  authors: [{ name: "러브라인 게임 팀" }],
  creator: "러브라인 게임 팀",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://loveline-game.com",
    siteName: "러브라인 게임",
    title: "러브라인 게임 - 하트시그널 스타일 실시간 매칭 게임",
    description:
      "오프라인 미팅과 모임에서 즐기는 하트시그널 스타일의 실시간 매칭 게임",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "러브라인 게임",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "러브라인 게임 - 하트시그널 스타일 실시간 매칭 게임",
    description:
      "오프라인 미팅과 모임에서 즐기는 하트시그널 스타일의 실시간 매칭 게임",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // TODO: Add actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <div className="min-h-screen bg-background">
          <ClientWrapper>{children}</ClientWrapper>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
