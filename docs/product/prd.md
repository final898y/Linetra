---
title: LINE 通報追蹤管理平台 — 產品需求文件 (PRD)
version: v2.0
date: 2026-06-08
status: Approved
author: Product Manager
---

# LINE 通報追蹤管理平台 — 產品需求文件 (PRD)

> [!NOTE]
> 本文件為 Linetra 平台的產品需求規格書，詳細定義了 MVP 階段的核心功能、雙重期限管理、狀態機移轉與介面互動規範。

| 屬性 (Metadata)               | 內容 (Content)                 |
| :---------------------------- | :----------------------------- |
| **文件版本 (Version)**        | `v2.0`                         |
| **文件狀態 (Status)**         | 已核准 (Approved)              |
| **建立日期 (Created Date)**   | 2026-05-24                     |
| **最後更新 (Last Updated)**   | 2026-06-08                     |
| **主要作者 (Author)**         | Product Manager                |
| **產品階段 (Target Stage)**   | 最小可行性產品 (MVP)           |
| **目標平台 (Platform)**       | 網頁應用程式 (Web Application) |
| **優先裝置 (Device)**         | 桌面優先 (Desktop First)       |
| **驗證機制 (Authentication)** | Google OAuth 2.0               |
| **使用模式 (Usage)**          | 單人優先，保留多人擴充能力     |

---

## 目錄

1. 術語表（Glossary）
2. 產品概述（Product Overview）
3. 使用者角色與 User Stories
4. 產品範圍（Scope）
5. 核心 Domain Model
6. 時間模型（Time Model）
7. 案件生命週期狀態機（State Machine）
8. 功能需求（Functional Requirements）
9. 模板系統規格（Template System）
10. 資料模型（Data Model）
11. API Contract
12. 錯誤狀態目錄（Error State Catalog）
13. 畫面流程（Screen Flow）
14. 非功能需求（Non-Functional Requirements）
15. 提醒系統詳細設計（Reminder System Detail）
16. 瀏覽器通知授權流程
17. 驗收條件（Acceptance Criteria）
18. 風險與待確認事項
19. 開發優先順序
20. MVP 開發時程建議
21. 產品設計原則

---

## 一、術語表（Glossary）

本表定義系統中所有關鍵術語的精確含義，供工程師、測試與 PM 共同對齊。

| 術語         | 英文對應                   | 精確定義                                                                                     |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| 通報         | Report                     | 一筆透過本系統建立、發送至 LINE 群組的行政通知，為系統核心實體                               |
| 案件         | Case / Report Record       | 通報建立後在系統中被追蹤的紀錄，與「通報」為同一資料實體，強調其可追蹤性                     |
| 案由         | Subject                    | 案件的簡短主旨描述，對應報文中「案由：」欄位                                                 |
| 通報單位     | Department                 | 發出通報的行政單位名稱（如：主計處、人事處、產發處）                                         |
| 真實截止時間 | Actual Due                 | 案件真正不可逾越的最終期限（actual_due_at），通常為上級機關或系統的硬性截止時間              |
| 對外通知期限 | Announced Due              | 對各下屬單位公告的繳交期限（announced_due_at），通常早於真實截止時間，用以保留催收與整理緩衝 |
| 通報發送時間 | Sent At                    | 使用者實際點擊「發送」並將通報複製至 LINE 的時間（sent_at）                                  |
| 處務會議     | Department Affairs Meeting | 行政單位定期召開的內部會議，需事前收集各科室報告資料的特定通報類型                           |
| 市長週報     | Mayor's Weekly Report      | 每週向市長提報的固定格式週報，需定期向各科室收集資料的特定通報類型                           |
| 面報         | Executive Briefing         | 向主管或長官進行的報告，通常需要準備簡報資料（如：產發處面報）                               |
| 公告通知     | Public Announcement        | 不限期限收件、以告知為主要目的的通報類型，格式與案件通報不同                                 |
| 繳交方式     | Submission Method          | 下屬單位回傳資料的方式，如：紙本核章、檔案回傳、線上表單、系統填報                           |
| Pending List | 待辦清單                   | 顯示所有未完成案件的清單頁面                                                                 |
| 狀態         | Status                     | 案件當前所處的生命週期階段（Pending / Completed / Overdue / Archived）                       |
| 重要旗標     | Importance Flag            | 標記案件為重要等級，觸發 LINE 通報中「【重要】」前綴                                         |
| 提醒規則     | Notification Rule          | 定義何時、以何種方式觸發通知的規則物件                                                       |
| 去重         | Deduplication              | 防止同一提醒規則在同一時間點多次觸發的機制                                                   |

---

## 二、產品概述（Product Overview）

### 2.1 產品背景

目前行政與跨部門溝通大量依賴 LINE 群組進行案件通報與通知，但實務上存在以下問題：

**問題一：通報格式不一致**
不同人員使用不同格式，導致重要資訊不明顯、閱讀成本高、承辦人需花費大量時間排版。

**問題二：缺乏後續追蹤能力**
通報發送後無法追蹤完成狀態，容易遺漏案件、難以掌握進度。

**問題三：Deadline 管理困難**
行政實務存在「真實截止時間」與「對外通知期限」的差異，單一 deadline 造成混亂，不符行政實務。

| 類型         | 說明               | 範例                     |
| ------------ | ------------------ | ------------------------ |
| 真實截止時間 | 真正不可超過的期限 | 市府收件截止：5/26 17:00 |
| 對外通知期限 | 對各單位要求的時間 | 公告期限：5/25 下班前    |
| 通報發送時間 | 實際通知時間       | 發送紀錄                 |

**問題四：缺乏視覺化管理**
無法快速查看未完成事項、即將到期案件，或使用行事曆檢視工作分布。

### 2.2 產品目標

| 代號 | 目標             | 說明                                               |
| ---- | ---------------- | -------------------------------------------------- |
| G1   | 標準化通報格式   | 建立統一模板，提升 LINE 通報一致性與可讀性         |
| G2   | 案件追蹤能力     | 讓通報成為可追蹤的任務資料，而非消失於 LINE 訊息流 |
| G3   | 智慧期限管理     | 同時管理真實截止時間、對外通知期限、發送時間       |
| G4   | 視覺化待辦管理   | 快速掌握未完成事項、即將到期案件、工作量分布       |
| G5   | 降低案件遺漏風險 | 透過 Rule-based 提醒與視覺化管理降低漏辦率         |

### 2.3 成功指標（KPI）

| 指標               | 基準值（Baseline）    | 目標值     | 量測方式                                   |
| ------------------ | --------------------- | ---------- | ------------------------------------------ |
| 通報建立時間       | 約 5 分鐘（人工排版） | ≤ 2.5 分鐘 | 系統記錄表單開啟到複製成功的時間差         |
| 案件逾期率         | 待蒐集（上線前問卷）  | 降低 30%   | 每月 Overdue 案件數 / 總案件數             |
| 通報格式一致性     | 0%（無系統）          | 100%       | 透過本系統建立的通報視為 100%              |
| 使用者每週使用頻率 | 0                     | ≥ 5 次/週  | 系統 Session 紀錄                          |
| 到期提醒成功送達率 | N/A                   | ≥ 95%      | notification_logs 中 status=success 的比例 |
| 重複通知發生次數   | N/A                   | 0          | notification_logs 中重複送達紀錄數         |

> 注意：Baseline 數值需於產品上線前，透過使用者訪談或觀察記錄取得。

---

## 三、使用者角色與 User Stories

### 3.1 MVP 主要使用者：行政承辦人

**身份描述**：負責跨單位通報、追蹤案件進度、管理行政 deadline 的行政人員。

**主要痛點**：排版費時、容易忘記截止時間、不知道哪些案件還沒完成。

---

### 3.2 User Stories

#### 通報建立（FR-01）

**US-01-01（核心）**
As a 行政承辦人，
I want to 選擇通報模板並填入基本資訊後，自動產生格式化的 LINE 通報文字，
So that 我可以省去手動排版的時間，並確保通報格式一致。

