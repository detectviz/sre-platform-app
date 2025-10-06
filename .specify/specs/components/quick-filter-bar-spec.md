# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 快速篩選列
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/QuickFilterBar.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 6 次
**使用模組**: resources-list, incidents-list, dashboards

---

## 一、功能概述 (Functional Overview)

提供快速篩選按鈕,常用於狀態或類型快速切換

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 父元件傳入篩選選項與當前值
2. QuickFilterBar 渲染按鈕列
3. 使用者點擊篩選按鈕
4. QuickFilterBar 觸發 onChange 事件
5. 父元件更新篩選條件並重新載入資料

### 互動事件
- `onChange`: 篩選值變更事件
- 按鈕點擊觸發 onChange,回傳新選取值

---

## 三、狀態管理 (State Management)

### 內部狀態
- 無特殊狀態

### 外部控制
- `options`: 篩選選項陣列
- `value`: 當前選取值
- `onChange`: 變更事件

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| options | FilterOption[] | ✅ | - | 篩選選項 |
| value | string | ✅ | - | 當前值 |
| onChange | (value) => void | ✅ | - | 變更事件 |

---

## 五、錯誤與例外處理 (Error Handling)

- 當選項為空時,顯示提示訊息
- 當 onChange 事件處理失敗時,保持原值
- 無內部錯誤處理邏輯

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **resources-list**
- **incidents-list**
- **dashboards**

---

## 七、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 四、與進階搜尋的整合方式 (Integration with Advanced Search)

### 4.1 整合策略: 快速篩選自動填入進階搜尋

當使用者使用快速篩選後開啟進階搜尋,篩選條件應自動填入進階搜尋表單,並採用 **AND 合併邏輯**。

### 4.2 UI 互動流程

```
1. 使用者點擊快速篩選「Critical」
   → 篩選條件: { severity: ['critical'] }

2. 使用者點擊進階搜尋按鈕
   → 進階搜尋 Modal 開啟,severity 欄位已預填 ['critical']

3. 使用者在進階搜尋中新增其他條件
   → 新增 status: ['open']
   → 合併條件: { severity: ['critical'], status: ['open'] }

4. 使用者點擊搜尋
   → 套用合併後的條件
```

### 4.3 實作要點

**快速篩選按鈕狀態**:
- 已選取: `bg-sky-600 text-white`
- 未選取: `bg-slate-700 text-slate-300`
- 懸停: `hover:bg-slate-600`

**進階搜尋按鈕顯示條件數量**:
```
[進階搜尋] → 無條件
[進階搜尋 (3)] → 已套用 3 個條件
```

**清除篩選**:
- 顯示時機: 有任何篩選條件時
- 點擊後: 清除所有快速篩選與進階搜尋條件

### 4.4 視覺化篩選狀態

```
┌─────────────────────────────────────┐
│ [Critical] [High] [進行中] [進階搜尋] │
│  (已選)   (未選)  (已選)   (3 個條件) │
├─────────────────────────────────────┤
│ 當前篩選: Critical · 進行中 · 負責人=Alice │
│ [清除篩選]                           │
└─────────────────────────────────────┘
```

### 4.5 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 快速篩選 UI 渲染 | ✅ | - |
| 條件自動填入進階搜尋 | ✅ | - |
| AND 邏輯合併 | ✅ | - |
| 篩選狀態視覺化 | ✅ | - |
| 篩選條件執行 | - | ✅ |

---

## 五、篩選狀態的 URL 同步機制 (URL Synchronization)

### 5.1 同步策略: URL Query String

篩選條件應同步至 URL,確保可分享、可書籤、支援瀏覽器前進/後退。

### 5.2 URL 格式

**標準格式**:
```
/incidents?filters={"severity":["critical"],"status":["open"]}&page=2&page_size=20
```

**解碼後**:
```
/incidents?filters={"severity":["critical"],"status":["open"]}&page=2&page_size=20
```

### 5.3 實作要點

**讀取 URL 參數**:
- 頁面載入時從 URL 讀取篩選條件
- 恢復快速篩選按鈕狀態
- 恢復分頁資訊

**更新 URL 參數**:
- 快速篩選變更時,立即更新 URL
- 進階搜尋套用時,更新 URL
- 清除篩選時,移除 filters 參數

**重置分頁**:
- 篩選條件變更時,page 重置為 1
- pageSize 保持不變

### 5.4 URL 過長處理

當 URL 長度 > 2000 字元時,使用 SessionStorage 備份:

**備份機制**:
```typescript
// 計算 hash
const hash = hashCode(JSON.stringify(filters));

// 儲存至 SessionStorage
sessionStorage.setItem(`filters-${hash}`, JSON.stringify(filters));

// URL 僅保留 hash
setSearchParams({ filters_hash: hash, page: '1' });
```

**恢復機制**:
```typescript
// 從 URL 讀取 hash
const hash = searchParams.get('filters_hash');

// 從 SessionStorage 恢復完整條件
const filters = JSON.parse(sessionStorage.getItem(`filters-${hash}`) || '{}');
```

### 5.5 分享功能

**分享篩選連結**:
```typescript
const handleShareFilters = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  showToast('已複製篩選連結', 'success');
};
```

**UI 顯示**:
```
[分享篩選] 按鈕 - 點擊複製當前 URL
```

### 5.6 與分頁持久化整合

篩選狀態與分頁狀態應統一管理:

| 狀態 | 儲存位置 | 優先級 |
|------|---------|--------|
| 篩選條件 | URL Query String | 1 |
| 分頁資訊 | URL Query String | 1 |
| 備份 (URL 過長) | SessionStorage | 2 |

### 5.7 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| URL 參數讀取/寫入 | ✅ | - |
| SessionStorage 備份 | ✅ | - |
| Hash 計算 | ✅ | - |
| 分享連結生成 | ✅ | - |
| 篩選條件解析 | - | ✅ |

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **resources-list**
- **incidents-list**
- **dashboards**

---

## 七、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 八、待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 快速篩選與進階搜尋的整合方式]~~ → **已解決: 快速篩選自動填入進階搜尋,採用 AND 合併邏輯**
- ✅ ~~[NEEDS CLARIFICATION: 篩選狀態的 URL 同步機制]~~ → **已解決: 採用 URL Query String,支援分享與書籤,URL 過長時使用 SessionStorage 備份**

---

## 九、決策記錄 (Decision Records)

### DR-001: 快速篩選與進階搜尋整合

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.7.1
**決策者**: Spec Architect

**決策內容**:
- 快速篩選條件自動填入進階搜尋
- 採用 AND 邏輯合併條件
- 顯示當前篩選狀態

**理由**:
- 提升使用者體驗
- 降低重複操作
- 保持篩選邏輯一致

**前後端分工**:
- 前端: 條件填入、UI 顯示、合併邏輯
- 後端: 篩選條件執行

---

### DR-002: 篩選狀態 URL 同步

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.7.2
**決策者**: Spec Architect

**決策內容**:
- 採用 URL Query String 儲存篩選條件
- URL 過長時使用 SessionStorage 備份
- 支援分享連結功能

**理由**:
- 確保可分享、可書籤
- 支援瀏覽器前進/後退
- 提升使用者體驗

**前後端分工**:
- 前端: URL 參數管理、SessionStorage 備份、分享功能
- 後端: 篩選條件解析與執行
