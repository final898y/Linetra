---
title: Linetra — 專案提交日誌 (Commit Log)
version: v1.0
date: 2026-06-22
status: Active
author: Linetra Dev Team
---

# Linetra 專案提交日誌 (Commit Log)

此檔案由 Git Hook 自動更新，記錄每次提交的詳細內容。

---

### [2026-05-24 12:44:13 +0800] chore: initialize project structure and setup Git pre-commit hook

**變更檔案 (Changed Files):**

- .gitignore
- README.md
- docs/product/prd.md
- docs/project_architecture_guidelines.md
- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/pre_commit_markdown_helper.py

---

### [2026-05-24 18:29:31 +0800] fix(git-hooks): resolve pre-commit hook failure on Windows pwsh

- Simplify python detection logic in pre-commit hook shell script
- Use English messages in hook to avoid encoding issues in Windows Git Bash
- Standardize line endings (LF) for pre-commit file
- Optimize helper script by removing debug prints and improving UTF-8 handling

**變更檔案 (Changed Files):**

- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/pre_commit_markdown_helper.py

---

### [2026-05-24 23:53:27 +0800] feat(git-hooks): add commit-msg and post-commit hooks and MIT license

- Add commit-msg hook to validate conventional commit messages
- Add post-commit hook to automate commit logging in docs/COMMIT_LOG.md
- Add MIT License and update README.md
- Modularize install_hooks.ps1 to support multiple hooks
- Exclude README.md from pre-commit markdown standardization

**變更檔案 (Changed Files):**

- LICENSE
- README.md
- docs/COMMIT_LOG.md
- tools/git-hooks/commit_msg_helper.py
- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/post_commit_log_helper.py
- tools/git-hooks/pre_commit_markdown_helper.py

---

### [2026-05-25 00:06:22 +0800] feat(root): add linetra-standard skill and organize tools/skills directory

- Create tools/skills directory for project-specific Gemini CLI skills
- Add linetra-standard skill with project-compliant YAML headers
- Add packaged .skill file and documentation

**變更檔案 (Changed Files):**

- docs/COMMIT_LOG.md
- tools/skills/README.md
- tools/skills/linetra-standard.skill
- tools/skills/linetra-standard/SKILL.md
- tools/skills/linetra-standard/references/commit_standards.md
- tools/skills/linetra-standard/references/markdown_standards.md

---

### [2026-05-29 00:06:19 +0800] docs: finalize core technical specifications for development

- Add Database Implementation & RLS Policies docs
- Add Edge Functions & Cron Job Design docs
- Add Frontend Architecture & Specs docs
- Add Visual Identity & Design System docs
- Update README.md with technical doc links and Serverless architecture

**變更檔案 (Changed Files):**

- README.md
- docs/COMMIT_LOG.md
- docs/architecture/database_implementation.md
- docs/architecture/edge_functions_design.md
- docs/architecture/system_architecture.md
- docs/design/visual_identity.md
- docs/development/frontend_spec.md

---

### [2026-05-29 23:51:23 +0800] docs: restructure directory according to architecture guidelines

1. Reorganize docs/ into product, architecture, guides, and api categories.
2. Relocate COMMIT_LOG.md to docs/product/ and update post-commit hook.
3. Move guidelines and frontend specs to docs/guides/.
4. Update linetra-standard skill and README.md with new file paths.
5. Initialize compliant skeleton files for OpenAPI, state machine, and user stories.

**變更檔案 (Changed Files):**

- README.md
- docs/api/openapi.yaml
- docs/architecture/database_design.md
- docs/architecture/state_machine.md
- docs/guides/frontend_spec.md
- docs/guides/local_setup.md
- docs/guides/project_architecture_guidelines.md
- docs/product/COMMIT_LOG.md
- docs/product/user_stories.md
- docs/product/visual_identity.md
- tools/git-hooks/post_commit_log_helper.py
- tools/skills/linetra-standard.skill
- tools/skills/linetra-standard/SKILL.md

---

### [2026-06-06 10:18:52 +0800] docs(guides): sync architecture guidelines with serverless design

1. Update directory structure to reflect Supabase/Serverless architecture (replacing Python/FastAPI with supabase/).
2. Sync version to v1.1 and update metadata table.
3. Update commit scopes and branch management strategies.
4. Refresh visual identity guidelines to v2.1 based on latest design system.
5. Ensure all documents follow linetra-standard (Traditional Chinese, no emojis).

