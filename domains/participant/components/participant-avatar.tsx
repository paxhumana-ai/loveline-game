"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ParticipantAvatarProps {
  character: string;
  nickname: string;
  status?:
    | "joined"
    | "ready"
    | "playing"
    | "temporarily_away"
    | "left"
    | "finished";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "minimal";
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const statusColors = {
  joined: "bg-blue-500",
  ready: "bg-green-500",
  playing: "bg-yellow-500",
  temporarily_away: "bg-orange-400",
  left: "bg-red-400",
  finished: "bg-gray-500",
};

const statusLabels = {
  joined: "참가",
  ready: "준비",
  playing: "게임 중",
  temporarily_away: "일시이탈",
  left: "퇴장",
  finished: "완료",
};

export default function ParticipantAvatar({
  character,
  nickname,
  status = "joined",
  size = "md",
  variant = "default",
  showStatus = true,
  className,
}: ParticipantAvatarProps) {
  const [emoji, name] = character.split(" ");

  const avatarContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarFallback className="text-lg bg-primary/10 border-2 border-primary/20">
            {emoji}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              statusColors[status]
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{nickname}</div>
        <div className="text-xs text-muted-foreground truncate">{name}</div>
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card
        className={cn("transition-all duration-200 hover:shadow-sm", className)}
      >
        <CardContent className="p-3">
          {avatarContent}
          {showStatus && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {statusLabels[status]}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="text-xl">{emoji}</div>
        <span className="font-medium">{nickname}</span>
      </div>
    );
  }

  return avatarContent;
}

export function ParticipantAvatarGroup({
  participants,
  maxDisplay = 3,
  size = "sm",
  className,
}: {
  participants: Array<{
    character: string;
    nickname: string;
    status?: "joined" | "ready" | "playing" | "finished";
  }>;
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const displayedParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {displayedParticipants.map((participant, index) => {
          const [emoji] = participant.character.split(" ");
          return (
            <div key={`${participant.nickname}-${index}`} className="relative">
              <Avatar
                className={cn(sizeClasses[size], "ring-2 ring-background")}
              >
                <AvatarFallback className="text-sm bg-primary/10 border border-primary/20">
                  {emoji}
                </AvatarFallback>
              </Avatar>
              {participant.status && (
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                    statusColors[participant.status]
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {remainingCount > 0 && (
        <div className="ml-2 text-sm text-muted-foreground">
          +{remainingCount}명 더
        </div>
      )}
    </div>
  );
}
