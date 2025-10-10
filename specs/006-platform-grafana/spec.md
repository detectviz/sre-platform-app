# 功能規格書（Feature Specification）: Platform Grafana Integration

**建立日期**: 2025-10-06
**狀態**: Draft
**輸入**: 使用者描述: "為平台提供與外部 Grafana 執行個體的整合能力，包括連線設定、測試與資源同步"

## 使用者情境與測試 *(mandatory)*

### 使用者故事 1 - 作為平台管理員，設定並測試與 Grafana 的連線 (優先級: P1)

作為平台管理員，我需要將平台與現有的 Grafana 執行個體整合。我希望能設定 Grafana 的連線位址和 API Key，並能在儲存前透過「測試連線」功能，立即驗證設定是否正確，同時獲取 Grafana 實例的資源概況（如儀表板、資料來源的數量），以確保後續的儀表板同步功能可以正常運作。

**為什麼此優先級**: 這是與 Grafana 整合的基礎。一個可靠的連線測試功能可以顯著降低設定錯誤的風險，並為後續的容量規劃與權限驗證提供依據。

**獨立測試**: 可以通過在設定頁面輸入正確的 Grafana URL 和 API Key，點擊「測試連線」，並成功看到返回的 Grafana 版本和資源統計資訊來獨立測試。

**驗收情境**:

1.  **Given** 我已輸入 Grafana URL 和 API Key, **When** 我點擊「測試連線」按鈕, **Then** 系統應發送測試請求並顯示載入中狀態。
2.  **Given** 連線測試成功, **When** 系統收到成功回應, **Then** 測試結果區域應顯示「連線正常」，並顯示 Grafana 版本、儀表板數量、資料來源數量等資訊。
3.  **Given** 我輸入了錯誤的 API Key, **When** 我點擊「測試連線」, **Then** 測試結果區域應顯示「連線失敗」並顯示具體錯誤訊息，如「認證失敗」。
4.  **Given** 我輸入了格式不正確的 URL, **When** 我嘗試測試連線, **Then** 系統應顯示「URL 格式不正確」的錯誤訊息並阻止操作。
5.  **Given** 我已完成 Grafana URL 和 API Key 的輸入, **When** 我點擊「儲存變更」按鈕, **Then** 系統應保存我的設定並顯示成功提示。

---

### 使用者故事 2 - 作為平台管理員，安全地管理 Grafana API Key (優先級: P2)

在設定整合時，我需要確保敏感的 Grafana API Key 受到妥善保護，避免在介面上明文顯示，以符合安全規範。

**為什麼此優先級**: 保護敏感憑證，防止 API Key 外洩，是整合外部系統時的基本安全要求。

**獨立測試**: 可以通過重新載入已儲存的設定頁面，驗證 API Key 欄位預設為遮蔽狀態，並可透過點擊按鈕切換其可見性來獨立測試。

**驗收情境**:

1.  **Given** 我已儲存過 Grafana 設定, **When** 我重新開啟此頁面, **Then** 系統應顯示之前儲存的設定值，且 API Key 應預設以遮蔽形式顯示。
2.  **Given** API Key 欄位處於遮蔽狀態, **When** 我點擊「顯示」按鈕, **Then** API Key 應切換為明文顯示，按鈕圖示變為「隱藏」。
3.  **Given** API Key 欄位處於明文顯示狀態, **When** 我點擊「隱藏」按鈕, **Then** API Key 應恢復為遮蔽狀態。

---

### 邊界案例

- 當 Grafana 伺服器回應超時時，測試連線功能應如何處理？
- 當 API Key 的權限不足以獲取資源統計資訊時，測試結果應如何顯示？

## 功能需求 *(mandatory)*

### 功能需求

- **FR-001**: 系統必須（MUST）提供一個表單介面，允許管理員設定和編輯 Grafana 整合所需的 URL 和 API Key。
- **FR-002**: 系統必須（MUST）提供「測試連線」功能，以驗證當前表單中的設定是否正確。
- **FR-003**: 測試成功時，系統必須（MUST）顯示 Grafana 版本和基本的資源統計資訊（如儀表板、資料來源數量）。
- **FR-004**: 測試失敗時，系統必須（MUST）顯示具體的、對使用者友善的錯誤訊息。
- **FR-005**: API Key 欄位必須（MUST）預設以遮蔽形式顯示，並提供「顯示/隱藏」的切換功能。
- **FR-006**: API Key 必須（MUST）在後端進行加密儲存。
- **FR-007**: 系統文件必須（MUST）明確說明整合所需的最小 API Key 權限範圍。

### 關鍵資料實體 *(如果功能涉及資料則包含)*

- **GrafanaConfiguration**: 代表全局 Grafana 整合設定的單一實體。主要屬性: url, api_key_secret。

## 權限控制 *(RBAC)*

### 權限模型設計

此功能的存取控制應限制為只有具備平台管理權限的角色才能進行設定。

#### 所需權限定義

- **`platform:grafana:read`**: 允許查看 Grafana 整合設定（通常與 update 權限合併）。
- **`platform:grafana:update`**: 允許修改並儲存 Grafana 整合設定。
- **`platform:grafana:test`**: 允許執行「測試連線」操作。

#### 角色指派建議

- **Admin 角色**: 需要 `platform:grafana:update` 和 `platform:grafana:test` 權限。
- **Editor 角色**: 無權限。
- **Viewer 角色**: 無權限。

#### 權限檢查點

- **進入設定頁面**: 檢查使用者是否擁有 `platform:grafana:update` 權限。
- **點擊「儲存」按鈕**: 檢查 `platform:grafana:update` 權限。
- **點擊「測試連線」按鈕**: 檢查 `platform:grafana:test` 權限。

---

## 觀測性與治理檢查（Observability & Governance Checklist）

{{specs/common.md}}

---

## 成功標準 *(mandatory)*

### 可衡量成果

- **SC-001**: 管理員可以在 2 分鐘內完成 Grafana 的連線配置並成功執行一次連線測試。
- **SC-002**: 連線測試的平均回應時間應低於 3 秒。
- **SC-003**: 後續的儀表板同步成功率達到 99% 以上。

---

## 模糊與待確認事項（Clarifications）

- [NEEDS CLARIFICATION: API Key 在後端儲存時應使用何種加密標準？]
- [NEEDS CLARIFICATION: 文件中應建議的最小 API Key 權限具體是哪些？]