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
    **Then** 我應該能看到關於此建議的更詳細說明，解釋為何需要縮容以及預期的效益。

3.  **Given** 我想將分析結果分享給我的團隊。
    **When** 我點擊「匯出報表」按鈕。
    **Then** 系統應下載一個 CSV 檔案，其中包含「詳細分析」表格中的所有資源、它們的當前/預測用量以及優化建議。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供容量規劃資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當 AI 沒有生成任何優化建議時，對應的卡片區域應顯示一個友好的提示訊息。
- 當使用者點擊「觸發 AI 分析」時，按鈕應進入載入中狀態，並在分析完成後自動刷新頁面資料。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/analysis/capacity-planning` API 端點獲取資料，並將其呈現在一個儀表板佈局中。
- **FR-002**：系統必須（MUST）在一個圖表中同時展示 CPU、記憶體、儲存空間的歷史使用率和未來預測趨勢。
- **FR-003**：系統必須（MUST）提供一個獨立的圖表，用於詳細展示單一資源（如 CPU）的預測模型，包括其預測趨勢線和信賴區間（Confidence Band）。
- **FR-004**：系統必須（MUST）以卡片列表的形式，展示由 AI 生成的具體優化建議，包括建議的標題、詳情、影響等級和投入精力評估。
- **FR-005**：系統必須（MUST）提供一個詳細的表格，列出每個被分析資源的當前用量、預測用量、系統建議（如擴容/縮容）和預估的成本影響。
- **FR-006**：系統必須（MUST）允許使用者將詳細分析表格的內容匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）提供一個手動按鈕，用於觸發一次新的 AI 分析並刷新整個頁面的資料。
- **FR-008**: 「時間範圍」下拉選單在變更時，**必須**觸發一次新的後端 API 請求，以獲取並顯示對應時間範圍的歷史與預測數據。
- **FR-009**: 「預測模型」圖表**必須**支援使用者在 CPU、記憶體、儲存等不同指標間進行切換，以查看各指標的詳細預測模型。
- **FR-010**: AI 建議 (`Suggestion`) 物件中，`impact` 和 `effort` 欄位的值**必須**為標準化的枚舉（如 `high`, `medium`, `low`）。
- **FR-011**: 詳細分析表格中的「建議」 (`ResourceAnalysis`) 應為一個結構化物件，包含 `action`（如 `scale_up`, `scale_down`）和 `reason`（如 `forecast_exceeds_threshold`）等欄位，供前端進行格式化顯示。
- **FR-012**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **CapacityPlanningData** | 整個容量規劃頁面的核心資料模型，是包含趨勢、預測、建議和詳細分析的複合體。 | - |
| **TrendSeries** | 一組時間序列數據，包含歷史值和預測值，用於趨勢圖。 | - |
| **Suggestion** | 一條由 AI 生成的具體優化建議，包含 `impact` 和 `effort` 枚舉欄位。 | - |
| **ResourceAnalysis** | 對單一資源的詳細容量分析結果，包含結構化的 `recommendation` 物件。 | Resource |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

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

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為使用者觸發的「AI 分析」和「匯出報表」操作產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標和 API 呼叫遙測。此數據密集型頁面應使用自訂性能標記來測量圖表的渲染時間。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ⚠️ | **[PARTIAL VIOLATION: `constitution.md`]** 此頁面已使用 `useContentSection` hook，但仍存在後備的硬式編碼字串，例如 `'無法獲取容量規劃資料。'`。 |
| Theme Token 使用 | ✅ | 程式碼透過 `useChartTheme` hook 獲取圖表主題，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

(此區塊所有相關項目已被澄清)