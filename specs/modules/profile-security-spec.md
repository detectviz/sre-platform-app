# 功能規格書（Feature Specification）

**模組名稱 (Module)**: profile-security
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/profile/SecuritySettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名注重帳號安全的使用者，我希望能定期變更我的登入密碼以降低風險。我還需要能夠查看我最近的登入歷史，以確認是否有非我本人操作的可疑活動。如果我懷疑帳號在其他地方被盜用，我希望能立即將所有其他裝置上的登入會話全部登出。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想變更我的密碼。
    **When** 我在「安全設定」頁面輸入了正確的舊密碼，以及一個符合強度要求的新密碼和確認密碼，然後點擊「更新密碼」。
    **Then** 系統應提示我密碼更新成功，並且我可以用新密碼重新登入。

2.  **Given** 我在輸入新密碼時，確認密碼與新密碼不符。
    **When** 我將焦點移出確認密碼欄位。
    **Then** 該欄位下方應出現一條錯誤提示，告知「新密碼與確認密碼不符」。

3.  **Given** 我懷疑我的帳號可能在別處被登入。
    **When** 我點擊「登出其他裝置」按鈕。
    **Then** 系統應提示我操作成功，並使我所有其他裝置上的登入會話立即失效。

4.  **Given** 我想檢查最近是否有異常的登入嘗試。
    **When** 我查看「最近登入活動」列表。
    **Then** 我應該能看到每一次登入的時間、IP 位址、裝置類型和登入結果（成功/失敗）。

### 邊界案例（Edge Cases）
- 如果使用者輸入的舊密碼不正確，後端應返回錯誤，前端需顯示對應的提示。
- 如果使用者輸入的新密碼強度不足，提交時應被阻止。
- 在更新密碼或撤銷會話期間，對應的按鈕應顯示為載入中狀態並被禁用。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個表單，允許使用者在提供當前密碼的前提下變更其登入密碼。
- **FR-002**：系統必須（MUST）提供一個視覺化的「密碼強度計」，根據新密碼的複雜度（長度、字元類型組合）即時回饋其強度。
- **FR-003**：系統必須（MUST）提供一個「登出其他裝置」的功能，用於立即撤銷使用者所有其他的有效登入會話。
- **FR-004**：系統必須（MUST）在一個可分頁的表格中，展示使用者最近的登入歷史紀錄。
- **FR-005**：登入歷史紀錄必須（MUST）包含時間戳、IP 位址、裝置資訊和登入狀態（成功/失敗）。
- **FR-006**：[NEEDS CLARIFICATION: 密碼強度規則的具體定義是什麼？除了長度和字元類型，是否會檢查密碼是否在常見洩漏密碼列表中？]
- **FR-007**：[NEEDS CLARIFICATION: 「登出其他裝置」功能是否會影響當前的操作會話？規格應明確其範圍。]

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **User** | 當前登入的使用者（隱含實體）。 | - |
| **LoginHistoryRecord** | 一筆獨立的登入活動紀錄。 | User |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ⚠️ | [NEEDS CLARIFICATION: **所有**在此頁面上的操作（變更密碼、撤銷會話）都是高度敏感的安全事件，必須被記錄到審計日誌中。] |
| 指標與告警 (Metrics & Alerts) | ❌ | [NEEDS CLARIFICATION: 未見前端性能指標採集。] |
| RBAC 權限與審計 | ✅ | 此頁面僅用於修改使用者自身的安全設定，存取控制邏輯簡單清晰。 |
| i18n 文案 | ✅ | 此頁面廣泛使用了 `useContentSection` hook，是 i18n 實踐的良好範例。 |
| Theme Token 使用 | ✅ | 此頁面使用了 `useDesignSystemClasses` hook 來抽象化樣式，是設計系統實踐的良好範例。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 六、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Auditing for Security Events]** 需要確認所有安全相關操作（特別是密碼變更和會話撤銷）都觸發了詳細的、高優先級的審計日誌。
- **[NEEDS CLARIFICATION: Password Strength Policy]** 需要詳細定義密碼策略，包括最小長度、複雜度要求，以及是否進行常見密碼檢查。
- **[NEEDS CLARIFICATION: Session Revocation Scope]** 需要明確「登出其他裝置」是否會保持當前會話的有效性。
- **[NEEDS CLARIFICATION: Device Detection Logic]** 「裝置」資訊的來源是什麼？是基於 User-Agent 字串的簡單解析嗎？其準確性如何？