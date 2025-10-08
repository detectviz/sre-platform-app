# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-grafana
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要將我們的 SRE 平台與現有的 Grafana 執行個體進行整合。我希望能設定 Grafana 的連線位址和 API Key，並能驗證這些設定是否正確，以確保平台可以無縫地從 Grafana 同步儀表板、資料來源和告警規則。

#### 具體情境:
- **初次整合**: 在平台部署初期，我需要輸入公司現有 Grafana 實例的 URL 與 API Key，建立連線以便後續同步儀表板與告警規則。
- **連線驗證與資源盤點**: 設定完成後，我需要立即測試連線是否成功，並查看 Grafana 實例的資源概況（如有多少個儀表板、資料來源、告警規則），評估同步範圍與資源需求。
- **版本與相容性確認**: 在整合過程中，我需要知道目標 Grafana 的版本資訊與組織設定，以確保功能相容性（例如某些 API 僅在特定版本後支援）。
- **權限範圍驗證**: 透過連線測試返回的資源數量資訊（如能否讀取儀表板、告警規則），我可以驗證 API Key 的權限範圍是否符合整合需求。
- **憑證更新**: 當 Grafana API Key 過期或需要輪換時，我需要更新金鑰並重新測試連線，同時確認更新後的 Key 仍能存取相同範圍的資源。
- **問題排查**: 當同步失敗時，我需要查看最後一次連線測試的結果（包含版本、資源數量、錯誤訊息），快速定位問題（如網路、權限或配置錯誤）。
- **容量規劃**: 透過測試結果顯示的儀表板與告警規則數量，我可以評估同步作業的資料量，規劃適當的同步頻率與資源配置。

#### 現有痛點:
- 若無即時測試功能，設定錯誤只能在實際使用時才發現，增加故障排除時間。
- API Key 若以明文顯示，增加憑證外洩風險，違反安全規範。
- 缺乏版本資訊顯示時，可能誤用不支援的 Grafana 功能，導致整合失敗。

### 驗收情境（Acceptance Scenarios）

#### 場景群組 A：設定管理（Settings Management）
1. **Given** 我是首次設定 Grafana 整合
   **When** 我開啟「Grafana 整合設定」頁面
   **Then** 系統應顯示一個資訊橫幅，說明此設定的用途與重要性
   **And Then** 表單欄位應為空白或顯示預設值

2. **Given** 我已完成 Grafana URL 和 API Key 的輸入
   **When** 我點擊「儲存變更」按鈕
   **Then** 系統應保存我的設定
   **And Then** 應顯示成功提示訊息（如「Grafana 設定已儲存」）

3. **Given** 我已儲存過 Grafana 設定
   **When** 我重新開啟此頁面
   **Then** 系統應顯示之前儲存的設定值
   **And Then** API Key 應預設以遮蔽形式顯示

#### 場景群組 B：連線測試（Connection Testing）
4. **Given** 我已輸入 Grafana URL 和 API Key
   **When** 我點擊「測試連線」按鈕
   **Then** 系統應發送測試請求到指定的 Grafana 實例
   **And Then** 測試結果區域應顯示載入中狀態

5. **Given** 連線測試成功
   **When** 系統收到成功回應
   **Then** 測試結果區域應顯示「連線正常」狀態（如綠色勾選圖示）
   **And Then** 應顯示以下資訊：
   - Grafana 版本（如「Grafana v10.2.3」）
   - 儀表板數量（如「123 個儀表板」）
   - 資料來源數量（如「8 個資料來源」）
   - 告警規則數量（如「45 個告警規則」）
   - 組織資訊（如「組織：Default Org」）

6. **Given** 連線測試失敗（如 API Key 錯誤、網路不通、URL 無效）
   **When** 系統收到錯誤回應
   **Then** 測試結果區域應顯示「連線失敗」狀態（如紅色錯誤圖示）
   **And Then** 應顯示後端返回的具體錯誤訊息（如「401 Unauthorized: Invalid API Key」）

7. **Given** 我修改了已儲存的設定但尚未儲存
   **When** 我點擊「測試連線」按鈕
   **Then** 系統應使用當前輸入的值（而非已儲存的值）進行測試
   **And Then** 測試結果應即時反映當前設定的有效性

#### 場景群組 C：輸入驗證與錯誤處理（Input Validation & Error Handling）
8. **Given** 我輸入了格式不正確的 URL（如缺少 `http://` 或 `https://` 前綴）
   **When** 我嘗試儲存或測試連線
   **Then** 系統應在 URL 輸入框下方顯示錯誤訊息（如「請輸入有效的 URL，需包含 http:// 或 https://」）
   **And Then** 儲存與測試按鈕應被禁用或操作應被阻止

9. **Given** 我將 API Key 欄位留空
   **When** 我嘗試儲存設定
   **Then** 系統應在 API Key 輸入框下方顯示錯誤訊息（如「API Key 為必填欄位」）
   **And Then** 不應提交表單

