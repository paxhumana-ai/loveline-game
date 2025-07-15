"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Menu,
  Home,
  Users,
  Settings,
  HelpCircle,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  showNavigation?: boolean;
  gameCode?: string;
  participantCount?: number;
  maxParticipants?: number;
}

export function Header({
  className,
  showNavigation = true,
  gameCode,
  participantCount,
  maxParticipants,
}: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine if we're in a game room
  const isInGameRoom = pathname?.includes("/room/");
  const isHomePage = pathname === "/";

  const navigationItems = [
    {
      href: "/",
      label: "홈",
      icon: Home,
      active: isHomePage,
    },
    {
      href: "/create-room",
      label: "방 만들기",
      icon: Users,
      active: pathname === "/create-room",
    },
    {
      href: "/join-room",
      label: "방 참가하기",
      icon: Gamepad2,
      active: pathname === "/join-room",
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="hidden text-xl font-bold text-foreground md:inline-block">
              러브라인
            </span>
          </Link>

          {/* Game Room Info */}
          {isInGameRoom && gameCode && (
            <div className="hidden items-center space-x-2 sm:flex">
              <Badge variant="secondary" className="font-mono">
                {gameCode}
              </Badge>
              {typeof participantCount === "number" &&
                typeof maxParticipants === "number" && (
                  <Badge variant="outline">
                    {participantCount}/{maxParticipants}
                  </Badge>
                )}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        {showNavigation && (
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        item.active && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Mobile Game Room Info */}
        {isInGameRoom && gameCode && (
          <div className="flex items-center space-x-2 sm:hidden">
            <Badge variant="secondary" className="text-xs font-mono">
              {gameCode}
            </Badge>
            {typeof participantCount === "number" &&
              typeof maxParticipants === "number" && (
                <Badge variant="outline" className="text-xs">
                  {participantCount}/{maxParticipants}
                </Badge>
              )}
          </div>
        )}

        {/* Mobile Menu */}
        {showNavigation && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="메뉴 열기"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                    <Heart className="h-5 w-5 text-white" fill="currentColor" />
                  </div>
                  <span>러브라인</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-6 space-y-1">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    도움말
                  </Button>
                </div>
              </nav>

              {/* Mobile Game Room Info in Menu */}
              {isInGameRoom && gameCode && (
                <div className="mt-6 border-t pt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    현재 게임방
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-mono">
                      방 코드: {gameCode}
                    </Badge>
                  </div>
                  {typeof participantCount === "number" &&
                    typeof maxParticipants === "number" && (
                      <div className="mt-2">
                        <Badge variant="outline">
                          참가자: {participantCount}/{maxParticipants}
                        </Badge>
                      </div>
                    )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
