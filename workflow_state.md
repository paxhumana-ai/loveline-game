# workflow_state.md

_Last updated: 2025-01-21_

## Phase

CONSTRUCT

## Status

RUNNING

## Items

- [x] **1. Main Pages & Layout Implementation**

  - [x] 1-1. Create improved homepage with game introduction and main action buttons
  - [x] 1-2. Implement global layout with providers, theming, and metadata
  - [x] 1-3. Set up error boundaries and loading states

- [ ] **2. Game Room Pages Implementation**

  - [ ] 2-1. Enhance create room page with complete game settings
  - [ ] 2-2. Enhance join room page with participant profile setup
  - [ ] 2-3. Implement unified game room page with state-based rendering

- [ ] **3. Game State Components Implementation**

  - [ ] 3-1. Create waiting room component with real-time participant list
  - [ ] 3-2. Create free time component with countdown and instructions
  - [ ] 3-3. Create selection time component with question display and participant selection
  - [ ] 3-4. Create round results component with matching announcements
  - [ ] 3-5. Create final results component with game statistics

- [ ] **4. Layout Components Implementation**

  - [ ] 4-1. Create header component with branding and navigation
  - [ ] 4-2. Create navigation component with breadcrumbs and game progress
  - [ ] 4-3. Create footer component with info and links

- [ ] **5. State Management & Context Implementation**

  - [ ] 5-1. Implement game state provider with React Context
  - [ ] 5-2. Create polling hooks for real-time state synchronization
  - [ ] 5-3. Implement error handling and recovery mechanisms

- [ ] **6. Routing & Navigation Implementation**

  - [ ] 6-1. Implement protected routes and access control
  - [ ] 6-2. Set up dynamic routing with proper validation
  - [ ] 6-3. Implement state-based navigation without URL changes

- [ ] **7. Responsive Design & Accessibility Implementation**

  - [ ] 7-1. Implement mobile-first responsive design
  - [ ] 7-2. Add accessibility features and keyboard navigation
  - [ ] 7-3. Optimize touch interactions and gestures

- [ ] **8. Performance & SEO Optimization**
  - [ ] 8-1. Implement code splitting and lazy loading
  - [ ] 8-2. Set up dynamic metadata and Open Graph tags
  - [ ] 8-3. Optimize images and implement caching strategies

## Plan

### Main Pages & Layout Strategy

**1. Global Layout Setup (`app/layout.tsx`)**

- Follow Next15 server component patterns with async props
- Set up Shadcn theme provider with semantic classes
- Configure global providers (GameStateProvider, ErrorBoundary)
- Include Sonner toaster and metadata configuration

**2. Homepage Enhancement (`app/page.tsx`)**

- Server component with improved landing page design
- Clear call-to-action buttons for "방 만들기" / "방 참가하기"
- Game rules explanation with engaging visuals
- Responsive hero section with semantic theming

### Game Room Pages Strategy

**1. Room Creation Flow (`app/create-room/page.tsx`)**

- Server component importing CreateRoomClient component
- Enhanced form with game settings (participants, rounds)
- Immediate host profile setup integration
- Auto-redirect to waiting room after creation

**2. Room Join Flow (`app/join-room/page.tsx`)**

- Server component importing JoinRoomClient component
- Room code validation with real-time feedback
- Complete participant profile setup flow
- Capacity checking and error handling

**3. Unified Game Room (`app/room/[code]/page.tsx`)**

- Single page with conditional component rendering based on game state
- Use existing game state enums (waiting, free_time, selection_time, etc.)
- Polling-based real-time state synchronization
- Seamless state transitions without page navigation

### Game State Components Strategy

**1. Component Structure (`components/game-states/`)**

- Separate components for each game state following ui.rules
- Client components with "use client" directive
- Business logic separation using custom hooks
- Consistent props interface across state components

**2. State Components Design**

