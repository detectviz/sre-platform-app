# 剩餘待處理項目清單 (Remaining NEEDS CLARIFICATION)

**統計日期**: 2025-10-06
**總數**: 78 項
**已解決**: 15 項 (前端 UI/UX)
**剩餘**: 63 項

---

## 一、項目分類統計

### 1.1 已解決項目 (✅ 15 項)

| # | 項目 | 所屬檔案 | 解決方式 |
|---|------|----------|----------|
| 1 | 巢狀 Modal 層級限制 | modal-interaction-pattern.md | 前端決策: 最大 2 層 |
| 2 | 虛擬滾動方案選擇 | table-design-system.md | 前端決策: react-window |
| 3 | 軟刪除與硬刪除 UI | crud-base-requirements.md | 前端決策: Checkbox vs 輸入確認 |
| 4 | 權限選擇器 UI | identity-role-spec.md | 前端決策: 樹狀結構 |
| 5 | 事件狀態變更提示 | incidents-list-spec.md | 前端決策: Toast + 時間軸 |
| 6 | 策略衝突提示 | notification-strategy-spec.md | 前端決策: Alert + 色點 |
| 7 | 拓撲圖更新提示 | resources-topology-spec.md | 前端決策: 狀態指示器 + 置信度 |
| 8 | 容量預測展示 | insights-capacity-spec.md | 前端決策: ECharts + 星級 |
| 9 | SSO 登入 UI | platform-auth-spec.md | 前端決策: 主輔結構 + 降級 |
| 10 | 敏感資料遮罩 | resources-datasource-spec.md | 前端決策: Password/Token/Key |
| 11-15 | 後端參數項目 | 各模組 | 標記為「由 API 提供」 |

### 1.2 剩餘項目分類 (63 項)

| 類別 | 數量 | 說明 |
|------|------|------|
| **後端邏輯參數** | 32 項 | 保留期限、並行上限、演算法選擇等 |
| **前端 UI/UX** | 21 項 | 響應式佈局、生命週期、持久化等 |
| **跨域協作** | 10 項 | 權限機制、同步策略、快取策略等 |

---

## 二、剩餘前端 UI/UX 項目 (21 項)

> 這些項目需要**前端團隊**進行 UI/UX 設計決策

### 2.1 Component Specs (16 項)

#### Modal 元件 (2 項)
- [ ] **巢狀模態框的顯示優先級** (`components/modal-spec.md`)
  - 已解決巢狀層級限制 (最大 2 層)，但需補充 Z-index 優先級規則細節

- [ ] **模態框內容的生命週期管理** (`components/modal-spec.md`)
  - 需決策: 開啟時掛載 vs 提前渲染但隱藏
  - 需決策: 關閉時卸載 vs 保留 DOM

#### ColumnSettingsModal 元件 (2 項)
- [ ] **欄位設定的儲存位置(使用者級或團隊級)** (`components/column-settings-modal-spec.md`)
  - 需前端決策: UI 提供選項讓使用者選擇
  - 後端提供: 儲存 API 支援兩種模式

- [ ] **欄位排序的持久化策略** (`components/column-settings-modal-spec.md`)
  - 需前端決策: 拖曳排序後即時儲存 vs 點擊「儲存」按鈕
  - 需前端決策: 失敗時的回滾機制

#### Toolbar 元件 (2 項)
- [ ] **批次操作的權限控制機制** (`components/toolbar-spec.md`)
  - 需前端決策: 無權限時隱藏按鈕 vs 禁用按鈕 + Tooltip 提示

- [ ] **工具列在不同螢幕尺寸的響應式佈局** (`components/toolbar-spec.md`)
  - 需前端決策: 小螢幕時按鈕收合至「更多」下拉選單 vs 橫向滾動

#### Drawer 元件 (2 項)
- [ ] **多層抽屜的堆疊管理機制** (`components/drawer-spec.md`)
  - 已在 modal-interaction-pattern.md 解決巢狀問題，需同步至此