10. **Given** 我已修改設定但尚未儲存
    **When** 我點擊「還原為已儲存設定」按鈕
    **Then** 系統應撤銷所有未儲存的變更
    **And Then** 表單應恢復為最後一次儲存的狀態

#### 場景群組 D：安全性與敏感資訊保護（Security & Sensitive Data Protection）
11. **Given** API Key 欄位包含敏感資訊
    **When** 我查看 API Key 欄位
    **Then** API Key 應預設以遮蔽形式顯示（如 `••••••••••••`）
    **And Then** 應提供「顯示」按鈕（眼睛圖示）供臨時查看

12. **Given** 我需要查看完整的 API Key
    **When** 我點擊「顯示」按鈕
    **Then** API Key 應切換為明文顯示
    **And Then** 按鈕圖示應變更為「隱藏」狀態，允許我隨時切換回遮蔽狀態

### 邊界案例（Edge Cases）
- 當 API Key 不正確導致連線測試失敗時，系統應顯示由後端返回的具體錯誤訊息。
- 當使用者修改了設定但尚未儲存時，點擊「還原為已儲存設定」按鈕應能撤銷所有未儲存的變更。
- 在儲存或測試期間，對應的按鈕應顯示載入中狀態。

---

## 二、功能需求（Functional Requirements）

### 2.1. 設定管理（Settings Management）
| 編號 | 說明 |
|------|------|
| **FR-SETTINGS-001** | 系統必須（MUST）提供一個表單介面，允許管理員設定和編輯與 Grafana 的整合參數（URL、API Key）。 |
| **FR-SETTINGS-002** | 系統必須（MUST）對輸入的 URL 進行客戶端基本驗證（如是否包含 `http://` 或 `https://` 前綴）。 |
| **FR-SETTINGS-003** | 系統必須（MUST）支援儲存設定功能，並在儲存成功後顯示提示訊息。 |
| **FR-SETTINGS-004** | 系統必須（MUST）支援「還原為已儲存設定」功能，撤銷所有未儲存的變更。 |
| **FR-SETTINGS-005 (AS-IS)** | 頁面包含一個靜態的資訊橫幅和安全建議區塊，向使用者說明此設定的重要性。 |

### 2.2. 連線測試（Connection Testing）
| 編號 | 說明 |
|------|------|
| **FR-TEST-001** | 系統必須（MUST）提供一個「測試連線」功能，用於即時驗證當前輸入的設定。 |
| **FR-TEST-002** | 系統必須（MUST）在連線測試成功時，在 UI 上清晰地展示以下資訊：<br/>- Grafana 版本號<br/>- 儀表板數量<br/>- 資料來源數量<br/>- 告警規則數量<br/>- 組織資訊 |
| **FR-TEST-003** | 系統必須（MUST）在連線測試失敗時，顯示由後端返回的具體錯誤訊息（如 401 Unauthorized、網路超時等）。 |
| **FR-TEST-004** | 系統必須（MUST）在測試過程中顯示載入中狀態，並禁用測試按鈕防止重複提交。 |
| **FR-TEST-005** | 系統必須（MUST）使用當前輸入的值（而非已儲存的值）進行連線測試。 |

### 2.3. 敏感資訊保護（Sensitive Data Protection）
| 編號 | 說明 |
|------|------|
| **FR-SEC-001** | 系統必須（MUST）為敏感的 API Key 欄位提供遮蔽功能，預設以 `••••••••••••` 形式顯示。 |
| **FR-SEC-002** | 系統必須（MUST）提供「顯示」按鈕，允許使用者臨時查看完整的 API Key，並可隨時切換回遮蔽狀態。 |
| **FR-SEC-003** | 系統必須（MUST）在後端使用加密方式（如 AES-256）安全地儲存 API Key。 |
| **FR-SEC-004** | 系統必須（MUST）在 API 回應中透過 HTTPS 加密傳輸 API Key。 |