- **Happy Path**：選擇模板 → 填入必填欄位 → 點擊產生 → 預覽正確 → 一鍵複製 → 貼至 LINE
- **Edge Case 1**：使用者未填必填欄位 → 顯示欄位錯誤提示，阻止產生
- **Edge Case 2**：announced_due_at 晚於 actual_due_at → 顯示警告，要求確認

**US-01-02（模板選擇）**
As a 行政承辦人，
I want to 根據不同業務類型選擇對應模板（一般案件、處務會議、市長週報、面報、公告通知），
So that 不同類型的通報可以有適合的欄位與格式，減少不必要的欄位。

- **Edge Case**：切換模板時，已填欄位若在新模板中不存在，需提示使用者資料將被清除

**US-01-03（重要標記）**
As a 行政承辦人，
I want to 將特定案件標記為「重要」，
So that LINE 通報中會自動加上「【重要】」前綴，提高受通知者的注意力。

---

#### 案件儲存（FR-02）

**US-02-01（自動儲存）**
As a 行政承辦人，
I want to 在點擊「複製通報」後系統自動儲存此案件，
So that 我不需要額外手動儲存，案件自動進入追蹤清單。

- **Edge Case**：儲存失敗時，系統仍需允許使用者複製通報文字，並顯示儲存失敗提示

**US-02-02（狀態更新）**
As a 行政承辦人，
I want to 手動將案件標記為「已完成」或「已封存」，
So that 我的待辦清單可以保持整潔，只顯示真正需要處理的案件。

**US-02-03（案件編輯）**
As a 行政承辦人，
I want to 在案件發送後仍可編輯案件資料（如修正期限或補充說明），
So that 資訊更新時不需要重新建立案件。

- **Edge Case**：已完成案件被編輯期限後，狀態不應自動重置

---

#### 待辦清單（FR-03）

**US-03-01（待辦檢視）**
As a 行政承辦人，
I want to 在首頁看到所有未完成案件，按照緊急程度排列，
So that 我可以快速掌握今天或這週最需要關注的事項。

- **Edge Case**：無待辦案件時，顯示空狀態圖與鼓勵文字

**US-03-02（篩選與搜尋）**
As a 行政承辦人，
I want to 依照狀態篩選案件（全部/未完成/已完成/即將到期/已逾期/重要），
So that 我可以快速定位特定類別的案件。

---

#### 行事曆（FR-04）

**US-04-01（行事曆檢視）**
As a 行政承辦人，
I want to 以月/週/日行事曆的形式看到各案件的 announced_due_at，
So that 我可以直覺地看出某段時間的工作密度，提前安排工作順序。

- **Edge Case**：同一天有超過 3 個案件時，行事曆格子顯示「+N 件」折疊，點擊展開

---

#### 提醒系統（FR-05）

**US-05-01（到期前提醒）**
As a 行政承辦人，
I want to 在案件到期前的特定時間點，收到瀏覽器通知，
So that 我不會因為忙碌而忘記尚未完成的案件。

- **Edge Case 1**：案件已完成時，到期後的提醒不應觸發
- **Edge Case 2**：使用者關閉瀏覽器，下次開啟時顯示錯過的提醒摘要

**US-05-02（自訂提醒規則）**
As a 行政承辦人，
I want to 為每個案件設定多條提醒規則（如：三天前、一天前、當天早上），
So that 不同重要程度的案件可以有不同的提醒策略。

---

#### 帳號（FR-06）

**US-06-01（Google 登入）**
As a 行政承辦人，
I want to 使用我的 Google 帳號登入，不需要記憶額外的帳號密碼，
So that 我可以快速、安全地存取系統。

- **Edge Case**：Google OAuth 授權被拒絕時，顯示明確的錯誤訊息與重試按鈕

---

## 四、產品範圍（Scope）

### 4.1 MVP 範圍（Phase 1）

| 功能     | 子功能               | 說明                                         |
| -------- | -------------------- | -------------------------------------------- |
| 通報建立 | 5 種模板             | 一般案件、處務會議、市長週報、面報、公告通知 |
| 通報建立 | LINE 格式產生        | 依模板產生格式化文字                         |
| 通報建立 | 一鍵複製             | 複製至剪貼簿                                 |
| 資料儲存 | 案件 CRUD            | 新增、查詢、編輯、狀態更新                   |
| 資料儲存 | 狀態管理             | Pending / Completed / Overdue / Archived     |
| 待辦管理 | Pending List         | 含篩選、排序                                 |
| 行事曆   | 月/週/日 檢視        | 以 announced_due_at 為主                     |
| 提醒系統 | Rule-based Reminder  | 可設定多條規則                               |
| 提醒系統 | Browser Notification | MVP 通知管道                                 |
| 帳號     | Google OAuth         | 登入/登出                                    |

### 4.2 明確排除（Out of Scope for MVP）

| 功能                | 預計版本 | 說明                             |
| ------------------- | -------- | -------------------------------- |
| Email 通知          | Phase 2  | —                                |
| LINE Messaging API  | Phase 2  | —                                |
| 多人協作 / 任務指派 | Phase 3  | —                                |
| 附件管理            | Phase 2  | —                                |
| 全文搜尋            | Phase 2  | —                                |
| 報表 / Excel 匯出   | Phase 2  | —                                |
| 手機版 UI           | Phase 2  | 目前 Desktop First，可用但不優化 |

---

## 五、核心 Domain Model

```
User
 └── Reports (1..*)
      ├── ReportItems (1..*)       ← 繳交方式、說明、備註等條列項目
      ├── NotificationRules (0..*) ← 提醒規則
      └── NotificationLogs (0..*) ← 提醒紀錄
```

| Entity           | 中文         | 說明                                               |
| ---------------- | ------------ | -------------------------------------------------- |
| User             | 使用者       | Google OAuth 登入的系統使用者                      |
| Report           | 通報案件     | 每一筆被建立並追蹤的通報                           |
| ReportItem       | 通報條列項目 | 通報內的結構化子項目（繳交方式、詳細說明、備註等） |
| NotificationRule | 提醒規則     | 定義何時觸發通知                                   |
| NotificationLog  | 提醒紀錄     | 每次通知嘗試的執行紀錄                             |

---

## 六、時間模型（Time Model）

### 6.1 三個時間欄位定義

| 欄位               | 中文         | 是否必填 | 說明                                               |
| ------------------ | ------------ | -------- | -------------------------------------------------- |
| `actual_due_at`    | 真實截止時間 | 是       | 案件真正不可逾越的最終期限                         |
| `announced_due_at` | 對外通知期限 | 是       | 對各下屬單位公告的繳交期限，通常早於 actual_due_at |
| `sent_at`          | 通報發送時間 | 否       | 使用者實際點擊複製並確認發送的時間，系統自動記錄   |

### 6.2 Overdue 判斷邏輯

- 系統以 **`announced_due_at`** 作為 Overdue 判斷基準
- 理由：使用者視角的到期時間是「對外通知期限」，逾越此時間即為行政上的逾期
- Cron Job 每 **10 分鐘**執行一次掃描，將符合以下條件的案件狀態自動更新為 `Overdue`：
  - `status = 'Pending'`
  - `announced_due_at < NOW()（UTC）`

### 6.3 顯示文字計算規則（Computed Field，不存 DB）

以 `announced_due_at` 轉換為使用者友善的顯示文字：

| 條件              | 顯示格式               | 範例                   |
| ----------------- | ---------------------- | ---------------------- |
| 今天，12:00       | `今天中午前`           | —                      |
| 今天，17:00–18:00 | `今天下班前`           | —                      |
| 今天，其他時間    | `今天 HH:MM 前`        | `今天 15:00 前`        |
| 明天              | `明天（週X）HH:MM 前`  | `明天（週三）17:00 前` |
| 2–6 天後          | `下週X HH:MM 前`       | `下週二 17:00 前`      |
| 7 天以上          | `MM/DD（週X）HH:MM 前` | `5/29（週四）17:00 前` |
| 已逾期            | `已逾期 X 天`          | `已逾期 2 天`          |

