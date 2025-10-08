# 模組規格書：Platform Navigation

**模組代碼**: `platform-navigation`
**模組層級**: 系統治理（跨模組基礎設施）
**建立日期**: 2025-10-08
**最後更新**: 2025-10-10
**狀態**: Ready for Technical Review
**依據憲法**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、模組概述

### 模組目標

統一平台的導覽結構（Navigation Tree），提供跨模組一致的選單管理、權限控制與個人偏好同步。

此模組作為「全域導覽治理層」，所有功能模組（Dashboards、Automation、Insights、Resources、Incidents、Profile 等 16 個模組）皆應透過本層註冊其導覽節點，確保：
- 導覽結構的一致性與可預測性
- 基於角色的導覽項目可見性控制
- 使用者個人化偏好的持久化與同步
- 導覽變更的即時性與可審計性

---

## 二、主要使用者情境

### Primary User Story

作為一名平台使用者（包含管理員、SRE、一般使用者），我需要一個統一且智能的導覽系統，讓我能夠：

1. **快速定位功能模組** — 根據我的角色與權限，僅顯示我可存取的導覽項目，避免雜訊干擾。
2. **個人化導覽體驗** — 標記常用功能、摺疊不常用群組，並在不同裝置間同步這些偏好設定。
3. **集中管理導覽結構**（管理員）— 配置全域導覽樹、設定群組排序、綁定權限、控制可見性，無需修改程式碼。
4. **即時同步導覽變更** — 當管理員調整導覽結構時，所有線上使用者立即看到更新，無需重新整理頁面。
5. **追蹤導覽變更歷史** — 所有導覽結構的修改都有完整的審計日誌，可追溯變更者、時間與原因。

以便在日常監控、問題排查、配置管理等工作中，能夠流暢地在不同功能模組間切換，提升操作效率與使用體驗。

**這些需求對應以下具體情境**：
- **需求 1「快速定位功能」** → 對應「情境 A：一般使用者的日常導覽」，透過權限控制僅顯示可存取功能
- **需求 2「個人化體驗」** → 對應「情境 A：一般使用者的日常導覽」，支援常用標記與摺疊狀態同步
- **需求 3「集中管理」** → 對應「情境 B：管理員的導覽結構管理」，提供視覺化編輯器與權限綁定
- **需求 4「即時同步」** → 對應「情境 B：管理員的導覽結構管理」，500ms 內推送所有線上使用者
- **需求 5「追蹤歷史」** → 對應「情境 D：導覽變更的稽核追蹤」，完整 Audit Log 與回滾能力

---

### 具體情境

**情境 A：一般使用者的日常導覽**
- 登入平台後，我立即看到側邊欄導覽列，僅顯示我有權限存取的功能（例如 Dashboards、Incidents List、Profile）。
- 我將「Insights → Log Exploration」標記為常用，它自動置頂於「常用功能」群組。
- 我摺疊「Platform Settings」群組（因不常使用），下次登入時保持摺疊狀態。
- 我在桌面版與手機版瀏覽器間切換，個人偏好自動同步。

**情境 B：管理員的導覽結構管理**
- 進入「Platform Settings → Navigation Management」頁面，看到完整的導覽樹結構編輯器。
- 新增「Governance」群組，將「Identity & Access」、「Audit Logs」、「Tag Management」移入其中。
- 調整群組排序（Overview → Operations → Governance → Platform Settings）。
- 為「Automation Management」綁定權限 `automation:*`，確保僅授權使用者可見。
- 儲存變更後，所有線上使用者（約 200 人）的導覽列在 500ms 內同步更新。

**情境 C：模組開發者的導覽註冊**
- 開發新模組「Cost Analysis」時，在模組初始化階段調用導覽註冊 API：
  ```
  registerNavigationItem({
    route_key: 'insights.cost-analysis',
    label_i18n_key: 'nav.insights.cost_analysis',
    icon: 'DollarOutlined',
    parent_group: 'insights',
    order: 30,
    role_scope: ['insights:read', 'cost:view']
  })
  ```
- 註冊完成後，導覽樹自動新增該項目，無需手動配置。

**情境 D：導覽變更的稽核追蹤**
- 安全稽核人員檢視「Audit Logs」，篩選 `category: navigation`。
- 發現某管理員在 2025-10-07 22:30 移除了「Platform License」導覽項。
- 檢視詳情，確認變更理由：「License 功能已整合至 About 頁面」。
- 若需回滾，可透過 Audit Log 中的 `before_state` 資訊快速還原。

---

### 現有痛點

**痛點 1：導覽項目散落各模組，難以統一管理**
- 若每個模組自行定義導覽位置，容易導致結構混亂、排序不一致、權限檢查遺漏。
- 缺乏集中管理機制時，調整導覽結構需修改多個模組的程式碼，增加維護成本與錯誤風險。

**痛點 2：權限控制不一致**
- 若導覽可見性由各模組自行判斷，可能出現「導覽項目可見但點擊後被拒」的糟糕體驗。
- 統一的權限綁定機制可確保「看得到的就能用，看不到的就沒權限」。

