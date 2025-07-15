"use server";

import { eq, and } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, rounds } from "@/db/schema";
import {
  startTimerSchema,
  timerControlSchema,
  getRemainingTimeSchema,
  getDefaultDuration,
  calculateRemainingTime,
  shouldShowWarning,
  TIMER_DURATIONS,
  type StartTimerInput,
  type TimerControlInput,
  type GetRemainingTimeInput,
  type TimerStatusOutput,
  type TimeWarningOutput,
  type TimerPhase,
} from "../schemas";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | Record<string, string[]>;
};

// In-memory timer state (for production, consider using Redis or similar)
const timerStates = new Map<
  string,
  {
    roundId: string;
    phase: TimerPhase;
    startedAt: Date;
    duration: number;
    isPaused: boolean;
    pausedAt?: Date;
    totalPausedTime: number;
  }
>();

export async function startTimer(
  input: StartTimerInput
): Promise<ActionResult<TimerStatusOutput>> {
  try {
    // Validate input
    const validatedInput = startTimerSchema.parse(input);
    const { roundId, gameRoomId, phase, duration } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Verify round exists and is active
      const round = await tx
        .select({ id: rounds.id, status: rounds.status })
        .from(rounds)
        .where(and(eq(rounds.id, roundId), eq(rounds.gameRoomId, gameRoomId)))
        .limit(1);

      if (!round.length) {
        return { success: false, error: "Round not found" };
      }

      if (round[0].status !== "active") {
        return { success: false, error: "Round is not active" };
      }

      // Set timer duration
      const timerDuration = duration ?? getDefaultDuration(phase);
      const startedAt = new Date();

      // Store timer state
      const timerKey = `${roundId}-${phase}`;
      timerStates.set(timerKey, {
        roundId,
        phase,
        startedAt,
        duration: timerDuration,
        isPaused: false,
        totalPausedTime: 0,
      });

      const timerStatus: TimerStatusOutput = {
        roundId,
        phase,
        state: "running",
        remainingTime: timerDuration,
        totalDuration: timerDuration,
        startedAt,
      };

      return { success: true, data: timerStatus };
    });
  } catch (error) {
    console.error("Error starting timer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start timer",
    };
  }
}

export async function getRemainingTime(
  input: GetRemainingTimeInput
): Promise<ActionResult<TimerStatusOutput | null>> {
  try {
    // Validate input
    const validatedInput = getRemainingTimeSchema.parse(input);
    const { roundId, phase } = validatedInput;

    // If phase is not specified, try to find any active timer for this round
    let timerKey: string | undefined;
    let timerState:
      | (typeof timerStates extends Map<string, infer V> ? V : never)
      | undefined;

    if (phase) {
      timerKey = `${roundId}-${phase}`;
      timerState = timerStates.get(timerKey);
    } else {
      // Find any timer for this round
      const foundEntry = Array.from(timerStates.entries()).find(([key]) =>
        key.startsWith(`${roundId}-`)
      );
      if (foundEntry) {
        [timerKey, timerState] = foundEntry;
      }
    }

    if (!timerState) {
      return { success: true, data: null };
    }

    let remainingTime: number;

    if (timerState.isPaused) {
      // If paused, calculate time remaining when paused
      const timeElapsedBeforePause = timerState.pausedAt
        ? Math.floor(
            (timerState.pausedAt.getTime() - timerState.startedAt.getTime()) /
              1000
          )
        : 0;
      remainingTime = Math.max(
        0,
        timerState.duration -
          timeElapsedBeforePause -
          timerState.totalPausedTime
      );
    } else {
      remainingTime =
        calculateRemainingTime(timerState.startedAt, timerState.duration) -
        timerState.totalPausedTime;
    }

    const timerStatus: TimerStatusOutput = {
      roundId: timerState.roundId,
      phase: timerState.phase,
      state: timerState.isPaused
        ? "paused"
        : remainingTime <= 0
        ? "expired"
        : "running",
      remainingTime: Math.max(0, remainingTime),
      totalDuration: timerState.duration,
      startedAt: timerState.startedAt,
    };

    return { success: true, data: timerStatus };
  } catch (error) {
    console.error("Error getting remaining time:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get remaining time",
    };
  }
}

