# 安裝指南

## 先決條件

- **Linux/macOS**（或 Windows；PowerShell 腳本現在無需 WSL 即可支援）
- AI 編程代理：[Claude Code](https://www.anthropic.com/claude-code)、[GitHub Copilot](https://code.visualstudio.com/) 或 [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [uv](https://docs.astral.sh/uv/) 用於套件管理
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

## 安裝

### 初始化新專案

開始使用的最簡單方法是初始化新專案：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

或在目前目錄中初始化：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init .
# 或使用 --here 旗標
uvx --from git+https://github.com/github/spec-kit.git specify init --here
```

### 指定 AI 代理

您可以在初始化期間主動指定您的 AI 代理：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --ai claude
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --ai gemini
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --ai copilot
```

### 指定腳本類型（Shell vs PowerShell）

所有自動化腳本現在都有 Bash (`.sh`) 和 PowerShell (`.ps1`) 兩個變體。

自動行為：
- Windows 預設：`ps`
- 其他作業系統預設：`sh`
- 互動模式：除非您傳遞 `--script`，否則會提示您

強制指定腳本類型：
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --script sh
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --script ps
```

### 忽略代理工具檢查

如果您偏好在不檢查正確工具的情況下獲取模板：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <project_name> --ai claude --ignore-agent-tools
```

## 驗證

初始化後，您應該在您的 AI 代理中看到以下命令可用：
- `/speckit.specify` - 建立規格
- `/speckit.plan` - 產生實作計劃
- `/speckit.tasks` - 細分為可執行的任務

`.specify/scripts` 目錄將包含 `.sh` 和 `.ps1` 腳本。

## 疑難排解

### Linux 上的 Git Credential Manager

如果您在 Linux 上遇到 Git 認證問題，您可以安裝 Git Credential Manager：

```bash
#!/usr/bin/env bash
set -e
echo "下載 Git Credential Manager v2.6.1..."
wget https://github.com/git-ecosystem/git-credential-manager/releases/download/v2.6.1/gcm-linux_amd64.2.6.1.deb
echo "安裝 Git Credential Manager..."
sudo dpkg -i gcm-linux_amd64.2.6.1.deb
echo "配置 Git 使用 GCM..."
git config --global credential.helper manager
echo "清理中..."
rm gcm-linux_amd64.2.6.1.deb
```
