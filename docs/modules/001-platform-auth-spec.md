# Feature Specification: Platform Auth

**Created**: 2025-10-06
**Status**: Ready for Technical Review
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為一名平台管理員或安全工程師，我需要能夠管理平台與多個外部身份提供商（IdP）的 OIDC/SSO 連線設定，讓我能夠：
1. **配置多個身份提供商** - 支援同時配置多個 IdP（如 Keycloak、Auth0、Azure AD），滿足不同部門或客戶群的認證需求。
2. **安全地管理憑證** - 查看 Client ID、Realm 等資訊，並在需要時安全地複製 Client Secret 進行金鑰輪換。
3. **設定高可用性** - 指定主要 IdP 和備用 IdP，確保認證服務的高可用性。
4. **管理使用者登入選項** - 控制使用者在登入頁面可見的 IdP 選項，提供彈性的認證體驗。

以便支援企業級多租戶場景、提升認證系統的可用性與彈性、滿足不同組織單位的特定認證需求。

### 具體情境:
- **多部門認證需求**: 公司內部使用 Keycloak，外部客戶使用 Auth0，需要在同一平台上配置兩個 IdP。
- **IdP 高可用性**: 設定主要 IdP 為 Auth0，備用 IdP 為 Keycloak，當 Auth0 故障時，系統自動切換至備用 IdP。
- **安全稽核**: 定期審查所有 IdP 的設定，確認 Client ID、Realm、回調 URL 等是否正確。
- **故障排查**: 當使用者回報無法登入時，快速查看 IdP 設定，並複製 Client Secret 進行比對。
- **金鑰輪換**: 定期更新 IdP 的 Client Secret，確保憑證安全。
- **租戶隔離**: 在 SaaS 環境中，為每個租戶配置專屬的 IdP。

### 現有痛點:
- **單一 IdP 限制**: 無法滿足多部門、多客戶群的差異化認證需求。
- **無容錯機制**: IdP 故障時，整個平台的登入功能完全中斷。
- **憑證管理風險**: Client Secret 若以明文顯示，可能導致外洩。
- **配置複雜**: 需要在多個系統間切換，增加配置錯誤風險。
- **使用者體驗不佳**: 使用者不知道該選擇哪個登入方式。

### 驗收情境（Acceptance Scenarios）

#### 場景群組 A：設定查看與資訊顯示 (3 個)
1. **Given** 我正在「身份驗證設定」頁面, **When** 頁面載入完成, **Then** 所有設定欄位均應以唯讀狀態顯示。
2. **Given** 頁面已成功載入身份驗證設定, **When** 我檢視設定內容, **Then** 系統應清晰顯示身份提供商名稱、Realm、OIDC 啟用狀態。
3. **Given** 某些設定值未被配置, **When** 我查看對應的設定欄位, **Then** 系統應顯示佔位符（如 "—"）。

#### 場景群組 B：敏感資訊保護與顯示切換 (3 個)
4. **Given** Client Secret 欄位可見, **When** 我查看 Client Secret 欄位, **Then** Client Secret 應預設以遮蔽形式顯示。
5. **Given** 我需要驗證儲存的 Client Secret, **When** 我點擊「顯示」按鈕, **Then** 被遮蔽的密鑰應切換為明文顯示。
6. **Given** Client Secret 目前以明文顯示, **When** 我再次點擊「隱藏」按鈕, **Then** 密鑰應恢復為遮蔽狀態。

#### 場景群組 C：複製功能與使用者回饋 (3 個)
7. **Given** 我需要提供 Client ID, **When** 我點擊「複製」按鈕, **Then** Client ID 字串應被複製到剪貼簿，並顯示成功提示。
8. **Given** 我需要複製 Client Secret, **When** 我點擊「複製」按鈕, **Then** 完整的 Client Secret（明文）應被複製到剪貼簿，並顯示成功提示。
9. **Given** 我在不支援剪貼簿 API 的環境中, **When** 我嘗試點擊「複製」按鈕, **Then** 系統應顯示錯誤提示，建議我手動複製。

#### 場景群組 D：錯誤處理與邊界情境 (3 個)
10. **Given** 後端 API 無法載入身份驗證設定, **When** 頁面嘗試載入資料, **Then** 系統應顯示清晰的錯誤訊息。
11. **Given** 使用者權限不足, **When** 使用者嘗試存取此頁面, **Then** 系統應顯示權限不足的提示訊息。
12. **Given** 我在頁面上停留較長時間, **When** 我嘗試重新載入設定, **Then** 系統應檢測到 Session 過期並提示重新登入。

