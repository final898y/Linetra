---
title: Vue 3 + TypeScript 現代化 ESLint (Flat Config) 與 Prettier 整合建置講義
version: v1.0
date: 2026-06-06
status: Active
author: final898y
---

# title: Vue 3 + TypeScript 現代化 ESLint (Flat Config) 與 Prettier 整合建置講義

> **AI 專用讀取提示（AI Prompt Hint）：**
> 閱讀本文件後，請精確理解使用者已完成的安裝步驟，並根據本講義「設定檔實作」章節中的程式碼，協助使用者建立或覆寫 `.prettierrc`、`eslint.config.mjs` 以及調整 `package.json` 中的 `scripts` 設定。

## 一、 建置流程與安裝命令

本環境採用最新版的 **ESLint 平鋪式架構 (Flat Config)**，搭配 Vue 官方最推薦的 `defineConfigWithVueTs` 工具鏈，以及 **Prettier** 程式碼美化器，建構出自動化錯誤修正與排版一體化的現代前端開發環境。

### 1. 全套安裝指令複盤

使用者已在終端機依序成功執行以下命令：

```bash
# 步驟 1：初始化新版 ESLint 設定（互動式問答，選擇 Vue, TS, ESM, Browser）
npm init @eslint/config@latest

# 步驟 2：安裝 Vue 官方 TypeScript 整合配置套件（建立 Vue 與 TS 檢查的橋樑）
npm add --dev @vue/eslint-config-typescript

# 步驟 3：安裝 Prettier 精確版本（程式碼造型排版大師）
npm install --save-dev --save-exact prettier

# 步驟 4：安裝 ESLint 關閉衝突配置插件（確保 ESLint 不管排版、不與 Prettier 打架）
npm i -D eslint-config-prettier

```

---

## 二、 核心原理與套件角色定位

為了建立扎實的工程化思維，必須釐清各個套件在系統中的職責：

| 套件名稱                            | 扮演角色         | 底層運作邏輯與重要性                                                                                                |
| ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| **`eslint`**                        | 程式碼糾察隊本體 | 負責解析代碼結構（AST），揪出潛在的 Bug、未定義變數或不安全的語法。                                                 |
| **`@vue/eslint-config-typescript`** | 官方核心黏著劑   | 核心函式 `defineConfigWithVueTs` 能自動包辦 `.vue` 檔案內 `<script lang="ts">` 的特殊解析器設定，避免手動設定出錯。 |
| **`eslint-plugin-vue`**             | Vue 語法專門官   | 專門檢查 Vue 特有語法（例如：限制 `v-for` 必須綁定 `:key`，檢查雙向綁定是否正確）。                                 |
| **`prettier`**                      | 造型排版設計師   | 專注於程式碼的外觀（縮排、單雙引號、換行、分號），確保團隊代碼風格百分之百視覺統一。                                |
| **`eslint-config-prettier`**        | 停火協議條約     | **關鍵角色。** 負責關閉 ESLint 中所有與樣式/排版相關的規則（例如引號、分號限制），將排版權利完全移交給 Prettier。   |

---

## 三、 設定檔實作與程式碼審查

以下為專案根目錄中必備的兩個關鍵設定檔。程式碼中皆包含完整逐行註釋說明執行邏輯。

### 1. 程式碼美化配置：`.prettierrc`

在專案根目錄建立此檔案，定義專案的視覺排版標準（JSON 格式）：

```json
{
  "semi": false, // 執行邏輯：結尾不加分號，保持代碼乾淨簡潔
  "singleQuote": true, // 執行邏輯：字串一律優先使用單引號 ' '
  "printWidth": 100, // 執行邏輯：單行程式碼最多 100 個字元，超過則自動換行
  "trailingComma": "es5" // 執行邏輯：在 ES5 支援的語法（如物件、陣列）尾端元素自動補上逗號
}
```

### 2. 代碼規範配置：`eslint.config.mjs`

在專案根目錄建立此檔案。採用最新平鋪式架構（陣列疊加邏輯），**最底層先放基礎規則，最頂層放 Prettier 用以覆蓋衝突**：

```javascript
// 引入說明：引入專門檢查 Vue 檔案（.vue）的官方套件
import pluginVue from "eslint-plugin-vue";

// 引入說明：引入 Vue 官方專為 TypeScript 打造的配置輔助工具
import {
  defineConfigWithVueTs, // 執行邏輯：Vue 官方聰明函式，自動封裝底層複雜的 TS 解析設定
  vueTsConfigs, // 執行邏輯：Vue 官方推薦的 TypeScript 檢查規則集合
} from "@vue/eslint-config-typescript";

// 引入說明：引入 Prettier 的平鋪式（Flat Config）相容配置
import eslintConfigPrettier from "eslint-config-prettier/flat";

// 執行邏輯：將各層級的代碼規範像三明治一樣由上而下疊加組合，並導出配置
export default defineConfigWithVueTs(
  // 基礎層：載入 Vue 的基礎核心規則（essential 等級，抓出最嚴重的 Vue 語法錯誤）
  pluginVue.configs["flat/essential"],

  // 進階層：疊加 Vue 官方推薦的 TypeScript 最佳實踐檢查規則
  vueTsConfigs.recommended,

  // 覆蓋層：必須放在陣列最後一個元素！套用 Prettier 規則，強行關閉前面所有與排版衝突的 ESLint 檢查
  eslintConfigPrettier,
);
```

---

## 四、 自動化腳本（Scripts）最佳實踐

請手動調整專案根目錄下的 `package.json`，在 `"scripts"` 欄位中補上以下三行**黃金標準指令**。這裡特別優化了路徑引號，以確保在 Windows (PowerShell/CMD) 與 Mac/Linux 環境下皆能完美跨平台相容：

```json
"scripts": {
  "lint": "eslint . --fix",
  "format": "prettier --write 'src/**/*.{ts,vue,scss,css}'",
  "style": "npm run format && npm run lint"
}

```

### 指令執行邏輯與好習慣說明：

- **`npm run format` (排版美化)：**
  精確限定在 `src` 資料夾內，並將 `scss` 和 `css` 納入守護範圍。使用 `--write` 參數直接覆寫檔案，同時完美避開 `node_modules` 與 `dist`，效率極高。
- **`npm run lint` (自動維修)：**
  開啟 `--fix` 參數。執行時，ESLint 會升級為「全自動維修工」，只要是它有能力自動修復的錯誤（例如 `var` 變錯、多餘空格等）會**瞬間自動修好並存檔**，只有遇到無法通靈的邏輯錯誤才會報警，大幅節省時間。
- **`npm run style` (終極合體技)：**
  利用 `&&` 符號串聯。**強烈建議在每次 `git commit` 提交代碼前執行此指令**。它會「先排版、後檢查」，一鍵完成全專案的門面美化與邏輯健檢！