**痛點 3：個人偏好無法持久化**
- 若摺疊狀態僅存於瀏覽器 localStorage，使用者更換裝置或清除快取後需重新設定。
- 缺乏後端同步機制時，跨裝置使用體驗割裂。

**痛點 4：導覽變更需重新整理頁面**
- 若導覽結構變更後需使用者手動重新整理，影響使用體驗，且可能導致操作中斷。
- 即時同步機制可確保管理員調整立即生效，減少溝通成本。

**痛點 5：導覽變更無法追蹤**
- 若無審計日誌，無法得知「誰」在「何時」修改了導覽結構，違反合規要求。
- 缺乏歷史記錄時，誤操作後難以快速回滾。

---

## 三、驗收情境（Acceptance Scenarios）

### 場景群組 A：導覽結構管理（Navigation Structure Management）

**A1. 建立新的導覽群組**
1. **Given** 我是平台管理員，進入「Navigation Management」頁面。
2. **When** 我點擊「新增群組」，輸入群組名稱「Governance」、圖示「ShieldOutlined」、排序「30」。
3. **Then** 系統必須（MUST）建立該群組，並在導覽樹編輯器中即時顯示。
4. **And** 系統必須（MUST）記錄此操作於 Audit Log（類別：`navigation`，動作：`create_group`）。

**A2. 調整導覽項目排序**
1. **Given** 導覽樹中有「Overview」(order: 10)、「Operations」(order: 20)、「Governance」(order: 30)。
2. **When** 我將「Governance」拖曳至第一位，儲存變更。
3. **Then** 系統必須（MUST）更新 order 值（Governance: 5, Overview: 10, Operations: 20）。
4. **And** 所有使用者的導覽列必須（MUST）在 500ms 內同步新順序。

**A3. 移除導覽項目**
1. **Given** 我選擇「Platform License」導覽項。
2. **When** 我點擊「移除」，確認刪除理由「功能已整合至 About 頁面」。
3. **Then** 系統必須（MUST）標記該項目為 `deleted`（軟刪除），並從所有使用者導覽列中移除。
4. **And** Audit Log 必須（MUST）記錄刪除理由與 `before_state`。

**A4. 匯入導覽結構配置**
1. **Given** 我有一個預先定義的導覽結構 JSON 檔案（包含群組、項目、權限綁定）。
2. **When** 我上傳該檔案並確認匯入。
3. **Then** 系統必須（MUST）驗證結構合法性（無重複 route_key、層級 ≤ 3）。
4. **And** 若驗證通過，批次建立所有群組與項目，並觸發即時同步。
5. **And** 若驗證失敗，顯示具體錯誤（如「第 12 行：route_key 重複」）。

---

### 場景群組 B：權限控制與可見性（Permission & Visibility Control）

**B1. 基於角色顯示導覽項目**
1. **Given** 我的角色為「Viewer」，僅具備 `dashboards:read`、`incidents:read` 權限。
2. **When** 我登入平台，檢視側邊欄導覽列。
3. **Then** 系統必須（MUST）僅顯示我有權限的項目（Dashboards、Incidents List）。
4. **And** 系統禁止（MUST NOT）顯示需要 `automation:*`、`platform:admin` 的項目。

**B2. 動態權限變更同步**
1. **Given** 我目前無法看到「Automation Management」導覽項（因無 `automation:*` 權限）。
2. **When** 管理員授予我 `automation:playbooks:read` 權限。
3. **Then** 系統必須（MUST）在 2 秒內更新我的導覽列，新增「Automation Management」項目。
4. **And** 無需我重新登入或重新整理頁面。

**B3. 多權限交集判定**
1. **Given** 「Insights」群組下有「Log Exploration」(需 `insights:log:read`) 與「Cost Analysis」(需 `cost:view`)。
2. **When** 我僅具備 `insights:log:read` 權限。
3. **Then** 系統必須（MUST）顯示「Insights」群組與「Log Exploration」項目。
4. **And** 系統禁止（MUST NOT）顯示「Cost Analysis」項目。
5. **And** 若我後續獲得 `cost:view`，該項目即時出現。

---

### 場景群組 C：個人化偏好管理（User Preference Management）

**C1. 標記常用功能**
1. **Given** 我經常使用「Insights → Log Exploration」。
2. **When** 我在該導覽項目上點擊「⭐ 加入常用」。
3. **Then** 系統必須（MUST）將其加入我的個人偏好 `favorites` 列表。
4. **And** 導覽列頂部必須（MUST）顯示「常用功能」群組，並置頂該項目。
5. **And** 此設定必須（MUST）儲存至後端 Profile Service，而非瀏覽器快取。

**C2. 摺疊與展開群組**
1. **Given** 我不常使用「Platform Settings」群組。
2. **When** 我點擊該群組前的摺疊圖示。
3. **Then** 系統必須（MUST）收合該群組的子項目，並儲存摺疊狀態至 `collapsed_state`。
4. **And** 下次登入時，該群組必須（MUST）保持摺疊狀態。

