CREATE TYPE "public"."game_room_status" AS ENUM('waiting', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."mbti" AS ENUM('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('joined', 'ready', 'playing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."question_category" AS ENUM('romance', 'friendship', 'personality', 'lifestyle', 'preferences', 'hypothetical');--> statement-breakpoint
CREATE TYPE "public"."round_status" AS ENUM('pending', 'active', 'completed');--> statement-breakpoint
CREATE TABLE "game_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"max_participants" integer DEFAULT 8 NOT NULL,
	"total_rounds" integer DEFAULT 3 NOT NULL,
	"host_id" uuid,
	"status" "game_room_status" DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "game_rooms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_room_id" uuid NOT NULL,
	"participant1_id" uuid NOT NULL,
	"participant2_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_room_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"gender" "gender" NOT NULL,
	"mbti" "mbti" NOT NULL,
	"character" text NOT NULL,
	"status" "participant_status" DEFAULT 'joined' NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"category" "question_category" NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_room_id" uuid NOT NULL,
	"round_number" integer NOT NULL,
	"question_id" uuid NOT NULL,
	"status" "round_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rounds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"selector_participant_id" uuid NOT NULL,
	"selected_participant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "selections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_game_room_id_game_rooms_id_fk" FOREIGN KEY ("game_room_id") REFERENCES "public"."game_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_participant1_id_participants_id_fk" FOREIGN KEY ("participant1_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_participant2_id_participants_id_fk" FOREIGN KEY ("participant2_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_game_room_id_game_rooms_id_fk" FOREIGN KEY ("game_room_id") REFERENCES "public"."game_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_game_room_id_game_rooms_id_fk" FOREIGN KEY ("game_room_id") REFERENCES "public"."game_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selections" ADD CONSTRAINT "selections_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selections" ADD CONSTRAINT "selections_selector_participant_id_participants_id_fk" FOREIGN KEY ("selector_participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selections" ADD CONSTRAINT "selections_selected_participant_id_participants_id_fk" FOREIGN KEY ("selected_participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for participants" ON "game_rooms" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ));--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users" ON "game_rooms" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = host_id);--> statement-breakpoint
CREATE POLICY "Enable update for host only" ON "game_rooms" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = host_id) WITH CHECK ((select auth.uid()) = host_id);--> statement-breakpoint
CREATE POLICY "Enable delete for host only" ON "game_rooms" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = host_id);--> statement-breakpoint
CREATE POLICY "Enable read access for matched participants" ON "matches" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (participant1_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ) OR participant2_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ));--> statement-breakpoint
CREATE POLICY "Enable insert for game room host" ON "matches" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable read access for same room participants" ON "participants" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (game_room_id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ));--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated and anonymous users" ON "participants" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK ((user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "Enable update for own record" ON "participants" AS PERMISSIVE FOR UPDATE TO "anon", "authenticated" USING ((user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid()))) WITH CHECK ((user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "questions" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable read access for same room participants" ON "rounds" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (game_room_id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ));--> statement-breakpoint
CREATE POLICY "Enable insert for game room host" ON "rounds" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable update for game room host" ON "rounds" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      )) WITH CHECK (game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "Enable read access for same round participants" ON "selections" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (round_id in (
        select r.id from rounds r
        join participants p on r.game_room_id = p.game_room_id
        where p.user_id = (select auth.uid()) OR p.user_id IS NULL
      ));--> statement-breakpoint
CREATE POLICY "Enable insert for own selections" ON "selections" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (selector_participant_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ));