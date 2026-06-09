---
title: Linetra — 專案提交日誌 (Commit Log)
version: v1.0
date: 2026-06-09
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
