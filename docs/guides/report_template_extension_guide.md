---
title: Linetra 報告模板新增與擴充指南
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Linetra 報告模板新增與擴充指南

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-11-18 |
| **適用範圍 (Scope)** | `frontend` 報告建立、編輯、預覽、篩選與下游行為 |
| **主要入口 (Entry Point)** | `frontend/src/views/ReportCreateView.vue` |

## 1. 文件目的

本文件說明如何在 Linetra 新增一個「模板模式」中的報告模板。未來 AI 或開發者新增模板時，應先閱讀本文件，再依照本文的型別、設定、輸出、測試與驗證流程執行。

本文件描述的是「新增既有模板模式中的模板」，不是新增新的表單模式。一般模式、公告模式與任務模式屬於表單模式；會議、每週報告、簡報與其他固定格式則屬於模板類型。

## 2. 目前架構總覽

報告模板的資料流如下：

```text
TemplateType
    |
    v
REPORT_TEMPLATES
    |
    +--> useReportForm.applyTemplate()
    |       +--> subject 預設值
    |       +--> department 預設值
    |       +--> deadline 預設值
    |       +--> items 欄位與輸入型態
    |
    +--> ReportCreateView.vue
    |       +--> 模板選單
    |       +--> metadata 驅動的欄位顯示
    |
    +--> getReportBehavior()
    |       +--> Calendar 行為
    |       +--> 卡片日期顯示
    |       +--> 詳細頁日期顯示
    |
    +--> reportStrategies/index.ts
            +--> LINE 通報文字輸出
```

主要檔案：

| 檔案 | 職責 |
| :--- | :--- |
| `frontend/src/types/models.ts` | 前端共用 `TemplateType`、`ReportTemplateType`、`ItemType` |
| `frontend/src/types/database.types.ts` | Supabase 資料表的 TypeScript 型別 |
| `frontend/src/config/reportTemplates.ts` | 模板名稱、預設值、items 與行為 metadata |
| `frontend/src/config/reportTypes.ts` | Dashboard 篩選器與報告類型顯示名稱 |
| `frontend/src/composables/useReportForm.ts` | 表單初始化、模板套用、模式切換與 item 管理 |
| `frontend/src/views/ReportCreateView.vue` | 報告建立與編輯畫面 |
| `frontend/src/composables/reportStrategies/index.ts` | `template_type` 與輸出 Strategy 的對應表 |
| `frontend/src/composables/reportStrategies/*.ts` | 各模板的 LINE 文字輸出策略 |
| `frontend/src/config/reportTemplates.ts` 的 `getReportBehavior()` | 非模板類型與模板下游行為的統一入口 |

## 3. 先判斷需求類型

### 3.1 只新增模板

適用情境：

- 仍然使用「模板模式」選單。
- 只是預設 subject、通報單位、期限、items 或 LINE 格式不同。
- 不需要新增一個新的頂層表單分頁。

這是一般新增模板的情況，只需要修改模板 registry、型別、輸出策略與測試。

### 3.2 新增表單模式

適用情境：

- 需要全新的頂層操作流程。
- 欄位與一般報告完全不同。
- 需要獨立的儲存、驗證或畫面生命週期。

這不是單純新增模板，必須另外評估：

- `ReportFormTab` 是否需要新增值。
- `getReportFormTab()` 是否需要新增映射。
- `useReportForm.updateMode()` 是否需要新增模式流程。
- 是否需要新的 View 或獨立元件。
- 資料庫 `template_type` enum 是否需要 migration。

不要為了新增一般模板而新增表單模式。

## 4. 新增模板的標準流程

以下以 `project_update` 作為示例 ID。實際 ID 必須使用小寫 snake_case，且一旦有資料寫入資料庫，不應任意更名。

### Step 1：定義模板 ID

在 `frontend/src/types/models.ts` 的 `TemplateType` 增加常數：

```ts
export const TemplateType = {
  General: 'general',
  Meeting: 'meeting',
  MeetingSimple: 'meeting_simple',
  Weekly: 'weekly_report',
  Briefing: 'briefing',
  YouthPolicyUpdate: 'youth_policy_update',
  ProjectUpdate: 'project_update',
  Announcement: 'announcement',
  Task: 'task',
} as const
```

`ReportTemplateType` 是排除 `general`、`announcement`、`task` 後的模板類型。新增模板會自動屬於 `ReportTemplateType`，但必須同步確認資料庫型別包含該值。

