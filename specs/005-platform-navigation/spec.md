# Feature Specification: Platform Navigation

**Created**: 2025-10-08
**Status**: Ready for Technical Review
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 使用者情境與測試 *(mandatory)*

### Primary User Story
作為一名平台使用者（包含管理員、SRE、一般使用者），我需要一個統一且智能的導覽系統，讓我能夠：
1. **快速定位功能模組** — 根據我的角色與權限，僅顯示我可存取的導覽項目。
2. **個人化導覽體驗** — 標記常用功能、摺疊不常用群組，並在不同裝置間同步偏好。
3. **集中管理導覽結構**（管理員）— 配置全域導覽樹、設定群組排序、綁定權限，無需修改程式碼。
4. **即時同步導覽變更** — 當管理員調整導覽結構時，所有線上使用者立即看到更新。
5. **追蹤導覽變更歷史** — 所有導覽結構的修改都有完整的審計日誌，可供追溯與回滾。

**這些需求對應以下具體情境**：
- **需求 1 & 2** → 對應「情境 A：一般使用者的日常導覽」
- **需求 3 & 4** → 對應「情境 B：管理員的導覽結構管理」
- **需求 5** → 對應「情境 D：導覽變更的稽核追蹤」

### 具體情境

**情境 A：一般使用者的日常導覽**
- 登入後，側邊欄僅顯示我有權限存取的功能。
- 我將「Insight → Log Exploration」標記為常用，它自動置頂於「常用功能」群組。
- 我摺疊不常用的「Platform Settings」群組，此設定在跨裝置登入時保持同步。

**情境 B：管理員的導覽結構管理**
- 進入「Navigation Management」頁面，使用視覺化編輯器調整導覽樹。
- 新增「Governance」群組，將「Identity & Access」、「Audit Logs」移入其中。
- 為「Automation Management」綁定 `automation:*` 權限。
- 儲存變更後，所有線上使用者的導覽列在 500ms 內同步更新。

**情境 C：模組開發者的導覽註冊**
- 開發新模組「Cost Analysis」時，調用導覽註冊 API，提供 `route_key`, `label_i18n_key`, `icon`, `parent_group`, `role_scope`。
- 註冊完成後，導覽樹自動新增該項目，無需手動配置。

**情境 D：導覽變更的稽核追蹤**
- 安全稽核人員在「Audit Logs」中篩選 `category: navigation`，發現某管理員移除了「Platform License」導覽項。
- 檢視詳情，確認變更理由，並在必要時根據 `before_state` 資訊進行回滾。

### Acceptance Scenarios

### 場景群組 A：導覽結構管理 (4 個)
1. **Given** 我是管理員, **When** 我新增一個名為「Governance」的導覽群組, **Then** 該群組必須在編輯器中即時顯示。
2. **Given** 導覽樹中有多個群組, **When** 我拖曳調整群組順序並儲存, **Then** 所有使用者的導覽列必須在 500ms 內同步新順序。
3. **Given** 我選擇一個導覽項, **When** 我點擊「移除」並確認, **Then** 系統必須軟刪除該項目並從所有使用者導覽列移除。
4. **Given** 我有一個導覽結構 JSON 檔案, **When** 我上傳並匯入, **Then** 系統必須驗證結構並批次建立所有群組與項目。

### 場景群組 B：權限控制與可見性 (3 個)
5. **Given** 我的角色僅具備 `dashboards:read` 權限, **When** 我登入平台, **Then** 導覽列必須僅顯示我有權限的項目。
6. **Given** 我目前無法看到「Automation」導覽項, **When** 管理員授予我 `automation:*` 權限, **Then** 導覽列必須在 2 秒內同步更新，顯示「Automation」項目。
7. **Given** 「Insight」群組下有「Logs」(需 `insight:log:read`) 與「Cost」(需 `cost:view`), **When** 我僅具備 `insight:log:read` 權限, **Then** 我必須能看到「Insight」群組與「Logs」項目，但看不到「Cost」項目。

### 場景群組 C：個人化偏好管理 (4 個)
8. **Given** 我經常使用「Log Exploration」, **When** 我點擊「⭐ 加入常用」, **Then** 該項目必須出現在「常用功能」群組頂部。
9. **Given** 我不常使用「Platform Settings」群組, **When** 我摺疊該群組, **Then** 下次登入時它必須保持摺疊狀態。
10. **Given** 我在桌面版設定了偏好, **When** 我在手機版登入, **Then** 常用功能與摺疊狀態必須完全一致。
11. **Given** 我想恢復預設設定, **When** 我點擊「重設導覽偏好」, **Then** 導覽列必須回到預設展開狀態。

