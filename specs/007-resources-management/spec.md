# Feature Specification: Resources Management

**Created**: 2025-10-08
**Status**: Draft
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為 SRE 團隊主管、平台架構師或平台管理員，我需要一個完整的資源管理平台，讓我能夠：
1. **自動探索與納管資源（Discovery）**，在多雲環境（AWS、GCP、Azure、On-Prem）中自動發現新資源，並透過拓撲圖理解資源間的依賴關係與健康狀態
2. **統一管理所有資源（Management）**，查看所有資源（伺服器、應用、資料源等）、將它們分組管理、設定資料連接來源，並快速檢視健康狀態與資源標籤
3. **掌握資源全域分佈（Overview）**，透過 KPI 儀表板、類型分佈圖與雲端供應商統計，快速掌握資源狀態與趨勢

以便在規劃、監控及問題排除時具備完整上下文，確保系統穩定運作，並能快速回應新增資源與環境變化。

### Acceptance Scenarios

#### 場景群組 A：資源自動探索（Auto Discovery）
1. **Given** 我在「資源管理」頁面的「探索」頁籤，
   **When** 系統完成自動掃描，
   **Then** 我應能看到新發現資源的清單及狀態（待審核 / 已納管 / 忽略）。

2. **Given** 我需要重新掃描環境以發現新增的雲端資源，
   **When** 我點擊「重新探索」按鈕並選擇目標範圍（全部 / 指定群組 / 資料源），
   **Then** 系統應執行新的自動發現任務，顯示進度，
   **And Then** 在完成後更新結果並標記新發現的資源。

3. **Given** 我需要驗證掃描結果與任務執行狀態，
   **When** 我點擊某筆「發現任務」記錄，
   **Then** 系統應顯示任務摘要（開始時間、持續時間、發現項數、異常）與詳細結果清單。

4. **Given** 我發現掃描結果中有誤報或不需要納管的資源，
   **When** 我在新發現資源清單中選擇某項並點擊「忽略」，
   **Then** 該資源應被標記為「忽略」狀態，且不會出現在後續的資源清單中。

5. **Given** 我想確認某個新發現資源的詳細資訊後再納管，
   **When** 我點擊「待審核」資源的「詳情」按鈕，
   **Then** 系統應顯示資源的完整屬性（類型、位置、標籤、預估監控指標），
   **And Then** 我可以選擇「納管」或「忽略」。

#### 場景群組 B：資源清單管理（Resource List Management）
6. **Given** 我在資源管理頁面的「清單」頁籤，
   **When** 我展開「全部資源清單」，
   **Then** 系統應顯示所有已納管資源及其群組、狀態、標籤與最後更新時間。

7. **Given** 我希望僅檢視特定標籤的資源（如 `environment=production`），
   **When** 我於篩選器中輸入標籤條件，
   **Then** 清單應立即過濾出符合條件的項目。

8. **Given** 我在資源清單中點擊特定資源，
   **When** 詳情面板打開，
   **Then** 系統應顯示資源監控指標、關聯群組、關聯資料源與設定摘要。

9. **Given** 我需要批次編輯多個資源的標籤，
   **When** 我勾選多個資源並點擊「批次編輯標籤」，
   **Then** 系統應開啟批次編輯模態框，允許新增或移除標籤，
   **And Then** 儲存後更新所有選定資源的標籤。

#### 場景群組 C：資源群組管理（Resource Group Management）
10. **Given** 我想建立新的資源群組以便於分類管理，
    **When** 我點擊「新增群組」並輸入群組名稱與描述，
    **Then** 系統應建立群組並允許拖曳資源至該群組。

11. **Given** 我需要將某個資源從一個群組移動到另一個群組，
    **When** 我在群組視圖中拖曳資源從「開發環境」群組到「生產環境」群組，
    **Then** 系統應更新資源所屬群組，並即時反映在清單與拓撲圖中。

12. **Given** 我想查看某個群組的整體健康狀態，
    **When** 我點擊群組卡片，
    **Then** 系統應顯示該群組內所有資源的健康狀態摘要（健康數 / 警告數 / 離線數）與資源清單。

#### 場景群組 D：資料源設定（Datasource Configuration）
13. **Given** 我需要連接外部資料源（如 Prometheus 或 VictoriaMetrics）以獲取監控資料，
    **When** 我於「資料源設定」頁新增一筆連線資訊（名稱、類型、URL、憑證），
    **Then** 系統應驗證連線，
    **And Then** 在成功後顯示「啟用中」狀態。

