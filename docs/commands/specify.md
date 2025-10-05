---
description: 根據自然語言的功能描述，建立或更新功能規格文件。
---

使用者的輸入可以由代理（agent）直接提供，也可以作為指令參數傳入 —— 在執行提示前你**必須**考慮該輸入（若不為空）。

使用者輸入：

$ARGUMENTS

在觸發訊息中，使用者在 `/specify` 後輸入的文字 **即是** 功能描述。  
假設在本次對話中你始終能取得該內容，即使下方仍出現 `$ARGUMENTS` 字面字樣。  
除非使用者未輸入內容，否則不要要求他們重複輸入。

根據該功能描述，請執行以下步驟：

1. 從專案根目錄執行腳本  
   `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"`  
   並解析其 JSON 輸出以取得 **BRANCH_NAME** 與 **SPEC_FILE**。  
   所有檔案路徑必須為絕對路徑。  
   **重要：** 此腳本只能執行一次。JSON 會在終端輸出中提供 —— 你必須依據該輸出內容來取得實際資訊。
2. 載入 `.specify/templates/spec-template.md` 以了解所需的段落結構。
3. 根據模板結構撰寫規格文件至 `SPEC_FILE`，  
   用從功能描述（arguments）推導出的具體內容取代模板中的佔位符，同時保留段落順序與標題。
4. 回報完成結果，包含：
   - 分支名稱（branch name）
   - 規格文件路徑（spec file path）
   - 是否已準備進入下一階段（readiness for the next phase）

注意：  
該腳本會自動建立並切換至新分支，並初始化規格文件，然後再進行寫入。