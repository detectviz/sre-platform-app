# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-auth
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/AuthSettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或安全工程師，我需要能夠安全地查看當前平台與外部身份提供商（IdP）的 OIDC/SSO 連線設定。我希望能快速地驗證 Client ID、Realm 等資訊是否正確，並在需要時能安全地複製 Client Secret 以便於在 IdP 端進行金鑰輪換或故障排除，同時確保這些敏感資訊不會輕易外洩。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「身份驗證設定」頁面。
    **When** 頁面載入完成。
    **Then** 我應該看到一個黃色的警告橫幅，提醒我這些設定的敏感性，並且所有設定欄位均為唯讀狀態。

2.  **Given** 我需要向 IdP 管理員提供我們的 Client ID。
    **When** 我在「Client ID」欄位旁點擊「複製」按鈕。
    **Then** Client ID 字串應被複製到我的剪貼簿，並彈出一個成功的提示。

3.  **Given** 我需要驗證儲存的 Client Secret 是否正確。
    **When** 我點擊 Client Secret 欄位旁的「眼睛」圖示。
    **Then** 被遮蔽的密鑰應顯示為明文；再次點擊後，它應恢復為遮蔽狀態。

### 邊界案例（Edge Cases）
- 如果後端 API 無法載入身份驗證設定，頁面應顯示一個清晰的錯誤訊息。
- 如果某個設定值（如 IdP 管理入口 URL）未被設定，對應的欄位應顯示為 "N/A" 或 "尚未提供"，而不是空白。
- 複製功能在不安全的 HTTP 環境或使用者未授予權限時可能會失敗，此時應提示使用者手動複製。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個**唯讀**的介面，用於展示平台當前的 OIDC 身份驗證設定。
- **FR-002**：系統必須（MUST）在頁面頂部顯示一個顯著的警告，告知使用者這些設定的高度敏感性。
- **FR-003**：系統必須（MUST）預設將 Client Secret 以遮蔽（masked）形式顯示。
- **FR-004**：系統必須（MUST）提供一個開關，允許使用者臨時查看（unmask）完整的 Client Secret。
- **FR-005**：系統必須（MUST）為 Client ID 和 Client Secret 提供一鍵複製的功能。
- **FR-006**：系統必須（MUST）清晰地展示當前的身份提供商（Provider）、領域（Realm）以及 OIDC 功能是否已啟用。
- **FR-007**：頁面必須（MUST）以唯讀方式呈現設定，並於載入後即顯示最新 `AuthSettings` 值。
- **FR-008**：若後端提供 IdP 管理連結 (`idp_admin_url`)，頁面必須（MUST）以外部連結按鈕呈現；缺省時顯示「尚未提供」訊息。
- **FR-009**：在顯示 Client Secret 時必須（MUST）提供遮蔽/顯示切換與複製動作，並於切換/複製時提示使用者。
- **FR-010 (FUTURE)**：後續版本需提供編輯與測試流程：具備 `settings:auth:update` 的使用者可開啟編輯模式、送出審批請求並觸發測試郵件/登入驗證，所有變更需產生審計紀錄。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AuthSettings** | 核心資料實體，包含了平台與外部身份提供商（IdP）進行 OIDC 連線所需的所有設定。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:auth:read` | 允許使用者查看身份驗證設定頁面。這應被視為一個高權限操作。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AuthSettingsPage` 的根元件需由 `<RequirePermission permission="settings:auth:read">` 包裹。所有頁面內的元素均為唯讀，因此無需更細粒度的控制。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/platform/AuthSettingsPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
| 指標與告警 (Metrics & Alerts) | ❌ | 頁面缺少 OpenTelemetry 或自訂指標，所有 API 呼叫僅透過共享客戶端發送。 |
| RBAC 權限與審計 | ❌ | UI 未使用 `usePermissions` 或 `<RequirePermission>`，所有操作目前對所有登入者可見，需依《common/rbac-observability-audit-governance.md》導入守衛。 |
| i18n 文案 | ⚠️ | 主要字串透過內容 context 取得，但錯誤與提示訊息仍有中文 fallback，需要補強內容來源。 |
| Theme Token 使用 | ⚠️ | 介面混用 `app-*` 樣式與 Tailwind 色票（如 `bg-slate-*`），尚未完全以設計 token 命名。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[CLARIFICATION]** Client Secret 仍以明文存於 API 回傳，前端僅負責遮蔽顯示；若需避免明文傳輸需調整後端策略。
- **[CLARIFICATION]** 頁面未限制存取權限，權限表目前為未來治理目標。
- **[CLARIFICATION]** 警示卡片為靜態文字，未與任何審計或操作流程連動。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。
- 後續將引入編輯與測試流程：需新增審批機制、`settings:auth:update` 權限守衛與測試動作的審計記錄。