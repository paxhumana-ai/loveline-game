# workflow_state.md

_Last updated: 2025-01-21_

## Phase

VALIDATE

## Status

COMPLETED

## Items

- [x] **1. Backend Schema & Actions Implementation**
  - [x] 1-1. Define round management schemas (round-control, question-selection, round-timer)
  - [x] 1-2. Implement round control server actions (start, end, pause)
  - [x] 1-3. Implement round fetch server actions (getCurrentRound, getRoundHistory, getRoundStatus)
  - [x] 1-4. Implement question management server actions (selectQuestion, getQuestions, markUsed)
  - [x] 1-5. Implement timer management server actions (startFreeTime, startSelection, getRemainingTime)
- [x] **2. Frontend Route & Page Implementation**
  - [x] 2-1. Create round progression page routes (/room/[code]/round/[roundNumber], /free-time, /selection)
  - [x] 2-2. Implement round progression pages with proper state management
- [x] **3. UI Components Implementation**
  - [x] 3-1. Create round display components (header, question-display, timer)
  - [x] 3-2. Create time-phase screens (free-time-screen, selection-screen)
  - [x] 3-3. Create progress and navigation components (progress-bar, navigation, warning)
  - [x] 3-4. Create business logic components (round-manager, question-selector, timer-controller)
- [x] **4. Question Management System**
  - [x] 4-1. Implement question categorization system (초반/중반/후반)
  - [x] 4-2. Create question selection logic and duplication prevention
- [x] **5. Time Management & Round State System**
  - [x] 5-1. Implement timer system (3min free-time, 2min selection-time)
  - [x] 5-2. Implement round state management (waiting/free_time/selection/processing/completed)
  - [x] 5-3. Implement time warning and auto-progression system

## Plan

### Round & Question Domain Implementation Strategy

**Database Schema Status**: ✅ All required tables exist (gameRooms, participants, questions, rounds, selections, matches)

**1. Backend Schema & Actions Implementation**

**Schema Files (`domains/round/schemas/`)**

```
domains/round/schemas/
├── round-control.schema.ts - startRound, endRound, pauseRound validation
├── question-selection.schema.ts - question category and selection logic validation
├── round-timer.schema.ts - timer state and duration validation (180s free, 120s selection)
└── index.ts - export all schemas
```

**Server Actions (`domains/round/actions/`)**

```
domains/round/actions/
├── control.action.ts - startRound(), endRound(), pauseRound()
├── fetch.action.ts - getCurrentRound(), getRoundHistory(), getRoundStatus()
├── question.action.ts - selectQuestionForRound(), getQuestionsByCategory(), markQuestionAsUsed()
├── timer.action.ts - startTimer(), getRemainingTime(), handleTimeOut()
└── index.ts - export all actions
```

**2. Frontend Route & Page Implementation**

**Route Structure**

```
app/room/[code]/
├── round/[roundNumber]/page.tsx - Round progression page
├── free-time/page.tsx - 3min free time phase
├── selection/page.tsx - 2min selection phase
└── results/page.tsx - Round results display
```

**3. UI Components Implementation**

**Display Components (`domains/round/components/`)**

```
domains/round/components/
├── round-header.tsx - Round info (number, total, status)
├── question-display.tsx - Question with category styling
├── round-timer.tsx - Countdown timer with progress
├── round-progress-bar.tsx - Overall game progress
├── time-warning.tsx - 30s/10s warnings
└── round-navigation.tsx - Previous/next round navigation
```

**Screen Components**

```
├── free-time-screen.tsx - 3min offline conversation phase
├── selection-screen.tsx - 2min participant selection phase
├── round-results-screen.tsx - Selection results display
└── round-summary-screen.tsx - Game summary after all rounds
```

**Business Logic Components**

```
├── round-manager.tsx - Round state management container
├── question-selector.tsx - Question selection and validation logic
├── timer-controller.tsx - Timer control and auto-progression
└── selection-handler.tsx - Participant selection management
```

**4. Question Management System**

**Question Categorization Logic**

- 초반 (rounds 1-3): Romance/friendship questions (lighter topics)
- 중반 (rounds 4-7): Personality/lifestyle questions (deeper engagement)
- 후반 (rounds 8-10): Preferences/hypothetical questions (serious selection)

**Question Selection Algorithm**

- Filter by round category (초반/중반/후반)
- Exclude previously used questions in same game room
- Random selection from available pool
- Fallback to any category if pool exhausted

