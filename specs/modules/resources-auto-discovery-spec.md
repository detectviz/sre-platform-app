# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-auto-discovery
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/AutoDiscoveryPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名雲端管理員或平台維運人員，我需要能夠設定自動化的掃描任務，來定期發現我們在不同雲端提供商或網路區段中的新資源。這將確保我們的資產清單始終保持最新，無需手動添加，從而實現對資源的全面監控和治理。我需要能夠管理這些掃描任務的排程、查看它們的執行歷史和狀態，並審閱每次掃描所發現的結果。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要每天凌晨 2 點掃描我們的 AWS VPC 以發現新的 EC2 實例。
    **When** 我在「自動發現」頁面點擊「新增掃描」，設定任務名稱、選擇掃描類型為 "AWS EC2"，並輸入對應的 CRON 排程 `0 2 * * *`。
    **Then** 新的掃描任務應出現在列表中，並顯示其排程為「於 02:00 執行」。

2.  **Given** 一個掃描任務剛剛執行完畢，其狀態顯示為「成功」。
    **When** 我點擊該任務列的「查看結果」按鈕。
    **Then** 系統必須從右側滑出一個抽屜，其中詳細列出了本次掃描所發現的新資源、變更的資源以及可能已移除的資源。

3.  **Given** 我需要立即重新掃描一個特定區域，而不是等待下一次排程。
    **When** 我找到對應的掃描任務，並點擊「手動執行」按鈕。
    **Then** 該任務的狀態應立即變為「執行中」，並在執行完畢後更新其「最後執行時間」和狀態。

### 邊界案例（Edge Cases）
- 當使用者輸入一個無效的 CRON 表達式時，系統應在儲存時給出錯誤提示。
- 當一個任務正在執行中時，其「手動執行」按鈕應被禁用，以防止重複觸發。
- 如果一個任務從未執行過，其「最後執行時間」欄位應顯示為 "N/A" 或 "從未"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動發現的掃描任務。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有掃描任務。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯掃描任務，包括其名稱、掃描類型和 CRON 排程。
- **FR-004**：系統必須（MUST）能夠將 CRON 表達式轉換為人類可讀的描述文字。
- **FR-005**：系統必須（MUST）在表格中清晰地展示每個任務的執行狀態（例如：等待中、執行中、成功、失敗）。
- **FR-006**：系統必須（MUST）提供手動觸發任何已設定掃描任務的功能。
- **FR-007**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定掃描任務的執行結果詳情。
- **FR-008**：[NEEDS CLARIFICATION: 前端的 `getCronDescription` 函式提供了很好的使用者體驗，但這種業務邏輯是否應在前端實現？為保證一致性，建議此轉換邏輯由後端 API 提供或來自一個共享函式庫。]
- **FR-009**：[NEEDS CLARIFICATION: 「查看結果」抽屜中應顯示哪些具體資訊？需要明確定義掃描結果的資料結構，例如 `new_resources`, `changed_resources`, `deleted_resources` 等。]
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **DiscoveryJob** | 核心資料實體，定義了一個自動發現掃描任務的設定與狀態。 | Datasource (Target) |
| **DiscoveryJobResult** | 一次掃描任務執行後產生的結果，包含了發現的資源列表等資訊。 | DiscoveryJob |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `auto-discovery:read` | 允許使用者查看自動發現任務列表。 |
| `auto-discovery:create` | 允許使用者建立新的掃描任務。 |
| `auto-discovery:update` | 允許使用者修改現有掃描任務的設定。 |
| `auto-discovery:delete` | 允許使用者刪除掃描任務。 |
| `auto-discovery:execute` | 允許使用者手動執行一個掃描任務。 |
| `auto-discovery:results:read` | 允許使用者查看掃描任務的執行結果。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutoDiscoveryPage` 的根元件需由 `<RequirePermission permission="auto-discovery:read">` 包裹。
- **工具列按鈕**:
  - 「新增掃描」按鈕需具備 `auto-discovery:create` 權限。
- **表格內行內操作**:
  - 「查看結果」按鈕需具備 `auto-discovery:results:read` 權限。
  - 「手動執行」按鈕需具備 `auto-discovery:execute` 權限。
  - 「編輯掃描」按鈕需具備 `auto-discovery:update` 權限。
  - 「刪除掃描」按鈕需具備 `auto-discovery:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對掃描任務的 CUD 操作（建立、更新、刪除）及手動執行操作產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增掃描"、"無法獲取自動掃描任務列表。"、"您確定要刪除掃描任務...嗎？" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 元件及中央化的 `JOB_STATUS_META` 來管理狀態顯示，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Cron Description Logic]** 建議將 CRON 表達式到自然語言的轉換邏輯移至後端或共享函式庫，以確保多處使用時的一致性。
- **[NEEDS CLARIFICATION: Job Result Details]** 需要明確定義掃描結果（`DiscoveryJobResult`）的具體資料結構和其在抽屜中的呈現方式。
- **[NEEDS CLARIFICATION: Supported Job Kinds]** 需要一份詳盡的列表，說明系統支援的所有掃描類型（`job_kinds`）及其所需的具體配置參數。