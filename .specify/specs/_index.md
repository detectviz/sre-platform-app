# SRE 平台規格文件索引

**建立日期**: 2025-10-06
**最後更新**: 2025-10-08
**狀態**: Final
**憲法版本**: 1.3.0
**總文件數**: 28 份

---

## 一、概覽

本索引涵蓋 SRE 平台的完整規格文件體系，包含:
- **18 份模組級規格** (Module Specifications)
- **10 份系統層規範** (System-level Specifications)

所有規格文件皆依據 `.specify/memory/constitution.md` v1.3.0 制定，確保符合平台憲法原則。

**最新審查**: 2025-10-08 完成 SPEC ⇄ MVP 對齊審查，詳見 [審查報告](modules/_review-report.md)

---

## 二、模組級規格（18 份）

### 模組分類與狀態

#### ✅ 完全合規（5個，31.3%）

| 模組 ID | 模組名稱 | 檔案路徑 | 整合來源 | 憲法版本 | AS 數量 |
|---------|----------|----------|----------|----------|---------|
| automation-management | 自動化管理 | [automation-management-spec.md](modules/automation-management-spec.md) | automation-history + automation-playbook + automation-trigger | v1.3.0 | 12 |
| notification-management | 通知管理 | [notification-management-spec.md](modules/notification-management-spec.md) | notification-channel + notification-strategy + notification-history | v1.3.0 | 15 |
| user-profile | 使用者個人資料 | [user-profile-spec.md](modules/user-profile-spec.md) | profile-info + profile-preference + profile-security | v1.3.0 | 16 |
| resources-management | 資源管理與探索 | [resources-management-spec.md](modules/resources-management-spec.md) | resources-discovery + resources-management | v1.3.0 | 20 |
| incident-rules | 事件規則管理 | [incident-rules-spec.md](modules/incident-rules-spec.md) | incidents-alert + incidents-silence | v1.3.0 | 12 |

#### ⚠️ 需修正 - P1 高優先級（6個，37.5%）

| 模組 ID | 模組名稱 | 檔案路徑 | 憲法版本 | 主要問題 |
|---------|----------|----------|----------|----------|
| identity-access-management | 身份與存取管理 | [identity-access-management-spec.md](modules/identity-access-management-spec.md) | 未標示 | 缺少詳細情境與痛點，AS 僅 6 個 |
| insights-analysis | 洞察分析 | [insights-analysis-spec.md](modules/insights-analysis-spec.md) | 未標示 | 缺少詳細情境與痛點，AS 僅 4 個 |
| platform-tag | 標籤管理 | [platform-tag-spec.md](modules/platform-tag-spec.md) | v1.2.0 | 缺少詳細情境與痛點，AS 僅 5 個 |
| identity-audit | 審計日誌 | [identity-audit-spec.md](modules/identity-audit-spec.md) | v1.2.0 | 缺少詳細情境與痛點，AS 僅 3 個 |
| incidents-list | 事件列表管理 | [incidents-list-spec.md](modules/incidents-list-spec.md) | v1.2.0 | 缺少詳細情境與痛點，AS 僅 5 個 |
| insights-log | 日誌探索 | [insights-log-spec.md](modules/insights-log-spec.md) | v1.2.0 | 缺少詳細情境與痛點，AS 僅 5 個 |

#### ⚠️ 需修正 - P2 中優先級（4個，25.0%）

| 模組 ID | 模組名稱 | 檔案路徑 | 憲法版本 | 主要問題 |
|---------|----------|----------|----------|----------|
| platform-auth | 身份驗證設定 | [platform-auth-spec.md](modules/platform-auth-spec.md) | v1.2.0 | AS 僅 3 個 |
| platform-grafana | Grafana 整合 | [platform-grafana-spec.md](modules/platform-grafana-spec.md) | v1.2.0 | AS 僅 3 個 |
| platform-license | 授權管理 | [platform-license-spec.md](modules/platform-license-spec.md) | v1.2.0 | AS 僅 2 個 |
| platform-mail | 郵件設定 | [platform-mail-spec.md](modules/platform-mail-spec.md) | v1.2.0 | AS 僅 3 個 |

#### ✅ 基本合規 - P3 低優先級（1個，6.2%）

| 模組 ID | 模組名稱 | 檔案路徑 | 憲法版本 | 輕微問題 |
|---------|----------|----------|----------|----------|
| platform-navigation | 平台導覽 | [platform-navigation-spec.md](modules/platform-navigation-spec.md) | v1.3.0 | Primary User Story 可加強 |
| dashboards-management | 儀表板管理 | [dashboards-management-spec.md](modules/dashboards-management-spec.md) | 未標示 | 現有痛點未獨立章節，AS 分組不清晰 |

---

## 三、模組功能分類

### Identity（身份與存取）- 2 份
- identity-access-management - 身份與存取管理
- identity-audit - 審計日誌