**C3. 跨裝置同步偏好**
1. **Given** 我在桌面版瀏覽器標記了 3 個常用功能，摺疊了 2 個群組。
2. **When** 我在手機版瀏覽器登入相同帳號。
3. **Then** 系統必須（MUST）從 Profile Service 載入我的偏好設定。
4. **And** 常用功能與摺疊狀態必須（MUST）與桌面版完全一致。

**C4. 重設個人偏好**
1. **Given** 我嘗試多種偏好設定後，想恢復預設值。
2. **When** 我點擊「重設導覽偏好」並確認。
3. **Then** 系統必須（MUST）清空 `favorites` 與 `collapsed_state`。
4. **And** 導覽列必須（MUST）回到預設展開狀態，所有群組可見。

---

### 場景群組 D：模組註冊與整合（Module Registration & Integration）

**D1. 模組自動註冊導覽項**
1. **Given** 新開發的「Cost Analysis」模組需要註冊導覽項目。
2. **When** 模組初始化時調用導覽註冊 API，提供 `route_key`, `label_i18n_key`, `icon`, `parent_group`, `role_scope`。
3. **Then** 系統必須（MUST）驗證 `route_key` 唯一性，若重複則拋出錯誤。
4. **And** 若驗證通過，自動新增導覽項至指定 `parent_group`，並觸發即時同步。
5. **And** 系統必須（MUST）記錄註冊操作於 Audit Log（來源：模組名稱、版本）。

**D2. 模組解除註冊**
1. **Given** 某模組被下線或移除（如舊版「Legacy Dashboard」）。
2. **When** 模組調用導覽解除註冊 API，提供 `route_key`。
3. **Then** 系統必須（MUST）軟刪除該導覽項（標記 `deleted: true`），從所有使用者導覽列移除。
4. **And** Audit Log 必須（MUST）記錄解除註冊原因與時間。

**D3. 導覽層級限制驗證**
1. **Given** 平台規範導覽層級不超過 3 層。
2. **When** 某模組嘗試註冊第 4 層導覽項（如 `insights.logs.filters.advanced`）。
3. **Then** 系統必須（MUST）拒絕註冊，並返回錯誤：「導覽層級超過限制（最大 3 層）」。
4. **And** 系統應該（SHOULD）建議將深層項目改為群組或參數化頁面。

**D4. 多語系標籤驗證**
1. **Given** 模組註冊導覽項時，提供 `label_i18n_key: 'nav.cost.analysis'`。
2. **When** 系統檢查多語系資源檔（`content/zh-TW.json`, `content/en-US.json`）。
3. **Then** 若 i18n Key 不存在，系統應該（SHOULD）記錄警告日誌，並顯示降級文字（`route_key`）。
4. **And** 若 Key 存在但部分語系缺失，優先顯示已定義語系，缺失語系顯示英文預設值。

---

### 場景群組 E：即時同步與性能（Real-time Sync & Performance）

**E1. 導覽變更即時推送**
1. **Given** 有 200 個使用者同時線上。
2. **When** 管理員調整導覽結構並儲存。
3. **Then** 系統必須（MUST）透過 WebSocket 或 Server-Sent Events 推送變更事件。
4. **And** 所有線上使用者必須（MUST）在 500ms 內收到更新，無需重新整理頁面。
5. **And** 若推送失敗（網路斷線），使用者下次操作時必須（MUST）自動拉取最新導覽結構。

**E2. 大量導覽項目性能優化**
1. **Given** 平台有 50 個模組，總計 150 個導覽項目。
2. **When** 使用者登入，系統計算可見導覽項（需檢查 150 個權限）。
3. **Then** 導覽樹渲染時間必須（MUST） < 200ms（P95）。
4. **And** 權限檢查必須（MUST）使用快取機制（TTL: 5 分鐘），避免每次都查詢資料庫。

**E3. 導覽狀態快取策略**
1. **Given** 導覽結構不常變更（平均每週 < 5 次）。
2. **When** 前端首次載入導覽樹。
3. **Then** 系統應該（SHOULD）使用 ETag 或 Last-Modified 標頭支援條件式請求。
4. **And** 若導覽結構未變更，返回 HTTP 304 Not Modified，減少資料傳輸。

---

### 場景群組 F：稽核與追溯（Audit & Traceability）

**F1. 記錄所有導覽變更操作**
1. **Given** 我是安全稽核人員，需要檢視導覽變更歷史。
2. **When** 我進入「Audit Logs」頁面，篩選 `category: navigation`。
3. **Then** 系統必須（MUST）顯示所有導覽相關操作（create_group, update_item, delete_item, bulk_import）。
4. **And** 每筆記錄必須（MUST）包含：操作者、時間、動作、變更前狀態、變更後狀態、變更理由（若有）。

