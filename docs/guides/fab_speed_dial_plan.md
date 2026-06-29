---
title: FAB Speed Dial 功能設計與實作規劃
version: v1.0
date: 2026-06-29
status: Active
author: Linetra Dev Team
---

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-06-29 |

# FAB Speed Dial 功能設計與實作規劃

本文件規劃 Linetra 右下角的 FAB (Floating Action Button) 與 Speed Dial 選單，提供「複製通報內容」與「加入 Google 日曆」兩項快速功能。

## 1. 功能概述

| 項目 | 說明 |
| :--- | :--- |
| **位置** | 頁面右下角固定顯示 |
| **主按鈕** | 圓形 Brand 色（`#a78bfa`）按鈕，顯示 `PlusIcon`，點擊後旋轉 45° |
| **展開選單** | 從底部向上彈出動作列表，每個動作含圖示與文字標籤 |
| **關閉方式** | 點擊任一動作、點擊主按鈕、點擊外部區域、按 Escape |
| **動畫** | TransitionGroup 逐項出現（opacity + translate-y），主按鈕旋轉 |

## 2. 頁面動作對應

| 路由 (`route.name`) | 動作按鈕 | 說明 |
| :--- | :--- | :--- |
| `report-detail` | 複製通報內容、加入 Google 日曆 | 需取得當前 report 資料 |
| `dashboard` | 建立新通報 | 快速跳轉至建立頁 |
| `calendar` | 建立新通報 | 快速跳轉至建立頁 |
| 其他 | 不顯示 FAB | — |

## 3. 前置設定 — Google Cloud Platform

Google Calendar API 需要使用者自行在 GCP 完成以下設定：

### 3.1 啟用 API

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) → 建立新專案（或使用既有專案）
2. 導覽選單 →「API 和服務」→「程式庫」
3. 搜尋 **Google Calendar API** → 點選 → **啟用**

### 3.2 建立 OAuth 2.0 憑證

1. 「API 和服務」→「憑證」→「建立憑證」→「OAuth 用戶端 ID」
2. 應用程式類型：**網頁應用程式**
3. 名稱：`Linetra`
4. 授權的 JavaScript 來源：
   - `http://localhost:5173`（開發環境）
   - `https://your-production-domain.com`（正式環境）
5. 授權重新導向 URI（建議填入，與 JavaScript 來源相同）：
   - `http://localhost:5173`（開發環境）
   - `https://your-production-domain.com`（正式環境）
6. 建立後取得**用戶端 ID (Client ID)**

### 3.3 設定 OAuth 同意畫面

1. 「OAuth 同意畫面」→ 填入應用程式名稱、支援 email
2. 「範圍」→「新增範圍」→ 輸入 `https://www.googleapis.com/auth/calendar.events`
3. 儲存

### 3.4 環境變數

將 Client ID 填入 `frontend/.env`：

```env
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## 4. 新增/修改檔案

| # | 檔案 | 操作 | 說明 |
|---|------|------|------|
| 1 | `src/composables/useFABActions.ts` | ✨ 新增 | 根據 `route.name` 回傳該頁面的動作陣列 |
| 2 | `src/composables/useGoogleCalendar.ts` | ✨ 新增 | 封裝 GIS token 獲取 + Calendar API 建立事件 |
| 3 | `src/components/fab/FABSpeedDial.vue` | ✨ 新增 | 通用 FAB + Speed Dial 元件 |
| 4 | `src/components/layout/MainLayout.vue` | ✏️ 修改 | 引入 FABSpeedDial |
| 5 | `.env.example` | ✏️ 修改 | 新增 `VITE_GOOGLE_CALENDAR_CLIENT_ID` |

## 5. FABSpeedDial.vue 元件設計

### 5.1 Props

```ts
interface FABAction {
  icon: Component
  label: string
  handler: () => void
}
```

### 5.2 主按鈕

- 固定定位：`fixed bottom-6 right-6 z-40`
- 圓形 `w-14 h-14`，背景 `bg-brand`，hover `bg-brand-hover`
- 使用 `PlusIcon`（Heroicon），`open` 時 class `rotate-45` 過渡

### 5.3 動作選單

- `TransitionGroup` 搭配 CSS transition：
  - 進入：`opacity 0 → 1` + `translate-y 8px → 0`，逐項延遲 `50ms * index`
  - 離開：反向
- 每個動作：
  - 圖示按鈕（圓形 `w-10 h-10`）+ 左側文字標籤卡片
  - 水平排列，標籤在按鈕左側

### 5.4 關閉邏輯

- `onMounted` 時註冊 `document.addEventListener('click', handleClickOutside)` 與 `keydown Escape`
- `onUnmounted` 時清除監聽

### 5.5 模板結構

```vue
<template>
  <div ref="fabRef" class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
    <TransitionGroup
      name="fab-action"
      tag="div"
      class="flex flex-col items-end gap-3"
    >
      <button
        v-for="(action, index) in items"
        v-show="open"
        :key="action.label"
        :style="{ transitionDelay: `${index * 50}ms` }"
        class="flex items-center gap-3"
        @click="handleAction(action)"
      >
        <span class="px-3 py-1.5 bg-cream-surface border border-cream-border rounded-lg text-sm font-bold text-cream-text shadow-sm whitespace-nowrap">
          {{ action.label }}
        </span>
        <span class="w-10 h-10 rounded-full bg-cream-surface border border-cream-border flex items-center justify-center shadow-sm text-cream-text hover:bg-cream-hover">
          <component :is="action.icon" class="size-5" />
        </span>
      </button>
    </TransitionGroup>

    <button
      @click="toggle"
      class="w-14 h-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-brand-hover transition-transform duration-200"
      :class="{ 'rotate-45': open }"
    >
      <PlusIcon class="size-7" />
    </button>
  </div>
