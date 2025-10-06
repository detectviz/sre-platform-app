# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 安全設定
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/profile/SecuritySettingsPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
使用者需要管理安全設定,包含密碼修改、MFA 設定、登入裝置管理等,保護帳號安全。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者修改密碼,**When** 輸入舊密碼與新密碼並儲存,**Then** 系統應驗證並更新,強制重新登入
2. **Given** 使用者啟用 MFA,**When** 掃描 QR Code 並輸入驗證碼,**Then** 系統應綁定並要求後續登入驗證
3. **Given** 使用者查看登入裝置,**When** 檢視列表,**Then** 應顯示所有活躍會話,可遠端登出

### 邊界案例(Edge Cases)
- 當新密碼不符合策略時,應標記錯誤並提示要求
- 當 MFA 裝置遺失時,應提供恢復碼驗證流程
- 當遠端登出其他裝置時,應即時撤銷 Token

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援密碼修改,驗證舊密碼並符合策略。
- **FR-002**: 系統必須(MUST)支援 MFA 啟用/停用,含 TOTP 與恢復碼。
- **FR-003**: 系統應該(SHOULD)顯示活躍登入會話,含裝置、IP、時間,可遠端登出。
- **FR-004**: 系統應該(SHOULD)記錄所有安全變更事件,含密碼修改、MFA 變更。
- **FR-005**: 系統可以(MAY)提供登入歷史查詢,追蹤異常登入行為。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| UserSecurity | 使用者安全設定 | 屬於 User |
| MFAConfig | MFA 配置,含 Secret 與恢復碼 | 屬於 UserSecurity |
| LoginSession | 登入會話 | 關聯 User |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄設定變更事件 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 追蹤設定變更頻率,無即時指標 |
| RBAC 權限與審計 | ✅ | 使用者僅可修改自己的設定 |
| i18n 文案 | ✅ | 所有設定項目支援多語言 |
| Theme Token 使用 | ✅ | 表單與狀態使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: MFA 恢復碼的生成與管理機制]
- [NEEDS CLARIFICATION: 遠端登出的 Token 撤銷實作方式]