**變更檔案 (Changed Files):**

- docs/guides/project_architecture_guidelines.md
- docs/product/COMMIT_LOG.md
- docs/product/visual_identity.md

---

### [2026-06-06 14:30:00 +0800] feat(frontend): bootstrap vue3 application with tailwind v4 and spec v1.1

1. Bootstrap Vue 3 application using Vite and TypeScript.
2. Upgrade to Tailwind CSS v4 using @tailwindcss/vite and CSS-based theme configuration.
3. Install core dependencies: vue-router, pinia.
4. Establish project directory structure (api, router, stores, views, etc.).
5. Update frontend_spec.md to version v1.1 with detailed dev setup and coding standards.
6. Create vue3-ts-eslint-prettier-setup.md as a detailed configuration guide.
7. Implement baseline App.vue with Dual-tone design system (Cream & Dark).

**變更檔案 (Changed Files):**

- docs/guides/frontend_spec.md
- docs/guides/vue3-ts-eslint-prettier-setup.md
- frontend/
- docs/product/COMMIT_LOG.md

---

### [2026-06-06 15:45:00 +0800] feat(frontend): implement core auth, routing, and report management

1. Implement Supabase Auth Layer with `useAuthStore` and `LoginView` (Google OAuth).
2. Configure Vue Router with navigation guards (Auth/Guest) and `MainLayout`.
3. Develop `useReportStore` for report CRUD and `useTimeFormatter` for relative time logic.
4. Implement `useReportTemplate` for generating standardized LINE report text.
5. Create `DashboardView` for report listing and `ReportCreateView` for report submission.
6. Provide `supabase_setup_guide.md` for database initialization (Tables, RLS, Triggers).
7. Fix ESLint errors and ensure TypeScript type safety across all stores and views.

**變更檔案 (Changed Files):**

- docs/guides/frontend_implementation_plan.md
- docs/guides/supabase_setup_guide.md
- frontend/src/api/supabase.ts
- frontend/src/stores/auth.ts
- frontend/src/stores/reports.ts
- frontend/src/router/index.ts
- frontend/src/router/routes.ts
- frontend/src/composables/useTimeFormatter.ts
- frontend/src/composables/useReportTemplate.ts
- frontend/src/views/LoginView.vue
- frontend/src/views/DashboardView.vue
- frontend/src/views/ReportCreateView.vue
- frontend/src/components/layout/MainLayout.vue
- frontend/src/components/common/ReportCard.vue
- frontend/src/types/database.types.ts
- frontend/src/types/models.ts
- docs/product/COMMIT_LOG.md

---

### [2026-06-06 23:08:36 +0800] refactor(frontend): enhance type safety with Zod and strict Database types

- Add Zod schemas for runtime validation in `frontend/src/types/schemas.ts`
- Implement strict typing for database rows and inserts
- Refactor `useReportStore` to use type-safe queries
- Update `ReportCreateView.vue` and `ReportCard.vue` with improved prop types

**變更檔案 (Changed Files):**

- AGENTS.md
- frontend/eslint.config.mjs
- frontend/package-lock.json
- frontend/package.json
- frontend/src/components/common/ReportCard.vue
- frontend/src/stores/reports.ts
- frontend/src/types/database.types.ts
- frontend/src/types/models.ts
- frontend/src/types/schemas.ts
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-07 10:02:05 +0800] feat(auth): integrate logo and refine login page design

- Add logo.svg to LoginView and improve layout for a landing page feel
- Remove default template files and unused icons
- Update Supabase environment variable name to VITE_SUPABASE_PUBLISHABLE_KEY and sync with documentation

**變更檔案 (Changed Files):**

- docs/guides/frontend_spec.md
- docs/guides/supabase_setup_guide.md
- frontend/.env.example
- frontend/public/favicon.svg
- frontend/public/icons.svg
- frontend/public/logo.svg
- frontend/src/api/supabase.ts
- frontend/src/assets/hero.png
- frontend/src/assets/vite.svg
- frontend/src/assets/vue.svg
- frontend/src/components/HelloWorld.vue
- frontend/src/views/LoginView.vue

---

### [2026-06-07 10:27:37 +0800] feat(test,auth,db): add vitest, optimize auth loading, and refine db schema

- Add Vitest and configure unit tests in frontend/tests/
- Implement loading state management in authStore
- Add isProcessing state in LoginView for better UX
- Remove google_id from users table and update documentation

