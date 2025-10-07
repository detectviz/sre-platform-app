# 功能規格書（Feature Specification）

**模組名稱 (Module)**: rbac-observability-audit-governance
**類型 (Type)**: Common
**來源路徑 (Source Path)**: `N/A (Front-end governance policy)`
**建立日期 (Created)**: 2025-10-07
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為平台前端的負責人，我需要一套一致的權限守衛、觀測性與審計政策，讓所有模組都能依相同的標準啟用 RBAC、記錄性能指標與上報關鍵操作，確保 MVP 在安全與治理面維持可追溯性。

### 驗收情境（Acceptance Scenarios）
1. **Given** 使用者成功登入平台，**When** 前端呼叫 `GET /api/v1/me/permissions` 並取得權限列表，**Then** 權限應被寫入全域 Context，且 UI 中未被授權的操作不會顯示或會以禁用狀態呈現。
2. **Given** 使用者在任何頁面觸發 API 操作，**When** `services/api.ts` 透過 axios 攔截器發送請求，**Then** 應自動產生包含延遲、狀態碼與 requestId 的遙測事件並交由所選 RUM/APM SDK 上報。
3. **Given** 使用者對敏感資料進行建立、修改或刪除，**When** 後端完成請求並回傳成功結果，**Then** 審計日誌必須在後端產生並可透過 `audit-logs` 模組查詢；若請求失敗，前端需在相同流程顯示明確錯誤與參考碼。

### 邊界案例（Edge Cases）
- 當 `GET /api/v1/me/permissions` 回傳錯誤或逾時時，應顯示標準的「權限載入失敗」頁面並阻擋任何受保護路由。
- 當所選的 RUM/APM SDK 初始化失敗時，應回退為記錄 console warning 並避免阻塞使用者操作。
- 當後端未回傳審計追蹤 ID 時，前端仍須照常顯示結果，但需要在錯誤／成功提示中加入「審計 ID 待補」的治理提醒。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：登入後第一時間呼叫 `GET /api/v1/me/permissions` 並快取於 `AuthContext`（或等效 Context），失敗時需重新導向到權限錯誤頁面。
- **FR-002**：提供 `usePermissions()` hook，至少支援 `hasPermission(permission: string | string[]): boolean` 與 `hasAllPermissions(permissions: string[]): boolean` 兩種檢查模式。
- **FR-003**：提供 `<RequirePermission permission="resource:action" mode="all|any">` 高階元件，用於路由守衛與大型區塊的權限判斷，未授權時應顯示標準錯誤畫面或導航至 `/errors/forbidden`。
- **FR-004**：所有模組的互動元件（按鈕、選單、批次操作）必須以 `usePermissions` 或 `<RequirePermission>` 進行顯示／禁用控制；缺少權限時預設隱藏元件，若需顯示為 disabled 並提供說明，必須在模組規格中額外註明，且在任何情況下不得發送 API 請求。
- **FR-005**：在 `services/api.ts` 中整合 RUM/APM SDK，於 request/response 攔截器自動紀錄 URL、HTTP 方法、延遲、狀態碼、requestId 並附加當前使用者 ID。
- **FR-006**：於 `App.tsx` 或應用入口初始化 RUM/APM SDK，啟用 Core Web Vitals 收集（LCP、FID/INP、CLS）與自訂 transaction。
- **FR-007**：對於拓撲圖、日誌檢視器、資源列表等高複雜度互動，需提供可注入的 `startInteractionSpan(name: string)` API 以便模組紀錄額外耗時。
- **FR-008**：所有呼叫會改變系統狀態的 API（Create/Update/Delete/Execute）在成功回應後，需將後端回傳的 `auditId`（若存在）與關鍵欄位寫入 toast 或成功訊息；若後端未回傳，前端需加入治理提醒。
- **FR-009**：審計需求採後端優先原則，前端不得自行組裝審計 payload；僅需確保請求中包含必要的 `resourceId` 與 `context`，並在規格文件中記錄預期欄位。
- **FR-010**：提供 `useAuditTrail()` 小工具（wrapper），協助模組在顯示成功訊息時附帶 audit 參考連結。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Permission | 以 `resource:action` 表示的權限字串，登入後由後端提供。 | 關聯 `AuthContext` 與 `<RequirePermission>`。 |
| TelemetryEvent | 由 API 攔截器或自訂互動產生的遙測事件，包含延遲、狀態碼與 requestId。 | 發送至 RUM/APM SDK。 |
| AuditLogReference | 後端回傳的 `auditId` 與相關描述，用於顯示給使用者並供日後追蹤。 | 與成功提示、Audit Logs 模組連動。 |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ⚠️ | 規範已定義需整合 RUM/APM SDK 與 API 攔截器，但 MVP 尚待實作。 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 需於遙測平台配置 Core Web Vitals 與 API Latency 儀表板。 |
| RBAC 權限與審計 | ⚠️ | 權限守衛與 auditId 呈現規則已定義，仍需在各模組導入。 |
| i18n 文案 | ⚠️ | 所有提示訊息需交由內容系統提供多語字串並支援 auditId 併入。 |
| Theme Token 使用 | ✅ | 不涉具體 UI 樣式，僅提供治理政策。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項（Clarifications）

- [RESOLVED - 2025-10-07] 團隊選定以單一 RUM/APM SDK（Sentry/Datadog 任一）作為統一方案，細部實作請於技術計畫中追蹤。
- [RESOLVED - 2025-10-07] 審計日誌由後端負責產生並提供 `auditId`，前端僅需顯示並附上治理提醒。
