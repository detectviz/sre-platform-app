# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-grafana
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/GrafanaSettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要將我們的 SRE 平台與現有的 Grafana 執行個體進行整合。我希望能設定 Grafana 的連線位址和 API Key，並能驗證這些設定是否正確，以確保平台可以無縫地從 Grafana 同步儀表板、資料來源和告警規則。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我是首次設定 Grafana 整合。
    **When** 我在「Grafana 整合設定」頁面，輸入我們的 Grafana URL、一個具備管理員權限的 API Key 和 Org ID，然後點擊「測試連線」。
    **Then** 系統應顯示「連線正常」的狀態，並回報偵測到的 Grafana 版本號。

2.  **Given** 我確認連線測試成功。
    **When** 我點擊「儲存變更」按鈕。
    **Then** 系統應保存我的設定，並彈出「Grafana 設定已儲存」的成功提示。

3.  **Given** 我輸入了一個格式不正確的 URL（例如，沒有 `http://` 前綴）。
    **When** 我嘗試儲存或測試連線。
    **Then** 系統應在該輸入框下方顯示一條錯誤訊息，提示我修正 URL 格式，並阻止我繼續操作。

### 邊界案例（Edge Cases）
- 當 API Key 不正確或權限不足導致連線測試失敗時，系統應顯示由後端返回的具體錯誤訊息。
- 當使用者修改了設定但尚未儲存時，點擊「還原為已儲存設定」按鈕應能撤銷所有未儲存的變更。
- 在儲存或測試期間，對應的按鈕應顯示為載入中狀態並被禁用，以防止重複提交。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個表單介面，允許管理員設定和編輯與 Grafana 的整合參數，包括：啟用狀態、URL、API Key 和 Org ID。
- **FR-002**：系統必須（MUST）提供一個「測試連線」功能，用於即時驗證當前輸入的設定是否能成功連接到 Grafana。
- **FR-003**：系統必須（MUST）在 UI 上清晰地展示最近一次連線測試的結果（成功/失敗）、訊息、測試時間和偵測到的 Grafana 版本。
- **FR-004**：系統必須（MUST）對輸入的 URL、API Key 和 Org ID 進行客戶端基本驗證。
- **FR-005**：系統必須（MUST）為敏感的 API Key 欄位提供遮蔽（masking）和臨時顯示（unmasking）的功能。
- **FR-006**: 系統文件**必須**明確說明整合所需的 Grafana API Key 的最小權限範圍（例如，具備 `Admin` 權限的 Service Account）。
- **FR-007**: 系統文件**必須**明確定義啟用此整合後的所有功能，例如：儀表板同步、資料來源同步等。
- **FR-008**: 後端**必須**使用加密方式安全地儲存 API Key。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **GrafanaSettings** | 核心資料實體，包含了與 Grafana 執行個體進行整合所需的所有設定。 | - |
| **GrafanaTestResponse** | 執行連線測試後，API 回傳的結果，包含成功狀態、訊息和偵測到的版本等。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

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

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對 Grafana 設定的修改和測試操作產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "無法載入 Grafana 設定。"、"請輸入 Grafana 伺服器網址。" 等。 |
| Theme Token 使用 | ✅ | 程式碼符合設計系統規範。 |

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