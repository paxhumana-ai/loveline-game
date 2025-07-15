"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants, gameRooms } from "@/db/schema";
import { and, eq, count, ne } from "drizzle-orm";
import { AVAILABLE_CHARACTERS } from "../schemas";

export async function checkCharacterAvailability(
  gameRoomId: string,
  character: string,
  excludeParticipantId?: string
) {
  try {
    const db = await createDrizzleSupabaseClient();

    // Check if character is in the available list
    if (
      !AVAILABLE_CHARACTERS.includes(
        character as (typeof AVAILABLE_CHARACTERS)[number]
      )
    ) {
      return {
        success: false,
        error: "유효하지 않은 캐릭터입니다.",
      };
    }

    // Check if character is already taken in the room
    const existingCharacter = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoomId),
            eq(participants.character, character),
            excludeParticipantId
              ? ne(participants.id, excludeParticipantId)
              : undefined
          )
        )
        .limit(1)
    );

    if (existingCharacter.length > 0) {
      return {
        success: false,
        error: "이미 선택된 캐릭터입니다. 다른 캐릭터를 선택해주세요.",
      };
    }

    return {
      success: true,
      message: "사용 가능한 캐릭터입니다.",
    };
  } catch (error) {
    console.error("Error checking character availability:", error);
    return {
      success: false,
      error: "캐릭터 사용 가능 여부 확인 중 오류가 발생했습니다.",
    };
  }
}

export async function validateParticipantCapacity(
  gameRoomId: string,
  newParticipantGender: "male" | "female" | "other"
) {
  try {
    const db = await createDrizzleSupabaseClient();

    // Get game room info
    const gameRoom = await db.rls((tx) =>
      tx
        .select({ maxParticipants: gameRooms.maxParticipants })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1)
    );

    if (gameRoom.length === 0) {
      return {
        success: false,
        error: "게임방을 찾을 수 없습니다.",
      };
    }

    // Get current participants count
    const currentParticipants = await db.rls((tx) =>
      tx
        .select({
          total: count(),
          gender: participants.gender,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
        .groupBy(participants.gender)
    );

    const totalParticipants = currentParticipants.reduce(
      (sum, p) => sum + p.total,
      0
    );

    // Check if room is full
    if (totalParticipants >= gameRoom[0].maxParticipants) {
      return {
        success: false,
        error: "게임방이 가득 찼습니다.",
      };
    }

    // Calculate gender balance
    const genderCounts = currentParticipants.reduce(
      (acc, p) => {
        acc[p.gender] = p.total;
        return acc;
      },
      { male: 0, female: 0, other: 0 } as Record<string, number>
    );

    const maxParticipants = gameRoom[0].maxParticipants;
    const idealBalance = Math.ceil(maxParticipants / 2);

    // Check if adding this participant would severely imbalance the room
    if (newParticipantGender !== "other") {
      const newGenderCount = genderCounts[newParticipantGender] + 1;
      const oppositeGender =
        newParticipantGender === "male" ? "female" : "male";
      const oppositeGenderCount = genderCounts[oppositeGender];

      // Allow some imbalance but not too much
      if (
        newGenderCount > idealBalance + 1 &&
        oppositeGenderCount < idealBalance - 1
      ) {
        return {
          success: false,
          error: `성별 균형을 위해 ${
            oppositeGender === "male" ? "남성" : "여성"
          } 참가자가 더 필요합니다.`,
        };
      }
    }

    return {
      success: true,
      data: {
        currentCount: totalParticipants,
        maxParticipants: maxParticipants,
        genderBalance: genderCounts,
      },
    };
  } catch (error) {
    console.error("Error validating participant capacity:", error);
    return {
      success: false,
      error: "참가자 정원 확인 중 오류가 발생했습니다.",
    };
  }
}

export async function validateGameRoomAccess(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const gameRoom = await db.rls((tx) =>
      tx
        .select({
          id: gameRooms.id,
          status: gameRooms.status,
          maxParticipants: gameRooms.maxParticipants,
        })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1)
    );

    if (gameRoom.length === 0) {
      return {
        success: false,
        error: "게임방을 찾을 수 없습니다.",
      };
    }

    // Check if room is in waiting state (can join)
    if (gameRoom[0].status !== "waiting") {
      return {
        success: false,
        error: "진행 중이거나 종료된 게임방에는 참가할 수 없습니다.",
      };
    }

    return {
      success: true,
      data: gameRoom[0],
    };
  } catch (error) {
    console.error("Error validating game room access:", error);
    return {
      success: false,
      error: "게임방 접근 권한 확인 중 오류가 발생했습니다.",
    };
  }
}