### Step 2：同步資料庫 TypeScript 型別

在 `frontend/src/types/database.types.ts` 的 `reports.template_type` 之 `Row`、`Insert`、`Update` 三處加入新值：

```ts
| 'project_update'
```

如果專案使用 Supabase 型別產生工具，應優先重新產生型別；不要只修改其中一處。若資料庫實際使用 PostgreSQL enum 或 check constraint，也必須先建立對應 migration，再更新產生的 TypeScript 型別。

### Step 3：確認 Zod schema

目前 `frontend/src/types/schemas.ts` 的 `TemplateTypeSchema` 與 `ItemTypeSchema` 是從 `models.ts` 的共用常數建立：

```ts
export const TemplateTypeSchema = z.enum(
  Object.values(TemplateType) as [TemplateType, ...TemplateType[]]
)
```

因此新增 `TemplateType` 常數後，不需要再次手寫相同的 Zod enum 清單，但必須增加 schema 測試，確認新值可以被接受。

若未來 schema 改回手動列舉，則必須同步更新 `TemplateTypeSchema`。

### Step 4：加入 `REPORT_TEMPLATES`

在 `frontend/src/config/reportTemplates.ts` 加入完整模板設定：

```ts
project_update: {
  id: 'project_update',
  name: '專案更新',
  defaultSubject: '專案進度更新',
  defaultDepartment: '專案管理單位',
  defaultAnnouncedDueAt: '2026-12-31T17:00',
  behavior: {
    showDepartment: true,
    showDueDates: true,
    calendarMode: 'deadline',
    initialStatus: 'pending',
  },
  items: [
    {
      item_type: 'submission_method',
      content: '線上表單',
      isCustomizable: false,
    },
    {
      item_type: 'detail',
      content: '請填入第一段說明。',
      isCustomizable: true,
    },
  ],
},
```

### 4.1 設定欄位說明

| 欄位 | 必填 | 說明 |
| :--- | :---: | :--- |
| `id` | 是 | 必須與 registry key、`TemplateType` 值完全一致 |
| `name` | 是 | 模板選單顯示名稱 |
| `defaultSubject` | 是 | 新報告的預設案由 |
| `defaultDepartment` | 否 | 新報告的預設通報單位；只有新報告套用時使用 |
| `defaultAnnouncedDueAt` | 否 | 新報告的預設期限，格式為 `YYYY-MM-DDTHH:mm` |
| `behavior.showDepartment` | 否 | 是否在模板模式顯示通報單位欄位 |
| `behavior.showDueDates` | 否 | 是否在建立頁、卡片與詳細頁顯示期限 |
| `behavior.calendarMode` | 否 | `none`、`deadline` 或 `meeting` |
| `behavior.initialStatus` | 否 | 新報告初始狀態，通常是 `pending` 或 `completed` |
| `items` | 是 | 新報告建立時使用的報告項目 |
| `items[].item_type` | 是 | 必須使用共用 `ItemType` 支援的值 |
| `items[].content` | 是 | 預設內容，可為空字串 |
| `items[].isCustomizable` | 否 | 是否顯示自訂值控制；不代表欄位一定是 readonly |
| `items[].inputType` | 否 | `text`、`textarea` 或 `datetime-local` |

### 4.2 Items 的選擇原則

目前可用的 `ItemType`：

- `submission_method`
- `detail`
- `note`
- `agenda`
- `link`
- `meeting_time`
- `meeting_end_time`
- `location`
- `participants`
- `materials`

若只是新增欄位組合，優先重用既有 `ItemType`。不要為了新模板直接新增 item type，因為新增 item type 可能需要同步：

- 資料庫 enum 或 constraint。
- `models.ts`。
- `schemas.ts`。
- `database.types.ts`。
- `REPORT_ITEM_LABELS`。
- 表單輸入 UI。
- formatter 與 Strategy。
- 相關測試。

如果同一模板需要兩段詳細說明，可以使用兩個 `detail` item；GeneralStrategy 會依照出現順序輸出編號。

## 5. 決定是否新增 Strategy

### 5.1 可重用既有 Strategy

如果新模板的輸出格式與一般案件通報完全相同，可以在：

`frontend/src/composables/reportStrategies/index.ts`

直接重用 `GeneralStrategy`：