### 6.4 時間處理規範

- **Backend**：所有 Datetime 欄位一律以 **UTC** 儲存
- **Frontend**：顯示前一律轉換為使用者的 **Local Time**（`Intl.DateTimeFormat`）
- **禁止**：字串比較時間、混用 UTC 與 Local Time、使用 `Date.toString()` 比較

---

## 七、案件生命週期狀態機（State Machine）

### 7.1 狀態定義

| 狀態        | 說明                                                |
| ----------- | --------------------------------------------------- |
| `Pending`   | 案件已建立，尚未完成                                |
| `Completed` | 使用者手動標記為完成                                |
| `Overdue`   | `announced_due_at` 已過期且仍未完成（系統自動轉換） |
| `Archived`  | 使用者手動封存，從主要待辦清單移除                  |

### 7.2 狀態轉換規則

```
[建立]
  → Pending（初始狀態）

Pending
  → Completed（使用者點擊「標記完成」）
  → Overdue（系統 Cron Job：announced_due_at < NOW 且仍為 Pending）
  → Archived（使用者點擊「封存」）

Completed
  → Pending（使用者點擊「重新開啟」）
  → Archived（使用者點擊「封存」）

Overdue
  → Completed（使用者點擊「標記完成」，即使逾期仍可完成）
  → Archived（使用者點擊「封存」）

Archived
  → Pending（使用者點擊「還原」，若 announced_due_at 已過，仍還原為 Pending，系統下次 Cron 再評估）
  → [無法直接刪除，只能 Archive]
```

### 7.3 業務規則說明

- **不支援直接刪除**：防止誤刪，改以 Archive 隱藏
- **逾期仍可完成**：行政上逾期繳交仍應被記錄
- **Archived 可還原**：還原後重新進入 Pending，等待系統判斷是否仍逾期
- **Completed 不自動回到 Overdue**：已完成的案件即使編輯了期限，也不自動降回 Pending 或 Overdue，需使用者手動重新開啟

---

## 八、功能需求（Functional Requirements）

### FR-01 通報格式產生器

**功能描述**：使用者選擇模板並填入表單後，系統產生標準化 LINE 通報文字，使用者可預覽並一鍵複製。

**共用欄位規格（全模板適用）**

| 欄位             | 型別     | 必填               | 驗證規則                                                   |
| ---------------- | -------- | ------------------ | ---------------------------------------------------------- |
| 模板類型         | Enum     | 是                 | 必須為五種模板之一                                         |
| 是否重要         | Boolean  | 否                 | 預設 false                                                 |
| actual_due_at    | Datetime | 是                 | 不可為過去時間（允許當天）；不可為空                       |
| announced_due_at | Datetime | 是（公告通知除外） | 不可晚於 actual_due_at（若晚於，顯示警告但允許確認後繼續） |

**欄位驗證詳細規則**

| 欄位                           | 長度/格式       | 其他規則                                       |
| ------------------------------ | --------------- | ---------------------------------------------- |
| 通報單位（department）         | 2–50 字元       | 不可含特殊符號 `<>{}`                          |
| 案由（subject）                | 2–100 字元      | 不可為空白字串                                 |
| 連結（link）                   | URL 格式        | 需符合 `https://` 前綴；可為空                 |
| 詳細說明各條（detail items）   | 每條 1–500 字元 | 最多 20 條                                     |
| 備註各條（note items）         | 每條 1–200 字元 | 最多 10 條                                     |
| 繳交方式（submission methods） | 每條 2–50 字元  | 最多 10 種；至少 1 種（面報/市長週報模板必填） |
| announced_due_at               | ISO 8601        | 精確到分鐘；不限時區（前端轉 UTC 送後端）      |

**行為規則**

- 點擊「產生通報」前，系統先執行前端驗證，不通過則不呼叫 API
- 成功產生後，系統顯示預覽區，使用者確認後點擊「複製」
- 複製成功後，顯示 Toast 提示「已複製至剪貼簿」，並詢問「是否儲存此案件？」
- 使用者可在不儲存的情況下直接複製（唯讀使用）

---

### FR-02 通報資料儲存

**功能描述**：將通報儲存為可追蹤案件，支援新增、查詢、編輯、狀態更新。

**儲存觸發方式**：

- 使用者在「複製後確認」對話框選擇「儲存」
- 使用者在表單直接點擊「儲存草稿」（不需先產生）

**可編輯欄位（已儲存後）**：`department`、`subject`、`actual_due_at`、`announced_due_at`、`importance_flag`、ReportItems 所有內容

**不可編輯欄位**：`sent_at`（自動記錄，不可手動修改）、`created_at`

**業務規則**：

- 編輯已完成案件的期限，狀態維持 `Completed`，不自動降回 Pending
- `sent_at` 記錄第一次「複製」操作的時間，重複複製不更新
- 草稿狀態（已儲存但未複製）`sent_at` 為 null

---

### FR-03 Pending List（待辦清單）

**功能描述**：以清單形式顯示所有案件，支援篩選與排序。

**顯示欄位**

| 欄位                     | 說明                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| 重要旗標                 | 圓點標示                                                               |
| 案由                     | 主要識別文字                                                           |
| 通報單位                 | 次要資訊                                                               |
| 對外通知期限（顯示格式） | 相對時間文字（見時間模型）                                             |
| 剩餘時間                 | 距 announced_due_at 的倒數（色碼：紅<1天 / 橙<3天 / 綠≥3天 / 灰=完成） |
| 狀態 Badge               | Pending / Completed / Overdue / Archived                               |
| 操作按鈕                 | 標記完成、封存、編輯                                                   |

**排序規則（預設）**

1. 重要且未完成（`importance_flag=true` + `status=Pending or Overdue`），依 announced_due_at 升冪
2. 一般未完成（`status=Pending or Overdue`），依 announced_due_at 升冪
3. 已完成（`status=Completed`），依 updated_at 降冪
4. 已封存（`status=Archived`），不顯示（需切換篩選）

**篩選條件**

| 篩選值   | 說明                                             |
| -------- | ------------------------------------------------ |
| 全部     | 除 Archived 外全部                               |
| 未完成   | status = Pending                                 |
| 已完成   | status = Completed                               |
| 即將到期 | announced_due_at 在 72 小時內 + status = Pending |
| 已逾期   | status = Overdue                                 |
| 重要案件 | importance_flag = true                           |
| 已封存   | status = Archived                                |

**分頁規則**：每頁顯示 20 筆，超過 20 筆時顯示分頁控制列或無限捲動（前端決定實作方式）。

---

### FR-04 Calendar View（行事曆）

**功能描述**：以行事曆形式顯示案件，使用 `announced_due_at` 作為顯示日期。

**支援模式**：月檢視、週檢視、日檢視

**顯示欄位（行事曆事件）**：案由（截斷後加 ...）、重要旗標（紅點）、狀態色碼

**折疊規則**：

- 月檢視：同一天超過 3 筆時，顯示前 2 筆 + 「+N 件」按鈕，點擊展開 Popover
- 週/日檢視：全部顯示

**互動**：

- 點擊事件 → 開啟案件詳情側邊欄（Slide-over）
- 點擊空白日期 → 快速建立新案件（預帶日期）

**效能規範**：Calendar 查詢範圍最大為 3 個月（前後各 1.5 個月），超過範圍需分段請求。

---

### FR-05 Rule-based Reminder System

詳見「十五、提醒系統詳細設計」。

---

### FR-06 Authentication（帳號系統）

**功能描述**：使用 Google OAuth 2.0 進行身份驗證。

**登入流程**：

