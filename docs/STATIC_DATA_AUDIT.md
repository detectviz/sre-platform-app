# 前端靜態資料稽核清單

## 1. 稽核目的

本文件旨在提供一份完整的清單，詳細列出 SRE Platform 前端程式碼中所有包含靜態資料、硬編碼樣式及業務邏輯的檔案。此清單是執行後續重構、將靜態資料遷移至後端 API 管理的第一步。

---

## 2. 核心靜態資料來源檔案

以下兩個檔案是目前系統中絕大部分靜態資料的集中存放處：

- **`constants/pages.ts`**:
  - **問題**: 定義了 `PAGE_CONTENT` 全局物件，包含了幾乎所有頁面、元件的 UI 顯示文字（標題、按鈕、提示訊息等）。這是需要被 API 提供的 i18n 語言包取代的核心目標。

- **`mock-server/db.ts`**:
  - **問題**: 此檔案不僅包含模擬的業務資料，還硬編碼了大量與 UI 表現層相關的設定，包括：
    - **導覽結構**: `MOCK_NAV_ITEMS`, `MOCK_TAB_CONFIGS`
    - **UI 選項**: `MOCK_INCIDENT_OPTIONS`, `MOCK_RESOURCE_OPTIONS` 等，這些物件將資料值與前端 CSS class 和顏色強行綁定。
    - **全局設定**: `MOCK_ICON_MAP`, `MOCK_CHART_COLORS`
    - **靜態內容**: `MOCK_COMMAND_PALETTE_CONTENT` 等。

---

## 3. 檔案修正清單

以下是根據偵測結果，需要進行重構的檔案列表。

### 3.1. 直接使用靜態 UI 字串的檔案

以下檔案直接匯入並使用了 `constants/pages.ts` 中的 `PAGE_CONTENT`，應改為從全局的 i18n Context 中獲取文字。

- `pages/dashboards/DashboardEditorPage.tsx`
- `pages/SREWarRoomPage.tsx`
- `components/ColumnSettingsModal.tsx`
- `components/UnifiedSearchModal.tsx`
- `components/Modal.tsx`
- `components/RoleEditModal.tsx`
- `components/PlaceholderModal.tsx`
- `layouts/AppLayout.tsx`
- `layouts/PageWithTabsLayout.tsx`

### 3.2. 包含硬編碼樣式 (顏色) 的檔案

以下檔案在元件邏輯中直接寫死了顏色碼 (`#...`)，尤其是在 ECharts 圖表設定中。這些顏色應改為由後端 API 提供的 `appConfig` 或 `entityOptions` 中的樣式設定來驅動。

- `pages/analysis/AnalysisOverviewPage.tsx`
- ~~`pages/analysis/CapacityPlanningPage.tsx`~~（已改為使用 `ChartThemeContext` 及 `/ui/content` 的字串配置）
- `pages/analysis/LogExplorerPage.tsx`
- `pages/dashboards/InfrastructureInsightsPage.tsx`
- `pages/resources/ResourceDetailPage.tsx`
- `pages/resources/ResourceTopologyPage.tsx`
- `pages/SREWarRoomPage.tsx`
- `components/GlobalSearchModal.tsx`
- `components/TraceTimelineChart.tsx`

### 3.3. 包含硬編碼業務邏輯判斷的檔案

以下檔案的邏輯中包含了對硬編碼字串（例如：`'健康'`）的判斷，這使得程式碼非常脆弱，一旦字串變更就會導致邏輯失效。應改為使用後端 API 提供的枚舉值或 ID 進行判斷。

- `pages/SREWarRoomPage.tsx`: `(s.name === '健康' ? ...)`

- 更新：`pages/analysis/AIInsightsPage.tsx` 已於 2025 年的 mock server 重構中移除，不再列入靜態資料稽核範圍。

---

## 4. 結論與建議

本次稽核確認了靜態資料和硬編碼邏輯在前端程式碼中普遍存在。為了解決此問題，強烈建議採納 `FRONTEND_STATIC_DATA_REFACTOR_PLAN.md` 中提出的方案，建立 `/api/v1/ui/bootstrap` 端點來統一管理所有 UI 設定，並著手重構以上列出的所有檔案。