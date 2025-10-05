---
description: 使用 plan 模板執行實作規劃流程，產出設計文件。
---

使用者的輸入可以由代理（agent）直接提供，也可以作為指令參數傳入 —— 在執行提示前你**必須**考慮該輸入（若不為空）。

使用者輸入：

$ARGUMENTS

根據傳入的實作細節，執行以下步驟：

1. 從專案根目錄執行  
   `.specify/scripts/bash/setup-plan.sh --json`，並解析其 JSON 輸出，取得 **FEATURE_SPEC**、**IMPL_PLAN**、**SPECS_DIR**、**BRANCH**。  
   所有後續檔案路徑必須使用絕對路徑。  
   - **在繼續前，請檢查 FEATURE_SPEC 中是否包含 `## Clarifications` 區段**，且至少有一個 `Session` 子標題。  
     若該區段缺失或仍有明顯模糊處（如含糊形容詞、未解決的關鍵決策），請**暫停**並指示使用者先執行 `/clarify` 以減少返工。  
     只有在以下情況下才可繼續：  
     (a) 已存在 Clarifications，或  
     (b) 使用者明確要求繞過檢查（例如：「proceed without clarification」）。  
     **不得自行編造 Clarifications。**

2. 讀取並分析該功能規格文件，以理解：
   - 功能需求與使用者故事  
   - 功能性與非功能性需求  
   - 成功與驗收標準  
   - 提及的任何技術限制或相依條件  

3. 讀取 `.specify/memory/constitution.md`，以理解憲法層級的技術與設計要求。

4. 執行實作計畫模板：
   - 載入 `.specify/templates/plan-template.md`（系統已自動複製至 IMPL_PLAN 路徑）  
   - 將輸入路徑設定為 FEATURE_SPEC  
   - 執行模板中的「Execution Flow (main)」步驟 1 至 9  
   - 該模板為自包含並可執行的流程  
   - 嚴格依照模板中的錯誤處理與 Gate 檢查進行  
   - 讓模板主導在 $SPECS_DIR 中產出文件：
     * 第 0 階段：產出 `research.md`
     * 第 1 階段：產出 `data-model.md`、`contracts/`、`quickstart.md`
     * 第 2 階段：產出 `tasks.md`
   - 將使用者提供的額外細節（$ARGUMENTS）納入 Technical Context 區段  
   - 持續更新 Progress Tracking 以反映各階段完成狀態  

5. 驗證執行結果：
   - 檢查 Progress Tracking 是否顯示所有階段皆已完成  
   - 確認所有必要文件均已生成  
   - 確保執行過程中未出現 ERROR 狀態  

6. 回報執行結果：
   - 分支名稱（branch name）  
   - 產生的檔案路徑  
   - 所有生成的文件與工件清單  

所有檔案操作皆必須以專案根目錄為基準，使用**絕對路徑**以避免路徑錯誤。