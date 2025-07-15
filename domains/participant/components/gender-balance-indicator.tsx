"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getParticipantsByRoomWithDetails } from "../actions";
import { toast } from "sonner";

interface GenderBalanceIndicatorProps {
  gameRoomId: string;
  maxParticipants?: number;
  variant?: "default" | "compact" | "minimal";
  showDetails?: boolean;
  className?: string;
}

interface GenderBalance {
  male: number;
  female: number;
  other: number;
  total: number;
}

const genderLabels = {
  male: "남성",
  female: "여성",
  other: "기타",
};

const genderColors = {
  male: "bg-blue-500",
  female: "bg-pink-500",
  other: "bg-purple-500",
};

const genderTextColors = {
  male: "text-blue-600",
  female: "text-pink-600",
  other: "text-purple-600",
};

export default function GenderBalanceIndicator({
  gameRoomId,
  maxParticipants = 8,
  variant = "default",
  showDetails = true,
  className,
}: GenderBalanceIndicatorProps) {
  const [genderBalance, setGenderBalance] = useState<GenderBalance>({
    male: 0,
    female: 0,
    other: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenderBalance = async () => {
      try {
        const result = await getParticipantsByRoomWithDetails(gameRoomId);
        if (result.success && result.data) {
          const balance = result.data.genderBalance;
          setGenderBalance({
            male: balance.male || 0,
            female: balance.female || 0,
            other: balance.other || 0,
            total: result.data.totalCount,
          });
        }
      } catch (error) {
        toast.error("성별 균형 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenderBalance();
  }, [gameRoomId]);

  const getBalanceStatus = () => {
    const { male, female, total } = genderBalance;
    const idealBalance = Math.ceil(maxParticipants / 2);
    const difference = Math.abs(male - female);

    if (total === 0) return "empty";
    if (total < 4) return "insufficient";
    if (difference <= 1) return "balanced";
    if (difference <= 2) return "slight-imbalance";
    return "imbalanced";
  };

  const balanceStatus = getBalanceStatus();

  const statusConfig = {
    empty: {
      label: "참가자 없음",
      color: "text-muted-foreground",
      icon: Users,
      description: "아직 참가자가 없습니다",
    },
    insufficient: {
      label: "참가자 부족",
      color: "text-yellow-600",
      icon: AlertTriangle,
      description: "균형 판단을 위해 더 많은 참가자가 필요합니다",
    },
    balanced: {
      label: "균형 잡힘",
      color: "text-green-600",
      icon: CheckCircle,
      description: "성별 균형이 잘 맞춰져 있습니다",
    },
    "slight-imbalance": {
      label: "약간 불균형",
      color: "text-yellow-600",
      icon: AlertTriangle,
      description: "약간의 성별 불균형이 있습니다",
    },
    imbalanced: {
      label: "불균형",
      color: "text-red-600",
      icon: AlertTriangle,
      description: "성별 불균형이 심합니다",
    },
  };

  const statusInfo = statusConfig[balanceStatus];
  const StatusIcon = statusInfo.icon;

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
        <span className={cn("text-sm", statusInfo.color)}>
          {statusInfo.label}
        </span>
        <span className="text-sm text-muted-foreground">
          ({genderBalance.total}/{maxParticipants})
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
            <span className="text-sm font-medium">{statusInfo.label}</span>
          </div>
          <Badge variant="outline">
            {genderBalance.total}/{maxParticipants}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(genderBalance)
            .filter(([key]) => key !== "total")
            .map(([gender, count]) => (
              <div key={gender} className="text-center">
                <div
                  className={cn(
                    "text-sm font-medium",
                    genderTextColors[gender as keyof typeof genderTextColors]
                  )}
                >
                  {count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {genderLabels[gender as keyof typeof genderLabels]}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          성별 균형
        </CardTitle>
        <CardDescription>
          게임 참가자들의 성별 균형을 확인하세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("w-5 h-5", statusInfo.color)} />
            <span className={cn("font-medium", statusInfo.color)}>
              {statusInfo.label}
            </span>
          </div>
          <Badge variant="outline">
            {genderBalance.total}/{maxParticipants}
          </Badge>
        </div>

        {showDetails && genderBalance.total > 0 && (
          <>
            <div className="space-y-3">
              {Object.entries(genderBalance)
                .filter(([key]) => key !== "total")
                .map(([gender, count]) => {
                  const percentage =
                    genderBalance.total > 0
                      ? (count / genderBalance.total) * 100
                      : 0;
                  return (
                    <div key={gender} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {genderLabels[gender as keyof typeof genderLabels]}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count}명 ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusInfo.description}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      이상적인 균형: 각 성별 {Math.ceil(maxParticipants / 2)}명
                      이하
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}

        {genderBalance.total === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">아직 참가자가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GenderBalanceSummaryProps {
  genderBalance: GenderBalance;
  maxParticipants: number;
  className?: string;
}

export function GenderBalanceSummary({
  genderBalance,
  maxParticipants,
  className,
}: GenderBalanceSummaryProps) {
  const { male, female, other, total } = genderBalance;
  const malePercentage = total > 0 ? (male / total) * 100 : 0;
  const femalePercentage = total > 0 ? (female / total) * 100 : 0;
  const otherPercentage = total > 0 ? (other / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <span className="text-sm">남성 {male}명</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-pink-500 rounded-full" />
        <span className="text-sm">여성 {female}명</span>
      </div>
      {other > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
          <span className="text-sm">기타 {other}명</span>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        총 {total}/{maxParticipants}
      </div>
    </div>
  );
}