1. 使用者點擊「以 Google 登入」
2. 跳轉至 Google 授權頁面
3. 使用者同意授權
4. 系統取得 `google_id`、`email`、`name`、`avatar_url`
5. 若 `google_id` 不存在 → 建立新 User 記錄
6. 若 `google_id` 已存在 → 更新 `email`、`name`、`avatar_url`（可能變更）
7. 發放 JWT，有效期 7 天，支援 Refresh Token

**登出行為**：清除 Client 端 JWT；後端 Refresh Token 加入黑名單。

**Session 管理**：JWT 存放於 HttpOnly Cookie，防止 XSS 竊取。

---

## 九、模板系統規格（Template System）

### 模板概覽

| 模板 ID | 模板名稱   | 主要用途         | 核心差異                         |
| ------- | ---------- | ---------------- | -------------------------------- |
| T1      | 一般案件   | 通用行政通報     | 通報單位可選填                   |
| T2      | 處務會議   | 收集處務會議資料 | 含「會議時間」欄位、無通報單位   |
| T3      | 市長週報   | 每週固定週報收集 | 必填線上表單連結、無通報單位     |
| T4      | 產發處面報 | 面報簡報資料收集 | 含「議程項目」列表、通報單位必填 |
| T5      | 公告通知   | 公告性質通知     | 無期限欄位、格式完全不同         |

---

### T1 一般案件（案件通報）

**表單欄位**

| 欄位             | 必填 | 說明                               |
| ---------------- | ---- | ---------------------------------- |
| 通報單位         | 否   | 若填寫，顯示於通報中               |
| 案由             | 是   | 案件主旨                           |
| actual_due_at    | 是   | 真實截止時間                       |
| announced_due_at | 是   | 對外通知期限                       |
| 繳交方式         | 否   | 可新增多條（checkbox 選項 + 自訂） |
| 詳細說明         | 否   | 可新增多條                         |
| 備註             | 否   | 可新增多條                         |
| 是否重要         | 否   | 預設否                             |

**輸出格式（重要案件 + 有通報單位 + 全欄位）**：

```
【重要】
【 案 件 通 報 】
~~~~~~~~~~~~~~~~~~~~~~~~~~
通報單位：人事處
案由：本府約用人員調整薪資調查表
期限：下週二 17:00 下班前
~~~~~~~~~~~~~~~~~~~~~~~~~~
繳交方式：
- 紙本核章
- 檔案回傳
~~~~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
1. 請依照附件格式填寫薪資調查表
2. 如有異動請於期限前回傳
備註：
1. 如有疑問請洽人事處分機 1234
~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**輸出格式（非重要 + 無通報單位 + 只有必填）**：

```
【 案 件 通 報 】
~~~~~~~~~~~~~~~~~~~~~~~~~~
案由：第三季預算執行報告繳交
期限：5/30（週五）17:00 下班前
~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**規則**：

- `【重要】` 只在 `importance_flag=true` 時顯示
- `通報單位：` 只在 `department` 非空時顯示
- `繳交方式：` 區塊只在至少 1 條時顯示
- `詳細說明：` 區塊只在至少 1 條時顯示
- `備註：` 區塊只在至少 1 條時顯示
- 分隔線 `~~~~~~~~~~~~~~~~~~~~~~~~~~` 固定顯示（共 3 條）

---

### T2 處務會議

**表單欄位**

| 欄位             | 必填 | 說明                                                   |
| ---------------- | ---- | ------------------------------------------------------ |
| 案由             | 是   | 預設填入「處務會議資料填報」，可修改                   |
| 會議時間         | 是   | 處務會議舉行的日期時間（格式：MM/DD（週X）下午 HH:MM） |
| announced_due_at | 是   | 繳交期限                                               |
| actual_due_at    | 是   | 真實截止時間                                           |
| 雲端連結         | 是   | Google Sheets 或其他填報連結                           |
| 備註             | 否   | 可新增多條                                             |
| 是否重要         | 否   | 預設否                                                 |

**輸出格式**：

```
【重要】
【 案 件 通 報 】
~~~~~~~~~~~~~~~~~~~~~~~~~~
案由：處務會議資料填報
期限：2026/05/19 (明天) 12:00 中午前
~~~~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
1. 本週處務會議 訂於05/19(明天) 下午2：30
2. 請各位填妥本週處務會議資料，雲端連結:
https://docs.google.com/...
備註：
無
~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**規則**：

- 「詳細說明」的第 1 條固定為「本週處務會議 訂於{會議時間}」（系統自動產生）
- 「詳細說明」的第 2 條固定為連結文字（系統自動產生）
- 無「通報單位」欄位
- 若備註為空，顯示「無」

---

### T3 市長週報

**表單欄位**

| 欄位             | 必填 | 說明                         |
| ---------------- | ---- | ---------------------------- |
| 案由             | 是   | 預設「本週市長週報」，可修改 |
| announced_due_at | 是   | 繳交期限                     |
| actual_due_at    | 是   | 真實截止時間                 |
| 線上表單連結     | 是   | Google Sheets 週報填寫連結   |
| 備註             | 否   | 可新增多條                   |
| 是否重要         | 否   | 預設否                       |

**輸出格式**：

```
【重要】
【 案 件 通 報 】
~~~~~~~~~~~~~~~~~~~~~~~~~~
案由：本週市長週報
期限：2026/05/21 (明天) 12:00 中午前
~~~~~~~~~~~~~~~~~~~~~~~~~~
繳交方式：
- 線上表單
~~~~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
1. 請至「https://docs.google.com/...」填妥本週週報內容。
備註：
無
~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**規則**：

- 「繳交方式」固定為「線上表單」（不可修改）
- 「詳細說明」第 1 條固定格式：`請至「{連結}」填妥本週週報內容。`
- 若備註為空，顯示「無」

---

### T4 產發處面報

**表單欄位**

| 欄位             | 必填 | 說明                                 |
| ---------------- | ---- | ------------------------------------ |
| 通報單位         | 是   | 如「產發處處長」                     |
| 案由             | 是   | 如「本周產業發展處市長面報簡報資料」 |
| announced_due_at | 是   | 繳交期限                             |
| actual_due_at    | 是   | 真實截止時間                         |
| 繳交方式         | 是   | 至少 1 種                            |
| 議程項目         | 是   | 至少 1 條（本週例會報告事項）        |
| 備註             | 否   | 可新增多條                           |
| 是否重要         | 否   | 預設否                               |

**輸出格式**：

```
【重要】
【 案 件 通 報 】
~~~~~~~~~~~~~~~~~~~~~~~~~~
通報單位：產發處處長
案由：本周產業發展處市長面報簡報資料
期限：2026/05/20 12:00 中午前
~~~~~~~~~~~~~~~~~~~~~~~~~~
繳交方式：
- 檔案回傳
~~~~~~~~~~~~~~~~~~~~~~~~~~
本週產發處例會報告事項：
1. 香山市場可行性評估進度
2. 啤酒節籌辦進度
3. 南寮舊港特色公廁改造工程進度與期程
4. 中正市場期程規劃
備註：
無
~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**規則**：

- 「本週{department}例會報告事項：」標題中的 department 取自「通報單位」欄位
- 「例會報告事項」區塊取代原本的「詳細說明」區塊
- 若備註為空，顯示「無」

---

### T5 公告通知

**表單欄位**

| 欄位         | 必填 | 說明                                 |
| ------------ | ---- | ------------------------------------ |
| 通報單位     | 是   | 發布公告的單位                       |
| 標題         | 是   | 公告標題（對應輸出中的「標題：」）   |
| 內容（多段） | 是   | 支援多段落，每段落可含標題與條列項目 |
| 期限說明     | 否   | 若有期限，以文字形式嵌入內容中       |
| 是否重要     | 否   | 預設否                               |

> 注意：公告通知**不使用** `announced_due_at` 欄位，期限以文字形式寫入內容，不進行 Overdue 自動判斷。

**輸出格式**：

```
【 公 告 通 知 】
通報單位：主計處
標題：請於 115 年 5 月 29日(五)下班前，完成 SBA 特種基金系統帳號填報
內容：
一、 限期內申請（即日起至115年5月29日(五)下班前）
-申請方式：請點選下方連結填寫Google表單。
-線上填報連結：https://forms.gle/xranHQPHrhp6m4pLA
-表單填寫說明：
1.已有EBAS帳號者：
請於表單第一題勾選「有」，並勾選擬申請之權限基金，並至EBAS申請SBA權限。
2.無EBAS帳號者：請於表單第一題勾選「無」，請填報相關欄位。

