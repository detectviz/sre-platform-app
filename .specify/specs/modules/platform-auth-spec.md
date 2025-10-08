# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-auth
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或安全工程師，我需要能夠管理平台與多個外部身份提供商（IdP）的 OIDC/SSO 連線設定，讓我能夠：
1. **配置多個身份提供商** - 支援同時配置多個 IdP（如 Keycloak、Auth0、Azure AD、Google Workspace），滿足不同部門或客戶群的認證需求
2. **安全地查看與管理憑證** - 查看 Client ID、Realm 等資訊，並在需要時安全地複製 Client Secret 進行金鑰輪換或故障排除
3. **設定預設與優先級** - 指定主要 IdP 和備用 IdP，確保認證服務的高可用性
4. **管理使用者登入選項** - 控制使用者在登入頁面可見的 IdP 選項，提供彈性的認證體驗

以便支援企業級多租戶場景、提升認證系統的可用性與彈性、滿足不同組織單位的特定認證需求。

#### 具體情境:
- **多部門認證需求**: 公司內部使用 Keycloak 進行員工認證，外部客戶使用 Auth0，合作夥伴使用 Azure AD。需要在同一平台上配置三個 IdP，並根據使用者類型自動導向對應的認證服務。
- **IdP 高可用性**: 主要 IdP（如 Auth0）設定為預設選項，當其不可用時，系統自動切換至備用 IdP（如 Keycloak），確保使用者登入不中斷。
- **安全稽核**: 在定期安全審查時，需要確認所有已配置 IdP 的設定是否正確，包括 Client ID、Realm、OIDC 啟用狀態、回調 URL 等。
- **故障排查**: 當使用者回報無法透過特定 IdP 登入時，需要快速查看該 IdP 的設定，並複製 Client Secret 到 IdP 管理介面進行比對，排除金鑰不匹配的可能性。
- **金鑰輪換**: 在進行定期的 Client Secret 更新時，需要針對特定 IdP 確認目前設定的 Secret 內容，然後在 IdP 端完成更新後，回到平台端驗證新設定是否生效。
- **租戶隔離**: 在 SaaS 多租戶環境中，每個租戶可配置專屬的 IdP，確保認證資料隔離與品牌一致性。

#### 現有痛點:
- **單一 IdP 限制**: 現有系統僅支援單一 IdP，無法滿足多部門、多客戶群的差異化認證需求，需要部署多個獨立系統增加維護成本。
- **無容錯機制**: IdP 故障時，整個平台的登入功能完全中斷，缺乏自動切換至備用 IdP 的機制。
- **憑證管理風險**: 若 Client Secret 完全公開顯示，可能導致敏感憑證外洩；缺乏一鍵複製功能時，手動選取與複製長串金鑰容易出錯。
- **配置複雜度**: 若無統一的 IdP 管理介面，需要分別到各個 IdP 提供商的管理後台進行設定，增加配置錯誤風險。
- **使用者體驗**: 若無明確的 IdP 選擇介面，使用者可能不知道該選擇哪個登入方式，導致認證失敗。

### 驗收情境（Acceptance Scenarios）

#### 場景群組 A：設定查看與資訊顯示（Settings View & Information Display）
1. **Given** 我正在「身份驗證設定」頁面
   **When** 頁面載入完成
   **Then** 我應該看到一個警告橫幅，提示這是唯讀頁面且修改需聯繫系統管理員
   **And Then** 所有設定欄位均應以唯讀狀態顯示

2. **Given** 頁面已成功載入身份驗證設定
   **When** 我檢視設定內容
   **Then** 系統應清晰顯示身份提供商名稱（如 Keycloak）、Realm、OIDC 啟用狀態
   **And Then** 每個設定項應有明確的標籤說明其用途

3. **Given** 某些設定值（如 IdP 管理入口 URL）未被配置
   **When** 我查看對應的設定欄位
   **Then** 系統應顯示佔位符（如 "—"）或提示訊息「未設定」
   **And Then** 不應顯示空白或 null 值

#### 場景群組 B：敏感資訊保護與顯示切換（Sensitive Data Protection & Toggle）
4. **Given** 頁面載入完成，Client Secret 欄位可見
   **When** 我查看 Client Secret 欄位
   **Then** Client Secret 應預設以遮蔽形式顯示（如 `••••••••••••`）
   **And Then** 不應在頁面原始碼或瀏覽器開發者工具中直接暴露明文

