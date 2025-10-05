---
description: 從互動式或提供的原則輸入中建立或更新專案憲法，確保所有相依範本保持同步。
---

使用者輸入可以由代理直接提供或作為命令參數 — 你**必須**在繼續提示前先考慮它（若非空白）。

使用者輸入：

$ARGUMENTS

你正在更新位於 `.specify/memory/constitution.md` 的專案憲法。此檔案為一個包含方括號中佔位符標記（例如 `[PROJECT_NAME]`、`[PRINCIPLE_1_NAME]`）的範本。你的工作是 (a) 收集/推導具體值，(b) 精確填充範本，及 (c) 將任何修訂傳播到相依的產物中。

請遵循此執行流程：

1. 載入現有的憲法範本，路徑為 `.specify/memory/constitution.md`。
   - 識別所有形式為 `[ALL_CAPS_IDENTIFIER]` 的佔位符標記。
   **重要**：使用者可能需要的原則數目比範本中使用的少或多。若指定數量，請遵守 — 遵循一般範本。你將相應更新文件。

2. 收集/推導佔位符的值：
   - 若使用者輸入（對話）提供值，則使用該值。
   - 否則從現有 repo 環境（README、文件、先前版本憲法若有內嵌）推斷。
   - 對治理日期：`RATIFICATION_DATE` 是原始採納日期（若未知請詢問或標記 TODO），`LAST_AMENDED_DATE` 若有變更則為今日，否則保留先前日期。
   - `CONSTITUTION_VERSION` 必須依語意版本規則遞增：
     * MAJOR：向後不相容的治理/原則刪除或重新定義。
     * MINOR：新增原則/章節或實質擴展指引。
     * PATCH：說明澄清、用詞修正、非語意性微調。
   - 若版本升級類型模糊，請先提出理由再定案。

3. 擬定更新後的憲法內容：
   - 將所有佔位符替換為具體文字（除非專案明確選擇不定義的範本槽位，請明確說明原因）。
   - 保留標題階層，註解可在替換後移除，除非仍有說明用途。
   - 確保每個原則章節：簡明的名稱行，段落（或條列）描述不可妥協的規則，若非顯而易見須有明確理由。
   - 確保治理章節列出修訂程序、版本政策及合規審查期望。

4. 一致性傳播檢查清單（將先前清單轉為主動驗證）：
   - 閱讀 `.specify/templates/plan-template.md`，確保任何「Constitution Check」或規則與更新後的原則一致。
   - 閱讀 `.specify/templates/spec-template.md`，確保範圍/需求對齊 — 若憲法新增/刪除必填章節或限制，則更新。
   - 閱讀 `.specify/templates/tasks-template.md`，確保任務分類反映新增或刪除的原則驅動任務類型（例如 observability、versioning、testing discipline）。
   - 閱讀 `.specify/templates/commands/*.md` 中的每個命令檔（包含本檔），確認無過時參考（例如專屬代理名 CLAUDE），改為通用指引。
   - 閱讀任何執行時指引文件（如 `README.md`、`docs/quickstart.md` 或代理專屬指引文件若存在），更新對變更原則的引用。

5. 產生同步影響報告（在憲法檔案更新後，以 HTML 註解形式置於頂端）：
   - 版本變更：舊 → 新
   - 修改過的原則清單（舊標題 → 新標題若有更名）
   - 新增章節
   - 移除章節
   - 需更新的範本（✅ 已更新 / ⚠ 待處理）及檔案路徑
   - 待辦事項（若有故意延後的佔位符）

6. 最終輸出前驗證：
   - 無剩餘未說明的方括號標記。
   - 版本行與報告相符。
   - 日期為 ISO 格式 YYYY-MM-DD。
   - 原則具陳述性、可測試，且避免模糊語言（例如將「should」替換為 MUST/SHOULD 並附理由）。

7. 將完成的憲法覆寫寫回 `.specify/memory/constitution.md`。

8. 向使用者輸出最終摘要：
   - 新版本與升級理由。
   - 任何需人工後續處理的檔案。
   - 建議的 commit 訊息（例如 `docs: amend constitution to vX.Y.Z (principle additions + governance update)`）。

格式與風格要求：
- Markdown 標題保持與範本完全相同（不可降階或升階）。
- 換行時保持可讀性（理想不超過 100 字），但避免生硬斷行。
- 章節間保留一行空白。
- 避免尾端空白。

若使用者只提供部分更新（例如僅一原則修訂），仍須執行驗證與版本決策。

若關鍵資訊缺失（例如採納日期完全不明），請插入 `TODO(<FIELD_NAME>): explanation` 並在同步影響報告中列為延後項目。

請勿建立新範本；始終操作既有 `.specify/memory/constitution.md` 檔案。
