ALTER TABLE "rounds" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rounds" ALTER COLUMN "status" SET DEFAULT 'waiting'::text;--> statement-breakpoint
DROP TYPE "public"."round_status";--> statement-breakpoint
CREATE TYPE "public"."round_status" AS ENUM('waiting', 'free_time', 'selection_time', 'completed');--> statement-breakpoint
ALTER TABLE "rounds" ALTER COLUMN "status" SET DEFAULT 'waiting'::"public"."round_status";--> statement-breakpoint
ALTER TABLE "rounds" ALTER COLUMN "status" SET DATA TYPE "public"."round_status" USING "status"::"public"."round_status";--> statement-breakpoint
ALTER TABLE "game_rooms" ADD COLUMN "last_activity_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "last_seen_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "free_time_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "rounds" ADD COLUMN "selection_time_started_at" timestamp;