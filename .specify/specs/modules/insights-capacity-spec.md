# 功能規格書（Feature Specification）

**模組名稱 (Module)**: insights-capacity
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/analysis/CapacityPlanningPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名財務分析師（FinOps）或 SRE 主管，我需要預測未來（例如未來 30 天）的資源需求，以避免因容量不足導致的服務中斷，或因資源過度配置造成的成本浪費。我希望能有一個容量規劃儀表板，它能基於歷史使用率數據，預測 CPU、記憶體等關鍵資源的未來趨勢，並提供具體的 AI 優化建議，例如建議我對哪些資源進行擴容或縮容。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「容量規劃」頁面。
    **When** 我觀察「資源使用趨勢」圖表。
    **Then** 我應該能清楚地看到 CPU、記憶體和儲存空間三項指標的歷史使用率實線，以及它們未來一段時間的預測虛線。

2.  **Given** 「AI 優化建議」卡片中出現一條「建議縮容閒置資料庫」的建議。
    **When** 我點擊該建議的「展開詳情」。
    **Then** 我應該能看到關於此建議的更詳細說明。

3.  **Given** 我想將分析結果分享給我的團隊。
    **When** 我點擊「匯出報表」按鈕。
    **Then** 系統應下載一個 CSV 檔案，其中包含「詳細分析」表格中的所有資源資料。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供容量規劃資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當 AI 沒有生成任何優化建議時，對應的卡片區域應顯示一個友好的提示訊息。
- 當使用者點擊「觸發 AI 分析」時，按鈕應進入載入中狀態，並在分析完成後自動刷新頁面資料。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在載入時呼叫 `/analysis/capacity-planning` 端點，並以單頁儀表板呈現回傳的資料。
- **FR-002**：系統必須（MUST）在「資源使用趨勢」圖表中，同時展示 CPU、記憶體、儲存空間的歷史與預測數據。
- **FR-003**：系統必須（MUST）提供一個獨立的「預測模型」圖表，展示 CPU 指標的預測線與信賴區間。
- **FR-004**：系統必須（MUST）以卡片列表呈現 AI 優化建議，並支援長文案展開/收合。
- **FR-005**：系統必須（MUST）提供一個詳細分析表格，列出每個資源的目前/預測用量、建議標籤和成本影響。
- **FR-006**：系統必須（MUST）允許使用者將目前顯示的詳細分析表格匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）提供「觸發 AI 分析」按鈕，用於重新整理頁面資料。
- **FR-008 (AS-IS)**：「時間範圍」下拉選單僅更新 UI 狀態，不觸發資料重新查詢。
- **FR-009 (AS-IS)**：系統依據 `recommendation.severity` 使用預定義的樣式渲染徽章。
- **FR-010 (AS-IS)**：頁面中的 UI 文字主要透過 `useContentSection` hook 載入，並包含硬編碼的 fallback。
- **FR-011 (FUTURE)**：系統應根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **CapacityPlanningData** | 整個容量規劃頁面的核心資料模型，是包含趨勢、預測、建議和詳細分析的複合體。 | - |
| **TrendSeries** | 一組時間序列數據，包含歷史值和預測值，用於趨勢圖。 | - |
| **Suggestion** | 一條由 AI 生成的具體優化建議。 | - |
| **ResourceAnalysis** | 對單一資源的詳細容量分析結果。 | Resource |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `insights:capacity:read` | 允許使用者查看容量規劃頁面。 |
| `insights:capacity:execute` | 允許使用者觸發「AI 分析」以產生新的報告。 |
| `insights:capacity:export` | 允許使用者匯出包含成本影響的詳細分析報告。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `CapacityPlanningPage` 的根元件需由 `<RequirePermission permission="insights:capacity:read">` 包裹。
- **工具列按鈕**:
  - 「觸發 AI 分析」按鈕需具備 `insights:capacity:execute` 權限。
  - 「匯出報表」按鈕需具備 `insights:capacity:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。系統透過 `useContentSection` hook 載入 UI 文字，但存在硬編碼的 fallback。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 中，`showToast` 的訊息存在硬編碼的 fallback (`'沒有可匯出的資料。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-red-500/30`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Time Range Behavior**: 「時間範圍」選單目前僅更新 UI，未來需確認是否要擴充為觸發資料重新查詢的功能。