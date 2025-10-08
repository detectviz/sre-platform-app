# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-grafana
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要將我們的 SRE 平台與現有的 Grafana 執行個體進行整合。我希望能設定 Grafana 的連線位址和 API Key，並能驗證這些設定是否正確，以確保平台可以無縫地從 Grafana 同步儀表板、資料來源和告警規則。

#### 具體情境:
- **初次整合**: 在平台部署初期，我需要輸入公司現有 Grafana 實例的 URL 與 API Key，建立連線以便後續同步儀表板與告警規則。
- **連線驗證**: 設定完成後，我需要立即測試連線是否成功，確認 API Key 權限足夠且網路連通性無問題，避免後續使用時才發現設定錯誤。
- **版本確認**: 在整合過程中，我需要知道目標 Grafana 的版本資訊，以確保功能相容性（例如某些 API 僅在特定版本後支援）。
- **憑證更新**: 當 Grafana API Key 過期或需要輪換時，我需要更新金鑰並重新測試連線，確保平台與 Grafana 間的整合不中斷。
- **問題排查**: 當同步失敗時，我需要查看最後一次連線測試的結果與錯誤訊息，快速定位問題（如網路、權限或配置錯誤）。

#### 現有痛點:
- 若無即時測試功能，設定錯誤只能在實際使用時才發現，增加故障排除時間。
- API Key 若以明文顯示，增加憑證外洩風險，違反安全規範。
- 缺乏版本資訊顯示時，可能誤用不支援的 Grafana 功能，導致整合失敗。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我是首次設定 Grafana 整合。
    **When** 我在「Grafana 整合設定」頁面，輸入 Grafana URL 和 API Key，然後點擊「測試連線」。
    **Then** 系統應顯示「連線正常」的狀態。

2.  **Given** 我確認連線測試成功。
    **When** 我點擊「儲存變更」按鈕。
    **Then** 系統應保存我的設定，並彈出成功提示。

3.  **Given** 我輸入了一個格式不正確的 URL。
    **When** 我嘗試儲存或測試連線。
    **Then** 系統應在該輸入框下方顯示錯誤訊息。

### 邊界案例（Edge Cases）
- 當 API Key 不正確導致連線測試失敗時，系統應顯示由後端返回的具體錯誤訊息。
- 當使用者修改了設定但尚未儲存時，點擊「還原為已儲存設定」按鈕應能撤銷所有未儲存的變更。
- 在儲存或測試期間，對應的按鈕應顯示載入中狀態。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個表單介面，允許管理員設定和編輯與 Grafana 的整合參數。
- **FR-002**：系統必須（MUST）提供一個「測試連線」功能，用於即時驗證當前輸入的設定。
- **FR-003**：系統必須（MUST）在 UI 上清晰地展示最近一次連線測試的結果、訊息和偵測到的 Grafana 版本。
- **FR-004**：系統必須（MUST）對輸入的 URL 進行客戶端基本驗證（例如，是否包含 `http` 前綴）。
- **FR-005**：系統必須（MUST）為敏感的 API Key 欄位提供遮蔽和臨時顯示的功能。
- **FR-006 (AS-IS)**：頁面包含一個靜態的資訊橫幅和安全建議區塊，向使用者說明此設定的重要性。
- **FR-007 (FUTURE)**：系統文件**必須**明確說明整合所需的 Grafana API Key 的最小權限範圍。
- **FR-008 (FUTURE)**：後端**必須**使用加密方式安全地儲存 API Key。
- **FR-009 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **GrafanaSettings** | 核心資料實體，包含了與 Grafana 執行個體進行整合所需的所有設定。 | - |
| **GrafanaTestResponse** | 執行連線測試後，API 回傳的結果，包含成功狀態、訊息和偵測到的版本等。 | - |

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

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🔴 | 未實現。此頁面所有 UI 文字均為硬編碼的中文，未接入 i18n 內容管理系統。 |
| Theme Token 使用 | 🟡 | 部分實現。UI 混用預定義樣式與直接的 Tailwind 色票。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在此頁面完全使用硬編碼中文，例如 `'無法載入 Grafana 設定，請稍後再試。'`，未來需全面遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-yellow-500/10`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。