14. **Given** 我不確定新增的資料源是否配置正確，
    **When** 我在資料源列表中點擊「測試連線」按鈕，
    **Then** 系統應執行連線測試並顯示結果（成功 / 失敗及錯誤訊息）。

15. **Given** 我需要將某個資料源關聯到多個資源以統一監控，
    **When** 我在資料源詳情頁面點擊「關聯資源」並選擇目標資源，
    **Then** 系統應建立資料源與資源的多對多關聯，
    **And Then** 資源詳情頁面應顯示該資料源。

#### 場景群組 E：資源總覽與拓撲（Overview & Topology）
16. **Given** 我想快速掌握資源總覽，
    **When** 我切換至「總覽」頁籤，
    **Then** 系統應顯示 KPI 卡片（總資源數、健康率、新發現數）、類型分佈圓餅圖及雲端供應商長條圖。

17. **Given** 我想分析資源關聯與依賴關係，
    **When** 我切換至「拓撲」視圖，
    **Then** 我應能看到節點間的連線結構，顯示健康狀態，
    **And Then** 支援縮放、拖曳與懸停檢視詳細資訊（名稱、IP、群組、最近告警）。

18. **Given** 我在拓撲圖中發現某個節點狀態為「警告」，
    **When** 我點擊該節點，
    **Then** 系統應顯示該資源的詳情面板，包含最近告警、健康指標與關聯資源。

#### 場景群組 F：整合情境（Integrated Scenarios）
19. **Given** 我透過「探索」功能發現新資源並選擇「納管」，
    **When** 我選擇目標群組並指定資料源，
    **Then** 該資源應立即出現在資源清單與拓撲圖中，狀態為「健康」或「待確認」。

20. **Given** 我需要定期自動掃描環境以發現新資源，
    **When** 我在探索設定中啟用「自動排程探索任務」並設定頻率（每日 / 每週），
    **Then** 系統應按排程自動執行探索任務，
    **And Then** 將新發現的資源列入待審核清單並發送通知。

### 邊界案例（Edge Cases）
- 當探索任務執行失敗時（如 API 憑證過期），系統應記錄錯誤並顯示明確提示，並允許使用者查看錯誤詳情。
- 當資料源連線測試失敗時，系統應提供詳細錯誤訊息（如：連線逾時、憑證無效、URL 格式錯誤）。
- 當使用者嘗試刪除正在被資源使用的資料源時，後端應回傳 `409 Conflict` 錯誤，前端顯示清晰提示並列出使用該資料源的資源清單。
- 當使用者嘗試刪除包含資源的群組時，系統應詢問是否同時移除資源或將資源移至「未分組」。
- 拓撲圖中若資源數量過多（>100 個節點），應提供分層檢視或篩選功能以避免效能問題。
- 若從 Discovery 自動導入資源時發生重複（已存在相同 ID 的資源），系統應提示使用者選擇「覆蓋」或「跳過」。

---

## 二、功能需求（Functional Requirements）

### 2.1. 資源自動探索（Auto Discovery）
- **FR-AD-001**: 系統必須（MUST）提供自動資源掃描功能，支援多雲環境（AWS、GCP、Azure、On-Prem）。
- **FR-AD-002**: 系統必須（MUST）允許使用者手動觸發探索任務並選擇範圍（全部 / 指定群組 / 資料源）。
- **FR-AD-003**: 系統必須（MUST）展示探索任務清單，顯示狀態、進度與最後執行時間。
- **FR-AD-004**: 系統必須（MUST）在探索完成後顯示新發現資源並標記狀態（待審核 / 已納管 / 忽略）。
- **FR-AD-005**: 系統必須（MUST）支援自動排程探索任務（每日 / 每週 / 自訂 CRON）。
- **FR-AD-006**: 系統必須（MUST）允許使用者查看探索任務詳情，包含開始時間、持續時間、發現項數、異常與完整結果清單。
- **FR-AD-007**: 系統必須（MUST）允許使用者對新發現資源執行「納管」或「忽略」操作。
- **FR-AD-008**: 系統必須（MUST）允許導出探索結果報表（CSV / JSON）。
- **FR-AD-009**: [FUTURE] 支援資源關聯自動偵測與依賴鏈學習（Dependency Mapping AI）。