- [ ] **抽屜內容的預載入策略** (`components/drawer-spec.md`)
  - 需前端決策: 開啟時才載入 vs 預先載入隱藏

#### Pagination 元件 (2 項)
- [ ] **分頁資訊的持久化(跨頁面保留)** (`components/pagination-spec.md`)
  - 需前端決策: URL Query String vs SessionStorage vs API 保存

- [ ] **大資料量時的分頁策略(前端或後端)** (`components/pagination-spec.md`)
  - 已在 table-design-system.md 解決 (後端分頁 + 虛擬滾動)，需同步

#### UnifiedSearchModal 元件 (2 項)
- [ ] **不同頁面的篩選條件來源與格式統一機制** (`components/unified-search-modal-spec.md`)
  - 需前端決策: 統一 Schema (JSON Schema) 定義篩選欄位
  - 需前端決策: 動態渲染表單元件

- [ ] **進階搜尋(複雜條件組合)的支援範圍** (`components/unified-search-modal-spec.md`)
  - 需前端決策: 支援 AND/OR/NOT 邏輯組合
  - 需前端決策: UI 設計 (樹狀 vs 表單式)

#### QuickFilterBar 元件 (2 項)
- [ ] **快速篩選與進階搜尋的整合方式** (`components/quick-filter-bar-spec.md`)
  - 需前端決策: 快速篩選選中時自動填入進階搜尋
  - 需前端決策: 兩者條件合併邏輯 (AND 或 覆寫)

- [ ] **篩選狀態的 URL 同步機制** (`components/quick-filter-bar-spec.md`)
  - 需前端決策: 篩選條件序列化至 URL Query String
  - 需前端決策: 頁面載入時從 URL 恢復篩選狀態

#### TableContainer 元件 (2 項)
- [ ] **表格高度的自適應策略** (`components/table-container-spec.md`)
  - 需前端決策: 固定高度 vs 視窗高度自適應
  - 需前端決策: ResizeObserver 監聽視窗變化

- [ ] **虛擬滾動的觸發條件** (`components/table-container-spec.md`)
  - 已在 table-design-system.md 解決 (100 筆資料)，需同步

### 2.2 Common Specs (3 項)

#### table-design-system.md (2 項)
- [ ] **表格固定列(sticky rows)的支援需求**
  - 需前端決策: 是否支援釘選某些列至頂部
  - 需前端決策: Sticky Header + Sticky Rows CSS 實作

- [ ] **行內編輯(inline edit)的統一實作方式**
  - 需前端決策: 點擊儲存格進入編輯模式
  - 需前端決策: 編輯完成觸發方式 (Enter 鍵 / 失焦 / 儲存按鈕)
  - 需前端決策: 驗證失敗時的錯誤提示位置

#### modal-interaction-pattern.md (1 項)
- [ ] **Modal 內表單的自動儲存草稿機制**
  - 需前端決策: 是否提供草稿功能
  - 需前端決策: 草稿儲存時機 (定時儲存 / 欄位變更)
  - 需前端決策: 草稿恢復提示 UI

### 2.3 Module Specs (2 項)

#### profile-preference-spec.md (1 項)
- [ ] **語言切換的即時生效範圍**
  - 需前端決策: 僅當前頁面生效 vs 全站即時生效 (需重新載入 i18n)
  - 需前端決策: 是否需要重新整理頁面提示

#### platform-layout-spec.md (1 項)
- [ ] **主題色變更的即時生效機制**
  - 需前端決策: CSS Variables 動態更新 vs 重新載入樣式表
  - 需前端決策: 變更預覽功能 (即時預覽但未儲存)

---

## 三、剩餘後端參數項目 (32 項)

> 這些項目**由後端決定**，前端透過 API 接收並顯示

### 3.1 認證與金鑰管理 (4 項)

- [ ] SMTP 認證資訊的金鑰管理 (`platform-mail-spec.md`)
- [ ] 渠道認證資訊的金鑰管理機制 (`notification-channel-spec.md`)
- [ ] 授權檔案的簽章驗證機制 (`platform-license-spec.md`)
- [ ] MFA 恢復碼的生成與管理機制 (`profile-security-spec.md`)