### Incidents（事件管理）- 2 份
- incidents-list - 事件列表管理
- incident-rules - 事件規則管理（整合告警與靜音）

### Insights（洞察分析）- 2 份
- insights-log - 日誌探索
- insights-analysis - 洞察分析（整合回放與容量預測）

### Automation（自動化）- 1 份
- automation-management - 自動化管理（整合腳本、觸發器、歷史）

### Notification（通知管理）- 1 份
- notification-management - 通知管理（整合管道、策略、歷史）

### Resources（資源管理）- 1 份
- resources-management - 資源管理與探索

### Dashboards（儀表板）- 1 份
- dashboards-management - 儀表板管理

### Profile（個人設定）- 1 份
- user-profile - 使用者個人資料（整合資訊、偏好、安全）

### Platform（平台設定）- 6 份
- platform-auth - 身份驗證設定
- platform-grafana - Grafana 整合
- platform-license - 授權管理
- platform-mail - 郵件設定
- platform-tag - 標籤管理
- platform-navigation - 平台導覽

> 備註：`_review-report.md` 為審查報告文件，不計入模組統計。

---

## 四、系統層規範（10 份）

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 |
|---------|----------|----------|----------|
| scene-architecture-plan | Scenes 架構計畫 | [scene-architecture-plan.md](system/scene-architecture-plan.md) | 全平台結構與模組關聯 |
| scene-crud-interaction-pattern | CRUD 互動模式 | [scene-crud-interaction-pattern.md](system/scene-crud-interaction-pattern.md) | 所有 CRUD 模組(20+) |
| scene-governance-observability-spec | 治理與觀測規範 | [scene-governance-observability-spec.md](system/scene-governance-observability-spec.md) | 全平台治理與觀測 |
| scene-interaction-pattern | 互動層規範 | [scene-interaction-pattern.md](system/scene-interaction-pattern.md) | 所有上下文場景互動 |
| scene-table-guideline | 表格行為與設計系統 | [scene-table-guideline.md](system/scene-table-guideline.md) | 所有表格模組(18+) |
| scene-auditing-spec | 審計規範 | [scene-auditing-spec.md](system/scene-auditing-spec.md) | 全平台審計與行為追蹤 |
| scene-observability-spec | 可觀測性規範 | [scene-observability-spec.md](system/scene-observability-spec.md) | 全平台監測與遙測 |
| scene-rbac-spec | 權限控制規範 | [scene-rbac-spec.md](system/scene-rbac-spec.md) | 全平台權限管理 |
| scene-api-guideline | API 設計指引 | [scene-api-guideline.md](system/scene-api-guideline.md) | 全平台 API 設計 |
| scene-security-spec | 安全性規範 | [scene-security-spec.md](system/scene-security-spec.md) | 全平台安全設計 |

---

## 五、憲法合規性統計

### Constitution v1.3.0 合規狀態

| 檢查項目 | 完全合規 | 部分合規 | 需修正 |
|---------|---------|---------|--------|
| **觀測性（Logging/Tracing/Metrics）** | 5 | 6 | 5 |
| **安全性（RBAC/Audit/隔離）** | 16 | 0 | 0 |
| **一致性（i18n/Theme Token）** | 5 | 11 | 0 |
| **i18n（無硬編碼）** | 5 | 11 | 0 |
| **資料閉環（完整流程）** | 5 | 11 | 0 |

### 模組間一致性

#### ✅ RBAC 權限命名空間（無衝突）
- `automation:*` - Automation Management
- `notification:*` - Notification Management
- `profile:*` - User Profile
- `resources:*` - Resources Management
- `incident-rules:*` - Incident Rules
- `audit-logs:*` - Identity Audit
- `identity:*` - Identity Access Management
- `incidents:*` - Incidents List
- `logs:*` - Insights Log
- `insights:*` - Insights Analysis
- `settings:*` - Platform Settings（auth, grafana, mail）
- `tags:*` - Platform Tag
- `dashboards:*` - Dashboards Management
- `platform-navigation:*` - Platform Navigation

#### ✅ i18n Key 命名規範（基本一致）
大部分模組遵循 `{module}.{category}.{item}` 命名規範

**建議**: 統一 Platform 模組為 `platform.{submodule}.{category}.{item}` 格式

#### ✅ 資料實體定義（無重複或矛盾）
所有模組的資料實體定義清晰且無衝突

#### ✅ 功能邊界（清晰）
所有模組的功能邊界明確，無重疊或矛盾

---

## 六、問題統計與優先級

### 問題分佈

| 優先級 | 問題數量 | 影響模組數 | 問題類型 |
|--------|---------|-----------|---------|
| **P0 - Critical** | 0 | 0 | 無關鍵問題 |
| **P1 - High** | 18 | 6 | 缺少詳細 Primary User Story（6）<br>Acceptance Scenarios 數量不足（12） |
| **P2 - Medium** | 24 | 11 | 憲法版本過舊（11）<br>FR 格式不一致（5）<br>AS 數量不足（8） |
| **P3 - Low** | 12 | 8 | 治理檢查清單標記不一致（6）<br>Clarifications 未解決（4）<br>其他格式優化（2） |