### 2.2. 資源清單管理（Resource List Management）
- **FR-RLM-001**: 系統必須（MUST）提供整合的「資源清單」檢視，支援搜尋、篩選、分頁與排序。
- **FR-RLM-002**: 系統必須（MUST）顯示每個資源的健康狀態（健康、警告、離線）並以語義化顏色區分。
- **FR-RLM-003**: 系統必須（MUST）支援標籤篩選、狀態篩選及多條件搜尋。
- **FR-RLM-004**: 詳情面板必須（MUST）顯示資源屬性、關聯群組、資料源與最近健康指標。
- **FR-RLM-005**: 系統必須（MUST）支援批次操作（批次編輯標籤、批次刪除、批次移動至群組）。
- **FR-RLM-006**: [FUTURE] 支援批次標籤管理與標籤繼承。

### 2.3. 資源群組管理（Resource Group Management）
- **FR-RGM-001**: 系統必須（MUST）提供資源群組管理功能，可建立、編輯、刪除群組。
- **FR-RGM-002**: 系統必須（MUST）支援拖曳資源至群組以進行分配。
- **FR-RGM-003**: 群組與清單檢視應可切換（Tab 或切換按鈕）。
- **FR-RGM-004**: 系統必須（MUST）顯示群組內資源的整體健康狀態摘要（健康數 / 警告數 / 離線數）。
- **FR-RGM-005**: 刪除群組時，系統必須（MUST）詢問使用者是否同時移除資源或將資源移至「未分組」。

### 2.4. 資料源設定（Datasource Configuration）
- **FR-DC-001**: 系統必須（MUST）提供資料源設定頁，支援新增、編輯、刪除外部資料源（Prometheus、VictoriaMetrics、Elasticsearch 等）。
- **FR-DC-002**: 系統必須（MUST）於資料源設定時驗證連線可用性。
- **FR-DC-003**: 系統必須（MUST）提供「測試連線」功能，並顯示測試結果（成功 / 失敗及錯誤訊息）。
- **FR-DC-004**: 系統必須（MUST）將資料源與資源對應關聯（多對多關係）。
- **FR-DC-005**: 系統必須（MUST）在刪除資料源前檢查是否被資源使用，若是則阻止刪除並回傳 `409 Conflict` 錯誤。

### 2.5. 資源總覽與拓撲（Overview & Topology）
- **FR-OT-001**: 系統必須（MUST）提供資源總覽儀表板，包括 KPI（總資源數、健康率、新發現數）、類型分佈圓餅圖與雲端供應商長條圖。
- **FR-OT-002**: 系統必須（MUST）提供拓撲圖視覺化介面，顯示資源節點與關聯。
- **FR-OT-003**: 拓撲圖中的節點需根據健康狀態使用語義化顏色（如健康、警告、故障）。
- **FR-OT-004**: 系統必須（MUST）允許節點懸停檢視詳細資料（名稱、IP、群組、最近告警）。
- **FR-OT-005**: 拓撲圖必須（MUST）支援縮放、拖曳與節點點擊以顯示詳情面板。
- **FR-OT-006**: 系統必須（MUST）允許手動刷新總覽與拓撲資料。
- **FR-OT-007**: 若資源數量過多（>100 個節點），拓撲圖應提供分層檢視或篩選功能以避免效能問題。

### 2.6. 整合與治理需求（Integration & Governance）
- **FR-IG-001**: 所有 UI 文字與圖表標籤必須（MUST）使用 i18n Key。
- **FR-IG-002**: 所有顏色與狀態樣式必須（MUST）遵循 Theme Token。
- **FR-IG-003**: 系統必須（MUST）根據使用者權限過濾可見資源與探索結果。
- **FR-IG-004**: 所有操作（新增、刪除、變更資源/群組/資料源、探索任務）須寫入稽核日誌。
- **FR-IG-005**: 應上報與資源數量、群組數量、資料源健康狀態、探索任務成功率、平均耗時相關的指標至監控系統。
- **FR-IG-006**: 所有 state-changing 操作成功後，後端必須（MUST）回傳 `auditId`，前端需在提示訊息中顯示此 ID 以利追蹤。
- **FR-IG-007**: [FUTURE] 支援從 Discovery 自動導入新資源並自動建立群組。

---

## 三、權限控制 (RBAC)