### 場景群組 D：模組註冊與整合 (3 個)
12. **Given** 新模組「Cost Analysis」初始化, **When** 它調用導覽註冊 API, **Then** 導覽樹應自動新增該項目。
13. **Given** 某模組被下線, **When** 它調用解除註冊 API, **Then** 導覽項應被軟刪除。
14. **Given** 模組嘗試註冊第 4 層導覽項, **When** 系統驗證, **Then** 註冊必須被拒絕並返回錯誤。

### 場景群組 E：即時同步與性能 (3 個)
15. **Given** 200 個使用者同時線上, **When** 管理員儲存導覽變更, **Then** 所有使用者必須在 500ms 內收到更新。
16. **Given** 平台有 150 個導覽項目, **When** 使用者登入, **Then** 導覽樹渲染時間必須 < 200ms。
17. **Given** 導覽結構未變更, **When** 前端請求導覽 API, **Then** 應返回 HTTP 304 Not Modified。

### 場景群組 F：稽核與追溯 (3 個)
18. **Given** 我是稽核人員, **When** 我篩選 `category: navigation` 的稽核日誌, **Then** 我必須能看到所有導覽變更操作的完整記錄。
19. **Given** 管理員誤刪除一個群組, **When** 我在稽核日誌中找到該操作並點擊「回滾」, **Then** 系統必須還原該群組與其所有子項目。
20. **Given** 某導覽項的權限從 `viewer` 修改為 `admin`, **When** 我檢視稽核日誌, **Then** 我必須能看到 `before_state` 與 `after_state` 的權限差異。

---

## 功能需求 *(mandatory)*

### 2.1. 結構管理 (Structure Management)
- **FR-SM-001**: 系統必須（MUST）提供統一的導覽結構 API，供所有模組註冊、更新、移除導覽項。
- **FR-SM-002**: 管理員必須（MUST）能夠 CRUD 導覽群組，支援設定名稱、圖示、排序。
- **FR-SM-003**: 系統必須（MUST）限制導覽層級最多 3 層。

### 2.2. 權限與可見性 (Permission & Visibility)
- **FR-PV-001**: 導覽項目必須（MUST）綁定權限字串（`role_scope`）。
- **FR-PV-002**: 系統必須（MUST）根據使用者權限動態計算可見導覽項目。

### 2.3. 個人偏好 (User Preferences)
- **FR-UP-001**: 使用者必須（MUST）能夠標記常用功能和摺疊群組。
- **FR-UP-002**: 個人偏好必須（MUST）儲存至後端 Profile Service，並跨裝置同步。

### 2.4. 即時同步 (Real-time Synchronization)
- **FR-RS-001**: 導覽結構變更必須（MUST）透過 WebSocket 或 SSE 即時推送給所有線上使用者。

### 2.5. 多語系支援 (Internationalization)
- **FR-I18N-001**: 所有導覽標籤必須（MUST）使用 i18n Key。

### 2.6. 稽核與追溯 (Audit & Traceability)
- **FR-AT-001**: 所有導覽結構修改必須（MUST）記錄於 Audit Log。
- **FR-AT-002**: 系統必須（MUST）支援從 Audit Log 回滾導覽變更。

### 2.7. 性能 (Performance)
- **FR-P-001**: 導覽樹渲染時間必須（MUST） < 200ms（P95）。
- **FR-P-002**: 權限檢查結果必須（MUST）快取 5 分鐘。

---

{{specs/common.md}}

---

## 成功標準 *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可以在 30 秒內自訂並儲存導航配置
- **SC-002**: 頁面載入時間低於 500 毫秒，支援 100+ 個導航項目
- **SC-003**: 95% 的使用者能在首次使用中成功找到所需功能

---

## 模糊與待確認事項 *(如果有的話)*

- **WebSocket 技術選型**: ✅ RESOLVED : 推薦使用 Server-Sent Events (SSE)，因其單向通信模型更適合此場景。
- **快取策略細節**: ✅ RESOLVED : 權限檢查快取 TTL 為 5 分鐘，但權限變更時會主動清除相關快取。
- **導覽項目圖示庫**: ✅ RESOLVED : 使用 Ant Design Icons，圖示名稱直接對應其元件名稱。
- **回滾權限控管**: ✅ RESOLVED : 回滾操作需要雙重確認（輸入變更理由 + 對比變更前後差異）。
- **導覽項目外部連結**: ✅ RESOLVED : 支援外部連結，但需在後端設定白名單，防止 Open Redirect 漏洞。