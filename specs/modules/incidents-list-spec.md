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

### 邊界案例（Edge Cases）
- 當 API 請求失敗時，系統應在表格區域顯示一個明確的錯誤訊息，並提供「重試」按鈕。
- 當使用者嘗試匯出一個空的事件列表（無論是無資料還是未選中任何項目）時，系統應顯示一則提示訊息，告知「沒有可匯出的資料」。
- 當後端未提供欄位定義時，系統應有備用機制，顯示一組預設的基礎欄位，以避免頁面完全崩潰。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁的表格中展示事件列表。
- **FR-002**：系統必須（MUST）允許使用者對表格中的多個欄位進行升序或降序排序（如：發生時間、嚴重性）。
- **FR-003**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於多個維度（如：關鍵字、時間範圍、狀態、嚴重性）進行篩選。
- **FR-004**：系統必須（MUST）允許使用者自訂表格中顯示的欄位，並保存其個人化設定。
- **FR-005**：系統必須（MUST）支援對單一事件的操作，包括：快速靜音、認領（對新事件）、重新指派。
- **FR-006**：系統必須（MUST）支援對多個選中事件的批次操作，包括：AI 分析、認領、解決、匯出。
- **FR-007**：系統必須（MUST）提供從 CSV 檔案匯入事件資料的功能。
- **FR-008**：系統必須（MUST）提供將選中或所有事件匯出為 CSV 檔案的功能。
- **FR-009**：系統必須（MUST）在使用者點擊某個事件時，在一個抽屜（Drawer）中顯示該事件的詳細視圖。
- **FR-010**：系統必須（MUST）能夠對選中的一個或多個事件觸發 AI 分析，並在模態框中展示分析報告。
- **FR-011**：系統必須（MUST）在載入資料時顯示載入指示器（如骨架屏），並在發生錯誤時顯示明確的錯誤訊息。
- **FR-012**：系統應該（SHOULD）使用標準化的標籤（StatusTag）來顯示事件的狀態、嚴重性和影響等級，並根據其語義使用不同的顏色。
- **FR-013**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Incident** | 核心資料實體，代表一個獨立的維運事件。 | User (Assignee), SilenceRule, Tags |
| **User** | 系統中的人員，可被指派為事件的負責人。 | Incident |
| **IncidentFilter** | 用於篩選事件列表的一組條件集合。 | - |
| **TableColumn** | 定義表格欄位的元數據，包括 key、label 等。 | - |
| **IncidentAnalysis**| AI 對單一或多個事件進行分析後產生的報告。| Incident |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

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
  - 「匯入」按鈕需具備 `incidents:list:import` 權限。
  - 「匯出」按鈕需具備 `incidents:list:export` 權限。
  - 「欄位設定」按鈕需具備 `incidents:list:config` 權限。
- **批次操作按鈕**:
  - 「AI 分析」按鈕需具備 `incidents:list:analyze` 權限。
  - 「認領」、「解決」按鈕需具備 `incidents:list:update` 權限。
- **表格內行內操作**:
  - 「認領」、「重新指派」、「靜音」按鈕均需具備 `incidents:list:update` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有改變事件狀態的操作（如認領、解決、指派、靜音）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "認領"、"無法獲取事故列表。"、"欄位設定已儲存。" 等。所有 UI 文字應使用 i18n 機制管理。 |
| Theme Token 使用 | ✅ | 程式碼主要使用 Tailwind CSS class，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）
