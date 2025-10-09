# SRE 平台系統層規範文件索引

**建立日期**: 2025-10-06
**最後更新**: 2025-10-08
**狀態**: Final
**憲法版本**: 1.3.0
**規範文件數**: 10 份

---

## 一、概覽

本索引涵蓋 SRE 平台的所有系統層規範（Scenes）文件，這些規範定義了平台的架構模式、互動行為、設計原則和技術標準。

所有規範文件皆依據 `.specify/memory/constitution.md` v1.3.0 制定，確保符合平台憲法原則。

---

## 二、系統層規範（10 份）

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 | 優先級 |
|---------|----------|----------|----------|--------|
| scene-architecture-plan | Scenes 架構計畫 | [scene-architecture-plan.md](scene/scene-architecture-plan.md) | 全平台結構與模組關聯 | P0 |
| scene-crud-interaction-pattern | CRUD 互動模式 | [scene-crud-interaction-pattern.md](scene/scene-crud-interaction-pattern.md) | 所有 CRUD 模組(20+) | P0 |
| scene-governance-observability-spec | 治理與觀測規範 | [scene-governance-observability-spec.md](scene/scene-governance-observability-spec.md) | 全平台治理與觀測 | P0 |
| scene-interaction-pattern | 互動層規範 | [scene-interaction-pattern.md](scene/scene-interaction-pattern.md) | 所有上下文場景互動 | P0 |
| scene-table-guideline | 表格行為與設計系統 | [scene-table-guideline.md](scene/scene-table-guideline.md) | 所有表格模組(18+) | P0 |
| scene-auditing-spec | 審計規範 | [scene-auditing-spec.md](scene/scene-auditing-spec.md) | 全平台審計與行為追蹤 | P1 |
| scene-observability-spec | 可觀測性規範 | [scene-observability-spec.md](scene/scene-observability-spec.md) | 全平台監測與遙測 | P1 |
| scene-rbac-spec | 權限控制規範 | [scene-rbac-spec.md](scene/scene-rbac-spec.md) | 全平台權限管理 | P1 |
| scene-api-guideline | API 設計指引 | [scene-api-guideline.md](scene/scene-api-guideline.md) | 全平台 API 設計 | P1 |
| scene-security-spec | 安全性規範 | [scene-security-spec.md](scene/scene-security-spec.md) | 全平台安全設計 | P1 |

---

## 三、規範分類

### 架構與設計（Architecture & Design）
- scene-architecture-plan - Scenes 架構計畫
- scene-interaction-pattern - 互動層規範
- scene-api-guideline - API 設計指引

### 行為與互動（Behavior & Interaction）
- scene-crud-interaction-pattern - CRUD 互動模式
- scene-table-guideline - 表格行為與設計系統

### 治理與安全（Governance & Security）
- scene-governance-observability-spec - 治理與觀測規範
- scene-rbac-spec - 權限控制規範
- scene-security-spec - 安全性規範

### 可觀測性（Observability）
- scene-observability-spec - 可觀測性規範
- scene-auditing-spec - 審計規範

---

## 四、快速導航

### 開發者必讀（P0）
- [scene-architecture-plan.md](scene/scene-architecture-plan.md) - 理解平台整體架構
- [scene-crud-interaction-pattern.md](scene/scene-crud-interaction-pattern.md) - 掌握 CRUD 操作規範
- [scene-governance-observability-spec.md](scene/scene-governance-observability-spec.md) - 遵循治理原則

### 模組開發參考（Reference）
- [scene-table-guideline.md](scene/scene-table-guideline.md) - 表格設計標準
- [scene-interaction-pattern.md](scene/scene-interaction-pattern.md) - 互動模式指引

### 安全與合規（Compliance）
- [scene-security-spec.md](scene/scene-security-spec.md) - 安全設計要求
- [scene-rbac-spec.md](scene/scene-rbac-spec.md) - 權限管理規範
- [scene-auditing-spec.md](scene/scene-auditing-spec.md) - 審計追蹤要求

---

## 五、相關文件

- [憲法 (Constitution)](../.specify/memory/constitution.md)
- [模組級規格索引](modules/_index.md)
- [規格模板 (Spec Template)](../.specify/templates/spec-template.md)

## 六、更新記錄

| 日期 | 變更內容 | 變更者 |
|------|----------|--------|
| 2025-10-08 | 從主索引拆分為獨立系統層規範索引 | Claude Code Assistant |
| 2025-10-08 | 新增優先級分類與快速導航 | Claude Code Assistant |
| 2025-10-06 | 初始建立系統層規範文件集合 | AI Agent |

## 七、聯絡與回饋

如發現規範文件缺失、不一致或需要澄清的內容，請標記 `[NEEDS CLARIFICATION]` 並提交至模組審查報告。

## 八、文檔架構說明

- **系統層規範 (scene/)**: 定義平台級別的架構模式、設計原則和技術標準
- **模組級規格 (modules/)**: 各功能模組的具體實現規範和需求定義

此索引專注於系統層規範文件的導航與管理。
