"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  nickname: string;
  character: string;
  gender: "male" | "female" | "other";
  mbti?: string;
}

interface ParticipantSelectorProps {
  participants: Participant[];
  currentParticipantId?: string;
  selectedParticipantId?: string;
  onParticipantSelect: (participantId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ParticipantSelector({
  participants,
  currentParticipantId,
  selectedParticipantId,
  onParticipantSelect,
  disabled = false,
  className,
}: ParticipantSelectorProps) {
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);

  // Separate participants by gender
  const maleParticipants = participants.filter(p => p.gender === "male");
  const femaleParticipants = participants.filter(p => p.gender === "female");
  const otherParticipants = participants.filter(p => p.gender === "other");

  const handleParticipantClick = (participantId: string) => {
    if (disabled || participantId === currentParticipantId) return;
    onParticipantSelect(participantId);
  };

  const renderParticipantCard = (participant: Participant) => {
    const isSelected = selectedParticipantId === participant.id;
    const isCurrentUser = currentParticipantId === participant.id;
    const isHovered = hoveredParticipant === participant.id;
    
    return (
      <Card
        key={participant.id}
        className={cn(
          "cursor-pointer transition-all duration-200 border-2",
          "hover:shadow-md hover:scale-105",
          {
            "border-primary bg-primary/10 shadow-lg scale-105": isSelected,
            "border-destructive/50 bg-destructive/5 cursor-not-allowed": isCurrentUser,
            "border-muted-foreground/20 hover:border-primary/50": !isSelected && !isCurrentUser,
            "opacity-50": disabled,
          },
          className
        )}
        onMouseEnter={() => !disabled && setHoveredParticipant(participant.id)}
        onMouseLeave={() => setHoveredParticipant(null)}
        onClick={() => handleParticipantClick(participant.id)}
      >
        <CardContent className="p-4 text-center space-y-3">
          <div className="relative">
            <Avatar className="w-16 h-16 mx-auto">
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-secondary/20">
                {participant.character.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm">✓</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-card-foreground">
              {participant.nickname}
            </h3>
            <p className="text-xs text-muted-foreground">
              {participant.character}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            <Badge 
              variant={participant.gender === "male" ? "default" : participant.gender === "female" ? "secondary" : "outline"}
              className="text-xs"
            >
              {participant.gender === "male" ? "남성" : participant.gender === "female" ? "여성" : "기타"}
            </Badge>
            {participant.mbti && (
              <Badge variant="outline" className="text-xs">
                {participant.mbti}
              </Badge>
            )}
          </div>

          {isCurrentUser && (
            <p className="text-xs text-destructive font-medium">
              본인
            </p>
          )}

          {isHovered && !isCurrentUser && !disabled && (
            <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
              <Button size="sm" variant="secondary">
                선택하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderGenderSection = (title: string, participants: Participant[], color: string) => {
    if (participants.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="text-lg font-semibold text-card-foreground">
            {title} ({participants.length}명)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {participants.map(renderParticipantCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-card-foreground">
          마음에 드는 상대를 선택하세요
        </h2>
        <p className="text-muted-foreground">
          {disabled ? "선택이 비활성화되었습니다" : "한 명을 선택하거나 패스할 수 있습니다"}
        </p>
      </div>

      {renderGenderSection("남성", maleParticipants, "bg-blue-500")}
      {renderGenderSection("여성", femaleParticipants, "bg-pink-500")}
      {renderGenderSection("기타", otherParticipants, "bg-purple-500")}

      {participants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            선택할 수 있는 참가자가 없습니다
          </p>
        </div>
      )}

      {selectedParticipantId && (
        <div className="text-center py-4 bg-primary/5 rounded-lg">
          <p className="text-primary font-medium">
            {participants.find(p => p.id === selectedParticipantId)?.nickname}님을 선택했습니다
          </p>
        </div>
      )}
    </div>
  );
}