### 3.2 資料保留與歸檔 (7 項)

- [ ] 執行歷史的保留時長與歸檔策略 (`automation-history-spec.md`)
- [ ] 審計日誌的保留時長與歸檔策略 (`identity-audit-spec.md`)
- [ ] 日誌資料的保留策略與查詢範圍限制 (`insights-log-spec.md`)
- [ ] 過期靜音規則的自動清理策略與保留時長 (`incidents-silence-spec.md`)
- [ ] 通知歷史的保留時長與歸檔策略 (`notification-history-spec.md`)
- [ ] 發現結果的保留時長與清理策略 (`resources-auto-discovery-spec.md`)
- [ ] 資源指標的更新頻率與歷史資料保留策略 (`resources-list-spec.md`)

### 3.3 並行與限流 (6 項)

- [ ] 郵件發送速率限制的策略 (`platform-mail-spec.md`)
- [ ] 回測任務的並行數限制與優先級機制 (`insights-backtesting-spec.md`)
- [ ] 日誌查詢的並行數與逾時限制 (`insights-log-spec.md`)
- [ ] 劇本並行執行的限制與優先級 (`automation-playbook-spec.md`)
- [ ] 觸發器的並行執行數限制 (`automation-trigger-spec.md`)
- [ ] 自動發現的並行任務數上限 (`resources-auto-discovery-spec.md`)

### 3.4 權限與隔離 (6 項)

- [ ] 敏感資訊的脫敏規則與權限控制 (`automation-history-spec.md`)
- [ ] 敏感操作的定義與告警機制 (`identity-audit-spec.md`)
- [ ] 歷史資料的存取權限與資料隱私保護 (`insights-backtesting-spec.md`)
- [ ] 團隊資源隔離的實作機制與例外處理 (`identity-team-spec.md`)
- [ ] 嵌入儀表板的權限控制與資料隔離 (`platform-grafana-spec.md`)
- [ ] SSO 整合的身份同步機制 (`identity-personnel-spec.md`)

### 3.5 業務規則 (9 項)

- [ ] 通知偏好的優先級與策略繼承 (`profile-preference-spec.md`)
- [ ] 靜音規則與告警規則的優先級關係 (`incidents-silence-spec.md`)
- [ ] 群組成員數量上限 (`resources-group-spec.md`)
- [ ] 是否支援動態群組(基於標籤或條件自動加入成員) (`resources-group-spec.md`)
- [ ] 授權限制的強制執行策略 (`platform-license-spec.md`)
- [ ] 標籤策略的驗證與強制執行機制 (`platform-tag-spec.md`)
- [ ] 標籤值的命名規範與驗證規則 (`platform-tag-spec.md`)
- [ ] 資源狀態判定邏輯 - 基於哪些指標與閾值 (`resources-list-spec.md`)
- [ ] 規則觸發後的冷卻時間(cooldown)設定 (`incidents-alert-spec.md`)

---

## 四、剩餘跨域協作項目 (10 項)

> 需要**前後端共同討論**

### 4.1 UI/UX + 後端邏輯 (10 項)

- [ ] **Drawer 內容的預載入策略與快取** (`modal-interaction-pattern.md`)
  - 前端: 決定預載入時機與快取失效 UI 提示
  - 後端: 提供快取 TTL 參數與預載入 API

- [ ] **Modal 關閉動畫完成前是否允許重新開啟** (`modal-interaction-pattern.md`)
  - 前端: 動畫時長與狀態管理
  - 後端: 無關 (純前端決策，但影響使用者體驗)

- [ ] **KPI 數值的更新頻率與快取策略** (`resources-discovery-spec.md`)
  - 前端: 顯示更新時間與刷新按鈕
  - 後端: 提供更新頻率參數與快取 TTL

