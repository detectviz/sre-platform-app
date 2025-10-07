# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 資料源管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/resources/DatasourceManagementPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要配置與管理資料源連線,包括 Prometheus、Grafana、日誌系統等,確保資料正確採集。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員新增資料源,**When** 填寫連線資訊並測試,**Then** 系統應驗證連線並儲存設定
2. **Given** 資料源連線失敗,**When** 系統偵測到錯誤,**Then** 應標記狀態為異常並發送告警
3. **Given** 管理員編輯資料源,**When** 修改 URL 或認證資訊,**Then** 系統應重新測試連線

### 邊界案例(Edge Cases)
- 當資料源需要複雜認證(OAuth, mTLS)時,應提供進階設定選項
- 當資料源暫時不可用時,應支援重試機制與降級策略
- 當刪除資料源時,應檢查是否有依賴並提示影響範圍

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援新增、編輯、刪除資料源設定。
- **FR-002**: 系統必須(MUST)提供連線測試功能,驗證資料源可用性。
- **FR-003**: 系統應該(SHOULD)支援多種資料源類型(Prometheus, Grafana, Loki, Elasticsearch)。
- **FR-004**: 系統必須(MUST)加密儲存資料源認證資訊(密碼、Token)。
- **FR-005**: 系統應該(SHOULD)定期檢查資料源健康狀態,異常時發送告警。
- **FR-006**: 系統可以(MAY)支援資料源版本相容性檢查與升級提示。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Datasource | 資料源配置,包含連線資訊與認證 | 提供資料給 Dashboard, Alert |
| DatasourceCredential | 資料源認證資訊(加密儲存) | 屬於 Datasource |
| HealthCheck | 資料源健康檢查記錄 | 關聯 Datasource |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄資源 CRUD 操作、狀態變更事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤資源數量、狀態分布、效能指標 |
| RBAC 權限與審計 | ✅ | 依團隊與角色控制資源存取權限 |
| i18n 文案 | ✅ | 所有文案透過 Content Context 存取 |
| Theme Token 使用 | ✅ | 狀態標籤、圖表使用 Theme Token |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、敏感資料前端遮罩顯示

### 6.1 前端 UI/UX 設計 (已確認)

#### 敏感欄位遮罩策略

根據敏感資料類型，提供不同的前端遮罩與互動方式：

| 欄位類型 | 顯示方式 | 互動行為 |
|----------|----------|----------|
| **password** | `••••••••` (8 個點) | 點擊眼睛圖示顯示/隱藏 |
| **api_token** | `sk_test_****abc123` (前後各 4 碼) | 點擊複製完整 Token |
| **private_key** | `-----BEGIN...****END-----` | 點擊「查看」開啟 Modal |
| **connection_string** | `mysql://user:***@host:3306/db` | 密碼部分遮罩 |

#### Password Input 元件

**密碼輸入框**:
```
Password: [••••••••] 👁️
          (點擊眼睛圖示顯示/隱藏)
```

**元件屬性**:
- 使用 Ant Design Input.Password
- 預設遮罩，點擊眼睛圖示切換顯示
- 圖示: 眼睛 (eye) / 眼睛斜線 (eye-off)

**實作範例**:
```tsx
<Input.Password
  value={password}
  iconRender={(visible) =>
    visible ? <EyeOffIcon /> : <EyeIcon />
  }
  placeholder="輸入密碼"
/>
```

#### Token 遮罩顯示

**顯示格式**:
```
API Token: sk_test_****abc123  [📋 複製]
           (前 8 碼 + **** + 後 6 碼)
```

**複製功能**:
- 顯示部分 Token (前後各保留數碼，中間遮罩)
- 提供「複製」按鈕 (圖示)
- 點擊後複製完整 Token 至剪貼簿
- 顯示 Toast: 「已複製至剪貼簿」

