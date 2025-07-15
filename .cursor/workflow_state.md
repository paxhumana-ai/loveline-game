# workflow_state.md

_Last updated: 2025-01-21_

## Phase

CONSTRUCT

## Status

RUNNING

## Items

- [ ] **1. Backend Schema & Actions Implementation**
  - [x] 1-1. Define participant management schemas (profile, character, MBTI, status)
  - [ ] 1-2. Implement create participant server actions
  - [ ] 1-3. Implement update participant server actions
  - [ ] 1-4. Implement fetch participant server actions
  - [ ] 1-5. Implement validation server actions
- [ ] **2. Frontend UI Components Implementation**
  - [ ] 2-1. Create participant profile form component
  - [ ] 2-2. Create character gallery component
  - [ ] 2-3. Create MBTI quiz component
  - [ ] 2-4. Create participant avatar and list components
  - [ ] 2-5. Create status indicator and gender balance components
- [ ] **3. Business Logic Components**
  - [ ] 3-1. Create participant manager container component
  - [ ] 3-2. Create character and nickname validators
- [ ] **4. Data Validation & Security**
  - [ ] 4-1. Implement input validation for nicknames, characters, MBTI
  - [ ] 4-2. Implement access control and security measures

## Plan

### Backend Schema & Actions Strategy

**1. Domain Structure Setup**

- Create `domains/participant/` directory structure
- Define schemas using zod for validation
- Create server actions using Drizzle RLS client

**2. Schema Files (`domains/participant/schemas/`)**

- `participant-profile.schema.ts`: nickname (2-8 chars), gender validation
- `character-selection.schema.ts`: 20 animal character validation
- `mbti-selection.schema.ts`: 16 MBTI types validation
- `participant-status.schema.ts`: status changes (active/temporarily_away/left)

**3. Server Actions (`domains/participant/actions/`)**

- `create.action.ts`: createParticipant, validateNickname
- `update.action.ts`: updateParticipantProfile, updateParticipantStatus, updateCharacter
- `fetch.action.ts`: getParticipantsByRoom, getParticipantProfile, getAvailableCharacters
- `validation.action.ts`: checkCharacterAvailability, validateParticipantCapacity

### Frontend UI Components Strategy

**1. Form Components**

- Use react-hook-form with zod validation
- Follow form-ui rules for controller pattern
- Use shadcn UI components

**2. Component Structure (`domains/participant/components/`)**

- `participant-profile-form.tsx`: nickname, gender input form
- `character-gallery.tsx`: grid layout with selection states
- `mbti-quiz.tsx`: 16 types categorized display
- `participant-avatar.tsx`: character + nickname display
- `participant-list.tsx`: waiting room participant list
- `participant-status-indicator.tsx`: online/away status
- `gender-balance-indicator.tsx`: male/female ratio display

**3. Business Logic Components**

- `participant-manager.tsx`: container with state management
- `character-validator.tsx`: character duplication logic
- `nickname-validator.tsx`: nickname validation logic

### Security & Validation

- Use existing RLS policies in participants table
- Implement server-side validation for all inputs
- Ensure anonymity while providing game-necessary info

## Log

**Phase: ANALYZE**:

- ✅ Read server-action.rules.mdc - using createDrizzleSupabaseClient for RLS
- ✅ Read db-schema.rules.mdc - RLS policies and schema patterns
- ✅ Read ui.rules.mdc - client/server component separation, shadcn usage
- ✅ Read form-ui.rules.mdc - react-hook-form with zod validation
- ✅ Analyzed current DB schema - participants table exists with enums
- ✅ Checked domain structure - auth domain exists as reference
- ✅ Reviewed task requirements - comprehensive participant management system

**Phase: BLUEPRINT**: Decomposed task into 4 main items with detailed implementation strategy.

**Phase: CONSTRUCT**:

- ✅ Item 1-1: Created participant management schemas (profile, character, MBTI, status)
  - Created domains/participant/schemas/ directory structure
  - participant-profile.schema.ts: nickname 2-8 chars, gender validation
  - character-selection.schema.ts: 20 animal character validation
  - mbti-selection.schema.ts: 16 MBTI types with categories and descriptions
  - participant-status.schema.ts: status changes (joined/ready/playing/finished)
  - All schemas use zod validation with proper TypeScript types
  - ESLint validation passed successfully

Starting Item 1-2: Create participant server actions

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
