"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TimeWarningProps {
  remainingTime: number;
  phase?: "free_time" | "selection";
  onWarningShown?: (
    warningLevel: "warning_30" | "warning_10" | "expired"
  ) => void;
  className?: string;
}

export function TimeWarning({
  remainingTime,
  phase = "free_time",
  onWarningShown,
  className = "",
}: TimeWarningProps) {
  const [currentWarning, setCurrentWarning] = useState<
    "warning_30" | "warning_10" | "expired" | null
  >(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let newWarning: "warning_30" | "warning_10" | "expired" | null = null;

    if (remainingTime <= 0) {
      newWarning = "expired";
    } else if (remainingTime <= 10) {
      newWarning = "warning_10";
    } else if (remainingTime <= 30) {
      newWarning = "warning_30";
    }

    if (newWarning !== currentWarning) {
      setCurrentWarning(newWarning);

      if (newWarning) {
        setIsVisible(true);
        onWarningShown?.(newWarning);

        // Auto-hide warning after some time (except for expired)
        if (newWarning !== "expired") {
          const hideTimer = setTimeout(() => {
            setIsVisible(false);
          }, 3000);

          return () => clearTimeout(hideTimer);
        }
      } else {
        setIsVisible(false);
      }
    }
  }, [remainingTime, currentWarning, onWarningShown]);

  if (!currentWarning || !isVisible) {
    return null;
  }

  const getWarningConfig = () => {
    switch (currentWarning) {
      case "warning_30":
        return {
          title: "⚠️ 30초 전",
          message:
            phase === "free_time"
              ? "곧 선택 시간이 시작됩니다. 준비해주세요!"
              : "30초 남았습니다. 선택을 서두르세요!",
          variant: "default" as const,
          urgency: "medium",
        };
      case "warning_10":
        return {
          title: "🚨 10초 전",
          message:
            phase === "free_time"
              ? "선택 시간이 곧 시작됩니다!"
              : "10초 남았습니다. 마지막 기회입니다!",
          variant: "destructive" as const,
          urgency: "high",
        };
      case "expired":
        return {
          title: "⏰ 시간 종료",
          message:
            phase === "free_time"
              ? "자유 시간이 종료되었습니다. 선택 시간이 시작됩니다!"
              : "선택 시간이 종료되었습니다.",
          variant: "destructive" as const,
          urgency: "critical",
        };
      default:
        return null;
    }
  };

  const config = getWarningConfig();
  if (!config) return null;

  const getAnimationClass = () => {
    switch (config.urgency) {
      case "high":
        return "animate-bounce";
      case "critical":
        return "animate-pulse";
      default:
        return "";
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
    >
      <Alert
        variant={config.variant}
        className={`max-w-md shadow-lg border-2 ${getAnimationClass()}`}
      >
        <AlertDescription className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge
              variant={
                config.variant === "destructive" ? "destructive" : "secondary"
              }
              className="text-sm font-bold"
            >
              {config.title}
            </Badge>
            {remainingTime > 0 && (
              <Badge variant="outline" className="text-sm">
                {formatTime(remainingTime)}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium">{config.message}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
