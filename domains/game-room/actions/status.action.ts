"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRoomStatus(roomCode: string) {
  try {
    const db = await createDrizzleSupabaseClient();

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

    return {
      success: true,
      error: null,
      data: room[0],
    };
  } catch (error) {
    console.error("Error fetching room status:", error);
    return {
      success: false,
      error: "Failed to fetch room status",
      data: null,
    };
  }
}

export async function updateLastActivity(roomCode: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedRoom = await db.rls((tx) =>
      tx
        .update(gameRooms)
        .set({
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(gameRooms.code, roomCode))
        .returning({
          id: gameRooms.id,
          lastActivityAt: gameRooms.lastActivityAt,
        })
    );

    if (updatedRoom.length === 0) {
      return {
        success: false,
        error: "Room not found or no permission to update",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: updatedRoom[0],
    };
  } catch (error) {
    console.error("Error updating last activity:", error);
    return {
      success: false,
      error: "Failed to update last activity",
      data: null,
    };
  }
}
