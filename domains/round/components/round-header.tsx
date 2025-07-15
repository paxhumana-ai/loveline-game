"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoundHeaderProps {
  roundNumber: number;
  totalRounds: number;
  status: "pending" | "active" | "completed";
  startedAt?: Date | null;
  className?: string;
}

export function RoundHeader({
  roundNumber,
  totalRounds,
  status,
  startedAt,
  className = "",
}: RoundHeaderProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "대기 중";
      case "active":
        return "진행 중";
      case "completed":
        return "완료됨";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          {/* Round Number */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              라운드 {roundNumber}
            </h1>
            <p className="text-muted-foreground">
              {totalRounds}라운드 중 {roundNumber}번째
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <Badge
              variant={
                getStatusVariant(status) as "default" | "secondary" | "outline"
              }
              className="text-sm"
            >
              {getStatusText(status)}
            </Badge>
          </div>

          {/* Start Time */}
          {startedAt && (
            <div className="text-sm text-muted-foreground">
              시작 시간:{" "}
              {new Date(startedAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-center mb-2">
              <div className="text-xs text-muted-foreground">
                진행률: {Math.round((roundNumber / totalRounds) * 100)}%
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(roundNumber / totalRounds) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
