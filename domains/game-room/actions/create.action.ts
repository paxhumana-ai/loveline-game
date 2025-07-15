"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { createRoomSchema, type CreateRoomInput } from "../schemas";
import { generateRoomCode } from "@/utils/game-room";
import { eq } from "drizzle-orm";

export async function createGameRoom(input: CreateRoomInput): Promise<{
  success: boolean;
  data?: {
    roomCode: string;
    gameRoomId: string;
    participantId: string;
  };
  error?: string;
}> {
  try {
    // 입력값 검증
    const validatedInput = createRoomSchema.parse(input);

    const db = await createDrizzleSupabaseClient();

    // 중복되지 않는 방 코드 생성
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomCode = generateRoomCode();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error("방 코드 생성에 실패했습니다. 다시 시도해주세요.");
      }

      const existingRoom = await db.rls((tx) =>
        tx.select().from(gameRooms).where(eq(gameRooms.code, roomCode)).limit(1)
      );

      if (existingRoom.length === 0) break;
    } while (true);

    // 게임방 생성 및 호스트 참가자 등록을 트랜잭션으로 처리
    const result = await db.rls(async (tx) => {
      // 게임방 생성
      const [gameRoom] = await tx
        .insert(gameRooms)
        .values({
          code: roomCode,
          maxParticipants: validatedInput.maxParticipants,
          totalRounds: validatedInput.totalRounds,
          hostId: null, // RLS에서 자동으로 auth.uid() 설정됨
          status: "waiting",
        })
        .returning();

      // 호스트를 첫 번째 참가자로 등록
      const [participant] = await tx
        .insert(participants)
        .values({
          gameRoomId: gameRoom.id,
          nickname: validatedInput.hostNickname,
          gender: validatedInput.hostGender,
          mbti: validatedInput.hostMbti,
          character: validatedInput.hostCharacter,
          status: "joined",
          userId: null, // RLS에서 자동으로 auth.uid() 설정됨
        })
        .returning();

      return { gameRoom, participant };
    });

    return {
      success: true,
      data: {
        roomCode: result.gameRoom.code,
        gameRoomId: result.gameRoom.id,
        participantId: result.participant.id,
      },
    };
  } catch (error) {
    console.error("게임방 생성 실패:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "게임방 생성 중 오류가 발생했습니다.",
    };
  }
}
