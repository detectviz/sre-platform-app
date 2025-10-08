# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-auth
**類型 (Type)**: Module
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
    **Then** 我應該看到一個黃色的警告橫幅，並且所有設定欄位均為唯讀狀態。

2.  **Given** 我需要向 IdP 管理員提供我們的 Client ID。
    **When** 我在「Client ID」欄位旁點擊「複製」按鈕。
    **Then** Client ID 字串應被複製到我的剪貼簿。

3.  **Given** 我需要驗證儲存的 Client Secret 是否正確。
    **When** 我點擊 Client Secret 欄位旁的「眼睛」圖示。
    **Then** 被遮蔽的密鑰應顯示為明文；再次點擊後，它應恢復為遮蔽狀態。

### 邊界案例（Edge Cases）
- 如果後端 API 無法載入身份驗證設定，頁面應顯示一個清晰的錯誤訊息。
- 如果某個設定值（如 IdP 管理入口 URL）未被設定，對應的欄位應顯示為 "—"。
- 複製功能在不安全的 HTTP 環境或使用者未授予權限時可能會失敗，此時應提示使用者手動複製。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個**唯讀**的介面，用於展示平台當前的 OIDC 身份驗證設定。
- **FR-002**：系統必須（MUST）在頁面頂部顯示一個顯著的警告橫幅。
- **FR-003**：系統必須（MUST）預設將 Client Secret 以遮蔽（masked）形式顯示。
- **FR-004**：系統必須（MUST）提供一個開關，允許使用者臨時查看（unmask）完整的 Client Secret。
- **FR-005**：系統必須（MUST）為 Client ID 和 Client Secret 提供一鍵複製的功能。
- **FR-006**：系統必須（MUST）清晰地展示當前的身份提供商、領域（Realm）以及 OIDC 功能是否已啟用。
- **FR-007 (AS-IS)**：頁面以唯讀方式呈現設定，並包含一個靜態的「安全建議」區塊。
- **FR-008 (AS-IS)**：前端會將後端回傳的 `provider` key 轉換為更易讀的標籤（如 `keycloak` -> `Keycloak`）。
- **FR-009 (FUTURE)**：後續版本需提供編輯與測試流程，並由 `settings:auth:update` 權限控制。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AuthSettings** | 核心資料實體，包含了平台與外部身份提供商（IdP）進行 OIDC 連線所需的所有設定。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:auth:read` | 允許使用者查看身份驗證設定頁面。這應被視為一個高權限操作。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AuthSettingsPage` 的根元件需由 `<RequirePermission permission="settings:auth:read">` 包裹。所有頁面內的元素均為唯讀，因此無需更細粒度的控制。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。Toast 訊息等處存在硬編碼的中文 fallback。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'Client ID 已複製'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-yellow-500/10`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Client Secret Handling**: Client Secret 仍以明文形式在 API 回應中傳輸，前端僅負責遮蔽顯示。未來應評估是否需要更安全的傳輸或儲存策略。