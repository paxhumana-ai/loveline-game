"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getGameRoomByCode(roomCode: string): Promise<{
  success: boolean;
  data?: {
    gameRoom: typeof gameRooms.$inferSelect;
    participants: (typeof participants.$inferSelect)[];
  };
  error?: string;
}> {
  try {
    const db = await createDrizzleSupabaseClient();

    const result = await db.rls(async (tx) => {
      // 방 정보 조회
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.code, roomCode))
        .limit(1);

      if (!gameRoom) {
        throw new Error("존재하지 않는 방 코드입니다.");
      }

      // 참가자 목록 조회
      const participantList = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          gender: participants.gender,
          mbti: participants.mbti,
          character: participants.character,
          status: participants.status,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
          gameRoomId: participants.gameRoomId,
          userId: participants.userId,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoom.id));

      return {
        gameRoom,
        participants: participantList,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("게임방 조회 실패:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "게임방 조회 중 오류가 발생했습니다.",
    };
  }
}

export async function getGameRoomStatus(gameRoomId: string): Promise<{
  success: boolean;
  data?: {
    gameRoom: typeof gameRooms.$inferSelect;
    participantCount: number;
    readyCount: number;
    isFullRoom: boolean;
    canStartGame: boolean;
  };
  error?: string;
}> {
  try {
    const db = await createDrizzleSupabaseClient();

    const result = await db.rls(async (tx) => {
      // 방 상태 조회
      const [gameRoom] = await tx
        .select({
          id: gameRooms.id,
          code: gameRooms.code,
          maxParticipants: gameRooms.maxParticipants,
          totalRounds: gameRooms.totalRounds,
          hostId: gameRooms.hostId,
          status: gameRooms.status,
          createdAt: gameRooms.createdAt,
          updatedAt: gameRooms.updatedAt,
        })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom) {
        throw new Error("존재하지 않는 게임방입니다.");
      }

      // 참가자 수 조회
      const participantCount = await tx
        .select({
          total: participants.id,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoom.id));

      // 준비된 참가자 수 조회
      const readyCount = await tx
        .select({
          ready: participants.id,
        })
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoom.id),
            eq(participants.status, "ready")
          )
        );

      return {
        gameRoom,
        participantCount: participantCount.length,
        readyCount: readyCount.length,
        isFullRoom: participantCount.length >= gameRoom.maxParticipants,
        canStartGame:
          participantCount.length >= 2 &&
          readyCount.length === participantCount.length,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("게임방 상태 조회 실패:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "게임방 상태 조회 중 오류가 발생했습니다.",
    };
  }
}