**實作範例**:
```tsx
<div className="flex items-center gap-2">
  <code className="text-xs">
    {maskToken(token)} {/* sk_test_****abc123 */}
  </code>
  <Tooltip title="複製完整 Token">
    <Button
      type="text"
      icon={<CopyIcon />}
      onClick={() => {
        navigator.clipboard.writeText(fullToken);
        showToast('已複製至剪貼簿', 'success');
      }}
    />
  </Tooltip>
</div>

// Mask 函式
function maskToken(token: string): string {
  if (token.length <= 14) return '****';
  const prefix = token.slice(0, 8);
  const suffix = token.slice(-6);
  return `${prefix}****${suffix}`;
}
```

#### Private Key Modal

**查看按鈕**:
```
Private Key: -----BEGIN...****END-----  [👁️ 查看]
```

**查看 Modal**:
```
┌─────────────────────────────────────┐
│ Private Key                    [✕]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ -----BEGIN RSA PRIVATE KEY----- │ │
│ │ MIIEpAIBAAKCAQEA...             │ │
│ │ (完整 Private Key 內容)          │ │
│ │ -----END RSA PRIVATE KEY-----   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│           [📋 複製]  [關閉]          │
└─────────────────────────────────────┘
```

**Modal 屬性**:
- 標題: "Private Key"
- 內容: 顯示完整 Private Key (使用 `<pre>` 標籤保持格式)
- 背景: 深色背景 (bg-slate-900)
- 操作: 複製按鈕 + 關閉按鈕

**實作範例**:
```tsx
<Button
  icon={<EyeIcon />}
  onClick={() => setShowKeyModal(true)}
>
  查看 Private Key
</Button>

<Modal
  title="Private Key"
  open={showKeyModal}
  onCancel={() => setShowKeyModal(false)}
  footer={[
    <Button
      key="copy"
      icon={<CopyIcon />}
      onClick={() => {
        navigator.clipboard.writeText(privateKey);
        showToast('已複製', 'success');
      }}
    >
      複製
    </Button>,
    <Button
      key="close"
      onClick={() => setShowKeyModal(false)}
    >
      關閉
    </Button>
  ]}
>
  <pre className="bg-slate-900 text-white p-4 rounded overflow-x-auto">
    <code>{privateKey}</code>
  </pre>
</Modal>
```

#### 安全注意事項

**前端安全原則**:
- ⚠️ 前端遮罩僅為視覺效果，不代表加密
- ⚠️ 完整值由 API 回傳後儲存於元件 state，離開頁面時清除
- ⚠️ 不可在 localStorage 或 sessionStorage 儲存敏感資料
- ⚠️ 使用 HTTPS 傳輸敏感資料

**前端決策**: 遮罩格式、互動方式 (眼睛圖示/複製/Modal)、視覺樣式
**後端參數**: 加密演算法、金鑰管理、完整敏感資料值

### 6.2 前後端分工

| 職責 | 前端 | 後端 |
|------|------|------|
| **遮罩顯示** | ✅ 密碼遮罩、Token 部分顯示、Modal UI | - |
| **完整資料** | 📥 API 提供完整敏感資料 (需權限) | ✅ 加密儲存、權限控制 |
| **加密演算法** | - | ✅ 選擇加密演算法 (如 AES-256) |
| **金鑰管理** | - | ✅ 金鑰儲存與輪換機制 |
| **權限檢查** | 📥 依 API 回應顯示/隱藏查看按鈕 | ✅ 檢查使用者權限 |

---

## 七、模糊與待確認事項(Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 資料源認證資訊的加密演算法與金鑰管理]~~ → **已解決: 前端遮罩 UI 已確認，加密與金鑰管理由後端決定**
- [NEEDS CLARIFICATION: 資料源健康檢查的頻率與逾時設定] → 由後端提供健康檢查配置 (checkInterval, timeout)

---

## 八、決策記錄

### DR-001: 敏感資料前端遮罩顯示

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 4.2 節

**決策內容**:
- Password 使用 Input.Password 元件，點擊眼睛圖示顯示/隱藏
- Token 顯示部分內容 (前後各保留數碼)，提供複製功能
- Private Key 使用 Modal 查看完整內容
- Connection String 密碼部分遮罩

**前後端分工**:
- 前端: 遮罩 UI、互動行為 (眼睛圖示/複製/Modal)、安全清除
- 後端: 加密儲存、金鑰管理、權限控制、完整資料提供