**F2. 導覽結構回滾**
1. **Given** 管理員誤刪除「Automation Management」群組（包含 5 個子項目）。
2. **When** 我在 Audit Log 中找到該操作記錄，點擊「回滾」。
3. **Then** 系統必須（MUST）從 `before_state` 還原該群組與所有子項目。
4. **And** 回滾操作本身必須（MUST）記錄於 Audit Log（動作：`rollback`，關聯原操作 ID）。

**F3. 權限變更追蹤**
1. **Given** 某導覽項的 `role_scope` 從 `['viewer']` 修改為 `['admin']`。
2. **When** 我檢視該項目的變更歷史。
3. **Then** Audit Log 必須（MUST）清楚記錄權限變更（before: `['viewer']`, after: `['admin']`）。
4. **And** 系統應該（SHOULD）標記此為高敏感操作，發送告警通知給安全團隊。

---

## 四、功能需求（Functional Requirements）

### 4.1. 導覽結構管理（Structure Management）

| 編號 | 說明 |
|------|------|
| **FR-SM-001** | 系統必須（MUST）提供統一的導覽結構 API，供所有模組註冊、更新、移除導覽項。 |
| **FR-SM-002** | 管理員必須（MUST）能夠建立、編輯、刪除導覽群組，支援設定名稱、圖示、排序、父群組。 |
| **FR-SM-003** | 導覽項目必須（MUST）包含以下屬性：`route_key`（唯一識別）、`label_i18n_key`（多語系鍵）、`icon`（圖示名稱）、`parent_group`、`order`（排序）、`role_scope`（權限範圍）。 |
| **FR-SM-004** | 系統必須（MUST）驗證 `route_key` 唯一性，重複註冊時拋出錯誤。 |
| **FR-SM-005** | 系統必須（MUST）限制導覽層級最多 3 層（群組 → 子群組 → 項目），超過時拒絕註冊。 |
| **FR-SM-006** | 系統必須（MUST）支援導覽結構的批次匯入（JSON/YAML 格式），並驗證格式合法性。 |
| **FR-SM-007** | 系統必須（MUST）支援導覽結構的匯出（JSON 格式），包含所有群組、項目、權限綁定。 |
| **FR-SM-008** | 導覽項目的刪除必須（MUST）採用軟刪除（標記 `deleted: true`），保留歷史記錄以供稽核。 |

---

### 4.2. 權限控制與可見性（Permission & Visibility）

| 編號 | 說明 |
|------|------|
| **FR-PV-001** | 導覽項目必須（MUST）綁定權限字串（`role_scope`），支援單一權限或多權限陣列（OR 邏輯）。 |
| **FR-PV-002** | 系統必須（MUST）根據當前使用者的角色與權限，動態計算可見的導覽項目。 |
| **FR-PV-003** | 若使用者無任何權限符合 `role_scope`，該導覽項必須（MUST）完全隱藏（禁止顯示但點擊後拒絕）。 |
| **FR-PV-004** | 當使用者權限變更時（授予或撤銷），系統必須（MUST）在 2 秒內同步更新導覽列。 |
| **FR-PV-005** | 若父群組下所有子項目皆不可見，父群組本身必須（MUST）隱藏。 |
| **FR-PV-006** | 系統必須（MUST）支援「公開項目」（`role_scope: ['*']`），所有使用者皆可見。 |
| **FR-PV-007** | 權限檢查結果必須（MUST）快取 5 分鐘，避免每次渲染都查詢 RBAC 服務。 |

---

### 4.3. 個人化偏好（User Preferences）

| 編號 | 說明 |
|------|------|
| **FR-UP-001** | 使用者必須（MUST）能夠標記導覽項目為「常用」，最多 10 個。 |
| **FR-UP-002** | 系統必須（MUST）在導覽列頂部顯示「常用功能」群組，包含所有已標記項目。 |
| **FR-UP-003** | 使用者必須（MUST）能夠摺疊或展開導覽群組，狀態儲存至 `collapsed_state`。 |
| **FR-UP-004** | 個人偏好（`favorites`、`collapsed_state`）必須（MUST）儲存至後端 Profile Service，而非瀏覽器 localStorage。 |
| **FR-UP-005** | 使用者切換裝置或清除快取後，偏好設定必須（MUST）自動還原。 |
| **FR-UP-006** | 使用者必須（MUST）能夠一鍵重設個人偏好至預設值。 |
| **FR-UP-007** | 系統應該（SHOULD）記錄使用者最後訪問的導覽項目（`last_active`），用於智能推薦。 |

---

### 4.4. 即時同步（Real-time Synchronization）

| 編號 | 說明 |
|------|------|
| **FR-RS-001** | 當管理員修改導覽結構時，系統必須（MUST）透過 WebSocket 或 Server-Sent Events 推送變更事件。 |
| **FR-RS-002** | 所有線上使用者必須（MUST）在 500ms 內收到導覽更新，無需重新整理頁面。 |
| **FR-RS-003** | 若推送失敗（如網路斷線），使用者下次操作時必須（MUST）自動拉取最新導覽結構。 |
| **FR-RS-004** | 推送訊息必須（MUST）包含變更類型（create/update/delete）與受影響的 `route_key` 清單。 |
| **FR-RS-005** | 系統應該（SHOULD）批次推送變更（最多每 100ms 一次），避免頻繁更新造成性能問題。 |