- [ ] **趨勢圖的資料粒度與聚合邏輯** (`resources-discovery-spec.md`)
  - 前端: 時間範圍選擇器 UI
  - 後端: 資料粒度計算 (5 分鐘 / 1 小時 / 1 天)

- [ ] **儀表板的權限繼承與分享機制** (`dashboards-list-spec.md`)
  - 前端: 分享對話框 UI、權限選擇器
  - 後端: 權限繼承規則與 API

- [ ] **儀表板版本控制與復原功能** (`dashboards-list-spec.md`)
  - 前端: 版本列表 UI、復原確認對話框
  - 後端: 版本儲存與復原邏輯

- [ ] **子團隊的權限繼承與覆寫規則** (`identity-team-spec.md`)
  - 前端: 權限繼承視覺化 (樹狀圖 + 繼承標記)
  - 後端: 繼承與覆寫計算邏輯

- [ ] **資源批次操作的數量上限** (`resources-list-spec.md`)
  - 前端: 超過上限時禁用批次按鈕 + 提示訊息
  - 後端: 提供 maxBatchSize 參數

- [ ] **通知重試的策略與上限次數** (`notification-history-spec.md`)
  - 前端: 顯示重試次數與狀態
  - 後端: 重試演算法與上限設定

- [ ] **觸發器防抖的時間窗口與策略** (`automation-trigger-spec.md`)
  - 前端: 顯示防抖狀態 (冷卻中)
  - 後端: 防抖時間窗口設定

---

## 五、優先級建議

### 5.1 高優先級 (P0) - 影響核心體驗

**前端 UI/UX**:
1. 表格行內編輯統一實作 (影響所有列表頁)
2. 分頁資訊持久化 (影響使用者體驗)
3. 響應式工具列佈局 (行動裝置體驗)
4. 語言切換即時生效 (i18n 核心功能)

**跨域協作**:
1. 儀表板權限繼承與分享機制
2. 子團隊權限繼承規則

### 5.2 中優先級 (P1) - 進階功能

**前端 UI/UX**:
1. 進階搜尋複雜條件組合
2. 快速篩選與進階搜尋整合
3. Modal 自動儲存草稿機制
4. 主題色變更即時生效

**跨域協作**:
1. 儀表板版本控制與復原
2. KPI 更新頻率與快取策略

### 5.3 低優先級 (P2) - 優化項目

**前端 UI/UX**:
1. 表格固定列支援
2. Drawer 預載入策略
3. Modal 生命週期管理
4. 欄位設定儲存位置選擇

---

## 六、建議處理流程

### 6.1 前端 UI/UX 項目 (21 項)

**建議流程**:
1. 前端團隊內部討論，產出設計方案
2. 更新對應 SPEC 檔案，補充 UI/UX 設計章節
3. 新增決策記錄 (DR-XXX)
4. 標記 NEEDS CLARIFICATION 為已解決 (✅ ~~...~~)

**預計工時**: 10-15 人天

### 6.2 後端參數項目 (32 項)

**建議流程**:
1. 後端團隊定義參數值與邏輯
2. 更新 API 文件，註明參數名稱與格式
3. 在 SPEC 中標記為「由後端 API 提供」
4. 前端團隊根據 API 文件實作顯示邏輯

**預計工時**: 15-20 人天 (後端)

### 6.3 跨域協作項目 (10 項)

**建議流程**:
1. 前後端共同討論，定義介面與職責
2. 前端更新 UI/UX 設計，後端更新 API 設計
3. 雙方更新各自 SPEC 章節
4. 進行整合測試

**預計工時**: 8-12 人天 (前後端共同)

---

## 七、總結

✅ **已解決**: 15 項 (前端 UI/UX 決策完成)
⏳ **剩餘**: 63 項
  - 前端 UI/UX: 21 項
  - 後端參數: 32 項
  - 跨域協作: 10 項

**建議**:
1. 優先處理 P0 高優先級項目 (8 項)
2. 前後端並行處理各自職責範圍項目
3. 跨域協作項目安排專項會議討論

**預計完成時間**: 4-6 週 (假設前後端各 1-2 人全職投入)