**變更檔案 (Changed Files):**

- docs/architecture/database_design.md
- docs/guides/supabase_setup_guide.md
- frontend/package-lock.json
- frontend/package.json
- frontend/src/stores/auth.ts
- frontend/src/views/LoginView.vue
- frontend/tests/components/common/ReportCard.spec.ts
- frontend/tests/stores/auth.spec.ts
- frontend/vitest.config.ts

---

### [2026-06-07 12:55:00 +0800] feat(frontend): implement RWD layout and Strategy-based report generation

1. Implement RWD design for `MainLayout.vue` with mobile drawer, hamburger menu, and backdrop overlay.
2. Refactor report generation logic using Strategy Pattern in `useReportStrategies.ts` to support extensible templates (General, Meeting, Weekly, Briefing, Announcement).
3. Enhance `ReportCreateView.vue` with dynamic tabs, template-specific fields, and real-time LINE preview.
4. Implement "Stay and Update" (Upsert) logic for report submission to allow continuous editing without page redirect.
5. Add "Default vs Custom" toggle for template fields (link, time) with `localStorage` persistence.
6. Expand `useReportStore` with `updateReport` and `deleteReportItems` methods for database synchronization.
7. Add comprehensive Vitest unit tests for report strategies and template selectors, achieving 100% logic coverage.
8. Optimize type safety by eliminating `any` types and fixing TypeScript compiler errors in frontend views.

**變更檔案 (Changed Files):**

- frontend/src/style.css
- frontend/src/components/layout/MainLayout.vue
- frontend/src/composables/useReportStrategies.ts
- frontend/src/composables/useReportTemplate.ts
- frontend/src/config/reportTemplates.ts
- frontend/src/views/ReportCreateView.vue
- frontend/src/stores/reports.ts
- frontend/tests/composables/useReportStrategies.spec.ts
- frontend/tests/composables/useReportTemplate.spec.ts
- docs/product/COMMIT_LOG.md

### [2026-06-07 13:35:54 +0800] style(frontend): fix ESLint warnings and improve type safety in tests
- Remove unused ChatBubbleBottomCenterTextIcon in ReportCreateView
- Replace 'any' with proper Report type in ReportCard.spec.ts
- Replace @ts-ignore with @ts-expect-error in useReportTemplate.spec.ts
- Ensure workspace passes npm run lint

**變更檔案 (Changed Files):**
- frontend/src/views/ReportCreateView.vue
- frontend/tests/components/common/ReportCard.spec.ts
- frontend/tests/composables/useReportTemplate.spec.ts

---

### [2026-06-07 13:36:12 +0800] feat(frontend): integrate Heroicons and enhance UI/UX
- Replace all emojis and ASCII icons with Heroicons across components
- Add submission method quick-select chips in ReportCreateView
- Implement automatic UI sorting for dynamic report items
- Refactor report templates into a standalone config file
- Optimize Dashboard empty state with SparklesIcon

**變更檔案 (Changed Files):**
- README.md
- docs/product/COMMIT_LOG.md
- docs/product/prd.md
- frontend/package-lock.json
- frontend/package.json
- frontend/src/components/common/ReportCard.vue
- frontend/src/components/layout/MainLayout.vue
- frontend/src/config/reportTemplates.ts
- frontend/src/stores/reports.ts
- frontend/src/types/database.types.ts
- frontend/src/views/DashboardView.vue
- frontend/src/views/LoginView.vue

---

### [2026-06-08 00:21:56 +0800] feat(frontend): implement report editing functionality
- Add fetchReportById and fetchReportItemsById to report store
- Update ReportCreateView to support editing via route parameter
- Define report-edit route
- Add edit button and navigation in DashboardView

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/router/routes.ts
- frontend/src/stores/reports.ts
- frontend/src/views/DashboardView.vue
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-08 00:31:31 +0800] feat(frontend): implement ReportDetailView
- Update ReportDetailView to fetch and display report details
- Add navigation to report edit view
- Add complete status update functionality

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/.gitignore
- frontend/src/views/ReportDetailView.vue

---

### [2026-06-08 20:28:47 +0800] feat(frontend): enhance due date logic and fix date formatting

