# 通用規範: Modal 互動模式

**類型 (Type)**: Common
**適用範圍**: 所有使用 Modal、Drawer 的模組
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、設計原則

Modal(模態框)與 Drawer(抽屜)是平台中最常用的互動模式,必須遵循統一的設計原則與實作標準。

### 核心原則

1. **明確目的**: 每個 Modal 或 Drawer 必須有明確的單一目的(新增、編輯、確認、詳情等)。
2. **非侵入性**: 不應阻擋關鍵資訊,提供明確的關閉方式。
3. **一致性**: 佈局、按鈕位置、關閉行為必須統一。
4. **可預測性**: 使用者應能預期 Modal 的行為與結果。

---

## 二、Modal 與 Drawer 選擇標準

### 2.1 使用 Modal 的場景

- **短表單**: 欄位數 ≤ 5 個,單欄佈局。
- **確認對話框**: 刪除、批次操作等需要二次確認的場景。
- **簡短內容**: 提示訊息、警告、選擇器等。
- **焦點集中**: 需要使用者集中注意力完成特定操作。

範例模組:
- AlertRuleEditModal (新增/編輯告警規則)
- QuickSilenceModal (快速靜音)
- ColumnSettingsModal (欄位設定)
- 刪除確認 Modal

### 2.2 使用 Drawer 的場景

- **長表單**: 欄位數 > 5 個,需要分組或多步驟。
- **詳情檢視**: 顯示完整資訊,含多個區塊與子表格。
- **複雜互動**: 包含內嵌圖表、列表、Tabs 等複雜元件。
- **保留上下文**: 需要同時查看列表與詳情。

範例模組:
- IncidentDetailPage (Drawer 形式)
- ResourceDetailPage (Drawer 形式)
- DiscoveryJobResultDrawer (自動發現結果)

---

## 三、Modal 設計規範

### 3.1 結構標準

```
Modal
  ├─ Header
  │    ├─ Title (必填)
  │    └─ Close Button (×)
  ├─ Body
  │    └─ Content (表單、訊息、列表)
  └─ Footer
       ├─ Secondary Button (取消、返回)
       └─ Primary Button (儲存、確認、刪除)
```

### 3.2 尺寸規範

| 用途 | 寬度類別 | 說明 |
|------|----------|------|
| 小型 | `w-1/4` | 簡短確認、提示訊息 |
| 中型 | `w-1/3` | 標準表單、刪除確認 |
| 大型 | `w-1/2` | 複雜表單、多欄位 |
| 超大 | `w-2/3` | 特殊場景,如批次操作預覽 |

### 3.3 標題規範

- **新增**: "新增{資源名稱}" (如 "新增告警規則")
- **編輯**: "編輯{資源名稱}" (如 "編輯靜音規則")
- **刪除**: "確認刪除" 或 "刪除{資源名稱}"
- **檢視**: "{資源名稱}詳情" 或 "{操作名稱}"

### 3.4 按鈕規範

#### 按鈕順序(由左至右)
1. 次要操作(取消、返回、重置)
2. 主要操作(儲存、確認、刪除)

#### 按鈕樣式
- **取消**: `bg-slate-700 hover:bg-slate-600 text-slate-300`
- **儲存**: `bg-sky-600 hover:bg-sky-700 text-white`
- **刪除**: `bg-red-600 hover:bg-red-700 text-white`

#### 按鈕文案
- 新增表單: "取消" + "新增"
- 編輯表單: "取消" + "儲存"
- 刪除確認: "取消" + "刪除"

---

## 四、Drawer 設計規範

### 4.1 結構標準

```
Drawer (從右側滑入)
  ├─ Header
  │    ├─ Title
  │    └─ Close Button (×)
  └─ Body (可滾動)
       ├─ Section 1
       ├─ Section 2
       └─ Section N
```

### 4.2 寬度規範

