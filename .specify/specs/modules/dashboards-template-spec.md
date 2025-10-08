# 功能規格書（Feature Specification）

**模組名稱 (Module)**: dashboards-template
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/dashboards/DashboardTemplatesPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名需要建立新儀表板的使用者，我希望能從一個預先定義好的範本庫中進行選擇，而不是每次都從零開始。我希望瀏覽一個包含各種用途（如服務健康度、基礎設施監控）的範本市集，以便快速啟動一個結構良好且符合最佳實踐的儀表板。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「儀表板範本」頁面。
    **When** 我看到一個名為「微服務健康度」的範本，它看起來符合我的需求，於是我點擊了「使用此範本」按鈕。
    **Then** 系統應將我導航至新增儀表板的頁面，並將所選的範本資料透過路由狀態傳遞過去。

2.  **Given** 我訪問「儀表板範本」頁面，但後端沒有配置任何範本。
    **When** 頁面載入完成。
    **Then** 頁面應顯示一個清晰的提示訊息，告知「暫無可用的儀表板範本」。

### 邊界案例（Edge Cases）
- 當 API 請求失敗時，頁面應顯示一個清晰的錯誤狀態。
- 即使某個範本的圖示（icon）名稱不正確，頁面也不應崩潰，而是顯示一個預設圖示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/dashboards/templates` API 端點獲取儀表板範本列表。
- **FR-002**：系統必須（MUST）以卡片網格（Card Grid）的形式展示所有可用的儀表板範本，每張卡片需展示其名稱、描述、圖示和分類標籤。
- **FR-003**：點擊「使用此範本」按鈕後，系統必須（MUST）導航至新增儀表板的頁面 (`ROUTES.DASHBOARDS_NEW`)，並透過路由狀態 (`route state`) 傳遞完整的範本物件。
- **FR-004**：本模組僅作為儀表板範本的「消費端」，不提供 CRUD 操作。範本的管理由一個獨立的、更高權限的模組或後端流程負責。
- **FR-005**：所有 UI 文字（包括按鈕標籤和空狀態提示）**必須**使用 i18n Key 進行渲染。
- **FR-006**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-007**：系統必須（MUST）根據使用者的權限，決定其是否能查看此頁面以及使用範本。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **DashboardTemplate** | 核心資料實體，定義了一個儀表板的預設結構、佈局和圖表配置。 | - |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `dashboards:templates:read` | 允許使用者查看儀表板範本庫頁面。 |
| `dashboards:create` | （關聯權限）允許使用者使用範本來實際建立儀表板。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `DashboardTemplatesPage` 的根元件需由 `<RequirePermission permission="dashboards:templates:read">` 包裹。
- **「使用此範本」按鈕**: 點擊後，會導航至新增儀表板的流程，該流程的最終成功與否將由 `dashboards:create` 權限來控制。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 使用者點擊「使用此範本」時，應產生包含範本 ID 和使用者資訊的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與範本載入成功率、使用率相關的指標。 |
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