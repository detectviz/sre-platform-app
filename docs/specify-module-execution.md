# SpecKit 模組執行分析報告 (specify-module-execution.md)

## 1. 總覽摘要

本報告旨在根據 SpecKit 的「規格驅動開發 (SDD)」哲學，為 `docs/modules/` 目錄下的所有模組規劃 `specify` 命令的執行順序與策略。SpecKit 的核心理念是將規格視為可執行的真理來源，程式碼則是其最終產物。為確保架構的穩定性與模組間的依賴關係正確建立，`specify` 命令必須分階段、有順序地執行。

我們將模組執行分為四個主要階段，以確保流程的穩健性：

1.  **階段一：核心平台 (Core Platform)**：建立系統最基礎的身份認證、授權、使用者設定檔與導航結構。此為所有其他功能的基石。
2.  **階段二：平台服務 (Platform Services)**：在核心平台之上，建構通用的橫向服務，如標籤、郵件、通知與監控儀表板整合。
3.  **階段三：核心功能 (Core Features)**：基於平台服務，實作產品的核心業務邏輯，例如資源管理、日誌洞察與儀表板管理。
4.  **階段四：應用功能 (Application Features)**：在所有基礎設施完備後，建構上層的應用場景，如告警規則、事件列表與自動化管理。

此順序確保了依賴的向下流動，從而最小化重工風險，並使每個模組在 `specify` 階段都能基於一個穩定且已定義的底層進行規格生成。

---

## 2. 模組執行順序表

下表詳細定義了每個模組的執行順序、所屬階段、核心依賴以及在 `specify` 命令生命週期中的關鍵任務。

| 順序 | 模組名稱 | 階段 | 核心依賴 | `/speckit.specify` 階段任務 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `001-platform-auth` | 核心平台 | 無 | 定義使用者認證、SSO、JWT 策略。 |
| 2 | `002-identity-access-management` | 核心平台 | `platform-auth` | 定義 RBAC 角色、權限模型。 |
| 3 | `015-user-profile` | 核心平台 | `platform-auth` | 定義使用者個人資料、偏好設定。 |
| 4 | `017-platform-license` | 核心平台 | `platform-auth` | 定義平台授權與功能啟用邏輯。 |
| 5 | `005-platform-navigation` | 核心平台 | `identity-access-management` | 定義系統主導航、基於權限的菜單。 |
| 6 | `003-platform-tag` | 平台服務 | `platform-auth` | 定義全域標籤服務與管理功能。 |
| 7 | `004-platform-mail` | 平台服務 | `platform-auth` | 定義郵件範本與發送服務。 |
| 8 | `012-notification-management` | 平台服務 | `platform-auth`, `platform-mail` | 定義通知規則、通道與訂閱模型。 |
| 9 | `006-platform-grafana` | 平台服務 | `platform-auth` | 定義 Grafana 嵌入與權限同步。 |
| 10 | `007-resources-management` | 核心功能 | `platform-tag` | 定義核心資源的 CRUD 與管理。 |
| 11 | `008-insight-log` | 核心功能 | `resources-management` | 定義日誌採集、查詢與儲存。 |
| 12 | `009-insight-analysis` | 核心功能 | `insight-log` | 定義基於日誌的分析與可視化。 |
| 13 | `014-dashboards-management` | 核心功能 | `insight-analysis`, `platform-grafana` | 定義自訂儀表板的建立與管理。 |
| 14 | `010-incident-rules` | 應用功能 | `insight-log`, `notification-management` | 定義告警規則的觸發條件與動作。 |
| 15 | `011-incident-list` | 應用功能 | `incident-rules` | 定義告警事件的列表、狀態管理。 |
| 16 | `013-automation-management` | 應用功能 | `incident-rules` | 定義自動化劇本以回應告警。 |
| 17 | `016-identity-audit` | 應用功能 | `identity-access-management`, `insight-log` | 定義身份相關活動的審計與追蹤。 |

---

## 3. 注意事項與建議行動

### 階段一：核心平台 (模組 001, 002, 015, 017, 005)

*   **風險**: 此階段的規格定義若存在模糊或錯誤，將對後續所有模組造成連鎖性破壞。
*   **依賴管理**:
    *   `identity-access-management` (IAM) 必須等待 `platform-auth` 的認證模型完全確立後才能開始。
    *   `platform-navigation` 的規格應明確引用 IAM 中定義的權限，以實現動態菜單。
*   **治理檢查點**:
    *   **憲法第一條 (函式庫優先)**：確保認證、IAM 等核心功能被定義為獨立、可重用的函式庫。
    *   **功能完整性**: 規格中必須包含功能需求、資料實體、權限控制與技術實現細節。技術實現細節應專注於「如何」實現，包括數據存儲策略、API 端點定義與外部系統整合。
*   **建議行動**:
    *   在 `specify` 之後，立即執行 `/speckit.clarify` 命令，解決所有 `[NEEDS CLARIFICATION]` 標記，特別是關於 RBAC 模型與多租戶的邊界條件。

### 階段二：平台服務 (模組 003, 004, 012, 006)

*   **風險**: 服務之間的耦合度可能過高，例如通知系統與郵件系統緊密綁定，缺乏擴展性。
*   **依賴管理**:
    *   `notification-management` 應將 `platform-mail` 視為其中一種可插拔的通知「通道」，而非唯一依賴。規格應考慮未來支援 Slack、SMS 等其他通道的可能性。
    *   `platform-grafana` 的規格需明確依賴 `platform-auth` 的使用者身份，以實現單點登錄 (SSO) 和權限映射。
