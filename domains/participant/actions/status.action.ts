"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateParticipantStatus(
  participantId: string,
  status: "joined" | "temporarily_away" | "left"
) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedParticipant = await db.rls((tx) =>
      tx
        .update(participants)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId))
        .returning({
          id: participants.id,
          status: participants.status,
          updatedAt: participants.updatedAt,
        })
    );

    if (updatedParticipant.length === 0) {
      return {
        success: false,
        error: "Participant not found or no permission to update",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: updatedParticipant[0],
    };
  } catch (error) {
    console.error("Error updating participant status:", error);
    return {
      success: false,
      error: "Failed to update participant status",
      data: null,
    };
  }
}

export async function getParticipantStatuses(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const participantsList = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          status: participants.status,
          lastSeenAt: participants.lastSeenAt,
          updatedAt: participants.updatedAt,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
    );

    return {
      success: true,
      error: null,
      data: participantsList,
    };
  } catch (error) {
    console.error("Error fetching participant statuses:", error);
    return {
      success: false,
      error: "Failed to fetch participant statuses",
      data: null,
    };
  }
}

export async function updateLastSeen(participantId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedParticipant = await db.rls((tx) =>
      tx
        .update(participants)
        .set({
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(participants.id, participantId))
        .returning({
          id: participants.id,
          lastSeenAt: participants.lastSeenAt,
        })
    );

    if (updatedParticipant.length === 0) {
      return {
        success: false,
        error: "Participant not found or no permission to update",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: updatedParticipant[0],
    };
  } catch (error) {
    console.error("Error updating last seen:", error);
    return {
      success: false,
      error: "Failed to update last seen",
      data: null,
    };
  }
}
