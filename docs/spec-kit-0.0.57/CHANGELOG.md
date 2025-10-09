# 變更日誌

<!-- markdownlint-disable MD024 -->

Specify CLI 和模板的所有顯著變更都記錄在此處。

此格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
此專案遵循 [語義化版本控制](https://semver.org/spec/v2.0.0.html)。

## [0.0.18] - 2025-10-06

### 新增

- 在 `specify init .` 命令中支援使用 `.` 作為目前目錄的簡寫，等同於 `--here` 旗標，但對使用者更直觀。
- 使用 `/speckit.` 命令前綴來輕鬆發現 Spec Kit 相關命令。
- 重構提示和模板以簡化其能力和追蹤方式。不再在不需要時用測試污染事物。
- 確保按使用者故事建立任務（簡化測試和驗證）。
- 新增對 Visual Studio Code 提示快捷方式和自動腳本執行的支援。

### 變更

- 所有命令檔案現在以 `speckit.` 為前綴（例如：`speckit.specify.md`、`speckit.plan.md`），以在 IDE/CLI 命令調色板和檔案瀏覽器中提供更好的可發現性和區分

## [0.0.17] - 2025-09-22

### 新增

- 新增 `/clarify` 命令模板，用於為現有規格提出最多 5 個針對性的澄清問題，並將答案持久化到規格的 Clarifications 部分中。
- 新增 `/analyze` 命令模板，提供非破壞性的跨文件差異和對齊報告（規格、澄清、計劃、任務、憲法），插入在 `/tasks` 之後和 `/implement` 之前。
	- 注意：憲法規則被明確視為不可協商；任何衝突都是關鍵發現，需要文件修復，而不是弱化原則。

## [0.0.16] - 2025-09-22

### 新增

- `init` 命令的 `--force` 旗標，用於在使用 `--here` 在非空目錄中時繞過確認並繼續合併/覆蓋檔案。

## [0.0.15] - 2025-09-21

### 新增

- 支援 Roo Code。

## [0.0.14] - 2025-09-21

### 變更

- 錯誤訊息現在顯示一致。

## [0.0.13] - 2025-09-21

### 新增

- 支援 Kilo Code。感謝 [@shahrukhkhan489](https://github.com/shahrukhkhan489) 的 [#394](https://github.com/github/spec-kit/pull/394)。
- 支援 Auggie CLI。感謝 [@hungthai1401](https://github.com/hungthai1401) 的 [#137](https://github.com/github/spec-kit/pull/137)。
- 代理資料夾安全性通知在專案佈建完成後顯示，警告使用者某些代理可能在其代理資料夾中儲存憑證或認證權杖，並建議將相關資料夾新增到 `.gitignore` 以防止意外憑證洩露。

### 變更

- 顯示警告以確保人們意識到他們可能需要將代理資料夾新增到 `.gitignore`。
- 清理了 `check` 命令輸出。

## [0.0.12] - 2025-09-21

### 變更

- 為 OpenAI Codex 使用者新增額外上下文——他們需要設定額外的環境變數，如 [#417](https://github.com/github/spec-kit/issues/417) 中所述。

## [0.0.11] - 2025-09-20

### 新增

- Codex CLI 支援（感謝 [@honjo-hiroaki-gtt](https://github.com/honjo-hiroaki-gtt) 在 [#14](https://github.com/github/spec-kit/pull/14) 中的貢獻）
- Codex 感知的上下文更新工具（Bash 和 PowerShell），使功能計劃在現有助理旁邊重新整理 `AGENTS.md`，無需手動編輯。

## [0.0.10] - 2025-09-20

### 修復

- 解決了 [#378](https://github.com/github/spec-kit/issues/378) 中 GitHub 權杖在請求為空時可能被附加的問題。

## [0.0.9] - 2025-09-19

### 變更

- 使用青色突出顯示代理鍵和灰色括號顯示全名的改進代理選擇器 UI

## [0.0.8] - 2025-09-19

### 新增

- Windsurf IDE 支援作為額外的 AI 助理選項（感謝 [@raedkit](https://github.com/raedkit) 在 [#151](https://github.com/github/spec-kit/pull/151) 中的工作）
- GitHub 權杖支援用於 API 請求，以處理企業環境和速率限制（由 [@zryfish](https://github.com/@zryfish) 在 [#243](https://github.com/github/spec-kit/pull/243) 中貢獻）

### 變更

- 使用 Windsurf 範例和 GitHub 權杖使用更新 README
- 增強發行工作流程以包含 Windsurf 模板

## [0.0.7] - 2025-09-18

### 變更

- 更新 CLI 中的命令說明。
- 清理程式碼以不在一般情況下呈現代理特定資訊。


## [0.0.6] - 2025-09-17

### 新增

- opencode 支援作為額外的 AI 助理選項

## [0.0.5] - 2025-09-17

### 新增

- Qwen Code 支援作為額外的 AI 助理選項

## [0.0.4] - 2025-09-14

### 新增

- 通過 `httpx[socks]` 依賴為企業環境提供 SOCKS 代理支援

### 修復

N/A

### 變更

N/A
