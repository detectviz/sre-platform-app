# 功能規格書（Feature Specification）

**模組名稱 (Module)**: profile-preference
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/profile/PreferenceSettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台使用者，我希望能根據自己的工作習慣和偏好來客製化平台的外觀和行為。我希望能調整介面的顏色主題以適應不同的工作環境、設定我熟悉的語言和時區，並將我最關心的儀表板設為我的預設首頁，以便我一登入就能看到最重要的資訊。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我偏好在夜間工作，覺得預設的亮色主題很刺眼。
    **When** 我在「偏好設定」頁面將「介面主題」更改為「深色」，並點擊「儲存設定」。
    **Then** 整個平台的使用者介面應立即或在下次刷新後切換為深色主題。

2.  **Given** 我最常查看的是「服務 A 健康度」儀表板。
    **When** 我在「預設首頁」的下拉選單中選擇「服務 A 健康度」，並儲存設定。
    **Then** 下次我登入或訪問平台根路徑時，應直接被導向到該儀表板。

3.  **Given** 我不小心修改了一些設定，但想恢復到系統的初始狀態。
    **When** 我點擊「重置為預設」按鈕。
    **Then** 頁面上的所有選項應恢復為系統管理員設定的預設值。

### 邊界案例（Edge Cases）
- 如果使用者沒有任何可用的儀表板（例如，新帳號且未被授予任何權限），「預設首頁」的下拉選單應被禁用，並顯示提示訊息。
- 「儲存設定」按鈕在使用者沒有做出任何修改時應處於禁用狀態。
- 更改語言設定後，應提示使用者需要重新整理頁面才能完全套用。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個介面，允許使用者設定其個人化的偏好。
- **FR-002**：可設定的偏好必須（MUST）至少包括：介面主題、語言、時區和預設首頁。
- **FR-003**：所有可用的選項（如主題列表、語言列表、時區列表、儀表板列表）必須（MUST）由後端 API 動態提供。
- **FR-004**：系統必須（MUST）提供「儲存變更」的功能，用於將使用者的修改持久化。
- **FR-005**：只有在設定被修改後，「儲存變更」按鈕才應變為可點擊狀態。
- **FR-006**：系統必須（MUST）提供「重置為預設」的功能，允許使用者一鍵恢復到系統預設的偏好設定。
- **FR-007**：系統必須（MUST）提供「匯出偏好設定」的功能，允許使用者將其當前設定下載為一個 JSON 檔案。
- **FR-008**：[NEEDS CLARIFICATION: 「匯出偏好設定」的具體用途是什麼？是用於備份、在不同環境間遷移，還是有其他目的？]

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **UserPreferences** | 核心資料實體，代表一個使用者的完整偏好設定集合。 | Dashboard |
| **PreferenceOptions**| 由後端提供的、用於填充各個下拉選單的可用選項列表。 | - |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ⚠️ | [NEEDS CLARIFICATION: 使用者修改其偏好設定的行為是否需要被審計？] |
| 指標與告警 (Metrics & Alerts) | ❌ | [NEEDS CLARIFICATION: 未見前端性能指標採集。] |
| RBAC 權限與審計 | ✅ | 此頁面僅用於修改使用者自身的設定，不涉及對其他使用者或系統的變更，權限模型簡單清晰。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 `THEME_HINTS` 和 `LANGUAGE_HINTS` 物件，以及各種 Toast 提示訊息。 |
| Theme Token 使用 | ✅ | 程式碼符合設計系統規範。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 六、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Export/Import Flow]** 需要明確定義「匯出偏好設定」以及潛在的「匯入」功能的完整使用者流程和業務目的。
- **[NEEDS CLARIFICATION: Auditing Preferences]** 需要確認是否需要審計使用者對個人偏好設定的修改歷史。
- **[NEEDS CLARIFICATION: Default Settings Management]** 系統管理員在哪裡管理提供給使用者的「預設」偏好設定？需要一個對應的管理介面。