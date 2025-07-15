DROP POLICY "Allow all select" ON "game_rooms" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all insert" ON "game_rooms" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all update" ON "game_rooms" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all delete" ON "game_rooms" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "matches" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for game room host" ON "matches" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all select" ON "participants" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all insert" ON "participants" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all update" ON "participants" CASCADE;--> statement-breakpoint
DROP POLICY "Allow all delete" ON "participants" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for authenticated users only" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Enable update for users based on user_id" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Enable delete for users based on user_id" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "questions" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "rounds" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for game room host" ON "rounds" CASCADE;--> statement-breakpoint
DROP POLICY "Enable update for game room host" ON "rounds" CASCADE;--> statement-breakpoint
DROP POLICY "Enable read access for all users" ON "selections" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for all users (무한 재귀 방지)" ON "selections" CASCADE;