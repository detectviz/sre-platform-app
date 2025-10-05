---
description: 在任務生成後，對 spec.md、plan.md 和 tasks.md 進行非破壞性的跨工件一致性與品質分析。
---

使用者輸入可以直接由代理提供或作為命令參數 — 你**必須**在繼續執行提示前考慮此輸入（若非空）。

使用者輸入：

$ARGUMENTS

目標：在實作前識別三個核心工件（`spec.md`、`plan.md`、`tasks.md`）間的不一致、重複、模糊及規格不足項目。此命令**必須**在 `/tasks` 成功產生完整 `tasks.md` 後執行。

嚴格唯讀：**不可**修改任何檔案。輸出結構化的分析報告。提供選擇性修正計畫（使用者必須明確同意後，才會手動執行任何後續編輯命令）。

憲法權威：專案憲法（`.specify/memory/constitution.md`）在本次分析範圍內**不可談判**。憲法衝突自動視為**關鍵**問題，需要調整 spec、plan 或 tasks，而非稀釋、重新詮釋或默默忽略該原則。若需變更原則，必須在 `/analyze` 之外另行明確更新憲法。

執行步驟：

1. 從 repo root 執行 `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` 一次，並解析 JSON 以取得 FEATURE_DIR 和 AVAILABLE_DOCS。推導絕對路徑：
   - SPEC = FEATURE_DIR/spec.md
   - PLAN = FEATURE_DIR/plan.md
   - TASKS = FEATURE_DIR/tasks.md
   若缺少任何必要檔案，請中止並顯示錯誤訊息（指示使用者執行缺少的前置命令）。

2. 載入工件：
   - 解析 spec.md 章節：Overview/Context、Functional Requirements、Non-Functional Requirements、User Stories、Edge Cases（若存在）。
   - 解析 plan.md：Architecture/stack 選擇、Data Model 參考、Phases、Technical constraints。
   - 解析 tasks.md：Task IDs、描述、階段分組、平行標記 [P]、參考的檔案路徑。
   - 載入憲法 `.specify/memory/constitution.md` 以進行原則驗證。

3. 建立內部語意模型：
   - 需求清單：每個功能性與非功能性需求，附帶穩定鍵（根據祈使句短語產生 slug；例如 "User can upload file" -> `user-can-upload-file`）。
   - 使用者故事/動作清單。
   - 任務覆蓋映射：將每個任務映射到一個或多個需求或故事（透過關鍵字或明確參考模式如 ID 或關鍵短語推斷）。
   - 憲法規則集：擷取原則名稱及任何 MUST/SHOULD 規範性陳述。

4. 偵測流程：
   A. 重複偵測：
      - 識別近似重複的需求。標註較差的措辭以利合併。
   B. 模糊偵測：
      - 標記缺乏可衡量標準的模糊形容詞（快速、可擴展、安全、直覺、穩健）。
      - 標記未解決的佔位符（TODO、TKTK、???、<placeholder> 等）。
   C. 規格不足：
      - 有動詞但缺少對象或可衡量結果的需求。
      - 缺少驗收標準對齊的使用者故事。
      - 任務參考了 spec/plan 中未定義的檔案或元件。
   D. 憲法對齊：
      - 任何與 MUST 原則衝突的需求或 plan 元素。
      - 缺少憲法規定的必要章節或品質門檻。
   E. 覆蓋缺口：
      - 無任何相關任務的需求。
      - 無映射需求/故事的任務。
      - 非功能性需求未反映於任務中（例如性能、安全性）。
   F. 不一致性：
      - 術語漂移（同一概念在不同檔案中名稱不一）。
      - plan 中提及但 spec 缺失的資料實體（反之亦然）。
      - 任務排序矛盾（例如整合任務在基礎設定任務之前且無依賴說明）。
      - 衝突需求（例如一方要求使用 Next.js，另一方說用 Vue 作為框架）。

5. 嚴重性分級啟發式：
   - CRITICAL：違反憲法 MUST、缺少核心 spec 工件、或無覆蓋且阻斷基線功能的需求。
   - HIGH：重複或衝突需求、模糊的安全/性能屬性、不可測試的驗收標準。
   - MEDIUM：術語漂移、缺少非功能性任務覆蓋、規格不足的邊界案例。
   - LOW：風格/措辭改進、對執行順序無影響的輕微冗餘。

6. 產生 Markdown 報告（不寫檔）包含章節：

   ### Specification Analysis Report
   | ID | Category | Severity | Location(s) | Summary | Recommendation |
   |----|----------|----------|-------------|---------|----------------|
   | A1 | Duplication | HIGH | spec.md:L120-134 | 兩個相似需求... | 合併措辭；保留較清晰版本 |
   （每個發現新增一列；產生以類別首字母為前綴的穩定 ID。）

   附加子節：
   - 覆蓋摘要表：
     | Requirement Key | Has Task? | Task IDs | Notes |
   - 憲法對齊問題（若有）
   - 無映射任務（若有）
   - 指標：
     * 需求總數
     * 任務總數
     * 覆蓋率 %（有至少一任務的需求）
     * 模糊計數
     * 重複計數
     * 關鍵問題計數

7. 報告末尾輸出簡明的下一步行動區塊：
   - 若有 CRITICAL 問題：建議在 `/implement` 前解決。
   - 若僅有 LOW/MEDIUM：使用者可繼續，但提供改進建議。
   - 提供明確命令建議：如「執行 /specify 進行細化」、「執行 /plan 調整架構」、「手動編輯 tasks.md 以增加 'performance-metrics' 的覆蓋」。

8. 詢問使用者：「您是否希望我針對前 N 項問題建議具體修正編輯？」（**不要**自動套用。）

行為規則：
- 絕不修改檔案。
- 絕不憑空產生缺失章節 — 若無，予以報告。
- 保持發現結果具決定性：若無變更，重新執行產生相同 ID 與計數。
- 主表發現限制為 50 筆；超出部分以摘要說明。
- 若無任何問題，輸出成功報告及覆蓋統計與繼續建議。

上下文：$ARGUMENTS
