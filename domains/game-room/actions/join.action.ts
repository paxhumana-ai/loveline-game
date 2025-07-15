"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { joinRoomSchema, type JoinRoomInput } from "../schemas";
import { eq, and, count } from "drizzle-orm";

export async function joinGameRoom(
  prevState: any,
  input: JoinRoomInput
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // 입력값 검증
    const validatedInput = joinRoomSchema.parse(input);
    
    const db = await createDrizzleSupabaseClient();
    
    // 트랜잭션으로 방 확인 및 참가자 등록
    const result = await db.rls(async (tx) => {
      // 방 존재 확인
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.code, validatedInput.code))
        .limit(1);
      
      if (!gameRoom) {
        throw new Error("존재하지 않는 방 코드입니다.");
      }
      
      if (gameRoom.status !== "waiting") {
        throw new Error("이미 진행 중이거나 종료된 방입니다.");
      }
      
      // 현재 참가자 수 확인
      const [participantCount] = await tx
        .select({ count: count() })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoom.id));
      
      if (participantCount.count >= gameRoom.maxParticipants) {
        throw new Error("방이 가득 찼습니다.");
      }
      
      // 캐릭터 중복 확인
      const existingCharacter = await tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoom.id),
            eq(participants.character, validatedInput.character)
          )
        )
        .limit(1);
      
      if (existingCharacter.length > 0) {
        throw new Error("이미 선택된 캐릭터입니다. 다른 캐릭터를 선택해주세요.");
      }
      
      // 닉네임 중복 확인
      const existingNickname = await tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoom.id),
            eq(participants.nickname, validatedInput.nickname)
          )
        )
        .limit(1);
      
      if (existingNickname.length > 0) {
        throw new Error("이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.");
      }
      
      // 참가자 등록
      const [participant] = await tx.insert(participants).values({
        gameRoomId: gameRoom.id,
        nickname: validatedInput.nickname,
        gender: validatedInput.gender,
        mbti: validatedInput.mbti,
        character: validatedInput.character,
        status: "joined",
        userId: null, // RLS에서 자동으로 auth.uid() 설정됨
      }).returning();
      
      return { gameRoom, participant };
    });
    
    return {
      success: true,
      data: {
        gameRoomId: result.gameRoom.id,
        participantId: result.participant.id,
        roomCode: result.gameRoom.code,
      },
    };
    
  } catch (error) {
    console.error("게임방 참가 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "게임방 참가 중 오류가 발생했습니다.",
    };
  }
}