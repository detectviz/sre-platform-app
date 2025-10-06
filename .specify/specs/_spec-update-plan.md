# SPEC 更新計畫 - 標記已解決項目

**建立日期**: 2025-10-07
**目的**: 將所有已解決的 NEEDS CLARIFICATION 標記到原始 SPEC 文件

---

## 需要更新的檔案清單

### 第二階段已解決 (21 項) - 需更新 12 個檔案

#### Component Specs (8 個)
1. `components/modal-spec.md` (2 項)
   - ✅ 巢狀模態框的顯示優先級 → 引用 `_resolution-plan-phase2.md` § 3.1
   - ✅ 模態框內容的生命週期管理 → 引用 `_resolution-plan-phase2.md` § 3.2

2. `components/column-settings-modal-spec.md` (2 項)
   - ✅ 欄位設定的儲存位置 → 引用 `_resolution-plan-phase2.md` § 3.3
   - ✅ 欄位排序的持久化策略 → 引用 `_resolution-plan-phase2.md` § 3.4

3. `components/toolbar-spec.md` (2 項)
   - ✅ 批次操作的權限控制機制 → 引用 `_resolution-plan-phase2.md` § 3.5
   - ✅ 工具列響應式佈局 → 引用 `_resolution-plan-phase2.md` § 3.6

4. `components/drawer-spec.md` (2 項)
   - ✅ 多層抽屜的堆疊管理機制 → 引用 `_resolution-plan-phase2.md` § 3.7
   - ✅ 抽屜內容的預載入策略 → 引用 `_resolution-plan-phase2.md` § 3.8

5. `components/pagination-spec.md` (2 項)
   - ✅ 分頁資訊的持久化 → 引用 `_resolution-plan-phase2.md` § 3.9
   - ✅ 大資料量時的分頁策略 → 引用 `_resolution-plan-phase2.md` § 3.10

6. `components/unified-search-modal-spec.md` (2 項)
   - ✅ 篩選條件格式統一機制 → 引用 `_resolution-plan-phase2.md` § 3.11
   - ✅ 進階搜尋支援範圍 → 引用 `_resolution-plan-phase2.md` § 3.12

7. `components/quick-filter-bar-spec.md` (2 項)
   - ✅ 快速篩選與進階搜尋的整合方式 → 引用 `_resolution-plan-phase2.md` § 3.13
   - ✅ 篩選狀態的 URL 同步機制 → 引用 `_resolution-plan-phase2.md` § 3.14

8. `components/table-container-spec.md` (2 項)
   - ✅ 表格高度的自適應策略 → 引用 `_resolution-plan-phase2.md` § 3.15
   - ✅ 虛擬滾動的觸發條件 → 引用 `_resolution-plan-phase2.md` § 3.16

#### Common Specs (2 個)
9. `common/table-design-system.md` (2 項)
   - ✅ 表格固定列支援需求 → 引用 `_resolution-plan-phase2.md` § 3.17
   - ✅ 行內編輯統一實作方式 → 引用 `_resolution-plan-phase2.md` § 3.18

10. `common/modal-interaction-pattern.md` (1 項)
    - ✅ Modal 內表單的自動儲存草稿機制 → 引用 `_resolution-plan-phase2.md` § 3.19

#### Module Specs (2 個)
11. `modules/profile-preference-spec.md` (1 項)
    - ✅ 語言切換的即時生效範圍 → 引用 `_resolution-plan-phase2.md` § 3.20

12. `modules/platform-layout-spec.md` (1 項)
    - ✅ 主題色變更的即時生效機制 → 引用 `_resolution-plan-phase2.md` § 3.21

---

### 第三階段已解決 (42 項) - 需更新多個檔案

#### 後端參數項目 (32 項) - 引用 `_backend-parameters-spec.md`

**更新方式**: 在每個相關模組 SPEC 的「模糊與待確認事項」章節,將 NEEDS CLARIFICATION 標記為:

```markdown
## N. 模糊與待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: XXX]~~ → **已解決**: 參見 `_backend-parameters-spec.md` § X.Y
```

**涉及檔案** (依 `_backend-parameters-spec.md` 分類):

**§ 1 認證與金鑰管理 (4 項)**:
- `modules/platform-mail-spec.md` - SMTP 認證金鑰管理
- `modules/notification-channel-spec.md` - 渠道認證金鑰管理
- `modules/platform-license-spec.md` - 授權檔案簽章驗證
- `modules/profile-security-spec.md` - MFA 恢復碼生成

**§ 2 資料保留與歸檔 (7 項)**:
- `modules/automation-history-spec.md` - 執行歷史保留時長
- `modules/identity-audit-spec.md` - 審計日誌保留時長
- `modules/insights-log-spec.md` - 日誌資料保留策略
- `modules/incidents-silence-spec.md` - 過期靜音規則清理
- `modules/notification-history-spec.md` - 通知歷史保留時長
- `modules/resources-auto-discovery-spec.md` - 發現結果保留時長
- `modules/resources-list-spec.md` - 資源指標更新頻率

