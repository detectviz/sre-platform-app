# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 資源群組管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/resources/ResourceGroupPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要建立資源群組,將相關資源邏輯分組,以便批次管理與統一監控。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者建立資源群組,**When** 選擇成員資源並設定擁有團隊,**Then** 系統應建立群組並計算狀態摘要
2. **Given** 使用者查看群組詳情,**When** 開啟詳情抽屜,**Then** 應顯示成員列表、狀態分布、最近更新時間
3. **Given** 使用者編輯群組,**When** 新增或移除成員,**Then** 系統應即時更新狀態摘要

### 邊界案例(Edge Cases)
- 當群組包含超過 100 個資源時,應分頁顯示成員列表
- 當群組中的資源被刪除時,應自動從群組移除
- 當群組無任何成員時,應顯示空狀態提示

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除資源群組。
- **FR-002**: 系統必須(MUST)自動計算群組內資源的狀態摘要(健康/警告/危險數量)。
- **FR-003**: 系統應該(SHOULD)支援群組搜尋與篩選,依擁有團隊、成員數量分類。
- **FR-004**: 系統應該(SHOULD)提供群組詳情視圖,列出所有成員及其狀態。
- **FR-005**: 系統可以(MAY)支援巢狀群組,允許群組包含其他群組。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ResourceGroup | 資源群組,邏輯分組容器 | 包含多個 Resource |
| StatusSummary | 群組狀態摘要統計 | 屬於 ResourceGroup |
| Team | 擁有團隊 | 管理 ResourceGroup |

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

- [NEEDS CLARIFICATION: 群組成員數量上限]
- [NEEDS CLARIFICATION: 是否支援動態群組(基於標籤或條件自動加入成員)]
