# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 資源探索
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/resources/ResourceOverviewPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要總覽資源狀態,快速了解整體健康度、分布情況、關鍵指標,作為決策依據。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者進入資源總覽頁面,**When** 系統載入資料,**Then** 應顯示 KPI 卡片、狀態分布圖、資源清單
2. **Given** 使用者點擊狀態分布圖,**When** 選擇特定狀態,**Then** 應篩選並跳轉到對應資源列表
3. **Given** 使用者查看 KPI 卡片,**When** 數值異常,**Then** 應以顏色或圖示標示警示

### 邊界案例(Edge Cases)
- 當資源總數為 0 時,應顯示引導建立資源的提示
- 當 KPI 計算失敗時,應顯示錯誤訊息而非錯誤數值
- 當資料載入緩慢時,應顯示骨架屏或進度指示器

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)顯示資源總數、健康資源數、警告資源數、危險資源數 KPI。
- **FR-002**: 系統必須(MUST)提供狀態分布圓餅圖或長條圖,可點擊跳轉篩選。
- **FR-003**: 系統應該(SHOULD)顯示資源類型分布、提供商分布統計圖表。
- **FR-004**: 系統應該(SHOULD)提供快速搜尋與篩選功能,支援關鍵字與標籤。
- **FR-005**: 系統可以(MAY)顯示資源趨勢圖,展示最近 7 天或 30 天變化。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ResourceSummary | 資源總覽統計資料 | 聚合自 Resource |
| StatusDistribution | 狀態分布統計 | 聚合自 Resource |

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

- [NEEDS CLARIFICATION: KPI 數值的更新頻率與快取策略]
- [NEEDS CLARIFICATION: 趨勢圖的資料粒度與聚合邏輯]