| 用途 | 寬度類別 | 說明 |
|------|----------|------|
| 中型 | `w-1/2` | 標準詳情頁 |
| 大型 | `w-3/5` | 包含子列表或圖表 |
| 超大 | `w-3/4` 或 `w-full max-w-6xl` | 複雜詳情,多區塊 |

### 4.3 內容佈局

- **頂部區塊**: KPI 卡片或關鍵資訊摘要。
- **中部區塊**: 詳細資訊,分組顯示,使用 `border` 與 `bg` 區隔。
- **底部區塊**: 關聯資料、歷史記錄、操作日誌。

---

## 五、互動行為規範

### 5.1 開啟行為

- **觸發方式**: 點擊按鈕、列表項目、連結。
- **動畫**: Modal 淡入 + 縮放,Drawer 滑入(從右至左)。
- **背景遮罩**: 半透明黑色 `bg-black/50`,可點擊關閉(可配置)。
- **焦點管理**: 開啟後焦點移至第一個可互動元素。

### 5.2 關閉行為

- **關閉方式**:
  1. 點擊關閉按鈕(×)
  2. 點擊背景遮罩(可配置)
  3. 按下 ESC 鍵
  4. 點擊「取消」按鈕
  5. 操作成功後自動關閉

- **關閉確認**:
  - 表單有未儲存變更時,應提示確認關閉。
  - 刪除確認 Modal 關閉不需確認。

- **焦點恢復**: 關閉後焦點回到觸發元素。

### 5.3 巢狀 Modal/Drawer

#### 巢狀層級限制 ✅

**最大層級: 2 層**（已確認）

- **層級 1 (主 Modal)**: 主要編輯、新增表單
- **層級 2 (子 Modal)**: 輔助選擇器（如選擇負責人、選擇標籤）
- **禁止層級 3**: 在第 2 層 Modal 中不得再開啟 Modal

#### 替代方案

當需要第 3 層互動時，使用以下替代方案：

| 需求 | 替代方案 | 實作方式 |
|------|----------|----------|
| 額外選擇器 | **Drawer** | 從右側滑出，z-index 高於 Modal |
| 內嵌選項 | **Inline Expand** | 在 Modal 內展開/收合區塊 |
| 多步驟流程 | **Wizard (步驟表單)** | 單一 Modal 內切換步驟 |

#### Z-index 管理 ✅

```css
.modal-level-1 { z-index: 1000; }  /* 主 Modal */
.modal-level-2 { z-index: 1050; }  /* 子 Modal */
.drawer { z-index: 1100; }         /* Drawer 永遠在最上層 */
.toast { z-index: 9999; }          /* Toast 通知 */
```

#### 前端實作檢查

```typescript
// 檢查 Modal 層級
const modalStackDepth = useModalStack();

if (modalStackDepth >= 2) {
  // 禁止開啟第 3 層 Modal
  console.warn('已達最大 Modal 層級限制');
  // 改用 Drawer 或內嵌展開
  return <DrawerAlternative />;
}
```

#### 關閉行為

- **優先關閉最上層**: ESC 鍵或點擊背景關閉最上層 Modal
- **Cascade 關閉**: 關閉主 Modal 時自動關閉所有子 Modal
- **焦點恢復**: 關閉子 Modal 時焦點回到主 Modal

---

## 六、表單驗證規範

### 6.1 即時驗證

- 欄位失焦時執行驗證。
- 驗證失敗時,於欄位下方顯示紅色錯誤訊息。
- 必填欄位標記紅色星號(*)。

### 6.2 提交驗證

- 點擊「儲存」或「確認」時,執行完整驗證。
- 驗證失敗時:
  1. 標記所有錯誤欄位
  2. 滾動至第一個錯誤欄位
  3. 顯示整體錯誤提示(Toast)
  4. 禁用提交按鈕或保持啟用並標記錯誤

### 6.3 成功與錯誤處理

- **成功**: 顯示成功 Toast,關閉 Modal,重新載入列表。
- **API 錯誤**: 顯示錯誤 Toast,保持 Modal 開啟,允許重試。
- **網路錯誤**: 顯示網路錯誤提示,提供重試按鈕。

