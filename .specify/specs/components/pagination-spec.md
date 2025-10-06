# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 分頁元件
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/Pagination.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 12 次
**使用模組**: incidents-list, alert-rules, resources-list, personnel

---

## 一、功能概述 (Functional Overview)

統一的分頁控制元件,支援頁碼切換與每頁筆數調整

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 父元件傳入總筆數、當前頁碼、每頁筆數
2. Pagination 計算總頁數並渲染控制項
3. 使用者點擊頁碼或上下頁按鈕
4. Pagination 觸發 onPageChange 事件
5. 父元件更新狀態並重新載入資料

### 互動事件
- `onPageChange`: 頁碼變更事件
- `onPageSizeChange`: 每頁筆數變更事件
- 上下頁按鈕點擊觸發 onPageChange

---

## 三、狀態管理 (State Management)

### 內部狀態
- 無特殊狀態,所有狀態由父元件管理

### 外部控制
- `total`: 總筆數
- `page`: 當前頁碼
- `pageSize`: 每頁筆數

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| total | number | ✅ | - | 總筆數 |
| page | number | ✅ | - | 當前頁碼 |
| pageSize | number | ✅ | - | 每頁筆數 |
| onPageChange | (page) => void | ✅ | - | 頁碼變更事件 |
| onPageSizeChange | (size) => void | ✅ | - | 每頁筆數變更事件 |

---

## 五、錯誤與例外處理 (Error Handling)

- 當總頁數計算錯誤時,顯示錯誤訊息
- 當頁碼超出範圍時,自動修正為有效頁碼
- 當每頁筆數為 0 或負數時,使用預設值 10

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **resources-list**
- **personnel**

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

## 四、分頁資訊持久化 (Pagination Persistence)

### 4.1 跨頁面保留分頁狀態

採用 **URL Query String + SessionStorage 備份**策略:

#### 持久化策略

| 儲存方式 | 用途 | 優勢 | 限制 |
|---------|------|------|------|
| URL Query String | 主要儲存方式 | 可分享、可書籤、支援前進/後退 | URL 長度限制 |
| SessionStorage | 備份儲存 | 無長度限制、效能好 | 無法分享、關閉分頁即清除 |

#### URL 格式範例

```
/incidents?page=2&page_size=50&filters={"status":"open"}
```

#### 實作要點

- 使用 React Router 的 `useSearchParams` 管理 URL 參數
- 分頁變更時更新 URL: `setSearchParams({ page, page_size, filters })`
- 頁面載入時從 URL 讀取分頁資訊
- 複雜篩選條件備份至 SessionStorage (避免 URL 過長)

#### 恢復狀態時機

- 頁面重新整理後自動恢復
- 從詳情頁返回列表頁時恢復
- 瀏覽器前進/後退按鈕觸發時恢復

#### 狀態過期處理

- SessionStorage 儲存時間戳記
- 超過 30 分鐘的狀態不恢復
- 清除過期的 SessionStorage 項目

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| URL 參數管理 | ✅ | - |
| SessionStorage 備份 | ✅ | - |
| 狀態恢復邏輯 | ✅ | - |
| 過期檢查 | ✅ | - |

---

## 五、大資料量分頁策略 (Large Dataset Pagination)

### 5.1 分頁策略選擇

**參照**: `common/table-design-system.md` § 7.1

根據資料量選擇適當的分頁策略:

#### 分頁策略矩陣

| 資料量 | 分頁策略 | 虛擬滾動 | API 呼叫方式 |
|-------|---------|---------|------------|
| < 1000 筆 | 前端分頁 | 否 | 一次載入全部 |
| 1000-10000 筆 | 後端分頁 | 是 (單頁 > 100) | 按需載入 (Offset) |
| > 10000 筆 | 後端分頁 | 是 | 按需載入 (Cursor) |

#### 後端分頁 (推薦,已實作)

- **資料量 > 1000 筆時必須使用**
- API 格式: `GET /api/v1/incidents?page=1&page_size=20`
- 後端回傳總筆數: `{ data: [], total: 1234 }`
- 前端根據 `total` 計算總頁數

#### 虛擬滾動整合

- 單頁資料 > 100 筆時啟用虛擬滾動
- 參照 `table-design-system.md` § 11 的實作規範
- 使用 react-window 實作

#### Cursor 分頁 (未來擴展)

- 適用於超大資料集 (> 10000 筆)
- API 格式: `GET /api/v1/incidents?cursor=abc123&limit=20`
- 避免 Offset 分頁的效能問題

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 分頁策略判斷 | ✅ | - |
| URL 參數傳遞 | ✅ | - |
| 虛擬滾動實作 | ✅ | - |
| 分頁查詢 (Offset) | - | ✅ |
| 總筆數計算 | - | ✅ |
| Cursor 分頁 (未來) | - | ✅ |

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **resources-list**
- **personnel**

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

- ✅ ~~[NEEDS CLARIFICATION: 分頁資訊的持久化(跨頁面保留)]~~ → **已解決: 採用 URL Query String + SessionStorage 備份策略**
- ✅ ~~[NEEDS CLARIFICATION: 大資料量時的分頁策略(前端或後端)]~~ → **已解決: 參照 `table-design-system.md`,資料量 > 1000 筆使用後端分頁**

---

## 九、決策記錄 (Decision Records)

### DR-001: 分頁資訊持久化策略

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.5.1
**決策者**: Spec Architect

**決策內容**:
- URL Query String 作為主要儲存方式
- SessionStorage 備份複雜篩選條件
- 30 分鐘過期自動清除
- 支援瀏覽器前進/後退

**理由**:
- URL 可分享、可書籤
- 重新整理頁面後保留狀態
- SessionStorage 避免 URL 過長
- 符合使用者預期行為

**前後端分工**:
- 前端: URL 管理、SessionStorage、狀態恢復
- 後端: 無需參與

---

### DR-002: 大資料量分頁策略

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.5.2, `table-design-system.md` § 7.1
**決策者**: Spec Architect

**決策內容**:
- 資料量 > 1000 筆使用後端分頁
- 單頁 > 100 筆啟用虛擬滾動
- 使用 Offset 分頁,未來可擴展至 Cursor 分頁

**理由**:
- 後端分頁避免載入過多資料
- 虛擬滾動提升渲染效能
- 符合 table-design-system 規範

**前後端分工**:
- 前端: 分頁 UI、虛擬滾動
- 後端: 分頁查詢、總筆數計算
