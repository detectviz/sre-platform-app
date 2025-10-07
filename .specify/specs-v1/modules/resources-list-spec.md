# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 資源列表管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/resources/ResourceListPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要查看與管理所有監控資源,快速了解資源狀態、效能指標、事件數量,並進行批次操作。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者進入資源列表,**When** 系統載入資料,**Then** 應顯示資源名稱、狀態、類型、CPU/記憶體使用率、事件數等資訊
2. **Given** 使用者點擊資源,**When** 開啟詳情抽屜,**Then** 應顯示完整資源資訊、指標圖表、關聯事件
3. **Given** 使用者選擇多個資源,**When** 點擊「AI 分析」,**Then** 系統應生成容量與效能分析報告

### 邊界案例(Edge Cases)
- 當資源數量超過 10000 筆時,應啟用虛擬滾動或伺服器端分頁
- 當資源狀態為 unknown 時,應顯示重新檢查選項
- 當資源被刪除但仍有關聯事件時,應標記為已移除但保留歷史資料

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援依狀態、類型、提供商、區域、擁有者篩選資源。
- **FR-002**: 系統必須(MUST)即時顯示 CPU、記憶體使用率,並以顏色區分正常/警告/危險。
- **FR-003**: 系統必須(MUST)顯示資源最近 24 小時事件數量,點擊可展開事件清單。
- **FR-004**: 系統應該(SHOULD)支援批次標籤操作、批次刪除、批次匯出。
- **FR-005**: 系統應該(SHOULD)整合 AI 分析,提供資源效能診斷與優化建議。
- **FR-006**: 系統必須(MUST)支援欄位自訂與排序,儲存使用者偏好設定。
- **FR-007**: 系統可以(MAY)提供資源拓撲視圖,顯示資源間依賴關係。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Resource | 監控資源實體,包含狀態、指標、標籤等屬性 | 屬於 ResourceGroup, 產生 Incident |
| ResourceMetrics | 資源效能指標(CPU, Memory, Disk) | 屬於 Resource |
| ResourceEvent | 資源相關事件記錄 | 關聯 Resource |
| ResourceGroup | 資源群組,邏輯分組管理 | 包含多個 Resource |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄資源 CRUD 操作、狀態變更事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤資源數量、狀態分布、效能指標 |
| RBAC 權限與審計 | ✅ | 依團隊與角色控制資源存取權限 |
| i18n 文案 | ✅ | 所有文案透過 Content Context 存取 |
| Theme Token 使用 | ✅ | 狀態標籤、圖表使用 Theme Token |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: 資源指標的更新頻率與歷史資料保留策略]
- [NEEDS CLARIFICATION: 資源批次操作的數量上限]
- [NEEDS CLARIFICATION: 資源狀態判定邏輯 - 基於哪些指標與閾值]