- Add actual_due_at (internal control) field to ReportCreateView
- Implement auto-calculation for announced_due_at that skips weekends
- Fix useTimeFormatter to correctly distinguish between 'This Week' and 'Next Week' using calendar weeks
- Update date formatting to include MM/DD(週X) for better clarity
- Display actual_due_at in ReportDetailView

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useTimeFormatter.ts
- frontend/src/views/ReportCreateView.vue
- frontend/src/views/ReportDetailView.vue

---

### [2026-06-08 23:18:10 +0800] feat(report): add deleted status and fix missing env white-screen issue

**變更檔案 (Changed Files):**
- README.md
- docs/architecture/database_design.md
- docs/guides/supabase_setup_guide.md
- docs/product/prd.md
- frontend/src/App.vue
- frontend/src/api/supabase.ts
- frontend/src/components/common/ReportCard.vue
- frontend/src/composables/useTimeFormatter.ts
- frontend/src/stores/reports.ts
- frontend/src/types/database.types.ts
- frontend/src/types/schemas.ts
- frontend/src/views/ReportDetailView.vue

---

### [2026-06-09 00:22:04 +0800] feat(dashboard): refactor filter logic with composable for multi-select support

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/ReportFilterPanel.vue
- frontend/src/composables/useReportFilters.ts
- frontend/src/config/reportTypes.ts
- frontend/src/stores/reports.ts
- frontend/src/views/DashboardView.vue
- frontend/src/views/ReportCreateView.vue
- frontend/vercl.json

---

### [2026-06-09 21:53:02 +0800] fix(report): fix timezone mismatch and enhance time display in ReportCard
- Correct timezone handling in ReportCreateView by using dayjs.tz for local parsing
- Convert local input time to UTC ISO string before saving to Supabase
- Unify font style and simplify format in ReportCard deadline display
- Add error handling and logging for status updates in ReportCard and store
- Add unit tests for useTimeFormatter and update ReportCard tests

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/ReportCard.vue
- frontend/src/composables/useTimeFormatter.ts
- frontend/src/stores/reports.ts
- frontend/src/views/ReportCreateView.vue
- frontend/tests/components/common/ReportCard.spec.ts
- frontend/tests/composables/useTimeFormatter.spec.ts

---

### [2026-06-09 22:17:36 +0800] feat(report): enhance ReportCreateView with status editing and better UX
- Add status editing capability in ReportCreateView with manual toggle buttons
- Refactor edit mode detection to prevent state reset and data overwriting
- Optimize deadline auto-fill logic to trigger on @change instead of watch
- Update UI to show 'Edit Case' title and context-specific action buttons

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-09 22:47:33 +0800] feat(ux): improve filter persistence and refine Template mode UI
- Implement filter persistence using localStorage in useReportFilters
- Ensure DashboardView applies stored filters on initial load
- Hide and clear Department field in Template and Announcement modes for cleaner UI

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportFilters.ts
- frontend/src/views/DashboardView.vue
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-09 23:07:31 +0800] feat(dashboard): expand filtering and add top-level sorting controls
- Add sortOrder and hideAnnouncements to filter state with persistence
- Implement real-time sorting and announcement filtering in ReportStore
- Move sort toggle and hide-announcements switch to Dashboard top bar for better UX
- Refactor ReportFilterPanel to focus on multi-select filters

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportFilters.ts
- frontend/src/stores/reports.ts
- frontend/src/views/DashboardView.vue

---

### [2026-06-09 23:23:18 +0800] test(core): add missing unit tests for ReportFilters and ReportStore

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useTimeFormatter.ts
- frontend/tests/composables/useReportFilters.spec.ts
- frontend/tests/composables/useTimeFormatter.spec.ts
- frontend/tests/stores/reports.spec.ts

---

### [2026-06-09 23:38:02 +0800] refactor: extract report form logic into useReportForm composable
- Separate business logic from UI in ReportCreateView
- Improve maintainability and adherence to SRP
- Fix linting and type errors in ReportCreateView and reports test

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportForm.ts
- frontend/src/views/ReportCreateView.vue
- frontend/tests/stores/reports.spec.ts

---

### [2026-06-10 23:12:47 +0800] feat(report): improve deadline formatting and relative time display
- Add formatDeadlineDetailed with semantic suffixes to useTimeFormatter

- Update formatRelative to use '(This Week X)' and '(Next Week X)' bracket styles

- Refactor report strategies to utilize detailed deadline formatting

- Remove typo file vercl.json

