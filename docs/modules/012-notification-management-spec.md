# Feature Specification: Notification Management

**Created**: 2025-10-08
**Status**: Draft
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為一名 SRE 或平台管理員，我需要一個完整的通知管理系統，讓我能夠：
1. **設定與管理通知管道（Channels）**，例如 Slack Webhook、SMTP 伺服器、PagerDuty，並測試它們是否能成功發送訊息
2. **定義精細的通知策略（Strategies）**，指定當發生特定嚴重性或影響等級的事件時，應透過哪些管道發送通知給哪些人或系統
3. **追蹤與稽核所有通知歷史（History）**，確認關鍵告警是否已成功送達、調查發送失敗的原因，並在必要時手動重新發送

以便確保告警和通知能夠可靠地送達正確的接收者，並在發生問題時能快速定位與修復，維持系統資訊傳遞的可靠性與可追溯性。

### Acceptance Scenarios

#### 場景群組 A：通知管道管理（Channel Management）
1. **Given** 我需要新增一個 Slack 通知管道以接收告警，
   **When** 我在「通知管理」頁面的「管道」頁籤點擊「新增管道」，選擇類型為 "Slack"，並填寫名稱和 Webhook URL，
   **Then** 新的 Slack 管道應出現在列表中，狀態為「啟用」。

2. **Given** 我不確定一個新設定的 PagerDuty 管道是否配置正確，
   **When** 我在該管道的操作列點擊「測試管道」按鈕，
   **Then** 系統應向該管道發送一條測試通知，UI 會樂觀地更新狀態為「測試中」，
   **And Then** 在短時間後顯示最終測試結果（成功/失敗），並提供詳細錯誤訊息（若失敗）。

3. **Given** 我需要更新一個 SMTP 管道的伺服器設定，
   **When** 我點擊該管道的「編輯」按鈕，修改設定並儲存，
   **Then** 系統應更新管道設定，並建議我執行測試以驗證新設定是否正常運作。

4. **Given** 頁面上沒有任何通知管道，
   **When** 我訪問「通知管道」頁籤，
   **Then** 頁面應顯示一個清晰的「尚未建立任何通知管道」的空狀態提示，並提供「新增管道」的快捷按鈕。

#### 場景群組 B：通知策略管理（Strategy Management）
5. **Given** 我想為所有「嚴重」等級的資料庫相關告警設定緊急通知，
   **When** 我在「策略」頁籤點擊「新增策略」，設定觸發條件（嚴重度=嚴重 AND 標籤=database）並選擇通知管道（PagerDuty、Slack），
   **Then** 新的策略應出現在列表中，狀態為「啟用」。

6. **Given** 我發現一個現有的通知策略過於嘈雜，想暫時禁用它，
   **When** 我在該策略列表中找到它，並點擊其「啟用」開關，
   **Then** 該策略的狀態應變為「停用」，且不再觸發通知。

7. **Given** 我需要建立一個與現有策略類似，但發送到不同管道的新策略，
   **When** 我點擊一個現有策略的「複製」按鈕，
   **Then** 系統應打開一個預先填寫好該策略資訊的編輯模態框，其名稱會被加上「策略複本 - 」前綴，
   **And Then** 我可以修改管道設定後儲存為新策略。

8. **Given** 我想確認一個策略的觸發條件是否正確設定，
   **When** 我查看策略列表中的「觸發條件」欄位，
   **Then** 系統應以結構化標籤美化顯示條件（如：「嚴重度: 嚴重」、「標籤: database」），而非原始字串。

#### 場景群組 C：通知歷史追蹤（History Tracking）
9. **Given** 我想確認昨晚的資料庫嚴重告警是否已成功透過 PagerDuty 通知給值班人員，
   **When** 我在「歷史」頁籤，使用快速篩選器選擇管道類型為 "PagerDuty" 並設定時間範圍為「昨天」，
   **Then** 我應該能看到對應的通知紀錄，並且其狀態顯示為「已送達」。

10. **Given** 我發現一條發送到 Slack 的通知狀態為「失敗」，
    **When** 我點擊該筆紀錄，
    **Then** 系統應在右側滑出抽屜，顯示結構化的摘要資訊（觸發策略、目標管道、收件人、錯誤訊息）以及完整的 JSON 資料。

11. **Given** 我已經修復了導致通知失敗的管道設定，並需要重新發送該通知，
    **When** 我在該筆失敗紀錄的詳情抽屜中，點擊「重新發送」按鈕，
    **Then** 系統應嘗試重新發送該通知，按鈕顯示載入中狀態，
    **And Then** 重新發送完成後更新狀態並顯示結果（成功/失敗）。

