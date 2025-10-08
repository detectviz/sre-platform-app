# 規格待辦事項解決方案 (Specification Clarification & Resolution Plan)

**報告日期**: 2025-10-07
**審查代理**: Jules (Senior Frontend Developer)
**目標**: 針對所有規格文件中標記為 `[NEEDS CLARIFICATION]` 的項目，提供統一的、可執行的解決方案，以提升程式碼品質、安全性與一致性，使其符合專案憲法 (`constitution.md`) 的要求。

---

## 1. 總體摘要 (Executive Summary)

在對所有模組的規格進行逆向工程後，我們識別出數個跨模組的、普遍存在的技術債和待釐清的設計決策。這些問題主要集中在 **i18n (國際化)**、**Theming (主題化)**、**刪除操作的依賴檢查** 以及 **部分功能的臨時性實現** 上。

本報告將這些問題分類，並為每一類問題提供標準化的解決方案，以便開發團隊能系統性地、一致地解決這些問題。

---

## 2. 通用性問題與解決方案

### 2.1. 國際化 (i18n) 全面導入

- **問題描述**:
  - 遍佈於多個模組 (`incidents-list`, `platform-auth`, `platform-mail` 等) 的 `showToast` 訊息、錯誤提示和按鈕標籤存在大量硬編碼的中文。
  - 部分模組 (如 `identity-audit`) 甚至在前端程式碼中透過 `Map` 或 `switch` 語句進行硬編碼的在地化翻譯。

- **影響模組**:
  - `automation-*`, `dashboards-*`, `identity-*`, `incidents-*`, `insights-*`, `notification-*`, `platform-*`, `profile-*`, `resources-*` (幾乎所有模組)

- **建議解決方案**:
  1.  **統一內容管理**: 建立一個中央 i18n 內容管理系統（例如，使用 `react-i18next` 搭配 JSON 檔案）。
  2.  **字串遷移**: 將程式碼中所有硬編碼的 UI 字串（包括 Toast 訊息）遷移至對應的 `zh-TW.json` 和 `en-US.json` 檔案中。
  3.  **廢除前端翻譯邏輯**: 移除所有本地的翻譯函式（如 `translateAction`, `getActionLabel`），改為直接使用 i18n Key。
  4.  **動態訊息處理**: 對於包含動態資料的訊息（例如 `成功刪除 {n} 個項目`），應使用 i18n 函式庫提供的插值 (interpolation) 功能。

### 2.2. 主題化 (Theming) 與設計系統統一

- **問題描述**:
  - 所有模組的 UI 中普遍存在直接使用 Tailwind CSS 原子化 class (如 `bg-sky-600`, `text-red-400`) 來定義語義顏色的情況。
  - 這違反了「語義導向」和「Theme Token」的設計原則，使得未來更換主題或進行全局顏色調整變得極其困難和危險。

- **影響模組**:
  - 所有模組。

- **建議解決方案**:
  1.  **定義 Theme Tokens**: 在中央主題配置中（例如 `styles/theme.ts`），定義一組語義化的顏色 Token，例如：
      - `color-action-primary-default`
      - `color-action-primary-hover`
      - `color-status-danger-background`
      - `color-status-danger-text`
  2.  **建立 CSS 變數**: 將這些 Token 映射為 CSS 變數。
  3.  **重構 UI 元件**: 系統性地重構所有元件，將直接的 Tailwind 顏色 class 替換為這些語義化的 Token class。例如，將 `bg-red-600` 替換為 `bg-status-danger`。
  4.  **擴充設計系統**: 對於常用的 UI 模式（如 `StatusTag`, `IconButton`），應在其 props 中直接提供 `tone` 或 `variant` 選項，由元件內部封裝對應的 Token class，而非由外部傳入 class 名稱。

---

## 3. 特定功能性問題與解決方案

### 3.1. 刪除操作的依賴檢查

- **問題描述**:
  - 多個模組（如 `identity-role`, `identity-team`, `platform-tag`）在執行刪除操作時，未檢查該實體是否仍被其他資源所依賴。例如，可以直接刪除一個仍被使用者使用的角色。
  - 這可能導致系統中出現懸掛引用 (dangling references) 和非預期的行為。

