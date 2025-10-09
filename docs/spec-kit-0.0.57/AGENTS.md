# AGENTS.md

## 關於 Spec Kit 和 Specify

**GitHub Spec Kit** 是一個全面的工具包，用於實作 Spec-Driven Development (SDD)——一種強調在實作之前建立清晰規格的方法論。這個工具包包含模板、腳本和工作流程，引導開發團隊通過結構化的方式建構軟體。

**Specify CLI** 是命令列介面，用於使用 Spec Kit 框架引導專案。它設定必要的目錄結構、模板和 AI 代理整合，以支援 Spec-Driven Development 工作流程。

這個工具包支援多種 AI 編程助理，讓團隊能夠使用他們偏好的工具，同時維持一致的專案結構和開發實務。

---

## 一般實務

- Specify CLI 的 `__init__.py` 任何變更都需要在 `pyproject.toml` 中進行版本修訂，並在 `CHANGELOG.md` 中新增條目。

## 新增代理支援

本節說明如何為 Specify CLI 新增對新 AI 代理/助理的支援。在將新的 AI 工具整合到 Spec-Driven Development 工作流程時，請使用本指南作為參考。

### 概覽

Specify 通過在初始化專案時產生代理特定的指令檔案和目錄結構來支援多種 AI 代理。每個代理都有自己的慣例：

- **指令檔案格式**（Markdown、TOML 等）
- **目錄結構**（`.claude/commands/`、`.windsurf/workflows/` 等）
- **指令呼叫模式**（斜槓指令、CLI 工具等）
- **參數傳遞慣例**（`$ARGUMENTS`、`{{args}}` 等）

### 目前支援的代理

| 代理 | 目錄 | 格式 | CLI 工具 | 描述 |
|-------|-----------|---------|----------|-------------|
| **Claude Code** | `.claude/commands/` | Markdown | `claude` | Anthropic 的 Claude Code CLI |
| **Gemini CLI** | `.gemini/commands/` | TOML | `gemini` | Google 的 Gemini CLI |
| **GitHub Copilot** | `.github/prompts/` | Markdown | N/A（IDE 基礎） | VS Code 中的 GitHub Copilot |
| **Cursor** | `.cursor/commands/` | Markdown | `cursor-agent` | Cursor CLI |
| **Qwen Code** | `.qwen/commands/` | TOML | `qwen` | Alibaba 的 Qwen Code CLI |
| **opencode** | `.opencode/command/` | Markdown | `opencode` | opencode CLI |
| **Windsurf** | `.windsurf/workflows/` | Markdown | N/A（IDE 基礎） | Windsurf IDE 工作流程 |
| **Amazon Q Developer CLI** | `.amazonq/prompts/` | Markdown | `q` | Amazon Q Developer CLI |


### 逐步整合指南

按照這些步驟新增代理（以 Windsurf 為例）：

#### 1. Update AI_CHOICES Constant

Add the new agent to the `AI_CHOICES` dictionary in `src/specify_cli/__init__.py`:

```python
AI_CHOICES = {
    "copilot": "GitHub Copilot",
    "claude": "Claude Code",
    "gemini": "Gemini CLI",
    "cursor": "Cursor",
    "qwen": "Qwen Code",
    "opencode": "opencode",
    "windsurf": "Windsurf",
    "q": "Amazon Q Developer CLI"  # 在此處新增新代理
}
```

同時更新同個檔案中的 `agent_folder_map`，以包含新代理的資料夾以供安全性通知使用：

```python
agent_folder_map = {
    "claude": ".claude/",
    "gemini": ".gemini/",
    "cursor": ".cursor/",
    "qwen": ".qwen/",
    "opencode": ".opencode/",
    "codex": ".codex/",
    "windsurf": ".windsurf/",
    "kilocode": ".kilocode/",
    "auggie": ".auggie/",
    "copilot": ".github/",
    "q": ".amazonq/" # 在此處新增新代理資料夾
}
```

#### 2. 更新 CLI 說明文字

更新所有說明文字和範例以包含新代理：

- 指令選項說明：`--ai` 參數描述
- 函數文檔字串和範例
- 包含代理清單的錯誤訊息

#### 3. 更新 README 文檔

更新 `README.md` 中的 **支援的 AI 代理** 部分以包含新代理：

- 在表格中新增代理，包含適當的支援等級（完整/部分）
- 包含代理的官方網站連結
- 新增關於代理實作的任何相關註記
- 確保表格格式保持對齊和一致

#### 4. 更新發佈套件腳本

修改 `.github/workflows/scripts/create-release-packages.sh`：

##### 新增到 ALL_AGENTS 陣列：
```bash
ALL_AGENTS=(claude gemini copilot cursor qwen opencode windsurf q)
```

##### 新增目錄結構的 case 陳述式：
```bash
case $agent in
  # ... 現有案例 ...
  windsurf)
    mkdir -p "$base_dir/.windsurf/workflows"
    generate_commands windsurf md "\$ARGUMENTS" "$base_dir/.windsurf/workflows" "$script" ;;
esac
```

#### 5. 更新 GitHub 發佈腳本