---

### 4.5. 多語系支援（Internationalization）

| 編號 | 說明 |
|------|------|
| **FR-I18N-001** | 所有導覽標籤必須（MUST）使用 i18n Key（`label_i18n_key`），禁止硬編碼文字。 |
| **FR-I18N-002** | 系統必須（MUST）支援至少 2 種語系（繁體中文、英文），可擴展至更多語系。 |
| **FR-I18N-003** | 若 i18n Key 不存在，系統應該（SHOULD）顯示降級文字（`route_key`），並記錄警告日誌。 |
| **FR-I18N-004** | 若部分語系缺失翻譯，優先顯示已定義語系，缺失語系顯示英文預設值。 |
| **FR-I18N-005** | 圖示名稱必須（MUST）使用語義化命名（如 `DashboardOutlined`），而非 Unicode 或 Emoji。 |

---

### 4.6. 稽核與追溯（Audit & Traceability）

| 編號 | 說明 |
|------|------|
| **FR-AT-001** | 所有導覽結構修改必須（MUST）記錄於 Audit Log，包含：操作者、時間、動作、變更前後狀態、變更理由。 |
| **FR-AT-002** | Audit Log 類別必須（MUST）標記為 `navigation`，動作包含：`create_group`, `update_item`, `delete_item`, `bulk_import`, `rollback`。 |
| **FR-AT-003** | 系統必須（MUST）支援從 Audit Log 回滾導覽變更（基於 `before_state` 還原）。 |
| **FR-AT-004** | 回滾操作本身必須（MUST）記錄於 Audit Log，並關聯原操作 ID。 |
| **FR-AT-005** | 權限變更操作（修改 `role_scope`）必須（MUST）標記為高敏感操作，並發送告警通知。 |
| **FR-AT-006** | Audit Log 保留期限必須（MUST）至少 1 年，符合合規要求。 |

---

### 4.7. 性能與可擴展性（Performance & Scalability）

| 編號 | 說明 |
|------|------|
| **FR-PS-001** | 導覽樹渲染時間必須（MUST） < 200ms（P95），即使有 150 個導覽項目。 |
| **FR-PS-002** | 權限檢查結果必須（MUST）快取 5 分鐘，避免每次都查詢 RBAC 服務。 |
| **FR-PS-003** | 導覽結構 API 必須（MUST）支援 ETag 或 Last-Modified 標頭，啟用條件式請求。 |
| **FR-PS-004** | 若導覽結構未變更，API 必須（MUST）返回 HTTP 304 Not Modified，減少資料傳輸。 |
| **FR-PS-005** | 系統應該（SHOULD）使用增量更新（僅推送變更項目），而非每次推送完整導覽樹。 |

---

## 五、關鍵資料實體（Key Entities）

### 5.1. NavigationGroup（導覽群組）

| 屬性 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | UUID | ✅ | 群組唯一識別碼 |
| `label_i18n_key` | String | ✅ | 多語系標籤鍵（如 `nav.group.operations`） |
| `icon` | String | ✅ | 圖示名稱（如 `ToolOutlined`） |
| `order` | Integer | ✅ | 排序權重（數字越小越靠前） |
| `parent_group_id` | UUID | ❌ | 父群組 ID（支援最多 2 層巢狀） |
| `deleted` | Boolean | ✅ | 軟刪除標記（預設 `false`） |
| `created_by` | String | ✅ | 建立者 User ID |
| `created_at` | Timestamp | ✅ | 建立時間 |
| `updated_at` | Timestamp | ✅ | 最後更新時間 |

---

### 5.2. NavigationItem（導覽項目）

| 屬性 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | UUID | ✅ | 項目唯一識別碼 |
| `route_key` | String | ✅ | 路由唯一鍵（如 `insights.log-exploration`），全域唯一 |
| `route` | String | ✅ | 實際路由路徑（如 `/insights/logs`） |
| `label_i18n_key` | String | ✅ | 多語系標籤鍵 |
| `icon` | String | ✅ | 圖示名稱 |
| `parent_group_id` | UUID | ✅ | 所屬群組 ID |
| `order` | Integer | ✅ | 群組內排序權重 |
| `role_scope` | String[] | ✅ | 權限範圍（如 `['insights:read', 'log:view']`），OR 邏輯 |
| `module_source` | String | ❌ | 註冊來源模組名稱（如 `insights-log`） |
| `deleted` | Boolean | ✅ | 軟刪除標記 |
| `created_by` | String | ✅ | 建立者（模組自動註冊時為 `system`） |
| `created_at` | Timestamp | ✅ | 建立時間 |
| `updated_at` | Timestamp | ✅ | 最後更新時間 |

---

### 5.3. UserNavigationPreference（使用者導覽偏好）