*   **治理檢查點**:
    *   **憲法第二條 (CLI 介面)**：確保每個服務（如標籤、郵件）都被要求提供一個 CLI，以便於測試和自動化。
    *   **關注點分離**: 檢查規格是否將「規則定義」（如通知規則）與「動作執行」（如發送郵件）清晰分離。
*   **建議行動**:
    *   在 `notification-management` 的 `spec.md` 中定義清晰的通知通道提供者介面與技術實現細節，確保可擴展性。

### 階段三：核心功能 (模組 007, 008, 009, 014)

*   **風險**: 可能會過早定義數據模型細節，從而違反技術中立原則。
*   **依賴管理**:
    *   `insight-analysis` 深度依賴 `insight-log` 的數據結構。在 `specify` `insight-analysis` 之前，`insight-log` 的規格必須對日誌的通用欄位（如時間戳、嚴重性、來源）有明確定義。
    *   `dashboards-management` 應引用 `insight-analysis` 的圖表類型和 `platform-grafana` 的嵌入能力。
*   **治理檢查點**:
    *   **避免實作細節**: 在定義 `insight-log` 時，應描述「需要儲存結構化日誌」，而非「將日誌儲存於 Elasticsearch」。
    *   **憲法第九條 (整合優先測試)**：規格的驗收條件應強調端到端的場景，例如「使用者能夠在儀表板上看到來自特定資源的日誌分析圖表」。
*   **建議行動**:
    *   在 `specify` `insight-log` 時，專注於定義日誌的抽象模型和查詢能力，推遲具體的儲存技術選型到 `/speckit.plan` 階段。

### 階段四：應用功能 (模組 010, 011, 013, 016)

*   **風險**: 業務邏輯與底層功能耦合過緊，導致難以修改和測試。
*   **依賴管理**:
    *   `incident-rules` 的規格必須清晰引用 `insight-log` 作為數據源，並引用 `notification-management` 作為告警動作的執行者。
    *   `identity-audit` 需要同時依賴 `identity-access-management` 來獲取角色/權限變更事件，以及 `insight-log` 來儲存和查詢審計日誌。
*   **治理檢查點**:
    *   **可測試性**: 每個告警規則的驗收標準都必須是可量化、可測試的。例如，「當 5 分鐘內出現超過 10 次登入失敗日誌時，必須觸發『高風險』告警」。
    *   **憲法第三條 (測試優先)**：在為這些應用功能產出規格時，應優先定義其驗收情境 (Acceptance Scenarios)，這些情境將直接轉化為測試案例。
*   **建議行動**:
    *   針對 `incident-rules` 和 `automation-management`，使用場景矩陣來定義各種條件、動作和觸發器的組合，確保規格的覆蓋度和清晰度。

---

## 4. 模組工作流程指令清單 (Todolist)

針對任一模組的開發，建議遵循以下標準的 SpecKit 指令工作流程。此清單確保了從需求定義到實作的每一步都結構清晰、可追溯且符合規範。

### 標準工作流程

1.  **定義治理原則 (若尚未建立)**
    *   **指令**: `/speckit.constitution`
    *   **目的**: 建立或更新專案的整體開發指南與架構原則。此為一次性或偶發性操作，為所有後續模組的開發奠定基礎。

2.  **生成功能規格**
    *   **指令**: `/speckit.specify <功能描述>`
    *   **目的**: 將一個高層次的功能想法（例如：「一個支援 RBAC 的身份管理模組」）轉換為一份結構化的規格文件 (`spec.md`)。此命令會自動處理分支、目錄與模板的建立。

3.  **澄清模糊需求 (建議)**
    *   **指令**: `/speckit.clarify`
    *   **目的**: 在進入技術規劃前，主動識別並解決規格文件中的 `[NEEDS CLARIFICATION]` 標記。這能有效降低後期因需求理解不一致而導致的重工風險。

4.  **建立技術實作計畫**
    *   **指令**: `/speckit.plan <技術棧與架構選擇>`
    *   **目的**: 根據已澄清的規格文件，生成一份詳細的技術實作計畫 (`plan.md`)，內容包含技術選型、資料模型、API 合約等。

5.  **產生可執行的任務清單**
    *   **指令**: `/speckit.tasks`
    *   **目的**: 解析 `plan.md` 及其相關文件，自動生成一份細顆粒度、可供開發人員執行的任務清單 (`tasks.md`)。

6.  **進行覆蓋度分析 (建議)**
    *   **指令**: `/speckit.analyze`
    *   **目的**: 在實作前，分析規格、計畫與任務之間的一致性與覆蓋度，確保所有需求都已被妥善地轉化為具體的開發任務。

7.  **產生品質檢查清單**
    *   **指令**: `/speckit.checklist`
    *   **目的**: 根據規格文件，生成一份客製化的品質保證 (QA) 檢查清單，可用於後續的功能驗證，如同為功能撰寫單元測試。

8.  **執行任務以建構功能**
    *   **指令**: `/speckit.implement`
    *   **目的**: 啟動開發代理，根據 `tasks.md` 中的任務列表，自動化地撰寫程式碼、設定檔及測試案例，完成功能的最終建構。

此工作流程構成了一個完整的「意圖 -> 規格 -> 計畫 -> 任務 -> 程式碼」的轉換鏈，是實踐規格驅動開發 (SDD) 的核心路徑。

- **Keycloak OpenAPI**：
https://www.keycloak.org/docs-api/latest/rest-api/openapi.yaml
- **Grafana OpenAPI**：
https://github.com/grafana/grafana/blob/main/public/api-merged.json