# Feature Specification: Incident Rules

**Created**: 2025-10-08
**Status**: Draft
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為一名平台管理員或資深 SRE，我需要一個統一的規則管理平台，讓我能夠：
1. **定義與管理告警規則（Alert Rules）**，設定系統監控的觸發條件、嚴重性與自動化回應，並能透過 AI 分析評估規則的潛在影響與優化建議
2. **建立與管理靜音規則（Silence Rules）**，在計劃性維護或處理已知問題時暫時抑制相關告警，避免告警風暴並減少團隊干擾

以便確保系統監控的有效性，快速回應異常事件，同時在必要時控制告警噪音，維持團隊工作效率與警覺性的平衡。

### Acceptance Scenarios

#### 場景群組 A：告警規則管理（Alert Rules Management）
1. **Given** 我需要為新部署的服務建立監控告警，
   **When** 我在「規則管理」頁面的「告警規則」頁籤點擊「新增規則」按鈕，
   **Then** 系統應彈出編輯模態框，讓我填寫規則名稱、觸發條件、嚴重性與通知設定並儲存。

2. **Given** 我發現一條現有規則過於頻繁地觸發誤報，
   **When** 我在該規則的資料列點擊「編輯」按鈕，調整其觸發條件（如閾值、時間窗口），然後儲存，
   **Then** 該規則應被更新，並立即生效。

3. **Given** 我需要暫時停用一組季節性的告警規則（如年度促銷期間的流量告警），
   **When** 我在表格中勾選這些規則，並在工具列中點擊「停用」批次操作按鈕，
   **Then** 所有被選中的規則狀態都應變為「停用」，且不再觸發告警。

4. **Given** 我想建立一條與現有規則類似的新規則以監控不同服務，
   **When** 我點擊某條規則旁的「複製」按鈕，
   **Then** 系統應打開一個預先填寫好該規則資訊的編輯模態框，其名稱會被加上 "Copy of" 前綴，且預設為停用狀態。

5. **Given** 我想評估某條告警規則的潛在影響與優化空間，
   **When** 我選擇該規則並點擊「AI 分析」按鈕，
   **Then** 系統應觸發 AI 分析，並在模態框中展示分析報告（如歷史觸發頻率、誤報率、建議調整）。

#### 場景群組 B：靜音規則管理（Silence Rules Management）
6. **Given** 我即將進行資料庫升級維護，
   **When** 我在「靜音規則」頁籤點擊「新增規則」，建立一條匹配特定資料庫資源的靜音規則，並設定其生效時間為接下來的 2 小時，
   **Then** 新的規則應被儲存，並顯示在列表中，狀態為「啟用中」。

7. **Given** 一個臨時的靜音規則即將到期，但相關問題尚未完全解決，
   **When** 我在該規則列點擊「延長」按鈕，在彈出的模態框中選擇或輸入延長的時間（如 +1 小時），
   **Then** 該規則的結束時間應被更新，並顯示新的到期時間。

8. **Given** 我需要清理所有已過期且不再需要的靜音規則，
   **When** 我使用篩選器找到所有狀態為「已過期」的規則，將它們全部選中，然後點擊批次「刪除」按鈕，
   **Then** 所有選中的過期規則都應被從系統中移除。

9. **Given** 我需要為週期性維護（如每週日凌晨備份）建立週期性靜音規則，
   **When** 我建立靜音規則時選擇「週期性」排程，並設定 CRON 表達式（如每週日 00:00-02:00），
   **Then** 系統應儲存該規則，並在每週日自動生效與失效。

#### 場景群組 C：整合情境（Integrated Scenarios）
10. **Given** 我想確認某條告警規則是否被任何靜音規則抑制，
    **When** 我查看告警規則詳情面板，
    **Then** 系統應顯示「關聯靜音規則」列表，列出目前生效且匹配該告警的所有靜音規則。

11. **Given** 我在建立靜音規則時，想預覽哪些告警規則會被此靜音規則匹配，
    **When** 我在靜音規則編輯模態框中輸入匹配條件並點擊「預覽匹配」，
    **Then** 系統應即時顯示符合條件的告警規則清單與數量。

12. **Given** 我想對多條規則（告警或靜音）進行 AI 分析以評估整體監控策略，
    **When** 我在告警規則或靜音規則頁籤勾選多條規則並點擊「AI 分析」，
    **Then** 系統應觸發批次分析，並在模態框中展示綜合報告（如規則重疊度、告警覆蓋率、優化建議）。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一條規則時，系統必須彈出確認對話框以防止誤刪。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。
