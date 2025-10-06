# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-license
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/LicensePage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或決策者，我需要清楚地了解我當前使用的平台版本（社群版）所包含的功能，以及付費的商業版能提供哪些額外的進階功能。我希望有一個專門的頁面，能讓我直觀地比較不同版本之間的差異，並在需要升級時能方便地找到聯繫方式。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想了解商業版有哪些獨有功能。
    **When** 我訪問「授權管理」頁面。
    **Then** 我應該能看到一個清晰的功能比較表，其中列出了商業版獨有的功能，例如「進階 AI 洞察」、「企業級支援」等。

2.  **Given** 我在評估完功能差異後，決定聯繫銷售團隊以了解商業版的詳細資訊。
    **When** 我點擊頁面底部的「聯繫我們進行升級」按鈕。
    **Then** 我的郵件客戶端應被啟動，並自動填寫好收件人為指定的銷售聯繫信箱。

### 邊界案例（Edge Cases）
- 即使 `useContent` hook 無法載入內容，頁面也應顯示一個載入中或錯誤的狀態，而不是空白頁。
- 頁面上的所有內容都應是唯讀的，不應有任何可供使用者輸入的欄位。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：頁面必須（MUST）清晰地標示出當前運行的平台版本為「社群版」。
- **FR-002**：頁面必須（MUST）以並排卡片或類似形式，摘要展示社群版和商業版的核心功能亮點。
- **FR-003**：頁面必須（MUST）提供一個詳細的功能比較表格，逐項列出各項功能在哪個版本中可用。
- **FR-004**：頁面必須（MUST）提供一個明確的「行動呼籲 (Call to Action)」，例如一個包含 `mailto:` 連結的按鈕，引導使用者聯繫商務團隊。
- **FR-005**：頁面的所有文字內容必須（MUST）來自於 `useContent` hook，以便於市場或產品團隊更新。
- **FR-006**：[NEEDS CLARIFICATION: 此模組目前僅為資訊展示頁。規格需要明確，系統**不包含**一個讓使用者自行輸入或上傳授權金鑰 (License Key) 的功能。所有授權升級均需透過線下聯繫完成。]

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Content (`LICENSE_PAGE`)** | 儲存在內容管理系統中的一個物件，包含了此頁面需要顯示的所有文字和列表。 | - |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ⚠️ | [NEEDS CLARIFICATION: 使用者點擊「聯繫我們」按鈕的行為是否應被追蹤，以評估潛在商機的轉化率？] |
| 指標與告警 (Metrics & Alerts) | ✅ | 此頁面為靜態內容頁，通常無需特定的前端性能指標。 |
| RBAC 權限與審計 | ✅ | 此頁面為公開資訊，通常無需特定的權限控制。 |
| i18n 文案 | ✅ | 此頁面完全依賴 `useContent` hook，是 i18n 實踐的良好範例。 |
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

- **[NEEDS CLARIFICATION: Call-to-Action Tracking]** 需要確認是否需要為「聯繫我們」的點擊事件增加分析追蹤。
- **[NEEDS CLARIFICATION: No Self-Service Upgrade]** 需要在規格中明確記錄，當前版本不提供任何自助式的授權升級或金鑰管理功能。