12. **Given** 我需要將過去 7 天的通知歷史匯出用於月度報告，
    **When** 我設定時間範圍為「過去 7 天」並點擊「匯出」按鈕，
    **Then** 系統應生成一份 CSV 檔案供下載，包含目前篩選條件下的所有紀錄。

#### 場景群組 D：整合情境（Integrated Scenarios）
13. **Given** 我想查看一個策略的實際執行效果，
    **When** 我在策略列表中查看「最近一次觸發」欄位，
    **Then** 我應該能看到最近一次觸發的時間與狀態，
    **And Then** 點擊該欄位應導航至「歷史」頁籤並自動篩選該策略的所有通知紀錄。

14. **Given** 一個策略所關聯的通知管道被刪除，
    **When** 我查看該策略詳情，
    **Then** 系統應在管道列表中標示該管道為「已刪除」或「無效」，並建議我更新策略設定。

15. **Given** 我在管道列表中看到某個管道被多個策略使用，
    **When** 我嘗試刪除該管道，
    **Then** 後端應回傳 `409 Conflict` 錯誤，前端顯示清晰提示：「此管道正被 N 個策略使用，無法刪除」，並提供查看使用該管道的策略列表的連結。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個正在被某個策略使用的管道時，後端必須回傳 `409 Conflict` 錯誤，前端據此顯示清晰的提示。
- 當一個管道的測試正在進行中時，其「測試管道」按鈕應被暫時禁用。
- 當使用者嘗試儲存一個沒有設定任何觸發條件或通知管道的策略時，系統應給出錯誤提示。
- 對於一個從未被觸發過的策略，其「上次觸發狀態」和「上次觸發時間」應顯示為「尚未觸發」。
- 對於正在處理中的通知（狀態為 `pending`），「重新發送」按鈕應被禁用。
- 當使用者嘗試匯出一個空的歷史紀錄列表時，系統應給出提示。
- 新增/編輯管道的表單必須根據後端 API 提供的 JSON Schema 動態產生，以支援不同類型的管道。
- 頁面應定期自動刷新：管道頁每 30 秒、歷史頁每 60 秒，以獲取最新狀態。

---

## 二、功能需求（Functional Requirements）

### 2.1. 通知管道管理（Channel Management）
| 編號 | 說明 |
|------|------|
| **FR-C-001** | 系統必須（MUST）提供完整的 CRUD 介面來管理通知管道，並支援批次操作（啟用、停用、刪除）。 |
| **FR-C-002** | 系統必須（MUST）在可分頁、可排序的表格中展示所有已設定的通知管道，包含名稱、類型、狀態、最後測試時間與結果。 |
| **FR-C-003** | 新增/編輯管道的表單必須（MUST）根據後端 API 提供的 JSON Schema 動態產生，以支援不同類型的管道（Slack、Email、PagerDuty、Webhook 等）。 |
| **FR-C-004** | 系統必須（MUST）為每個管道提供「測試」功能，並在 UI 上清晰地展示測試結果（成功/失敗）與錯誤訊息。 |
| **FR-C-005** | 系統必須（MUST）支援進階篩選、欄位自訂、以及從 CSV 檔案匯入/匯出管道設定。 |
| **FR-C-006** | 管道列表應每 30 秒自動刷新一次，以獲取最新的管道狀態和測試結果。 |
| **FR-C-007** | 當管道被刪除時，系統必須（MUST）檢查是否被策略使用，若是則阻止刪除並回傳 `409 Conflict` 錯誤。 |

### 2.2. 通知策略管理（Strategy Management）
| 編號 | 說明 |
|------|------|
| **FR-S-001** | 系統必須（MUST）提供完整的 CRUD 介面來管理通知策略，並包含複製功能。 |
| **FR-S-002** | 系統必須（MUST）在可分頁、可排序的表格中展示所有已設定的通知策略，包含名稱、啟用狀態、觸發條件、關聯管道數量、最近一次觸發狀態與時間。 |
| **FR-S-003** | 系統必須（MUST）允許使用者透過策略編輯模態框來新增或編輯策略，包含名稱、觸發條件、通知管道選擇。 |
| **FR-S-004** | 系統必須（MUST）允許使用者啟用或禁用一個通知策略，並支援批次操作（啟用、停用、刪除）。 |
| **FR-S-005** | 系統必須（MUST）支援自訂表格顯示的欄位與批次刪除。 |
| **FR-S-006 (AS-IS)** | 前端透過 `renderConditionTags` 函式將後端回傳的 `trigger_condition` 字串解析並美化為一組標籤。 |
| **FR-S-007 (FUTURE)** | 編輯策略的模態框應提供一個結構化的條件產生器，以取代目前的純字串輸入。 |
| **FR-S-008** | 策略列表中的「最近一次觸發」欄位必須（MUST）是可互動的連結，能導航至歷史頁面並自動篩選該策略的通知紀錄。 |

