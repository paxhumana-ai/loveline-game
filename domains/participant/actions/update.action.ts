"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import {
  participantProfileUpdateSchema,
  type ParticipantProfileUpdateInput,
  characterUpdateSchema,
  type CharacterUpdateInput,
  participantStatusUpdateSchema,
  type ParticipantStatusUpdateInput,
} from "../schemas";

export async function updateParticipantProfile(
  participantId: string,
  profileData: ParticipantProfileUpdateInput
) {
  try {
    const validatedProfile = participantProfileUpdateSchema.parse(profileData);
    const db = await createDrizzleSupabaseClient();

    // Get current participant info
    const currentParticipant = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1)
    );

    if (currentParticipant.length === 0) {
      return {
        success: false,
        error: "참가자를 찾을 수 없습니다.",
      };
    }

    // Check if nickname is already taken (if nickname is being updated)
    if (validatedProfile.nickname) {
      const existingParticipant = await db.rls((tx) =>
        tx
          .select()
          .from(participants)
          .where(
            and(
              eq(participants.gameRoomId, currentParticipant[0].gameRoomId),
              eq(participants.nickname, validatedProfile.nickname),
              ne(participants.id, participantId)
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
    }

    // Update participant
    const updatedParticipant = await db.rls((tx) =>
      tx
        .update(participants)
        .set({
          ...validatedProfile,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId))
        .returning()
    );

    return {
      success: true,
      data: updatedParticipant[0],
    };
  } catch (error) {
    console.error("Error updating participant profile:", error);
    return {
      success: false,
      error: "참가자 정보 수정 중 오류가 발생했습니다.",
    };
  }
}

export async function updateParticipantStatus(
  statusData: ParticipantStatusUpdateInput
) {
  try {
    const validatedStatus = participantStatusUpdateSchema.parse(statusData);
    const db = await createDrizzleSupabaseClient();

    const updatedParticipant = await db.rls((tx) =>
      tx
        .update(participants)
        .set({
          status: validatedStatus.status,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, validatedStatus.participantId))
        .returning()
    );

    if (updatedParticipant.length === 0) {
      return {
        success: false,
        error: "참가자를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: updatedParticipant[0],
    };
  } catch (error) {
    console.error("Error updating participant status:", error);
    return {
      success: false,
      error: "참가자 상태 변경 중 오류가 발생했습니다.",
    };
  }
}

export async function updateCharacter(
  participantId: string,
  characterData: CharacterUpdateInput
) {
  try {
    const validatedCharacter = characterUpdateSchema.parse(characterData);
    const db = await createDrizzleSupabaseClient();

    // Get current participant info
    const currentParticipant = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1)
    );

    if (currentParticipant.length === 0) {
      return {
        success: false,
        error: "참가자를 찾을 수 없습니다.",
      };
    }

    // Check if character is already taken in the room
    const existingCharacter = await db.rls((tx) =>
      tx
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, currentParticipant[0].gameRoomId),
            eq(participants.character, validatedCharacter.character),
            ne(participants.id, participantId)
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

    // Update character
    const updatedParticipant = await db.rls((tx) =>
      tx
        .update(participants)
        .set({
          character: validatedCharacter.character,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId))
        .returning()
    );

    return {
      success: true,
      data: updatedParticipant[0],
    };
  } catch (error) {
    console.error("Error updating character:", error);
    return {
      success: false,
      error: "캐릭터 변경 중 오류가 발생했습니다.",
    };
  }
}
