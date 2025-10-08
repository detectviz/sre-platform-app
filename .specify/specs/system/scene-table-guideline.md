# Scene Table Behavior & Design Guideline（Scenes 架構通用規範）

**模組名稱 (Module)**: Scene Table Behavior & Design Guideline  
**來源 (Source)**: `SceneTable`, `SceneVariableSet`, `SceneStatusHandler`, `SceneQueryRunner`  
**建立日期 (Created)**: 2025-10-08  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，我希望平台內所有以表格呈現資料的頁面，都具備一致、可預測、效能穩定的操作體驗。無論我查看事件、資源或自動化任務列表，我都能透過相同的方式進行篩選、排序、分頁與欄位自訂。

### 驗收情境（Acceptance Scenarios）
1. **Given** 我打開任何 Scene 表格頁面。  
   **When** 資料量超過一頁。  
   **Then** 系統必須顯示 `SceneControls` 提供分頁控制，並同步更新對應的 `SceneVariableSet`。

2. **Given** 我點擊某一欄位標頭（如「最後更新時間」）。  
   **When** 排序狀態改變。  
   **Then** `SceneQueryRunner` 重新執行查詢，並更新 `SceneTable` 的排序視覺狀態。

3. **Given** 我想隱藏部分欄位。  
   **When** 我開啟欄位設定（Field Config）。  
   **Then** 系統應更新 `SceneTable` 的可見欄位清單，並保留使用者偏好於全域變數儲存區。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：所有表格必須（MUST）使用 `SceneTable` 作為資料展示容器，以確保統一的佈局、樣式與虛擬滾動策略。  
- **FR-002**：當資料量超出單頁容量時，必須（MUST）由 `SceneControls` 提供分頁與條件篩選介面，與 `SceneVariableSet` 綁定。  
- **FR-003**：支援排序的欄位應透過 `SceneTable` 欄位定義啟用排序，排序狀態由 `SceneQueryRunner` 自動控制。  
- **FR-004**：所有 Scene 表格應提供欄位自訂功能，並透過 Field Config 設定可見欄位集合。  
- **FR-005**：在資料載入期間，表格區域必須（MUST）顯示由 `SceneStatusHandler` 管理的 Loading 狀態。  
- **FR-006**：當資料獲取失敗時，`SceneStatusHandler` 應顯示標準錯誤提示並允許重新查詢。  
- **FR-007**：當列表資料超過 200 筆時，必須（MUST）啟用虛擬滾動，並遵循 `SceneTable` 的虛擬化參數。  
- **FR-008**：表格中如狀態、類型、嚴重性等語義欄位，應透過 Theme Token 配色（`success/warning/error/info`）統一顯示。  
- **FR-009**：表格需符合效能 SLA：首次渲染 < 200ms、互動回應（排序、分頁） < 150ms，由 `SceneQueryRunner` 報告遙測指標。  
- **FR-010**：Sticky Rows 支援固定表頭及額外摘要列，需與虛擬滾動兼容。  
- **FR-011**：如啟用 Inline Edit，需採行「即時驗證 + 送出時錯誤回饋」流程，整合至 `SceneQueryRunner` 的 CRUD 流程中。  

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **SceneTable** | 表格主體與佈局容器。 | - |
| **SceneVariableSet** | 控制表格篩選、分頁與狀態變數。 | SceneControls |
| **SceneQueryRunner** | 管理資料查詢、排序與更新流程。 | SceneTable |
| **SceneStatusHandler** | 控制載入與錯誤狀態顯示。 | SceneTable |
| **SceneControls** | 分頁與篩選控制介面。 | SceneVariableSet |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 指標與告警 (Metrics & Alerts) | ✅ | 監控首次渲染時間、互動延遲與虛擬滾動命中率。 |
| 記錄與追蹤 (Logging/Tracing) | ✅ | `SceneQueryRunner` 應紀錄查詢成功、失敗與耗時。 |
| Theme Token 使用 | ✅ | 表格顏色、字體與間距應遵循 Grafana Token System。 |
| 效能 SLA 驗證 | ✅ | 自動上報渲染與互動效能指標。 |
| i18n 文案 | ✅ | 所有文字應透過 `useContent()` 或對應 Scene context 取得。 |

---

## 五、模糊與待確認事項（Clarifications）

- 虛擬滾動在 Scenes 中由 `SceneTable` 自動管理，需確認最大行數門檻是否統一設為 200。  
- Sticky Rows 功能需測試與虛擬滾動併用時的效能。  
- Inline Edit 的場景更新機制需定義為 CRUD 操作內的子場景。  
- 遙測上報格式（Metrics Schema）需與後端統一。  

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無傳統前端技術詞彙（AntD、React Hooks）。  
- [x] 所有 FR 對應 Scenes 架構。  
- [x] 符合 `.specify/memory/constitution.md`。  
- [x] 規格可測試、可觀測。  
- [x] 適用於所有模組級 SceneAppPage。