二、 逾期後申請
申請方式：改填紙本申請書，並完成單位內部核章程序後，將紙本送至主計處決算科。
```

**規則**：

- 格式為 `【 公 告 通 知 】`（無 `【重要】` 前綴，即使重要旗標為 true）
- 不顯示分隔線 `~~~~~~~~~~~~~~~~~~~~~~~~~~`
- 內容段落為自由文字，使用者自行撰寫

---

## 十、資料模型（Data Model）

### 10.1 users

| 欄位       | 型別                | 說明                    |
| ---------- | ------------------- | ----------------------- |
| id         | UUID PK             | —                       |
| google_id  | VARCHAR(255) UNIQUE | Google OAuth 唯一識別碼 |
| email      | VARCHAR(255)        | 使用者 Email            |
| name       | VARCHAR(100)        | 使用者姓名              |
| avatar_url | TEXT                | 頭像 URL                |
| created_at | TIMESTAMPTZ         | UTC                     |
| updated_at | TIMESTAMPTZ         | UTC                     |

### 10.2 reports

| 欄位              | 型別                                                                | 說明                                                     |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| id                | UUID PK                                                             | —                                                        |
| user_id           | UUID FK → users.id                                                  | —                                                        |
| template_type     | ENUM('general','meeting','weekly_report','briefing','announcement') | 模板類型                                                 |
| department        | VARCHAR(100)                                                        | 通報單位（可空）                                         |
| subject           | VARCHAR(200)                                                        | 案由                                                     |
| formatted_content | TEXT                                                                | 最後一次產生的格式化通報文字（快取，非 source of truth） |
| actual_due_at     | TIMESTAMPTZ                                                         | UTC；公告通知可空                                        |
| announced_due_at  | TIMESTAMPTZ                                                         | UTC；公告通知可空                                        |
| sent_at           | TIMESTAMPTZ                                                         | UTC；第一次複製時記錄                                    |
| importance_flag   | BOOLEAN                                                             | 預設 false                                               |
| status            | ENUM('pending','completed','overdue','archived','deleted')          | 預設 'pending'                                           |
| created_at        | TIMESTAMPTZ                                                         | UTC                                                      |
| updated_at        | TIMESTAMPTZ                                                         | UTC                                                      |

**索引建議**：

- `(user_id, status, announced_due_at)` 複合索引（Pending List 查詢）
- `(announced_due_at, status)` 複合索引（Overdue 掃描）

### 10.3 report_items

| 欄位       | 型別                                                                     | 說明                  |
| ---------- | ------------------------------------------------------------------------ | --------------------- |
| id         | UUID PK                                                                  | —                     |
| report_id  | UUID FK → reports.id ON DELETE CASCADE                                   | —                     |
| item_type  | ENUM('submission_method','detail','note','agenda','link','meeting_time') | 條列項目類型          |
| content    | TEXT                                                                     | 項目內容              |
| sort_order | INTEGER                                                                  | 顯示排序（從 1 開始） |

### 10.4 notification_rules

| 欄位                   | 型別                                             | 說明                                                |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------- |
| id                     | UUID PK                                          | —                                                   |
| report_id              | UUID FK → reports.id ON DELETE CASCADE           | —                                                   |
| trigger_base           | ENUM('announced_due','actual_due','custom_time') | 觸發基準                                            |
| trigger_type           | ENUM('before_due','after_due','exact_time')      | 觸發類型                                            |
| trigger_offset_minutes | INTEGER                                          | 偏移分鐘數（before=正值，after=負值，exact_time=0） |
| trigger_at             | TIMESTAMPTZ                                      | 計算後的觸發時間（UTC），由後端計算並儲存           |
| enabled                | BOOLEAN                                          | 預設 true                                           |
| created_at             | TIMESTAMPTZ                                      | UTC                                                 |

### 10.5 notification_logs

| 欄位         | 型別                               | 說明                                             |
| ------------ | ---------------------------------- | ------------------------------------------------ |
| id           | UUID PK                            | —                                                |
| report_id    | UUID FK → reports.id               | —                                                |
| rule_id      | UUID FK → notification_rules.id    | —                                                |
| dedup_key    | VARCHAR(255)                       | `{report_id}:{rule_id}:{trigger_at_unix}` 去重鍵 |
| triggered_at | TIMESTAMPTZ                        | 實際觸發時間（UTC）                              |
| status       | ENUM('success','failed','skipped') | —                                                |
| channel      | ENUM('browser')                    | MVP 僅 browser                                   |
| result       | TEXT                               | 錯誤訊息或成功描述                               |

**去重索引**：`UNIQUE INDEX ON notification_logs(dedup_key)`

---

## 十一、API Contract

> 版本：v1；Base URL：`/api/v1`；驗證方式：`Authorization: Bearer {JWT}`

### 11.1 Reports API

**GET /reports**

```
Query Params:
  status: pending|completed|overdue|archived|all（預設 all，不含 archived）
  importance: true|false（選填）
  page: integer（預設 1）
  limit: integer（預設 20，最大 100）

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "template_type": "general",
      "department": "人事處",
      "subject": "薪資調查表",
      "announced_due_at": "2026-05-21T04:00:00Z",
      "actual_due_at": "2026-05-22T09:00:00Z",
      "sent_at": "2026-05-19T09:00:00Z",
      "importance_flag": true,
      "status": "pending",
      "created_at": "2026-05-19T09:00:00Z",
      "updated_at": "2026-05-19T09:00:00Z"
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

**POST /reports**

```
Request Body:
{
  "template_type": "general",
  "department": "人事處",
  "subject": "薪資調查表",
  "actual_due_at": "2026-05-22T09:00:00Z",
  "announced_due_at": "2026-05-21T04:00:00Z",
  "importance_flag": true,
  "items": [
    { "item_type": "submission_method", "content": "紙本核章", "sort_order": 1 },
    { "item_type": "detail", "content": "請依附件格式填寫", "sort_order": 1 }
  ]
}

Response 201:
{ "data": { "id": "uuid", ...report fields... } }

Error 400: { "error": "VALIDATION_ERROR", "message": "...", "fields": { "subject": "必填" } }
Error 401: { "error": "UNAUTHORIZED", "message": "..." }
```

**GET /reports/:id**

```
Response 200: { "data": { ...report + items + notification_rules } }
Error 404: { "error": "NOT_FOUND", "message": "案件不存在" }
```

**PATCH /reports/:id**

```
Request Body: 同 POST，所有欄位均為選填（Partial Update）
Response 200: { "data": { ...updated report } }
Error 400: VALIDATION_ERROR
Error 403: FORBIDDEN（不是自己的案件）
Error 404: NOT_FOUND
```

**PATCH /reports/:id/status**

```
Request Body: { "status": "completed"|"pending"|"archived" }
Response 200: { "data": { "id": "uuid", "status": "completed" } }
Error 400: { "error": "INVALID_TRANSITION", "message": "不允許的狀態轉換" }
```

**POST /reports/:id/copy**

```
（記錄 sent_at，若已有 sent_at 則不更新）
Response 200: { "data": { "formatted_content": "...", "sent_at": "..." } }
```

### 11.2 Notification Rules API

**GET /reports/:id/notification-rules**

```
Response 200: { "data": [{ "id": "uuid", "trigger_type": "before_due", "trigger_offset_minutes": 1440, ... }] }
```

**POST /reports/:id/notification-rules**

