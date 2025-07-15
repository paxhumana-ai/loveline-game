"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Users, TrendingUp, SkipForward } from "lucide-react";
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

interface RoundResultsProps {
  roundNumber: number;
  matches: Match[];
  totalParticipants: number;
  totalSelections: number;
  matchingRate: number;
  passedParticipants?: number;
  className?: string;
}

export function RoundResults({
  roundNumber,
  matches,
  totalParticipants,
  totalSelections,
  matchingRate,
  passedParticipants = 0,
  className,
}: RoundResultsProps) {
  const matchedParticipants = matches.length * 2;
  const unmatchedParticipants = totalParticipants - matchedParticipants;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            라운드 {roundNumber} 결과
          </CardTitle>
          <p className="text-muted-foreground">
            {matches.length > 0 
              ? `${matches.length}개의 매칭이 성사되었습니다!` 
              : "이번 라운드에는 매칭이 없었습니다"
            }
          </p>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{matches.length}</p>
            <p className="text-sm text-muted-foreground">매칭</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold text-success">{matchedParticipants}</p>
            <p className="text-sm text-muted-foreground">매칭된 참가자</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold text-warning">{matchingRate}%</p>
            <p className="text-sm text-muted-foreground">매칭률</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <SkipForward className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-muted-foreground">{passedParticipants}</p>
            <p className="text-sm text-muted-foreground">패스</p>
          </CardContent>
        </Card>
      </div>

      {/* Matches Display */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              매칭 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <Badge variant="outline" className="text-xs">
                    매칭 {index + 1}
                  </Badge>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {match.participant1.character.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium">{match.participant1.nickname}</p>
                      <p className="text-xs text-muted-foreground">{match.participant1.character}</p>
                    </div>
                  </div>

                  <Heart className="w-6 h-6 text-primary" />

                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center">
                      <p className="font-medium">{match.participant2.nickname}</p>
                      <p className="text-xs text-muted-foreground">{match.participant2.character}</p>
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {match.participant2.character.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouragement for unmatched */}
      {unmatchedParticipants > 0 && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">매칭되지 않은 참가자들에게</h3>
            <p className="text-muted-foreground">
              {unmatchedParticipants}명의 참가자가 다음 라운드를 기다리고 있습니다. 
              다음 기회에서 더 좋은 인연을 만날 수 있을 거예요! 💪
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}