5. **Given** 我需要驗證儲存的 Client Secret 是否正確
   **When** 我點擊 Client Secret 欄位旁的「顯示」按鈕（眼睛圖示）
   **Then** 被遮蔽的密鑰應切換為明文顯示
   **And Then** 按鈕圖示應變更為「隱藏」狀態

6. **Given** Client Secret 目前以明文顯示
   **When** 我再次點擊「隱藏」按鈕
   **Then** 密鑰應恢復為遮蔽狀態
   **And Then** 按鈕圖示應變更回「顯示」狀態

#### 場景群組 C：複製功能與使用者回饋（Copy Functionality & User Feedback）
7. **Given** 我需要向 IdP 管理員提供我們的 Client ID
   **When** 我在「Client ID」欄位旁點擊「複製」按鈕
   **Then** Client ID 字串應被複製到我的剪貼簿
   **And Then** 系統應顯示成功提示訊息（如「Client ID 已複製」）

8. **Given** 我需要複製 Client Secret 用於 IdP 端驗證
   **When** 我點擊 Client Secret 欄位旁的「複製」按鈕
   **Then** 完整的 Client Secret（明文）應被複製到剪貼簿
   **And Then** 系統應顯示成功提示訊息，即使 Secret 當前處於遮蔽狀態

9. **Given** 我在不支援剪貼簿 API 的環境中（如非 HTTPS 連線）
   **When** 我嘗試點擊「複製」按鈕
   **Then** 系統應顯示錯誤提示訊息，建議我手動複製
   **And Then** 相關內容應仍可被手動選取與複製

#### 場景群組 D：錯誤處理與邊界情境（Error Handling & Edge Cases）
10. **Given** 後端 API 無法載入身份驗證設定（如網路錯誤、伺服器故障）
    **When** 頁面嘗試載入資料
    **Then** 系統應顯示清晰的錯誤訊息（如「無法載入身份驗證設定，請稍後再試」）
    **And Then** 不應顯示部分載入的資料或空白頁面

11. **Given** 使用者權限不足以查看身份驗證設定（FUTURE）
    **When** 使用者嘗試存取此頁面
    **Then** 系統應顯示權限不足的提示訊息
    **And Then** 使用者應被導引至適當的頁面或提示聯繫管理員

12. **Given** 我在頁面上停留較長時間，後端 Session 可能過期
    **When** 我嘗試重新載入設定或執行其他操作
    **Then** 系統應檢測到 Session 過期並提示使用者重新登入
    **And Then** 重新登入後應自動返回此頁面

#### 場景群組 E：多身份提供商管理（Multiple Identity Providers Management）
13. **Given** 系統已配置多個身份提供商（如 Keycloak、Auth0、Azure AD）
    **When** 我開啟「身份驗證設定」頁面
    **Then** 系統應以清單或卡片形式顯示所有已配置的 IdP
    **And Then** 每個 IdP 應顯示其名稱、類型、啟用狀態、是否為預設 IdP

14. **Given** 我需要新增一個新的身份提供商
    **When** 我點擊「新增 IdP」按鈕
    **Then** 系統應顯示 IdP 配置表單
    **And Then** 表單應包含 IdP 類型選擇（Keycloak/Auth0/Azure AD/Google/SAML 等）、名稱、Client ID、Client Secret、Realm、回調 URL 等欄位

15. **Given** 我正在配置新的 IdP
    **When** 我選擇 IdP 類型（如 Auth0）
    **Then** 系統應根據所選類型動態調整表單欄位（如 Auth0 需要 Domain，Keycloak 需要 Realm）
    **And Then** 應顯示該 IdP 類型的配置說明或文檔連結

16. **Given** 我需要設定主要 IdP 和備用 IdP
    **When** 我在 IdP 清單中標記某個 IdP 為「預設」
    **Then** 系統應將該 IdP 設定為使用者登入時的預設選項
    **And Then** 使用者在登入頁面應優先看到此 IdP 的登入按鈕

17. **Given** 系統已配置主要 IdP（Auth0）和備用 IdP（Keycloak）
    **When** 主要 IdP 連線失敗或回應超時
    **Then** 系統應自動嘗試使用備用 IdP 進行認證
    **And Then** 應記錄 IdP 故障轉移事件至審計日誌

18. **Given** 我需要編輯某個已配置的 IdP 設定
    **When** 我點擊該 IdP 的「編輯」按鈕
    **Then** 系統應顯示該 IdP 的詳細設定表單
    **And Then** 表單應預填該 IdP 的現有配置值