```
Request Body:
{
  "trigger_base": "announced_due",
  "trigger_type": "before_due",
  "trigger_offset_minutes": 1440,
  "enabled": true
}
Response 201: { "data": { "id": "uuid", "trigger_at": "2026-05-20T04:00:00Z", ... } }
Error 400: { "error": "VALIDATION_ERROR" }
Error 409: { "error": "DUPLICATE_RULE", "message": "相同的提醒規則已存在" }
```

**PATCH /notification-rules/:id**

```
Request Body: { "enabled": false }
Response 200: { "data": { ... } }
```

**DELETE /notification-rules/:id**

```
Response 204
```

### 11.3 Auth API

**POST /auth/google**

```
Request Body: { "code": "google_oauth_code" }
Response 200: { "data": { "user": {...}, "access_token": "...", "expires_in": 604800 } }
Error 401: { "error": "OAUTH_FAILED", "message": "Google 授權失敗" }
```

**POST /auth/refresh**

```
（使用 HttpOnly Cookie 中的 Refresh Token）
Response 200: { "data": { "access_token": "...", "expires_in": 604800 } }
Error 401: { "error": "TOKEN_EXPIRED" }
```

**POST /auth/logout**

```
Response 200
（清除 Refresh Token Cookie，後端加入黑名單）
```

---

## 十二、錯誤狀態目錄（Error State Catalog）

### 12.1 帳號 / 驗證類

| 錯誤代碼        | 觸發情境              | 前端處理                                                 |
| --------------- | --------------------- | -------------------------------------------------------- |
| `OAUTH_FAILED`  | Google OAuth 授權失敗 | 顯示「登入失敗，請再試一次」+ 重試按鈕                   |
| `UNAUTHORIZED`  | JWT 已過期或無效      | 自動嘗試 Refresh；失敗則導向登入頁                       |
| `FORBIDDEN`     | 存取他人資料          | 顯示「無權限存取」錯誤頁                                 |
| `TOKEN_EXPIRED` | Refresh Token 過期    | 清除 Session，導向登入頁，提示「登入已逾期，請重新登入」 |

### 12.2 資料驗證類

| 錯誤代碼             | 觸發情境                         | 前端處理                                     |
| -------------------- | -------------------------------- | -------------------------------------------- |
| `VALIDATION_ERROR`   | 表單欄位格式錯誤                 | 標紅錯誤欄位並顯示具體說明文字               |
| `INVALID_DUE_DATE`   | announced_due_at > actual_due_at | 顯示警告 Banner，允許使用者確認後繼續        |
| `PAST_DUE_DATE`      | actual_due_at 為過去時間         | 阻止提交，紅色提示「截止時間不可為過去時間」 |
| `INVALID_TRANSITION` | 嘗試不允許的狀態轉換             | Toast 提示「目前狀態不允許此操作」           |
| `DUPLICATE_RULE`     | 新增完全相同的提醒規則           | 顯示「已存在相同的提醒規則」錯誤訊息         |

### 12.3 系統 / 儲存類

| 錯誤代碼         | 觸發情境         | 前端處理                                                     |
| ---------------- | ---------------- | ------------------------------------------------------------ |
| `SAVE_FAILED`    | DB 寫入失敗      | Toast 提示「儲存失敗，請稍後再試」；不阻止複製操作           |
| `NOT_FOUND`      | 查詢不存在的案件 | 顯示 404 頁面，附「返回待辦清單」連結                        |
| `INTERNAL_ERROR` | 未預期的後端錯誤 | Toast 提示「系統發生錯誤，請重新整理」；不影響已有的本地資料 |
| `NETWORK_ERROR`  | 網路中斷         | 顯示「網路連線中斷」全頁提示，每 5 秒自動重試一次            |

### 12.4 通知類

| 錯誤代碼                   | 觸發情境                          | 前端處理                                                      |
| -------------------------- | --------------------------------- | ------------------------------------------------------------- |
| `NOTIFICATION_DENIED`      | 使用者拒絕瀏覽器通知授權          | 顯示橫幅說明降級策略（in-app 提示），提供「重新申請授權」按鈕 |
| `NOTIFICATION_UNSUPPORTED` | 瀏覽器不支援 Notification API     | 顯示提示「您的瀏覽器不支援通知功能，請使用 Chrome 或 Edge」   |
| `REMINDER_DELIVERY_FAILED` | 通知送達失敗（log status=failed） | 記錄日誌；下次系統重啟時顯示「您有 N 則未送達的提醒」彙整通知 |

### 12.5 剪貼簿類

| 錯誤代碼           | 觸發情境                       | 前端處理                                   |
| ------------------ | ------------------------------ | ------------------------------------------ |
| `CLIPBOARD_FAILED` | 複製至剪貼簿失敗（部分瀏覽器） | 顯示「請手動複製以下文字」並展示文字選取框 |

---

## 十三、畫面流程（Screen Flow）

### 13.1 主要畫面清單

| 畫面             | 路徑                   | 說明                       |
| ---------------- | ---------------------- | -------------------------- |
| 登入頁           | `/login`               | 未登入時強制跳轉           |
| 待辦清單（首頁） | `/`                    | 主要工作畫面               |
| 新增通報         | `/reports/new`         | 模板選擇 + 表單            |
| 通報預覽         | `/reports/new#preview` | 格式預覽 + 複製            |
| 案件詳情         | `/reports/:id`         | 案件資訊 + 編輯 + 提醒規則 |
| 行事曆           | `/calendar`            | 月/週/日 檢視              |
| 設定             | `/settings`            | 使用者設定（未來擴充）     |

### 13.2 通報建立流程

```
[待辦清單] → 點擊「+ 新增通報」
  → [選擇模板頁] → 選擇 5 種模板之一
  → [表單填寫頁] → 填入必填欄位 → 點擊「產生通報」
      → [前端驗證] → 失敗：標紅欄位 + 錯誤提示
      → [前端驗證] → 通過：顯示預覽區
  → [預覽確認] → 確認格式正確 → 點擊「複製通報」
      → [Clipboard API] → 成功：Toast「已複製至剪貼簿」
                       → 失敗：顯示文字選取框（手動複製降級）
      → [儲存詢問 Dialog] → 「儲存並追蹤」 → POST /reports + POST /copy
                          → 「只複製，不儲存」 → 結束流程
  → [返回待辦清單] → 新案件出現在清單頂端
```

### 13.3 狀態更新流程

```
[待辦清單] → 案件卡片上點擊「 標記完成」
  → [PATCH /reports/:id/status { status: 'completed' }]
  → 成功：卡片移至「已完成」區塊，狀態 Badge 更新
  → 失敗：Toast 錯誤提示，狀態不變
```

### 13.4 首次使用通知授權流程

```
[首次登入後，進入待辦清單]
  → [延遲 3 秒] → 顯示「啟用提醒通知」引導 Banner
  → [使用者點擊「啟用」]
      → [Notification.requestPermission()]
      → granted：隱藏 Banner，Toast「提醒通知已啟用」
      → denied：隱藏 Banner，顯示「已拒絕通知，如需啟用請至瀏覽器設定」
      → dismissed（關閉 Banner）：記錄 localStorage，7 天內不再顯示
```

---

## 十四、非功能需求（Non-Functional Requirements）

### NFR-01 效能

| 指標                     | 需求     | 量測方式             | 資料量假設  |
| ------------------------ | -------- | -------------------- | ----------- |
| 首頁載入時間（LCP）      | < 3 秒   | Lighthouse           | 100 筆案件  |
| 通報格式產生時間（前端） | < 0.5 秒 | Performance API      | 20 條 items |
| Pending List 查詢時間    | < 1 秒   | Server response time | 1000 筆案件 |
| Calendar 查詢時間        | < 2 秒   | Server response time | 90 天範圍   |
| API 一般回應時間         | < 500ms  | P95                  | —           |

**分頁規範**：

- Pending List 預設每頁 20 筆，最大 100 筆
- Calendar 查詢範圍最大 92 天（約 3 個月）
- 超過上限需分段請求，前端負責合併顯示

**搜尋效能邊界**：

