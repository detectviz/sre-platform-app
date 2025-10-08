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
1.  **Given** 我需要每天凌晨 2 點掃描我們的 AWS VPC。
    **When** 我在「自動發現」頁面點擊「新增掃描」，設定任務名稱、掃描類型和 CRON 排程。
    **Then** 新的掃描任務應出現在列表中。

2.  **Given** 一個掃描任務剛剛執行完畢，其狀態顯示為「成功」。
    **When** 我點擊該任務列的「查看結果」按鈕。
    **Then** 系統必須從右側滑出一個抽屜，其中詳細列出了本次掃描的結果。

3.  **Given** 我需要立即重新掃描一個特定區域。
    **When** 我找到對應的掃描任務，並點擊「手動執行」按鈕。
    **Then** 該任務的狀態應變為「執行中」。

### 邊界案例（Edge Cases）
- 當使用者輸入一個無效的 CRON 表達式時，系統應在儲存時給出錯誤提示。
- 當一個任務正在執行中時，其「手動執行」按鈕應被禁用。
- 如果一個任務從未執行過，「最後執行時間」欄位應顯示為 "N/A" 或 "從未"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動發現的掃描任務。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有掃描任務。
- **FR-003**：系統必須（MUST）允許使用者透過 `AutoDiscoveryEditModal` 模態框來新增或編輯掃描任務。
- **FR-004**：系統必須（MUST）在表格中清晰地展示每個任務的執行狀態。
- **FR-005**：系統必須（MUST）提供手動觸發任何已設定掃描任務的功能。
- **FR-006**：系統必須（MUST）提供一個 `DiscoveryJobResultDrawer` 抽屜視圖，用於顯示特定掃描任務的執行結果詳情。
- **FR-007 (AS-IS)**：前端透過一個 `getCronDescription` 輔助函式將 CRON 表達式轉換為人類可讀的描述文字。
- **FR-008 (FUTURE)**：應提供進階篩選和批次操作功能。
- **FR-009 (FUTURE)**：編輯模態框應根據後端提供的綱要（schema）動態渲染不同掃描類型所需的參數欄位。
- **FR-010 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **DiscoveryJob** | 核心資料實體，定義了一個自動發現掃描任務的設定與狀態。 | Datasource (Target) |
| **DiscoveryJobResult** | 一次掃描任務執行後產生的結果，包含了發現的資源列表等資訊。 | DiscoveryJob |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'無法獲取自動掃描任務列表。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-slate-800/70`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] CRON Parsing**: 當前 MVP 在前端進行 CRON 表達式的解析，未來應考慮移至後端或共享函式庫以確保一致性。
- **[NEEDS CLARIFICATION] Dynamic Forms**: 根據掃描類型動態產生表單欄位的功能 (FR-009) 未在當前 MVP 中實現。