19. **Given** 我需要停用某個身份提供商但不刪除其配置
    **When** 我將該 IdP 的啟用狀態切換為「停用」
    **Then** 系統應停用該 IdP，使用者將無法透過該 IdP 登入
    **And Then** IdP 配置應保留在系統中，可隨時重新啟用

20. **Given** 我需要測試特定 IdP 的連線狀態
    **When** 我點擊該 IdP 的「測試連線」按鈕
    **Then** 系統應向該 IdP 發送測試請求
    **And Then** 應顯示連線結果（成功/失敗）、回應時間、IdP 版本資訊（若可取得）

21. **Given** 我需要刪除某個不再使用的身份提供商
    **When** 我點擊該 IdP 的「刪除」按鈕
    **Then** 系統應顯示確認對話框，警告此操作不可逆且會影響使用該 IdP 的使用者
    **And Then** 確認後應刪除該 IdP 配置並記錄至審計日誌

### 邊界案例（Edge Cases）
- 如果後端 API 無法載入身份驗證設定，頁面應顯示一個清晰的錯誤訊息。
- 如果某個設定值（如 IdP 管理入口 URL）未被設定，對應的欄位應顯示為 "—"。
- 複製功能在不安全的 HTTP 環境或使用者未授予權限時可能會失敗，此時應提示使用者手動複製。

---

## 二、功能需求（Functional Requirements）

### 2.1. 多身份提供商管理（Multiple IdP Management）
| 編號 | 說明 |
|------|------|
| **FR-IDP-001** | 系統必須（MUST）支援配置多個身份提供商（IdP），包括但不限於 Keycloak、Auth0、Azure AD、Google Workspace、SAML 2.0。 |
| **FR-IDP-002** | 系統必須（MUST）提供 IdP 清單介面，以清單或卡片形式顯示所有已配置的 IdP，包含名稱、類型、啟用狀態、預設標記。 |
| **FR-IDP-003** | 系統必須（MUST）支援新增 IdP 功能，提供配置表單包含 IdP 類型選擇、名稱、Client ID、Client Secret、Realm/Domain、回調 URL 等欄位。 |
| **FR-IDP-004** | 系統必須（MUST）根據所選 IdP 類型動態調整配置表單欄位（如 Auth0 需要 Domain，Keycloak 需要 Realm，SAML 需要 Metadata URL）。 |
| **FR-IDP-005** | 系統必須（MUST）支援編輯已配置的 IdP 設定，預填現有配置值，並記錄變更至審計日誌。 |
| **FR-IDP-006** | 系統必須（MUST）支援停用/啟用 IdP，停用的 IdP 不可用於使用者登入但配置保留在系統中。 |
| **FR-IDP-007** | 系統必須（MUST）支援刪除 IdP，刪除前應顯示確認對話框並警告影響範圍，刪除操作應記錄至審計日誌。 |
| **FR-IDP-008** | 系統必須（MUST）支援設定預設 IdP，標記為預設的 IdP 在使用者登入頁面應優先顯示。 |

### 2.2. IdP 高可用性與容錯（IdP High Availability & Failover）
| 編號 | 說明 |
|------|------|
| **FR-HA-001** | 系統必須（MUST）支援配置備用 IdP，當主要 IdP 不可用時自動切換至備用 IdP。 |
| **FR-HA-002** | 系統必須（MUST）在 IdP 故障轉移時記錄事件至審計日誌，包含原因、時間戳、受影響的使用者數。 |
| **FR-HA-003** | 系統應該（SHOULD）提供 IdP 健康狀態監控，定期檢查各 IdP 的連線狀態與回應時間。 |
| **FR-HA-004** | 系統應該（SHOULD）在 IdP 健康狀態異常時發送告警通知給管理員。 |

### 2.3. IdP 連線測試（IdP Connection Testing）
| 編號 | 說明 |
|------|------|
| **FR-TEST-001** | 系統必須（MUST）為每個 IdP 提供「測試連線」功能，驗證 Client ID、Client Secret、網路連通性。 |
| **FR-TEST-002** | 系統必須（MUST）在測試結果中顯示連線狀態（成功/失敗）、錯誤訊息（若失敗）、IdP 版本資訊（若可取得）、回應時間。 |
| **FR-TEST-003** | 系統應該（SHOULD）在新增或編輯 IdP 後自動觸發連線測試，確保配置正確後才允許儲存。 |

