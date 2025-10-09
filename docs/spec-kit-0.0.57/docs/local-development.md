# 本地開發指南

此指南展示如何在本地迭代 `specify` CLI，而無需先發佈發行版本或提交到 `main`。

> 腳本現在有 Bash (`.sh`) 和 PowerShell (`.ps1`) 兩個變體。CLI 根據作業系統自動選擇，除非您傳遞 `--script sh|ps`。

## 1. 複製並切換分支

```bash
git clone https://github.com/github/spec-kit.git
cd spec-kit
# 在功能分支上工作
git checkout -b your-feature-branch
```

## 2. 直接執行 CLI（最快回饋）

您可以通過模組進入點執行 CLI，而無需安裝任何東西：

```bash
# 從儲存庫根目錄
python -m src.specify_cli --help
python -m src.specify_cli init demo-project --ai claude --ignore-agent-tools --script sh
```

如果您偏好呼叫腳本檔案風格（使用 shebang）：

```bash
python src/specify_cli/__init__.py init demo-project --script ps
```

## 3. 使用可編輯安裝（隔離環境）

使用 `uv` 建立隔離環境，以便依賴解析與最終使用者獲取的方式完全相同：

```bash
# 建立並啟動虛擬環境（uv 自動管理 .venv）
uv venv
source .venv/bin/activate  # 或在 Windows PowerShell 上：.venv\Scripts\Activate.ps1

# 以可編輯模式安裝專案
uv pip install -e .

# 現在 'specify' 進入點可用
specify --help
```

由於可編輯模式，在程式碼編輯後重新執行不需要重新安裝。

## 4. 使用 uvx 直接從 Git 呼叫（目前分支）

`uvx` 可以從本地路徑（或 Git 參考）執行，以模擬使用者流程：

```bash
uvx --from . specify init demo-uvx --ai copilot --ignore-agent-tools --script sh
```

您也可以將 uvx 指向特定分支而不合併：

```bash
# 先推送您的工作分支
git push origin your-feature-branch
uvx --from git+https://github.com/github/spec-kit.git@your-feature-branch specify init demo-branch-test --script ps
```

### 4a. 絕對路徑 uvx（從任何地方執行）

如果您在其他目錄中，請使用絕對路徑而不是 `.`：

```bash
uvx --from /mnt/c/GitHub/spec-kit specify --help
uvx --from /mnt/c/GitHub/spec-kit specify init demo-anywhere --ai copilot --ignore-agent-tools --script sh
```

設定環境變數以方便使用：
```bash
export SPEC_KIT_SRC=/mnt/c/GitHub/spec-kit
uvx --from "$SPEC_KIT_SRC" specify init demo-env --ai copilot --ignore-agent-tools --script ps
```

（可選）定義 shell 函數：
```bash
specify-dev() { uvx --from /mnt/c/GitHub/spec-kit specify "$@"; }
# 然後
specify-dev --help
```

## 5. 測試腳本權限邏輯

執行 `init` 後，檢查在 POSIX 系統上 shell 腳本是否可執行：

```bash
ls -l scripts | grep .sh
# 期望所有者執行位（例如 -rwxr-xr-x）
```
在 Windows 上，您將改用 `.ps1` 腳本（不需要 chmod）。

## 6. 執行 Lint / 基本檢查（新增您自己的）

目前沒有強制執行 lint 配置，但您可以快速檢查可匯入性：
```bash
python -c "import specify_cli; print('匯入 OK')"
```

## 7. 本地建置 Wheel（可選）

在發佈前驗證封裝：

```bash
uv build
ls dist/
```
如需要，將建置的成品安裝到新的拋棄式環境中。

## 8. 使用臨時工作區

在臟目錄中測試 `init --here` 時，建立臨時工作區：

```bash
mkdir /tmp/spec-test && cd /tmp/spec-test
python -m src.specify_cli init --here --ai claude --ignore-agent-tools --script sh  # 如果儲存庫複製到此處
```
或者如果您想要更輕的工作區，只複製修改的 CLI 部分。

## 9. 調試網路 / TLS 略過

如果您在實驗時需要繞過 TLS 驗證：

```bash
specify check --skip-tls
specify init demo --skip-tls --ai gemini --ignore-agent-tools --script ps
```
（僅用於本地實驗。）

## 10. 快速編輯循環摘要

| 動作 | 命令 |
|------|------|
| 直接執行 CLI | `python -m src.specify_cli --help` |
| 可編輯安裝 | `uv pip install -e .` 然後 `specify ...` |
| 本地 uvx 執行（儲存庫根目錄） | `uvx --from . specify ...` |
| 本地 uvx 執行（絕對路徑） | `uvx --from /mnt/c/GitHub/spec-kit specify ...` |
| Git 分支 uvx | `uvx --from git+URL@branch specify ...` |
| 建置 wheel | `uv build` |

## 11. 清理

快速移除建置成品 / 虛擬環境：
```bash
rm -rf .venv dist build *.egg-info
```

## 12. 常見問題

| 症狀 | 修復 |
|------|------|
| `ModuleNotFoundError: typer` | 執行 `uv pip install -e .` |
| 腳本不可執行（Linux） | 重新執行 init 或 `chmod +x scripts/*.sh` |
| Git 步驟跳過 | 您傳遞了 `--no-git` 或未安裝 Git |
| 下載錯誤的腳本類型 | 明確傳遞 `--script sh` 或 `--script ps` |
| 企業網路上的 TLS 錯誤 | 嘗試 `--skip-tls`（不適用於生產環境） |

## 13. 下一步

- 更新文檔並使用您的修改後 CLI 執行快速入門
- 滿意時開啟 PR
- （可選）一旦變更進入 `main`，標記發行版本

