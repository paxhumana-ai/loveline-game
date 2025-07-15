"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoundTimerProps {
  initialTime: number; // in seconds
  isRunning: boolean;
  onTimeUp?: () => void;
  onWarning?: (remainingTime: number) => void;
  phase?: "free_time" | "selection";
  className?: string;
}

export function RoundTimer({
  initialTime,
  isRunning,
  onTimeUp,
  onWarning,
  phase = "free_time",
  className = "",
}: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [hasWarned30, setHasWarned30] = useState(false);
  const [hasWarned10, setHasWarned10] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
    setHasWarned30(false);
    setHasWarned10(false);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);

        // Warning callbacks
        if (newTime === 30 && !hasWarned30 && onWarning) {
          setHasWarned30(true);
          onWarning(newTime);
        }
        if (newTime === 10 && !hasWarned10 && onWarning) {
          setHasWarned10(true);
          onWarning(newTime);
        }

        // Time up callback
        if (newTime === 0 && onTimeUp) {
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, hasWarned30, hasWarned10, onTimeUp, onWarning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return "text-destructive";
    if (timeLeft <= 30) return "text-orange-500";
    return phase === "free_time" ? "text-primary" : "text-destructive";
  };

  const getProgressColor = () => {
    if (timeLeft <= 10) return "bg-destructive";
    if (timeLeft <= 30) return "bg-orange-500";
    return phase === "free_time" ? "bg-primary" : "bg-destructive";
  };

  const getPhaseText = () => {
    return phase === "free_time" ? "자유시간" : "선택시간";
  };

  const getPhaseIcon = () => {
    return phase === "free_time" ? "💬" : "🎯";
  };

  const progress = (timeLeft / initialTime) * 100;

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          {/* Phase Badge */}
          <div className="mb-4">
            <Badge
              variant={phase === "free_time" ? "default" : "destructive"}
              className="text-sm"
            >
              <span className="mr-1">{getPhaseIcon()}</span>
              {getPhaseText()}
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="mb-6">
            <div
              className={`text-6xl md:text-7xl font-bold ${getTimerColor()} transition-colors duration-300`}
            >
              {formatTime(timeLeft)}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {timeLeft <= 0 ? "시간 종료!" : "남은 시간"}
            </p>
          </div>

          {/* Progress Ring/Bar */}
          <div className="mb-6">
            <div className="relative w-32 h-32 mx-auto">
              {/* Background Circle */}
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted stroke-current"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 50 * (1 - progress / 100)
                  }`}
                  className={`${getProgressColor().replace(
                    "bg-",
                    "text-"
                  )} stroke-current transition-all duration-1000 ease-linear`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-sm text-muted-foreground">
            {timeLeft <= 0 && "⏰ 시간이 종료되었습니다"}
            {timeLeft > 0 && timeLeft <= 10 && "🚨 마지막 10초입니다!"}
            {timeLeft > 10 && timeLeft <= 30 && "⚠️ 30초 남았습니다"}
            {timeLeft > 30 &&
              phase === "free_time" &&
              "💭 자유롭게 대화해보세요"}
            {timeLeft > 30 && phase === "selection" && "🤔 신중히 선택해주세요"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