</template>
```

## 6. useFABActions.ts 設計

```ts
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { PlusIcon, DocumentDuplicateIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

interface FABAction {
  icon: object
  label: string
  handler: () => void
}

export function useFABActions() {
  const route = useRoute()
  const router = useRouter()
  const reportStore = useReportStore()

  const actions = computed<FABAction[]>(() => {
    switch (route.name) {
      case 'report-detail': {
        const report = reportStore.currentReport
        return [
          {
            icon: DocumentDuplicateIcon,
            label: '複製通報內容',
            handler: async () => {
              const text = await reportStore.getFormattedContent(report?.id)
              if (!text) { alert('此案件無格式化內容'); return }
              await navigator.clipboard.writeText(text)
              alert('已複製通報內容')
            },
          },
          {
            icon: CalendarDaysIcon,
            label: '加入 Google 日曆',
            handler: () => { /* 呼叫 useGoogleCalendar().addEvent */ },
          },
        ]
      }
      case 'dashboard':
      case 'calendar':
        return [
          {
            icon: PlusIcon,
            label: '建立新通報',
            handler: () => router.push('/reports/new'),
          },
        ]
      default:
        return []
    }
  })

  return { actions }
}
```

## 7. useGoogleCalendar.ts 設計

採用 Google Identity Services (GIS) 直接在前端取得 token，無需依賴外部 npm 套件。

```ts
import { ref } from 'vue'

interface CalendarEventData {
  summary: string
  description?: string
  due: string  // ISO date string
}

export function useGoogleCalendar() {
  const loading = ref(false)

  const loadGIS = (): Promise<void> =>
    new Promise((resolve) => {
      if (window.google?.accounts) { resolve(); return }
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.onload = () => resolve()
      document.head.appendChild(s)
    })

  const getToken = (clientId: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (r) =>
          r.access_token ? resolve(r.access_token) : reject(new Error('No token')),
      })
      client.requestAccessToken()
    })

  const addEvent = async (clientId: string, event: CalendarEventData) => {
    loading.value = true
    try {
      await loadGIS()
      const token = await getToken(clientId)

      const body = {
        summary: event.summary,
        description: event.description || '',
        start: { date: event.due.split('T')[0] },
        end: { date: event.due.split('T')[0] },
      }

      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) throw new Error('Calendar API error')
      const data = await res.json()
      window.open(data.htmlLink, '_blank')
      alert('已建立日曆事件')
    } catch {
      alert('加入 Google 日曆失敗，請確認 API 設定是否正確')
    } finally {
      loading.value = false
    }
  }

  return { loading, addEvent }
}
```

## 8. MainLayout.vue 修改

### 8.1 Script 區塊新增引入

```ts
import FABSpeedDial from '@/components/fab/FABSpeedDial.vue'
import { useFABActions } from '@/composables/useFABActions'
const { actions } = useFABActions()
```

### 8.2 Template 加入元件

在 `<router-view />` 區塊之後、`</main>` 之前加入：

```vue
<router-view />
</div> <!-- end .p-4... -->

<FABSpeedDial :items="actions" v-if="actions.length > 0" />
```

## 9. 實作順序

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 1 | 建立 `useFABActions.ts` | 確認各路由回傳正確動作陣列 |
| 2 | 建立 `FABSpeedDial.vue` | 測試展開/收起/動畫/外部點擊關閉 |
| 3 | `MainLayout.vue` 引入元件 | FAB 依路由正確顯示/隱藏 |
| 4 | 實作「複製 formatted_content」 | 點擊後檢查 clipboard |
| 5 | 建立 `useGoogleCalendar.ts` | 確認 GIS 彈窗出現 |
| 6 | 串接「加入 Google 日曆」動作 | 建立事件後確認 Calendar |
| 7 | 更新 `.env.example` | — |

## 10. 注意事項

### 10.1 Client ID 暴露風險（FAQ）

**Q: Client ID 寫在前端會不會被盜用？**
A: 不會。OAuth 2.0 Client ID 本來就是設計給公開環境（瀏覽器）使用的，它只是一個應用程式識別碼，不是密鑰。真正的安全依賴於：

- **授權來源限制**：GCP 設定的 JavaScript Origins 綁死了允許的網域，其他網站使用此 Client ID 會直接被 Google 拒絕
- **PKCE 流程**：GIS 使用 PKCE（Proof Key for Code Exchange），即使授權碼被攔截也無法兌換 token
- **使用者親自授權**：每個 Calendar scope 都需要使用者在彈窗中手動點擊同意

簡單說：**Client ID = 你的 LINE ID（公開沒關係），Client Secret = 你的 LINE 密碼（不能外洩）。** 這裡完全不需要 Client Secret。

### 10.2 其他注意事項

- **GIS 載入**: `google.accounts.oauth2` 需要動態載入 Google Identity Services script，`loadGIS()` 確保載入完成後才請求 token
- **CORS**: Google Calendar API 支援前端直接呼叫，無 CORS 問題
- **token 快取**: GIS 會自動快取 token，同一 session 內第二次呼叫不會再彈授權視窗
- **formatted_content 為 null**: Announcement 以外的 template 可能無 `formatted_content`，需改用 `generateLineText()` 即時產生
