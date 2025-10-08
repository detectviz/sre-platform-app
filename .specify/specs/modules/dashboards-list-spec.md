# 功能規格書（Feature Specification）

**模組名稱 (Module)**: dashboards-list
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/dashboards/DashboardListPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或任何平台使用者，我需要一個集中的地方來查看所有可用的儀表板，無論它們是系統內建的、從 Grafana 匯入的，還是連結到其他外部系統的。我希望能輕鬆地找到我需要的儀表板，將最常用的設定為我的首頁，並對自訂儀表板進行管理。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我經常需要查看「SRE 作戰室」這個儀表板。
    **When** 我在儀表板列表中找到它，並點擊「設為首頁」的星號圖示。
    **Then** 該圖示應變為高亮狀態，且該設定會被儲存在客戶端。

2.  **Given** 我想建立一個新的儀表板來追蹤特定服務的效能。
    **When** 我點擊「新增儀表板」按鈕，在彈出的模態框中填寫資訊。
    **Then** 新的儀表板應出現在列表中。

3.  **Given** 我需要編輯一個已存在的 Grafana 儀表板。
    **When** 我點擊該儀表板旁的「編輯」按鈕。
    **Then** 系統應導航到一個專門的編輯器頁面 (`/dashboards/{id}/edit`)。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個被設為預設首頁的儀表板時，系統應在刪除後，自動將預設首頁重設為一個系統預設的儀表板。
- 對於「內建」類型的儀表板，其「刪除」按鈕在 UI 上應被禁用或隱藏。
- 當使用者嘗試匯入一個格式不正確的 CSV 檔案時，系統應給出明確的錯誤提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個功能完整的表格，支援分頁、排序、篩選、欄位自訂和批次操作。
- **FR-002**：系統必須（MUST）支援對儀表板的完整 CRUD 操作。
- **FR-003**：系統必須（MUST）允許使用者將任一儀表板設定為其個人化的「預設首頁」，此設定應儲存在客戶端 (`localStorage`)。
- **FR-004**：點擊 `external` 類型的儀表板時，系統**必須**根據其 `target` 屬性（`_self` 或 `_blank`）決定是在當前分頁還是在新分頁中開啟其 URL。
- **FR-005**：工具列按鈕應根據選擇狀態動態變化：未選擇任何項目時顯示「匯入」、「匯出」等全局操作；選擇至少一項後，替換為「批次刪除」等批次操作。
- **FR-006**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-007**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-008**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Dashboard** | 核心資料實體，代表一個儀表板的設定與元數據，包含可選的 `target` 屬性。 | User (Owner) |
| **DashboardFilters** | 用於篩選儀表板列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `dashboards:list:read` | 允許使用者查看儀表板列表。 |
| `dashboards:create` | 允許使用者建立新的儀表板。 |
| `dashboards:update` | 允許使用者修改儀表板的元數據。 |
| `dashboards:delete` | 允許使用者刪除自訂儀表板。 |
| `dashboards:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `DashboardListPage` 的根元件需由 `<RequirePermission permission="dashboards:list:read">` 包裹。
- **工具列按鈕**: 「新增儀表板」、「匯入」、「匯出」、「欄位設定」按鈕需根據各自的權限進行渲染。
- **批次操作按鈕**: 「刪除」按鈕需具備 `dashboards:delete` 權限。
- **表格內行內操作**:
  - 「設為首頁」按鈕：任何具備 `dashboards:list:read` 權限的使用者都應可見。
  - 「編輯」按鈕需具備 `dashboards:update` 權限。
  - 「刪除」按鈕需具備 `dashboards:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與儀表板載入時間、操作成功/失敗率相關的指標。 |
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