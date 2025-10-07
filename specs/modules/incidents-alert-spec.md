# 功能規格書（Feature Specification）

**模組名稱 (Module)**: incidents-alert
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/incidents/AlertRulePage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或資深 SRE，我需要能夠定義、管理和維護系統的告警規則。我希望有一個集中的介面來查看所有現存的規則，能夠快速新增、修改、複製或刪除它們。為了確保規則的有效性，我還需要能夠對其進行啟用/停用切換，並對選定的規則進行 AI 分析以評估其潛在影響和優化建議。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「告警規則」管理頁面。
    **When** 我點擊「新增規則」按鈕。
    **Then** 系統必須彈出一個編輯模態框，讓我填寫新規則的名稱、條件、嚴重性等資訊並儲存。

2.  **Given** 我發現一條現有規則過於頻繁地觸發誤報。
    **When** 我在該規則的資料列點擊「編輯」按鈕，調整其觸發條件，然後儲存。
    **Then** 該規則應以新的條件生效，且列表中的「最後更新時間」應被更新。

3.  **Given** 我需要暫時停用一組季節性的告警規則。
    **When** 我在表格中勾選這些規則，並在工具列中點擊「停用」批次操作按鈕。
    **Then** 所有被選中的規則狀態都應變為「停用」，並且其在表格中的啟用開關（Toggle）會顯示為關閉狀態。

4.  **Given** 我想建立一條與現有規則類似的新規則。
    **When** 我點擊某條規則旁的「複製」按鈕。
    **Then** 系統會打開一個預先填寫好該規則大部分資訊的編輯模態框，其名稱會被加上 "Copy of" 前綴，且預設為停用狀態，讓我能快速修改並建立新規則。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一條規則時，系統必須彈出一個確認對話框，防止誤操作。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。
- 在新增規則後，表格應自動跳轉到第一頁，以確保使用者能看到新建立的項目。
- 如果批次刪除規則後當前頁面變為空，系統應自動跳轉回第一頁。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個包含建立、讀取、更新和刪除（CRUD）功能的介面來管理告警規則。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有告警規則。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯告警規則的詳細設定（如名稱、描述、條件、嚴重性等）。
- **FR-004**：系統必須（MUST）提供複製現有規則以建立新規則的功能。
- **FR-005**：系統必須（MUST）允許使用者單獨或批次地啟用/停用告警規則。
- **FR-006**：系統必須（MUST）支援批次刪除選定的告警規則。
- **FR-007**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於多個維度（如：關鍵字、狀態、嚴重性）篩選規則。
- **FR-008**：系統必須（MUST）允許使用者自訂表格顯示的欄位，並保存其設定。
- **FR-009**：系統必須（MUST）提供從 CSV 檔案匯入及將規則匯出為 CSV 檔案的功能。
- **FR-010**：系統必須（MUST）能夠對選中的一條或多條規則觸發 AI 分析，並在模態框中展示分析報告。
- **FR-011**：系統應該（SHOULD）使用語義化的標籤或開關來清晰地展示規則的狀態（啟用/停用）、嚴重性等級和自動化狀態。
- **FR-012**: 告警規則的 `conditions_summary` 欄位應由前端根據結構化的 `conditions` 欄位生成。後端 API **必須**在回傳 `AlertRule` 物件時，提供一個結構化的 `conditions` 欄位，並在 `options` 中提供用於顯示的標籤字典。
- **FR-013**: AI 分析報告必須包含規則冗餘檢查、有效性分數和人類可讀的優化建議。
- **FR-014**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AlertRule** | 核心資料實體，定義了觸發告警的條件與屬性。包含一個結構化的 `conditions` 欄位。 | Automation (Playbook) |
| **RuleAnalysisReport** | AI 對告警規則進行分析後產生的報告。包含 `redundancy_check`, `effectiveness_score`, `suggestion` 欄位。 | AlertRule |
| **AlertRuleFilter** | 用於篩選告警規則列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `alert-rules:read` | 允許使用者查看告警規則列表。 |
| `alert-rules:create` | 允許使用者建立新的告警規則。 |
| `alert-rules:update` | 允許使用者修改現有的告警規則（包括編輯、複製、啟用/停用）。 |
| `alert-rules:delete` | 允許使用者刪除告警規則。 |
| `alert-rules:analyze` | 允許使用者觸發「AI 分析」功能。 |
| `alert-rules:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AlertRulePage` 的根元件需由 `<RequirePermission permission="alert-rules:read">` 包裹。
- **工具列按鈕**:
  - 「新增規則」按鈕需具備 `alert-rules:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `alert-rules:config` 權限。
- **批次操作按鈕**:
  - 「AI 分析」按鈕需具備 `alert-rules:analyze` 權限。
  - 「啟用」、「停用」按鈕需具備 `alert-rules:update` 權限。
  - 「刪除」按鈕需具備 `alert-rules:delete` 權限。
- **表格內行內操作**:
  - 「編輯」、「複製」按鈕需具備 `alert-rules:update` 權限。
  - 行內的「啟用/停用」開關需具備 `alert-rules:update` 權限。
  - 「刪除」按鈕需具備 `alert-rules:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對告警規則的 CUD 操作（建立、更新、刪除、啟用/停用）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增規則"、"無法獲取告警規則。"、"您確定要刪除告警規則...嗎？" 等。 |
| Theme Token 使用 | ✅ | 程式碼主要使用 Tailwind CSS class，符合設計系統規範。狀態標籤的顏色是透過 class name 綁定，符合預期。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

(此區塊所有相關項目已被澄清)