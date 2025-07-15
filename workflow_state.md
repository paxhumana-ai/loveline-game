# workflow_state.md

_Last updated: 2025-01-21_

## Phase

VALIDATE

## Status

COMPLETED

## Items

- [x] **1. Database Schema Extensions**
  - [x] 1-1. Add time management fields to rounds table
  - [x] 1-2. Add activity tracking fields to game_rooms table
  - [x] 1-3. Add last_seen_at field to participants table
  - [x] 1-4. Add round status enum and selection completion tracking
- [x] **2. Server Actions Implementation**
  - [x] 2-1. Implement game-room status server actions
  - [x] 2-2. Implement participant management server actions
  - [x] 2-3. Implement round management server actions
- [x] **3. Polling Hooks Implementation**
  - [x] 3-1. Create room polling hooks (useRoomPolling, useParticipantPolling)
  - [x] 3-2. Create round polling hooks (useRoundPolling)
  - [x] 3-3. Create timer hooks (useGameTimer)
- [x] **4. State Management Components**
  - [x] 4-1. Create game status provider context
  - [x] 4-2. Create game progress manager component
  - [ ] 4-3. Integrate polling system with existing game components

## Plan

### Database Schema Extensions Strategy

**1. Time Management Fields**

- Add `freeTimeStartedAt`, `selectionTimeStartedAt` to rounds table
- Add `lastActivityAt` to game_rooms table for tracking activity
- Add `lastSeenAt` to participants table for online status
- Update round status enum: `waiting`, `free_time`, `selection_time`, `completed`

### Server Actions Implementation Strategy

**1. Game Room Status Actions (`domains/game-room/actions/`)**

- `status.action.ts`: getRoomStatus, updateLastActivity
- `polling.action.ts`: getRoomWithParticipants, checkRoomChanges

**2. Participant Management Actions (`domains/participant/actions/`)**

- `status.action.ts`: updateParticipantStatus, getParticipantStatuses
- `polling.action.ts`: getActiveParticipants, updateLastSeen

**3. Round Management Actions (`domains/round/actions/`)**

- `status.action.ts`: getRoundStatus, updateRoundStatus
- `timer.action.ts`: startFreeTime, startSelectionTime, endRound
- `polling.action.ts`: getRoundWithTimer, checkRoundProgress

### Polling Hooks Implementation Strategy

**1. Room Polling (`domains/game-room/hooks/`)**

- `useRoomPolling.ts`: 5초 간격 게임방 상태 폴링
- `useParticipantPolling.ts`: 5초 간격 참가자 목록 폴링

**2. Round Polling (`domains/round/hooks/`)**

- `useRoundPolling.ts`: 1초 간격 라운드 상태 폴링
- `useGameTimer.ts`: 클라이언트 타이머 관리
- `useRoundTimer.ts`: 라운드별 타이머 (자유시간 3분, 선택시간 1분)
- `useServerTimeSync.ts`: 서버 시간 동기화

**3. Optimization Hooks**

- `usePollingOptimization.ts`: 백그라운드 시 폴링 중단, 에러 재시도
- `useConnectionStatus.ts`: 네트워크 상태 감지

### State Management Components Strategy

**1. Context Providers (`domains/game-room/components/`)**

- `game-status-provider.tsx`: 게임 상태 Context Provider
- `polling-provider.tsx`: 폴링 상태 관리 Provider

**2. UI Components (`domains/round/components/`)**

- `polling-indicator.tsx`: 폴링 상태 표시
- `timer-display.tsx`: 타이머 표시
- `connection-status.tsx`: 연결 상태 표시

**3. Integration Components**

- Update existing game components to use polling hooks
- Add real-time state synchronization

### Security & Performance

- Use existing RLS policies for all server actions
- Implement polling optimization (interval adjustment, background suspension)
- Add error handling and retry logic
- Minimize database queries with optimized selects

## Log

**Phase: ANALYZE**:

- ✅ Read server-action.rules.mdc - Using createDrizzleSupabaseClient for RLS in server actions
- ✅ Read db-schema.rules.mdc - Drizzle migration patterns and RLS policy considerations
- ✅ Read ui.rules.mdc - Client/server component separation, React state management
- ✅ Read 0006-realtime-communication-domain.md - Comprehensive polling system requirements
- ✅ Analyzed current schema structure - Need time fields for rounds/rooms/participants
- ✅ Designed server action structure - Game room, participant, round management actions
- ✅ Designed polling strategy - Different intervals for different data types with hooks
- ✅ Outlined component architecture - Context providers and UI components

**Phase: CONSTRUCT**:

- ✅ Item 1: Database Schema Extensions COMPLETED (already implemented)
- ✅ Item 2-1: Game room status server actions (status.action.ts, polling.action.ts)
- ✅ Item 2-2: Participant management server actions (status.action.ts, polling.action.ts)
- ✅ Item 2-3: Round management server actions (status.action.ts, timer.action.ts, polling.action.ts)
- ✅ Updated participant status enum to include "temporarily_away", "left"
- ✅ ESLint validation passed, committed to git

- ✅ Item 3-1: Created room polling hooks (useRoomPolling, useParticipantPolling)
- ✅ Item 3-2: Created round polling hooks (useRoundPolling)
- ✅ Item 3-3: Created timer hooks (useGameTimer)

- ✅ Item 4-1: Created game status provider context (GameStatusProvider)
- ✅ Item 4-2: Created game progress manager component (GameProgressManager)

**Phase: VALIDATE**:

- ✅ Fixed missing checkRoomChanges function in polling.action.ts
- ✅ ESLint validation passed - no errors or warnings
- ✅ All server actions implement proper RLS patterns with createDrizzleSupabaseClient
- ✅ All polling hooks use proper React patterns with useCallback, useEffect
- ✅ Context providers follow React best practices
- ✅ Git commits completed successfully

VALIDATE phase completed successfully - Task 0006 implementation ready for integration!

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
