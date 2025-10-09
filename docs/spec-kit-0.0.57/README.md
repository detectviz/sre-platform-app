<div align="center">
    <img src="./media/logo_small.webp"/>
    <h1>🌱 Spec Kit</h1>
    <h3><em>更快地建構高品質軟體。</em></h3>
</div>

<p align="center">
    <strong>透過 Spec-Driven Development 幫助組織專注於產品場景，而非撰寫無差異化的程式碼。</strong>
</p>

[![Release](https://github.com/github/spec-kit/actions/workflows/release.yml/badge.svg)](https://github.com/github/spec-kit/actions/workflows/release.yml)

---

## 目錄

- [🤔 什麼是 Spec-Driven Development？](#-what-is-spec-driven-development)
- [⚡ 開始使用](#-get-started)
- [📽️ 影片概覽](#️-video-overview)
- [🤖 支援的 AI 代理](#-supported-ai-agents)
- [🔧 Specify CLI 參考](#-specify-cli-reference)
- [📚 核心理念](#-core-philosophy)
- [🌟 開發階段](#-development-phases)
- [🎯 實驗目標](#-experimental-goals)
- [🔧 先決條件](#-prerequisites)
- [📖 深入了解](#-learn-more)
- [📋 詳細流程](#-detailed-process)
- [🔍 疑難排解](#-troubleshooting)
- [👥 維護者](#-maintainers)
- [💬 支援](#-support)
- [🙏 致謝](#-acknowledgements)
- [📄 授權](#-license)

## 🤔 什麼是 Spec-Driven Development？

Spec-Driven Development **顛覆了**傳統軟體開發的方式。數十年來，程式碼一直是王道——規格文件只是我們在開始「真正工作」程式碼撰寫後就丟棄的腳手架。Spec-Driven Development 改變了這一切：**規格文件變得可執行**，直接產生可運作的實作，而非僅僅作為指導。

## ⚡ 開始使用

### 1. 安裝 Specify

選擇您偏好的安裝方式：

#### 選項 1：持續安裝（推薦）

安裝一次，到處使用：

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

然後直接使用工具：

```bash
specify init <PROJECT_NAME>
specify check
```

#### 選項 2：一次性使用

直接執行而不安裝：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

**持續安裝的好處：**

- 工具保持安裝並在 PATH 中可用
- 不需要建立 shell 別名
- 更好的工具管理，使用 `uv tool list`、`uv tool upgrade`、`uv tool uninstall`
- 更簡潔的 shell 配置

### 2. 建立專案原則

使用 **`/speckit.constitution`** 指令來建立專案的治理原則和開發指南，這些將引導所有後續開發工作。

```bash
/speckit.constitution 建立專注於程式碼品質、測試標準、使用者體驗一致性和效能需求的原則
```

### 3. 建立規格

使用 **`/speckit.specify`** 指令來描述您想要建構的內容。專注於**什麼**和**為什麼**，而非技術棧。

```bash
/speckit.specify 建置一個應用程式，能幫助我將照片組織在單獨的相簿中。相簿按日期分組，可以通過在主頁面上拖放來重新組織。相簿永遠不會在其他嵌套相簿中。在每個相簿內，照片以類似方塊的介面預覽。
```

### 4. 建立技術實作計劃

使用 **`/speckit.plan`** 指令來提供您的技術棧和架構選擇。

```bash
/speckit.plan 應用程式使用 Vite 和最少數量的程式庫。盡可能使用原生 HTML、CSS 和 JavaScript。圖片不會上傳到任何地方，元資料儲存在本地 SQLite 資料庫中。
```

### 5. 細分為任務

使用 **`/speckit.tasks`** 從實作計劃建立可執行的任務清單。

```bash
/speckit.tasks
```

### 6. 執行實作

使用 **`/speckit.implement`** 來執行所有任務並根據計劃建構功能。

```bash
/speckit.implement
```

詳細的逐步指示，請參閱我們的[完整指南](./spec-driven.md)。

## 📽️ 影片概覽

想要看到 Spec Kit 的實際運作嗎？觀看我們的[影片概覽](https://www.youtube.com/watch?v=a9eR1xsfvHg&pp=0gcJCckJAYcqIYzv)！

[![Spec Kit 影片標題](/media/spec-kit-video-header.jpg)](https://www.youtube.com/watch?v=a9eR1xsfvHg&pp=0gcJCckJAYcqIYzv)

## 🤖 支援的 AI 代理

| 代理                                                       | 支援度 | 註記                                              |
|-----------------------------------------------------------|---------|---------------------------------------------------|
| [Claude Code](https://www.anthropic.com/claude-code)      | ✅ |                                                   |
| [GitHub Copilot](https://code.visualstudio.com/)          | ✅ |                                                   |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | ✅ |                                                   |
| [Cursor](https://cursor.sh/)                              | ✅ |                                                   |
| [Qwen Code](https://github.com/QwenLM/qwen-code)          | ✅ |                                                   |
| [opencode](https://opencode.ai/)                          | ✅ |                                                   |
| [Windsurf](https://windsurf.com/)                         | ✅ |                                                   |
| [Kilo Code](https://github.com/Kilo-Org/kilocode)         | ✅ |                                                   |
| [Auggie CLI](https://docs.augmentcode.com/cli/overview)   | ✅ |                                                   |
| [Roo Code](https://roocode.com/)                          | ✅ |                                                   |
| [Codex CLI](https://github.com/openai/codex)              | ✅ |                                                   |
| [Amazon Q Developer CLI](https://aws.amazon.com/developer/learning/q-developer-cli/) | ⚠️ | Amazon Q Developer CLI [不支援](https://github.com/aws/amazon-q-developer-cli/issues/3064) 斜槓指令的自訂參數。 |

## 🔧 Specify CLI 參考

`specify` 指令支援以下選項：

### 指令

| 指令        | 描述                                                           |
|-------------|----------------------------------------------------------------|
| `init`      | 從最新模板初始化新的 Specify 專案                              |
| `check`     | 檢查已安裝的工具 (`git`, `claude`, `gemini`, `code`/`code-insiders`, `cursor-agent`, `windsurf`, `qwen`, `opencode`, `codex`) |

### `specify init` 參數與選項

| 參數/選項              | 類型     | 描述                                                                       |
|------------------------|----------|------------------------------------------------------------------------------|
| `<project-name>`       | 參數     | 新專案目錄的名稱（使用 `--here` 時為選用，或使用 `.` 代表目前目錄）         |
| `--ai`                 | 選項     | 要使用的 AI 助理：`claude`, `gemini`, `copilot`, `cursor`, `qwen`, `opencode`, `codex`, `windsurf`, `kilocode`, `auggie`, `roo`, 或 `q` |
| `--script`             | 選項     | 要使用的腳本變體：`sh` (bash/zsh) 或 `ps` (PowerShell)                      |
| `--ignore-agent-tools` | 旗標     | 跳過 AI 代理工具的檢查，如 Claude Code                                      |
| `--no-git`             | 旗標     | 跳過 git 儲存庫初始化                                                       |
| `--here`               | 旗標     | 在目前目錄初始化專案，而非建立新目錄                                        |
| `--force`              | 旗標     | 在目前目錄初始化時強制合併/覆蓋（跳過確認）                                 |
| `--skip-tls`           | 旗標     | 跳過 SSL/TLS 驗證（不推薦）                                                 |
| `--debug`              | 旗標     | 啟用詳細的除錯輸出以進行疑難排解                                            |
| `--github-token`       | 選項     | GitHub API 請求的權杖（或設定 GH_TOKEN/GITHUB_TOKEN 環境變數）              |

### 範例

```bash
# 基本專案初始化
specify init my-project

# 使用特定 AI 助理初始化
specify init my-project --ai claude

# 使用 Cursor 支援初始化
specify init my-project --ai cursor

# 使用 Windsurf 支援初始化
specify init my-project --ai windsurf

# 使用 PowerShell 腳本初始化（Windows/跨平台）
specify init my-project --ai copilot --script ps

# 在目前目錄初始化
specify init . --ai copilot
# 或使用 --here 旗標
specify init --here --ai copilot

# 強制合併到目前（非空）目錄而不確認
specify init . --force --ai copilot
# 或
specify init --here --force --ai copilot

# 跳過 git 初始化
specify init my-project --ai gemini --no-git

# 啟用除錯輸出以進行疑難排解
specify init my-project --ai claude --debug

# 使用 GitHub 權杖進行 API 請求（適用於企業環境）
specify init my-project --ai claude --github-token ghp_your_token_here

# 檢查系統需求
specify check
```

### 可用的斜槓指令

執行 `specify init` 後，您的 AI 編程代理將能夠存取這些用於結構化開發的斜槓指令：

#### 核心指令

Spec-Driven Development 工作流程的基本指令：

| 指令                      | 描述                                                                  |
|--------------------------|-----------------------------------------------------------------------|
| `/speckit.constitution`  | 建立或更新專案治理原則和開發指南                                      |
| `/speckit.specify`       | 定義要建構的內容（需求和使用者故事）                                  |
| `/speckit.plan`          | 使用您選擇的技術棧建立技術實作計劃                                    |
| `/speckit.tasks`         | 產生實作的可執行任務清單                                              |
| `/speckit.implement`     | 根據計劃執行所有任務以建構功能                                        |

#### 選用指令

增強品質和驗證的額外指令：

| 指令                  | 描述                                                                  |
|----------------------|-----------------------------------------------------------------------|
| `/speckit.clarify`   | 澄清未充分指定的領域（建議在 `/speckit.plan` 之前執行；以前稱為 `/quizme`） |
| `/speckit.analyze`   | 跨文件一致性和覆蓋分析（在 `/speckit.tasks` 之後、`/speckit.implement` 之前執行） |
| `/speckit.checklist` | 產生自訂品質檢查清單，用於驗證需求完整性、清晰度和一致性（如同英文的「單元測試」） |

### 環境變數

| 變數              | 描述                                                                                           |
|------------------|------------------------------------------------------------------------------------------------|
| `SPECIFY_FEATURE` | 覆蓋非 Git 儲存庫的功能偵測。設定為功能目錄名稱（例如：`001-photo-albums`），以在使用非 Git 分支時處理特定功能。<br/>**必須在使用 `/speckit.plan` 或後續指令之前，在您使用的代理上下文中設定。 |

## 📚 核心理念

Spec-Driven Development 是一個強調以下重點的結構化流程：

- **意圖驅動開發**：規格文件先定義「什麼」，再決定「如何」
- **豐富規格建立**：使用護欄和組織原則
- **多步精煉**：而非從提示一次性產生程式碼
- **大量依賴**進階 AI 模型能力進行規格解讀

## 🌟 開發階段

| 階段 | 焦點 | 關鍵活動 |
|-------|-------|----------------|
| **0 到 1 開發**（「Greenfield」） | 從零開始產生 | <ul><li>從高階需求開始</li><li>產生規格</li><li>規劃實作步驟</li><li>建構生產就緒的應用程式</li></ul> |
| **創意探索** | 平行實作 | <ul><li>探索多樣化解決方案</li><li>支援多種技術棧和架構</li><li>實驗 UX 模式</li></ul> |
| **疊代增強**（「Brownfield」） | 既有系統現代化 | <ul><li>疊代新增功能</li><li>現代化遺留系統</li><li>調整流程</li></ul> |

## 🎯 實驗目標

我們的研究和實驗重點包括：

### 技術獨立性

- 使用多樣化技術棧建立應用程式
- 驗證 Spec-Driven Development 是一個不綁定特定技術、程式語言或框架的流程

### 企業限制

- 展示關鍵任務應用程式開發
- 納入組織限制（雲端供應商、技術棧、工程實務）
- 支援企業設計系統和合規需求

### 以使用者為中心的開發

- 為不同使用者群體和偏好建立應用程式
- 支援各種開發方法（從 vibe-coding 到 AI 原生開發）

### 創意和疊代流程

- 驗證平行實作探索的概念
- 提供強健的疊代功能開發工作流程
- 擴展流程以處理升級和現代化任務

## 🔧 先決條件

- **Linux/macOS**（或 Windows 上的 WSL2）
- AI 編程代理：[Claude Code](https://www.anthropic.com/claude-code)、[GitHub Copilot](https://code.visualstudio.com/)、[Gemini CLI](https://github.com/google-gemini/gemini-cli)、[Cursor](https://cursor.sh/)、[Qwen CLI](https://github.com/QwenLM/qwen-code)、[opencode](https://opencode.ai/)、[Codex CLI](https://github.com/openai/codex)、[Windsurf](https://windsurf.com/) 或 [Amazon Q Developer CLI](https://aws.amazon.com/developer/learning/q-developer-cli/)
- [uv](https://docs.astral.sh/uv/) 用於套件管理
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

如果您遇到代理相關問題，請開啟 issue 以便我們改進整合。

## 📖 深入了解

- **[完整的 Spec-Driven Development 方法論](./spec-driven.md)** - 深入探討完整流程
- **[詳細逐步指南](#-detailed-process)** - 一步步實作指南

---

## 📋 詳細流程

<details>
<summary>點擊展開詳細的逐步指南</summary>

您可以使用 Specify CLI 來引導您的專案，這將在您的環境中引入所需的工件。執行：

```bash
specify init <project_name>
```

或在目前目錄初始化：

```bash
specify init .
# 或使用 --here 旗標
specify init --here
# 當目錄已有檔案時跳過確認
specify init . --force
# 或
specify init --here --force
```

![Specify CLI 在終端機中引導新專案](./media/specify_cli.gif)

系統會提示您選擇使用的 AI 代理。您也可以在終端機中直接預先指定：

```bash
specify init <project_name> --ai claude
specify init <project_name> --ai gemini
specify init <project_name> --ai copilot

# 或在目前目錄：
specify init . --ai claude
specify init . --ai codex

# 或使用 --here 旗標
specify init --here --ai claude
specify init --here --ai codex

# 強制合併到非空的目前目錄
specify init . --force --ai claude

# 或
specify init --here --force --ai claude
```

CLI 會檢查您是否已安裝 Claude Code、Gemini CLI、Cursor CLI、Qwen CLI、opencode、Codex CLI 或 Amazon Q Developer CLI。如果沒有安裝，或您偏好在不檢查正確工具的情況下取得模板，請在指令中使用 `--ignore-agent-tools`：

```bash
specify init <project_name> --ai claude --ignore-agent-tools
```

### **步驟 1：** 建立專案原則

前往專案資料夾並執行您的 AI 代理。在我們的範例中，我們使用 `claude`。

![引導 Claude Code 環境](./media/bootstrap-claude-code.gif)

如果您看到 `/speckit.constitution`、`/speckit.specify`、`/speckit.plan`、`/speckit.tasks` 和 `/speckit.implement` 指令可用，就表示配置正確。

第一步應該使用 `/speckit.constitution` 指令建立專案的治理原則。這有助於確保在所有後續開發階段中保持一致的決策：

```text
/speckit.constitution 建立專注於程式碼品質、測試標準、使用者體驗一致性和效能需求的原則。包含治理規範，說明這些原則應該如何引導技術決策和實作選擇。
```

此步驟會建立或更新 `.specify/memory/constitution.md` 文件，其中包含專案的基本指南，AI 代理在規格制定、規劃和實作階段都會參考這些指南。

### **步驟 2：** 建立專案規格

在建立專案原則後，您現在可以建立功能規格。使用 `/speckit.specify` 指令，然後提供您要開發專案的具體需求。

>[!IMPORTANT]
>盡可能明確說明您要建構**什麼**以及**為什麼**。**此時不要專注於技術棧**。

範例提示：

```text
開發 Taskify，一個團隊生產力平台。它應該允許使用者建立專案、新增團隊成員、
以 Kanban 風格分配任務、評論和在板子間移動任務。在此功能的初始階段，
讓我們稱它為「建立 Taskify」，讓我們有多個使用者，但使用者將提前宣告、預定義。
我想要五個使用者在兩個不同類別中，一個產品經理和四個工程師。讓我們建立三個
不同的範例專案。讓我們為每個任務的狀態設置標準 Kanban 欄位，例如「待辦」、
「進行中」、「審查中」和「完成」。此應用程式將沒有登入，因為這只是確保
我們基本功能設置的第一個測試事項。對於 UI 中每個任務的任務卡片，
您應該能夠在 Kanban 工作板的不同欄位間改變任務的目前狀態。
您應該能夠為特定卡片留下無限數量的評論。您應該能夠從該任務
卡片分配一個有效使用者。當您首次啟動 Taskify 時，它會給您五個使用者
清單供選擇。不需要密碼。當您點擊使用者時，您進入主視圖，顯示專案清單。
當您點擊專案時，您開啟該專案的 Kanban 板。您會看到欄位。
您能夠在不同欄位間來回拖放卡片。您會看到任何分配給您（目前登入的使用者）的
卡片，以與其他所有卡片不同的顏色顯示，以便您快速看到自己的。您可以編輯
您做的任何評論，但不能編輯其他人做的評論。您可以刪除您做的任何評論，
但不能刪除任何人做的評論。
```

輸入此提示後，您應該會看到 Claude Code 啟動規劃和規格起草流程。Claude Code 還會觸發一些內建腳本來設定儲存庫。

此步驟完成後，您應該會有一個新分支建立（例如：`001-create-taskify`），以及 `specs/001-create-taskify` 目錄中的新規格。

產生的規格應包含一組使用者故事和功能需求，如模板中定義。

在此階段，您的專案資料夾內容應類似於以下結構：

```text
└── .specify
    ├── memory
    │	 └── constitution.md
    ├── scripts
    │	 ├── check-prerequisites.sh
    │	 ├── common.sh
    │	 ├── create-new-feature.sh
    │	 ├── setup-plan.sh
    │	 └── update-claude-md.sh
    ├── specs
    │	 └── 001-create-taskify
    │	     └── spec.md
    └── templates
        ├── plan-template.md
        ├── spec-template.md
        └── tasks-template.md
```

### **步驟 3：** 功能規格澄清（規劃前必要）

在建立基準規格後，您可以繼續澄清首次嘗試中未正確擷取的任何需求。

您應該在建立技術計劃**之前**執行結構化澄清工作流程，以減少下游的重工。

偏好順序：
1. 使用 `/speckit.clarify`（結構化）– 順序性、覆蓋率基礎的提問，在澄清部分記錄答案。
2. 或者，如果某些部分仍感覺模糊，可跟進臨時自由形式的精煉。

如果您有意跳過澄清（例如：尖峰或探索性原型），請明確說明，以便代理不會因遺漏的澄清而受阻。

範例自由形式精煉提示（在 `/speckit.clarify` 之後如果仍需要）：

```text
對於每個範例專案或您建立的專案，每個專案應該有 5 到 15 個任務的變動數量，
隨機分佈到不同的完成狀態。確保每個完成階段至少有一個任務。
```

您還應該要求 Claude Code 驗證**審查與驗收檢查清單**，勾選已驗證/通過需求的事項，未通過的則保持未勾選。可以使用以下提示：

```text
閱讀審查和驗收檢查清單，如果功能規格符合標準，則勾選檢查清單中的每個項目。如果不符合，則留空。
```

重要的是將與 Claude Code 的互動視為澄清規格和提出問題的機會——**不要將其首次嘗試視為最終版本**。

### **步驟 4：** 產生計劃

您現在可以具體說明技術棧和其他技術需求。您可以使用專案模板中內建的 `/speckit.plan` 指令，提示如下：

```text
我們將使用 .NET Aspire 產生這個，使用 Postgres 作為資料庫。前端應該使用
Blazor server 搭配拖放任務板、即時更新。應該建立 REST API，包含專案 API、
任務 API 和通知 API。
```

此步驟的輸出將包含多個實作詳細文件，您的目錄樹將類似於此：

```text
.
├── CLAUDE.md
├── memory
│	 └── constitution.md
├── scripts
│	 ├── check-prerequisites.sh
│	 ├── common.sh
│	 ├── create-new-feature.sh
│	 ├── setup-plan.sh
│	 └── update-claude-md.sh
├── specs
│	 └── 001-create-taskify
│	     ├── contracts
│	     │	 ├── api-spec.json
│	     │	 └── signalr-spec.md
│	     ├── data-model.md
│	     ├── plan.md
│	     ├── quickstart.md
│	     ├── research.md
│	     └── spec.md
└── templates
    ├── CLAUDE-template.md
    ├── plan-template.md
    ├── spec-template.md
    └── tasks-template.md
```

檢查 `research.md` 文件，確保根據您的指示使用了正確的技術棧。如果任何元件突出，您可以要求 Claude Code 進行精煉，甚至檢查本地安裝的平台/框架版本（例如：.NET）。

此外，如果選擇的技術棧是快速變化的（例如：.NET Aspire、JS 框架），您可能想要要求 Claude Code 研究技術棧的詳細資訊，提示如下：

```text
我希望您檢查實作計劃和實作詳細內容，尋找可能從額外研究中受益的領域，因為 .NET Aspire 是一個快速變化的程式庫。對於您識別出需要進一步研究的那些領域，我希望您更新研究文件，加入我們將在這個 Taskify 應用程式中使用的具體版本的額外詳細資訊，並啟動平行研究任務，使用網路上的研究來澄清任何細節。
```

在此過程中，您可能會發現 Claude Code 卡在研究錯誤的東西——您可以用以下提示來引導它朝正確方向前進：

```text
我想我們需要將這個分解成一系列步驟。首先，識別一個任務清單，
這些是您在實作期間不確定或會從進一步研究中受益的任務。寫下這些任務的清單。然後對於每個任務，
我想讓您啟動一個單獨的研究任務，以便最終結果是我們平行研究
所有這些非常特定的任務。我看到您做的是，看起來您正在
一般性研究 .NET Aspire，我不認為這對我們的情況會有太大幫助。
這是研究範圍太廣。研究需要幫助您解決特定的目標問題。
```

>[!NOTE]
>Claude Code 可能過度熱心而新增您未要求的元件。要求它澄清變更的理由和來源。

### **步驟 5：** 讓 Claude Code 驗證計劃

計劃就位後，您應該讓 Claude Code 檢查計劃，確保沒有遺漏的部分。您可以使用以下提示：

```text
現在我想讓您審核實作計劃和實作詳細檔案。
仔細閱讀它，以確定是否有從閱讀中顯而易見的任務序列需要執行。
因為我不確定這裡是否足夠。例如，
當我查看核心實作時，如果能夠參考實作
細節中適當的地方，當它逐步執行核心實作或精煉時會很有用。
```

這有助於精煉實作計劃，並幫助您避免 Claude Code 在其規劃週期中遺漏的潛在盲點。一旦初始精煉階段完成，在進入實作之前，要求 Claude Code 再次檢查檢查清單。

如果您安裝了 [GitHub CLI](https://docs.github.com/en/github-cli/github-cli)，您還可以要求 Claude Code 從目前分支建立一個詳細描述的 pull request 到 `main`，以確保工作被正確追蹤。

>[!NOTE]
>在讓代理實作之前，還值得提示 Claude Code 交叉檢查細節，看是否有任何過度設計的元件（記住——它可能過度熱心）。如果存在過度設計的元件或決定，要求 Claude Code 解決它們。確保 Claude Code 遵循 [constitution](base/memory/constitution.md) 作為建立計劃時必須遵守的基礎文件。

### 步驟 6：實作

準備就緒後，使用 `/speckit.implement` 指令執行您的實作計劃：

```text
/speckit.implement
```

`/speckit.implement` 指令將會：
- 驗證所有先決條件是否就位（constitution、spec、plan 和 tasks）
- 從 `tasks.md` 解析任務細分
- 按照正確順序執行任務，尊重依賴關係和平行執行標記
- 遵循任務計劃中定義的 TDD 方法
- 提供進度更新並適當處理錯誤

>[!IMPORTANT]
>AI 代理將執行本機 CLI 指令（如 `dotnet`、`npm` 等）- 請確保您的機器上已安裝所需工具。

實作完成後，測試應用程式並解決 CLI 日誌中可能不可見的運行時錯誤（例如瀏覽器控制台錯誤）。您可以將這些錯誤複製並貼回給您的 AI 代理以獲得解決方案。

</details>

---

## 🔍 疑難排解

### Linux 上的 Git Credential Manager

如果您在 Linux 上遇到 Git 認證問題，可以安裝 Git Credential Manager：

```bash
#!/usr/bin/env bash
set -e
echo "正在下載 Git Credential Manager v2.6.1..."
wget https://github.com/git-ecosystem/git-credential-manager/releases/download/v2.6.1/gcm-linux_amd64.2.6.1.deb
echo "正在安裝 Git Credential Manager..."
sudo dpkg -i gcm-linux_amd64.2.6.1.deb
echo "正在配置 Git 使用 GCM..."
git config --global credential.helper manager
echo "正在清理..."
rm gcm-linux_amd64.2.6.1.deb
```

## 👥 維護者

- Den Delimarsky ([@localden](https://github.com/localden))
- John Lam ([@jflam](https://github.com/jflam))

## 💬 支援

如需支援，請開啟 [GitHub issue](https://github.com/github/spec-kit/issues/new)。我們歡迎錯誤報告、功能請求以及有關使用 Spec-Driven Development 的問題。

## 🙏 致謝

此專案深受 [John Lam](https://github.com/jflam) 的工作和研究的影響。

## 📄 授權

此專案根據 MIT 開源授權條款授權。請參閱 [LICENSE](./LICENSE) 文件以取得完整條款。
