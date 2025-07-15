"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, Clock, Heart, MessageSquare, Users, X } from "lucide-react";

interface SelectionTimeProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  duration: number; // 초 단위 (기본 60초 = 1분)
  question: {
    id: string;
    content: string;
    category: string;
  };
  participants: Array<{
    id: string;
    nickname: string;
    character: string;
    gender: "male" | "female" | "other";
    status: string;
  }>;
  currentUserId?: string;
  onSelectionSubmit?: (data: { selectedId: string; message: string }) => void;
  onPassRound?: () => void;
  onTimeUp?: () => void;
}

export function SelectionTime({
  roomCode,
  currentRound,
  totalRounds,
  duration = 60,
  question,
  participants,
  currentUserId,
  onSelectionSubmit,
  onPassRound,
  onTimeUp,
}: SelectionTimeProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }

        // 15초 남았을 때 경고 표시
        if (prev === 16) {
          setShowWarning(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 15) return "text-destructive";
    if (timeLeft <= 30) return "text-orange-500";
    return "text-primary";
  };

  const getProgressValue = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const selectableParticipants = participants.filter(
    (p) =>
      p.id !== currentUserId &&
      p.status !== "left" &&
      p.status !== "temporarily_away"
  );

  const maleParticipants = selectableParticipants.filter(
    (p) => p.gender === "male"
  );
  const femaleParticipants = selectableParticipants.filter(
    (p) => p.gender === "female"
  );

  const handleSubmitSelection = () => {
    if (!selectedParticipant) return;

    onSelectionSubmit?.({
      selectedId: selectedParticipant,
      message: message.trim(),
    });
    setIsSubmitted(true);
  };

  const handlePassRound = () => {
    onPassRound?.();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Target className="mr-2 h-5 w-5" />
            라운드 {currentRound} / {totalRounds}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">선택 완료!</h1>
          <p className="text-lg text-muted-foreground">
            다른 참가자들의 선택을 기다리고 있습니다...
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Heart className="h-16 w-16 text-primary animate-pulse mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              선택이 완료되었습니다
            </h3>
            <p className="text-muted-foreground text-center">
              모든 참가자가 선택을 마치면 결과를 공개합니다
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Target className="mr-2 h-5 w-5" />
          라운드 {currentRound} / {totalRounds}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">지목 시간</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          질문에 해당하는 사람을 선택하고 메시지를 함께 보내보세요!
        </p>
      </div>

      {/* Timer Section */}
      <Card
        className={`${showWarning ? "animate-pulse border-destructive" : ""}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className={`h-6 w-6 ${getTimeColor()}`} />
            <span className={`text-4xl font-mono ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgressValue()} className="h-3" />

          {showWarning && (
            <div className="text-center">
              <Badge variant="destructive" className="animate-bounce">
                ⚠️ 빠르게 선택해주세요!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            이번 라운드 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-lg md:text-xl font-semibold">
              {question.content}
            </p>
            <Badge variant="outline" className="text-xs">
              {question.category}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Participant Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          참가자 선택
        </h3>

        <div className="grid gap-6">
          {/* Male Participants */}
          {maleParticipants.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">남성 참가자</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {maleParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className={`cursor-pointer transition-all ${
                      selectedParticipant === participant.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedParticipant(participant.id)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className="text-2xl">{participant.character}</div>
                      <div className="text-sm font-medium">
                        {participant.nickname}
                      </div>
                      {selectedParticipant === participant.id && (
                        <Badge className="text-xs">선택됨</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Female Participants */}
          {femaleParticipants.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-pink-600">여성 참가자</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {femaleParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className={`cursor-pointer transition-all ${
                      selectedParticipant === participant.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedParticipant(participant.id)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className="text-2xl">{participant.character}</div>
                      <div className="text-sm font-medium">
                        {participant.nickname}
                      </div>
                      {selectedParticipant === participant.id && (
                        <Badge className="text-xs">선택됨</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      {selectedParticipant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">메시지 (선택사항)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="함께 보낼 메시지를 입력하세요... (최대 100자)"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 100))}
              rows={3}
            />
            <div className="text-right text-xs text-muted-foreground">
              {message.length}/100
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleSubmitSelection}
          disabled={!selectedParticipant || timeLeft === 0}
          size="lg"
          className="flex-1 max-w-xs"
        >
          <Heart className="mr-2 h-5 w-5" />
          선택 완료
        </Button>

        <Button
          onClick={handlePassRound}
          variant="outline"
          size="lg"
          className="flex-1 max-w-xs"
        >
          <X className="mr-2 h-5 w-5" />
          이번 라운드 패스
        </Button>
      </div>

      {/* Help Text */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>팁:</strong> 메시지는 선택한 상대방에게만 전달됩니다. 상호
          지목되면 서로의 메시지를 확인할 수 있어요!
        </AlertDescription>
      </Alert>
    </div>
  );
}