- **影響模組**:
  - `identity-role`, `identity-team`, `platform-tag`, `notification-channel`

- **建議解決方案**:
  1.  **後端職責**: 將依賴檢查的主要職責放在後端。當前端呼叫 `DELETE /api/.../{id}` 時，後端應先檢查是否存在依賴。
  2.  **API 回應**: 若存在依賴，API 應回傳 `409 Conflict` HTTP 狀態碼，並在回應主體中提供清晰的錯誤訊息，說明是哪些資源正在使用它。
  3.  **前端處理**: 前端應能捕捉 `409` 錯誤，並據此顯示一個使用者友善的對話框，解釋無法刪除的原因，並引導使用者先解除依賴關係。

### 3.2. 臨時性實現 (AS-IS) 的正規化

- **問題描述**:
  - 多個模組使用了臨時性的前端實現來彌補後端功能的不足，這些實現存在效能或準確性風險。

- **具體項目與建議解決方案**:
  1.  **前端 CRON 解析 (`resources-auto-discovery`)**:
      - **問題**: 在前端解析 CRON 表達式可能導致與後端排程器的解釋不一致。
      - **方案**: 建立一個共享的 `cron-parser` 工具函式庫，供前後端共同使用，或建立一個專門的後端 API `/utils/parse-cron`。
  2.  **前端事件模擬 (`resources-list`)**:
      - **問題**: 事件列表使用 `generateMockEvents` 模擬，完全不可靠。
      - **方案**: 必須替換為真實的後端 API `GET /api/v1/resources/{id}/events`。
  3.  **前端資料聚合 (`insights-log`, `resources-group`)**:
      - **問題**: 在前端對大量日誌或資源進行聚合與篩選，存在嚴重效能瓶頸。
      - **方案**: 將聚合邏輯移至後端。API 應直接提供聚合後的結果（例如，日誌直方圖的數據點、群組成員的分頁列表）。
  4.  **前端匹配邏輯 (`automation-trigger`)**:
      - **問題**: 「上次執行結果」是透過前端匹配邏輯實現的，不準確。
      - **方案**: 如規格中所述，後端 `AutomationTrigger` 物件應直接包含 `last_execution` 物件，提供準確的對應關係。

### 3.3. 未實現的關鍵功能

- **問題描述**:
  - 部分在規格中被視為核心的功能，在目前的 MVP 中尚未實現。

- **具體項目與建議解決方案**:
  1.  **進階回測指標 (`insights-backtesting`)**:
      - **問題**: Precision, Recall, F1 Score 僅為 UI 佔位符。
      - **方案**: 在後端實現這些指標的計算邏輯，並透過 `/backtesting/results/{id}` API 回傳。
  2.  **動態表單 (`resources-auto-discovery`, `resources-datasource`)**:
      - **問題**: 新增/編輯表單為靜態實現，無法根據類型動態變化。
      - **方案**: 後端需提供 JSON Schema 來定義不同類型所需的欄位，前端根據此 Schema 動態渲染表單。
  3.  **匯入功能 (`platform-layout`, `notification-channel`)**:
      - **問題**: 相關按鈕已存在，但功能未啟用。
      - **方案**: 實現對應的檔案上傳和後端處理邏輯。

### 3.4. 安全性與 UI/UX 釐清

- **問題描述**:
  - 存在一些安全隱患和待確認的 UI/UX 設計。

- **具體項目與建議解決方案**:
  1.  **明文 Client Secret (`platform-auth`)**:
      - **問題**: API 直接回傳明文 Client Secret。
      - **方案**: 後端 API **絕不**應回傳密鑰。API `GET` 請求應只回傳密鑰是否「已設定」的狀態。更新時 (`PUT` 或 `PATCH`)，前端傳送新密鑰，後端直接處理並儲存，永不回傳。
  2.  **外部儀表板行為 (`dashboards-list`)**:
      - **問題**: 點擊外部儀表板是在應用內導航還是開啟新分頁，行為不一致。
      - **方案**: 團隊需決策統一的行為。建議：為 `Dashboard` 物件新增一個 `target` 屬性（`_self` 或 `_blank`），由前端根據此屬性決定如何開啟連結。

---
**報告結束**