# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 通知策略
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/settings/notification-management/NotificationStrategyPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要配置通知策略,定義哪些事件通過哪些渠道發送給哪些接收者。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員建立通知策略,**When** 設定匹配條件、渠道、接收者,**Then** 系統應驗證並儲存
2. **Given** 事件觸發通知,**When** 匹配策略條件,**Then** 系統應依序發送至指定渠道與接收者
3. **Given** 管理員測試策略,**When** 模擬事件,**Then** 系統應顯示匹配結果與發送預覽

### 邊界案例(Edge Cases)
- 當多個策略匹配同一事件時,應依優先級發送或合併通知
- 當接收者不存在時,應跳過並記錄錯誤
- 當策略過於頻繁觸發時,應啟用聚合與限流機制

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除通知策略。
- **FR-002**: 系統必須(MUST)支援基於事件類型、嚴重性、標籤的匹配條件。
- **FR-003**: 系統應該(SHOULD)支援多渠道與多接收者設定。
- **FR-004**: 系統應該(SHOULD)支援通知範本,自訂訊息格式。
- **FR-005**: 系統可以(MAY)支援通知聚合,合併相似事件減少噪音。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| NotificationStrategy | 通知策略,定義發送規則 | 使用 NotificationChannel |
| StrategyMatcher | 策略匹配條件 | 屬於 NotificationStrategy |
| NotificationTemplate | 通知範本 | 被 NotificationStrategy 使用 |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄通知發送、失敗、重試事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤通知發送量、成功率、延遲 |
| RBAC 權限與審計 | ✅ | 控制通知配置的編輯與管理權限 |
| i18n 文案 | ✅ | 通知範本與 UI 支援多語言 |
| Theme Token 使用 | ✅ | 狀態標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、策略衝突 UI 提示

### 6.1 前端 UI/UX 設計 (已確認)

#### 編輯策略時的衝突警告

**Alert 警告框**:
```
⚠️ 此策略與現有策略可能衝突:

• 「Critical 事件通知」(優先級 80) - 條件重疊
• 「Platform 團隊預設」(優先級 50) - 目標重疊

最終生效: 優先級較高的策略
[了解優先級規則]
```

**Alert 元件屬性**:
- 類型: warning (黃色)
- 圖示: 顯示警告圖示
- 位置: 表單上方或策略編輯區域
- 操作: 提供「了解優先級規則」連結，點擊開啟說明 Modal

#### 策略列表優先級視覺化

**列表顯示**:
```
┌─────────────────────────────────────┐
│ 🔴 Critical 事件立即通知  優先級: 100│
│    條件: severity = critical        │
│    渠道: PagerDuty + Slack + Email  │
├─────────────────────────────────────┤
│ 🟠 Platform 團隊預設     優先級: 50 │
│    條件: team = platform            │
│    渠道: Slack                      │
│    ⚠️ 可能被更高優先級策略覆蓋      │
└─────────────────────────────────────┘
```

**優先級視覺化**:
- 使用色點標記: 🔴 高優先級 (80-100)、🟠 中優先級 (50-79)、🟢 低優先級 (0-49)
- 優先級數字顯示在策略名稱旁
- 被覆蓋的策略顯示警告標記

#### 策略測試工具

**測試面板**:
```
[測試策略]
輸入條件:
  • 嚴重度: Critical
  • 團隊: Platform
  • 事件 ID: INC-001

匹配結果:
✅ Critical 事件立即通知 (優先級 100) → 生效
❌ Platform 團隊預設 (優先級 50) → 被覆蓋

最終渠道: PagerDuty, Slack, Email
```

**互動設計**:
- 提供表單輸入測試條件
- 點擊「測試」按鈕顯示匹配結果
- 清楚標記哪些策略生效、哪些被覆蓋
- 顯示最終通知渠道清單

**前端衝突檢查**:
- 使用者儲存策略前，呼叫 API 驗證: `POST /api/v1/notification-strategies/validate`
- API 回傳衝突清單，前端顯示警告 Alert
- 讓使用者確認是否繼續儲存

**前端決策**: 衝突警告 UI、優先級視覺化 (色點)、測試工具介面
**後端參數**: 優先級規則、衝突解決演算法、頻率限制

### 6.2 前後端分工

| 職責 | 前端 | 後端 |
|------|------|------|
| **衝突警告 UI** | ✅ Alert 顯示、優先級色點、測試面板 | - |
| **衝突檢查** | 📥 呼叫驗證 API 並顯示結果 | ✅ 提供衝突檢查邏輯 |
| **優先級規則** | 📥 顯示優先級數值與說明 | ✅ 定義優先級計算規則 |
| **策略匹配** | 📥 顯示測試結果 | ✅ 執行策略匹配演算法 |

---

## 七、模糊與待確認事項(Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 策略優先級機制與衝突解決]~~ → **已解決: 前端 UI 視覺化已確認，優先級規則由 API 決定**
- [NEEDS CLARIFICATION: 通知聚合的時間窗口與觸發條件] → 由後端提供聚合參數 (aggregationWindow, minCount)

---

## 八、決策記錄

### DR-001: 策略衝突 UI 提示

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 3.2 節

**決策內容**:
- 編輯時顯示衝突警告 Alert
- 使用色點視覺化優先級 (紅/橙/綠)
- 提供測試工具模擬策略匹配

**前後端分工**:
- 前端: Alert UI、優先級視覺化、測試工具介面
- 後端: 衝突檢查演算法、優先級規則、策略匹配邏輯