#### 場景群組 E：多身份提供商管理 (9 個)
13. **Given** 系統已配置多個 IdP, **When** 我開啟設定頁面, **Then** 系統應以清單形式顯示所有已配置的 IdP。
14. **Given** 我需要新增 IdP, **When** 我點擊「新增 IdP」按鈕, **Then** 系統應顯示 IdP 配置表單。
15. **Given** 我正在配置新的 IdP, **When** 我選擇 IdP 類型, **Then** 系統應根據所選類型動態調整表單欄位。
16. **Given** 我需要設定主要 IdP, **When** 我在 IdP 清單中標記某個 IdP 為「預設」, **Then** 該 IdP 應成為使用者登入時的預設選項。
17. **Given** 系統已配置主備 IdP, **When** 主要 IdP 連線失敗, **Then** 系統應自動嘗試使用備用 IdP 進行認證。
18. **Given** 我需要編輯某個 IdP, **When** 我點擊「編輯」按鈕, **Then** 系統應顯示預填好現有配置的表單。
19. **Given** 我需要停用某個 IdP, **When** 我將其啟用狀態切換為「停用」, **Then** 使用者將無法透過該 IdP 登入。
20. **Given** 我需要測試 IdP 連線, **When** 我點擊「測試連線」按鈕, **Then** 系統應發送測試請求並顯示結果。
21. **Given** 我需要刪除某個 IdP, **When** 我點擊「刪除」按鈕, **Then** 系統應顯示確認對話框並在確認後刪除配置。

---

## 二、功能需求（Functional Requirements）

### 2.1. IdP 管理 (IDP Management)
| 編號 | 說明 |
|------|------|
| **FR-IDP-001** | 系統必須（MUST）支援配置多個身份提供商（IdP）。 |
| **FR-IDP-002** | 系統必須（MUST）提供 IdP 的 CRUD（建立、讀取、更新、刪除）功能。 |
| **FR-IDP-003** | 系統必須（MUST）根據所選 IdP 類型動態調整配置表單。 |

### 2.2. 高可用性與容錯 (HA & Failover)
| 編號 | 說明 |
|------|------|
| **FR-HA-001** | 系統必須（MUST）支援配置備用 IdP，當主要 IdP 不可用時自動切換。 |
| **FR-HA-002** | 系統必須（MUST）在 IdP 故障轉移時記錄審計日誌。 |

### 2.3. 連線測試 (Connection Testing)
| 編號 | 說明 |
|------|------|
| **FR-TEST-001** | 系統必須（MUST）為每個 IdP 提供「測試連線」功能。 |
| **FR-TEST-002** | 測試結果必須（MUST）顯示連線狀態、錯誤訊息、版本資訊與回應時間。 |

### 2.4. 敏感資訊保護 (Sensitive Data Protection)
| 編號 | 說明 |
|------|------|
| **FR-SEC-001** | Client Secret 必須（MUST）預設以遮蔽形式顯示。 |
| **FR-SEC-002** | 系統必須（MUST）提供「顯示/隱藏」和「一鍵複製」功能。 |
| **FR-SEC-003** | Client Secret 必須（MUST）在後端加密儲存。 |

### 2.5. 使用者登入體驗 (User Login Experience)
| 編號 | 說明 |
|------|------|
| **FR-UX-001** | 登入頁面必須（MUST）顯示所有已啟用的 IdP 選項。 |
| **FR-UX-002** | 系統應該（SHOULD）支援根據使用者屬性自動導向對應的 IdP。 |

### 2.6. 審計與監控 (Audit & Monitoring)
| 編號 | 說明 |
|------|------|
| **FR-AUDIT-001** | 系統必須（MUST）記錄所有 IdP 配置變更與敏感操作至審計日誌。 |
| **FR-AUDIT-002** | 系統應該（SHOULD）提供 IdP 使用統計儀表板。 |

### 2.7. 多租戶 (Multi-Tenancy)
| 編號 | 說明 |
|------|------|
| **FR-TENANT-001** | 系統應該（SHOULD）支援租戶級別的 IdP 配置。 |

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 |
|-----------|------|
| **IdentityProvider** | 代表一個已配置的身份提供商（IdP）的核心實體。 |
| **IdPConfiguration** | IdP 特定的配置參數。 |
| **IdPConnectionTest** | IdP 連線測試結果。 |
| **IdPFailoverLog** | IdP 故障轉移記錄。 |
| **IdPAuditLog** | IdP 審計日誌。 |

---

## 四、權限控制 (RBAC)
| 權限字串 | 描述 |
|---|---|
| `settings:auth:read` | 允許查看身份驗證設定。 |
| `settings:auth:create` | 允許新增 IdP 配置。 |
| `settings:auth:update` | 允許編輯 IdP 配置。 |
| `settings:auth:delete` | 允許刪除 IdP 配置。 |
| `settings:auth:test` | 允許執行 IdP 連線測試。 |
| `settings:auth:secret:view` | 允許查看 Client Secret。 |
| `settings:auth:secret:copy` | 允許複製 Client Secret。 |

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）
| 項目 | 狀態 | 說明 |
|------|------|------|
| **Logging/Tracing** | 🟡 | 需實現結構化日誌記錄與分散式追蹤整合。 |
| **Metrics & Alerts** | 🟡 | 需實現業務指標收集與異常告警機制。 |
| **RBAC** | ⚙️ | 需實現基於權限的控制與審計日誌。 |
| **i18n** | 🟡 | 需完全遷移至 i18n 內容管理系統。 |
| **Theme Token** | 🟡 | 需統一使用中央設計系統的 Theme Token。 |