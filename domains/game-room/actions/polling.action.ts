"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, participants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getRoomWithParticipants(roomCode: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    // Get room data
    const room = await db.rls((tx) =>
      tx
        .select({
          id: gameRooms.id,
          code: gameRooms.code,
          status: gameRooms.status,
          maxParticipants: gameRooms.maxParticipants,
          totalRounds: gameRooms.totalRounds,
          hostId: gameRooms.hostId,
          lastActivityAt: gameRooms.lastActivityAt,
          createdAt: gameRooms.createdAt,
          updatedAt: gameRooms.updatedAt,
        })
        .from(gameRooms)
        .where(eq(gameRooms.code, roomCode))
    );

    if (room.length === 0) {
      return {
        success: false,
        error: "Room not found",
        data: null,
      };
    }

    // Get participants data
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
        .where(eq(participants.gameRoomId, room[0].id))
    );

    return {
      success: true,
      error: null,
      data: {
        room: room[0],
        participants: participantsList,
      },
    };
  } catch (error) {
    console.error("Error fetching room with participants:", error);
    return {
      success: false,
      error: "Failed to fetch room data",
      data: null,
    };
  }
}

export async function checkRoomChanges(roomCode: string, lastUpdate: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const room = await db.rls((tx) =>
      tx
        .select({
          id: gameRooms.id,
          updatedAt: gameRooms.updatedAt,
          lastActivityAt: gameRooms.lastActivityAt,
        })
        .from(gameRooms)
        .where(eq(gameRooms.code, roomCode))
    );

    if (room.length === 0) {
      return {
        success: false,
        error: "Room not found",
        data: null,
      };
    }

    const lastUpdateDate = new Date(lastUpdate);
    const roomUpdateDate = new Date(room[0].updatedAt);
    const lastActivityDate = room[0].lastActivityAt
      ? new Date(room[0].lastActivityAt)
      : null;

    // Check if room has been updated since last poll
    const hasRoomChanges = roomUpdateDate > lastUpdateDate;
    const hasActivityChanges =
      lastActivityDate && lastActivityDate > lastUpdateDate;

    // Check if participants have changed
    const participantsList = await db.rls((tx) =>
      tx
        .select({
          id: participants.id,
          updatedAt: participants.updatedAt,
          lastSeenAt: participants.lastSeenAt,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, room[0].id))
    );

    const hasParticipantChanges = participantsList.some(
      (participant) =>
        new Date(participant.updatedAt) > lastUpdateDate ||
        (participant.lastSeenAt &&
          new Date(participant.lastSeenAt) > lastUpdateDate)
    );

    const hasChanges =
      hasRoomChanges || hasActivityChanges || hasParticipantChanges;

    return {
      success: true,
      error: null,
      data: {
        hasChanges,
        lastChecked: new Date().toISOString(),
        changeDetails: {
          room: hasRoomChanges,
          activity: hasActivityChanges,
          participants: hasParticipantChanges,
        },
      },
    };
  } catch (error) {
    console.error("Error checking room changes:", error);
    return {
      success: false,
      error: "Failed to check room changes",
      data: null,
    };
  }
}