- 在新增規則後，表格應自動跳轉到第一頁。
- 當使用者嘗試延長一個「週期性」的靜音規則時，系統應提示此類規則需透過編輯排程來修改，不支援「延長」操作。
- 當使用者在「延長靜音」模態框中輸入無效的時間（如 0 或負數）時，系統應給出明確錯誤提示。
- 告警規則的 `conditions_summary` 欄位必須由前端根據結構化的 `conditions` 欄位生成，確保一致性與可維護性。
- 靜音規則的 `status` 欄位（如 `active`、`expired`）必須由後端 API 提供，前端不得自行計算。

---

## 二、功能需求（Functional Requirements）

### 2.1. 告警規則管理（Alert Rules Management）
- **FR-AR-001**: 系統必須（MUST）提供完整的 CRUD 介面來管理告警規則。
- **FR-AR-002**: 系統必須（MUST）在可分頁、可排序的表格中展示所有告警規則，包含名稱、狀態、嚴重性、觸發條件摘要、最後觸發時間。
- **FR-AR-003**: 系統必須（MUST）允許使用者透過模態框來新增或編輯告警規則的詳細設定，包含名稱、觸發條件、嚴重性、通知設定、自動化腳本綁定。
- **FR-AR-004**: 系統必須（MUST）提供複製現有規則以建立新規則的功能，複製後的規則名稱加上 "Copy of" 前綴，預設為停用狀態。
- **FR-AR-005**: 系統必須（MUST）允許使用者單獨或批次地啟用/停用告警規則。
- **FR-AR-006**: 系統必須（MUST）支援批次刪除選定的告警規則。
- **FR-AR-007**: 系統必須（MUST）提供進階篩選、欄位自訂、匯入/匯出功能。
- **FR-AR-008**: 系統必須（MUST）能夠對選中的規則觸發 AI 分析，並在模態框中展示報告（歷史觸發頻率、誤報率、建議調整）。
- **FR-AR-009**: 系統應使用語義化的標籤或開關來清晰地展示規則的狀態、嚴重性和自動化狀態。
- **FR-AR-010**: 告警規則的 `conditions_summary` 欄位必須（MUST）由前端根據結構化的 `conditions` 欄位生成，後端 API 應提供結構化的 `conditions` 物件。

### 2.2. 靜音規則管理（Silence Rules Management）
- **FR-SR-001**: 系統必須（MUST）提供完整的 CRUD 介面來管理靜音規則。
- **FR-SR-002**: 系統必須（MUST）在可分頁、可排序的表格中展示所有靜音規則，包含名稱、狀態、匹配條件、生效時間、到期時間。
- **FR-SR-003**: 系統必須（MUST）允許使用者透過模態框來新增或編輯靜音規則，包括其名稱、匹配器（matcher）和排程（單次/週期性）。
- **FR-SR-004**: 系統必須（MUST）為「單次」類型的有效靜音規則提供快速「延長」時間的功能。
- **FR-SR-005**: 系統必須（MUST）允許使用者單獨或批次地啟用/停用靜音規則。
- **FR-SR-006**: 系統必須（MUST）支援批次刪除選定的靜音規則。
- **FR-SR-007**: 系統必須（MUST）提供進階篩選、欄位自訂、匯入/匯出功能。
- **FR-SR-008**: 系統必須（MUST）能夠對選中的規則觸發 AI 分析，並在模態框中展示報告（影響範圍、建議優化）。
- **FR-SR-009**: 後端 API 回傳的 `SilenceRule` 物件中，必須（MUST）包含一個 `status` 欄位（如：`active`、`expired`、`pending`），前端應直接使用此欄位來顯示狀態。
- **FR-SR-010**: 系統必須（MUST）支援週期性靜音規則（使用 CRON 表達式），並在設定時提供 CRON 表達式驗證與視覺化預覽。

### 2.3. 整合與治理需求（Integration & Governance）
- **FR-IG-001**: 所有 UI 文字（包括 Toast 通知）必須（MUST）使用 i18n Key 進行渲染。
- **FR-IG-002**: 所有 UI 元件的顏色必須（MUST）使用語義化的 Theme Token，禁止直接使用 Tailwind 色票或自訂 class。
- **FR-IG-003**: 系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。
- **FR-IG-004**: 所有 CUD 操作（建立、更新、刪除規則）均需產生包含操作上下文的審計日誌。
- **FR-IG-005**: 應上報與規則觸發頻率、AI 分析使用率、靜音規則建立/啟用/停用相關的指標至監控系統。
- **FR-IG-006**: 所有 state-changing 操作成功後，後端必須（MUST）回傳 `auditId`，前端需在提示訊息中顯示此 ID 以利追蹤。
- **FR-IG-007**: 告警規則詳情面板必須（MUST）顯示「關聯靜音規則」列表，列出目前生效且匹配該告警的所有靜音規則。
- **FR-IG-008**: 靜音規則編輯模態框必須（MUST）提供「預覽匹配」功能，即時顯示符合條件的告警規則清單與數量。

