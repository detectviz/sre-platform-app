# 剩餘待處理項目清單 (Remaining NEEDS CLARIFICATION)

**統計日期**: 2025-10-07
**總數**: 78 項
**已解決**: 78 項 ✅
**剩餘**: 0 項

---

## 執行摘要

🎉 **所有 78 項 NEEDS CLARIFICATION 已全數解決!**

### 解決統計

| 階段 | 項目數 | 解決方式 | 參考文件 |
|------|--------|----------|----------|
| **第一階段** | 15 項 | 前端 UI/UX 決策 | 各模組 SPEC |
| **第二階段** | 21 項 | 前端 UI/UX 決策 (Component/Common) | `_resolution-plan-phase2.md` |
| **第三階段** | 42 項 | 後端參數 (32) + 跨域協作 (10) | `_backend-parameters-spec.md`, `_collaboration-spec.md` |

---

## 一、第一階段: 前端 UI/UX 決策 (15 項) ✅

| # | 項目 | 所屬檔案 | 解決方式 |
|---|------|----------|----------|
| 1 | 巢狀 Modal 層級限制 | modal-interaction-pattern.md | 前端決策: 最大 2 層,第 3 層改用 Drawer |
| 2 | 虛擬滾動方案選擇 | table-design-system.md | 前端決策: react-window |
| 3 | 軟刪除與硬刪除 UI | crud-base-requirements.md | 前端決策: Checkbox vs 輸入確認 |
| 4 | 權限選擇器 UI | identity-role-spec.md | 前端決策: 樹狀結構 + 分組 |
| 5 | 事件狀態變更提示 | incidents-list-spec.md | 前端決策: Toast + 時間軸 |
| 6 | 策略衝突提示 | notification-strategy-spec.md | 前端決策: Alert + 色點 |
| 7 | 拓撲圖更新提示 | resources-topology-spec.md | 前端決策: 狀態指示器 + 置信度 |
| 8 | 容量預測展示 | insights-capacity-spec.md | 前端決策: ECharts + 星級 |
| 9 | SSO 登入 UI | platform-auth-spec.md | 前端決策: 主輔結構 + 降級 |
| 10 | 敏感資料遮罩 | resources-datasource-spec.md | 前端決策: Password/Token/Key |
| 11 | RBAC 權限繼承 UI | identity-team-spec.md | 前端決策: 階層圖示 + Tooltip |
| 12 | 資料源連線測試 UI | resources-datasource-spec.md | 前端決策: 模態框 + 步驟檢查 |
| 13 | Grafana 嵌入防 XSS | platform-grafana-spec.md | 前端決策: iframe sandbox + CSP |
| 14 | 日誌查詢優化提示 | insights-log-spec.md | 前端決策: 分析器 + 建議 |
| 15 | 劇本執行流程可視化 | automation-playbook-spec.md | 前端決策: 流程圖 + 狀態動畫 |

---

## 二、第二階段: Component/Common 規範 (21 項) ✅

### 2.1 Component SPECs (16 項)

