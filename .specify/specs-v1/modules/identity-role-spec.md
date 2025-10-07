# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 角色管理
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/settings/identity-access/RoleManagementPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要定義與管理角色,設定權限範圍,實現基於角色的存取控制(RBAC)。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員建立角色,**When** 設定權限項目,**Then** 系統應驗證並儲存角色
2. **Given** 管理員編輯角色權限,**When** 新增或移除權限,**Then** 系統應即時更新並通知受影響使用者
3. **Given** 管理員刪除角色,**When** 確認操作,**Then** 系統應檢查是否有使用者使用該角色並提示影響

### 邊界案例(Edge Cases)
- 當角色權限過於寬鬆(如擁有所有權限)時,應發出警告
- 當刪除角色時仍有使用者使用,應拒絕刪除或提供轉移選項
- 當角色繼承關係形成循環時,應偵測並拒絕

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除角色。
- **FR-002**: 系統必須(MUST)提供細粒度權限項目,涵蓋所有功能模組。
- **FR-003**: 系統應該(SHOULD)支援角色繼承,子角色自動獲得父角色權限。
- **FR-004**: 系統應該(SHOULD)顯示角色使用統計,含使用者數量、權限覆蓋率。
- **FR-005**: 系統可以(MAY)提供權限模板,快速建立常見角色。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Role | 角色,定義權限集合 | 被 User 引用 |
| Permission | 權限項目,對應具體操作 | 屬於 Role |
| RoleHierarchy | 角色繼承關係 | 關聯父子 Role |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄所有身份變更、權限調整、登入事件 |
| 指標與告警 (Metrics & Alerts) | ✅ | 追蹤使用者活躍度、權限分布、異常登入 |
| RBAC 權限與審計 | ✅ | 嚴格控制身份管理權限,僅管理員可操作 |
| i18n 文案 | ✅ | 所有 UI 文案支援多語言 |
| Theme Token 使用 | ✅ | 狀態標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、權限選擇器 UI 設計

### 6.1 前端 UI/UX 設計 (已確認)

#### 樹狀結構選擇器 (採用方案)

**UI 結構**:
```
├─ 📦 incidents (事件管理)
│  ├─ ☑️ view (檢視)
│  ├─ ☑️ create (建立)
│  ├─ ☑️ update (更新)
│  └─ ☐ delete (刪除)
├─ 📦 resources (資源管理)
│  ├─ ☑️ view (檢視)
│  └─ ☑️ update (更新)
└─ 📦 automation (自動化)
   └─ ☑️ view (檢視)
```

**互動行為**:
- 點擊模組名稱: 全選/取消全選該模組下所有權限
- 支援搜尋過濾: 輸入關鍵字即時過濾權限項目
- 已選權限顯示: 模組名稱後顯示「incidents (3/4)」表示已選 3 個權限
- 樹狀展開/收合: 點擊箭頭展開或收合模組

**前端實作要點**:
1. 使用 Ant Design Tree Component
2. 權限資料結構由 API 提供 (GET /api/v1/permissions/tree)
3. 搜尋功能使用前端過濾 (lodash filter)
4. 選中狀態儲存為 `string[]` (權限 key 陣列，如 `["incidents:view", "incidents:create"]`)

**API 資料格式範例**:
```typescript
// GET /api/v1/permissions/tree
{
  "permissions": [
    {
      "module": "incidents",
      "label": "事件管理",
      "actions": [
        { "key": "incidents:view", "label": "檢視" },
        { "key": "incidents:create", "label": "建立" },
        { "key": "incidents:update", "label": "更新" },
        { "key": "incidents:delete", "label": "刪除" }
      ]
    },
    {
      "module": "resources",
      "label": "資源管理",
      "actions": [
        { "key": "resources:view", "label": "檢視" },
        { "key": "resources:update", "label": "更新" }
      ]
    }
  ]
}
```

**前端決策**: UI 佈局 (樹狀 vs 分組)、互動方式 (全選/搜尋)、視覺呈現
**後端參數**: 權限粒度、命名規範 (module:action 格式)、繼承規則

### 6.2 前後端分工

| 職責 | 前端 | 後端 |
|------|------|------|
| **UI 元件** | ✅ Tree 元件、搜尋框、全選邏輯 | - |
| **權限結構** | 📥 渲染 API 提供的樹狀資料 | ✅ 定義權限粒度與模組分類 |
| **命名規範** | 📥 顯示 API 提供的 label | ✅ 定義權限 key 格式 (如 module:action) |
| **繼承規則** | 📥 顯示繼承來源標記 | ✅ 計算最終權限與來源 |

---

## 七、模糊與待確認事項(Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 權限項目的粒度與命名規範]~~ → **已解決: 前端 UI 設計已確認，權限粒度與命名由 API 提供**
- [NEEDS CLARIFICATION: 角色變更後的權限生效時機(即時或下次登入)] → 由後端決定，前端顯示生效提示

---

## 八、決策記錄

### DR-001: 權限選擇器 UI 設計

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 2.1 節

**決策內容**:
- 採用樹狀結構選擇器 (Ant Design Tree)
- 支援模組級全選與搜尋過濾
- 權限格式為 `module:action` (由 API 定義)

**前後端分工**:
- 前端: Tree UI、搜尋邏輯、選擇狀態管理
- 後端: 權限樹資料結構、粒度定義、繼承計算