```ts
export const strategies: Record<TemplateType, ReportStrategy> = {
  general: new GeneralStrategy(),
  project_update: new GeneralStrategy(),
  // ...
}
```

這是目前 `youth_policy_update` 使用的方式。

### 5.2 新增獨立 Strategy

如果輸出標題、段落順序、欄位格式或特殊規則不同，才新增獨立檔案：

```ts
import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class ProjectUpdateStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    // 只處理輸出格式，不在 Strategy 修改表單或資料庫狀態。
    lines.push(this.formatHeader(report, '專案更新'))
    lines.push(`案由： \`${report.subject}\``)
    lines.push(SEPARATOR)
    return lines.join('\n')
  }
}
```

再於 registry 匯入：

```ts
import { ProjectUpdateStrategy } from './projectUpdateStrategy'

export const strategies: Record<TemplateType, ReportStrategy> = {
  project_update: new ProjectUpdateStrategy(),
}
```

Strategy 不應該：

- 直接讀取 localStorage。
- 修改 `report` 或 `items`。
- 處理表單顯示條件。
- 寫入資料庫。
- 依賴 View 的 ref 或 Pinia store。

## 6. 表單行為規則

`useReportForm.applyTemplate()` 負責：

- 設定 `form.template_type`。
- 套用初始 status。
- 設定目前模板。
- 套用預設 subject。
- 新報告套用 `defaultDepartment` 與 `defaultAnnouncedDueAt`。
- 建立模板 items。
- 套用 item 的 `inputType` 與自訂值行為。

新增模板時，不應修改 `ReportCreateView.vue` 來加入模板 ID 判斷。只有以下情況才需要修改 View：

- 新增一種以前不存在的 input type。
- 新增全新的表單模式。
- metadata 無法描述的共用 UI 行為。

目前應使用 metadata，例如：

```vue
currentTemplateConfig?.behavior?.showDepartment
currentTemplateConfig?.behavior?.showDueDates
item.inputType === 'datetime-local'
```

不要新增這類硬編碼：

```ts
currentTemplate === 'project_update'
```

若某個模板需要特殊行為，優先在 `TemplateBehavior` 或 item metadata 增加可重用欄位。

## 7. 下游行為

### 7.1 Google Calendar

`frontend/src/composables/useFABActions.ts` 使用：

```ts
getReportBehavior(report.template_type).calendarMode
```

選擇方式：

| `calendarMode` | 行為 |
| :--- | :--- |
| `none` | 不應建立 Calendar 事件，若 UI 仍顯示按鈕需另行處理 |
| `deadline` | 使用 `announced_due_at` 或 `actual_due_at`，建立全天事件 |
| `meeting` | 使用 `meeting_time`、`meeting_end_time`，建立有時間的會議事件 |

不要在 Calendar composable 裡直接判斷模板 ID。

### 7.2 ReportCard 與 ReportDetailView

期限顯示使用：

```ts
getReportBehavior(report.template_type).showDueDates
```

只有確定產品需求是「所有同類模板都不顯示期限」時，才將 `showDueDates` 設為 `false`。

### 7.3 卡片樣式

目前 announcement 與 task 的卡片樣式仍保留專屬語意。如果新模板需要新的卡片樣式，先確認是否為真正的產品分類，再考慮新增 metadata，例如 `cardTone`；不要為單一模板新增散落在多個元件的 ID 判斷。

## 8. 測試要求

每個新增模板至少需要以下測試。

### 8.1 Registry 設定測試

在 `frontend/tests/config/reportTemplates.spec.ts` 確認：

- registry key 與 `template.id` 相同。
- `name` 與 `defaultSubject` 不為空。
- items 數量正確。
- item type 與預期順序正確。
- `behavior` 與特殊行為一致。
- 預設通報單位與期限正確。

### 8.2 表單測試

在 `frontend/tests/composables/useReportForm.spec.ts` 確認：

- `applyTemplate()` 可以套用新模板。
- `form.template_type` 正確。
- subject 正確。
- 新報告的 department 與 announced due 正確。
- items 順序、內容與 input type 正確。
- 從其他模板切換過來時，不會保留不應保留的預設值。

### 8.3 Strategy 測試

在 `frontend/tests/composables/useReportStrategies.spec.ts` 確認：

- registry 有新模板的 strategy。
- 輸出包含通報單位、案由、期限、交付方式與詳細說明。
- 多個 `detail` item 的編號正確。
- 輸出格式沒有意外改變既有模板。

### 8.4 Routing 測試

在 `frontend/tests/composables/useReportTemplate.spec.ts` 確認：

- `template_type` 可以找到正確 strategy。
- 未知類型仍 fallback 到 general。

### 8.5 下游行為測試

若模板有特殊行為，補上：

- `useFABActions.spec.ts`：Calendar mode。
- `ReportCard.spec.ts`：期限顯示與卡片樣式。
- `ReportDetailView.spec.ts`：期限欄位。
- 需要時補 `ReportCreateView.spec.ts`：通報單位、期限與 input type 的渲染。

## 9. 驗證指令

先執行新增模板相關的 targeted tests：

```powershell
cd frontend
npx vitest run tests/config/reportTemplates.spec.ts tests/composables/useReportForm.spec.ts tests/composables/useReportTemplate.spec.ts tests/composables/useReportStrategies.spec.ts
```

再執行完整測試：

```powershell
npx vitest run
```

最後執行 type-check 與 production build：

```powershell
npm run build
```

完成條件：

- targeted tests 全部通過。
- 完整測試沒有回歸。
- `vue-tsc` 與 Vite build 通過。
- `git diff --check` 通過。
- 不能以跳過測試、忽略 type error 或修改既有測試預期結果作為修復方式。

## 10. 分階段提交規範

每一個優化或新增模板階段都應獨立提交。每次 commit 前必須：

1. 在 `docs/history/` 建立一份歷史紀錄，例如：

   ```text
   docs/history/YYYY-MM-DD-add-project-update-template.md
   ```

2. 紀錄：
   - 異動原因。
   - 改動方向。
   - 實際修改檔案。
   - targeted tests 結果。
   - 完整 tests 結果。
   - build 結果。
   - `README.md` 是否需要更新。
   - `frontend/README.md` 是否需要更新。
3. 確認根目錄 `README.md` 與 `frontend/README.md` 是否需要同步更新。
4. 執行：

   ```powershell
   git diff --staged
   git diff --staged --check
   ```

5. 使用 Conventional Commits message。
6. 讓 Git Hook 完成 `docs/product/COMMIT_LOG.md` 的自動記錄。

建議 commit message：

```text
feat(frontend): add project update report template
```

本文件不取代 `docs/history/` 的單次變更紀錄，也不取代 `docs/product/COMMIT_LOG.md` 的自動 commit log。

## 11. AI 執行檢查清單

AI 在新增模板前，應先確認：

- [ ] 這是模板，不是新的表單模式。
- [ ] 已選定穩定且不含中文的 snake_case ID。
- [ ] 已更新 `TemplateType`。
- [ ] 已同步 `database.types.ts` 的 Row、Insert、Update。
- [ ] 已確認 `TemplateTypeSchema` 是否由共用常數自動涵蓋新值。
- [ ] 已加入 `REPORT_TEMPLATES`。
- [ ] 已設定 default subject、必要的 department 與期限。
- [ ] 已設定 `showDepartment`、`showDueDates`、`calendarMode`、`initialStatus`。
- [ ] 已確認 item type 都是現有支援值，或已規劃完整 item type migration。
- [ ] 已決定重用既有 Strategy 或新增 Strategy。
- [ ] 已更新 strategy registry。
- [ ] 已更新報告類型篩選與顯示名稱。
- [ ] 沒有在 View、Calendar、Card、Detail 裡新增模板 ID 硬編碼。
- [ ] 已完成 registry、form、strategy、routing 與下游測試。
- [ ] targeted tests 通過。
- [ ] 完整 tests 通過。
- [ ] build 通過。
- [ ] 已建立 `docs/history` 紀錄。
- [ ] 已檢查根目錄與前端 README。
- [ ] 依使用者要求決定是否執行 commit。

## 12. 已完成模板範例

目前已完成的每月模板：

```text
TemplateType: youth_policy_update
顯示名稱：青年政策及資源定期更新
```

其設計重點：

- 使用 GeneralStrategy，避免重複 LINE 輸出程式。
- 顯示通報單位欄位。
- 預填通報單位。
- 預填 `2026-09-30T12:00` 作為範例期限。
- 預填線上表單與兩段詳細說明。
- 使用者每月只需要調整通報單位與期限。

如果未來內容只需要調整日期與通報單位，優先修改該模板的預設值或在 UI 中修改表單值，不要複製一份新的模板，也不要新增另一個 Strategy。
