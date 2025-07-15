# workflow_state.md

_Last updated: 2025-01-21_

## Phase

ANALYZE

## Status

COMPLETED

## Items

- [x] **1. GameRoom 도메인 유저플로우 검증**
  - [x] 1-1. 방 생성/입장/대기실 플로우 PRD 일치 여부 검증
  - [x] 1-2. 참가자 상태/정원/중복(닉네임, 캐릭터) 처리 검증
  - [x] 1-3. 게임 시작/진행/라운드 상태 전이(대기→진행→완료) 검증
  - [x] 1-4. 참가자 이탈/재참여/호스트 이양/방 삭제 엣지케이스 검증
  - [x] 1-5. 사용되지 않는 파일/코드(Dead Code) 존재 여부 점검

## Plan

### GameRoom 도메인 유저플로우 검증 전략

1. PRD의 유저플로우(방 생성, 입장, 대기, 진행, 이탈, 재참여, 호스트 이양 등)와 실제 코드(액션, 컴포넌트, 훅, 스키마) 매핑
2. 각 단계별로 엣지케이스(정원 초과, 중복, 상태 불일치, 권한 문제 등) 처리 로직 확인
3. 사용되지 않는 파일/코드가 남아있는지 grep 및 import 추적
4. 규칙 파일(.cursor/rules)에서 관련 코드 규칙 준수 여부 확인

## Log

- PHASE: ANALYZE 시작. GameRoom 도메인 유저플로우 및 엣지케이스, Dead Code 점검 준비.
- [1-1] 방 생성/입장/대기실 플로우: create.action.ts, join.action.ts, fetch.action.ts, waiting-room.tsx 등에서 PRD와 일치하게 구현됨. 방 코드 중복, 정원 초과, 대기 상태 등 엣지케이스 처리도 정상. UI/서버 분리 및 폴링 구조도 PRD와 부합.
- [1-2] 참가자 상태/정원/중복 처리: join.action.ts에서 참가자 정원, 닉네임/캐릭터 중복, 방 상태(대기 중) 등 검증 로직이 PRD와 일치. validation.action.ts 등에서 추가 중복 체크 및 상태 관리도 정상 동작.
- [1-3] 게임 시작/진행/라운드 상태 전이: update.action.ts에서 게임 시작 조건(모두 준비, 최소 인원) 및 상태 전이(대기→진행→완료) 로직이 PRD와 일치. 라운드/참가자 상태 동기화 및 엣지케이스(미준비, 인원 부족) 처리도 정상.
- [1-4] 참가자 이탈/재참여/호스트 이양/방 삭제: leave.action.ts에서 임시/완전 이탈, 호스트 이양, 마지막 참가자 퇴장 시 방 삭제 등 PRD 엣지케이스 모두 처리. 권한/상태 검증 및 트랜잭션 처리도 정상.
- [1-5] Dead Code 점검: game-room 도메인 내 모든 파일/익스포트가 실제 사용되고 있음. AVAILABLE_CHARACTERS, MBTI_LABELS 등도 정상 참조. app/room/[code] 및 하위 디렉토리에도 미사용 파일 없음.

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
