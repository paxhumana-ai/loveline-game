import { JoinRoomForm } from "@/domains/game-room/components";

export default async function JoinRoomPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">게임방 참가</h1>
          <p className="text-muted-foreground mt-2">
            방 코드를 입력하고 프로필을 설정하여 게임에 참가하세요
          </p>
        </div>
        
        <JoinRoomForm />
      </div>
    </div>
  );
}