### 2.4. 敏感資訊保護（Sensitive Data Protection）
| 編號 | 說明 |
|------|------|
| **FR-SEC-001** | 系統必須（MUST）預設將 Client Secret 以遮蔽（masked）形式顯示（如 `••••••••••••`）。 |
| **FR-SEC-002** | 系統必須（MUST）提供「顯示」按鈕，允許使用者臨時查看完整的 Client Secret，並可隨時切換回遮蔽狀態。 |
| **FR-SEC-003** | 系統必須（MUST）為 Client ID 和 Client Secret 提供一鍵複製功能。 |
| **FR-SEC-004** | 系統必須（MUST）在後端使用加密方式（如 AES-256）安全地儲存 Client Secret，避免在資料庫中以明文形式存放。 |
| **FR-SEC-005** | 系統必須（MUST）在 API 回應中透過 HTTPS 加密傳輸 Client Secret。 |

### 2.5. 使用者登入體驗（User Login Experience）
| 編號 | 說明 |
|------|------|
| **FR-UX-001** | 系統必須（MUST）在使用者登入頁面顯示所有已啟用的 IdP 選項，每個 IdP 應有明確的名稱與圖示。 |
| **FR-UX-002** | 系統必須（MUST）將標記為預設的 IdP 置於登入選項的首位或視覺突出位置。 |
| **FR-UX-003** | 系統應該（SHOULD）支援根據使用者的組織或部門自動導向對應的 IdP（如員工導向 Keycloak，客戶導向 Auth0）。 |
| **FR-UX-004** | 系統應該（SHOULD）記住使用者上次使用的 IdP，下次登入時優先顯示該選項。 |

### 2.6. 審計與監控（Audit & Monitoring）
| 編號 | 說明 |
|------|------|
| **FR-AUDIT-001** | 系統必須（MUST）記錄所有 IdP 配置變更操作（新增、編輯、刪除、停用/啟用）至審計日誌。 |
| **FR-AUDIT-002** | 系統必須（MUST）記錄所有敏感操作（查看 Secret、複製 Secret）至審計日誌，包含操作者、時間戳、IP 位址。 |
| **FR-AUDIT-003** | 系統應該（SHOULD）提供 IdP 使用統計儀表板，顯示各 IdP 的登入次數、成功率、平均回應時間等指標。 |

### 2.7. 租戶隔離（Multi-Tenancy）
| 編號 | 說明 |
|------|------|
| **FR-TENANT-001** | 系統應該（SHOULD）支援租戶級別的 IdP 配置，每個租戶可配置專屬的 IdP，確保認證資料隔離。 |
| **FR-TENANT-002** | 系統應該（SHOULD）支援全域 IdP 配置，可被所有租戶共用（如公司內部的統一 Keycloak）。 |

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **IdentityProvider** | 核心資料實體，代表一個已配置的身份提供商（IdP），包含 IdP 類型、名稱、Client ID、Client Secret、Realm/Domain、回調 URL、啟用狀態、預設標記等。 | - |
| **IdPConfiguration** | IdP 特定的配置參數，根據 IdP 類型（Keycloak/Auth0/Azure AD 等）包含不同的欄位。 | IdentityProvider |
| **IdPConnectionTest** | IdP 連線測試結果，包含測試狀態（成功/失敗）、錯誤訊息、IdP 版本資訊、回應時間、測試時間戳。 | IdentityProvider |
| **IdPFailoverLog** | IdP 故障轉移記錄，包含原因、時間戳、從哪個 IdP 切換到哪個 IdP、受影響的使用者數。 | IdentityProvider |
| **IdPAuditLog** | IdP 審計日誌，記錄所有 IdP 相關操作（配置變更、敏感資訊查看、連線測試等），包含操作者、時間戳、IP 位址、操作類型、變更內容。 | IdentityProvider |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:auth:read` | 允許使用者查看身份驗證設定頁面與 IdP 清單。這應被視為一個高權限操作。 |
| `settings:auth:create` | 允許使用者新增 IdP 配置。 |
| `settings:auth:update` | 允許使用者編輯現有 IdP 配置。 |
| `settings:auth:delete` | 允許使用者刪除 IdP 配置。 |
| `settings:auth:test` | 允許使用者執行 IdP 連線測試。 |
| `settings:auth:secret:view` | 允許使用者查看（unmask）Client Secret。 |
| `settings:auth:secret:copy` | 允許使用者複製 Client Secret。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AuthSettingsPage` 的根元件需由 `<RequirePermission permission="settings:auth:read">` 包裹。
- **IdP 清單**: 所有擁有 `settings:auth:read` 權限的使用者均可查看 IdP 清單與基本資訊（但 Client Secret 預設遮蔽）。
- **操作按鈕**:
  - 「新增 IdP」按鈕需具備 `settings:auth:create` 權限。
  - 「編輯」按鈕需具備 `settings:auth:update` 權限。
  - 「刪除」按鈕需具備 `settings:auth:delete` 權限。
  - 「測試連線」按鈕需具備 `settings:auth:test` 權限。
  - 「顯示 Secret」按鈕需具備 `settings:auth:secret:view` 權限。
  - 「複製 Secret」按鈕需具備 `settings:auth:secret:copy` 權限。

