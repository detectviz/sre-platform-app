### **提案：澄清 `incidents-alert` & `incidents-silence` 模組的剩餘需求**

**目標**：為告警和靜默規則定義具體的業務邏輯。

**1. `conditions_summary` 欄位的生成邏輯**

- **問題**: `incidents-alert-spec.md` 中，此欄位是如何生成的？
- **前端優先方案**:
    - **後端職責**: 後端 API 回傳的 `AlertRule` 物件中，應包含一個結構化的 `conditions` 欄位，例如：`[{ "fact": "cpu_usage", "operator": "gt", "value": 80 }, { "fact": "service", "operator": "eq", "value": "auth-service" }]`。
    - **前端職責**: 前端接收到此結構化資料後，負責將其格式化為人類可讀的摘要字串，例如 `"CPU 使用率 > 80 AND 服務 = 'auth-service'"`。前端將內建一個對應 `fact` 和 `operator` 到顯示標籤的字典。顯示標籤的字典也必須由後端提供

**2. AI 分析的具體條件 (`incidents-alert-spec.md`)**

- **問題**: AI 分析評估規則的哪些方面？
- **前端優先方案**:
    - **後端職責**: 後端 AI 分析 API (`/ai/alert-rules/analyze`) 應回傳一個包含以下結構的報告：
        - `redundancy_check`: { `is_redundant`: boolean, `conflicting_rule_id?`: string } (是否與其他規則冗餘)
        - `effectiveness_score`: number (0-100，基於歷史觸發率和精確度)
        - `suggestion`: string (人類可讀的優化建議，例如 "建議提高閾值以減少噪音")
    - **前端職責**: 前端 `RuleAnalysisModal` 元件負責將此結構化報告以清晰、易於理解的方式呈現給使用者。

**3. 靜默規則的狀態邏輯 (`incidents-silence-spec.md`)**

- **問題**: 如何判斷靜默規則是「有效」、「即將過期」還是「已過期」？
- **前端優先方案**:
    - **後端職責**: 後端 API 回傳的 `SilenceRule` 物件中，**必須**包含一個 `status` 欄位，其值為 `active`, `expiring_soon`, `expired` 或 `inactive`。
    - **前端職責**: 前端直接使用這個由後端計算好的 `status` 欄位來顯示對應的 UI 狀態標籤。前端**不應**自行根據當前時間和 `ends_at` 進行計算，以確保狀態的唯一權威來源是後端。

**4. 靜默規則的匹配器運算子 (`incidents-silence-spec.md`)**

- **問題**: 匹配器支援哪些運算子？
- **前端優先方案**:
    - **後端職責**: 後端應提供一個 API 端點（例如 `/options/silence-rule-operators`）或在 `useOptions` hook 的回應中，返回一個包含所有可用運算子的列表，例如：`[{ "value": "=", "label": "等於" }, { "value": "!=", "label": "不等於" }, { "value": "~=", "label": "包含 (正規表示式)" }]`。
    - **前端職責**: `SilenceRuleEditModal` 中的條件編輯器應使用此列表來動態生成下拉選單，讓使用者可以選擇運算子。

---

### **提案：澄清 `Automation` & `Identity` 模組的剩餘需求**

**目標**：為自動化和身份管理模組中剩餘的待辦事項提供明確的規格。

**1. 腳本內容儲存 (`automation-playbook-spec.md`)**

- **問題**: 腳本內容如何儲存？
- **前端優先方案**: `AutomationPlaybookEditModal` 中應包含一個基於 `CodeEditor` 元件的文字區域，用於讓使用者直接貼上或編寫腳本（如 Bash, Python）。腳本內容將作為一個 `content: string` 欄位，隨 `AutomationPlaybook` 物件一同提交給後端儲存。

**2. 腳本參數結構 (`automation-playbook-spec.md`)**

- **問題**: 參數支援哪些類型？
- **前端優先方案**: 後端 API 應支援一個結構化的 `parameters` 陣列，其中每個物件包含 `name: string`, `type: 'string' | 'number' | 'boolean'`, `required: boolean`, `default_value?: any`。`AutomationPlaybookEditModal` 應提供一個介面來動態新增/刪除/編輯這些參數定義。

**3. `triggered_by` 欄位定義 (`automation-history-spec.md`)**

- **問題**: 此欄位的具體內容是什麼？
- **前端優先方案**: 後端 API 回傳的 `AutomationExecution` 物件中，`triggered_by` 欄位應為一個包含 `type: 'user' | 'trigger'` 和 `name: string` 的物件。如果 `type` 是 `user`，`name` 就是使用者名稱；如果是 `trigger`，`name` 就是觸發器名稱。

**4. `ExecutionLogDetail` 日誌內容 (`automation-history-spec.md`)**

- **問題**: 日誌詳情包含哪些內容？
- **前端優先方案**: 後端 API (`/automation/executions/{id}`) 回傳的詳細執行紀錄中，應包含 `stdout: string`, `stderr: string`, `exit_code: number`，以及一個包含各步驟計時的 `steps: { name: string, duration_ms: number }[]` 陣列。前端 `ExecutionLogDetail` 元件負責將這些資訊格式化展示。

**5. 使用者狀態流程 (`identity-personnel-spec.md`)**

- **問題**: 使用者狀態如何變更？
- **前端優先方案**:
    - **邀請後**: 狀態為 `invited`。
    - **首次登入**: 狀態由後端自動變更為 `active`。
    - **停用操作**: 管理員在 UI 上操作後，狀態變為 `inactive`。

**6. 邀請流程 (`identity-personnel-spec.md`)**

- **問題**: 邀請的後續流程是什麼？
- **前端優先方案**: 提交邀請後，後端**必須**負責產生一個帶有唯一 token 的註冊連結，並透過郵件（使用 `platform-mail` 設定）發送給被邀請者。該連結應有時效性（例如 24 小時）。

**7. 角色權限定義 (`identity-role-spec.md`)**

- **問題**: 如何定義一個角色的具體權限？
- **前端優先方案**: `RoleEditModal` 中必須包含一個權限樹或分組列表。後端應透過 API (`/options/permissions`) 提供所有可用的權限點（`resource:action` 格式）及其分類，供前端動態渲染。

**8. 團隊與角色的關係 (`identity-team-spec.md`)**

- **問題**: 團隊和角色是什麼關係？
- **前端優先方案**: 在本階段，我們假設團隊和角色是**解耦**的。團隊用於組織人員和資源所有權，而角色用於定義權限。一個使用者同時擁有角色和團隊，其最終權限由其所有角色的權限聯集決定。未來可考慮將角色指派給團隊。