### 2.3. 通知歷史追蹤（History Tracking）
| 編號 | 說明 |
|------|------|
| **FR-H-001** | 系統必須（MUST）在可分頁、可排序的表格中展示所有通知的發送歷史。 |
| **FR-H-002** | 每條歷史紀錄必須（MUST）包含：時間戳、觸發策略、目標管道、收件人、狀態（pending/成功/失敗）、內容摘要。 |
| **FR-H-003** | 系統必須（MUST）提供快速篩選器，允許使用者根據「狀態」和「管道類型」過濾列表。 |
| **FR-H-004** | 系統必須（MUST）允許使用者點擊任一筆紀錄，以在抽屜中查看該次通知的完整詳細資訊，包括結構化摘要和完整 JSON。 |
| **FR-H-005** | 系統必須（MUST）為發送失敗的通知提供「重新發送」功能，且對於處理中（pending）的通知應禁用此功能。 |
| **FR-H-006** | 系統必須（MUST）支援將歷史紀錄匯出為 CSV 檔案，包含目前篩選條件。 |
| **FR-H-007** | 系統必須（MUST）支援自訂表格顯示的欄位與進階篩選。 |
| **FR-H-008 (AS-IS)** | 頁面每 60 秒自動刷新一次資料。 |
| **FR-H-009 (AS-IS)** | `content` 欄位目前以純文字摘要呈現。 |
| **FR-H-010 (FUTURE)** | 列表頂部應呈現批次/群組成功率摘要，顯示整體通知送達率與失敗率統計。 |

### 2.4. 整合與治理需求（Integration & Governance）
| 編號 | 說明 |
|------|------|
| **FR-I-001** | 所有 UI 文字（包括 Toast 通知）必須（MUST）使用 i18n Key 進行渲染。 |
| **FR-I-002** | 所有 UI 元件的顏色必須（MUST）使用語義化的 Theme Token，禁止直接使用 Tailwind 色票或自訂 class。 |
| **FR-I-003** | 系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。 |
| **FR-I-004** | 所有 CUD 操作（建立、更新、刪除管道/策略）與測試、重新發送操作，都必須（MUST）產生包含操作上下文的審計日誌。 |
| **FR-I-005** | 應上報與管道測試成功率、通知發送延遲、策略觸發頻率、歷史送達率相關的指標至監控系統。 |
| **FR-I-006** | 所有 state-changing 操作成功後，後端必須（MUST）回傳 `auditId`，前端需在提示訊息中顯示此 ID 以利追蹤。 |

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationChannel** | 核心資料實體，代表一個通知發送的端點設定。包含名稱、類型（Slack/Email/PagerDuty/Webhook）、設定（JSON Schema）、啟用狀態、最後測試時間與結果。 | 被多個 NotificationStrategy 引用。 |
| **JsonSchema** | 用於定義不同通知管道類型所需設定欄位的綱要，支援動態表單產生。 | 屬於 NotificationChannel。 |
| **NotificationStrategy** | 定義從事件到通知管道的路由和過濾規則。包含名稱、觸發條件（字串或結構化規則）、關聯的通知管道列表、啟用狀態、最近一次觸發時間與狀態。 | 關聯多個 NotificationChannel，產生多個 NotificationHistoryRecord。 |
| **NotificationHistoryRecord** | 代表一次通知發送的歷史紀錄。包含時間戳、觸發策略 ID、目標管道 ID、收件人、狀態（pending/成功/失敗）、內容摘要、完整 JSON 資料、錯誤訊息（若失敗）。 | 關聯至 NotificationStrategy 與 NotificationChannel。 |
| **NotificationStrategyFilters** | 用於篩選通知策略列表的條件集合，包含啟用狀態、觸發條件關鍵字、關聯管道。 | - |
| **NotificationHistoryFilters** | 用於篩選通知歷史列表的條件集合，包含狀態、管道類型、時間範圍、觸發策略。 | - |

---

