import { JoinRoomForm } from "@/domains/game-room/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Info, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function JoinRoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <UserPlus className="mr-2 h-4 w-4" />
              참가자 설정
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">게임방 참가</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              방 코드를 입력하고 프로필을 설정하여 러브라인 게임에 참가하세요.
              <br className="hidden sm:block" />
              익명으로 안전하게 즐길 수 있어요.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Join Info & Tips */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    참가 방법
                  </CardTitle>
                  <CardDescription>
                    게임방 참가를 위한 단계별 가이드
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">방 코드 입력</p>
                        <p className="text-muted-foreground">
                          호스트에게 받은 6자리 코드
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">프로필 설정</p>
                        <p className="text-muted-foreground">
                          닉네임, 성별, MBTI, 캐릭터
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">게임방 입장</p>
                        <p className="text-muted-foreground">
                          대기실에서 게임 시작 대기
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    개인정보 보호
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>
                      🔒 <strong>익명성 보장</strong>
                    </p>
                    <p className="text-muted-foreground">
                      동물 캐릭터로 익명 참여하며, 개인정보는 수집하지 않습니다.
                    </p>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      🗑️ <strong>자동 삭제</strong>
                    </p>
                    <p className="text-muted-foreground">
                      게임 종료 후 모든 데이터는 자동으로 삭제됩니다.
                    </p>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      🔄 <strong>자유로운 참여</strong>
                    </p>
                    <p className="text-muted-foreground">
                      언제든지 게임을 나갈 수 있어요.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    프로필 팁
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>닉네임:</strong> 본명 대신 재미있는 별명을
                      사용해보세요!
                    </p>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>MBTI:</strong> 모르시면 대략적인 성향으로
                      선택하셔도 OK!
                    </p>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>캐릭터:</strong> 마음에 드는 동물을 선택하세요.
                      중복 불가!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Join Room Form */}
            <div className="lg:col-span-2 space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>방 코드를 모르시나요?</strong> 게임 호스트에게 6자리
                  방 코드를 요청하세요. 방 코드는 게임방 생성 시 자동으로
                  만들어집니다.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    게임방 참가 정보
                  </CardTitle>
                  <CardDescription>
                    방 코드와 참가자 프로필을 입력해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JoinRoomForm />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="outline">
                <Link href="/">← 홈으로 돌아가기</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                또는{" "}
                <Link
                  href="/create-room"
                  className="text-primary hover:underline"
                >
                  새 게임방 만들기
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
