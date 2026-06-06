---
title: Linetra — 專案提交日誌 (Commit Log)
version: v1.0
date: 2026-06-06
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
