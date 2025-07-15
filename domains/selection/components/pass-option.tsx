"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SkipForward, Clock, Users } from "lucide-react";

interface PassOptionProps {
  onPass: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  roundNumber?: number;
  remainingTime?: number;
  participantCount?: number;
  className?: string;
}

export function PassOption({
  onPass,
  disabled = false,
  isSelected = false,
  roundNumber,
  remainingTime,
  participantCount,
  className,
}: PassOptionProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmPass = () => {
    onPass();
    setIsConfirmOpen(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      {
        "border-warning bg-warning/10": isSelected,
        "opacity-50": disabled,
      },
      className
    )}>
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <SkipForward className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div>
          <CardTitle className="text-lg">이번 라운드 패스</CardTitle>
          <CardDescription className="text-sm">
            {roundNumber && `라운드 ${roundNumber}에서 `}선택하지 않고 넘어갑니다
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            마음에 드는 사람이 없거나, 더 신중하게 생각하고 싶다면 이번 라운드를 패스할 수 있습니다.
          </p>
          
          {remainingTime && remainingTime > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>남은 시간: {formatTime(remainingTime)}</span>
            </div>
          )}

          {participantCount && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>참가자: {participantCount}명</span>
            </div>
          )}
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={cn(
                "w-full",
                {
                  "bg-warning text-warning-foreground hover:bg-warning/90": isSelected,
                }
              )}
              disabled={disabled}
            >
              {isSelected ? "패스 선택됨" : "라운드 패스하기"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <SkipForward className="w-5 h-5 text-warning" />
                라운드 패스 확인
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  {roundNumber && `라운드 ${roundNumber}을 `}정말 패스하시겠습니까?
                </p>
                
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">패스할 경우:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>이번 라운드에서 누구도 선택하지 않습니다</li>
                    <li>다른 참가자가 나를 선택해도 매칭되지 않습니다</li>
                    <li>다음 라운드에서 다시 참여할 수 있습니다</li>
                    <li>패스한 후에는 이번 라운드에서 선택을 변경할 수 없습니다</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    💡 팁: 패스는 전략적인 선택이 될 수 있어요!
                  </Badge>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmPass}
                className="bg-warning text-warning-foreground hover:bg-warning/90"
              >
                패스하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isSelected && (
          <div className="text-center">
            <Badge variant="default" className="bg-warning text-warning-foreground">
              이번 라운드 패스됨
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simplified version for compact spaces
export function PassButton({
  onPass,
  disabled = false,
  isSelected = false,
  variant = "outline",
  size = "default",
  className,
}: {
  onPass: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  variant?: "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmPass = () => {
    onPass();
    setIsConfirmOpen(false);
  };

  return (
    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={isSelected ? "default" : variant}
          size={size}
          disabled={disabled}
          className={cn(
            {
              "bg-warning text-warning-foreground hover:bg-warning/90": isSelected,
            },
            className
          )}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          {isSelected ? "패스됨" : "패스"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>라운드 패스</AlertDialogTitle>
          <AlertDialogDescription>
            이번 라운드를 패스하시겠습니까? 패스하면 누구도 선택하지 않습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmPass}>
            패스하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}