### 4.3. 資料過濾（Data Filtering）
- **租戶隔離**: 在多租戶環境中，每個租戶僅能查看與管理屬於自己的 IdP 配置，無法存取其他租戶的 IdP。
- **全域 IdP**: 標記為全域的 IdP 配置應對所有租戶可見但僅能由超級管理員編輯。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

**標記說明**：
- ✅ 已完整實現
- 🟡 部分實現或待完善
- ⚙️ 未來版本實現（FUTURE）

| 項目 | 狀態 | 說明 |
|------|------|------|
| **記錄與追蹤 (Logging/Tracing)** | 🟡 | 需實現結構化日誌記錄（如查看設定、顯示/隱藏 Secret、複製操作）與分散式追蹤整合。 |
| **指標與告警 (Metrics & Alerts)** | 🟡 | 需實現業務指標收集（如頁面存取次數、Secret 顯示次數、複製操作次數）與異常告警機制。 |
| **RBAC 權限與審計** | ⚙️ | 需實現基於 `settings:auth:read` 的權限控制與審計日誌（記錄何人何時查看或複製了敏感資訊）。 |
| **i18n 文案** | 🟡 | 需完全遷移至 i18n 內容管理系統（如 `platform.auth.toast.clientIdCopied`），消除硬編碼文字。 |
| **Theme Token 使用** | 🟡 | 需使用中央設計系統的 Theme Token（如 `--color-warning`, `--color-background-secondary`），替代直接色票引用。 |

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
- **多 IdP 支援**: 系統支援配置多個身份提供商，包括 Keycloak、Auth0、Azure AD、Google Workspace、SAML 2.0 等，滿足企業級多租戶與高可用性需求。
- **Client Secret 遮蔽機制**: Client Secret 預設以遮蔽形式顯示，使用者可透過「顯示」按鈕臨時查看明文，並可隨時切換回遮蔽狀態。Client Secret 在後端使用 AES-256 加密儲存，透過 HTTPS 加密傳輸。
- **複製功能設計**: 支援一鍵複製 Client ID 和 Client Secret，即使 Secret 處於遮蔽狀態也應複製明文內容，以便直接用於 IdP 端驗證。
- **IdP 故障轉移**: 當主要 IdP 不可用時，系統自動切換至備用 IdP，並記錄故障轉移事件至審計日誌。
- **動態表單欄位**: IdP 配置表單根據所選 IdP 類型動態調整欄位，提供更直觀的配置體驗。

### 7.2. 待後續版本優化的功能 (FUTURE)
- **[FUTURE] i18n 完全遷移**: 需完全遷移至 i18n 內容管理系統（鍵值如 `platform.auth.idp.addButton`, `platform.auth.toast.connectionSuccess`），消除所有硬編碼文字。
- **[FUTURE] Theme Token 重構**: 需使用中央設計系統的 Theme Token（如 `--color-warning-background`, `--color-text-secondary`），替代原子化 CSS class 直接引用。
- **[FUTURE] IdP 健康監控儀表板**: 提供即時的 IdP 健康狀態監控儀表板，顯示各 IdP 的連線狀態、回應時間、使用統計、故障歷史等資訊。
- **[FUTURE] 智能 IdP 路由**: 根據使用者的電子郵件域名、IP 位址、組織屬性等自動判斷並導向最合適的 IdP，提升使用者體驗。
- **[FUTURE] IdP 配置匯入/匯出**: 支援批次匯入 IdP 配置（如 JSON/YAML 格式），並支援匯出現有配置用於備份或遷移。
- **[FUTURE] SAML 進階支援**: 提供 SAML 2.0 的進階配置選項，如屬性映射、簽章驗證、加密斷言等。