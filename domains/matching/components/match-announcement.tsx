"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  nickname: string;
  character: string;
  gender: "male" | "female" | "other";
}

interface Match {
  id: string;
  participant1: Participant;
  participant2: Participant;
  createdAt: Date;
}

interface MatchAnnouncementProps {
  matches: Match[];
  onComplete?: () => void;
  autoAdvance?: boolean;
  roundNumber?: number;
  className?: string;
}

export function MatchAnnouncement({
  matches,
  onComplete,
  autoAdvance = true,
  roundNumber,
  className,
}: MatchAnnouncementProps) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentMatch = matches[currentMatchIndex];
  const hasMoreMatches = currentMatchIndex < matches.length - 1;

  useEffect(() => {
    if (matches.length > 0) {
      setIsRevealing(true);
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        if (autoAdvance && hasMoreMatches) {
          handleNextMatch();
        } else if (!hasMoreMatches && onComplete) {
          onComplete();
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentMatchIndex, matches, autoAdvance, hasMoreMatches, onComplete]);

  const handleNextMatch = () => {
    if (hasMoreMatches) {
      setIsRevealing(false);
      setShowCelebration(false);
      setTimeout(() => {
        setCurrentMatchIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (matches.length === 0) {
    return (
      <Card className={cn("text-center p-8", className)}>
        <CardContent className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground">
              {roundNumber && `라운드 ${roundNumber} - `}매칭 결과
            </h3>
            <p className="text-muted-foreground mt-2">
              이번 라운드에는 매칭이 없었습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              다음 라운드에서 새로운 기회가 있을 거예요!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Celebration Background */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-red-500/10 animate-pulse" />
          {Array.from({ length: 20 }).map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute w-6 h-6 text-primary animate-bounce",
                "opacity-60"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-500",
        {
          "border-primary bg-primary/5 shadow-lg": isRevealing,
          "border-muted": !isRevealing,
        }
      )}>
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Heart className={cn(
                "w-10 h-10 text-primary transition-all duration-500",
                {
                  "animate-pulse scale-110": showCelebration,
                }
              )} />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground">
              💕 매칭 성공! 💕
            </h2>
            <p className="text-muted-foreground mt-1">
              {roundNumber && `라운드 ${roundNumber} - `}
              {matches.length}개의 매칭이 발견되었습니다!
            </p>
          </div>

          {/* Current Match Display */}
          {currentMatch && (
            <div className={cn(
              "transition-all duration-500 transform",
              {
                "scale-100 opacity-100": isRevealing,
                "scale-95 opacity-0": !isRevealing,
              }
            )}>
              <div className="flex items-center justify-center gap-6 mb-6">
                {/* Participant 1 */}
                <div className="text-center space-y-2">
                  <Avatar className="w-20 h-20 mx-auto border-2 border-primary">
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                      {currentMatch.participant1.character.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {currentMatch.participant1.nickname}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentMatch.participant1.character}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentMatch.participant1.gender === "male" ? "남성" : "여성"}
                  </Badge>
                </div>

                {/* Connection Animation */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center transition-all duration-1000",
                    {
                      "animate-pulse scale-110": showCelebration,
                    }
                  )}>
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className={cn(
                    "w-6 h-6 text-primary mt-2 transition-all duration-500",
                    {
                      "animate-bounce": showCelebration,
                    }
                  )} />
                </div>

                {/* Participant 2 */}
                <div className="text-center space-y-2">
                  <Avatar className="w-20 h-20 mx-auto border-2 border-primary">
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                      {currentMatch.participant2.character.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {currentMatch.participant2.nickname}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentMatch.participant2.character}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentMatch.participant2.gender === "male" ? "남성" : "여성"}
                  </Badge>
                </div>
              </div>

              <div className="text-center bg-primary/10 rounded-lg p-4">
                <p className="font-medium text-primary">
                  🎉 서로를 선택했습니다! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  5분간 아이스크림을 함께 드세요!
                </p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {matches.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  {
                    "bg-primary": index <= currentMatchIndex,
                    "bg-muted": index > currentMatchIndex,
                  }
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-3 mt-6">
            {hasMoreMatches ? (
              <Button onClick={handleNextMatch} size="lg">
                다음 매칭 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} size="lg">
                결과 확인하기
              </Button>
            )}
          </div>

          {/* Match Counter */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {currentMatchIndex + 1} / {matches.length} 매칭
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}