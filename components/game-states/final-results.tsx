"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Crown,
  Heart,
  Users,
  Star,
  Home,
  Play,
  Download,
} from "lucide-react";
import Link from "next/link";

interface MatchHistory {
  round: number;
  question: string;
  matches: Array<{
    participant1: {
      id: string;
      nickname: string;
      character: string;
    };
    participant2: {
      id: string;
      nickname: string;
      character: string;
    };
  }>;
}

interface PopularityRanking {
  participant: {
    id: string;
    nickname: string;
    character: string;
    gender: "male" | "female" | "other";
  };
  selectCount: number; // 선택받은 횟수
  matchCount: number; // 매칭된 횟수
}

interface FinalResultsProps {
  roomCode: string;
  totalRounds: number;
  matchHistory: MatchHistory[];
  popularityRankings: PopularityRanking[];
  totalMatches: number;
  totalParticipants: number;
  currentUserId?: string;
  onNewGame?: () => void;
  onExportResults?: () => void;
}

export function FinalResults({
  roomCode,
  totalRounds,
  matchHistory,
  popularityRankings,
  totalMatches,
  totalParticipants,
  currentUserId,
  onNewGame,
  onExportResults,
}: FinalResultsProps) {
  const [selectedTab, setSelectedTab] = useState("summary");

  const userStats = popularityRankings.find(
    (ranking) => ranking.participant.id === currentUserId
  );

  const maleRankings = popularityRankings.filter(
    (r) => r.participant.gender === "male"
  );
  const femaleRankings = popularityRankings.filter(
    (r) => r.participant.gender === "female"
  );

  const mostPopularMale = maleRankings[0];
  const mostPopularFemale = femaleRankings[0];

  const totalMatched = matchHistory.reduce(
    (sum, round) => sum + round.matches.length,
    0
  );

  const calculateSuccessRate = () => {
    if (totalParticipants === 0) return 0;
    return Math.round((totalMatched / totalParticipants) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Trophy className="mr-2 h-5 w-5" />
          게임 완료
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">🎉 최종 결과 🎉</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {totalRounds}라운드에 걸친 러브라인 게임이 모두 끝났습니다!
          <br className="hidden sm:block" />
          함께 즐겨주셔서 감사해요.
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {totalMatched}
            </div>
            <div className="text-sm text-muted-foreground">총 매칭 커플</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {calculateSuccessRate()}%
            </div>
            <div className="text-sm text-muted-foreground">매칭 성공률</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{totalRounds}</div>
            <div className="text-sm text-muted-foreground">진행 라운드</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {totalParticipants}
            </div>
            <div className="text-sm text-muted-foreground">참가자 수</div>
          </CardContent>
        </Card>
      </div>

      {/* User's Personal Results */}
      {userStats && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              나의 게임 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {userStats.selectCount}
                </div>
                <div className="text-sm text-muted-foreground">받은 선택</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {userStats.matchCount}
                </div>
                <div className="text-sm text-muted-foreground">성공 매칭</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl">
                  {userStats.participant.character}
                </div>
                <div className="text-sm font-medium">
                  {userStats.participant.nickname}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">게임 요약</TabsTrigger>
          <TabsTrigger value="popularity">인기 순위</TabsTrigger>
          <TabsTrigger value="history">매칭 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* Winners */}
          <div className="grid md:grid-cols-2 gap-6">
            {mostPopularMale && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Crown className="h-5 w-5" />
                    인기왕 👑
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-4xl">
                    {mostPopularMale.participant.character}
                  </div>
                  <div className="font-semibold text-lg">
                    {mostPopularMale.participant.nickname}
                  </div>
                  <div className="space-y-1">
                    <Badge className="bg-blue-600">
                      {mostPopularMale.selectCount}번 선택받음
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {mostPopularMale.matchCount}번 매칭 성공
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {mostPopularFemale && (
              <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    <Crown className="h-5 w-5" />
                    인기퀸 👑
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-4xl">
                    {mostPopularFemale.participant.character}
                  </div>
                  <div className="font-semibold text-lg">
                    {mostPopularFemale.participant.nickname}
                  </div>
                  <div className="space-y-1">
                    <Badge className="bg-pink-600">
                      {mostPopularFemale.selectCount}번 선택받음
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {mostPopularFemale.matchCount}번 매칭 성공
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fun Facts */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 재미있는 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p>
                    🔥 가장 활발했던 라운드: 라운드{" "}
                    {matchHistory.findIndex(
                      (h) =>
                        h.matches.length ===
                        Math.max(...matchHistory.map((h) => h.matches.length))
                    ) + 1}
                  </p>
                  <p>
                    💕 최고 매칭 수:{" "}
                    {Math.max(...matchHistory.map((h) => h.matches.length))}커플
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    📊 평균 매칭률:{" "}
                    {Math.round((totalMatched / totalRounds) * 100) / 100}
                    커플/라운드
                  </p>
                  <p>🎉 성공률: {calculateSuccessRate()}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popularity" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Male Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">
                  👨 남성 인기 순위
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {maleRankings.slice(0, 5).map((ranking, index) => (
                  <div
                    key={ranking.participant.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index === 0
                        ? "bg-yellow-100 border border-yellow-300"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="text-lg font-bold">#{index + 1}</div>
                    <div className="text-xl">
                      {ranking.participant.character}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {ranking.participant.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ranking.selectCount}번 선택 • {ranking.matchCount}번
                        매칭
                      </div>
                    </div>
                    {index === 0 && (
                      <Crown className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Female Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-pink-700">
                  👩 여성 인기 순위
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {femaleRankings.slice(0, 5).map((ranking, index) => (
                  <div
                    key={ranking.participant.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index === 0
                        ? "bg-pink-100 border border-pink-300"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="text-lg font-bold">#{index + 1}</div>
                    <div className="text-xl">
                      {ranking.participant.character}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {ranking.participant.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ranking.selectCount}번 선택 • {ranking.matchCount}번
                        매칭
                      </div>
                    </div>
                    {index === 0 && <Crown className="h-5 w-5 text-pink-600" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {matchHistory.map((round, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  라운드 {round.round}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {round.question}
                </div>
              </CardHeader>
              <CardContent>
                {round.matches.length > 0 ? (
                  <div className="space-y-2">
                    {round.matches.map((match, matchIndex) => (
                      <div
                        key={matchIndex}
                        className="flex items-center justify-center gap-4 p-3 bg-pink-50 rounded-lg"
                      >
                        <div className="text-center">
                          <div className="text-lg">
                            {match.participant1.character}
                          </div>
                          <div className="text-sm font-medium">
                            {match.participant1.nickname}
                          </div>
                        </div>
                        <Heart className="h-4 w-4 text-red-500" />
                        <div className="text-center">
                          <div className="text-lg">
                            {match.participant2.character}
                          </div>
                          <div className="text-sm font-medium">
                            {match.participant2.nickname}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    이번 라운드에는 매칭이 없었습니다
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onNewGame} size="lg" className="flex-1 max-w-xs">
          <Play className="mr-2 h-5 w-5" />새 게임 시작
        </Button>

        <Button
          onClick={onExportResults}
          variant="outline"
          size="lg"
          className="flex-1 max-w-xs"
        >
          <Download className="mr-2 h-5 w-5" />
          결과 저장
        </Button>

        <Button asChild variant="outline" size="lg" className="flex-1 max-w-xs">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            홈으로
          </Link>
        </Button>
      </div>

      {/* Thank You Message */}
      <Card className="border-primary bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="text-center p-8">
          <div className="space-y-4">
            <div className="text-2xl">🎉 수고하셨습니다! 🎉</div>
            <p className="text-lg font-medium">
              러브라인 게임을 함께 즐겨주셔서 감사합니다
            </p>
            <p className="text-muted-foreground">
              새로운 인연과 추억을 만들 수 있는 시간이 되었기를 바라요!
            </p>
            <div className="text-sm text-muted-foreground">
              방 코드: <span className="font-mono font-bold">{roomCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