#### Modal 元件 (2 項)
- ✅ **巢狀模態框的顯示優先級** → 參見 `modal-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.1.1
- ✅ **模態框內容的生命週期管理** → 參見 `modal-spec.md` § 6 與 `_resolution-plan-phase2.md` § 1.1.2

#### ColumnSettingsModal 元件 (2 項)
- ✅ **欄位設定的儲存位置** → 參見 `column-settings-modal-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.2.1
- ✅ **欄位排序的持久化策略** → 參見 `column-settings-modal-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.2.2

#### Toolbar 元件 (2 項)
- ✅ **批次操作的權限控制機制** → 參見 `toolbar-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.3.1
- ✅ **工具列響應式佈局** → 參見 `toolbar-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.3.2

#### Drawer 元件 (2 項)
- ✅ **多層抽屜的堆疊管理機制** → 參見 `drawer-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.4.1
- ✅ **抽屜內容的預載入策略** → 參見 `drawer-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.4.2

#### Pagination 元件 (2 項)
- ✅ **分頁資訊的持久化** → 參見 `pagination-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.5.1
- ✅ **大資料量時的分頁策略** → 參見 `pagination-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.5.2

#### UnifiedSearchModal 元件 (2 項)
- ✅ **篩選條件格式統一機制** → 參見 `unified-search-modal-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.6.1
- ✅ **進階搜尋支援範圍** → 參見 `unified-search-modal-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.6.2

#### QuickFilterBar 元件 (2 項)
- ✅ **快速篩選與進階搜尋的整合方式** → 參見 `quick-filter-bar-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.7.1
- ✅ **篩選狀態的 URL 同步機制** → 參見 `quick-filter-bar-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.7.2

#### TableContainer 元件 (2 項)
- ✅ **表格高度的自適應策略** → 參見 `table-container-spec.md` § 4 與 `_resolution-plan-phase2.md` § 1.8.1
- ✅ **虛擬滾動的觸發條件** → 參見 `table-container-spec.md` § 5 與 `_resolution-plan-phase2.md` § 1.8.2

### 2.2 Common SPECs (3 項)

- ✅ **表格固定列支援需求** → 參見 `table-design-system.md` § 14 與 `_resolution-plan-phase2.md` § 2.1.1
- ✅ **行內編輯統一實作方式** → 參見 `table-design-system.md` § 14 與 `_resolution-plan-phase2.md` § 2.1.2
- ✅ **Modal 內表單的自動儲存草稿機制** → 參見 `modal-interaction-pattern.md` § 9 與 `_resolution-plan-phase2.md` § 2.2

### 2.3 Module SPECs (2 項)

- ✅ **語言切換的即時生效範圍** → 參見 `profile-preference-spec.md` § 5 與 `_resolution-plan-phase2.md` § 3.1
- ✅ **主題色變更的即時生效機制** → 參見 `platform-layout-spec.md` § 6 與 `_resolution-plan-phase2.md` § 3.2

---

## 三、第三階段: 後端參數 API 規範 (32 項) ✅

**集中定義於**: `_backend-parameters-spec.md`

### 3.1 認證與金鑰管理 (4 項)

| # | 項目 | 關聯模組 | API 端點 | 規範章節 |
|---|------|----------|----------|----------|
| 1 | SMTP 認證金鑰管理 | platform-mail-spec.md | `GET /api/v1/config/mail/encryption` | § 1.1 |
| 2 | 渠道認證金鑰管理 | notification-channel-spec.md | `GET /api/v1/channels/:id/credentials` | § 1.2 |
| 3 | 授權檔案簽章驗證 | platform-license-spec.md | `POST /api/v1/license/verify` | § 1.3 |
| 4 | MFA 恢復碼生成 | profile-security-spec.md | `POST /api/v1/users/me/mfa/recovery-codes` | § 1.4 |

### 3.2 資料保留與歸檔 (7 項)

| # | 項目 | 關聯模組 | API 端點 | 規範章節 |
|---|------|----------|----------|----------|
| 5 | 執行歷史保留時長 | automation-history-spec.md | `GET /api/v1/config/retention/execution-logs` | § 2.1 |
| 6 | 審計日誌保留時長 | identity-audit-spec.md | `GET /api/v1/config/retention/audit-logs` | § 2.2 |
| 7 | 日誌資料保留策略 | insights-log-spec.md | `GET /api/v1/config/retention/logs` | § 2.3 |
| 8 | 過期靜音規則清理 | incidents-silence-spec.md | `GET /api/v1/config/retention/silence-rules` | § 2.4 |
| 9 | 通知歷史保留時長 | notification-history-spec.md | `GET /api/v1/config/retention/notifications` | § 2.5 |
| 10 | 發現結果保留時長 | resources-auto-discovery-spec.md | `GET /api/v1/config/retention/discovery-results` | § 2.6 |
| 11 | 資源指標更新頻率 | resources-list-spec.md | `GET /api/v1/config/metrics/update-interval` | § 2.7 |

### 3.3 並行與限流 (6 項)

| # | 項目 | 關聯模組 | API 端點 | 規範章節 |
|---|------|----------|----------|----------|
| 12 | 郵件發送速率限制 | platform-mail-spec.md | `GET /api/v1/config/rate-limits/email` | § 3.1 |
| 13 | 回測任務並行數限制 | insights-backtesting-spec.md | `GET /api/v1/config/concurrency/backtesting` | § 3.2 |
| 14 | 日誌查詢並行數與逾時 | insights-log-spec.md | `GET /api/v1/config/concurrency/log-query` | § 3.3 |
| 15 | 劇本並行執行限制 | automation-playbook-spec.md | `GET /api/v1/config/concurrency/playbooks` | § 3.4 |
| 16 | 觸發器並行執行數限制 | automation-trigger-spec.md | `GET /api/v1/config/concurrency/triggers` | § 3.5 |
| 17 | 自動發現並行任務數上限 | resources-auto-discovery-spec.md | `GET /api/v1/config/concurrency/discovery` | § 3.6 |

### 3.4 權限與隔離 (6 項)

| # | 項目 | 關聯模組 | API 端點 | 規範章節 |
|---|------|----------|----------|----------|
| 18 | 敏感資訊脫敏規則 | automation-history-spec.md | `GET /api/v1/config/security/masking-rules` | § 4.1 |
| 19 | 敏感操作定義與告警 | identity-audit-spec.md | `GET /api/v1/config/security/sensitive-operations` | § 4.2 |
| 20 | 歷史資料存取權限 | insights-backtesting-spec.md | `GET /api/v1/config/security/backtesting-permissions` | § 4.3 |
| 21 | 團隊資源隔離機制 | identity-team-spec.md | `GET /api/v1/config/security/team-isolation` | § 4.4 |
| 22 | 嵌入儀表板權限控制 | platform-grafana-spec.md | `GET /api/v1/config/security/embedded-dashboards` | § 4.5 |
| 23 | SSO 整合身份同步 | identity-personnel-spec.md | `GET /api/v1/config/sso/sync-config` | § 4.6 |

### 3.5 業務規則 (9 項)

| # | 項目 | 關聯模組 | API 端點 | 規範章節 |
|---|------|----------|----------|----------|
| 24 | 通知偏好優先級與繼承 | profile-preference-spec.md | `GET /api/v1/config/notifications/preference-hierarchy` | § 5.1 |
| 25 | 靜音規則與告警規則優先級 | incidents-silence-spec.md | `GET /api/v1/config/incidents/rule-priority` | § 5.2 |
| 26 | 群組成員數量上限 | resources-group-spec.md | `GET /api/v1/config/resources/group-limits` | § 5.3 |
| 27 | 動態群組支援 | resources-group-spec.md | `GET /api/v1/config/resources/dynamic-groups` | § 5.4 |
| 28 | 授權限制強制執行 | platform-license-spec.md | `GET /api/v1/config/license/enforcement` | § 5.5 |
| 29 | 標籤策略驗證 | platform-tag-spec.md | `GET /api/v1/config/tags/validation-rules` | § 5.6 |
| 30 | 標籤值命名規範 | platform-tag-spec.md | `GET /api/v1/config/tags/naming-rules` | § 5.7 |
| 31 | 資源狀態判定邏輯 | resources-list-spec.md | `GET /api/v1/config/resources/status-rules` | § 5.8 |
| 32 | 規則觸發冷卻時間 | incidents-alert-spec.md | `GET /api/v1/config/incidents/cooldown` | § 5.9 |

---

## 四、第三階段: 跨域協作規範 (10 項) ✅

**集中定義於**: `_collaboration-spec.md`

| # | 項目 | 關聯檔案 | 前端職責 | 後端職責 | 規範章節 |
|---|------|----------|----------|----------|----------|
| 1 | Drawer 預載入策略與快取 | modal-interaction-pattern.md | 觸發時機、快取策略 | 提供預載入 API、Cache Headers | § 1 |
| 2 | Modal 關閉動畫允許重開 | modal-interaction-pattern.md | 動畫狀態管理、事件隊列 | - | § 2 |
| 3 | KPI 更新頻率 | resources-discovery-spec.md | 輪詢間隔、UI 刷新 | 設定 Cache TTL | § 3 |
| 4 | 趨勢圖資料粒度 | resources-discovery-spec.md | 時間範圍選擇 | 資料聚合策略 | § 4 |
| 5 | 儀表板權限繼承 | dashboards-list-spec.md | 權限 UI 顯示 | RBAC 繼承邏輯 | § 5 |
| 6 | 儀表板版本控制 | dashboards-list-spec.md | 版本 UI、比較功能 | 版本儲存、Diff API | § 6 |
| 7 | 子團隊權限繼承 | identity-team-spec.md | 階層圖示、權限預覽 | 繼承計算邏輯 | § 7 |
| 8 | 批次操作數量上限 | resources-list-spec.md | UI 限制提示 | API 限制驗證 | § 8 |
| 9 | 通知重試策略 | notification-history-spec.md | 重試狀態顯示 | 指數退避邏輯 | § 9 |
| 10 | 觸發器防抖時間窗口 | automation-trigger-spec.md | UI 配置輸入 | 防抖邏輯實作 | § 10 |

---

## 五、文件更新狀態

### 5.1 中央規範文件 (已完成)

| 文件 | 狀態 | 包含項目 | 建立日期 |
|------|------|----------|----------|
| `_resolution-plan-phase2.md` | ✅ | 21 項第二階段決策 | 2025-10-06 |
| `_api-contract-spec.md` | ✅ | API 設計總規範 | 2025-10-07 |
| `_backend-parameters-spec.md` | ✅ | 32 項後端參數 API | 2025-10-07 |
| `_collaboration-spec.md` | ✅ | 10 項跨域協作 | 2025-10-07 |
| `_mock-server-setup.md` | ✅ | MSW + OpenTelemetry | 2025-10-07 |

### 5.2 個別 SPEC 更新狀態

#### 已完成更新 (12 個)
- ✅ `components/modal-spec.md`
- ✅ `components/column-settings-modal-spec.md`
- ✅ `components/toolbar-spec.md`
- ✅ `components/drawer-spec.md`
- ✅ `components/pagination-spec.md`
- ✅ `components/unified-search-modal-spec.md`
- ✅ `components/quick-filter-bar-spec.md`
- ✅ `components/table-container-spec.md`
- ✅ `common/table-design-system.md`
- ✅ `common/modal-interaction-pattern.md`
- ✅ `modules/profile-preference-spec.md`
- ✅ `modules/platform-layout-spec.md`

#### 待更新 (需引用中央規範)
- 📝 32 個後端參數相關的 Module SPECs → 引用 `_backend-parameters-spec.md`
- 📝 10 個跨域協作相關的 SPECs → 引用 `_collaboration-spec.md`

**建議**: 由於中央規範已完整定義,個別 SPEC 可依需要逐步添加引用章節。前端開發時可直接使用中央規範文件。

---

## 六、結論與下一步

### ✅ 已完成

1. **78 項 NEEDS CLARIFICATION 全數解決**
2. **5 份中央規範文件已建立**
3. **12 個核心 SPEC 已更新完成**
4. **Mock Server 設定指南已完成**
5. **API Contract 標準已統一**

### 📋 建議後續工作

1. **前端開發階段**:
   - 依 `_mock-server-setup.md` 設定 MSW
   - 依 `_api-contract-spec.md` 實作 API 呼叫
   - 使用 OpenTelemetry 監控前端效能

2. **後端開發階段**:
   - 依 `_backend-parameters-spec.md` 實作 32 個參數 API
   - 依 `_collaboration-spec.md` 實作跨域協作 API
   - 提供 Swagger/OpenAPI 文件

3. **Contract Testing**:
   - 使用 Pact 進行前後端契約測試
   - 確保 API 實作符合規範

4. **個別 SPEC 補完** (可選):
   - 逐步在個別 Module SPEC 添加對中央規範的引用
   - 確保文件完整性

---

**文件版本**: v3.0
**最後更新**: 2025-10-07
**維護者**: Spec Architect
**狀態**: ✅ 完成