- `waiting-room.tsx`: Real-time participant list, host controls
- `free-time.tsx`: Countdown timer, conversation encouragement
- `selection-time.tsx`: Question display, participant grid, message input
- `round-results.tsx`: Matching announcements with animations
- `final-results.tsx`: Game statistics and popularity rankings

### State Management Strategy

**1. Game State Provider**

- React Context for global game state management
- Polling hooks for real-time synchronization
- Optimistic updates for better UX
- Error recovery mechanisms

**2. Data Flow Pattern**

- Server actions for state changes
- Polling for state synchronization
- Local state for UI interactions
- Context for cross-component state sharing

### Layout & Navigation Strategy

**1. Layout Components (`components/layout/`)**

- Header with logo, page indicators, settings
- Navigation with breadcrumbs and progress indicators
- Footer with minimal branding and links
- Consistent spacing and semantic theming

**2. Routing Strategy**

- Protected routes using middleware for room access
- Dynamic route validation with proper error pages
- State-based component switching without URL changes
- Page refresh handling with state restoration

### Responsive & Accessibility Strategy

**1. Mobile-First Design**

- All components designed for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized layouts for different orientations

**2. Accessibility Features**

- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Appropriate ARIA labels and roles
- Color contrast compliance

### Performance & SEO Strategy

**1. Performance Optimizations**

- Code splitting for game state components
- Lazy loading for non-critical components
- Image optimization for character assets
- Efficient polling intervals and cleanup

**2. SEO Implementation**

- Dynamic metadata based on page context
- Open Graph tags for social sharing
- Structured data for game content
- Proper robots.txt and sitemap

## Log

**ANALYZE Phase - Task 0007: Frontend Pages & Routing**

✅ Read ui.rules.mdc - Next15 server component patterns, client/server separation, shadcn UI usage, semantic theming
✅ Read form-ui.rules.mdc - react-hook-form with zod validation patterns, Controller pattern
✅ Read server-action.rules.mdc - server action patterns with Drizzle RLS client

**Task 0007 Requirements Summary:**

- **Main Page Structure**: 홈페이지, 전역 레이아웃 with providers and theming
- **Game Room Pages**: 방 생성/참가 페이지, 통합 게임방 with state-based component rendering
- **Game State Components**: 대기실, 자유시간, 지목시간, 라운드 결과, 최종 결과 컴포넌트
- **Layout Components**: 헤더, 네비게이션, 푸터 with consistent branding
- **Routing & Navigation**: 보호된 라우트, 동적 라우팅, 상태 기반 네비게이션
- **Responsive Design**: 모바일 퍼스트, 접근성, 반응형 그리드
- **State Management**: React Context for game state, polling hooks, error boundaries
- **Performance**: 코드 스플리팅, 이미지 최적화, 캐싱 전략
- **SEO**: 동적 메타데이터, Open Graph, 구조화된 데이터

Moving to BLUEPRINT phase...

**BLUEPRINT Phase Completed**
✅ Decomposed task into 8 main items with detailed implementation strategy
✅ Created comprehensive plan following ui.rules, form-ui.rules, and server-action.rules
✅ Defined component structure, state management, routing, and optimization strategies

**CONSTRUCT Phase - Starting Item 1: Main Pages & Layout Implementation**

**Item 1 COMPLETED**: Main Pages & Layout Implementation
✅ 1-1. Created improved homepage with game intro, features, how-to-play, stats, and CTA sections
✅ 1-2. Implemented global layout with Korean locale, comprehensive metadata, SEO tags, and Sonner toaster
✅ 1-3. Added ErrorBoundary component with user-friendly error UI and recovery options
✅ Added loading.tsx with branded loading animation and progress indicators
✅ ESLint validation passed, git committed

**Starting Item 2: Game Room Pages Implementation**

## ArchiveLog

**Previous Task Completed**: Participant management system implementation - backend schemas, server actions, and frontend UI components completed successfully.

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
