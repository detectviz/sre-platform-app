# 功能規格書（Feature Specification）

**模組名稱 (Module)**: insights-backtesting
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/analysis/BacktestingPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名資深 SRE 或平台工程師，在調整或建立一條新的告警規則時，我需要能夠驗證它在過去的某段時間內是否會如預期般運作。我希望能對這條規則進行「歷史回測」，將其應用於歷史指標數據上，查看它會產生多少次告警。更重要的是，我需要能將這些模擬的告警與我們手動標記的真實故障時間段進行比對，以評估規則的準確性（Precision）和召回率（Recall），從而最大限度地減少誤報（False Positives）和漏報（False Negatives）。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我選擇了一條「CPU 使用率過高」的告警規則和「過去 7 天」的時間範圍。
    **When** 我點擊「開始回放」按鈕。
    **Then** 系統應開始非同步執行回測任務，並在右側圖表區域顯示歷史 CPU 指標、告警閾值線，以及所有模擬觸發的告警時間點。

2.  **Given** 我正在進行回測，並且我知道上週二下午 2 點到 4 點之間有一次真實的服務中斷。
    **When** 我在「實際事件比對」區塊中，新增一個標記並設定好對應的時間段。
    **Then** 圖表上應出現一個有色的陰影區域來標示這個時間段，讓我能直觀地看到模擬的告警觸發點是否落在此區間內。

3.  **Given** 一個回測任務已成功完成。
    **When** 我查看結果統計區塊。
    **Then** 我應該能看到本次回測的總數據點、模擬觸發次數、觸發率等量化指標。

### 邊界案例（Edge Cases）
- 當使用者選擇的回測時間範圍內沒有任何指標數據時，圖表區域應顯示「沒有可視化資料」的提示。
- 當使用者嘗試執行回測但未選擇任何告警規則時，系統應彈出提示。
- 如果後端回測任務執行失敗，前端應停止輪詢並在頁面上顯示清晰的錯誤訊息。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）允許使用者從現有的告警規則列表中選擇一條規則進行回測。
- **FR-002**：系統必須（MUST）允許使用者定義一個歷史時間範圍作為回測的數據區間。
- **FR-003**：系統必須（MUST）提供一個介面，讓使用者可以手動新增、標記和刪除已知的「實際事件」時間段。
- **FR-004**：系統必須（MUST）支援非同步執行回測任務。前端在提交任務後，應能透過輪詢（Polling）機制獲取任務狀態。
- **FR-005**：系統必須（MUST）在一個時間序列圖表中，同時視覺化展示歷史指標、告警閾值、模擬觸發點和手動標記的事件區間。
- **FR-006**：系統必須（MUST）在回測完成後，展示量化的統計結果，包括總數據點、觸發次數和觸發率。
- **FR-007 (AS-IS)**：前端在輪詢任務結果時，採用固定的 5 秒間隔。
- **FR-008 (AS-IS)**：進階指標（Precision, Recall, F1 Score）區域僅為 UI 佔位符，尚未實現計算邏輯。
- **FR-009 (FUTURE)**：系統應支援同時執行多個回測任務，並在 UI 上顯示任務列表。
- **FR-010 (FUTURE)**：系統應根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **BacktestingRunRequest** | 發起一次回測任務的請求體，包含規則 ID、時間範圍和手動標記的事件。 | AlertRule |
| **BacktestingRunResponse** | 發起回測任務後，API 的初步回應，包含任務 ID 和初始狀態。 | - |
| **BacktestingResultsResponse** | 輪詢獲取的回測結果，包含任務狀態、視覺化數據和基礎統計。 | - |
| **ManualEvent** | 使用者手動標記的實際事件，包含標籤和起訖時間。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `insights:backtesting:read` | 允許使用者查看回測分析頁面。 |
| `insights:backtesting:execute` | 允許使用者執行回測任務。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `BacktestingPage` 的根元件需由 `<RequirePermission permission="insights:backtesting:read">` 包裹。
- **「開始回放」按鈕**: 此按鈕需具備 `insights:backtesting:execute` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。Toast 訊息等處存在硬編碼的中文 fallback。 |
| Theme Token 使用 | 🟡 | 部分實現。UI 混用預定義樣式與直接的 Tailwind 色票。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'請選擇事件時間段。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-rose-500/10`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Advanced Metrics**: 進階指標 (FR-008) 目前僅為 UI 佔位符，未來需實現其計算與顯示邏輯。
- **[NEEDS CLARIFICATION] Concurrent Tasks**: 當前 MVP 一次只能處理一個回測任務，未來需擴充以支援多任務並行 (FR-009)。