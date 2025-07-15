"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { roomSettingsSchema, type RoomSettingsInput } from "../schemas";
import { eq, and } from "drizzle-orm";

export async function updateGameRoomSettings(
  gameRoomId: string,
  prevState: any,
  input: RoomSettingsInput
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // 입력값 검증
    const validatedInput = roomSettingsSchema.parse(input);
    
    const db = await createDrizzleSupabaseClient();
    
    const result = await db.rls(async (tx) => {
      // 방 존재 및 호스트 권한 확인
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);
      
      if (!gameRoom) {
        throw new Error("존재하지 않는 게임방입니다.");
      }
      
      if (gameRoom.status !== "waiting") {
        throw new Error("대기 중인 방만 설정을 변경할 수 있습니다.");
      }
      
      // 현재 참가자 수 확인 (정원 축소 시)
      if (validatedInput.maxParticipants) {
        const participantCount = await tx
          .select({
            total: participants.id,
          })
          .from(participants)
          .where(eq(participants.gameRoomId, gameRoom.id));
        
        if (participantCount.length > validatedInput.maxParticipants) {
          throw new Error("현재 참가자 수보다 적은 정원으로 변경할 수 없습니다.");
        }
      }
      
      // 방 설정 업데이트
      const updateData: Partial<typeof gameRooms.$inferInsert> = {};
      
      if (validatedInput.maxParticipants !== undefined) {
        updateData.maxParticipants = validatedInput.maxParticipants;
      }
      
      if (validatedInput.totalRounds !== undefined) {
        updateData.totalRounds = validatedInput.totalRounds;
      }
      
      updateData.updatedAt = new Date();
      
      const [updatedRoom] = await tx
        .update(gameRooms)
        .set(updateData)
        .where(eq(gameRooms.id, gameRoomId))
        .returning();
      
      return updatedRoom;
    });
    
    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error("게임방 설정 업데이트 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "게임방 설정 업데이트 중 오류가 발생했습니다.",
    };
  }
}

export async function startGame(
  gameRoomId: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const db = await createDrizzleSupabaseClient();
    
    const result = await db.rls(async (tx) => {
      // 방 상태 확인
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);
      
      if (!gameRoom) {
        throw new Error("존재하지 않는 게임방입니다.");
      }
      
      if (gameRoom.status !== "waiting") {
        throw new Error("대기 중인 방만 게임을 시작할 수 있습니다.");
      }
      
      // 참가자 상태 확인
      const participantList = await tx
        .select()
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoom.id));
      
      if (participantList.length < 2) {
        throw new Error("최소 2명의 참가자가 필요합니다.");
      }
      
      const notReadyParticipants = participantList.filter(p => p.status !== "ready");
      if (notReadyParticipants.length > 0) {
        throw new Error("모든 참가자가 준비 완료 상태여야 합니다.");
      }
      
      // 게임 상태를 진행 중으로 변경
      const [updatedRoom] = await tx
        .update(gameRooms)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.id, gameRoomId))
        .returning();
      
      // 모든 참가자 상태를 playing으로 변경
      await tx
        .update(participants)
        .set({
          status: "playing",
          updatedAt: new Date(),
        })
        .where(eq(participants.gameRoomId, gameRoom.id));
      
      return updatedRoom;
    });
    
    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error("게임 시작 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "게임 시작 중 오류가 발생했습니다.",
    };
  }
}

export async function updateParticipantStatus(
  participantId: string,
  status: "joined" | "ready" | "playing" | "finished"
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const db = await createDrizzleSupabaseClient();
    
    const result = await db.rls(async (tx) => {
      const [updatedParticipant] = await tx
        .update(participants)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId))
        .returning();
      
      if (!updatedParticipant) {
        throw new Error("참가자를 찾을 수 없습니다.");
      }
      
      return updatedParticipant;
    });
    
    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error("참가자 상태 업데이트 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "참가자 상태 업데이트 중 오류가 발생했습니다.",
    };
  }
}