- Update unit tests for time formatting and report strategies

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportStrategies.ts
- frontend/src/composables/useTimeFormatter.ts
- frontend/tests/composables/useReportStrategies.spec.ts
- frontend/tests/composables/useTimeFormatter.spec.ts
- frontend/vercl.json

---

### [2026-06-10 23:42:28 +0800] docs: update README.md and refine report strategy separator
- Sync README.md with latest development progress (v1.1)
- Refine SEPARATOR length in useReportStrategies.ts for better visual balance

**變更檔案 (Changed Files):**
- README.md
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportStrategies.ts

---

### [2026-06-13 23:26:56 +0800] feat(report): add internal remarks, multi-select tags, and temporary task template
- Update PRD and Database Design to support remarks (TEXT) and tags (TEXT[])
- Implement TaskStrategy for a new minimal 'task' report template
- Add tag selection UI and internal remarks textarea to the report creation form
- Implement multi-select tag filtering in the dashboard and filter panel
- Display tags on report cards and in the detail view
- Centralize COMMON_TAGS constant in reportTypes.ts for maintainability
- Synchronize frontend TypeScript definitions with the updated database schema

**變更檔案 (Changed Files):**
- docs/architecture/database_design.md
- docs/guides/supabase_setup_guide.md
- docs/product/COMMIT_LOG.md
- docs/product/prd.md
- frontend/src/components/common/ReportCard.vue
- frontend/src/components/common/ReportFilterPanel.vue
- frontend/src/composables/useReportFilters.ts
- frontend/src/composables/useReportForm.ts
- frontend/src/composables/useReportStrategies.ts
- frontend/src/config/reportTemplates.ts
- frontend/src/config/reportTypes.ts
- frontend/src/stores/reports.ts
- frontend/src/types/database.types.ts
- frontend/src/types/models.ts
- frontend/src/views/ReportCreateView.vue
- frontend/src/views/ReportDetailView.vue

---

### [2026-06-13 23:36:06 +0800] feat(report): support custom tag input in report form
- Add addCustomTag logic to useReportForm composable
- Implement custom tag input field with Enter key support in ReportCreateView
- Display non-default tags with a distinct dashed border style
- Ensure all changes pass build and style checks

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/composables/useReportForm.ts
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-13 23:45:56 +0800] test(frontend): expand test coverage for new report features and fix time-dependent tests
- Add comprehensive unit tests for useReportForm (initialization, templates, custom tags)
- Update useReportStrategies tests to cover TaskStrategy
- Update useReportTemplate tests to cover Task mode
- Fix failing useTimeFormatter tests by using relative dates instead of hardcoded ones
- All 37 tests passing

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/tests/composables/useReportForm.spec.ts
- frontend/tests/composables/useReportStrategies.spec.ts
- frontend/tests/composables/useReportTemplate.spec.ts
- frontend/tests/composables/useTimeFormatter.spec.ts

---

### [2026-06-14 00:58:44 +0800] feat(report): enhance tag system and add navigation shortcut
- Support custom tag input in ReportCreateView with Enter key support
- Add 'View Case' button in edit mode for quick navigation to detail view
- Refactor and clean up useReportForm unit tests
- Update commonTags configuration for better usability

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/config/reportTypes.ts
- frontend/src/views/ReportCreateView.vue
- frontend/tests/composables/useReportForm.spec.ts

---

### [2026-06-14 01:41:29 +0800] feat(calendar): implement core calendar logic and grid UI
- Add useCalendar composable for date matrix calculations
- Implement Map-based grouping logic in report store for efficiency
- Create responsive CalendarView and CalendarDay UI components
- Define decoupled CalendarEvent interface in models.ts
- Add comprehensive unit tests for calendar month transitions
- Include detailed calendar implementation plan in docs

**變更檔案 (Changed Files):**
- docs/guides/calendar_implementation_plan.md
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/CalendarDay.vue
- frontend/src/composables/useCalendar.ts
- frontend/src/stores/reports.ts
- frontend/src/types/models.ts
- frontend/src/views/CalendarView.vue
- frontend/tests/composables/useCalendar.spec.ts

---

### [2026-06-14 14:32:24 +0800] test(calendar): add tests for CalendarDayModal
- Add unit tests for Modal rendering, visibility state, and overlay close interaction

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/tests/components/common/CalendarDayModal.spec.ts

---

### [2026-06-14 14:36:31 +0800] feat(calendar): complete modal details view and sync grouping tests
- Implement CalendarDayModal for detailed report listing