---

## 七、無障礙存取 (Accessibility)

### 7.1 ARIA 屬性

- Modal 使用 `role="dialog"`, `aria-modal="true"`
- 標題使用 `aria-labelledby` 關聯
- 描述使用 `aria-describedby` 關聯(可選)

### 7.2 鍵盤導航

- **Tab**: 在 Modal 內元素間循環聚焦
- **Shift+Tab**: 反向聚焦
- **ESC**: 關閉 Modal
- **Enter**: 提交表單(在輸入框內)

### 7.3 焦點陷阱 (Focus Trap)

- Modal 開啟時,焦點限制在 Modal 內。
- Tab 鍵到達最後一個元素時,回到第一個元素。
- 關閉後,焦點恢復至觸發元素。

---

## 八、效能最佳化

### 8.1 延遲載入

- Modal 內容在開啟時才渲染,關閉時卸載。
- 複雜表單使用 `React.lazy` 動態匯入。

### 8.2 動畫效能

- 使用 CSS `transform` 與 `opacity` 實現動畫,避免 `left`, `top` 等觸發 layout 的屬性。
- 動畫時長建議 200~300ms,平衡流暢度與速度。

---

## 九、主題與樣式

### 9.1 背景與邊框

- **Modal 背景**: `bg-slate-900`
- **Drawer 背景**: `bg-slate-900`
- **邊框**: `border border-slate-700`
- **陰影**: `shadow-2xl`

### 9.2 標題與內容

- **標題**: `text-lg font-semibold text-white`
- **內容**: `text-sm text-slate-300`
- **分隔線**: `border-t border-slate-800`

---

## 十、採用此模式的元件與模組清單

### 核心元件

- `Modal.tsx`
- `Drawer.tsx`

### 使用 Modal 的模組

- AlertRuleEditModal
- SilenceRuleEditModal
- ResourceEditModal
- ResourceGroupEditModal
- QuickSilenceModal
- ColumnSettingsModal
- ImportFromCsvModal
- 刪除確認 Modal (各模組)

### 使用 Drawer 的模組

- IncidentDetailPage
- ResourceDetailPage
- DiscoveryJobResultDrawer
- ExecutionLogDetail

---

## 八、Modal 內表單的自動儲存草稿機制 (Draft Auto-Save)

### 8.1 草稿儲存策略

**儲存位置**: **LocalStorage + 定時儲存**

### 8.2 觸發時機

| 觸發時機 | 行為 | 說明 |
|---------|------|------|
| **欄位變更後 2 秒** | 自動儲存 (debounce) | 避免頻繁寫入 |
| **Modal 關閉前** | 儲存 (beforeunload) | 保留未完成的內容 |
| **點擊「取消」** | 不儲存 | 使用者主動放棄 |
| **提交成功後** | 清除草稿 | 避免殘留過期草稿 |

### 8.3 草稿結構

```typescript
interface Draft {
  formKey: string;           // 唯一識別 (如 'incident-create')
  userId: string;            // 使用者 ID
  values: Record<string, any>; // 表單值
  timestamp: number;         // 儲存時間
}
```

**LocalStorage Key 格式**:
```
draft-{formKey}-{userId}
```

### 8.4 草稿恢復流程

```
1. Modal 開啟時檢查 LocalStorage
2. 若有草稿,顯示確認對話框
3. 使用者選擇「恢復草稿」或「捨棄草稿」
4. 恢復: 填入表單值
5. 捨棄: 刪除 LocalStorage 記錄
```

**確認對話框 UI**:
```
┌─────────────────────────────────────┐
│ 發現未儲存的草稿                    │
├─────────────────────────────────────┤
│ 上次編輯時間: 2 分鐘前              │
│                                     │
│ 是否恢復草稿內容?                   │
├─────────────────────────────────────┤
│           [捨棄草稿]  [恢復草稿]    │
└─────────────────────────────────────┘
```

### 8.5 草稿過期與清理

**過期時間**: 7 天

