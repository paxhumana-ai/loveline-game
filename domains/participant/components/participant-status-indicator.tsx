"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Circle,
  CheckCircle,
  PlayCircle,
  StopCircle,
  Clock,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantStatusIndicatorProps {
  status: "joined" | "ready" | "playing" | "finished";
  variant?: "badge" | "dot" | "icon" | "detailed";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  joined: {
    label: "참가 중",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    icon: Circle,
    description: "게임방에 참가했습니다",
    variant: "secondary" as const,
  },
  ready: {
    label: "준비 완료",
    color: "bg-green-500",
    textColor: "text-green-600",
    icon: CheckCircle,
    description: "게임 시작 준비가 완료되었습니다",
    variant: "default" as const,
  },
  playing: {
    label: "게임 중",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    icon: PlayCircle,
    description: "현재 게임을 플레이 중입니다",
    variant: "outline" as const,
  },
  finished: {
    label: "완료",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    icon: StopCircle,
    description: "게임이 완료되었습니다",
    variant: "outline" as const,
  },
};

const sizeConfig = {
  sm: {
    dot: "w-2 h-2",
    icon: "w-3 h-3",
    text: "text-xs",
  },
  md: {
    dot: "w-3 h-3",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  lg: {
    dot: "w-4 h-4",
    icon: "w-5 h-5",
    text: "text-base",
  },
};

export default function ParticipantStatusIndicator({
  status,
  variant = "badge",
  size = "md",
  showLabel = true,
  className,
}: ParticipantStatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];
  const Icon = config.icon;

  if (variant === "dot") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "rounded-full border-2 border-background",
                config.color,
                sizeClass.dot,
                className
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center", className)}>
              <Icon className={cn(config.textColor, sizeClass.icon)} />
              {showLabel && (
                <span
                  className={cn(
                    "ml-1 font-medium",
                    config.textColor,
                    sizeClass.text
                  )}
                >
                  {config.label}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("rounded-full", config.color, sizeClass.dot)} />
        <div>
          <div className={cn("font-medium", sizeClass.text)}>
            {config.label}
          </div>
          <div
            className={cn(
              "text-muted-foreground",
              size === "lg" ? "text-sm" : "text-xs"
            )}
          >
            {config.description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <div className={cn("rounded-full", config.color, sizeClass.dot)} />
      {showLabel && config.label}
    </Badge>
  );
}

interface StatusSummaryProps {
  participants: Array<{
    status: "joined" | "ready" | "playing" | "finished";
  }>;
  className?: string;
}

export function StatusSummary({ participants, className }: StatusSummaryProps) {
  const statusCounts = participants.reduce((acc, participant) => {
    acc[participant.status] = (acc[participant.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalParticipants = participants.length;
  const readyCount = statusCounts.ready || 0;
  const playingCount = statusCounts.playing || 0;
  const finishedCount = statusCounts.finished || 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span className="font-medium">상태 요약</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <ParticipantStatusIndicator
              status={status as "joined" | "ready" | "playing" | "finished"}
              variant="icon"
              size="sm"
              showLabel={true}
            />
            <span className="text-sm font-medium">{count}명</span>
          </div>
        ))}
      </div>

      {totalParticipants > 0 && (
        <div className="pt-2 border-t text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>준비 완료 비율</span>
            <span>{Math.round((readyCount / totalParticipants) * 100)}%</span>
          </div>
          {playingCount > 0 && (
            <div className="flex justify-between">
              <span>게임 진행률</span>
              <span>
                {Math.round((finishedCount / totalParticipants) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
