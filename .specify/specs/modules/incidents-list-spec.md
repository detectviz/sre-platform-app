# 功能規格書（Feature Specification）

**模組名稱 (Module)**: incidents-list
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/incidents/IncidentListPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名站點可靠性工程師（SRE）或維運人員，我希望能集中查看所有系統事件（Incidents），以便快速評估當前系統的健康狀況。我需要能夠對事件列表進行排序、篩選和搜尋，從而快速定位到最重要的問題。我還需要能夠執行基本的 triage 操作，例如認領、解決、指派事件，並能對選定的事件進行批次處理以提升效率。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「事件列表」頁面。
    **When** 我看到一個狀態為 `new` 且嚴重性為 `critical` 的新事件。
    **Then** 我應該能夠直接在該事件列點擊「認領」按鈕，將該事件指派給自己，且該事件的狀態應更新為 `acknowledged`。

2.  **Given** 我已經透過篩選功能，找到了一組與特定服務相關且已處理完畢的事件。
    **When** 我勾選這些事件，並點擊工具列中的「解決」批次按鈕。
    **Then** 所有被選中事件的狀態都應該被更新為 `resolved`，並且 UI 會刷新以顯示最新的狀態。

3.  **Given** 我想要了解某個特定事件的詳細上下文。
    **When** 我點擊該事件的任一資料列。
    **Then** 系統必須從畫面右側滑出一個抽屜（Drawer），其中包含該事件的完整詳細資訊。

4.  **Given** 我習慣於關注特定的幾個欄位，例如 `tags` 和 `resource`。
    **When** 我點擊「欄位設定」按鈕，從所有可用欄位中勾選我想要的欄位並儲存。
    **Then** 表格必須立即更新，只顯示我選擇的欄位，並且這個設定需要被保存，以便我下次訪問時依然生效。

5.  **Given** 我正在事件詳情抽屜中查看一個事件。
    **When** 我在備註區輸入文字並點擊「新增備註」。
    **Then** 該備註應顯示在時間軸中。
    **And When** 我點擊自己新增備註旁的「刪除」按鈕並確認。
    **Then** 該備註應從時間軸中移除。

### 邊界案例（Edge Cases）
- 當 API 請求失敗時，系統應在表格區域顯示一個明確的錯誤訊息，並提供「重試」按鈕。
- 當使用者嘗試匯出一個空的事件列表（無論是無資料還是未選中任何項目）時，系統應顯示一則提示訊息，告知「沒有可匯出的資料」。
- 當後端未提供欄位定義時，系統應有備用機制，顯示一組預設的基礎欄位，以避免頁面完全崩潰。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個功能完整的表格，支援分頁、排序、篩選和欄位自訂。
- **FR-002**：系統必須（MUST）提供對單一和多個事件的完整生命週期管理，包括：認領、指派、解決、靜音、AI 分析、匯入/匯出。
- **FR-003**：當使用者點擊任一事件時，系統必須（MUST）在抽屜（Drawer）中顯示其詳細視圖，其中包含完整的事件血緣（來源告警、相關事件、靜音紀錄）與審批歷程。
- **FR-004**：系統必須（MUST）提供一個簡化的「快速靜音」模態框，僅需使用者輸入靜音時長即可完成操作，而非暴露完整的靜音規則設定。
- **FR-005**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。
- **FR-006**：所有 UI 文字（包括 Toast 通知和時間軸動作翻譯）**必須**使用 i18n Key 進行渲染。
- **FR-007**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token，禁止直接使用 Tailwind 色票。
- **FR-008**：所有 CUD（建立、更新、刪除）和狀態變更操作，都**必須**產生包含操作上下文的審計日誌。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Incident** | 核心資料實體，代表一個獨立的維運事件。 | User (Assignee), SilenceRule, Tags, IncidentEvent |
| **User** | 系統中的人員，可被指派為事件的負責人。 | Incident |
| **IncidentFilter** | 用於篩選事件列表的一組條件集合。 | - |
| **TableColumn** | 定義表格欄位的元數據，包括 key、label 等。 | - |
| **IncidentAnalysis**| AI 對單一或多個事件進行分析後產生的報告。| Incident |
| **IncidentEvent** | 代表事件時間軸中的一個單點事件。 | Incident |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `incidents:list:read` | 允許使用者查看事件列表頁面。 |
| `incidents:list:update` | 允許使用者修改事件，包括「認領」、「解決」、「重新指派」和「快速靜音」。 |
| `incidents:list:analyze` | 允許使用者觸發「AI 分析」功能。 |
| `incidents:list:export` | 允許使用者匯出事件資料。 |
| `incidents:list:import` | 允許使用者匯入事件資料。 |
| `incidents:list:config` | 允許使用者修改「欄位設定」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**:
  - `IncidentListPage` 的根元件需由 `<RequirePermission permission="incidents:list:read">` 包裹。
- **工具列按鈕**:
  - 「匯入」、「匯出」、「欄位設定」按鈕僅在**未選擇任何項目**時顯示於主工具列右側，並各自需要對應的權限。
- **批次操作按鈕**:
  - 當使用者選擇至少一個項目時，主工具列右側應替換為批次操作按鈕。
  - 「AI 分析」、「認領」、「解決」等批次操作按鈕需根據各自的權限進行渲染。
- **表格內行內操作**:
  - 「認領」、「重新指派」、「靜音」按鈕均需具備 `incidents:list:update` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 和狀態變更操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與事件創建、處理時長、AI 分析相關的指標。 |
| RBAC 權限與審計 | ✅ | 所有操作均由 `<RequirePermission>` 或 `usePermissions` hook 進行權限檢查。 |
| i18n 文案 | ✅ | 所有 UI 字串均由 i18n 內容管理系統提供。 |
| Theme Token 使用 | ✅ | 所有顏色均使用標準化的 Theme Token。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 七、模糊與待確認事項（Clarifications）

(此模組的所有待辦事項均已整合至功能需求中。)