**§ 3 並行與限流 (6 項)**:
- `modules/platform-mail-spec.md` - 郵件發送速率限制
- `modules/insights-backtesting-spec.md` - 回測任務並行數限制
- `modules/insights-log-spec.md` - 日誌查詢並行數與逾時
- `modules/automation-playbook-spec.md` - 劇本並行執行限制
- `modules/automation-trigger-spec.md` - 觸發器並行執行數限制
- `modules/resources-auto-discovery-spec.md` - 自動發現並行任務數上限

**§ 4 權限與隔離 (6 項)**:
- `modules/automation-history-spec.md` - 敏感資訊脫敏規則
- `modules/identity-audit-spec.md` - 敏感操作定義與告警
- `modules/insights-backtesting-spec.md` - 歷史資料存取權限
- `modules/identity-team-spec.md` - 團隊資源隔離機制
- `modules/platform-grafana-spec.md` - 嵌入儀表板權限控制
- `modules/identity-personnel-spec.md` - SSO 整合身份同步

**§ 5 業務規則 (9 項)**:
- `modules/profile-preference-spec.md` - 通知偏好優先級與繼承
- `modules/incidents-silence-spec.md` - 靜音規則與告警規則優先級
- `modules/resources-group-spec.md` (2 項) - 群組成員數量上限、動態群組支援
- `modules/platform-license-spec.md` - 授權限制強制執行
- `modules/platform-tag-spec.md` (2 項) - 標籤策略驗證、標籤值命名規範
- `modules/resources-list-spec.md` - 資源狀態判定邏輯
- `modules/incidents-alert-spec.md` - 規則觸發冷卻時間

---

#### 跨域協作項目 (10 項) - 引用 `_collaboration-spec.md`

**涉及檔案**:
- `common/modal-interaction-pattern.md` (2 項) - Drawer 預載入、Modal 關閉動畫
- `modules/resources-discovery-spec.md` (2 項) - KPI 更新頻率、趨勢圖資料粒度
- `modules/dashboards-list-spec.md` (2 項) - 儀表板權限繼承、版本控制
- `modules/identity-team-spec.md` (1 項) - 子團隊權限繼承
- `modules/resources-list-spec.md` (1 項) - 批次操作數量上限
- `modules/notification-history-spec.md` (1 項) - 通知重試策略
- `modules/automation-trigger-spec.md` (1 項) - 觸發器防抖時間窗口

---

## 更新範本

### 範本 1: 引用第二階段決策 (已有詳細內容)

現有檔案已包含完整決策內容,僅需更新 Clarifications 章節:

```markdown
## N. 模糊與待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 巢狀模態框的顯示優先級]~~ → **已解決**: 參見本文件 § 5 與 `_update-report-phase2.md`
```

---

### 範本 2: 引用後端參數規範 (需新增章節)

```markdown
## N. 模糊與待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: SMTP 認證資訊的金鑰管理]~~ → **已解決**: 參見 `_backend-parameters-spec.md` § 1.1

---

## N+1. 後端參數 API (Backend Parameters)

**定義**: 參見 `_backend-parameters-spec.md` § 1.1 - SMTP 認證資訊的金鑰管理

**API 端點**: `GET /api/v1/config/mail/encryption`

**前端實作要求**:
- 顯示加密狀態圖示
- 敏感欄位使用密碼輸入框
- 不允許讀取已儲存的密碼

**Mock 資料**: 已提供於 Mock Server
```

---

### 範本 3: 引用跨域協作規範 (需新增章節)

```markdown
## N. 模糊與待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: Drawer 內容的預載入策略與快取]~~ → **已解決**: 參見 `_collaboration-spec.md` § 1

---

## N+1. Drawer 預載入策略 (Frontend-Backend Collaboration)

**定義**: 參見 `_collaboration-spec.md` § 1 - Drawer 內容預載入策略與快取

**前端職責**:
- 預載入觸發時機 (Hover 500ms)
- 快取策略 (React Query)
- 載入與錯誤狀態處理

**後端職責**:
- 提供預載入 API (`GET /api/v1/drawer/preload/:type/:id`)
- 設定快取 TTL 參數
- 支援 ETag 協商快取

**API Mock**: 已提供於 Mock Server
```

---

## 執行策略

由於涉及檔案數量龐大 (20+ 個模組 SPEC),建議採用以下策略:

### 策略 A: 批次更新 (推薦)
為每個涉及的 SPEC 添加簡短的引用章節,指向對應的規範文件。

**優點**:
- 避免重複內容
- 統一管理於規範文件
- 易於維護

**缺點**:
- 需要更新多個檔案

---

### 策略 B: 集中管理 (備選)
僅更新 `_remaining-clarifications.md`,將所有項目標記為已解決。

**優點**:
- 僅需更新 1 個檔案

**缺點**:
- 模組 SPEC 仍有未解決標記
- 不符合文件完整性原則

---

## 建議執行順序

1. **優先**: 更新 `_remaining-clarifications.md` 統計
2. **高優先**: 更新 12 個第二階段相關 SPEC (已有詳細內容)
3. **中優先**: 更新常用模組 SPEC (incidents-*, resources-*, dashboards-*)
4. **低優先**: 更新其他模組 SPEC

---

**文件完成日期**: 2025-10-07
**執行狀態**: 待執行
