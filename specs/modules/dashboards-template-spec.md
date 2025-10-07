# 功能規格書（Feature Specification）

**模組名稱 (Module)**: dashboards-template
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/dashboards/DashboardTemplatesPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名需要建立新儀表板的使用者，我希望能從一個預先定義好的範本庫中進行選擇，而不是每次都從零開始。我希望瀏覽一個包含各種用途（如服務健康度、基礎設施監控）的範本市集，以便快速啟動一個結構良好且符合最佳實踐的儀表板。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「儀表板範本」頁面。
    **When** 我看到一個名為「微服務健康度」的範本，它看起來符合我的需求，於是我點擊了「使用此範本」按鈕。
    **Then** 系統必須將我導航至新增儀表板的頁面，並且該頁面的表單應已預先填寫好所選範本的佈局和圖表設定。

2.  **Given** 我訪問「儀表板範本」頁面，但後端沒有配置任何範本。
    **When** 頁面載入完成。
    **Then** 頁面應顯示一個清晰的提示訊息，告知「暫無可用的儀表板範本」。

### 邊界案例（Edge Cases）
- 當 API 請求失敗時，頁面應顯示錯誤狀態，而不是一個空白頁面。
- 即使某個範本的圖示（icon）名稱不正確，頁面也不應崩潰，而是顯示一個預設圖示或空白區域。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/dashboards/templates` API 端點獲取儀表板範本列表。
- **FR-002**：系統必須（MUST）以卡片網格（Card Grid）的形式展示所有可用的儀表板範本。
- **FR-003**：每個範本卡片必須（MUST）展示其名稱、描述、圖示和分類。
- **FR-004**：每個範本卡片必須（MUST）包含一個「使用此範本」的按鈕。
- **FR-005**：點擊「使用此範本」按鈕後，系統必須（MUST）導航至新增儀表板的頁面 (`/dashboards/new`)。
- **FR-006**：在導航時，系統必須（MUST）將所選的完整範本物件（template object）透過路由狀態（route state）傳遞給目標頁面。
- **FR-007**: 本模組僅作為儀表板範本的「消費端」。範本的來源與管理（CRUD 操作）應由後端（例如，透過資料庫種子資料）或一個獨立的、更高權限的管理模組負責，其規格不在此文件定義範圍內。
- **FR-008**：系統必須（MUST）根據使用者的權限，決定其是否能查看此頁面以及使用範本。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **DashboardTemplate** | 核心資料實體，定義了一個儀表板的預設結構、佈局和圖表配置。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `dashboards:templates:read` | 允許使用者查看儀表板範本庫頁面。 |
| `dashboards:create` | （關聯權限）允許使用者使用範本來實際建立儀表板。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `DashboardTemplatesPage` 的根元件需由 `<RequirePermission permission="dashboards:templates:read">` 包裹。
- **「使用此範本」按鈕**:
  - 此按鈕的**可見性**與頁面可見性一致 (`dashboards:templates:read`)。
  - 點擊後，會導航至新增儀表板的流程，該流程的**最終成功與否**將由 `dashboards:create` 權限來控制。這確保了職責分離：能看範本不代表一定能用範本建立儀表板。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 點擊「使用此範本」的行為應觸發一個**業務分析事件**（而非安全審計日誌），記錄 `user_id` 和 `template_id`，用於分析範本的受歡迎程度。實際的儀表板建立操作將在 `dashboards-list` 模組中被審計。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ⚠️ | **[PARTIAL VIOLATION: `constitution.md`]** 此頁面已開始使用 `useContent` hook，但仍存在後備的硬式編碼英文字串 `'使用此範本'`，違反了完全 i18n 的原則。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 和從 `options` 中獲取的分類描述符來管理樣式，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

（無）