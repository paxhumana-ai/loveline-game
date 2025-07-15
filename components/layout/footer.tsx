"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Github,
  Mail,
  HelpCircle,
  Shield,
  Coffee,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  className?: string;
  variant?: "default" | "minimal";
}

export function Footer({ className, variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer className={className}>
        <div className="border-t bg-muted/30">
          <div className="container px-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-pink-500 to-rose-500">
                  <Heart className="h-3 w-3 text-white" fill="currentColor" />
                </div>
                <span className="font-medium">러브라인</span>
              </div>
              <p>© {currentYear} 러브라인. 모든 권리 보유.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={className}>
      <div className="border-t bg-background">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand and Description */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                  <Heart className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <span className="text-xl font-bold">러브라인</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                오프라인 미팅, 동아리 MT, 모임에서 사용할 수 있는 하트시그널
                스타일의 실시간 매칭 게임입니다. 익명으로 서로를 지목하며 새로운
                인연을 만나보세요.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Coffee className="h-4 w-4" />
                <span>재미있는 만남의 시작</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">빠른 시작</h3>
              <nav className="space-y-2">
                <Link
                  href="/create-room"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  방 만들기
                </Link>
                <Link
                  href="/join-room"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  방 참가하기
                </Link>
                <Link
                  href="/#how-to-play"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  게임 방법
                </Link>
                <Link
                  href="/#features"
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  주요 기능
                </Link>
              </nav>
            </div>

            {/* Support and Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">지원 및 정보</h3>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto justify-start p-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  asChild
                >
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    도움말
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto justify-start p-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  asChild
                >
                  <Link href="/privacy">
                    <Shield className="mr-2 h-4 w-4" />
                    개인정보 처리방침
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto justify-start p-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  asChild
                >
                  <Link href="/terms">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    이용약관
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto justify-start p-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  asChild
                >
                  <Link href="mailto:support@loveline.game">
                    <Mail className="mr-2 h-4 w-4" />
                    문의하기
                  </Link>
                </Button>
              </nav>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between space-y-4 text-sm text-muted-foreground md:flex-row md:space-y-0">
            <div className="flex items-center space-x-4">
              <p>© {currentYear} 러브라인. 모든 권리 보유.</p>
              <Separator orientation="vertical" className="h-4" />
              <p>Made with ❤️ in Korea</p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link
                  href="https://github.com/loveline-game"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link
                  href="mailto:hello@loveline.game"
                  aria-label="이메일 문의"
                >
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
