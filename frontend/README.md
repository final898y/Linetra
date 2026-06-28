# Linetra Frontend

Linetra 的前端應用程式，提供案件管理、通報建立、行事曆排程與關鍵字搜尋等功能。

## 技術堆疊

| 技術 | 版本 | 說明 |
| :--- | :--- | :--- |
| Vue 3 | ^3.5 | 採用 `<script setup>` Composition API |
| TypeScript | ~6.0 | 全面型別覆蓋 |
| Vite | ^8.0 | 開發伺服器與打包工具 |
| Pinia | ^3.0 | 全域狀態管理 |
| Vue Router | ^4.6 | 前端路由 |
| Supabase JS | ^2.0 | 資料庫、驗證與即時訂閱 |
| Tailwind CSS | ^4.3 | 原子化 CSS 框架 |
| Vitest | ^4.1 | 單元測試框架 |
| Vue Test Utils | ^2.4 | Vue 元件測試工具 |

## 本機開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製範本並填入您的 Supabase 專案資訊：

```bash
cp .env.example .env
```

編輯 `.env`：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

### 4. 其他指令

| 指令 | 說明 |
| :--- | :--- |
| `npm run dev` | 啟動本機開發伺服器（Vite HMR） |
| `npm run build` | 型別檢查（vue-tsc）並打包生產版本 |
| `npm run test` | 執行全部單元測試（Vitest） |
| `npm run lint` | ESLint 語法檢查並自動修正 |
| `npm run format` | Prettier 格式化所有 `.ts` / `.vue` 檔案 |

## 測試

本專案使用 Vitest 搭配 Vue Test Utils 進行單元測試。測試檔案位於 `tests/` 目錄，結構鏡像 `src/`：

```
tests/
├── components/
│   └── common/          # 元件測試
├── composables/         # Composable 邏輯測試
└── stores/              # Pinia Store 測試
```

執行測試：

```bash
npm run test
```

## 專案目錄結構

```
src/
├── api/                 # Supabase 用戶端初始化
├── components/
│   ├── common/          # 可重用元件（ReportCard、ReportFilterPanel、ReportSearchInput 等）
│   └── layout/          # 版面配置元件（MainLayout）
├── composables/         # 共用邏輯（useReportFilters、useReportForm 等）
├── config/              # 靜態設定（reportTypes 定義）
├── router/              # Vue Router 路由設定
├── stores/              # Pinia Store（reports、auth）
├── types/               # TypeScript 型別定義
└── views/               # 頁面元件
    ├── DashboardView.vue
    ├── ReportCreateView.vue
    ├── ReportDetailView.vue
    ├── CalendarView.vue
    ├── SettingsView.vue
    └── LoginView.vue
```

## 核心功能

### 案件看板 (Dashboard)
以卡片格式展示所有待辦案件，支援多種篩選條件組合（狀態、類型、標籤）、排序，以及隱藏公告或已完成案件的快速開關。

### 快速關鍵字搜尋
看板頂部的常駐搜尋框，輸入後自動對案件**標題**與**描述**進行模糊比對，內建 300 毫秒輸入防抖，可與篩選面板的條件同時疊加使用。

### 建立通報
支援多種通報範本類型（一般、會議記錄、公告等），可附加標籤與子項目清單。

### 工作行事曆
以月曆視圖呈現所有案件的到期日，點擊日期可查看當日案件列表。