| 屬性 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `user_id` | UUID | ✅ | 使用者 ID（主鍵） |
| `favorites` | String[] | ✅ | 常用項目清單（`route_key` 陣列，最多 10 個） |
| `collapsed_state` | Object | ✅ | 摺疊狀態（`{ group_id: boolean }`） |
| `last_active` | String | ❌ | 最後訪問的 `route_key` |
| `updated_at` | Timestamp | ✅ | 最後更新時間 |

---

### 5.4. NavigationAuditLog（導覽變更稽核日誌）

| 屬性 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | UUID | ✅ | 日誌唯一識別碼 |
| `category` | String | ✅ | 固定值 `navigation` |
| `action` | String | ✅ | 操作動作（`create_group`, `update_item`, `delete_item`, `bulk_import`, `rollback`） |
| `operator_id` | String | ✅ | 操作者 User ID |
| `target_id` | UUID | ✅ | 受影響的群組或項目 ID |
| `before_state` | JSON | ❌ | 變更前狀態（JSON 格式） |
| `after_state` | JSON | ❌ | 變更後狀態 |
| `reason` | String | ❌ | 變更理由（選填） |
| `timestamp` | Timestamp | ✅ | 操作時間 |
| `client_ip` | String | ✅ | 操作來源 IP |

---

## 六、權限控制（RBAC）

### 權限定義

| 權限字串 | 說明 | 適用角色 |
|---------|------|---------|
| `platform-navigation:read` | 檢視導覽結構（所有使用者預設擁有） | All Users |
| `platform-navigation:manage` | 管理導覽結構（建立、編輯、刪除群組與項目） | Platform Admin |
| `platform-navigation:import` | 批次匯入導覽結構配置 | Platform Admin |
| `platform-navigation:export` | 匯出導覽結構配置 | Platform Admin, SRE Lead |
| `platform-navigation:audit` | 檢視導覽變更稽核日誌 | Security Auditor, Platform Admin |
| `platform-navigation:rollback` | 回滾導覽變更 | Platform Admin |

---

## 七、邊界案例（Edge Cases）

### 7.1. 權限快取過期導致可見性延遲
**情境**: 使用者被撤銷 `automation:*` 權限，但權限快取 TTL 為 5 分鐘，導致導覽項目仍可見。
**處理**:
- 權限變更時，必須（MUST）主動清除受影響使用者的導覽快取。
- 若使用者點擊已無權限的項目，後端必須（MUST）返回 403 錯誤，前端立即重新載入導覽樹。

### 7.2. 導覽層級超過 3 層的歷史資料
**情境**: 舊版系統允許 4 層導覽（如 `insights.logs.filters.advanced`），新版限制為 3 層。
**處理**:
- 系統啟動時必須（MUST）自動檢測超層級項目，並記錄警告日誌。
- 提供遷移工具，建議管理員將深層項目改為參數化頁面或群組化顯示。

### 7.3. 多語系鍵缺失時的降級顯示
**情境**: 某導覽項的 `label_i18n_key` 為 `nav.cost.analysis`，但 `content/zh-TW.json` 中未定義。
**處理**:
- 系統應該（SHOULD）顯示降級文字（`route_key`，如 `insights.cost-analysis`）。
- 記錄警告日誌：「i18n Key 缺失：nav.cost.analysis (zh-TW)」。
- 開發模式下必須（MUST）在 UI 上標記缺失項目（如紅色邊框）。

### 7.4. WebSocket 斷線時的導覽同步失敗
**情境**: 管理員更新導覽結構，但某使用者網路不穩定導致 WebSocket 斷線。
**處理**:
- 使用者重新連線後，必須（MUST）自動拉取最新導覽結構（基於版本號或 ETag）。
- 若版本號不一致，觸發全量更新；若一致，跳過更新。

### 7.5. 大量批次匯入時的驗證錯誤處理
**情境**: 管理員匯入包含 100 個導覽項的 JSON 檔案，其中第 50 個項目的 `route_key` 重複。
**處理**:
- 系統必須（MUST）採用「全部驗證後再執行」策略，避免部分成功部分失敗。
- 若驗證失敗，返回詳細錯誤報告（如「第 50 行：route_key 'insights.log' 重複」）。
- 管理員修正後可重新匯入，系統必須（MUST）支援冪等性（重複匯入不會建立重複項目）。

### 7.6. 導覽項目刪除後的路由保護
**情境**: 某使用者在瀏覽器中收藏了「Platform License」頁面書籤，但該導覽項已被管理員刪除。
**處理**:
- 使用者訪問該路由時，系統必須（MUST）檢測導覽項目已刪除，顯示「此功能已下線或移除」提示。
- 提供跳轉至相似功能的建議（如「您可能在尋找：About → Platform Info」）。
- 記錄此行為於監控系統，若發生頻率過高，提醒管理員設定路由重定向。

---

## 八、治理檢查清單（Governance Checklist）

