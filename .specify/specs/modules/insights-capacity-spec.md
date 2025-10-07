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

- **FR-001**：系統必須（MUST）在載入時呼叫 `/analysis/capacity-planning` 端點，並以單頁儀表板呈現回傳的趨勢、預測模型、建議與詳細分析資料。
- **FR-002**：系統必須（MUST）在單一折線圖中同時展示 CPU、記憶體、儲存空間的歷史使用率實線與未來預測虛線。
- **FR-003**：系統必須（MUST）提供一個獨立的「預測模型」圖表，展示 CPU 指標的預測線與信賴區間填色。
- **FR-004**：系統必須（MUST）以卡片列表呈現 AI 優化建議，包含標題、摘要、影響與投入等級以及偵測時間，並支援長文案展開/收合。
- **FR-005**：系統必須（MUST）提供一個詳細分析表格，列出每個資源的目前/預測用量、建議標籤（含嚴重度徽章）與成本影響描述。
- **FR-006**：系統必須（MUST）允許使用者將目前顯示的詳細分析表格匯出為 CSV 檔案；匯出內容僅含當前頁面載入的資料列。
- **FR-007**：系統必須（MUST）在工具列提供「觸發 AI 分析」按鈕，用於重新呼叫同一 API 並刷新趨勢、建議與分析結果。
- **FR-008**：「時間範圍」下拉選單必須（MUST）呈現後端提供的 `time_range_options` 並更新圖表標題與摘要文案，惟目前僅更新 UI 狀態且不重新查詢資料。
- **FR-009**：系統必須（MUST）依據 `recommendation.severity` 使用統一的語義色彩（`critical`、`warning`、`info`）渲染徽章，缺省時需退回安全的預設色。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **CapacityPlanningData** | 整個容量規劃頁面的核心資料模型，是包含趨勢、預測、建議和詳細分析的複合體。 | - |
| **TrendSeries** | 一組時間序列數據，包含歷史值和預測值，用於趨勢圖。 | - |
| **Suggestion** | 一條由 AI 生成的具體優化建議，包含標題、詳情、偵測時間與繁體中文的 `impact` / `effort` 等級。 | - |
| **ResourceAnalysis** | 對單一資源的詳細容量分析結果，含用量數值與 `recommendation`（`label`、`action`、`severity`）結構。 | Resource |

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
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/analysis/CapacityPlanningPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
| 指標與告警 (Metrics & Alerts) | ❌ | 頁面缺少 OpenTelemetry 或自訂指標，所有 API 呼叫僅透過共享客戶端發送。 |
| RBAC 權限與審計 | ❌ | UI 未使用 `usePermissions` 或 `<RequirePermission>`，所有操作目前對所有登入者可見，需依《common/rbac-observability-audit-governance.md》導入守衛。 |
| i18n 文案 | ⚠️ | 主要字串透過內容 context 取得，但錯誤與提示訊息仍有中文 fallback，需要補強內容來源。 |
| Theme Token 使用 | ⚠️ | 介面混用 `app-*` 樣式與 Tailwind 色票（如 `bg-slate-*`），尚未完全以設計 token 命名。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[CLARIFICATION]** 「時間範圍」選單目前僅更新前端狀態與圖表文案，不會重新呼叫 API；若需依選項查詢，須擴充後端支援並在前端觸發再取。
- **[CLARIFICATION]** 預測模型圖僅顯示 CPU 指標，尚無切換記憶體/儲存的操作；若要覆蓋更多指標需更新資料結構與 UI。
- **[CLARIFICATION]** `Suggestion.impact`/`effort` 的值為繁中字串（「高/中/低」），與其他模組使用的英文枚舉不同；跨模組共用前需定義轉換策略。
- **[CLARIFICATION]** 匯出功能僅輸出當前載入的資料列，不會啟動後端批次或分頁匯出；大量資料需求需另行設計。
- **[CLARIFICATION]** 頁面尚未實作 RBAC 守門與操作審計，規格中的權限表目前僅為目標狀態。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。