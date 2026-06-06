---
title: Linetra — 視覺規範與組件設計 (Visual Identity & Design System)
version: v2.1
date: 2026-06-06
status: Active
author: Linetra Dev Team
---

# Linetra — 視覺規範與組件設計

本文件定義 Linetra 的視覺語言、色彩計畫與 UI 組件設計規範。視覺風格直接參考 Throxy 的截圖分析：**雙色調交替系統**（暖奶油淺色 ↔ 暖紫深色）、紫羅蘭品牌主色、珊瑚紅負面狀態、強對比大標題。

| 屬性 | 內容 |
| :--- | :--- |
| **文件版本** | `v2.1` |
| **最後更新** | 2026-06-06 |
| **設計框架** | Tailwind CSS |
| **設計語言參考** | Throxy — Dual-tone, Warm Cream × Warm Dark |

---

## 設計核心原則

### 雙色調交替 (Dual-tone Alternating)

Throxy 的頁面節奏來自淺色與深色區段的交替出現，創造視覺呼吸感。Linetra 將此原則應用於：

- **淺色調** (`cream`): 主要列表、表單頁、案件詳情——讓大量文字內容舒適可讀
- **深色調** (`dark`): 看板總覽、數據統計、快速操作面板——強調重要資訊與儀表感

### 暖色基調 (Warm Undertone)

無論淺色還是深色，底色均帶有輕微的暖色調，避免純白或純黑的冷硬感：
- 淺色底：奶油米色（帶暖棕 undertone），而非純白
- 深色底：近黑帶輕微暖紫色調，而非純 zinc 黑

### 紫羅蘭品牌焦點 (Violet Brand Focus)

主品牌互動色為紫羅蘭 `violet-400`，在淺色與深色背景上均能保持清晰對比，呼應 Throxy 的實際色彩應用。

---

## 1. 色彩計畫 (Color Palette)

### 1.1 淺色模式 Surface (Cream Mode)

用於主要工作介面、案件列表、表單頁面。

| 角色 | Tailwind / HEX | 用途 |
| :--- | :--- | :--- |
| **Page Background** | `#F2EDE8` (自訂暖奶油) | 頁面底色，帶暖棕色調 |
| **Surface** | `#EDE7E0` / `stone-200` | 卡片、側邊欄背景 |
| **Surface Hover** | `#E5DDD4` | 卡片 hover 狀態 |
| **Border** | `#D9D0C7` / `stone-300` | 分隔線、輸入框邊框 |
| **Text Primary** | `#1A1714` | 標題、主要內文（近黑帶暖棕） |
| **Text Secondary** | `#6B5F55` / `stone-600` | 次要說明文字 |
| **Text Muted** | `#A8998D` / `stone-400` | 時間戳記、佔位符 |

### 1.2 深色模式 Surface (Dark Mode)

用於看板總覽、數據儀表板、行動呼籲區段。

| 角色 | Tailwind / HEX | 用途 |
| :--- | :--- | :--- |
| **Page Background** | `#1A1820` (自訂暖紫深黑) | 深色區段底色 |
| **Surface** | `#221F2B` | 卡片、面板 |
| **Surface Elevated** | `#2C2838` | Dropdown、浮層 |
| **Border** | `#38334A` | 卡片邊框、分隔線 |
| **Border Subtle** | `#2E2A3A` | 細邊框 |
| **Text Primary** | `#F5F2FF` | 標題（帶輕微紫白色調） |
| **Text Secondary** | `#A89EC0` | 次要說明 |
| **Text Muted** | `#6B6080` | 時間戳記、禁用 |

### 1.3 品牌主色 (Brand — Violet)

| 角色 | Tailwind 值 | HEX | 用途 |
| :--- | :--- | :--- | :--- |
| **Primary** | `violet-400` | `#A78BFA` | 主要互動、Focus ring、進度條 |
| **Primary Hover** | `violet-300` | `#C4B5FD` | 懸停狀態（淺紫） |
| **Primary Active** | `violet-500` | `#8B5CF6` | 按壓狀態 |
| **Primary Subtle** | `violet-400/15` | `rgba(167,139,250,.15)` | 選取行、標籤背景 |
| **Primary on Dark Button** | `violet-400/20` | `rgba(167,139,250,.20)` | 深色背景上的次要按鈕填色 |

