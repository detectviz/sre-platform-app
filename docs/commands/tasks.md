---
description: 根據可用的設計文件，生成一份可執行且依賴順序排列的 tasks.md。
---

使用者輸入可以直接由代理提供或作為命令參數 - 你 **必須** 在繼續執行提示前考慮它（如果不為空）。

使用者輸入：

$ARGUMENTS

1. 從 repo root 執行 `.specify/scripts/bash/check-prerequisites.sh --json` 並解析 FEATURE_DIR 與 AVAILABLE_DOCS 清單。所有路徑必須為絕對路徑。
2. 載入並分析可用的設計文件：
   - 一定要讀取 plan.md 以了解技術棧與函式庫
   - 如果存在：讀取 data-model.md 以獲取實體
   - 如果存在：讀取 contracts/ 以獲取 API endpoints
   - 如果存在：讀取 research.md 以獲取技術決策
   - 如果存在：讀取 quickstart.md 以獲取測試場景

   注意：並非所有專案都有所有文件。例如：
   - CLI 工具可能沒有 contracts/
   - 簡單函式庫可能不需要 data-model.md
   - 根據可用文件生成任務

3. 依照範本生成任務：
   - 使用 `.specify/templates/tasks-template.md` 作為基底
   - 用實際任務替換範例任務，根據：
     * **Setup 任務**：專案初始化、依賴、linting
     * **Test 任務 [P]**：每個 contract 一個，每個整合場景一個
     * **Core 任務**：每個實體、服務、CLI 指令、endpoint 一個
     * **Integration 任務**：資料庫連線、中介軟體、日誌記錄
     * **Polish 任務 [P]**：單元測試、效能、文件

4. 任務生成規則：
   - 每個 contract 檔案 → contract 測試任務，標記 [P]
   - data-model 中每個實體 → 模型建立任務，標記 [P]
   - 每個 endpoint → 實作任務（若共用檔案則非平行）
   - 每個使用者故事 → 整合測試，標記 [P]
   - 不同檔案 = 可平行 [P]
   - 同一檔案 = 順序執行（無 [P]）

5. 任務依賴順序：
   - Setup 任務最先
   - 測試任務在實作前（TDD）
   - 模型先於服務
   - 服務先於 endpoints
   - Core 任務先於整合任務
   - 所有任務先於 polish 任務

6. 包含平行執行範例：
   - 將可同時執行的 [P] 任務分組
   - 顯示實際 Task agent 指令

7. 建立 FEATURE_DIR/tasks.md，內容包含：
   - 來自實作計畫的正確功能名稱
   - 編號任務（T001、T002 等）
   - 每個任務的明確檔案路徑
   - 依賴說明
   - 平行執行指引

任務生成背景：$ARGUMENTS

tasks.md 應可立即執行 - 每個任務必須具體到 LLM 可在無額外上下文下完成。
