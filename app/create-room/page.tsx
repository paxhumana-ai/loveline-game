import { CreateRoomForm } from "@/domains/game-room/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, User, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CreateRoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Users className="mr-2 h-4 w-4" />
              호스트 설정
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              게임방 만들기
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              새로운 러브라인 게임방을 만들고 친구들과 함께 즐거운 시간을
              보내세요.
              <br className="hidden sm:block" />
              게임 설정과 호스트 프로필을 한 번에 완료할 수 있어요.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Settings Info */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    게임 설정 가이드
                  </CardTitle>
                  <CardDescription>
                    최적의 게임 경험을 위한 설정 가이드
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">참가자 수</h4>
                    <p className="text-sm text-muted-foreground">
                      4-8명이 가장 적절합니다. 너무 적으면 단조롭고, 너무 많으면
                      복잡해져요.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">라운드 수</h4>
                    <p className="text-sm text-muted-foreground">
                      3-5라운드가 적당합니다. 첫 게임이라면 3라운드를 추천해요.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">호스트 역할</h4>
                    <p className="text-sm text-muted-foreground">
                      게임 시작, 라운드 관리, 분위기 메이킹을 담당하게 됩니다.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    게임 진행 순서
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">방 생성 및 대기</p>
                      <p className="text-muted-foreground">
                        참가자들이 방 코드로 입장
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">자유시간 (3분)</p>
                      <p className="text-muted-foreground">
                        오프라인에서 자유롭게 대화
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">지목시간 (1분)</p>
                      <p className="text-muted-foreground">
                        질문에 해당하는 사람 선택
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">매칭 결과</p>
                      <p className="text-muted-foreground">
                        상호 지목 시 매칭 성공!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Room Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    게임방 및 호스트 설정
                  </CardTitle>
                  <CardDescription>
                    게임 설정과 호스트 프로필을 입력해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoomForm />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/">← 홈으로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
