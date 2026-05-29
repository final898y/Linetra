---
title: Linetra — 視覺規範與組件設計 (Visual Identity & Design System)
version: v1.0
date: 2026-05-29
status: Active
author: Linetra Dev Team
---

# Linetra — 視覺規範與組件設計 (Visual Identity & Design System)

本文件定義 Linetra 的視覺語言、色彩計畫與 UI 組件設計規範，以確保行政管理介面的專業性、一致性與高可讀性。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-05-29 |
| **設計框架** | Tailwind CSS |

---

## 1. 色彩計畫 (Color Palette)

色彩運用首重功能性，區分任務狀態與緊急程度。

| 狀態 / 功能 | Tailwind 色值 | 用途 |
| :--- | :--- | :--- |
| **Primary** | `blue-600` | 品牌主色、導覽列、主要操作 |
| **Success** | `emerald-500` | `Completed` 狀態、成功提示 |
| **Warning** | `amber-500` | `Soon to expire` (3 天內)、中度警告 |
| **Danger** | `rose-600` | `Overdue` 狀態、`重要` 標記、刪除/歸檔 |
| **Neutral** | `slate-500` | 次要資訊、已歸檔、禁用的按鈕 |
| **Background** | `slate-50` | 頁面底色，保持乾淨簡潔 |

---

## 2. 字體規範 (Typography)

針對行政通報大量文字的特性，強調層級與易讀性。

*   **系統字體**: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`。
*   **中文字體**: 優先使用「台北黑體」或系統預設黑體，確保在 Windows 環境下閱讀舒適。

| 層級 | 大小 (rem) | 重點 (Weight) | 用途 |
| :--- | :--- | :--- | :--- |
| **H1** | `1.875` (30px) | `700` | 頁面大標題 |
| **H2** | `1.5` (24px) | `600` | 區塊標題 |
| **Body** | `1.0` (16px) | `400` | 一般案由、詳細說明 |
| **Caption** | `0.875` (14px) | `400` | 時間戳記、次要備註 |

---

## 3. 原子組件 (Atomic Components)

### 3.1 狀態標籤 (Status Badges)
*   **Pending**: `bg-blue-100 text-blue-700`
*   **Completed**: `bg-emerald-100 text-emerald-700`
*   **Overdue**: `bg-rose-100 text-rose-700`
*   **Archived**: `bg-slate-100 text-slate-600`

### 3.2 按鈕樣式 (Buttons)
*   **Primary**: 滿版藍色，白色文字，圓角 `rounded-md`，帶 `hover:bg-blue-700`。
*   **Secondary**: 藍色邊框，藍色文字，白色背景，帶 `hover:bg-blue-50`。
*   **Ghost**: 無背景邊框，灰色文字，僅 `hover:bg-slate-100`。

### 3.3 輸入框 (Inputs)
*   標準高度，邊框 `border-slate-300`，Focus 時為 `ring-2 ring-blue-500`。
*   錯誤狀態：`border-rose-500 text-rose-600`。

---

## 4. 佈局規範 (Layout)

*   **響應式**: MVP 以 **Desktop First** 為主，內容區塊最大寬度 `max-w-7xl` (1280px)。
*   **間距 (Spacing)**: 遵循 Tailwind 的 4 單位制 (1rem = 16px)。區塊間距建議為 `p-6` 或 `gap-6`。
*   **陰影**: 列表卡片使用 `shadow-sm`，對話框使用 `shadow-xl`。

---

## 5. Tailwind 配置建議

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': '#2563eb', // blue-600
        'status-pending': '#2563eb',
        'status-completed': '#10b981',
        'status-overdue': '#e11d48',
      },
    },
  },
}
```