### 完成度統計

| 狀態 | 模組數 | 百分比 | 說明 |
|------|--------|--------|------|
| **完全合規** | 5 | 31.3% | 符合所有標準，可作為參考模板 |
| **需修正 - P1** | 6 | 37.5% | 需補充詳細情境與 AS |
| **需修正 - P2** | 4 | 25.0% | 需補充 AS 數量與更新憲法版本 |
| **基本合規 - P3** | 1 | 6.2% | 僅需輕微優化 |

---

## 七、修正路線圖

### 第一階段（2 週）- P1 問題修正
**目標**: 補充核心模組的 Primary User Story 與 Acceptance Scenarios

#### Week 1: 核心治理與分析模組
1. identity-access-management-spec.md
2. insights-analysis-spec.md
3. platform-tag-spec.md

#### Week 2: 其他 P1 模組
4. identity-audit-spec.md
5. incidents-list-spec.md
6. insights-log-spec.md

### 第二階段（1 週）- P2 問題修正
**目標**: 批次更新憲法版本與補充 AS

#### Week 3: 批次更新與優化
1. 統一憲法版本至 v1.3.0（11 個模組）
2. 補充 Platform 模組 AS（4 個模組）
3. 優化 dashboards-management

### 第三階段（3 天）- P3 問題修正
**目標**: 統一格式與解決待確認事項

#### Week 4: 格式統一
1. 統一治理檢查清單標記（6 個模組）
2. 解決 Clarifications（逐步處理）
3. 其他格式優化

---

## 八、快速導航

### 依優先級分類

#### P0（關鍵功能）
- incidents-list, incident-rules
- resources-management
- dashboards-management
- identity-access-management

#### P1（重要功能）
- automation-management
- notification-management

#### P2（輔助功能）
- insights-analysis, insights-log
- platform-* (5 份)

#### P3（個人化）
- user-profile

---

## 九、相關文件

- [憲法 (Constitution)](../memory/constitution.md)
- [規格模板 (Spec Template)](../templates/spec-template.md)
- [審查報告 (Review Report)](modules/_review-report.md)

---

## 十、更新記錄

| 日期 | 變更內容 | 變更者 |
|------|----------|--------|
| 2025-10-08 | 完成 SPEC ⇄ MVP 對齊審查，生成詳細審查報告 | Claude Code Assistant |
| 2025-10-08 | 更新索引，新增合規性統計與問題分佈 | Claude Code Assistant |
| 2025-10-08 | 合併 automation-* (3個) → automation-management-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 notification-* (3個) → notification-management-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 profile-* (3個) → user-profile-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 resources-* (2個) → resources-management-spec.md (擴展版) | Claude Code Assistant |
| 2025-10-08 | 合併 incidents-alert + incidents-silence → incident-rules-spec.md | Claude Code Assistant |
| 2025-10-10 | 將 common/ 重新命名為 system/，統一為系統層規範 | AI Agent |
| 2025-10-09 | 移除平台規範 (3 份)，整併至通用 Scenes 規範層 | AI Agent |
| 2025-10-09 | 移除元件級規格 (7 份)，整併為通用 Scenes 規範 | AI Agent |
| 2025-10-08 | 更新通用規範為 Scenes 架構版本，擴充至 5 份文件 | AI Agent |
| 2025-10-06 | 初始建立，包含 33 份模組、7 份元件、3 份通用規範、3 份平台規範 | AI Agent |
| 2025-10-06 | 完成所有規格文件的審查與最終定版 | AI Agent |

---

## 十一、聯絡與回饋

如發現規格文件缺失、不一致或需要澄清的內容，請標記 `[NEEDS CLARIFICATION]` 並提交至 [審查報告](modules/_review-report.md)。

---

## 十二、專案成果總結

- **模組規格**: 成功產生 18 份模組級規格文件（經整合優化，原24個模組精簡為18個），存放於 `specs/modules/`
- **系統層規範**: 維持 10 份系統層規範文件，涵蓋 Scenes 架構、CRUD 互動、治理觀測等核心規範
- **整合成果**:
  - **完全合規**: 5 個整合規格（31.3%）已達到高標準
  - **需修正**: 13 個模組（68.7%）需補充情境、AS 或更新憲法版本
  - **質量提升**: 通過審查明確了修正方向與優先級
- **合規審查**: 完成 SPEC ⇄ MVP 對齊審查，詳細記錄於 [審查報告](modules/_review-report.md)
- **修正計畫**: 制定三階段修正路線圖，預計 4 週完成所有修正

此提交代表了整個規格逆向工程任務的審查成果，為後續修正工作提供了明確的方向與標準。