修改 `.github/workflows/scripts/create-github-release.sh` 以包含新代理的套件：

```bash
gh release create "$VERSION" \
  # ... 現有套件 ...
  .genreleases/spec-kit-template-windsurf-sh-"$VERSION".zip \
  .genreleases/spec-kit-template-windsurf-ps-"$VERSION".zip \
  # 在此處新增新代理套件
```

#### 6. 更新代理上下文腳本

##### Bash 腳本 (`scripts/bash/update-agent-context.sh`)：

新增檔案變數：
```bash
WINDSURF_FILE="$REPO_ROOT/.windsurf/rules/specify-rules.md"
```

新增到 case 陳述式：
```bash
case "$AGENT_TYPE" in
  # ... 現有案例 ...
  windsurf) update_agent_file "$WINDSURF_FILE" "Windsurf" ;;
  "")
    # ... 現有檢查 ...
    [ -f "$WINDSURF_FILE" ] && update_agent_file "$WINDSURF_FILE" "Windsurf";
    # 更新預設建立條件
    ;;
esac
```

##### PowerShell 腳本 (`scripts/powershell/update-agent-context.ps1`)：

新增檔案變數：
```powershell
$windsurfFile = Join-Path $repoRoot '.windsurf/rules/specify-rules.md'
```

新增到 switch 陳述式：
```powershell
switch ($AgentType) {
    # ... 現有案例 ...
    'windsurf' { Update-AgentFile $windsurfFile 'Windsurf' }
    '' {
        foreach ($pair in @(
            # ... 現有配對 ...
            @{file=$windsurfFile; name='Windsurf'}
        )) {
            if (Test-Path $pair.file) { Update-AgentFile $pair.file $pair.name }
        }
        # 更新預設建立條件
    }
}
```

#### 7. 更新 CLI 工具檢查（可選）

對於需要 CLI 工具的代理，在 `check()` 命令和代理驗證中新增檢查：

```python
# 在 check() 命令中
tracker.add("windsurf", "Windsurf IDE (可選)")
windsurf_ok = check_tool_for_tracker("windsurf", "https://windsurf.com/", tracker)

# 在 init 驗證中（僅在需要 CLI 工具時）
elif selected_ai == "windsurf":
    if not check_tool("windsurf", "從以下位置安裝: https://windsurf.com/"):
        console.print("[red]錯誤:[/red] Windsurf CLI 對於 Windsurf 專案是必需的")
        agent_tool_missing = True
```

**注意**：對於基於 IDE 的代理（Copilot、Windsurf）跳過 CLI 檢查。

## 代理類別

### 基於 CLI 的代理
需要安裝命令列工具：
- **Claude Code**：`claude` CLI
- **Gemini CLI**：`gemini` CLI
- **Cursor**：`cursor-agent` CLI
- **Qwen Code**：`qwen` CLI
- **opencode**：`opencode` CLI

### 基於 IDE 的代理
在整合開發環境中運作：
- **GitHub Copilot**：內建於 VS Code/相容編輯器
- **Windsurf**：內建於 Windsurf IDE

## 命令文件格式

### Markdown 格式
使用代理：Claude、Cursor、opencode、Windsurf、Amazon Q Developer

```markdown
---
description: "命令描述"
---

包含 {SCRIPT} 和 $ARGUMENTS 占位符的命令內容。
```

### TOML 格式
使用代理：Gemini、Qwen

```toml
description = "命令描述"

prompt = """
包含 {SCRIPT} 和 {{args}} 占位符的命令內容。
"""
```

## 目錄慣例

- **CLI 代理**：通常為 `.<agent-name>/commands/`
- **IDE 代理**：遵循 IDE 特定模式：
  - Copilot：`.github/prompts/`
  - Cursor：`.cursor/commands/`
  - Windsurf：`.windsurf/workflows/`

## 參數模式

不同代理使用不同的參數占位符：
- **基於 Markdown/prompt**：`$ARGUMENTS`
- **基於 TOML**：`{{args}}`
- **腳本占位符**：`{SCRIPT}`（替換為實際腳本路徑）
- **代理占位符**：`__AGENT__`（替換為代理名稱）

## 測試新的代理整合

1. **建構測試**：在本機執行套件建立腳本
2. **CLI 測試**：測試 `specify init --ai <agent>` 指令
3. **檔案產生**：驗證正確的目錄結構和檔案
4. **指令驗證**：確保產生的指令能與代理一起運作
5. **上下文更新**：測試代理上下文更新腳本

## 常見陷阱

1. **忘記更新腳本**：bash 和 PowerShell 腳本都必須更新
2. **缺少 CLI 檢查**：只有實際有 CLI 工具的代理才需要新增
3. **錯誤的參數格式**：為每個代理類型使用正確的佔位符格式
4. **目錄命名**：精確遵循代理特定的慣例
5. **說明文字不一致**：一致更新所有面向使用者的文字

## 未來考量

新增代理時：
- 考慮代理的原生指令/工作流程模式
- 確保與 Spec-Driven Development 流程的相容性
- 記錄任何特殊需求或限制
- 使用經驗教訓更新本指南

---

*每當新增代理時，都應該更新此文件以維持準確性和完整性。*