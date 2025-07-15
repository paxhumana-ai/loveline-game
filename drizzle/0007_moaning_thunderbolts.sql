CREATE POLICY "Allow all select" ON "game_rooms" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all insert" ON "game_rooms" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Allow all select" ON "matches" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all insert" ON "matches" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Allow all select" ON "participants" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all insert" ON "participants" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "profiles" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "Enable update for users based on user_id" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "Enable delete for users based on user_id" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "questions" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all select" ON "rounds" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all insert" ON "rounds" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Allow all select" ON "selections" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Allow all insert" ON "selections" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);