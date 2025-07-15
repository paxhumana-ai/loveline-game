import { z } from "zod";

// Timer duration constants (in seconds)
export const TIMER_DURATIONS = {
  FREE_TIME: 180, // 3 minutes
  SELECTION_TIME: 120, // 2 minutes
  WARNING_THRESHOLD_1: 30, // 30 seconds warning
  WARNING_THRESHOLD_2: 10, // 10 seconds warning
} as const;

// Timer phase validation
export const timerPhaseSchema = z.enum(["free_time", "selection"]);

// Timer state validation
export const timerStateSchema = z.enum([
  "stopped",
  "running",
  "paused",
  "expired",
]);

// Start timer validation
export const startTimerSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  gameRoomId: z.string().uuid("Invalid game room ID"),
  phase: timerPhaseSchema,
  duration: z.number().int().min(1).max(600).optional(), // max 10 minutes for safety
});

// Timer status validation
export const timerStatusSchema = z.object({
  roundId: z.string().uuid(),
  phase: timerPhaseSchema,
  state: timerStateSchema,
  remainingTime: z.number().int().min(0),
  totalDuration: z.number().int().min(1),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
});

// Time warning validation
export const timeWarningSchema = z.object({
  roundId: z.string().uuid(),
  phase: timerPhaseSchema,
  remainingTime: z.number().int().min(0),
  warningLevel: z.enum(["warning_30", "warning_10", "expired"]),
});

// Timer control validation
export const timerControlSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  gameRoomId: z.string().uuid("Invalid game room ID"),
  action: z.enum(["start", "pause", "resume", "stop", "reset"]),
});

// Get remaining time validation
export const getRemainingTimeSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  phase: timerPhaseSchema.optional(),
});

// Types
export type TimerPhase = z.infer<typeof timerPhaseSchema>;
export type TimerState = z.infer<typeof timerStateSchema>;
export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type TimerStatusOutput = z.infer<typeof timerStatusSchema>;
export type TimeWarningOutput = z.infer<typeof timeWarningSchema>;
export type TimerControlInput = z.infer<typeof timerControlSchema>;
export type GetRemainingTimeInput = z.infer<typeof getRemainingTimeSchema>;

// Helper functions
export function getDefaultDuration(phase: TimerPhase): number {
  switch (phase) {
    case "free_time":
      return TIMER_DURATIONS.FREE_TIME;
    case "selection":
      return TIMER_DURATIONS.SELECTION_TIME;
    default:
      return TIMER_DURATIONS.FREE_TIME;
  }
}

export function shouldShowWarning(
  remainingTime: number
): "warning_30" | "warning_10" | "expired" | null {
  if (remainingTime <= 0) return "expired";
  if (remainingTime <= TIMER_DURATIONS.WARNING_THRESHOLD_2) return "warning_10";
  if (remainingTime <= TIMER_DURATIONS.WARNING_THRESHOLD_1) return "warning_30";
  return null;
}

export function calculateRemainingTime(
  startedAt: Date,
  duration: number
): number {
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, duration - elapsed);
}
