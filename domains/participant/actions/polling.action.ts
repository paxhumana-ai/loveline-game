"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { participants } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function getActiveParticipants(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const participantsList = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          gender: participants.gender,
          mbti: participants.mbti,
          character: participants.character,
          status: participants.status,
          userId: participants.userId,
          lastSeenAt: participants.lastSeenAt,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
        })
        .from(participants)
        .where(
          and(
            eq(participants.gameRoomId, gameRoomId),
            ne(participants.status, "left") // Exclude permanently left participants
          )
        )
    );

    return {
      success: true,
      error: null,
      data: participantsList,
    };
  } catch (error) {
    console.error("Error fetching active participants:", error);
    return {
      success: false,
      error: "Failed to fetch active participants",
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

export async function checkParticipantChanges(
  gameRoomId: string,
  lastUpdate: string
) {
  try {
    const db = await createDrizzleSupabaseClient();

    const participantsList = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          updatedAt: participants.updatedAt,
          lastSeenAt: participants.lastSeenAt,
          status: participants.status,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId))
    );

    const lastUpdateDate = new Date(lastUpdate);

    // Check if any participant has been updated since last poll
    const hasParticipantChanges = participantsList.some(
      (participant) =>
        new Date(participant.updatedAt) > lastUpdateDate ||
        (participant.lastSeenAt &&
          new Date(participant.lastSeenAt) > lastUpdateDate)
    );

    // Count participants by status
    const statusCount = participantsList.reduce((acc, participant) => {
      acc[participant.status] = (acc[participant.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      error: null,
      data: {
        hasChanges: hasParticipantChanges,
        lastChecked: new Date().toISOString(),
        participantCount: participantsList.length,
        statusCount,
        changeDetails: {
          participants: hasParticipantChanges,
        },
      },
    };
  } catch (error) {
    console.error("Error checking participant changes:", error);
    return {
      success: false,
      error: "Failed to check participant changes",
      data: null,
    };
  }
}
