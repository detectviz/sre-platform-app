# 規格文件系統變更記錄 (Changelog)

所有重要變更都會記錄在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/),
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

---

## [1.0.0] - 2025-10-07

### 🎉 初始版本發布

完成 SRE Platform 規格文件系統建置,包含 52 份完整規格文件與技術規範。

### Added (新增)

#### 階段三: 後端參數與跨域協作 (2025-10-07)

**API 與整合規範 (5 份新文件)**:
- `_api-contract-spec.md` - API 設計總規範 (~800 行)
- `_backend-parameters-spec.md` - 32 項後端參數 API 規範 (~900 行)
- `_collaboration-spec.md` - 10 項跨域協作規範 (~1000 行)
- `_mock-server-setup.md` - MSW + OpenTelemetry 設定指南 (~850 行)
- `_resolution-plan-phase3.md` - 第三階段執行計畫 (~600 行)

**階段報告 (3 份新文件)**:
- `_update-report-phase3.md` - 第三階段完成報告 (~650 行)
- `_completion-report.md` - 專案完成總報告 (~850 行)
- `CHANGELOG.md` - 變更記錄 (本文件)

**系統文件更新**:
- `README.md` - 完整規格系統總覽與快速開始指南 (~500 行)
- `_index.md` - 更新文件索引,新增 API 規範與階段報告章節

**關鍵決策**:
- 採用 API Contract First 開發策略
- 使用 MSW (Mock Service Worker) 進行前端 Mock
- 整合 OpenTelemetry 實現前端可觀測性
- 定義 32 個後端參數 API 端點
- 定義 10 個跨域協作 API 規範

**技術規範**:
- RESTful API 設計標準
- 統一錯誤處理格式
- RBAC 權限整合 (`resource:action`)
- HTTP 快取策略 (ETag, Cache-Control)
- Contract Testing 使用 Pact

### Changed (變更)

**SPEC 文件更新 (標記已解決項目)**:
- `common/modal-interaction-pattern.md` - 標記 2 項 NEEDS CLARIFICATION 已解決
- `modules/profile-preference-spec.md` - 標記 1 項已解決,引用後端參數規範
- `modules/platform-layout-spec.md` - 標記 1 項已解決 (Logo 圖片限制)

**統計更新**:
- `_remaining-clarifications.md` - 完整重寫,標記 78/78 項全數解決

---

## [0.9.0] - 2025-10-06

### Added (新增)

#### 階段二: Component/Common 規範完善 (2025-10-06)

**階段規劃文件**:
- `_resolution-plan-phase2.md` - 第二階段解決方案總規劃 (~800 行)
- `_spec-update-plan.md` - SPEC 更新計畫與範本

**關鍵決策 (21 項)**:
1. **Component SPECs (16 項)**
   - Modal: Z-index 優先級規則、生命週期管理策略
   - ColumnSettingsModal: 儲存範圍選擇、排序持久化策略
   - Toolbar: 權限控制機制、響應式佈局
   - Drawer: 堆疊管理機制、預載入策略
   - Pagination: 持久化策略、分頁策略選擇
   - UnifiedSearchModal: 篩選格式統一、進階搜尋範圍
   - QuickFilterBar: 整合方式、URL 同步機制
   - TableContainer: 高度自適應、虛擬滾動觸發條件

2. **Common SPECs (3 項)**
   - 表格固定列支援需求
   - 行內編輯統一實作方式
   - Modal 表單自動儲存草稿機制

3. **Module SPECs (2 項)**
   - 語言切換即時生效範圍
   - 主題色變更即時生效機制

### Changed (變更)

**Component SPECs 完善 (8 個檔案更新)**:
- `components/modal-spec.md` - 新增 § 5 Z-index 規則、§ 6 生命週期管理、決策記錄
- `components/column-settings-modal-spec.md` - 新增 § 4 儲存範圍、§ 5 排序持久化、決策記錄
- `components/toolbar-spec.md` - 新增 § 4 權限控制、§ 5 響應式佈局、決策記錄
- `components/drawer-spec.md` - 新增 § 4 堆疊管理、§ 5 預載入策略、決策記錄
- `components/pagination-spec.md` - 新增 § 4 持久化策略、§ 5 分頁策略、決策記錄
- `components/unified-search-modal-spec.md` - 新增 § 4 篩選統一、§ 5 進階搜尋、決策記錄
- `components/quick-filter-bar-spec.md` - 新增 § 4 整合方式、§ 5 URL 同步、決策記錄
- `components/table-container-spec.md` - 新增 § 4 高度自適應、§ 5 虛擬滾動、決策記錄

**Common SPECs 完善 (2 個檔案更新)**:
- `common/table-design-system.md` - 新增 § 14 固定列與行內編輯規範
- `common/modal-interaction-pattern.md` - 新增 § 9 自動儲存草稿機制

**Module SPECs 完善 (2 個檔案更新)**:
- `modules/profile-preference-spec.md` - 新增 § 5 語言切換決策記錄
- `modules/platform-layout-spec.md` - 新增 § 6 主題色變更決策記錄

---

## [0.8.0] - 2025-10-06

### Added (新增)

#### 階段一: 基礎規格建立與前端 UI/UX 決策

**模組規格 (30 份)**:
- Incidents 模組 (4 份): list, alert, silence, history
- Resources 模組 (6 份): list, group, topology, datasource, discovery, auto-discovery
- Automation 模組 (4 份): playbook, trigger, history, schedule
- Insights 模組 (4 份): log, capacity, backtesting, anomaly
- Identity 模組 (5 份): personnel, team, role, audit, session
- Notification 模組 (3 份): channel, strategy, history
- Dashboards 模組 (2 份): list, template
- Platform 模組 (6 份): layout, mail, license, tag, grafana, auth
- Profile 模組 (2 份): preference, security

