import { Card, CardContent } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="relative">
            <Heart className="h-12 w-12 text-primary animate-pulse" />
            <Loader2 className="h-6 w-6 text-primary/60 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">로딩 중...</h3>
            <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
