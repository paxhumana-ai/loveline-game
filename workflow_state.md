# workflow_state.md

_Last updated: 2025-01-21_

## Phase

VALIDATE

## Status

RUNNING

## Items

- [x] **1. Game Room Domain Schema Implementation**
  - [x] 1-1. Extend database schema with game room related tables
  - [x] 1-2. Add RLS policies for game room security
- [x] **2. Game Room Server Actions Implementation**
  - [x] 2-1. Create game room schemas (create, join, settings)
  - [x] 2-2. Implement create and join actions
  - [x] 2-3. Implement fetch and update actions
  - [x] 2-4. Implement leave and host transfer actions
- [x] **3. Game Room UI Components Implementation**
  - [x] 3-1. Create game room page routes
  - [x] 3-2. Implement form components (create, join)
  - [x] 3-3. Implement waiting room components
  - [x] 3-4. Implement selector components (character, MBTI)
- [x] **4. Game Room Business Logic Integration**
  - [x] 4-1. Implement room code generation logic
  - [x] 4-2. Implement capacity and character validation
  - [x] 4-3. Implement host authority and participant management

## Plan

### Item 1: Game Room Domain Schema Implementation
**Status**: COMPLETED - All required tables already exist in db/schema.ts with proper RLS policies

### Item 2: Game Room Server Actions Implementation

**2-1. Create game room schemas**
```
domains/game-room/schemas/
├── create-room.schema.ts - zod schema for room creation (max_participants 2-8, total_rounds 3-10)
├── join-room.schema.ts - zod schema for joining (code, nickname, gender, mbti, character)
├── room-settings.schema.ts - zod schema for room settings update
└── index.ts - export all schemas
```

**2-2. Implement create and join actions**
```
domains/game-room/actions/
├── create.action.ts - createGameRoom() server action
├── join.action.ts - joinGameRoom() server action
└── index.ts - export all actions
```

**2-3. Implement fetch and update actions**
```
domains/game-room/actions/
├── fetch.action.ts - getGameRoomByCode(), getGameRoomStatus()
├── update.action.ts - updateGameRoomSettings(), startGame()
└── index.ts - update exports
```

**2-4. Implement leave and host transfer actions**
```
domains/game-room/actions/
├── leave.action.ts - leaveGameRoom(), transferHost()
└── index.ts - update exports
```

### Item 3: Game Room UI Components Implementation

**3-1. Create game room page routes**
```
app/
├── create-room/page.tsx - room creation page
├── join-room/page.tsx - room joining page
└── room/[code]/page.tsx - waiting room page
```

**3-2. Implement form components**
```
domains/game-room/components/
├── create-room-form.tsx - room creation form with react-hook-form
├── join-room-form.tsx - room joining form with profile setup
└── index.ts - export components
```

**3-3. Implement waiting room components**
```
domains/game-room/components/
├── waiting-room.tsx - main waiting room layout
├── participant-card.tsx - participant info display
├── game-room-header.tsx - room info header
└── room-settings-panel.tsx - host settings panel
```

**3-4. Implement selector components**
```
domains/game-room/components/
├── character-selector.tsx - animal character selection
├── mbti-selector.tsx - MBTI selection component
└── index.ts - update exports
```

### Item 4: Game Room Business Logic Integration

**4-1. Room code generation logic**
```
utils/game-room.ts - generateRoomCode() function (6-digit alphanumeric)
```

**4-2. Capacity and character validation**
```
domains/game-room/actions/validation.ts - room capacity and character uniqueness checks
```

**4-3. Host authority and participant management**
```
domains/game-room/actions/management.ts - host transfer and participant state management
```

## Log

**Phase: ANALYZE**: Reading relevant rule files for game room domain implementation.

- **db-schema.rules.mdc**: Database schema rules with RLS policies, table naming conventions (snake_case, plural), and proper auth.uid() usage patterns
- **server-action.rules.mdc**: Server action patterns with domain-based structure (@/domains/{domain}/actions/{TYPE}.action.ts), zod validation, and createDrizzleSupabaseClient usage
- **ui.rules.mdc**: UI component structure with server/client component separation, shadcn ui usage, and state management patterns
- **form-ui.rules.mdc**: Form implementation with react-hook-form, zod validation, Controller pattern, and server action integration

