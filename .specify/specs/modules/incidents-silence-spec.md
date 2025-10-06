# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 靜音規則管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/incidents/SilenceRulePage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
SRE 工程師需要建立靜音規則,在維護期間或已知問題期間抑制特定告警,避免噪音干擾。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者建立單次靜音規則,**When** 設定時間範圍與匹配條件,**Then** 系統應在該時段內抑制符合條件的告警
2. **Given** 使用者建立週期性靜音規則,**When** 設定 cron 表達式,**Then** 系統應按週期自動啟用/停用靜音
3. **Given** 靜音規則即將到期,**When** 使用者點擊「延長」,**Then** 系統應允許延長時間或修改排程

### 邊界案例(Edge Cases)
- 當靜音規則過期後,應自動停用並歸檔
- 當多個靜音規則匹配同一告警時,應依優先級或建立時間決定
- 當靜音規則數量過多時,應提供批次管理與清理功能

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援單次與週期性兩種靜音類型。
- **FR-002**: 系統必須(MUST)提供靜音規則延長功能,支援預設時長與自訂時長。
- **FR-003**: 系統應該(SHOULD)支援基於標籤、資源、規則名稱的靈活匹配條件。
- **FR-004**: 系統必須(MUST)記錄靜音規則的建立者、建立時間、修改歷史。
- **FR-005**: 系統應該(SHOULD)在靜音即將到期時發送提醒通知。
- **FR-006**: 系統可以(MAY)提供靜音規則效果分析,統計抑制的告警數量。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| SilenceRule | 靜音規則,定義抑制條件與時間範圍 | 匹配 Incident 或 AlertRule |
| Matcher | 匹配條件,支援等於、包含、正則表達式 | 屬於 SilenceRule |
| Schedule | 排程設定,定義靜音時段 | 屬於 SilenceRule |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄靜音規則建立、延長、刪除事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤靜音規則數量、抑制的告警數、覆蓋率 |
| RBAC 權限與審計 | ✅ | 控制靜音規則的建立與管理權限 |
| i18n 文案 | ✅ | 規則名稱、描述、排程說明支援多語言 |
| Theme Token 使用 | ✅ | 規則類型標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: 靜音規則與告警規則的優先級關係]
- [NEEDS CLARIFICATION: 過期靜音規則的自動清理策略與保留時長]
