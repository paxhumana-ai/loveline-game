ALTER TYPE "public"."participant_status" ADD VALUE 'temporarily_away' BEFORE 'finished';--> statement-breakpoint
ALTER TYPE "public"."participant_status" ADD VALUE 'left' BEFORE 'finished';