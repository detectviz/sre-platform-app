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
1.  **Given** 我想在「資源總覽」頁面新增一個 KPI 卡片。
    **When** 我在「版面配置設定」頁面點擊「編輯」，在彈出的模態框中，將一個可用的小工具加入到「已顯示小工具」列表中。
    **Then** 儲存變更後，所有使用者訪問「資源總覽」頁面時都應能看到新增的卡片。

2.  **Given** 我認為「嚴重告警數」比「警告告警數」更重要。
    **When** 我在編輯版面配置時，將「嚴重告警數」卡片拖曳到「警告告警數」卡片的前面，並將其顏色設定為「錯誤」主題。
    **Then** 儲存後，在對應的頁面上，這兩張卡片的順序和顏色應立即更新。

3.  **Given** 我想移除一個不再關注的 KPI 卡片。
    **When** 我在編輯版面配置時，將該卡片從「已顯示小工具」列表中移除。
    **Then** 儲存後，該卡片將不再顯示在對應的頁面上。

### 邊界案例（Edge Cases）
- 當一個頁面沒有任何可用的 KPI 小工具時，「可用小工具」列表應顯示為空。
- 當一個頁面沒有選擇任何 KPI 小工具顯示時，其預覽區域應顯示「尚未選擇任何卡片」的提示。
- 使用者應能將所有版面配置設定匯出為一個 JSON 檔案。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個介面，用於管理平台中不同頁面的 KPI 卡片版面配置。
- **FR-002**：系統必須（MUST）在一個表格中列出所有可設定版面的頁面及其配置摘要。
- **FR-003**：系統必須（MUST）提供一個編輯模態框，其中包含一個雙欄選擇器 (`DualListSelector`)，用於新增或移除 KPI 小工具。
- **FR-004**：在編輯模態框中，使用者必須（MUST）能夠透過拖曳或上下按鈕來調整已選小工具的顯示順序。
- **FR-005**：在編輯模態框中，使用者必須（MUST）能夠為每個已選的 KPI 小工具獨立設定其顏色主題。
- **FR-006**：編輯模態框中必須（MUST）提供一個即時預覽區域，展示所選 KPI 卡片在套用其真實資料和所選顏色主題後的外觀。
- **FR-007**：系統必須（MUST）支援將所有版面配置設定匯出為單一的 JSON 檔案。
- **FR-008 (AS-IS)**：所有可用的 KPI 小工具定義、頁面列表和預覽資料均由後端 API 動態提供。
- **FR-009 (AS-IS)**：儲存版面配置後，系統會將設定寫入 `localStorage` 並觸發 `storage` 事件，以實現跨頁面即時更新。
- **FR-010 (FUTURE)**：系統應支援從 JSON 檔案匯入版面配置，並採用「合併與覆寫」策略。
- **FR-011 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **LayoutsData** | 核心資料實體，一個記錄了所有頁面與其對應小工具 ID 列表的映射物件。 | LayoutWidget |
| **LayoutWidget** | 代表一個可被放置在頁面上的獨立 KPI 小工具的定義。 | - |
| **KpiDataEntry** | 代表一個 KPI 小工具當前應顯示的具體數據，包括數值、單位、趨勢和顏色等。 | LayoutWidget |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

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

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。系統透過 `useContent` hook 載入 UI 文字，但存在硬編碼的 fallback。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 中，`showToast` 的訊息存在硬編碼的 fallback (`'版面配置已成功儲存。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-slate-800/60`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Import Logic**: 匯入功能 (FR-010) 在當前 MVP 中未啟用，需在未來版本中實現。