### 1.4 語意狀態色 (Semantic Colors)

Throxy 的功能色：珊瑚紅（負面）、翠綠（正面），在深色背景上使用亮版。

| 狀態 | 淺色模式 | 深色模式 | 用途 |
| :--- | :--- | :--- | :--- |
| **Success / Completed** | `emerald-600` `#059669` | `emerald-400` `#34D399` | 完成狀態、正面指標 |
| **Warning / Soon** | `amber-600` `#D97706` | `amber-400` `#FBBF24` | 3 天內到期 |
| **Danger / Overdue** | `rose-600` `#E11D48` | `rose-400` `#FB7185` | 逾期、重要、破壞性操作 |
| **Neutral / Archived** | `stone-500` `#78716C` | `stone-500` `#78716C` | 已歸檔、禁用 |

> **色彩使用比例原則**：Throxy 的深色 UI 中珊瑚紅僅用於負面數據（如下滑折線圖），紫色用於品牌互動，翠綠用於正面指標。Linetra 同樣應嚴格按功能使用，避免混用。

---

## 2. 字體規範 (Typography)

Throxy 的標題特徵：**極重磅（800）、緊密字距（-0.03em）、幾乎滿版的大尺寸**，與大量留白形成強烈對比。正文則保持正常重量與行距。

**英文 / 數字**: `Inter, "Geist", system-ui, -apple-system, "Segoe UI", sans-serif`

**中文**: 優先使用「Noto Sans TC」粗體，標題段落建議 `font-weight: 800` 或 `900`，以匹配 Throxy 的強衝擊排版風格。

| 層級 | 大小 (rem) | Weight | Letter Spacing | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `2.5` (40px) | `800` | `-0.03em` | 空白頁主標語、看板大標 |
| **H1** | `1.875` (30px) | `700` | `-0.025em` | 頁面大標題 |
| **H2** | `1.5` (24px) | `600` | `-0.02em` | 區塊標題 |
| **H3** | `1.25` (20px) | `600` | `-0.01em` | 卡片標題 |
| **Body** | `1.0` (16px) | `400` | `0` | 案由、詳細說明 |
| **Small** | `0.875` (14px) | `400` | `0` | 時間戳記、次要備註 |
| **Label** | `0.75` (12px) | `500` | `0.06em` uppercase | 狀態標籤文字、欄位 Header |
| **Metric** | `2.0` (32px) | `700` | `-0.02em` | 看板數據數字（如 71%、47 件）|

> **Metric 數字特別規範**：仿照 Throxy 看板卡的「大數字 + 全大寫小型說明」排版，數字使用 `tabular-nums` 確保欄位對齊。

---

## 3. 原子組件 (Atomic Components)

### 3.1 狀態標籤 (Status Badges)

參考 Throxy 的 UI 標籤，採用半透明背景 + 細邊框，避免純色塊的笨重感。

**淺色模式**：
```
Pending   → bg-violet-100  text-violet-700  border border-violet-200
Completed → bg-emerald-100 text-emerald-700 border border-emerald-200
Overdue   → bg-rose-100    text-rose-700    border border-rose-200
Soon      → bg-amber-100   text-amber-700   border border-amber-200
Archived  → bg-stone-100   text-stone-500   border border-stone-200
```

**深色模式**：
```
Pending   → bg-violet-400/15 text-violet-300 border border-violet-400/25
Completed → bg-emerald-400/15 text-emerald-300 border border-emerald-400/25
Overdue   → bg-rose-400/15   text-rose-300   border border-rose-400/25
Soon      → bg-amber-400/15  text-amber-300  border border-amber-400/25
Archived  → bg-stone-700/30  text-stone-400  border border-stone-600/30
```

共用樣式：`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide`

### 3.2 按鈕 (Buttons)

Throxy 的按鈕策略：**深色 CTA（近黑底＋白字）** 在淺色頁面上、**功能色按鈕**在深色 UI 中（如「Book meeting」用深綠底）。

**Primary（淺色頁面）**：
```
bg-[#1A1714] text-[#F5F2FF] font-semibold rounded-xl px-5 py-2.5
hover:bg-[#2C2838] active:bg-[#1A1820]
focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2
transition-colors duration-150
```