export async function controlTimer(
  input: TimerControlInput
): Promise<ActionResult<TimerStatusOutput | null>> {
  try {
    // Validate input
    const validatedInput = timerControlSchema.parse(input);
    const { roundId, gameRoomId, action } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Find active timer for this round
      const timerEntry = Array.from(timerStates.entries()).find(([key]) =>
        key.startsWith(`${roundId}-`)
      );

      if (!timerEntry && action !== "start") {
        return { success: false, error: "No active timer found" };
      }

      const [timerKey, timerState] = timerEntry || [null, null];

      switch (action) {
        case "pause":
          if (timerState && !timerState.isPaused) {
            timerState.isPaused = true;
            timerState.pausedAt = new Date();
          }
          break;

        case "resume":
          if (timerState && timerState.isPaused) {
            if (timerState.pausedAt) {
              const pauseDuration = Math.floor(
                (Date.now() - timerState.pausedAt.getTime()) / 1000
              );
              timerState.totalPausedTime += pauseDuration;
            }
            timerState.isPaused = false;
            timerState.pausedAt = undefined;
          }
          break;

        case "stop":
        case "reset":
          if (timerKey) {
            timerStates.delete(timerKey);
          }
          return { success: true, data: null };

        default:
          return { success: false, error: "Invalid timer action" };
      }

      // Return current timer status
      if (timerState) {
        const remainingTimeResult = await getRemainingTime({ roundId });
        return remainingTimeResult;
      }

      return { success: true, data: null };
    });
  } catch (error) {
    console.error("Error controlling timer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to control timer",
    };
  }
}

export async function checkTimeWarning(
  roundId: string
): Promise<ActionResult<TimeWarningOutput | null>> {
  try {
    // Get current timer status
    const statusResult = await getRemainingTime({ roundId });

    if (!statusResult.success || !statusResult.data) {
      return { success: true, data: null };
    }

    const timerStatus = statusResult.data;
    const warningLevel = shouldShowWarning(timerStatus.remainingTime);

    if (!warningLevel) {
      return { success: true, data: null };
    }

    const timeWarning: TimeWarningOutput = {
      roundId,
      phase: timerStatus.phase,
      remainingTime: timerStatus.remainingTime,
      warningLevel,
    };

    return { success: true, data: timeWarning };
  } catch (error) {
    console.error("Error checking time warning:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to check time warning",
    };
  }
}

export async function handleTimeOut(roundId: string): Promise<ActionResult> {
  try {
    // Get current timer status
    const statusResult = await getRemainingTime({ roundId });

    if (!statusResult.success || !statusResult.data) {
      return { success: false, error: "No active timer found" };
    }

    const timerStatus = statusResult.data;

    if (timerStatus.remainingTime > 0) {
      return { success: false, error: "Timer has not expired yet" };
    }

    // Clean up timer state
    const timerKey = `${roundId}-${timerStatus.phase}`;
    timerStates.delete(timerKey);

    // Timer has expired - this would trigger the next phase or round completion
    // The actual phase transition logic should be handled by the calling code

    return { success: true };
  } catch (error) {
    console.error("Error handling timeout:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to handle timeout",
    };
  }
}

export async function clearAllTimers(
  gameRoomId: string
): Promise<ActionResult> {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Get all rounds for this game room
      const gameRounds = await tx
        .select({ id: rounds.id })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId));

      // Clear all timers for this game room
      for (const round of gameRounds) {
        const freeTimeKey = `${round.id}-free_time`;
        const selectionKey = `${round.id}-selection`;
        timerStates.delete(freeTimeKey);
        timerStates.delete(selectionKey);
      }

      return { success: true };
    });
  } catch (error) {
    console.error("Error clearing all timers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear timers",
    };
  }
}