---

## 三、權限控制 (RBAC)

### 3.1. 權限定義 (Permissions)
- `incident-rules:alert:read`: 檢視告警規則列表與詳情。
- `incident-rules:alert:create`: 建立新的告警規則。
- `incident-rules:alert:update`: 修改告警規則（包括編輯、複製、啟用/停用）。
- `incident-rules:alert:delete`: 刪除告警規則。
- `incident-rules:alert:analyze`: 觸發告警規則的 AI 分析功能。
- `incident-rules:silence:read`: 檢視靜音規則列表與詳情。
- `incident-rules:silence:create`: 建立新的靜音規則。
- `incident-rules:silence:update`: 修改靜音規則（包括編輯、延長、啟用/停用）。
- `incident-rules:silence:delete`: 刪除靜音規則。
- `incident-rules:silence:analyze`: 觸發靜音規則的 AI 分析功能。
- `incident-rules:config`: 管理頁面設定，如「欄位設定」、「匯入」、「匯出」。

### 3.2. UI 控制映射 (UI Mapping)
- **頁面存取**: 整個「規則管理」頁面需由 `<RequirePermission permission="incident-rules:alert:read">` 包裹（最低權限）。
- **頁籤存取**:
  - 告警規則頁籤: `incident-rules:alert:read`
  - 靜音規則頁籤: `incident-rules:silence:read`
- **操作按鈕**:
  - 「新增告警規則」: `incident-rules:alert:create`
  - 「編輯告警規則」: `incident-rules:alert:update`
  - 「複製告警規則」: `incident-rules:alert:update`
  - 「刪除告警規則」: `incident-rules:alert:delete`
  - 「啟用/停用告警規則」: `incident-rules:alert:update`
  - 「AI 分析告警規則」: `incident-rules:alert:analyze`
  - 「新增靜音規則」: `incident-rules:silence:create`
  - 「編輯靜音規則」: `incident-rules:silence:update`
  - 「延長靜音規則」: `incident-rules:silence:update`
  - 「刪除靜音規則」: `incident-rules:silence:delete`
  - 「啟用/停用靜音規則」: `incident-rules:silence:update`
  - 「AI 分析靜音規則」: `incident-rules:silence:analyze`
  - 「匯入/匯出/欄位設定」: `incident-rules:config`
- **批次操作**: 所有批次操作均需根據對應的權限進行渲染。

---

{{specs/common.md}}

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可以在 5 分鐘內建立複雜的事件規則並測試生效
- **SC-002**: 規則引擎支援每秒處理 5000 個事件，平均匹配延遲低於 100 毫秒
- **SC-003**: 規則觸發準確率達到 99%，誤報率低於 1%

---

## 四、審查與驗收清單（Review & Acceptance Checklist）

- [x] 所有段落齊備且結構正確。
- [x] 無技術語句。
- [x] 所有 FR 具可測試性。
- [x] 無模糊或重疊需求。
- [x] 與 `.specify/memory/constitution.md` (v1.3.0) 一致。
- [x] 模板結構完整。
- [x] 已整合 `incident-alert-spec.md`、`incident-silence-spec.md` 兩份規格，統一為規則管理平台。

---

## 五、模糊與待確認事項（Clarifications）

- **AI 分析功能範圍**: [NEEDS CLARIFICATION] : 需確認 AI 分析的具體指標（歷史觸發頻率、誤報率、建議調整）與分析演算法來源（平台內建 / 外部 AI 服務）。
- **靜音規則匹配邏輯**: [NEEDS CLARIFICATION] : 需確認靜音規則與告警規則的匹配演算法（精確匹配 / 模糊匹配 / 正則表達式），以及多條靜音規則的優先級處理。
- **CRON 表達式格式**: [NEEDS CLARIFICATION] : 需確認支援的 CRON 表達式格式（標準 5 欄位 / 6 欄位含秒 / Quartz 格式），以及是否提供視覺化 CRON 建構器。
- **規則版本控制**: [FUTURE] : 是否支援規則版本歷史追蹤與回滾功能，以便在規則調整後出現問題時快速恢復。
- **規則測試功能**: [FUTURE] : 是否提供「規則測試」功能，允許使用者輸入測試資料模擬規則觸發，驗證規則邏輯正確性。

---