**自動清理時機**:
- 頁面載入時檢查並清理過期草稿
- 草稿恢復時檢查時效性

**清理邏輯**:
```typescript
const cleanExpiredDrafts = () => {
  const now = Date.now();
  const expireTime = 7 * 24 * 60 * 60 * 1000; // 7 天

  Object.keys(localStorage)
    .filter(key => key.startsWith('draft-'))
    .forEach(key => {
      const data = JSON.parse(localStorage.getItem(key)!);
      if (now - data.timestamp > expireTime) {
        localStorage.removeItem(key);
      }
    });
};
```

### 8.6 草稿管理頁面 (可選功能)

**功能**:
- 列出所有草稿
- 顯示草稿建立時間
- 提供恢復/刪除操作

**UI 設計**:
```
┌─────────────────────────────────────┐
│ 我的草稿                            │
├─────────────────────────────────────┤
│ ✏️ 新增事件                         │
│    上次編輯: 2 分鐘前               │
│    [恢復] [刪除]                    │
├─────────────────────────────────────┤
│ ✏️ 編輯告警規則                     │
│    上次編輯: 1 小時前               │
│    [恢復] [刪除]                    │
└─────────────────────────────────────┘
```

### 8.7 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| LocalStorage 草稿儲存 | ✅ | - |
| 定時儲存 (debounce) | ✅ | - |
| 草稿恢復對話框 | ✅ | - |
| 過期草稿清理 | ✅ | - |
| 草稿管理頁面 (可選) | ✅ | - |
| 雲端草稿同步 (可選) | ✅ | ✅ |

---

## 九、採用此模式的元件與模組清單

### 核心元件

- `Modal.tsx`
- `Drawer.tsx`

### 使用 Modal 的模組

- AlertRuleEditModal
- SilenceRuleEditModal
- ResourceEditModal
- ResourceGroupEditModal
- QuickSilenceModal
- ColumnSettingsModal
- ImportFromCsvModal
- 刪除確認 Modal (各模組)

### 使用 Drawer 的模組

- IncidentDetailPage
- ResourceDetailPage
- DiscoveryJobResultDrawer
- ExecutionLogDetail

---

## 十、待確認事項

- ✅ ~~[NEEDS CLARIFICATION: Modal 內表單的自動儲存草稿機制]~~ → **已解決: 採用 LocalStorage + 定時儲存,2 秒 debounce,7 天自動清理**
- ✅ ~~[NEEDS CLARIFICATION: Drawer 內容的預載入策略與快取]~~ → **已解決: 參見 `_collaboration-spec.md` § 1**
- ✅ ~~巢狀 Modal 的最大層級限制與 UX 指引~~ → **已確認：最大 2 層，第 3 層改用 Drawer**
- ✅ ~~[NEEDS CLARIFICATION: Modal 關閉動畫完成前是否允許重新開啟]~~ → **已解決: 參見 `_collaboration-spec.md` § 2**

---

## 十一、決策記錄

### DR-001: 巢狀 Modal 層級限制

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 2.5 節

**決策內容**:
- 最大巢狀層級: **2 層**
- 第 3 層互動改用: Drawer / Inline Expand / Wizard
- Z-index 分配: L1=1000, L2=1050, Drawer=1100

**理由**:
- 超過 2 層會導致使用者困惑
- 降低認知負擔，提升 UX
- Drawer 提供更好的第 3 層互動體驗

---

### DR-002: Modal 內表單草稿自動儲存

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 2.2.1
**決策者**: Spec Architect

**決策內容**:
- 採用 LocalStorage + 定時儲存策略
- 欄位變更後 2 秒自動儲存 (debounce)
- 草稿過期時間: 7 天
- 提供草稿恢復對話框

**理由**:
- 防止使用者意外流失資料
- 提升使用者體驗
- LocalStorage 實作簡單,無需後端支援

**前後端分工**:
- 前端: LocalStorage 儲存、定時儲存、草稿恢復、過期清理
- 後端: 無需參與 (可選: 雲端草稿同步)