- 單使用者案件上限：無硬性上限，但 > 5000 筆時效能不保證
- 建議歸檔超過 1 年的案件以維持查詢效能

### NFR-02 可維護性

- 遵循 SOLID 原則
- 模組化：UI 層、Domain 層、Scheduler 層、Persistence 層明確分離
- Reminder System 作為獨立模組，不與 CRUD 邏輯耦合
- 所有業務邏輯集中於 Service 層，Controller 僅處理 HTTP 轉換

### NFR-03 時間處理一致性

- Backend：所有 TIMESTAMPTZ 以 UTC 儲存
- Frontend：所有顯示時間透過 `Intl.DateTimeFormat` 轉為使用者 Local Time
- 禁止：字串比較時間、`Date.toString()` 比較、混用 UTC/Local

### NFR-04 通知去重

- 去重鍵：`{report_id}:{rule_id}:{trigger_at_unix_timestamp}`
- 利用資料庫 UNIQUE INDEX 強制保障，應用層不依賴
- 重複嘗試（如 Cron 重試）觸發時，`notification_logs.status = 'skipped'`

### NFR-05 安全性

| 項目             | 實作方式                                               |
| ---------------- | ------------------------------------------------------ |
| 身份驗證         | Google OAuth 2.0 + JWT                                 |
| API 授權         | 每個 API 驗證 JWT 的 `user_id` 與資源的 `user_id` 一致 |
| XSS 防護         | CSP Header + React/Vue 預設 escaping                   |
| Input Validation | 前端 + 後端雙層驗證                                    |
| CSRF 防護        | SameSite=Strict Cookie                                 |
| SQL Injection    | 使用 ORM（Prisma/TypeORM）參數化查詢                   |
| Rate Limiting    | `/auth/*` 每分鐘最多 10 次請求                         |

---

## 十五、提醒系統詳細設計（Reminder System Detail）

### 15.1 架構概覽

```
[Cron Job - 每 10 分鐘]
  → 掃描 notification_rules WHERE trigger_at <= NOW+10min AND enabled=true
  → 過濾已送過的（JOIN notification_logs ON dedup_key）
  → 建立 Notification Task → 推入 Queue
  → Worker 消費 Queue → 送出 Browser Notification
  → 寫入 notification_logs（success/failed/skipped）
```

### 15.2 trigger_at 計算規則

| trigger_base  | trigger_type | trigger_at 計算                     |
| ------------- | ------------ | ----------------------------------- |
| announced_due | before_due   | `announced_due_at - offset_minutes` |
| announced_due | after_due    | `announced_due_at + offset_minutes` |
| actual_due    | before_due   | `actual_due_at - offset_minutes`    |
| actual_due    | after_due    | `actual_due_at + offset_minutes`    |
| custom_time   | exact_time   | 使用者直接指定的時間點              |

**trigger_at 更新時機**：當 `announced_due_at` 或 `actual_due_at` 被更新時，系統自動重新計算所有關聯規則的 `trigger_at`。

### 15.3 已完成案件的處理

- 案件標記為 `Completed` 或 `Archived` 後，所有未觸發的規則 `enabled` 自動設為 `false`
- Worker 消費任務前再次確認案件狀態，若已完成則 `status=skipped`

### 15.4 離線 / 錯過提醒處理

| 情境                         | 處理方式                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| 使用者關閉瀏覽器時有提醒觸發 | 記錄 `notification_logs.status=failed`（Browser Notification 無法送達）             |
| 使用者下次開啟系統           | 系統查詢最近 24 小時內 `status=failed` 的 logs，顯示「您有 N 則錯過的提醒」彙整通知 |
| Cron Job 宕機後恢復          | 重新執行時補掃 `trigger_at <= NOW`，未送的補送；已超過 2 小時的標記 skipped         |

### 15.5 預設提醒規則

建立新案件時，系統自動建立以下預設規則（使用者可修改/刪除）：

| 規則          | trigger_base  | trigger_type | offset              |
| ------------- | ------------- | ------------ | ------------------- |
| 三天前提醒    | announced_due | before_due   | 4320 分鐘           |
| 一天前提醒    | announced_due | before_due   | 1440 分鐘           |
| 當天早上 9 點 | custom_time   | exact_time   | 當天 09:00（Local） |

若 `announced_due_at` 距今不足 3 天，跳過「三天前提醒」的自動建立。

---

## 十六、瀏覽器通知授權流程

### 16.1 授權狀態判斷

| Notification.permission | 系統行為                                   |
| ----------------------- | ------------------------------------------ |
| `'granted'`             | 直接啟用，無需再次請求                     |
| `'default'`             | 顯示引導 Banner，等待使用者主動點擊        |
| `'denied'`              | 顯示說明文字，不再請求，提供瀏覽器設定引導 |
| 不支援 Notification API | 顯示「瀏覽器不支援通知功能」提示           |

### 16.2 請求時機

- **不在頁面載入時立即請求**（避免觸發瀏覽器自動封鎖）
- 首次登入後，延遲 3 秒顯示引導 Banner
- 使用者點擊 Banner 上的「啟用通知」按鈕後，才呼叫 `Notification.requestPermission()`

### 16.3 降級策略

當通知被拒絕或不支援時：

| 降級層次 | 實作方式                                                            |
| -------- | ------------------------------------------------------------------- |
| L1       | In-app 紅點 Badge（頂部導覽列顯示未讀提醒數）                       |
| L2       | 首頁「即將到期」區塊置頂顯示（距 announced_due_at < 24 小時的案件） |
| L3       | 頁面 `<title>` 顯示 `(3) 待辦 - LINE 通報系統`（表示 3 件即將到期） |

### 16.4 重新授權引導

使用者可在「設定頁 → 通知設定」：

- 查看當前授權狀態
- 若為 denied，顯示各主流瀏覽器（Chrome/Edge/Firefox/Safari）的設定路徑說明

---

## 十七、驗收條件（Acceptance Criteria）

### AC-01 通報格式產生

**Given** 使用者選擇「一般案件」模板，填入：通報單位「人事處」、案由「薪資調查表」、actual_due_at「2026-05-22 17:00」、announced_due_at「2026-05-21 17:00」、勾選「重要」、繳交方式「紙本核章」
**When** 點擊「產生通報」
**Then**

- 在 500ms 內顯示預覽區
- 預覽文字包含 `【重要】`、`【 案 件 通 報 】`、`通報單位：人事處`、`案由：薪資調查表`、`期限：明天（週四）17:00 下班前`（假設今天週三）、`繳交方式：`、`- 紙本核章`
- 分隔線正確顯示（`~~~~~~~~~~~~~~~~~~~~~~~~~~`）
- 「複製」按鈕可點擊

**Given** 未填「案由」必填欄位
**When** 點擊「產生通報」
**Then** 案由欄位顯示紅框 + 錯誤文字「案由為必填欄位」，不呼叫產生邏輯

**Given** announced_due_at 晚於 actual_due_at
**When** 點擊「產生通報」
**Then** 顯示橙色警告「對外通知期限晚於真實截止時間，請確認是否正確」+ 「仍要繼續」按鈕

---

### AC-02 通報複製與儲存

**Given** 使用者預覽正確的通報文字
**When** 點擊「複製通報」
**Then**

- 複製成功：Toast 顯示「已複製至剪貼簿 」（持續 3 秒）
- 系統記錄 `sent_at = 當前 UTC 時間`
- 顯示 Dialog：「要將此案件加入追蹤清單嗎？」

**Given** 使用者點擊「儲存並追蹤」
**When** API 儲存成功
**Then** 案件出現在 Pending List 頂端，狀態為「Pending」

**Given** API 儲存失敗（DB 錯誤）
**When** 點擊「儲存並追蹤」
**Then** Toast 顯示「儲存失敗，請稍後再試」；使用者可關閉 Dialog，通報文字已在剪貼簿（不影響 LINE 操作）

---

### AC-03 Pending List

