import {
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";
import { users } from "./external-schema";

// Enums
export const gameRoomStatusEnum = pgEnum("game_room_status", [
  "waiting",
  "in_progress",
  "completed",
  "cancelled",
]);

export const participantStatusEnum = pgEnum("participant_status", [
  "joined",
  "ready",
  "playing",
  "temporarily_away",
  "left",
  "finished",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const mbtiEnum = pgEnum("mbti", [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
]);

export const questionCategoryEnum = pgEnum("question_category", [
  "romance",
  "friendship",
  "personality",
  "lifestyle",
  "preferences",
  "hypothetical",
]);

export const roundStatusEnum = pgEnum("round_status", [
  "waiting",
  "free_time",
  "selection_time",
  "completed",
]);

export const userTypeEnum = pgEnum("user_type", ["ADMIN", "GENERAL"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatar_url: text("avatar_url"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    user_id: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    marketing_data: jsonb("marketing_data"),
    onboarding_completed_at: timestamp("onboarding_completed_at"),
    user_type: userTypeEnum("user_type").default("GENERAL").notNull(),
  },
  (table) => [
    pgPolicy("Enable read access for all users", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Enable insert for authenticated users only", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Enable update for users based on user_id", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = user_id`,
      withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Enable delete for users based on user_id", {
      for: "delete",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = user_id`,
    }),
  ]
).enableRLS();

// Core Tables

export const gameRooms = pgTable(
  "game_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    maxParticipants: integer("max_participants").notNull().default(8),
    totalRounds: integer("total_rounds").notNull().default(3),
    hostId: uuid("host_id"),
    status: gameRoomStatusEnum("status").notNull().default("waiting"),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Allow all select", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Allow all insert", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameRoomId: uuid("game_room_id")
      .references(() => gameRooms.id, { onDelete: "cascade" })
      .notNull(),
    nickname: text("nickname").notNull(),
    gender: genderEnum("gender").notNull(),
    mbti: mbtiEnum("mbti").notNull(),
    character: text("character").notNull(),
    status: participantStatusEnum("status").notNull().default("joined"),
    userId: uuid("user_id").references(() => users.id),
    lastSeenAt: timestamp("last_seen_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("unique_nickname_per_room").on(table.gameRoomId, table.nickname),
    unique("unique_character_per_room").on(table.gameRoomId, table.character),
    pgPolicy("Allow all select", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Allow all insert", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    category: questionCategoryEnum("category").notNull(),
    difficulty: integer("difficulty").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Enable read access for all users", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
  ]
).enableRLS();

export const rounds = pgTable(
  "rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameRoomId: uuid("game_room_id")
      .references(() => gameRooms.id, { onDelete: "cascade" })
      .notNull(),
    roundNumber: integer("round_number").notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id)
      .notNull(),
    status: roundStatusEnum("status").notNull().default("waiting"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    freeTimeStartedAt: timestamp("free_time_started_at"),
    selectionTimeStartedAt: timestamp("selection_time_started_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Allow all select", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Allow all insert", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const selections = pgTable(
  "selections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roundId: uuid("round_id")
      .references(() => rounds.id, { onDelete: "cascade" })
      .notNull(),
    selectorParticipantId: uuid("selector_participant_id")
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    selectedParticipantId: uuid("selected_participant_id")
      .references(() => participants.id, { onDelete: "cascade" }),
    message: text("message"),
    isPassed: boolean("is_passed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Allow all select", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Allow all insert", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameRoomId: uuid("game_room_id")
      .references(() => gameRooms.id, { onDelete: "cascade" })
      .notNull(),
    participant1Id: uuid("participant1_id")
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    participant2Id: uuid("participant2_id")
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Allow all select", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
    pgPolicy("Allow all insert", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`true`,
    }),
  ]
).enableRLS();
