import { z } from "zod";

export const selectionInputSchema = z.object({
  roundId: z.string().uuid("라운드 ID가 유효하지 않습니다"),
  selectedParticipantId: z.string().uuid("참가자 ID가 유효하지 않습니다").optional(),
  message: z.string()
    .max(50, "메시지는 50자를 초과할 수 없습니다")
    .optional(),
  isPassed: z.boolean().default(false),
});

export const selectionUpdateSchema = z.object({
  selectionId: z.string().uuid("선택 ID가 유효하지 않습니다"),
  selectedParticipantId: z.string().uuid("참가자 ID가 유효하지 않습니다").optional(),
  message: z.string()
    .max(50, "메시지는 50자를 초과할 수 없습니다")
    .optional(),
  isPassed: z.boolean().default(false),
});

export type SelectionInput = z.infer<typeof selectionInputSchema>;
export type SelectionUpdate = z.infer<typeof selectionUpdateSchema>;