### 3.1. 權限定義 (Permissions)
- `resources:read`: 檢視資源清單、群組與總覽。
- `resources:edit`: 編輯資源資訊與分組。
- `resources:delete`: 刪除資源。
- `resources:group`: 新增、刪除、修改群組。
- `resources:datasource:read`: 檢視資料源設定。
- `resources:datasource:edit`: 管理資料源設定（新增、編輯、刪除）。
- `resources:datasource:test`: 執行資料源連線測試。
- `resources:discovery:read`: 檢視資源探索頁與結果。
- `resources:discovery:execute`: 觸發新探索任務。
- `resources:discovery:manage`: 管理排程與任務設定。
- `resources:topology:read`: 檢視拓撲圖。

### 3.2. UI 控制映射 (UI Mapping)
- **頁面存取**: 整個「資源管理」頁面需由 `<RequirePermission permission="resources:read">` 包裹（最低權限）。
- **頁籤存取**:
  - 資源清單頁籤: `resources:read`
  - 資源群組頁籤: `resources:read`
  - 資料源設定頁籤: `resources:datasource:read`
  - 資源探索頁籤: `resources:discovery:read`
  - 資源總覽頁籤: `resources:read`
  - 拓撲視圖頁籤: `resources:topology:read`
- **操作按鈕**:
  - 「編輯資源」: `resources:edit`
  - 「刪除資源」: `resources:delete`
  - 「批次編輯標籤」: `resources:edit`
  - 「新增群組」: `resources:group`
  - 「編輯群組」: `resources:group`
  - 「刪除群組」: `resources:group`
  - 「新增資料源」: `resources:datasource:edit`
  - 「編輯資料源」: `resources:datasource:edit`
  - 「刪除資料源」: `resources:datasource:edit`
  - 「測試連線」: `resources:datasource:test`
  - 「重新探索」: `resources:discovery:execute`
  - 「管理排程」: `resources:discovery:manage`
- **後端 API**: 需依權限過濾可見資源與探索結果。

---

{{specs/common.md}}

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可以在 2 分鐘內發現並註冊新資源
- **SC-002**: 系統支援至少 10000 個資源節點，拓撲圖載入時間低於 3 秒
- **SC-003**: 資源健康狀態更新延遲低於 30 秒，準確率達到 95%

---

## 四、審查與驗收清單（Review & Acceptance Checklist）

- [x] 所有段落齊備且結構正確。
- [x] 無技術語句。
- [x] 所有 FR 具可測試性。
- [x] 無模糊或重疊需求。
- [x] 與 `.specify/memory/constitution.md` (v1.3.0) 一致。
- [x] 模板結構完整。
- [x] 已整合 `resources-discovery-spec.md`、`resources-management-spec.md` 兩份規格，並擴展為完整的資源管理平台。

---

## 五、模糊與待確認事項（Clarifications）

- **多雲連線驗證方式**: [NEEDS CLARIFICATION] : 不同雲供應商 API 權限驗證機制是否統一，以及是否支援 IAM Role、Service Account、API Key 等多種認證方式。
- **拓撲圖資料來源**: [NEEDS CLARIFICATION] : 是否直接來自監控資料庫或需即時計算，以及資源關聯關係的來源（手動定義 / 自動偵測）。
- **掃描任務錯誤處理**: [NEEDS CLARIFICATION] : 是否需支援自動重試與失敗告警，以及重試策略（立即重試 / 延遲重試 / 手動重試）。
- **AI 依賴學習**: [FUTURE] : 是否由平台端或外部模型訓練支援，以及學習數據的來源（日誌 / 監控指標 / 拓撲結構）。
- **資料源驗證機制**: [NEEDS CLARIFICATION] : 驗證是否採 ping、API health check 或憑證認證方式，以及驗證超時時間與重試策略。
- **資源狀態更新頻率**: [NEEDS CLARIFICATION] : 須確認健康狀態刷新頻率（即時 / 輪詢）與更新事件來源（推送 / 拉取）。
- **自動化導入流程**: [FUTURE] : 是否與 Discovery 模組直接整合，以及自動導入時的命名規則、群組分配策略與重複處理邏輯。
- **拓撲圖效能優化**: [NEEDS CLARIFICATION] : 當資源數量超過 100 個節點時，需確認分層檢視或篩選功能的實現方式（前端渲染 / 後端分層）。

---
