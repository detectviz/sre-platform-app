# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-layout
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/LayoutSettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或團隊主管，我需要能夠為我們團隊最常使用的頁面（例如「資源總覽」）客製化其頂部的關鍵績效指標（KPI）卡片。我希望能自由選擇顯示哪些指標、調整它們的排列順序，並為特定指標設定醒目的顏色，以便團隊成員能第一時間關注到最重要的資訊。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想在「資源總覽」頁面新增一個顯示「告警中資源數量」的 KPI 卡片。
    **When** 我在「版面配置設定」頁面找到「資源總覽」，點擊「編輯」。在彈出的模態框中，我從「可用小工具」列表中找到該卡片並將其加入到「已顯示小工具」列表中。
    **Then** 我儲存變更後，所有使用者訪問「資源總覽」頁面時都應能看到新增的這張 KPI 卡片。

2.  **Given** 我認為「嚴重告警數」比「警告告警數」更重要。
    **When** 我在編輯某個頁面的版面配置時，將「嚴重告警數」卡片拖曳到「警告告警數」卡片的前面，並將其顏色設定為「錯誤 (Error)」紅色主題。
    **Then** 儲存後，在對應的頁面上，這兩張卡片的順序和顏色應立即更新。

3.  **Given** 我想移除一個不再關注的 KPI 卡片。
    **When** 我在編輯版面配置時，從「已顯示小工具」列表中將該卡片移除。
    **Then** 儲存後，該卡片將不再顯示在對應的頁面上。

### 邊界案例（Edge Cases）
- 當一個頁面沒有任何可用的 KPI 小工具時，其「可用小工具」列表應顯示為空。
- 當一個頁面沒有選擇任何 KPI 小工具顯示時，其預覽區域應顯示「尚未選擇任何卡片」的提示。
- 使用者應能將所有版面配置設定匯出為一個 JSON 檔案，以供備份或遷移。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個介面，用於管理平台中不同頁面的 KPI 卡片版面配置。
- **FR-002**：系統必須（MUST）在一個表格中列出所有可設定版面的頁面及其當前的配置摘要（如已顯示/可用數量）。
- **FR-003**：對於每個可設定的頁面，系統必須（MUST）提供一個編輯模態框，其中包含一個雙欄選擇器，用於新增或移除 KPI 小工具。
- **FR-004**：在編輯模態框中，使用者必須（MUST）能夠透過拖曳或上下按鈕來調整已選小工具的顯示順序。
- **FR-005**：在編輯模態框中，使用者必須（MUST）能夠為每個已選的 KPI 小工具獨立設定其顏色主題（如預設、成功、警告、錯誤等）。
- **FR-006**：編輯模態框中必須（MUST）提供一個即時預覽區域，展示所選 KPI 卡片在套用其真實資料和所選顏色主題後的外觀。
- **FR-007**：系統必須（MUST）支援將所有版面配置設定匯出為單一的 JSON 檔案。
- **FR-008**: 所有可用的 KPI 小工具定義（`LayoutWidget`）及其預覽資料（`KpiDataEntry`），**必須**由後端 API 動態提供。前端**不應**硬式編碼任何小工具定義。
- **FR-009**: 所有可進行版面配置的頁面列表，**必須**由後端 API 動態提供，以確保其可擴展性。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-011**: 匯入功能**必須**採用「合併與覆寫」策略。當使用者上傳一個 JSON 檔案時，檔案中定義的頁面配置將完全覆寫系統中對應頁面的現有配置；檔案中未提及的頁面配置將保持不變。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **LayoutsData** | 核心資料實體，一個記錄了所有頁面與其對應小工具 ID 列表的映射物件。 | LayoutWidget |
| **LayoutWidget** | 代表一個可被放置在頁面上的獨立 KPI 小工具的定義。 | - |
| **KpiDataEntry** | 代表一個 KPI 小工具當前應顯示的具體數據，包括數值、單位、趨勢和顏色等。 | LayoutWidget |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:layout:read` | 允許使用者查看版面配置頁面。 |
| `settings:layout:update` | 允許使用者修改並儲存所有頁面的版面配置。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `LayoutSettingsPage` 的根元件需由 `<RequirePermission permission="settings:layout:read">` 包裹。
- **表格內行內操作**:
  - 「編輯版面」按鈕需具備 `settings:layout:update` 權限。
- **編輯模態框**:
  - 模態框內的「儲存」按鈕需具備 `settings:layout:update` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對版面配置的更新操作 (`settings:layout:update`) 產生詳細的審計日誌，記錄修改者、目標頁面以及變更前後的配置，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過平台級 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ⚠️ | **[PARTIAL VIOLATION: `constitution.md`]** 此頁面已使用 `useContent` hook，但仍存在後備的硬式編碼英文字串，例如 `'無法獲取版面配置資料。'`。 |
| Theme Token 使用 | ✅ | 程式碼使用了 Ant Design 的 `theme.useToken()` 和自訂的 `useTheme` hook，符合設計系統規範。 |

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