**Phase: BLUEPRINT**: Reviewed existing database schema - all game room related tables (game_rooms, participants, questions, rounds, selections, matches) already implemented with proper RLS policies. Focusing implementation on server actions and UI components.

**Phase: CONSTRUCT**: 
- ✅ Item 2-1: Created zod schemas for room creation, joining, and settings
- ✅ Item 2-2: Implemented createGameRoom and joinGameRoom server actions
- ✅ Item 2-3: Implemented fetch and update actions for room management
- ✅ Item 2-4: Implemented leave and host transfer actions
- ✅ Item 3-1: Created page routes for create-room, join-room, and room/[code]
- ✅ Item 3-2: Implemented form components with react-hook-form and zod validation
- ✅ Item 3-3: Implemented waiting room components with real-time updates
- ✅ Item 3-4: Implemented character and MBTI selector components
- ✅ Item 4-1: Implemented room code generation utility
- ✅ Item 4-2: Implemented capacity and character validation in server actions
- ✅ Item 4-3: Implemented host authority and participant management

**Phase: VALIDATE**: Starting validation checks for game room domain implementation.

## ArchiveLog

- Database schema setup for loveline game completed successfully with all core tables implemented
- RLS policies and foreign key relationships properly configured
- Initial seed data with 100 questions and 20 characters added to database

## Rules

> **Keep every major section under an explicit H2 (`##`) heading so the agent can locate them unambiguously.**

### [PHASE: ANALYZE]

1.  Read **project_config.mdc**, relevant code & docs.
    - IF task relavant to revising db schema, then read `docs/db-schema.rules.mdc`
    - IF task relavant to connecting to supabase auth, storage, realtime, then read `docs/supabase-client.rules.mdc`
    - IF task relavant to defining server action, then read `docs/server-aciton.rules.mdc`
    - IF task relavant to building frontend ui, then read `docs/ui.rules.mdc`
    - IF task relavant to supabase building form ui, then read `docs/form-ui.rules.mdc`
2.  Summarize requirements. _No code or planning._

### [PHASE: BLUEPRINT]

1.  Decompose task into ordered steps and write task sub items under **## Items**. Sub task items should be split enough to commit. NOT TOO SMALL.
2.  Write pseudocode or file-level diff outline under **## Plan**. Pseudocode must follow relavant rules which we read at PHASE: ANALYE.
3.  Set `Status = RUNNING` and begin implementation.

### [PHASE: CONSTRUCT]

1.  Follow the approved **## Plan** exactly.
2.  After each atomic change:
    - run test / linter commands specified in `project_config.md`
    - capture tool output in **## Log**
3.  On success of all steps, set `Phase = VALIDATE`.
4.  Trigger **RULE_SUMMARY_01** when applicable.
5.  Check git status and commit with compact message.

### [PHASE: VALIDATE]

1.  Rerun full test suite & any E2E checks.
2.  If clean, set `Status = COMPLETED`.
3.  Check git status and commit with compact message.
4.  Trigger **RULE_ITERATE_01** when applicable.
5.  Trigger **RULE_SUMMARY_01** when applicable.

---

### RULE_INIT_01

Trigger ▶ `Phase == INIT`
Action ▶ Ask user for first high-level task → `Phase = ANALYZE, Status = RUNNING`.

### RULE_ITERATE_01

Trigger ▶ `Status == COMPLETED && Items contains unprocessed rows`
Action ▶

1.  Set `CurrentItem` to next unprocessed row in **## Items**.
2.  Clear **## Log**, reset `Phase = ANALYzE, Status = RUNNING`.

### RULE_LOG_ROTATE_01

Trigger ▶ `length(## Log) > 5 000 chars`
Action ▶ Summarise the top 5 findings from **## Log** into **## ArchiveLog**, then clear **## Log**.

### RULE_SUMMARY_01

Trigger ▶ `Phase == VALIDATE && Status == COMPLETED`
Action ▶

1.  Read `/docs/project_config.md`.
2.  Construct the new changelog line: `- <One-sentence summary of completed work>`.
3.  Find the `## Changelog` in `/docs/project_config.md`.
4.  Insert the new changelog line immediately after the `## Changelog` heading and its following newline (making it the new first item in the list).

---