# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-list
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceListPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或系統維運人員，我需要一個統一的資產清單來查看、管理和監控我們所有的基礎設施和應用資源。我希望能快速地從列表中了解每個資源的當前狀態、關鍵效能指標（如 CPU/記憶體使用率）和近期事件數量。我還需要能夠對資源進行新增、修改、刪除等生命週期管理，並能深入鑽取查看單一資源的完整詳情。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「資源列表」頁面。
    **When** 我看到一個資源的 CPU 使用率顯示為紅色。
    **Then** 我應該能夠點擊該資源列，從右側滑出的抽屜中查看其詳細資訊。

2.  **Given** 我發現一個資源的「事件計數」顯示為一個高數值。
    **When** 我點擊該事件計數徽章。
    **Then** 系統必須滑出一個專門的抽屜，顯示該資源最近發生的事件列表。

3.  **Given** 我需要下線一批舊的伺服器。
    **When** 我使用篩選功能找到這些伺服器，將它們全部選中，然後點擊批次「刪除」按鈕。
    **Then** 所有被選中的資源都應被刪除。

### 邊界案例（Edge Cases）
- 當一個資源沒有任何效能指標資料時，其使用率欄位應顯示為 "--"。
- 當一個資源在近期沒有任何事件時，其「事件計數」徽章應為禁用狀態。
- 當使用者嘗試刪除一個資源時，系統必須彈出一個確認對話框。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理所有獨立資源。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有資源。
- **FR-003**：系統必須（MUST）允許使用者透過 `ResourceEditModal` 模態框來新增或編輯資源。
- **FR-004**：系統必須（MUST）在表格中以視覺化方式展示關鍵效能指標（如 CPU/記憶體使用率條）。
- **FR-005**：系統必須（MUST）顯示每個資源的事件計數，並提供鑽取查看事件詳情的功能。
- **FR-006**：系統必須（MUST）在使用者點擊資源時，在一個寬抽屜（Drawer）中顯示該資源的完整詳細頁面 (`ResourceDetailPage`)。
- **FR-007**：系統必須（MUST）支援對多個選中資源的批次操作，包括：AI 分析、刪除、匯入/匯出。
- **FR-008**：系統必須（MUST）提供 `UnifiedSearchModal` 以支援進階篩選。
- **FR-009**：系統必須（MUST）允許使用者自訂表格顯示的欄位 (`ColumnSettingsModal`)。
- **FR-010 (AS-IS)**：效能指標條的顏色是根據從 `options` 獲取的 `utilization_bands` 來動態改變的。
- **FR-011 (AS-IS)**：近期事件列表是透過前端的 `generateMockEvents` 函式模擬產生的，並非來自真實 API。
- **FR-012 (FUTURE)**：對資源的「AI 分析」功能需要實現。
- **FR-013 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Resource** | 核心資料實體，代表一個可監控的獨立資產。 | ResourceGroup, Team (Owner) |
| **ResourceEvent** | 與特定資源關聯的事件，如告警觸發、設定變更等。 | Resource |
| **ResourceMetrics** | 資源的量化效能指標集合，如 CPU/記憶體使用率。 | Resource |
| **ResourceFilters** | 用於篩選資源列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:read` | 允許使用者查看資源列表及資源詳情頁面。 |
| `resources:create` | 允許使用者建立新的資源。 |
| `resources:update` | 允許使用者修改現有的資源。 |
| `resources:delete` | 允許使用者刪除資源。 |
| `resources:analyze` | 允許使用者觸發「AI 分析」功能。 |
| `resources:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `ResourceListPage` 的根元件需由 `<RequirePermission permission="resources:read">` 包裹。
- **工具列按鈕**:
  - 「新增資源」按鈕需具備 `resources:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `resources:config` 權限。
- **批次操作按鈕**:
  - 「AI 分析」按鈕需具備 `resources:analyze` 權限。
  - 「刪除」按鈕需具備 `resources:delete` 權限。
- **表格內行內操作**:
  - 「查看詳情」按鈕需具備 `resources:read` 權限。
  - 「編輯資源」按鈕需具備 `resources:update` 權限。
  - 「刪除資源」按鈕需具備 `resources:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。此頁面大部分為硬編碼中文，未接入 i18n 內容管理系統。 |
| Theme Token 使用 | 🟡 | 部分實現。UI 混用預定義樣式與直接的 Tailwind 色票。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'無法獲取資源列表。'`)，未來需全面遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-sky-900/50`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Mock Event Data**: 當前 MVP 的事件列表是透過前端 `generateMockEvents` 函式模擬的 (FR-011)，未來必須替換為真實的後端 API。