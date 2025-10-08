# 實作計劃：[功能]

**日期**：[日期] | **規格**：[連結]
**輸入**：來自 `/specs/[###-feature-name]/spec.md` 的功能規格

**注意**：此模板由 `/speckit.plan` 命令填寫。請參閱 `.specify/templates/commands/plan.md` 以了解執行工作流程。

## 摘要

[從功能規格提取：主要需求 + 來自研究的技術方法]

## 技術背景

<!--
  需要動作：將此章節的內容替換為專案的技術細節。
  此處的結構以建議方式呈現，以指導迭代過程。
-->

**語言/版本**：[例如，Python 3.11、Swift 5.9、Rust 1.75 或需要澄清]
**主要依賴項**：[例如，FastAPI、UIKit、LLVM 或需要澄清]
**儲存**：[如果適用，例如，PostgreSQL、CoreData、文件或不適用]
**測試**：[例如，pytest、XCTest、cargo test 或需要澄清]
**目標平台**：[例如，Linux 伺服器、iOS 15+、WASM 或需要澄清]
**專案類型**：[單一/網頁/行動 - 決定來源結構]
**效能目標**：[領域特定，例如，1000 req/s、10k lines/sec、60 fps 或需要澄清]
**約束**：[領域特定，例如，<200ms p95、<100MB 記憶體、離線可用 或需要澄清]
**規模/範圍**：[領域特定，例如，10k 使用者、1M LOC、50 畫面 或需要澄清]

## 憲法檢查

*門檻：必須在階段 0 研究之前通過。在階段 1 設計之後重新檢查。*

[基於憲法文件確定的門檻]

## 專案結構

### 文件（此功能）

```
specs/[###-feature]/
├── plan.md              # 此文件（/speckit.plan 命令輸出）
├── research.md          # 階段 0 輸出（/speckit.plan 命令）
├── data-model.md        # 階段 1 輸出（/speckit.plan 命令）
├── quickstart.md        # 階段 1 輸出（/speckit.plan 命令）
├── contracts/           # 階段 1 輸出（/speckit.plan 命令）
└── tasks.md             # 階段 2 輸出（/speckit.tasks 命令 - 非由 /speckit.plan 創建）
```

### 來源程式碼（倉庫根目錄）
<!--
  需要動作：將下面的占位符樹替換為此功能的具體佈局。
  刪除未使用的選項，並使用真實路徑展開所選結構
  （例如，apps/admin、packages/something）。交付的計劃不得包含選項標籤。
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

# [如果未使用則移除] 選項 2：網頁應用程式（當檢測到 "frontend" + "backend" 時）
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

# [如果未使用則移除] 選項 3：行動 + API（當檢測到 "iOS/Android" 時）
api/
└── [與上述後端相同]

ios/ 或 android/
└── [平台特定結構：功能模組、UI 流程、平台測試]
```

**結構決策**：[記錄所選結構並參考上面捕獲的真實目錄]

## 複雜度追蹤

*僅在憲法檢查有必須證明的違規時才填寫*

| 違規 | 為什麼需要 | 拒絕的更簡單替代方案，因為 |
|------|------------|------------------------------|
| [例如，第 4 個專案] | [當前需求] | [為什麼 3 個專案不足] |
| [例如，Repository 模式] | [具體問題] | [為什麼直接 DB 存取不足] |
