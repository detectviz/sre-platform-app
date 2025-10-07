# 功能規格書（Feature Specification）

**模組名稱 (Module)**: dashboards-list
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/dashboards/DashboardListPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或任何平台使用者，我需要一個集中的地方來查看所有可用的儀表板，無論它們是系統內建的、從 Grafana 匯入的，還是連結到其他外部系統的。我希望能輕鬆地找到我需要的儀表板，將最常用的設定為我的首頁，並對自訂儀表板進行管理。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我經常需要查看「SRE 作戰室」這個儀表板。
    **When** 我在儀表板列表中找到它，並點擊「設為首頁」的星號圖示。
    **Then** 該圖示應變為高亮狀態，並且下次我訪問平台根路徑時，應自動跳轉到此儀表板。

2.  **Given** 我想建立一個新的儀表板來追蹤特定服務的效能。
    **When** 我點擊「新增儀表板」按鈕，選擇一個範本或從頭開始建立。
    **Then** 新的儀表板應出現在列表中，我便可以點擊進入並開始配置。

3.  **Given** 我需要編輯一個已存在的 Grafana 儀表板的連結。
    **When** 我點擊該儀表板旁的「編輯」按鈕。
    **Then** 系統必須導航到一個專門的編輯器頁面，讓我修改其設定。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個被設為預設首頁的儀表板時，系統應在刪除後，自動將預設首頁重設為一個系統預設的儀表板（例如 "SRE 作戰室"），以避免使用者登入後看到錯誤頁面。
- 對於「內建」類型的儀表板，其「刪除」按鈕應被禁用或隱藏，因為它們是系統核心功能的一部分。
- 當使用者嘗試匯入一個格式不正確的 CSV 檔案時，系統應給出明確的錯誤提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有儀表板。
- **FR-002**：系統必須（MUST）支援對儀表板的 CRUD 操作（建立、讀取、更新、刪除），但應根據儀表板類型限制某些操作（如刪除內建儀表板）。
- **FR-003**：系統必須（MUST）允許使用者將任一儀表板設定為其個人化的「預設首頁」。
- **FR-004**：系統必須（MUST）根據儀表板的類型（如 `built-in`, `grafana`, `external`）提供不同的圖示和標籤以示區分。
- **FR-005**：系統必須（MUST）為不同類型的儀表板提供不同的編輯流程。例如，編輯 Grafana 儀表板會導航到一個專門的編輯頁面，而編輯其他類型則使用模態框。
- **FR-006**：系統必須（MUST）支援對儀表板的批次刪除、匯入/匯出 (CSV) 和欄位自訂功能。
- **FR-007**：系統應該（SHOULD）在表格中清晰地標示出哪個是當前設定的預設首頁儀表板。
- **FR-008**: 對於 `external` 類型的儀表板，其核心功能是一個外部連結。
    - 在新增或編輯此類型儀表板時，其設定欄位**必須**包含一個用於輸入 URL 的欄位。
    - 在列表頁點擊此類型儀表板時，系統**必須**在新的瀏覽器分頁中開啟其設定的 URL (`target="_blank"`)。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Dashboard** | 核心資料實體，代表一個儀表板的設定與元數據。 | User (Owner) |
| **DashboardFilters** | 用於篩選儀表板列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `dashboards:list:read` | 允許使用者查看儀表板列表。 |
| `dashboards:create` | 允許使用者建立新的儀表板。 |
| `dashboards:update` | 允許使用者修改儀表板的元數據（如名稱、描述）。 |
| `dashboards:delete` | 允許使用者刪除自訂儀表板。 |
| `dashboards:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `DashboardListPage` 的根元件需由 `<RequirePermission permission="dashboards:list:read">` 包裹。
- **工具列按鈕**:
  - 「新增儀表板」按鈕需具備 `dashboards:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `dashboards:config` 權限。
- **批次操作按鈕**:
  - 「刪除」按鈕需具備 `dashboards:delete` 權限。
- **表格內行內操作**:
  - 「設為首頁」按鈕：此為個人化功能，任何具備 `dashboards:list:read` 權限的使用者都應可以為自己設定首頁，**無需**額外權限。
  - 「編輯」按鈕需具備 `dashboards:update` 權限。
  - 「刪除」按鈕需具備 `dashboards:delete` 權限。系統應在後端額外檢查，防止使用者刪除內建的（built-in）儀表板。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對儀表板的 CUD 操作（建立、更新、刪除）及設為首頁的操作產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 根據 `constitution.md` 的要求，所有 UI 字串，包括按鈕文字、提示訊息、錯誤訊息和後備字串，**必須**透過 `useContent` hook 從集中的語言檔案中讀取，禁止在元件中硬式編碼任何使用者可見的文字。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 元件及 `typeToneMap` 等來管理狀態顯示，符合設計系統規範。 |

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