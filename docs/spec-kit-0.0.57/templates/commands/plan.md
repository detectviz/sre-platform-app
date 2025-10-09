---
description: 使用計劃模板執行實作規劃工作流程以產生設計工件。
scripts:
  sh: scripts/bash/setup-plan.sh --json
  ps: scripts/powershell/setup-plan.ps1 -Json
agent_scripts:
  sh: scripts/bash/update-agent-context.sh __AGENT__
  ps: scripts/powershell/update-agent-context.ps1 -AgentType __AGENT__
---

## 使用者輸入

```text
$ARGUMENTS
```

如果不為空，您**必須**在繼續之前考慮使用者輸入。

## 大綱

1. **設定**：從儲存庫根目錄執行 `{SCRIPT}` 並解析 FEATURE_SPEC、IMPL_PLAN、SPECS_DIR、BRANCH 的 JSON。

2. **載入上下文**：讀取 FEATURE_SPEC 和 `.specify/memory/constitution.md`。載入 IMPL_PLAN 模板（已複製）。

3. **執行計劃工作流程**：遵循 IMPL_PLAN 模板中的結構來：
   - 填寫技術上下文（將未知事項標記為 "NEEDS CLARIFICATION"）
   - 從憲法填寫憲法檢查部分
   - 評估門檻（如果違規未經正當理由則 ERROR）
   - 階段 0：產生 research.md（解決所有 NEEDS CLARIFICATION）
   - 階段 1：產生 data-model.md、contracts/、quickstart.md
   - 階段 1：通過執行代理腳本更新代理上下文
   - 設計後重新評估憲法檢查

4. **停止並報告**：命令在階段 2 規劃後結束。報告分支、IMPL_PLAN 路徑和產生的工件。

## 階段

### 階段 0：大綱與研究

1. **從上面的技術上下文提取未知事項**：
   - 對於每個 NEEDS CLARIFICATION → 研究任務
   - 對於每個依賴 → 最佳實務任務
   - 對於每個整合 → 模式任務

2. **產生並分派研究代理**：
   ```
   對於技術上下文中的每個未知事項：
     任務："為 {功能上下文} 研究 {未知事項}"
   對於每個技術選擇：
     任務："在 {領域} 中為 {技術} 尋找最佳實務"
   ```

3. **使用格式在 `research.md` 中整合發現**：
   - 決定：[選擇了什麼]
   - 理由：[為什麼選擇]
   - 考慮的替代方案：[評估了什麼其他選項]

**輸出**：research.md，其中所有 NEEDS CLARIFICATION 已解決

### 階段 1：設計與契約

**先決條件：** `research.md` 完成

1. **從功能規格提取實體** → `data-model.md`：
   - 實體名稱、欄位、關係
   - 來自需求的驗證規則
   - 如果適用，狀態轉換

2. **從功能需求產生 API 契約**：
   - 對於每個使用者動作 → 端點
   - 使用標準 REST/GraphQL 模式
   - 將 OpenAPI/GraphQL 架構輸出到 `/contracts/`

3. **代理上下文更新**：
   - 執行 `{AGENT_SCRIPT}`
   - 這些腳本偵測正在使用的 AI 代理
   - 更新適當的代理特定上下文檔案
   - 僅從目前計劃新增新技術
   - 在標記之間保留手動新增

**輸出**：data-model.md、/contracts/*、quickstart.md、代理特定檔案

## 關鍵規則

- 使用絕對路徑
- 在門檻失敗或未解決的澄清上 ERROR