**Given** 系統中有 3 筆案件：1 筆重要且明天到期、1 筆一般後天到期、1 筆已完成
**When** 進入 Pending List（篩選=全部）
**Then**

- 顯示順序：重要且明天到期 → 一般後天到期 → 已完成
- 重要案件左側有紅色重要指示點
- 明天到期的案件剩餘時間顯示橙色
- 已完成案件有「已完成」Badge

**Given** 使用者選擇篩選「未完成」
**When** 篩選
**Then** 只顯示 2 筆未完成案件，已完成案件不顯示

---

### AC-04 狀態轉換

**Given** 一筆 Pending 案件
**When** 點擊「標記完成」
**Then** 案件狀態變為 Completed，PATCH API 回傳 200，UI 即時更新（樂觀更新）

**Given** announced_due_at 已過，案件仍為 Pending
**When** Cron Job 執行（最多延遲 10 分鐘）
**Then** 案件狀態自動更新為 Overdue，Pending List 中顯示「已逾期」Badge（使用者下次重整後可見）

**Given** 嘗試直接刪除案件
**When** API DELETE /reports/:id
**Then** 回傳 405 Method Not Allowed（系統不支援刪除）

---

### AC-05 Reminder 正確觸發

**Given** 案件 announced_due_at = 明天 17:00，設有「一天前提醒」規則（trigger_at = 今天 17:00）
**When** Cron Job 在今天 17:00-17:10 執行
**Then**

- 產生一筆 Browser Notification，標題含案由名稱
- notification_logs 新增一筆 status=success
- 同一 dedup_key 不會再次觸發

**Given** 案件已標記為 Completed，但提醒規則的 trigger_at 尚未到
**When** trigger_at 時間點到達
**Then** Worker 檢查案件狀態，確認已完成，notification_logs 記錄 status=skipped，不發送通知

---

### AC-06 Google OAuth 登入

**Given** 使用者尚未登入，前往任何頁面
**When** 系統重定向至 `/login`
**Then** 顯示「以 Google 登入」按鈕

**Given** 使用者點擊「以 Google 登入」並完成 Google 授權
**When** 回調完成
**Then**

- 後端建立或更新 User 記錄
- 發放 JWT（HttpOnly Cookie）
- 導向首頁（Pending List）

**Given** Google OAuth 失敗（使用者取消授權）
**When** 回調含 error 參數
**Then** 留在 `/login`，顯示「登入失敗：Google 授權未完成，請再試一次」

---

### AC-07 Calendar View

**Given** 當月有 5 個案件，其中某天有 4 個
**When** 進入月檢視行事曆
**Then**

- 每個案件以色塊顯示於其 announced_due_at 對應日期
- 案件數 > 3 的日期顯示前 2 筆 + 「+2 件」，點擊展開 Popover 顯示全部

**Given** 使用者點擊行事曆上的空白日期
**When** 點擊
**Then** 快速建立 Dialog 開啟，announced_due_at 預帶點擊的日期

---

### AC-08 Browser Notification 授權

**Given** 使用者首次登入，Notification.permission = 'default'
**When** 3 秒後
**Then** 顯示「啟用提醒通知」引導 Banner，不自動呼叫 requestPermission

**Given** 使用者點擊「啟用通知」
**When** 瀏覽器授權 Dialog 出現並使用者選擇「拒絕」
**Then** Banner 隱藏；顯示「通知已被拒絕，您可前往瀏覽器設定開啟」說明；in-app Badge 作為降級顯示

---

## 十八、風險與待確認事項

| 項目                    | 狀態              | 說明                                                    |
| ----------------------- | ----------------- | ------------------------------------------------------- |
| LINE API 整合方式       | Pending (Phase 2) | 直接透過 Messaging API 發送 vs 使用者手動貼上           |
| 多人協作設計            | Pending (Phase 3) | 案件共享範圍？通報單位 vs 個人帳號                      |
| 公告通知的 Overdue 機制 | 確認中            | 公告通知無 announced_due_at，目前不參與 Overdue 判斷    |
| Mobile 版 UX            | Pending (Phase 2) | 目前 Desktop First，行動裝置可用但不優化佈局            |
| Refresh Token 儲存策略  | 技術決策          | HttpOnly Cookie vs DB 黑名單，需與工程師確認            |
| Cron Job 平台           | 技術決策          | Node-cron vs Serverless Scheduled Functions vs pg_cron  |
| 錯過提醒的推送時間窗口  | 待確認            | 24 小時內的錯過提醒是否補送？目前規格為彙整顯示，不補送 |

---

## 十九、開發優先順序（Priority）

| 功能                          | Priority | Sprint   |
| ----------------------------- | -------- | -------- |
| Google Login + DB 建立        | P0       | Sprint 1 |
| 通報生成（T1 一般案件）       | P0       | Sprint 1 |
| 通報儲存 + 狀態管理           | P0       | Sprint 1 |
| Pending List（基本）          | P0       | Sprint 2 |
| 其他 4 種模板（T2–T5）        | P0       | Sprint 2 |
| 案件編輯 + 狀態轉換           | P0       | Sprint 2 |
| Reminder System               | P1       | Sprint 3 |
| Browser Notification 授權流程 | P1       | Sprint 3 |
| Calendar View                 | P1       | Sprint 4 |
| Pending List 篩選/排序進階    | P1       | Sprint 4 |
| Overdue Cron Job              | P1       | Sprint 3 |
| Error State 完整處理          | P1       | Sprint 4 |
| LINE API 整合                 | P2       | Phase 2  |
| Email 通知                    | P2       | Phase 2  |
| 多人協作                      | P3       | Phase 3  |

---

## 二十、MVP 開發時程建議

| Week   | 主要內容                                       | 驗收里程碑                      |
| ------ | ---------------------------------------------- | ------------------------------- |
| Week 1 | Google OAuth、DB Schema、基礎 API 框架         | 可登入，DB 建立完成             |
| Week 2 | 一般案件模板（T1）、通報格式產生、複製功能     | AC-01、AC-02 通過               |
| Week 3 | 其他 4 種模板（T2-T5）、通報儲存、案件 CRUD    | AC-02 全通過                    |
| Week 4 | Pending List、篩選排序、狀態轉換、Overdue Cron | AC-03、AC-04 通過               |
| Week 5 | Reminder System、Browser Notification 授權流程 | AC-05、AC-08 通過               |
| Week 6 | Calendar View                                  | AC-07 通過                      |
| Week 7 | Error State 完整實作、Edge Case 處理           | Error Catalog 所有情境驗收      |
| Week 8 | UI 調整、效能優化、整合測試、QA                | NFR-01 效能指標達標、全 AC 通過 |

---

## 二十一、產品設計原則

**P1. Facts over Presentation**
資料庫只存真實資料（actual_due_at、announced_due_at 等絕對時間），不存 UI 顯示結果（「明天下班前」等相對時間文字）。顯示邏輯屬於前端計算，不影響資料完整性。

**P2. Rule-based Reminder，不用單一 notify_at**
提醒系統採用可擴展的規則架構，支援多條提醒、多種觸發基準，為未來 Email / LINE 通知預留擴展空間，不因 MVP 簡化架構。

**P3. Single User First, Multi-user Ready**
初期單人使用，但 `user_id` 貫穿所有資料模型，API 授權以 `user_id` 隔離，架構上不需要大改即可支援多人協作。

**P4. Separation of Concerns**
| 模組 | 責任 |
|---|---|
| UI（Vue 3） | 顯示、互動、表單驗證 |
| Service 層 | 業務邏輯、狀態機 |
| Scheduler | 提醒觸發（獨立模組） |
| Repository 層 | DB 存取（不含業務邏輯） |

**P5. Graceful Degradation**
每個功能失敗時提供降級體驗：通知授權拒絕 → in-app Badge；DB 儲存失敗 → 不阻止複製；Clipboard 失敗 → 手動複製框。核心使用流程（產生通報 → 複製 → 貼至 LINE）不被任何非核心功能阻斷。
