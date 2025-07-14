import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

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
  "pending",
  "active",
  "completed",
]);

// Core Tables

export const gameRooms = pgTable(
  "game_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(), // 6자리 게임방 코드
    maxParticipants: integer("max_participants").notNull().default(8),
    totalRounds: integer("total_rounds").notNull().default(3),
    hostId: uuid("host_id"), // nullable - 호스트가 나가도 게임은 계속
    status: gameRoomStatusEnum("status").notNull().default("waiting"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Enable read access for participants", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      )`,
    }),
    pgPolicy("Enable insert for authenticated users", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = host_id`,
    }),
    pgPolicy("Enable update for host only", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = host_id`,
      withCheck: sql`(select auth.uid()) = host_id`,
    }),
    pgPolicy("Enable delete for host only", {
      for: "delete",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = host_id`,
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
    character: text("character").notNull(), // 동물 캐릭터 이름
    status: participantStatusEnum("status").notNull().default("joined"),
    userId: uuid("user_id"), // nullable - 익명 참가 가능
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Enable read access for same room participants", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`game_room_id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      )`,
    }),
    pgPolicy("Enable insert for authenticated and anonymous users", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`(user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid()))`,
    }),
    pgPolicy("Enable update for own record", {
      for: "update",
      to: [anonRole, authenticatedRole],
      using: sql`(user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid()))`,
      withCheck: sql`(user_id IS NULL AND (select auth.uid()) IS NULL) OR (user_id IS NOT NULL AND user_id = (select auth.uid()))`,
    }),
  ]
).enableRLS();

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    category: questionCategoryEnum("category").notNull(),
    difficulty: integer("difficulty").notNull().default(1), // 1-5 난이도
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
    status: roundStatusEnum("status").notNull().default("pending"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    pgPolicy("Enable read access for same room participants", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`game_room_id in (
        select game_room_id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      )`,
    }),
    pgPolicy("Enable insert for game room host", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      )`,
    }),
    pgPolicy("Enable update for game room host", {
      for: "update",
      to: authenticatedRole,
      using: sql`game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      )`,
      withCheck: sql`game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      )`,
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
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (_table) => [
    pgPolicy("Enable read access for same round participants", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`round_id in (
        select r.id from rounds r
        join participants p on r.game_room_id = p.game_room_id
        where p.user_id = (select auth.uid()) OR p.user_id IS NULL
      )`,
    }),
    pgPolicy("Enable insert for own selections", {
      for: "insert",
      to: [anonRole, authenticatedRole],
      withCheck: sql`selector_participant_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      )`,
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
    pgPolicy("Enable read access for matched participants", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`participant1_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      ) OR participant2_id in (
        select id from participants 
        where user_id = (select auth.uid()) OR user_id IS NULL
      )`,
    }),
    pgPolicy("Enable insert for game room host", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`game_room_id in (
        select id from game_rooms where host_id = (select auth.uid())
      )`,
    }),
  ]
).enableRLS();
