"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  participantProfileSchema,
  type ParticipantProfileInput,
  characterSelectionSchema,
  type CharacterSelectionInput,
  mbtiSelectionSchema,
  type MbtiSelectionInput,
} from "../schemas";

export async function createParticipant(
  profileData: ParticipantProfileInput,
  characterData: CharacterSelectionInput,
  mbtiData: MbtiSelectionInput
) {
  try {
    // Validate input data
    const validatedProfile = participantProfileSchema.parse(profileData);
    const validatedCharacter = characterSelectionSchema.parse(characterData);
    const validatedMbti = mbtiSelectionSchema.parse(mbtiData);

    const db = await createDrizzleSupabaseClient();

    // Check if nickname is already taken in the room
    const isNicknameAvailable = await validateNickname(
      validatedProfile.nickname,
      validatedProfile.gameRoomId
    );

    if (!isNicknameAvailable.success) {
      return {
        success: false,
        error: isNicknameAvailable.error,
      };
    }

    // Check if character is already taken in the room
    const existingCharacter = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, validatedProfile.gameRoomId),
            eq(participants.character, validatedCharacter.character)
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

    // Create participant
    const newParticipant = await db.rls((tx) =>
      tx
        .insert(participants)
        .values({
          gameRoomId: validatedProfile.gameRoomId,
          nickname: validatedProfile.nickname,
          gender: validatedProfile.gender,
          character: validatedCharacter.character,
          mbti: validatedMbti.mbti,
        })
        .returning()
    );

    return {
      success: true,
      data: newParticipant[0],
    };
  } catch (error) {
    console.error("Error creating participant:", error);
    return {
      success: false,
      error: "참가자 생성 중 오류가 발생했습니다.",
    };
  }
}

export async function validateNickname(nickname: string, gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const existingParticipant = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoomId),
            eq(participants.nickname, nickname)
          )
        )
        .limit(1)
    );

    if (existingParticipant.length > 0) {
      return {
        success: false,
        error: "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.",
      };
    }

    return {
      success: true,
      message: "사용 가능한 닉네임입니다.",
    };
  } catch (error) {
    console.error("Error validating nickname:", error);
    return {
      success: false,
      error: "닉네임 중복 확인 중 오류가 발생했습니다.",
    };
  }
}
