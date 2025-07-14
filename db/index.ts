import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import * as schema from "./schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is not set in environment variables.");
}

const adminClient = postgres(process.env.DIRECT_URL!, { prepare: false });
export const adminDb = drizzle(adminClient, { schema });

const rlsClient = postgres(process.env.DIRECT_URL!, { prepare: false });
export const rlsDb = drizzle(rlsClient, { schema });

type SupabaseToken = {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  role?: string;
};

export function createDrizzle(
  token: SupabaseToken,
  {
    admin,
    client,
  }: {
    admin: PostgresJsDatabase<typeof schema>;
    client: PostgresJsDatabase<typeof schema>;
  }
) {
  return {
    admin,
    rls: (async (transaction, ...rest) => {
      return await client.transaction(async (tx) => {
        // Supabase exposes auth.uid() and auth.jwt()
        // https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
        try {
          await tx.execute(sql`
          -- auth.jwt()
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token)
          )}', TRUE);
          -- auth.uid()
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? ""
          )}', TRUE);												
          -- set local role
          set local role ${sql.raw(token.role ?? "anon")};
          `);
          return await transaction(tx);
        } finally {
          await tx.execute(sql`
            -- reset
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
            `);
        }
      }, ...rest);
    }) as typeof client.transaction,
  };
}

function decode(token: string): SupabaseToken {
  if (!token) return {};
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export async function createDrizzleSupabaseClient() {
  const {
    data: { session },
  } = await (await createClient()).auth.getSession();
  return createDrizzle(decode(session?.access_token ?? ""), {
    admin: adminDb,
    client: rlsDb,
  });
}