**Primary（深色頁面）**：
```
bg-violet-500 text-white font-semibold rounded-xl px-5 py-2.5
hover:bg-violet-400 active:bg-violet-600
focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 ring-offset-[#1A1820]
transition-colors duration-150
```

**Secondary**：
```
/* 淺色 */
bg-transparent text-[#1A1714] border border-[#D9D0C7] rounded-xl px-5 py-2.5
hover:bg-[#EDE7E0] transition-colors duration-150

/* 深色 */
bg-transparent text-[#A89EC0] border border-[#38334A] rounded-xl px-5 py-2.5
hover:bg-[#2C2838] hover:text-[#F5F2FF] transition-colors duration-150
```

**Destructive（破壞性操作）**：
```
/* 參考 Throxy「End call」按鈕：暗底色加紅色文字 */
bg-rose-900/40 text-rose-400 border border-rose-800/40 rounded-xl px-5 py-2.5
hover:bg-rose-900/60 hover:border-rose-700/50 transition-colors duration-150
```

**Action-Positive（確認/預約類）**：
```
/* 參考 Throxy「Book meeting」按鈕：暗底色加綠色文字 */
bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 rounded-xl px-5 py-2.5
hover:bg-emerald-900/60 transition-colors duration-150
```

### 3.3 輸入框 (Inputs)

**淺色模式**：
```
bg-white/60 border border-[#D9D0C7] text-[#1A1714] rounded-lg px-3 py-2.5
placeholder:text-[#A8998D]
hover:border-[#A8998D]
focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/70
transition-all duration-150
```

**深色模式**：
```
bg-[#221F2B] border border-[#38334A] text-[#F5F2FF] rounded-lg px-3 py-2.5
placeholder:text-[#6B6080]
hover:border-[#4A4560]
focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400/50
transition-all duration-150
```

錯誤狀態：`border-rose-500/60 focus:ring-rose-400/30`

### 3.4 卡片 (Cards)

**淺色 Metric 卡**（仿 Throxy 數據格卡）：
```
bg-[#EDE7E0] border border-[#D9D0C7] rounded-2xl p-5
hover:bg-[#E5DDD4] hover:border-[#C8BDB2]
transition-all duration-200
```

**深色資料卡**（仿 Throxy 深色 UI 面板）：
```
bg-[#221F2B] border border-[#38334A] rounded-2xl p-5
hover:border-[#4A4560] hover:bg-[#2C2838]
transition-all duration-200
```

### 3.5 導覽列 (Navigation)

```
/* 淺色頁面頂部導覽 */
bg-[#F2EDE8]/90 backdrop-blur-xl border-b border-[#D9D0C7]
sticky top-0 z-50

/* 深色頁面頂部導覽 */
bg-[#1A1820]/90 backdrop-blur-xl border-b border-[#38334A]
sticky top-0 z-50
```

側邊欄 Active Item（淺色）：`bg-[#EDE7E0] text-[#1A1714] border-r-2 border-violet-500`
側邊欄 Active Item（深色）：`bg-violet-400/10 text-violet-300 border-r-2 border-violet-400`

---

## 4. 雙色調佈局規範 (Dual-tone Layout)

### 4.1 頁面區段切換策略

| 頁面區段 | 色調 | 適用場景 |
| :--- | :--- | :--- |
| 主要列表區 | 淺色調 (Cream) | 案件列表、搜尋結果 |
| 看板 / 統計 | 深色調 (Dark) | 數字指標、圖表 |
| 表單 / 編輯頁 | 淺色調 (Cream) | 新增案件、編輯資料 |
| 側邊快速面板 | 深色調 (Dark) | 案件詳情側拉抽屜 |
| 頁首 Hero | 淺色調 (Cream) | 登入後歡迎畫面 |

### 4.2 Metric 看板卡排版

仿照 Throxy 的「大數字 + 全大寫說明」配置：

```html
<div class="bg-[#EDE7E0] border border-[#D9D0C7] rounded-2xl p-6">
  <p class="text-4xl font-bold tracking-tight text-[#1A1714] tabular-nums">42</p>
  <p class="text-xs font-medium tracking-widest uppercase text-[#A8998D] mt-2">
    本週待辦案件
  </p>
</div>
```

### 4.3 緊急程度色條

案件卡片左側色條，適用於淺色與深色兩種背景：