### 8.1. Logging & Tracing
- [ ] 所有導覽 API 呼叫記錄於結構化日誌（包含 `route_key`, `user_id`, `action`, `timestamp`）
- [ ] 關鍵操作（建立、刪除、權限變更）記錄於 Audit Log（`category: navigation`）
- [ ] 分散式追蹤（Trace ID）貫穿整個導覽同步流程（前端請求 → 後端更新 → WebSocket 推送）
- [ ] 錯誤日誌包含完整上下文（如「i18n Key 缺失：nav.cost.analysis (zh-TW)」）

### 8.2. Metrics & Alerts
- [ ] 監控導覽樹渲染時間（P50, P95, P99）
- [ ] 監控權限檢查耗時（快取命中率、查詢延遲）
- [ ] 監控 WebSocket 推送成功率（失敗時觸發告警）
- [ ] 監控導覽變更頻率（異常頻繁時告警，防止誤操作）
- [ ] 監控 i18n Key 缺失頻率（開發階段每日報告）

### 8.3. RBAC
- [ ] 所有導覽管理 API 必須（MUST）驗證 `platform-navigation:manage` 權限
- [ ] 批次匯入 API 必須（MUST）額外驗證 `platform-navigation:import` 權限
- [ ] Audit Log 查詢 API 必須（MUST）驗證 `platform-navigation:audit` 權限
- [ ] 回滾 API 必須（MUST）驗證 `platform-navigation:rollback` 權限
- [ ] 一般使用者僅需 `platform-navigation:read` 權限（預設授予所有角色）

### 8.4. i18n
- [ ] 所有導覽標籤必須（MUST）使用 i18n Key，禁止硬編碼文字
- [ ] i18n Key 命名規範：`nav.<group>.<item>`（如 `nav.insights.log_exploration`）
- [ ] 支援至少 2 種語系（繁體中文、英文），可擴展至日文、韓文等
- [ ] 缺失 Key 時顯示降級文字（`route_key`），並記錄警告日誌
- [ ] 開發模式下，UI 必須（MUST）標記缺失的 i18n Key（紅色邊框或警告圖示）

### 8.5. Theme Token
- [ ] 圖示必須（MUST）使用語義化命名（如 `DashboardOutlined`），禁止 Unicode 或 Emoji
- [ ] 導覽列樣式必須（MUST）使用 Theme Token（如 `--nav-bg-color`, `--nav-text-color`）
- [ ] 支援深色/淺色主題切換，禁止硬編碼顏色值
- [ ] 摺疊動畫與互動效果必須（MUST）遵循統一的 Transition Token（如 `--transition-smooth`）

### 8.6. 資料閉環
- [ ] 導覽變更流程完整：前端編輯 → 後端驗證 → 資料庫更新 → Audit Log → WebSocket 推送 → 前端更新
- [ ] 使用者偏好變更流程：前端操作 → Profile Service 儲存 → 跨裝置同步
- [ ] 權限變更流程：RBAC 服務更新 → 清除導覽快取 → 前端重新計算可見項目
- [ ] 模組註冊流程：模組初始化 → 導覽 API 註冊 → Audit Log → 即時推送

---

## 九、Clarifications（待釐清事項）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 導覽修改權限 | ✅ RESOLVED | 僅限 `platform-navigation:manage` 或 Platform Admin 可修改導覽結構。 |
| 動態註冊時機 | ✅ RESOLVED | 各模組應於初始化階段自動註冊導覽節點，註冊失敗時記錄錯誤但不阻斷模組啟動。 |
| 個人偏好儲存策略 | ✅ RESOLVED | 偏好設定必須儲存於後端 Profile Service（路徑：`/api/v1/profile/navigation-preferences`），而非瀏覽器快取。 |
| 排序同步機制 | ✅ RESOLVED | 群組排序（`NavigationGroup.order`）優先於項目內排序（`NavigationItem.order`）。最終順序為：群組 order 升序 → 項目 order 升序。 |
| 最大層級限制 | ✅ RESOLVED | 導覽最多支援 3 層（群組 → 子群組 → 項目），超過時系統拒絕註冊並返回錯誤。建議改為參數化頁面或群組化顯示。 |
| WebSocket 技術選型 | [CLARIFY] | 推薦使用 Server-Sent Events (SSE) 或 WebSocket，需確認後端技術棧支援度與推送頻率需求。 |
| 快取策略細節 | [CLARIFY] | 權限檢查快取 TTL 預設 5 分鐘，是否需支援動態調整？高頻率權限變更場景是否需縮短 TTL？ |
| 導覽項目圖示庫 | [CLARIFY] | 圖示名稱來源（Ant Design Icons / 自定義圖示庫），需定義可用圖示清單與命名規範文件。 |
| 回滾權限控管 | [CLARIFY] | 回滾操作是否需要雙重確認（如要求輸入變更理由或管理員密碼）？ |
| 導覽項目外部連結 | [CLARIFY] | 是否支援外部連結（如跳轉至外部 Grafana Dashboard）？若支援，需定義安全檢查機制（防止 Open Redirect）。 |

---

