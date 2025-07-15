import { WaitingRoom } from "@/domains/game-room/components";
import { getGameRoomByCode } from "@/domains/game-room/actions/fetch.action";
import { notFound } from "next/navigation";

export default async function GameRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const result = await getGameRoomByCode(code);

  if (!result.success) {
    notFound();
  }

  const { gameRoom, participants } = result.data!;

  return (
    <div className="container mx-auto px-4 py-8">
      <WaitingRoom
        gameRoom={gameRoom}
        participants={participants}
        roomCode={code}
      />
    </div>
  );
}
