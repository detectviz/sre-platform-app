# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 告警規則管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/incidents/AlertRulePage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要建立、編輯、管理告警規則,以主動監控系統狀態並在異常時觸發事件。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者點擊「新增規則」,**When** 填寫規則條件與動作,**Then** 系統應驗證並儲存規則
2. **Given** 使用者選擇多條規則,**When** 點擊「AI 分析」,**Then** 系統應評估規則重疊性與優化建議
3. **Given** 規則被觸發,**When** 條件持續滿足,**Then** 系統應依設定頻率發送告警

### 邊界案例(Edge Cases)
- 當規則條件互相衝突時,應標記並提示使用者
- 當目標資源不存在時,應在規則列表中顯示警告狀態
- 當規則觸發頻率過高時,應自動啟用抑制機制

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援基於資源、指標、閾值、時間窗口的條件組合。
- **FR-002**: 系統必須(MUST)支援規則啟用/停用切換,並記錄變更歷史。
- **FR-003**: 系統應該(SHOULD)提供規則測試功能,模擬觸發場景。
- **FR-004**: 系統應該(SHOULD)支援規則複製,加速相似規則建立。
- **FR-005**: 系統必須(MUST)整合自動化劇本,觸發時可執行預定義動作。
- **FR-006**: 系統可以(MAY)提供規則範本庫,快速套用常見監控場景。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| AlertRule | 告警規則,定義觸發條件與動作 | 產生 Incident |
| Condition | 規則條件,支援多條件組合 | 屬於 AlertRule |
| AutomationPlaybook | 觸發時執行的自動化劇本 | 可被 AlertRule 綁定 |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄規則建立、修改、刪除、觸發事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤規則觸發次數、成功率、執行耗時 |
| RBAC 權限與審計 | ✅ | 區分規則建立、編輯、刪除權限,審計所有變更 |
| i18n 文案 | ✅ | 規則名稱、描述支援多語言 |
| Theme Token 使用 | ✅ | 嚴重性標籤使用語義色彩 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: 規則優先級機制與衝突解決策略]
- [NEEDS CLARIFICATION: 規則觸發後的冷卻時間(cooldown)設定]