- Fix type mismatches in CalendarView

- Add unit tests for report grouping in store

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/CalendarDay.vue
- frontend/src/components/common/CalendarDayModal.vue
- frontend/src/views/CalendarView.vue
- frontend/tests/stores/reports.spec.ts

---

### [2026-06-14 15:47:28 +0800] feat(database): define RLS policies for tagging tables
- Add SELECT, INSERT, UPDATE RLS policies for 'tags' table
- Add SELECT, INSERT, DELETE RLS policies for 'report_tags' table
- Update database documentation with RLS security policies

**變更檔案 (Changed Files):**
- docs/architecture/database_design.md
- docs/guides/dynamic_tagging_plan.md
- docs/guides/supabase_setup_guide.md
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/ReportCard.vue
- frontend/src/stores/reports.ts
- frontend/src/types/database.types.ts
- frontend/src/types/models.ts
- frontend/src/views/CalendarView.vue
- frontend/src/views/ReportCreateView.vue
- frontend/src/views/ReportDetailView.vue

---

### [2026-06-14 16:06:44 +0800] feat(report): implement dynamic tag filtering and popular tags
- Add allUniqueTags and topTags computed properties to ReportStore
- Update ReportFilterPanel with searchable tag input and popular tags section
- Ensure all components are type-safe and build-ready

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/ReportFilterPanel.vue
- frontend/src/stores/reports.ts
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-14 16:19:59 +0800] test(frontend): add tests for store grouping and filter panel
- Add unit tests for ReportStore allUniqueTags and topTags computed properties
- Add component tests for ReportFilterPanel including tag search and popular tags rendering
- Ensure all tests pass

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/src/components/common/ReportFilterPanel.vue
- frontend/src/composables/useReportFilters.ts
- frontend/src/stores/reports.ts
- frontend/src/views/CalendarView.vue
- frontend/src/views/DashboardView.vue
- frontend/tests/components/common/ReportFilterPanel.spec.ts
- frontend/tests/stores/reports.spec.ts

---

### [2026-06-20 00:26:00 +0800] feat(frontend): support redirecting to edit page and remove task template
- Add useRouter to ReportCreateView.vue
- Replace current route with report-edit route after successful creation
- Update success message logic based on creation/update status
- Remove "task" (臨時任務) template entry from reportTemplates and ReportCreateView

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/package-lock.json
- frontend/src/config/reportTemplates.ts
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-20 00:27:48 +0800] feat(frontend): support redirecting to edit page and remove task template

**變更檔案 (Changed Files):**
- docs/product/COMMIT_LOG.md
- frontend/package-lock.json
- frontend/src/config/reportTemplates.ts
- frontend/src/views/ReportCreateView.vue

---

### [2026-06-20 01:46:08 +0800] feat(frontend): add meeting_simple template for general meeting records
- Add new template_type 'meeting_simple' and item types 'location', 'participants', 'materials' to DB schema docs and Supabase setup guide
- Add database migration guide for Supabase SQL Editor (database_migration_20260620_add_meeting_simple.md)
- Extend frontend TypeScript types in database.types.ts, models.ts, and schemas.ts to support new template and item types
- Add meeting_simple config to reportTemplates.ts with fields: meeting_time, location, participants, materials
- Add MeetingSimpleStrategy to useReportStrategies.ts with dayjs-based weekday formatting (e.g. 2026-06-22 (Yi) 14:00)
- Update useReportForm.ts with new item order weights and Chinese labels for new item types
- Update ReportCreateView.vue: add general meeting button, use datetime-local input for meeting_time, hide deadline fields when template is meeting_simple
- Add and update unit tests in useReportStrategies.spec.ts and useReportTemplate.spec.ts (53 tests, all passing)

**變更檔案 (Changed Files):**
- docs/architecture/database_design.md
- docs/guides/database_migration_20260620_add_meeting_simple.md
- docs/guides/supabase_setup_guide.md
- frontend/src/composables/useReportForm.ts
- frontend/src/composables/useReportStrategies.ts
- frontend/src/config/reportTemplates.ts
- frontend/src/types/database.types.ts
- frontend/src/types/models.ts
- frontend/src/types/schemas.ts
- frontend/src/views/ReportCreateView.vue
- frontend/tests/composables/useReportStrategies.spec.ts
- frontend/tests/composables/useReportTemplate.spec.ts

---
