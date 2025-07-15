import { z } from "zod";

// Round control operations validation
export const startRoundSchema = z.object({
  gameRoomId: z.string().uuid("Invalid game room ID"),
  roundNumber: z
    .number()
    .int()
    .min(1, "Round number must be at least 1")
    .max(10, "Round number cannot exceed 10"),
});

export const endRoundSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  gameRoomId: z.string().uuid("Invalid game room ID"),
});

export const pauseRoundSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  gameRoomId: z.string().uuid("Invalid game room ID"),
});

export const resumeRoundSchema = z.object({
  roundId: z.string().uuid("Invalid round ID"),
  gameRoomId: z.string().uuid("Invalid game room ID"),
});

// Round status validation
export const roundStatusSchema = z.enum(["pending", "active", "completed"]);

// Round phase validation (for internal state management)
export const roundPhaseSchema = z.enum([
  "waiting",
  "free_time",
  "selection",
  "processing",
  "completed",
]);

// Types
export type StartRoundInput = z.infer<typeof startRoundSchema>;
export type EndRoundInput = z.infer<typeof endRoundSchema>;
export type PauseRoundInput = z.infer<typeof pauseRoundSchema>;
export type ResumeRoundInput = z.infer<typeof resumeRoundSchema>;
export type RoundStatus = z.infer<typeof roundStatusSchema>;
export type RoundPhase = z.infer<typeof roundPhaseSchema>;