### 2.4. 文檔與權限（Documentation & Permissions）
| 編號 | 說明 |
|------|------|
| **FR-DOC-001** | 系統文件必須（MUST）明確說明整合所需的 Grafana API Key 的最小權限範圍（如 `dashboards:read`, `datasources:read`, `alerts:read`, `org:read`）。 |
| **FR-PERM-001** | 系統應該（SHOULD）根據使用者的權限，動態顯示或禁用對應的操作介面（如編輯、測試連線功能）。 |

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **GrafanaSettings** | 核心資料實體，包含了與 Grafana 執行個體進行整合所需的所有設定（URL、API Key、啟用狀態等）。 | - |
| **GrafanaTestResponse** | 執行連線測試後，API 回傳的結果，包含成功狀態、訊息、版本資訊、資源統計等。包含以下欄位：<br/>- `success` (boolean): 連線是否成功<br/>- `message` (string): 狀態訊息或錯誤訊息<br/>- `version` (string): Grafana 版本號<br/>- `dashboardCount` (number): 儀表板數量<br/>- `datasourceCount` (number): 資料來源數量<br/>- `alertRuleCount` (number): 告警規則數量<br/>- `organizationName` (string): 組織名稱<br/>- `responseTime` (number): 回應時間（毫秒） | GrafanaSettings |
| **GrafanaResourceSummary** | Grafana 資源概況統計，包含儀表板、資料來源、告警規則的詳細資訊（如分類統計、最近更新時間等）。 | GrafanaSettings |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:grafana:read` | 允許使用者查看 Grafana 設定。 |
| `settings:grafana:update` | 允許使用者修改並儲存 Grafana 設定。 |
| `settings:grafana:test` | 允許使用者測試 Grafana 連線。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `GrafanaSettingsPage` 的根元件需由 `<RequirePermission permission="settings:grafana:read">` 包裹。
- **表單欄位**: 整個表單的編輯功能需具備 `settings:grafana:update` 權限，否則應為唯讀狀態。
- **操作按鈕**:
  - 「儲存變更」按鈕需具備 `settings:grafana:update` 權限。
  - 「測試連線」按鈕需具備 `settings:grafana:test` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

**標記說明**：
- ✅ 已完整實現
- 🟡 部分實現或待完善
- ⚙️ 未來版本實現（FUTURE）

| 項目 | 狀態 | 說明 |
|------|------|------|
| **記錄與追蹤 (Logging/Tracing)** | 🟡 | 需實現結構化日誌記錄（如設定變更、連線測試、測試結果）與分散式追蹤整合。 |
| **指標與告警 (Metrics & Alerts)** | 🟡 | 需實現業務指標收集（如設定變更次數、連線測試頻率、測試成功率）與異常告警機制。 |
| **RBAC 權限與審計** | ⚙️ | 需實現基於 `settings:grafana:read`, `settings:grafana:update`, `settings:grafana:test` 的權限控制與審計日誌。 |
| **i18n 文案** | 🟡 | 需完全遷移至 i18n 內容管理系統（如 `platform.grafana.button.testConnection`, `platform.grafana.message.connectionSuccess`），消除硬編碼文字。 |
| **Theme Token 使用** | 🟡 | 需使用中央設計系統的 Theme Token（如 `--color-success`, `--color-error`, `--color-info-background`），替代直接色票引用。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注待確認項）

---

## 七、模糊與待確認事項（Clarifications）

### 7.1. 已確認的設計決策
- **連線測試機制**: 系統提供即時連線測試功能，使用當前輸入的設定值（而非已儲存的值）進行測試，確保設定變更前即可驗證有效性。
- **資源統計資訊**: 連線測試成功後，系統應顯示 Grafana 實例的詳細資訊，包括：
  - Grafana 版本號（用於確認功能相容性）
  - 儀表板數量（評估同步範圍）
  - 資料來源數量（評估整合複雜度）
  - 告警規則數量（評估監控覆蓋範圍）
  - 組織名稱（確認連線目標正確）
  - 回應時間（評估網路連線品質）
- **權限範圍驗證**: 透過連線測試返回的資源數量，可間接驗證 API Key 的權限範圍是否符合整合需求（如無法讀取告警規則時，alertRuleCount 可能返回 0 或 null）。
- **API Key 遮蔽顯示**: API Key 預設以遮蔽形式顯示，提供「顯示」按鈕供臨時查看，避免敏感資訊直接暴露。

### 7.2. 待後續版本實現的功能 (FUTURE)
- **[FUTURE] i18n 完全遷移**: 需完全遷移至 i18n 內容管理系統（鍵值如 `platform.grafana.field.url`, `platform.grafana.message.testSuccess`），消除所有硬編碼文字。
- **[FUTURE] Theme Token 重構**: 需使用中央設計系統的 Theme Token（如 `--color-info-background`, `--color-success-text`），替代原子化 CSS class 直接引用。
- **[FUTURE] API Key 最小權限文檔**: 在系統文件或頁面幫助區塊中明確說明整合所需的 Grafana API Key 的最小權限範圍（如 `dashboards:read`, `datasources:read`, `org:read` 等）。
- **[FUTURE] API Key 加密儲存**: 後端應使用加密方式（如 AES-256）安全地儲存 API Key，避免在資料庫中以明文形式存放。
- **[FUTURE] 資源詳細資訊展開**: 除基本的數量統計外，可提供資源詳細清單（如前 10 個最常用的儀表板、資料來源類型分佈、告警規則分類統計等）。
- **[FUTURE] 整合狀態監控**: 提供 Grafana 整合的健康狀態監控儀表板，持續追蹤連線狀態、同步成功率、API 調用延遲等指標。
- **[FUTURE] 多 Grafana 實例支援**: 支援配置多個 Grafana 實例，並允許使用者選擇主要實例或針對不同團隊使用不同實例。