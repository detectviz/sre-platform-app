# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 身份驗證設定
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/settings/platform/AuthSettingsPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要配置身份驗證設定,包含 SSO、密碼策略、登入限制等,確保系統安全。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員配置 SSO,**When** 填寫 SAML 或 OAuth 設定並測試,**Then** 系統應驗證並儲存
2. **Given** 管理員設定密碼策略,**When** 調整複雜度要求,**Then** 系統應立即生效並通知使用者
3. **Given** 管理員啟用 MFA,**When** 儲存設定,**Then** 系統應要求所有使用者下次登入時設定 MFA

### 邊界案例(Edge Cases)
- 當 SSO 配置錯誤導致無法登入時,應保留本機管理員帳號作為後門
- 當密碼策略過於嚴格導致使用者無法設定時,應提示並建議調整
- 當 MFA 設備遺失時,應提供恢復流程

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援 SSO 配置(SAML 2.0, OAuth 2.0, OIDC)。
- **FR-002**: 系統必須(MUST)支援密碼策略設定(長度、複雜度、過期時間)。
- **FR-003**: 系統應該(SHOULD)支援多因素驗證(MFA),含 TOTP、SMS。
- **FR-004**: 系統應該(SHOULD)支援登入限制,含 IP 白名單、失敗次數鎖定。
- **FR-005**: 系統可以(MAY)整合企業目錄服務(LDAP, AD),同步使用者資訊。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| AuthConfig | 身份驗證配置 | 系統級設定 |
| SSOProvider | SSO 提供商配置 | 屬於 AuthConfig |
| PasswordPolicy | 密碼策略 | 屬於 AuthConfig |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄所有設定變更事件 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 追蹤設定變更頻率,無即時指標 |
| RBAC 權限與審計 | ✅ | 僅管理員可修改平台設定 |
| i18n 文案 | ✅ | 設定項目標籤與說明支援多語言 |
| Theme Token 使用 | ✅ | 表單與狀態標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、SSO 登入流程 UI 設計

### 6.1 前端 UI/UX 設計 (已確認)

#### 統一登入頁設計 (採用方案)

**登入頁面佈局**:
```
┌─────────────────────────────────────┐
│                                     │
│         [SRE Platform Logo]         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🔐 使用 SSO 登入              │ │
│  └───────────────────────────────┘ │
│                                     │
│         ───── 或 ─────              │
│                                     │
│  [▼ 使用本地帳號登入]               │
│     (點擊展開表單)                  │
│                                     │
└─────────────────────────────────────┘
```

**主要登入按鈕 (SSO)**:
- 大按鈕: 「使用 SSO 登入」或「使用企業帳號登入」
- 圖示: 鎖頭圖示
- 樣式: Primary 按鈕，大尺寸，佔滿寬度
- 位置: 頁面中央上方

**備用本地登入 (展開式)**:
- 使用 Collapse 元件
- 預設收合，顯示「使用本地帳號登入」連結
- 點擊展開後顯示帳號密碼表單
- 表單包含: 帳號輸入、密碼輸入、登入按鈕

#### SSO 流程狀態提示

**跳轉提示 Loading Modal**:
```
┌─────────────────────────────────────┐
│        [Loading Spinner]            │
│                                     │
│    正在跳轉至企業登入頁...           │
│                                     │
│    若未自動跳轉，請點擊 [這裡]       │
└─────────────────────────────────────┘
```

**回調處理中頁面**:
```
┌─────────────────────────────────────┐
│        [Loading Spinner]            │
│                                     │
│    登入驗證中，請稍候...             │
└─────────────────────────────────────┘
```

**SSO 失敗降級 UI**:
```
┌─────────────────────────────────────┐
│  ❌ SSO 登入失敗                     │
│                                     │
│  錯誤訊息: {error_message}          │
│  (如: SSO 服務暫時無法使用)          │
│                                     │
│  [重試 SSO]  [使用本地帳號]         │
└─────────────────────────────────────┘
```

**降級處理流程**:
1. SSO API 無回應或逾時
2. 顯示錯誤 Alert (紅色)
3. 提供「重試」按鈕 (再次嘗試 SSO)
4. 提供「使用本地帳號」按鈕 (切換到本地登入表單)
5. 確保至少有一種登入方式可用

#### 降級策略

**前端降級邏輯**:
```typescript
try {
  // 嘗試 SSO 登入
  const ssoUrl = await api.get('/auth/sso/redirect-url');
  window.location.href = ssoUrl;
} catch (error) {
  // SSO 失敗，顯示降級選項
  showAlert({
    type: 'error',
    message: 'SSO 服務暫時無法使用',
    description: error.message,
    actions: [
      { label: '重試', onClick: retrySSOLogin },
      { label: '使用本地帳號', onClick: switchToLocalLogin }
    ]
  });
}
```

**保護機制**:
- 確保本地管理員帳號始終可用 (後門)
- SSO 配置錯誤時，系統自動降級為本地登入
- 前端顯示「SSO 服務異常，已切換至本地登入」提示

**前端決策**: 登入頁佈局、SSO/本地切換方式、Loading 提示、降級 UI
**後端參數**: SSO 協定 (SAML/OAuth/OIDC)、重導向 URL、錯誤訊息

### 6.2 前後端分工

| 職責 | 前端 | 後端 |
|------|------|------|
| **登入頁 UI** | ✅ 頁面佈局、SSO 按鈕、本地表單 | - |
| **SSO 跳轉** | ✅ 處理重導向、Loading 提示 | 📥 提供 SSO 重導向 URL |
| **降級處理** | ✅ 錯誤 Alert、切換本地登入 | 📥 提供錯誤訊息與降級建議 |
| **SSO 協定** | 📥 處理回調參數 (code, state) | ✅ 實作 SAML/OAuth/OIDC 協定 |
| **本地登入** | ✅ 表單驗證與提交 | ✅ 驗證帳號密碼 |

---

## 七、模糊與待確認事項(Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: SSO 配置錯誤時的降級與恢復機制]~~ → **已解決: 前端降級 UI 已確認，後端提供降級建議與錯誤訊息**
- [NEEDS CLARIFICATION: MFA 恢復流程的安全驗證方式] → 由後端定義恢復流程 (如郵件驗證碼、備用碼)，前端顯示驗證表單

---

## 八、決策記錄

### DR-001: SSO 登入流程 UI 設計

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 4.3 節

**決策內容**:
- 採用統一登入頁，SSO 為主、本地為輔
- SSO 使用大按鈕，本地登入使用展開式 Collapse
- 提供 Loading 提示與降級處理 UI
- 確保本地登入始終可用作為後門

**前後端分工**:
- 前端: 登入頁 UI、SSO 重導向處理、降級 Alert、Loading 提示
- 後端: SSO 協定實作、重導向 URL、降級策略、本地驗證
