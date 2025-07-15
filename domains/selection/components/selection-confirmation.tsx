"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, SkipForward } from "lucide-react";

interface Participant {
  id: string;
  nickname: string;
  character: string;
  gender: "male" | "female" | "other";
  mbti?: string;
}

interface SelectionConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  selectedParticipant?: Participant;
  message?: string;
  isPassed: boolean;
  roundNumber?: number;
}

export function SelectionConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  selectedParticipant,
  message,
  isPassed,
  roundNumber,
}: SelectionConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isPassed ? (
              <>
                <SkipForward className="w-5 h-5 text-warning" />
                패스 확인
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 text-primary" />
                선택 확인
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {roundNumber && `라운드 ${roundNumber}에서 `}
            {isPassed ? "패스하시겠습니까?" : "이 분을 선택하시겠습니까?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          {isPassed ? (
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="p-4 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-warning/20 rounded-full flex items-center justify-center">
                  <SkipForward className="w-8 h-8 text-warning" />
                </div>
                <div>
                  <h3 className="font-medium">라운드 패스</h3>
                  <p className="text-sm text-muted-foreground">
                    이번 라운드에서 누구도 선택하지 않습니다
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : selectedParticipant ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-secondary/20">
                      {selectedParticipant.character.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedParticipant.nickname}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedParticipant.character}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge 
                      variant={selectedParticipant.gender === "male" ? "default" : selectedParticipant.gender === "female" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {selectedParticipant.gender === "male" ? "남성" : selectedParticipant.gender === "female" ? "여성" : "기타"}
                    </Badge>
                    {selectedParticipant.mbti && (
                      <Badge variant="outline" className="text-xs">
                        {selectedParticipant.mbti}
                      </Badge>
                    )}
                  </div>
                </div>

                {message && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">메시지</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm italic">"{message}"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          {isPassed ? (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-2">패스할 경우:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>이번 라운드에서 누구도 선택하지 않습니다</li>
                <li>다른 참가자가 나를 선택해도 매칭되지 않습니다</li>
                <li>다음 라운드에서 다시 참여할 수 있습니다</li>
              </ul>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-2">선택할 경우:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>상대방도 나를 선택하면 매칭됩니다</li>
                <li>메시지는 매칭 시에만 상대방에게 전달됩니다</li>
                <li>선택 후에는 이번 라운드에서 변경할 수 없습니다</li>
              </ul>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs">
              💡 신중하게 결정하세요. 제출 후에는 변경할 수 없습니다.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isPassed ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
          >
            {isPassed ? "패스하기" : "선택하기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}