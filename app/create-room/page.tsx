import { CreateRoomForm } from "@/domains/game-room/components";

export default async function CreateRoomPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">게임방 만들기</h1>
          <p className="text-muted-foreground mt-2">
            새로운 게임방을 만들어 친구들과 함께 플레이하세요
          </p>
        </div>
        
        <CreateRoomForm />
      </div>
    </div>
  );
}