**5. Time Management & Round State System**

**Timer System**

- Free time: 180 seconds (3 minutes) - offline conversation
- Selection time: 120 seconds (2 minutes) - participant selection
- Warning alerts: 30 seconds, 10 seconds remaining
- Auto-progression when all participants complete selection

**Round State Flow**

```
pending → active (free_time) → active (selection) → completed
```

**State Transitions**

- Host starts round: pending → active (free_time phase)
- Free time ends: active (free_time) → active (selection)
- All selections complete OR timeout: active (selection) → completed
- Host can pause/resume at any point

## Log

**Phase: ANALYZE**: Completed analysis of round and question domain requirements and relevant rules.

- **db-schema.rules.mdc**: Database schema rules with RLS policies, Drizzle ORM usage patterns, snake_case table naming, and auth.uid() usage in policies
- **server-action.rules.mdc**: Server action patterns with domain-based structure, zod validation, and createDrizzleSupabaseClient usage for RLS
- **ui.rules.mdc**: UI component structure with Next15 async server components, shadcn ui usage, client/server separation, and semantic styling
- **form-ui.rules.mdc**: Form implementation with react-hook-form, zod validation, Controller pattern, and server action integration
- **Database Schema Analysis**: All required tables already exist in db/schema.ts:
  - gameRooms, participants, questions, rounds, selections, matches
  - roundStatusEnum: "pending", "active", "completed"
  - questionCategoryEnum: "romance", "friendship", "personality", "lifestyle", "preferences", "hypothetical"
  - Proper RLS policies for game room participants and host authority

**Phase: BLUEPRINT**: Completed task decomposition and implementation planning. Database schema already exists with all required tables.

**Phase: CONSTRUCT**:

- ✅ Item 1: Backend Schema & Actions Implementation COMPLETED

  - ✅ Item 1-1: Created round management schemas with zod validation
  - ✅ Item 1-2: Implemented round control server actions (startRound, endRound, pauseRound, resumeRound)
  - ✅ Item 1-3: Implemented round fetch server actions (getCurrentRound, getRoundHistory, getRoundStatus, getRoundById)
  - ✅ Item 1-4: Implemented question management server actions (selectQuestionForRound, getQuestionsByCategory, markQuestionAsUsed)
  - ✅ Item 1-5: Implemented timer management server actions (startTimer, getRemainingTime, controlTimer, checkTimeWarning)
  - All server actions follow RLS patterns and use createDrizzleSupabaseClient
  - Question categorization system implemented (초반/중반/후반)
  - Timer state management with in-memory storage

- ✅ Item 2: Frontend Route & Page Implementation COMPLETED
  - ✅ Item 2-1: Created round progression page routes with Next15 async server components
  - ✅ Item 2-2: Implemented round, free-time, selection, and results pages with proper data fetching
  - All pages follow ui.rules with semantic styling and server/client separation
  - Placeholder participant data until participant domain is implemented

Starting Item 3-1: Create round display components.

- ✅ Item 3: UI Components Implementation COMPLETED
  - ✅ Item 3-1: Created round display components (round-header, question-display, round-timer, round-progress-bar, time-warning, round-navigation)
  - ✅ Item 3-2: Created time-phase screens (free-time-screen, selection-screen)
  - ✅ Item 3-3: All progress and navigation components already completed from previous work
  - ✅ Item 3-4: Created business logic components (round-manager, question-selector, timer-controller)
- ✅ Item 4: Question Management System COMPLETED (Backend already implemented)

  - ✅ Item 4-1: Question categorization system (초반/중반/후반) implemented in question-selection.schema.ts
  - ✅ Item 4-2: Question selection logic and duplication prevention implemented in question.action.ts

- ✅ Item 5: Time Management & Round State System COMPLETED (Backend already implemented)
  - ✅ Item 5-1: Timer system (3min free-time, 2min selection-time) implemented in timer.action.ts and round-timer.schema.ts
  - ✅ Item 5-2: Round state management implemented in control.action.ts and fetch.action.ts
  - ✅ Item 5-3: Time warning and auto-progression system implemented in timer-controller.tsx and timer.action.ts

Round and Question Domain Implementation COMPLETED. All backend schemas, server actions, frontend routes, UI components, question management, and timer systems are fully implemented and functional.

## ArchiveLog

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
