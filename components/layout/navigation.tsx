"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Users,
  Gamepad2,
  Clock,
  Play,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
  showBreadcrumbs?: boolean;
  showGameProgress?: boolean;
  gameState?: {
    status: "waiting" | "in_progress" | "completed" | "cancelled";
    currentRound?: number;
    totalRounds?: number;
    timeRemaining?: number;
    phase?: "free_time" | "selection_time" | "round_result" | "final_result";
  };
  roomCode?: string;
}

export function Navigation({
  className,
  showBreadcrumbs = true,
  showGameProgress = false,
  gameState,
  roomCode,
}: NavigationProps) {
  const pathname = usePathname();

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = pathname?.split("/").filter(Boolean) || [];
    const items = [
      {
        href: "/",
        label: "홈",
        icon: Home,
        isActive: false,
      },
    ];

    if (pathSegments.includes("create-room")) {
      items.push({
        href: "/create-room",
        label: "방 만들기",
        icon: Users,
        isActive: pathSegments[pathSegments.length - 1] === "create-room",
      });
    }

    if (pathSegments.includes("join-room")) {
      items.push({
        href: "/join-room",
        label: "방 참가하기",
        icon: Gamepad2,
        isActive: pathSegments[pathSegments.length - 1] === "join-room",
      });
    }

    if (pathSegments.includes("room") && roomCode) {
      items.push({
        href: `/room/${roomCode}`,
        label: `게임방 ${roomCode}`,
        icon: Play,
        isActive: pathSegments[pathSegments.length - 1] === roomCode,
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Get game phase display info
  const getPhaseInfo = () => {
    if (!gameState?.phase) return null;

    const phaseMap = {
      free_time: {
        label: "자유시간",
        color: "bg-blue-500",
        icon: Clock,
      },
      selection_time: {
        label: "지목시간",
        color: "bg-orange-500",
        icon: Users,
      },
      round_result: {
        label: "라운드 결과",
        color: "bg-green-500",
        icon: Trophy,
      },
      final_result: {
        label: "최종 결과",
        color: "bg-purple-500",
        icon: Trophy,
      },
    };

    return phaseMap[gameState.phase];
  };

  const phaseInfo = getPhaseInfo();

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!gameState?.currentRound || !gameState?.totalRounds) return 0;
    return (gameState.currentRound / gameState.totalRounds) * 100;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <nav className={cn("w-full", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbItems.length > 1 && (
        <div className="border-b bg-muted/30 px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="flex items-center space-x-1">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-1 hover:text-foreground"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Game Progress */}
      {showGameProgress && gameState && (
        <div className="border-b bg-background px-4 py-3">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="space-y-3">
                {/* Game Status and Phase */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        gameState.status === "in_progress"
                          ? "default"
                          : gameState.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {gameState.status === "waiting" && "대기 중"}
                      {gameState.status === "in_progress" && "진행 중"}
                      {gameState.status === "completed" && "완료"}
                      {gameState.status === "cancelled" && "취소됨"}
                    </Badge>

                    {phaseInfo && gameState.status === "in_progress" && (
                      <Badge variant="outline" className="text-xs">
                        <div
                          className={cn(
                            "mr-1 h-2 w-2 rounded-full",
                            phaseInfo.color
                          )}
                        />
                        {phaseInfo.label}
                      </Badge>
                    )}
                  </div>

                  {/* Time Remaining */}
                  {gameState.timeRemaining !== undefined &&
                    gameState.timeRemaining > 0 && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.floor(gameState.timeRemaining / 60)}:
                          {(gameState.timeRemaining % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>
                    )}
                </div>

                {/* Round Progress */}
                {gameState.currentRound && gameState.totalRounds && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        라운드 {gameState.currentRound} /{" "}
                        {gameState.totalRounds}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round(progressPercentage)}% 완료
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                {/* Round Indicators */}
                {gameState.totalRounds && gameState.totalRounds <= 10 && (
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: gameState.totalRounds }, (_, i) => {
                      const roundNumber = i + 1;
                      const isCompleted = gameState.currentRound
                        ? roundNumber < gameState.currentRound
                        : false;
                      const isCurrent = roundNumber === gameState.currentRound;

                      return (
                        <div
                          key={roundNumber}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                            isCompleted && "bg-primary text-primary-foreground",
                            isCurrent &&
                              "bg-primary/20 text-primary ring-2 ring-primary",
                            !isCompleted &&
                              !isCurrent &&
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {roundNumber}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </nav>
  );
}
