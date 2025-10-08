# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-group
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceGroupPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名團隊負責人或平台管理員，我需要能夠將一組相關的資源（例如屬於同一個微服務的所有伺服器和資料庫）組織成一個「資源群組」。這使我能夠從一個更高維度的視角來監控這個服務的整體健康狀況，快速查看其成員狀態摘要，並將其作為一個單一實體進行管理。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「資源群組」管理頁面。
    **When** 我點擊「新增群組」按鈕，填寫群組名稱、描述和成員。
    **Then** 新的群組應出現在列表中。

2.  **Given** 我想快速了解一個名為 "payment-service" 的資源群組的詳細資訊。
    **When** 我在該群組的資料列上點擊「檢視」按鈕。
    **Then** 系統必須從右側滑出一個抽屜，顯示該群組的詳細資訊及其成員列表。

3.  **Given** 一個資源群組的負責團隊發生了變更。
    **When** 我點擊該群組的「編輯」按鈕，並更新「擁有團隊」欄位。
    **Then** 該群組的資訊應被成功更新。

### 邊界案例（Edge Cases）
- 當檢視一個不包含任何成員的資源群組時，抽屜中應顯示「尚未加入任何資源」的提示。
- 當使用者嘗試刪除一個資源群組時，系統必須彈出一個確認對話框。
- 當載入群組成員列表失敗時，抽屜中應顯示明確的錯誤訊息。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理資源群組。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有資源群組。
- **FR-003**：系統必須（MUST）允許使用者透過 `ResourceGroupEditModal` 模態框來新增或編輯資源群組。
- **FR-004**：系統必須（MUST）在表格中為每個群組顯示其成員資源的狀態摘要。
- **FR-005**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定資源群組的詳細資訊及其所有成員資源的列表。
- **FR-006**：系統必須（MUST）提供 `UnifiedSearchModal` 以支援進階篩選。
- **FR-007**：系統必須（MUST）允許使用者自訂表格中顯示的欄位 (`ColumnSettingsModal`)。
- **FR-008 (AS-IS)**：資源群組的 `status_summary` 由後端 API 提供，前端負責將其視覺化為帶有計數的狀態標籤。
- **FR-009 (AS-IS)**：獲取群組成員列表是在前端透過過濾一個完整的資源列表來實現的。
- **FR-010 (FUTURE)**：應提供批次刪除功能。
- **FR-011 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **ResourceGroup** | 核心資料實體，代表一組資源的邏輯集合。 | Resource (Members), Team (Owner) |
| **Resource** | 獨立的基礎設施或應用實體，可作為群組的成員。 | ResourceGroup |
| **Team** | 系統中的團隊，可作為資源群組的擁有者。 | ResourceGroup |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resource-groups:read` | 允許使用者查看資源群組列表及其詳細資訊。 |
| `resource-groups:create` | 允許使用者建立新的資源群組。 |
| `resource-groups:update` | 允許使用者修改現有的資源群組（包括編輯名稱、描述、成員）。 |
| `resource-groups:delete` | 允許使用者刪除資源群組。 |
| `resource-groups:config` | 允許使用者管理頁面設定，如「欄位設定」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `ResourceGroupPage` 的根元件需由 `<RequirePermission permission="resource-groups:read">` 包裹。
- **工具列按鈕**:
  - 「新增群組」按鈕需具備 `resource-groups:create` 權限。
  - 「欄位設定」按鈕需具備 `resource-groups:config` 權限。
- **表格內行內操作**:
  - 「檢視群組」按鈕需具備 `resource-groups:read` 權限。
  - 「編輯群組」按鈕需具備 `resource-groups:update` 權限。
  - 「刪除群組」按鈕需具備 `resource-groups:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。Toast 訊息等處存在硬編碼的中文 fallback。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'無法獲取資源群組。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-slate-800/60`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Member Loading**: 當前 MVP 在前端過濾成員列表 (FR-009)，這在大規模環境下可能導致效能問題，未來應改為後端分頁 API。