**元件規格 (10 份)**:
- Modal, Drawer, Toolbar
- Pagination, ColumnSettingsModal
- UnifiedSearchModal, QuickFilterBar
- TableContainer, StatusTag, IconButton

**通用規範 (7 份)**:
- `table-design-system.md` - 表格設計系統總規範
- `modal-interaction-pattern.md` - Modal/Drawer 互動規範
- `crud-base-requirements.md` - CRUD 基礎需求
- `rbac.md` - RBAC 權限系統
- `auditing.md` - 審計日誌規範
- `observability.md` - 可觀測性規範
- `error-handling.md` - 錯誤處理規範

**系統文件**:
- `_index.md` - 文件索引系統
- `_remaining-clarifications.md` - 待確認事項追蹤
- `README.md` - 規格系統說明

**關鍵決策 (15 項)**:
1. 巢狀 Modal 最大 2 層,第 3 層改用 Drawer
2. 虛擬滾動採用 react-window
3. 軟刪除使用 Checkbox,硬刪除需輸入確認
4. RBAC 權限選擇器使用樹狀結構
5. 事件狀態變更使用 Toast + 時間軸
6. 策略衝突使用 Alert + 色點提示
7. 拓撲圖更新使用狀態指示器 + 置信度
8. 容量預測使用 ECharts + 星級評分
9. SSO 登入使用主輔結構 + 降級機制
10. 敏感資料遮罩支援 Password/Token/Key 類型
11. RBAC 權限繼承使用階層圖示 + Tooltip
12. 資料源連線測試使用模態框 + 步驟檢查
13. Grafana 嵌入使用 iframe sandbox + CSP
14. 日誌查詢優化使用分析器 + 建議
15. 劇本執行使用流程圖 + 狀態動畫

### Documentation (文件)

**規範制定原則**:
- 基於 `.specify/memory/constitution.md` 憲法條款
- 遵循 MoSCoW 優先級 (MUST/SHOULD/MAY)
- 採用 Given-When-Then 驗收場景
- 包含決策記錄 (Decision Records)

**文件結構標準**:
每份 Module SPEC 包含:
1. 主要使用者情境 (User Scenarios)
2. 功能需求 (Functional Requirements)
3. 關鍵資料實體 (Key Entities)
4. 觀測性檢查 (Observability Checklist)
5. API 端點設計 (API Endpoints)
6. 模糊與待確認事項 (Clarifications)
7. 決策記錄 (Decision Records)

每份 Component SPEC 包含:
1. 功能概述 (Functional Overview)
2. 操作邏輯 (User Flow)
3. 狀態管理 (State Management)
4. 可配置屬性 (Props)
5. 錯誤處理 (Error Handling)
6. 設計原則遵循 (Design Principles)
7. 待確認事項 (Clarifications)

---

## [Unreleased] - 未來計畫

### Planned (規劃中)

#### 短期 (1-3 個月)

**文件補完**:
- [ ] 補完 32 個後端參數相關 Module SPEC 引用章節
- [ ] 補完 10 個跨域協作相關 SPEC 引用章節
- [ ] 建立 GraphQL Schema 規範文件

**技術規範**:
- [ ] Contract Testing 實作指南
- [ ] E2E Testing 策略文件
- [ ] CI/CD Pipeline 規範

**工具與範本**:
- [ ] SPEC 文件產生器
- [ ] API Mock 資料產生器
- [ ] Contract Testing 自動化腳本

#### 中期 (3-6 個月)

**進階功能規範**:
- [ ] 進階搜尋第二階段 (AND/OR/NOT 邏輯)
- [ ] Cursor 分頁規範
- [ ] Service Worker 快取策略
- [ ] WebSocket 即時通訊規範

**可存取性**:
- [ ] WCAG 2.1 AA 合規檢查清單
- [ ] 鍵盤導航完整規範
- [ ] 螢幕閱讀器支援指南

**國際化**:
- [ ] 多語言支援擴展規範
- [ ] 時區處理統一規範
- [ ] 地區化格式設定指南

#### 長期 (6-12 個月)

**架構擴展**:
- [ ] 多租戶支援規範
- [ ] 微前端架構規範
- [ ] 聯邦學習隱私保護規範

**AI 輔助**:
- [ ] 智慧搜尋建議規範
- [ ] 異常檢測與預測規範
- [ ] 自動化建議系統規範

---

## 版本號規則

本專案使用語意化版本號 `MAJOR.MINOR.PATCH`:

- **MAJOR**: 重大架構變更,不向後相容
- **MINOR**: 新增功能,向後相容
- **PATCH**: 錯誤修正,向後相容

### 範例

- `1.0.0` → `1.1.0`: 新增模組規格 (Minor)
- `1.1.0` → `1.1.1`: 修正規格錯誤 (Patch)
- `1.1.1` → `2.0.0`: API 設計重大變更 (Major)

---

## 變更類型說明

- **Added**: 新增功能或文件
- **Changed**: 既有功能或文件的變更
- **Deprecated**: 即將棄用的功能
- **Removed**: 已移除的功能
- **Fixed**: 錯誤修正
- **Security**: 安全性修正
- **Documentation**: 純文件變更

---

## 貢獻者

**架構師團隊**:
- Spec Architect - 規格系統設計與實作

**參與評審**:
- 前端團隊
- 後端團隊
- 產品團隊

---

## 參考資源

- [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/zh-TW/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hant/v1.0.0/)

---

**最後更新**: 2025-10-07
**維護者**: Spec Architect
