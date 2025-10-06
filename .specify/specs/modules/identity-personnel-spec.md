# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 人員管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/settings/identity-access/PersonnelManagementPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要管理使用者帳號,包含建立、編輯、停用、重設密碼等操作,確保存取安全。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員建立使用者,**When** 填寫基本資訊與角色,**Then** 系統應驗證並發送啟用邀請
2. **Given** 管理員停用使用者,**When** 確認操作,**Then** 系統應撤銷所有 Token 並禁止登入
3. **Given** 管理員重設密碼,**When** 確認操作,**Then** 系統應發送重設連結並強制下次登入修改

### 邊界案例(Edge Cases)
- 當使用者正在執行關鍵操作時被停用,應保留操作記錄並發送通知
- 當使用者郵箱重複時,應拒絕建立並提示
- 當批次匯入使用者資料格式錯誤時,應標記錯誤列並允許修正後重試

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援建立、編輯、停用、刪除使用者。
- **FR-002**: 系統必須(MUST)支援重設密碼,發送安全連結至使用者郵箱。
- **FR-003**: 系統應該(SHOULD)支援批次匯入使用者,含驗證與錯誤回報。
- **FR-004**: 系統應該(SHOULD)顯示使用者最後登入時間、活躍狀態。
- **FR-005**: 系統可以(MAY)整合 SSO(SAML, OAuth),支援第三方身份提供商。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| User | 使用者帳號,含基本資訊與狀態 | 屬於 Team, 擁有 Role |
| UserCredential | 使用者認證資訊(密碼雜湊、Token) | 屬於 User |
| UserSession | 使用者登入會話 | 關聯 User |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄所有身份變更、權限調整、登入事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤使用者活躍度、權限分布、異常登入 |
| RBAC 權限與審計 | ✅ | 嚴格控制身份管理權限,僅管理員可操作 |
| i18n 文案 | ✅ | 所有 UI 文案支援多語言 |
| Theme Token 使用 | ✅ | 狀態標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: 使用者帳號的自動清理策略(長期未登入)]
- [NEEDS CLARIFICATION: SSO 整合的身份同步機制]
