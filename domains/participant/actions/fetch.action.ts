"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AVAILABLE_CHARACTERS } from "../schemas";

export async function getParticipantsByRoom(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const roomParticipants = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          status: participants.status,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
          // Exclude MBTI and gender for privacy
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
        .orderBy(participants.createdAt)
    );

    return {
      success: true,
      data: roomParticipants,
    };
  } catch (error) {
    console.error("Error fetching participants by room:", error);
    return {
      success: false,
      error: "참가자 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

export async function getParticipantProfile(participantId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const participant = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1)
    );

    if (participant.length === 0) {
      return {
        success: false,
        error: "참가자를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: participant[0],
    };
  } catch (error) {
    console.error("Error fetching participant profile:", error);
    return {
      success: false,
      error: "참가자 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

export async function getAvailableCharacters(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    // Get characters already used in the room
    const usedCharacters = await db.rls((tx) =>
      tx
        .select({ character: participants.character })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
    );

    const usedCharactersList = usedCharacters.map((p) => p.character);

    // Filter available characters
    const availableCharacters = AVAILABLE_CHARACTERS.filter(
      (character) => !usedCharactersList.includes(character)
    );

    return {
      success: true,
      data: {
        available: availableCharacters,
        used: usedCharactersList,
        total: AVAILABLE_CHARACTERS.length,
      },
    };
  } catch (error) {
    console.error("Error fetching available characters:", error);
    return {
      success: false,
      error: "사용 가능한 캐릭터 조회 중 오류가 발생했습니다.",
    };
  }
}

export async function getParticipantsByRoomWithDetails(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const roomParticipants = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          gender: participants.gender,
          status: participants.status,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
        .orderBy(participants.createdAt)
    );

    // Calculate gender balance
    const genderBalance = roomParticipants.reduce((acc, participant) => {
      acc[participant.gender] = (acc[participant.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        participants: roomParticipants,
        genderBalance,
        totalCount: roomParticipants.length,
      },
    };
  } catch (error) {
    console.error("Error fetching participants with details:", error);
    return {
      success: false,
      error: "참가자 상세 정보 조회 중 오류가 발생했습니다.",
    };
  }
}
