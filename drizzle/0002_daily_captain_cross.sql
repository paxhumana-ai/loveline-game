ALTER TABLE "selections" ALTER COLUMN "selected_participant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "selections" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "selections" ADD COLUMN "is_passed" boolean DEFAULT false NOT NULL;