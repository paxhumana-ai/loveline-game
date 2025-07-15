"use server";

import { eq, and } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { selections, participants } from "@/db/schema";
import { selectionInputSchema, selectionUpdateSchema } from "../schemas";
import type { SelectionInput, SelectionUpdate } from "../schemas";

export async function createSelection(data: SelectionInput) {
  try {
    const validatedData = selectionInputSchema.parse(data);
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get current participant ID
      const currentParticipant = await tx
        .select({ id: participants.id })
        .from(participants)
        .where(eq(participants.userId, "current_user_id")) // This would need actual user ID
        .limit(1);

      if (currentParticipant.length === 0) {
        return { success: false, error: "참가자를 찾을 수 없습니다" };
      }

      // Check if selection already exists for this round
      const existingSelection = await tx
        .select()
        .from(selections)
        .where(
          and(
            eq(selections.roundId, validatedData.roundId),
            eq(selections.selectorParticipantId, currentParticipant[0].id)
          )
        )
        .limit(1);

      if (existingSelection.length > 0) {
        return { success: false, error: "이미 선택을 완료했습니다" };
      }

      // Validate selection (cannot select self)
      if (validatedData.selectedParticipantId === currentParticipant[0].id) {
        return { success: false, error: "자기 자신을 선택할 수 없습니다" };
      }

      // Create selection
      const newSelection = await tx
        .insert(selections)
        .values({
          roundId: validatedData.roundId,
          selectorParticipantId: currentParticipant[0].id,
          selectedParticipantId: validatedData.isPassed 
            ? null 
            : validatedData.selectedParticipantId,
          message: validatedData.message,
          isPassed: validatedData.isPassed,
        })
        .returning();

      return { success: true, data: newSelection[0] };
    });
  } catch (error) {
    console.error("Create selection error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "선택 생성에 실패했습니다" 
    };
  }
}

export async function updateSelection(data: SelectionUpdate) {
  try {
    const validatedData = selectionUpdateSchema.parse(data);
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get current participant ID
      const currentParticipant = await tx
        .select({ id: participants.id })
        .from(participants)
        .where(eq(participants.userId, "current_user_id")) // This would need actual user ID
        .limit(1);

      if (currentParticipant.length === 0) {
        return { success: false, error: "참가자를 찾을 수 없습니다" };
      }

      // Validate selection ownership
      const existingSelection = await tx
        .select()
        .from(selections)
        .where(
          and(
            eq(selections.id, validatedData.selectionId),
            eq(selections.selectorParticipantId, currentParticipant[0].id)
          )
        )
        .limit(1);

      if (existingSelection.length === 0) {
        return { success: false, error: "선택을 찾을 수 없거나 수정 권한이 없습니다" };
      }

      // Validate selection (cannot select self)
      if (validatedData.selectedParticipantId === currentParticipant[0].id) {
        return { success: false, error: "자기 자신을 선택할 수 없습니다" };
      }

      // Update selection
      const updatedSelection = await tx
        .update(selections)
        .set({
          selectedParticipantId: validatedData.isPassed 
            ? null 
            : validatedData.selectedParticipantId,
          message: validatedData.message,
          isPassed: validatedData.isPassed,
        })
        .where(eq(selections.id, validatedData.selectionId))
        .returning();

      return { success: true, data: updatedSelection[0] };
    });
  } catch (error) {
    console.error("Update selection error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "선택 수정에 실패했습니다" 
    };
  }
}

export async function deleteSelection(selectionId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get current participant ID
      const currentParticipant = await tx
        .select({ id: participants.id })
        .from(participants)
        .where(eq(participants.userId, "current_user_id")) // This would need actual user ID
        .limit(1);

      if (currentParticipant.length === 0) {
        return { success: false, error: "참가자를 찾을 수 없습니다" };
      }

      // Delete selection (RLS policy will ensure ownership)
      const deletedSelection = await tx
        .delete(selections)
        .where(
          and(
            eq(selections.id, selectionId),
            eq(selections.selectorParticipantId, currentParticipant[0].id)
          )
        )
        .returning();

      if (deletedSelection.length === 0) {
        return { success: false, error: "선택을 찾을 수 없거나 삭제 권한이 없습니다" };
      }

      return { success: true, data: deletedSelection[0] };
    });
  } catch (error) {
    console.error("Delete selection error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "선택 삭제에 실패했습니다" 
    };
  }
}