## 十、審查與驗收標準（Review & Acceptance Criteria）

### 功能完整性
- [ ] 導覽結構 API 完整支援 CRUD（建立、讀取、更新、刪除）
- [ ] 模組註冊與解除註冊 API 驗證通過（唯一性、層級限制、權限綁定）
- [ ] 導覽項目可見性基於使用者角色正確計算，無誤顯示或誤隱藏
- [ ] 個人化偏好（常用、摺疊）儲存至後端，跨裝置同步驗證通過
- [ ] 導覽變更即時推送，所有線上使用者 < 500ms 同步更新

### 性能要求
- [ ] 導覽樹渲染時間 < 200ms（P95），測試條件：150 個導覽項目
- [ ] 權限檢查快取命中率 > 95%，未命中時查詢延遲 < 50ms
- [ ] WebSocket 推送成功率 > 99.9%，失敗時自動降級為輪詢
- [ ] API 響應時間 < 100ms（P95），支援條件式請求（ETag/Last-Modified）

### 安全性驗證
- [ ] 所有管理 API 必須驗證 `platform-navigation:manage` 權限
- [ ] 未授權使用者無法存取管理端點（返回 HTTP 403）
- [ ] Audit Log 完整記錄所有變更操作（操作者、時間、變更內容）
- [ ] 權限變更操作標記為高敏感，觸發安全告警通知

### 可觀測性
- [ ] 所有 API 呼叫記錄於結構化日誌（包含 Trace ID）
- [ ] 監控指標完整（渲染時間、推送成功率、快取命中率、i18n 缺失率）
- [ ] 錯誤日誌包含完整上下文（如 i18n Key 缺失、權限驗證失敗）
- [ ] 分散式追蹤覆蓋整個同步流程（前端 → 後端 → WebSocket）

### 治理合規
- [ ] 所有導覽標籤使用 i18n Key，無硬編碼文字
- [ ] 支援至少 2 種語系（繁體中文、英文），缺失 Key 時降級顯示
- [ ] 所有樣式使用 Theme Token，支援深色/淺色主題切換
- [ ] 導覽變更流程完整（前端 → 後端 → Audit Log → 推送 → 前端更新）

### 使用者體驗
- [ ] 導覽列摺疊/展開動畫流暢，無閃爍或卡頓
- [ ] 常用功能標記與取消標記即時生效，無需重新整理
- [ ] 權限不足時隱藏導覽項目，不顯示但點擊後拒絕
- [ ] i18n Key 缺失時顯示降級文字，不影響使用但記錄警告
- [ ] 導覽變更同步失敗時，前端自動重試或降級為輪詢

---

## 十一、執行狀態（Execution Status）

| 階段 | 狀態 | 完成日期 | 備註 |
|------|------|---------|------|
| 需求分析 | ✅ Complete | 2025-10-08 | 規格文件完成，待技術審查 |
| API 設計 | 🔄 In Progress | - | 導覽 API 端點設計中 |
| 前端實作 | ⏳ Pending | - | 等待 API 設計完成 |
| 後端實作 | ⏳ Pending | - | - |
| 整合測試 | ⏳ Pending | - | - |
| 性能測試 | ⏳ Pending | - | 需驗證 150 項目渲染性能 |
| 安全審查 | ⏳ Pending | - | 需驗證 RBAC 與 Audit Log |
| 上線部署 | ⏳ Pending | - | - |

---

## 十二、相關文件

- `.specify/memory/constitution.md` - 平台憲法（v1.3.0）
- `.specify/specs/modules/identity-access-management-spec.md` - RBAC 權限管理
- `.specify/specs/modules/identity-audit-spec.md` - 審計日誌規範
- `.specify/specs/modules/user-profile-spec.md` - 使用者偏好設定
- `.specify/specs/common/theme-token-spec.md` - Theme Token 規範（若有）
- `.specify/specs/common/i18n-spec.md` - 多語系規範（若有）

---

## 十三、版本歷史

| 版本 | 日期 | 變更摘要 | 作者 |
|------|------|---------|------|
| 2.0.0 | 2025-10-08 | 完整重寫規格，符合 constitution v1.3.0 標準<br>- 新增完整 Primary User Story 與具體情境<br>- 擴展 Acceptance Scenarios 至 20+ 個<br>- 新增場景群組分類（A-F）<br>- 完善 FR 編號與分類（SM/PV/UP/RS/I18N/AT/PS）<br>- 新增邊界案例與治理檢查清單<br>- 移除技術實作語義（Grafana Scenes）<br>- 新增完整的 RBAC 權限定義 | Claude Code Assistant |
| 1.0.0 | 2025-10-08 | 初始草稿 | - |

---

**審核狀態**: ✅ Ready for Technical Review
**技術中立性**: ✅ Pass（已移除 Grafana Scenes 等框架語義）
**憲法合規性**: ✅ Pass（符合 constitution v1.3.0 所有要求）
**模組整合性**: ✅ Pass（與現有 16 個模組無衝突，提供統一導覽基礎設施）