```
/* 一般 */        border-l-4 border-[#D9D0C7]        (淺) / border-[#38334A]     (深)
/* 即將到期 */    border-l-4 border-amber-500
/* 逾期 */        border-l-4 border-rose-500
/* 重要 + 光暈 */ border-l-4 border-rose-500 shadow-[0_0_12px_rgba(251,113,133,0.2)]
```

---

## 5. 佈局規範 (Layout)

**響應式策略**：Desktop First，`max-w-7xl`，左側固定側邊欄 `w-64`。

**間距系統**（Tailwind 4px 基準）：
- 頁面邊距：`px-6 lg:px-8`
- 卡片內距：`p-5` 或 `p-6`
- 組件間距：`gap-4` 或 `gap-6`
- 區塊間距：`space-y-8`

**圓角策略**：
- 主要卡片：`rounded-2xl`（Throxy 風格，更圓潤）
- 按鈕：`rounded-xl`
- 標籤：`rounded-full`
- 輸入框：`rounded-lg`

**陰影策略**：淺色模式可使用輕陰影，深色模式改用邊框：
```
淺色卡片: shadow-sm shadow-[#C8BDB2]/40
深色卡片: border border-[#38334A] (無陰影)
浮層:     shadow-2xl shadow-black/50 border border-[#38334A]
警示光暈: shadow-[0_0_20px_rgba(167,139,250,0.15)]  (紫色品牌光暈)
```

**滾動條（深色模式）**：
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1A1820; }
::-webkit-scrollbar-thumb { background: #38334A; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #4A4560; }
```

---

## 6. 動態與過渡 (Motion)

| 情境 | 時長 | Easing | 說明 |
| :--- | :--- | :--- | :--- |
| 顏色過渡（hover/focus） | `150ms` | `ease-out` | 按鈕、輸入框狀態變化 |
| 卡片展開 | `200ms` | `ease-in-out` | 案件詳情展開 |
| 區段切換（淺↔深） | `300ms` | `ease-in-out` | 頁面滾動時的色調過渡 |
| Modal 進入 | `200ms` | `ease-out` | 縮放淡入 |
| Toast 通知 | `300ms` | `spring` | 右側滑入 |

---

## 7. Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 雙色調基礎
        cream: {
          bg:      '#F2EDE8',
          surface: '#EDE7E0',
          hover:   '#E5DDD4',
          border:  '#D9D0C7',
          text:    '#1A1714',
          muted:   '#A8998D',
        },
        dark: {
          bg:       '#1A1820',
          surface:  '#221F2B',
          elevated: '#2C2838',
          border:   '#38334A',
          text:     '#F5F2FF',
          muted:    '#6B6080',
        },
        // 品牌主色
        brand: {
          DEFAULT: '#A78BFA', // violet-400
          hover:   '#C4B5FD', // violet-300
          active:  '#8B5CF6', // violet-500
          subtle:  'rgba(167,139,250,0.15)',
        },
        // 語意狀態
        status: {
          pending:   '#A78BFA',
          completed: '#34D399',
          overdue:   '#FB7185',
          warning:   '#FBBF24',
          archived:  '#78716C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', '-apple-system',
               '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
}
```

---

## 8. 設計決策備忘 (Design Decisions Log)

| 項目 | v1.0 | v2.0（錯誤推測）| v2.1（截圖校正）| 原因 |
| :--- | :--- | :--- | :--- | :--- |
| 整體底色 | `slate-50` 淺色 | `zinc-950` 深黑 | **雙色調**：奶油淺 + 暖紫深 | Throxy 截圖顯示兩種模式交替 |
| 品牌主色 | `blue-600` | `amber-500` 琥珀 | **`violet-400` 紫羅蘭** | Cookie 按鈕、進度條均為紫色 |
| 淺色底調 | 純白 `white` | — | **暖奶油 `#F2EDE8`** | Throxy 淺色區非純白，帶暖棕色 |
| 深色底調 | — | `zinc-950` 純黑 | **`#1A1820` 暖紫深黑** | Throxy 深色區帶輕微紫色 undertone |
| 危險色 | `rose-600` | `red-400` | **`rose-400` + 暗底按鈕** | 仿 Throxy「End call」按鈕樣式 |
| 卡片圓角 | `rounded-md` | `rounded-lg` | **`rounded-2xl`** | Throxy UI 卡片圓角更大更現代 |