# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 自動發現配置
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/resources/AutoDiscoveryPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要配置自動發現任務,定期掃描雲端或內部環境,自動註冊新資源到監控系統。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員建立自動發現任務,**When** 設定掃描範圍與排程,**Then** 系統應按時執行並回報發現的資源
2. **Given** 自動發現任務執行完成,**When** 發現新資源,**Then** 系統應自動註冊並標記為新發現
3. **Given** 使用者查看發現結果,**When** 開啟結果抽屜,**Then** 應顯示發現的資源清單與匯入選項

### 邊界案例(Edge Cases)
- 當發現任務執行時間過長時,應支援中斷與恢復機制
- 當發現的資源已存在時,應提供更新或跳過選項
- 當發現任務頻繁失敗時,應自動停用並通知管理員

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除自動發現任務。
- **FR-002**: 系統必須(MUST)支援多種發現來源(AWS, Azure, GCP, Kubernetes)。
- **FR-003**: 系統應該(SHOULD)支援排程執行(單次、週期性)。
- **FR-004**: 系統必須(MUST)記錄每次執行結果,包含發現數量、匯入數量、錯誤訊息。
- **FR-005**: 系統應該(SHOULD)提供發現規則過濾,僅匯入符合條件的資源。
- **FR-006**: 系統可以(MAY)支援發現結果預覽與手動確認匯入。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| DiscoveryJob | 自動發現任務配置 | 產生 DiscoveryResult |
| DiscoveryResult | 發現結果記錄 | 關聯 DiscoveryJob |
| DiscoveredResource | 發現的資源項目 | 可轉換為 Resource |

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

- [NEEDS CLARIFICATION: 自動發現的並行任務數上限]
- [NEEDS CLARIFICATION: 發現結果的保留時長與清理策略]