## 四、權限控制 (RBAC)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|-----------|------|
| `notification:channels:read` | 檢視通知管道列表與詳情。 |
| `notification:channels:create` | 建立新的通知管道。 |
| `notification:channels:update` | 修改現有通知管道的設定（包括啟用/停用）。 |
| `notification:channels:delete` | 刪除通知管道。 |
| `notification:channels:test` | 觸發「測試管道」功能。 |
| `notification:channels:config` | 管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |
| `notification:strategies:read` | 檢視通知策略列表與詳情。 |
| `notification:strategies:create` | 建立新的通知策略。 |
| `notification:strategies:update` | 修改現有通知策略的設定（包括啟用/停用、複製）。 |
| `notification:strategies:delete` | 刪除通知策略。 |
| `notification:history:read` | 檢視通知歷史紀錄。 |
| `notification:history:resend` | 重新發送失敗的通知。 |
| `notification:history:export` | 匯出通知歷史資料。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**：整個「通知管理」頁面需由 `<RequirePermission permission="notification:channels:read">` 包裹（最低權限）。
- **頁籤存取**：
  - 管道管理頁籤：`notification:channels:read`
  - 策略管理頁籤：`notification:strategies:read`
  - 歷史追蹤頁籤：`notification:history:read`
- **操作按鈕**：
  - 「新增管道」：`notification:channels:create`
  - 「編輯管道」：`notification:channels:update`
  - 「刪除管道」：`notification:channels:delete`
  - 「測試管道」：`notification:channels:test`
  - 「匯入/匯出管道」：`notification:channels:config`
  - 「新增策略」：`notification:strategies:create`
  - 「編輯策略」：`notification:strategies:update`
  - 「複製策略」：`notification:strategies:update`
  - 「啟用/停用策略」：`notification:strategies:update`
  - 「刪除策略」：`notification:strategies:delete`
  - 「重新發送通知」：`notification:history:resend`
  - 「匯出歷史」：`notification:history:export`
- **批次操作**：所有批次操作均需根據對應的權限進行渲染。
- **後端 API**：需依權限過濾可見紀錄與可操作項目。

---

## 五、觀測性與治理檢查（Observability & Governance）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging/Tracing | ✅ | 所有 CUD 操作（管道、策略）與測試、重新發送操作需產生審計記錄，包含操作上下文與 auditId。 |
| Metrics & Alerts | ✅ | 記錄管道測試成功率與失敗率、通知發送延遲、策略觸發頻率、歷史送達率，並上報至監控系統。 |
| RBAC | ✅ | 所有介面與資料權限均依角色控管，使用 `<RequirePermission>` 或 `usePermissions` hook 進行權限檢查。 |
| i18n | ✅ | 全部文案由多語系內容管理系統提供，所有 UI 字串均使用 i18n Key。 |
| Theme Token | ✅ | 所有樣式遵循語義化色票，禁止直接使用 Tailwind 色票或自訂 class。 |
| [FUTURE] Structured Condition Builder | ⚙️ | 策略編輯應提供結構化條件產生器，取代目前的純字串輸入（FR-S-007）。 |
| [FUTURE] Success Rate Summary | ⚙️ | 歷史頁面應顯示批次/群組成功率摘要（FR-H-010）。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 所有段落齊備且結構正確。
- [x] 無技術語句。
- [x] 所有 FR 具可測試性。
- [x] 無模糊或重疊需求。
- [x] 與 `.specify/memory/constitution.md` (v1.3.0) 一致。
- [x] 模板結構完整。
- [x] 已整合 `notification-channel-spec.md`、`notification-strategy-spec.md`、`notification-history-spec.md` 三份規格。

---

## 七、模糊與待確認事項（Clarifications）

| 項目 | 狀態 | 備註 |
|------|------|------|
| 策略關聯管道刪除行為 | [NEEDS CLARIFICATION] | 當一個策略所關聯的通知管道被刪除時，該策略應如何處理？目前規格要求阻止刪除（409 Conflict），但需確認是否支援「軟刪除」或「自動移除無效管道」的備選方案。 |
| 結構化條件產生器 | [FUTURE] | 編輯策略時應提供結構化條件產生器，取代目前的純字串輸入（FR-S-007），需確認條件語法與支援的事件屬性。 |
| 通知成功率摘要 | [FUTURE] | 歷史頁面應顯示批次/群組成功率摘要（FR-H-010），需確認統計維度（按管道、按策略、按時間段）與更新頻率。 |
| 自動刷新頻率 | [NEEDS CLARIFICATION] | 管道頁每 30 秒、歷史頁每 60 秒自動刷新，需確認對後端與前端效能的影響，以及是否支援使用者自訂刷新間隔。 |
| 管道類型擴展 | [FUTURE] | 需確認未來支援的管道類型範圍（如：Microsoft Teams、Discord、SMS、Voice Call 等），以及 JSON Schema 的擴展機制。 |
| 通知重試機制 | [NEEDS CLARIFICATION] | 除了手動重新發送，是否支援自動重試機制（如：失敗後延遲重試 3 次），以及重試策略的設定方式。 |

---
