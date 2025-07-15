import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Timer, Trophy, MessageCircle, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              💕 하트시그널 스타일
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              러브라인 게임
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              오프라인 미팅과 모임에서 즐기는 <br className="hidden sm:block" />
              <span className="text-primary font-semibold">
                실시간 매칭 게임
              </span>
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link href="/create-room">
                <Users className="mr-2 h-5 w-5" />방 만들기
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              <Link href="/join-room">
                <Heart className="mr-2 h-5 w-5" />방 참가하기
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 py-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>쉬운 참여</CardTitle>
              <CardDescription>
                방 코드만 있으면 누구나 쉽게 참여할 수 있어요
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>익명 진행</CardTitle>
              <CardDescription>
                동물 캐릭터로 익명성을 보장하며 자연스러운 소통
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>실시간 매칭</CardTitle>
              <CardDescription>
                상호 지목 시 즉시 매칭되어 특별한 순간을 만들어요
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How to Play Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">게임 방법</h2>
            <p className="text-lg text-muted-foreground">
              간단한 4단계로 즐기는 러브라인 게임
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <CardTitle className="text-lg">방 생성/참가</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  방을 만들거나 코드로 참가하여 프로필을 설정해요
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <CardTitle className="text-lg">자유시간</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  3분간 자유롭게 대화하며 서로를 알아가요
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <CardTitle className="text-lg">지목시간</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  질문에 해당하는 사람을 선택하고 메시지를 보내요
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-2">
                  4
                </div>
                <CardTitle className="text-lg">매칭 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  상호 지목되면 매칭! 함께 아이스크림 산책을 즐겨요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                2-8명
              </div>
              <p className="text-muted-foreground">성별별 참가 인원</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                3-10라운드
              </div>
              <p className="text-muted-foreground">자유로운 라운드 설정</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                20가지
              </div>
              <p className="text-muted-foreground">귀여운 동물 캐릭터</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center bg-card rounded-lg border">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              지금 바로 시작해보세요!
            </h2>
            <p className="text-lg text-muted-foreground">
              친구들과 함께 특별한 추억을 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <Link href="/create-room">
                  <Users className="mr-2 h-5 w-5" />
                  게임 시작하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">러브라인 게임</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 러브라인 게임 팀. 모든 권리 보유.
            </p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                개인정보처리방침
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                이용약관
              </Link>
              <span>•</span>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
