"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { transferHostSchema, type TransferHostInput } from "../schemas";
import { eq, and, ne } from "drizzle-orm";

export async function leaveGameRoom(
  gameRoomId: string,
  participantId: string,
  isTemporary: boolean = false
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const db = await createDrizzleSupabaseClient();
    
    const result = await db.rls(async (tx) => {
      // 참가자 존재 확인
      const [participant] = await tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.id, participantId),
            eq(participants.gameRoomId, gameRoomId)
          )
        )
        .limit(1);
      
      if (!participant) {
        throw new Error("참가자를 찾을 수 없습니다.");
      }
      
      // 게임방 정보 조회
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);
      
      if (!gameRoom) {
        throw new Error("존재하지 않는 게임방입니다.");
      }
      
      if (isTemporary) {
        // 임시 퇴장 (상태만 변경)
        const [updatedParticipant] = await tx
          .update(participants)
          .set({
            status: "joined", // 임시 퇴장 시 joined로 변경
            updatedAt: new Date(),
          })
          .where(eq(participants.id, participantId))
          .returning();
        
        return {
          type: "temporary_leave",
          participant: updatedParticipant,
          gameRoom,
        };
      } else {
        // 완전 퇴장
        await tx
          .delete(participants)
          .where(eq(participants.id, participantId));
        
        // 나머지 참가자 수 확인
        const remainingParticipants = await tx
          .select()
          .from(participants)
          .where(eq(participants.gameRoomId, gameRoomId));
        
        // 호스트가 나갔고 다른 참가자가 있는 경우 호스트 권한 이양
        if (gameRoom.hostId === participant.userId && remainingParticipants.length > 0) {
          const newHost = remainingParticipants[0];
          await tx
            .update(gameRooms)
            .set({
              hostId: newHost.userId,
              updatedAt: new Date(),
            })
            .where(eq(gameRooms.id, gameRoomId));
        }
        
        // 모든 참가자가 나간 경우 방 삭제
        if (remainingParticipants.length === 0) {
          await tx
            .update(gameRooms)
            .set({
              status: "cancelled",
              updatedAt: new Date(),
            })
            .where(eq(gameRooms.id, gameRoomId));
        }
        
        return {
          type: "complete_leave",
          remainingParticipants: remainingParticipants.length,
          newHostId: remainingParticipants.length > 0 ? remainingParticipants[0].userId : null,
          gameRoom,
        };
      }
    });
    
    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error("게임방 나가기 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "게임방 나가기 중 오류가 발생했습니다.",
    };
  }
}

export async function transferHost(
  gameRoomId: string,
  prevState: any,
  input: TransferHostInput
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // 입력값 검증
    const validatedInput = transferHostSchema.parse(input);
    
    const db = await createDrizzleSupabaseClient();
    
    const result = await db.rls(async (tx) => {
      // 게임방 존재 확인
      const [gameRoom] = await tx
        .select()
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);
      
      if (!gameRoom) {
        throw new Error("존재하지 않는 게임방입니다.");
      }
      
      // 새로운 호스트 참가자 존재 확인
      const [newHostParticipant] = await tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.id, validatedInput.newHostParticipantId),
            eq(participants.gameRoomId, gameRoomId)
          )
        )
        .limit(1);
      
      if (!newHostParticipant) {
        throw new Error("새로운 호스트로 지정할 참가자를 찾을 수 없습니다.");
      }
      
      if (!newHostParticipant.userId) {
        throw new Error("익명 참가자는 호스트가 될 수 없습니다.");
      }
      
      // 호스트 권한 이양
      const [updatedRoom] = await tx
        .update(gameRooms)
        .set({
          hostId: newHostParticipant.userId,
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.id, gameRoomId))
        .returning();
      
      return {
        gameRoom: updatedRoom,
        newHost: newHostParticipant,
      };
    });
    
    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error("호스트 권한 이양 실패:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "호스트 권한 이양 중 오류가 발생했습니다.",
    };
  }
}