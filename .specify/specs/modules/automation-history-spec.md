# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 執行歷史
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/automation/AutomationHistoryPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要查看自動化執行歷史,追蹤劇本執行狀況,分析成功率與失敗原因。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者進入執行歷史頁面,**When** 系統載入資料,**Then** 應顯示執行時間、劇本名稱、狀態、耗時
2. **Given** 使用者點擊執行記錄,**When** 開啟詳情抽屜,**Then** 應顯示每個步驟的執行日誌與結果
3. **Given** 使用者篩選失敗記錄,**When** 勾選失敗狀態,**Then** 應僅顯示失敗的執行記錄

### 邊界案例(Edge Cases)
- 當執行歷史數量過多時,應提供分頁與日期範圍篩選
- 當執行步驟包含敏感資訊時,應遮罩或脫敏顯示
- 當執行記錄被刪除時,應保留摘要資訊用於統計

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)記錄所有劇本執行歷史,含開始時間、結束時間、狀態、觸發來源。
- **FR-002**: 系統必須(MUST)顯示每個步驟的執行日誌、輸入參數、輸出結果。
- **FR-003**: 系統應該(SHOULD)支援依劇本、狀態、時間範圍篩選歷史。
- **FR-004**: 系統應該(SHOULD)提供執行統計,計算成功率、平均耗時等指標。
- **FR-005**: 系統可以(MAY)支援執行記錄匯出,用於審計或分析。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ExecutionHistory | 執行歷史記錄 | 關聯 Playbook, Trigger |
| ExecutionStep | 執行步驟記錄,含日誌與結果 | 屬於 ExecutionHistory |
| ExecutionMetrics | 執行統計指標 | 聚合自 ExecutionHistory |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄劇本建立、執行、結果事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤劇本執行次數、成功率、耗時 |
| RBAC 權限與審計 | ✅ | 控制劇本的建立、執行、審批權限 |
| i18n 文案 | ✅ | 劇本名稱、步驟描述支援多語言 |
| Theme Token 使用 | ✅ | 狀態標籤使用統一語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: 執行歷史的保留時長與歸檔策略]
- [NEEDS CLARIFICATION: 敏感資訊的脫敏規則與權限控制]
