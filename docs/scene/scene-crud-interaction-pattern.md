# Scene CRUD Interaction Pattern Specification（Scenes 架構通用 CRUD 模式規範）

**模組名稱 (Module)**: Scene CRUD Interaction Pattern  
**來源 (Source)**: `SceneControls`, `SceneTable`, `SceneQueryRunner`, `SceneVariableSet`, `ScenePanel`, `SceneEventBus`  
**建立日期 (Created)**: 2025-10-08  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為使用者，我期望在平台的任何資源管理場景中（如事件、資源、告警、自動化），都能使用一致且可預測的 CRUD 操作體驗。  
所有建立、編輯、刪除與搜尋操作應遵循相同的互動模式與視覺語義，無論模組類型如何變化。

### 驗收情境（Acceptance Scenarios）
1. **Given** 我在任意 SceneAppPage 的管理頁面。  
   **When** 我點擊 `SceneControls` 中的「新增」按鈕。  
   **Then** 系統應開啟一個 `Inline SubScene` 或 `Context ScenePanel` 用於建立資源。  

2. **Given** 我在 `SceneTable` 中點擊某一行的刪除操作。  
   **When** 該操作被觸發。  
   **Then** 系統必須顯示一個 `ScenePanel` 形式的確認對話場景，並要求再次確認。  

3. **Given** 我勾選了多個列表項目。  
   **When** 查看 `SceneControls`。  
   **Then** 控制列應切換為批次操作模式，提供「批次刪除」等場景。  

---

## 二、功能需求（Functional Requirements）

- **FR-001**：所有 CRUD 類型的 Scene 模組必須（MUST）提供完整的建立、讀取、更新與刪除生命週期行為，操作由 `SceneControls` 統一觸發。  
- **FR-002**：**建立 (Create)** 操作必須（MUST）開啟 `Inline SubScene` 或 `Context ScenePanel`，並由 `SceneVariableSet` 傳入初始狀態。  
- **FR-003**：**讀取 (Read)** 操作應使用 `SceneTable` 顯示，並由 `SceneQueryRunner` 管理查詢、分頁與刷新。  
- **FR-004**：**更新 (Update)** 操作可複用 Create 的 SubScene 結構，僅差異化資料載入與標題。  
- **FR-005**：**刪除 (Delete)** 操作必須（MUST）觸發 `ScenePanel` 確認場景，附帶 `auditId` 或 `requestId` 以供追蹤。  
- **FR-006**：支援批次操作（Batch Actions），由 `SceneControls` 的 `selectionMode` 控制，所有操作事件廣播至 `SceneEventBus`。  
- **FR-007**：進階搜尋與篩選應由 `SceneVariableSet` 管理，全域同步時間與狀態變數。  
- **FR-008**：所有成功的操作應觸發 `SceneQueryRunner` 自動刷新資料流，並由 `SceneTelemetry` 回報延遲指標。  
- **FR-009**：失敗操作應交由 `SceneStatusHandler` 顯示錯誤提示，並提供重試行為。  

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **SceneControls** | 操作區，包含建立、批次操作與篩選控制。 | SceneVariableSet |
| **SceneTable** | 用於呈現資料列表，遵循 table-guideline。 | SceneQueryRunner |
| **SceneQueryRunner** | 管理資料查詢、重新整理與效能指標上報。 | SceneTable |
| **SceneVariableSet** | 維護篩選、搜尋與分頁條件。 | SceneControls |
| **ScenePanel** | 顯示建立、編輯或確認操作的上下文場景。 | SceneState |
| **SceneEventBus** | 廣播 CRUD 事件與系統通知。 | 全域可訂閱 |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CRUD 操作透過 `SceneEventBus` 廣播，並於後端審計日誌追蹤。 |
| 指標與告警 (Metrics & Alerts) | ✅ | `SceneTelemetry` 上報成功率、延遲與失敗次數。 |
| RBAC 權限與審計 | ✅ | 權限由 `SceneAppProvider` 驗證，審計由後端執行。 |
| i18n 文案 | ✅ | 所有文案應由 Scene context 提供多語支持。 |
| Theme Token 使用 | ✅ | 控制項與表格遵循 Grafana Token System。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無舊版前端技術詞彙（AntD、React Hooks）。  
- [x] 所有 FR 具可測試性與明確性。  
- [x] 結構與 `.specify/memory/constitution.md` 一致。  
- [x] 所有行為具閉環資料流（SceneQueryRunner 驅動）。  
- [x] 符合共用規範（Theme、RBAC、Audit、Telemetry）。  

---

## 六、模糊與待確認事項（Clarifications）

- `SceneTable` 是否支援樂觀更新，或必須等待 API 成功回應後刷新。  
- 批次刪除操作是否允許並行請求。  
- 同一模組中是否允許同時存在 `Inline SubScene` 與 `Context ScenePanel`。  
- 是否統一定義 CRUD 操作的 Telemetry 指標（成功率、延遲、錯誤類型）。  

---

## 七、結語  

此文件定義了 SRE 平台在 Grafana Scenes 架構下的標準化 CRUD 行為模式。  
所有模組應以 `SceneControls`、`SceneTable`、`ScenePanel`、`SceneVariableSet` 為核心構建，  
並透過 `SceneQueryRunner` 保持資料流閉環與狀態一致性。  
該規範為跨模組一致性、治理與可觀測性之基礎文件。