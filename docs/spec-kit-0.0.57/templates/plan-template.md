# 實作計劃：[功能]

**分支**：`[###-功能名稱]` | **日期**：[日期] | **規格**：[連結]
**輸入**：來自 `/specs/[###-功能名稱]/spec.md` 的功能規格

**註記**：此模板由 `/speckit.plan` 命令填寫。請參閱 `.specify/templates/commands/plan.md` 以了解執行工作流程。

## 摘要

[從功能規格提取：主要需求 + 來自研究的技術方法]

## 技術上下文

<!--
  動作要求：將此部分內容替換為專案的技術細節。
  此處的結構以顧問身份呈現，以指導迭代過程。
-->

**語言/版本**：[例如：Python 3.11、Swift 5.9、Rust 1.75 或 NEEDS CLARIFICATION]
**主要依賴**：[例如：FastAPI、UIKit、LLVM 或 NEEDS CLARIFICATION]
**儲存**：[如果適用，例如：PostgreSQL、CoreData、檔案或 N/A]
**測試**：[例如：pytest、XCTest、cargo test 或 NEEDS CLARIFICATION]
**目標平台**：[例如：Linux 伺服器、iOS 15+、WASM 或 NEEDS CLARIFICATION]
**專案類型**：[single/web/mobile - 決定來源結構]
**效能目標**：[領域特定，例如：1000 req/s、10k lines/sec、60 fps 或 NEEDS CLARIFICATION]
**約束**：[領域特定，例如：<200ms p95、<100MB memory、offline-capable 或 NEEDS CLARIFICATION]
**規模/範圍**：[領域特定，例如：10k users、1M LOC、50 screens 或 NEEDS CLARIFICATION]

## 憲法檢查

*門檻：必須在階段 0 研究前通過。在階段 1 設計後重新檢查。*

[基於憲法檔案確定的門檻]

## 專案結構

### 文檔（此功能）

```
specs/[###-功能]/
├── plan.md              # 此檔案（/speckit.plan 命令輸出）
├── research.md          # 階段 0 輸出（/speckit.plan 命令）
├── data-model.md        # 階段 1 輸出（/speckit.plan 命令）
├── quickstart.md        # 階段 1 輸出（/speckit.plan 命令）
├── contracts/           # 階段 1 輸出（/speckit.plan 命令）
└── tasks.md             # 階段 2 輸出（/speckit.tasks 命令 - 非由 /speckit.plan 建立）
```

### 來源程式碼（儲存庫根目錄）
<!--
  動作要求：將以下占位符樹狀結構替換為此功能的具體佈局。
  刪除未使用的選項，並使用真實路徑擴展所選結構（例如：apps/admin、packages/something）。
  交付的計劃不得包含選項標籤。
-->

```
# [如果未使用則移除] 選項 1：單一專案（預設）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [如果未使用則移除] 選項 2：網頁應用程式（當偵測到 "frontend" + "backend" 時）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [如果未使用則移除] 選項 3：行動 + API（當偵測到 "iOS/Android" 時）
api/
└── [與上述 backend 相同]

ios/ 或 android/
└── [平台特定結構：功能模組、UI 流程、平台測試]
```

**結構決定**：[記錄所選結構並參考上面擷取的真實目錄]

## 複雜性追蹤

*僅在憲法檢查有違規且必須正當化時填寫*

| 違規 | 為什麼需要 | 較簡單的替代方案被拒絕，因為 |
|------|------------|-------------------------------|
| [例如：第 4 個專案] | [目前需求] | [為什麼 3 個專案不足] |
| [例如：Repository 模式] | [特定問題] | [為什麼直接 DB 存取不足] |
