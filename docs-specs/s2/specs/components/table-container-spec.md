# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 表格容器
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/TableContainer.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 12 次
**使用模組**: incidents-list, alert-rules, resources-list, personnel, teams

---

## 一、功能概述 (Functional Overview)

統一的表格容器,提供一致的樣式與佈局

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 父元件傳入表格與分頁元件
2. TableContainer 渲染容器,提供固定高度與滾動區域
3. 表格內容在滾動區域內顯示
4. 分頁控制固定於底部
5. 使用者滾動查看更多資料

### 互動事件
- 表格內的點擊、排序、選取事件由父元件處理
- 滾動事件由容器管理
- 分頁事件透過 Pagination 元件觸發

---

## 三、狀態管理 (State Management)

### 內部狀態
- 無特殊狀態,純展示容器

### 外部控制
- `children`: 傳入的表格與分頁元件

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| children | ReactNode | ✅ | - | 表格與分頁元件 |
| table | ReactNode | ❌ | - | 表格元件(替代 children) |
| footer | ReactNode | ❌ | - | 分頁元件(替代 children) |

---

## 五、錯誤與例外處理 (Error Handling)

- 當子元件渲染錯誤時,顯示錯誤邊界訊息
- 當表格資料為空時,由父元件的 TableLoader 或 TableError 處理

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **resources-list**
- **personnel**
- **teams**

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

## 四、表格高度的自適應策略 (Height Adaptation Strategy)

### 4.1 自適應策略: 固定高度 + ResizeObserver 監聽

表格高度應根據視窗大小自動調整,確保最佳使用體驗。

### 4.2 計算邏輯

**可用高度計算**:
```
可用高度 = 視窗高度 - 頂部偏移 - 底部預留 - 分頁高度
```

**參數說明**:
- 視窗高度: `window.innerHeight`
- 頂部偏移: 表格容器距離視窗頂部的距離
- 底部預留: 80px (避免內容貼底)
- 分頁高度: 64px

**最小高度限制**: 400px

### 4.3 實作方式

**方式一: JavaScript + ResizeObserver**
- 使用 `useRef` 取得容器 DOM 元素
- 使用 `ResizeObserver` 監聽容器大小變化
- 監聽 `window.resize` 事件
- 動態更新表格高度

**方式二: CSS Grid Layout**
- 使用 CSS Grid 定義頁面佈局
- 表格區域使用 `1fr` 自動填滿剩餘空間
- 最小高度使用 `min-height: 400px`

**方式三: Tailwind 工具類別**
- 使用 `flex flex-col h-screen` 定義頁面容器
- Header、Toolbar 使用 `flex-none` 固定高度
- 表格區域使用 `flex-1 overflow-auto min-h-[400px]`
- Pagination 使用 `flex-none` 固定高度

### 4.4 響應式斷點

| 螢幕尺寸 | 高度策略 | 說明 |
|---------|---------|------|
| 小螢幕 (< 768px) | 固定 400px | 避免過小影響使用 |
| 中螢幕 (768px - 1023px) | 60% 視窗高度 | 平衡內容顯示 |
| 大螢幕 (>= 1024px) | 計算剩餘空間 | 最大化內容顯示 |

### 4.5 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 高度計算邏輯 | ✅ | - |
| ResizeObserver 監聽 | ✅ | - |
| CSS Grid 佈局 | ✅ | - |
| 響應式斷點處理 | ✅ | - |

---

## 五、虛擬滾動的觸發條件 (Virtual Scrolling)

### 5.1 觸發條件

**參照**: `common/table-design-system.md` § 11.2

**觸發閾值**: 單頁資料 > 100 筆

```typescript
const VIRTUAL_SCROLL_THRESHOLD = 100;

const TableContainer = ({ data }) => {
  if (data.length > VIRTUAL_SCROLL_THRESHOLD) {
    return <VirtualizedTable data={data} />;
  } else {
    return <StandardTable data={data} />;
  }
};
```

### 5.2 技術方案

**採用**: **react-window** (FixedSizeList)

**理由**:
- 輕量級 (3KB)
- 效能優異
- API 簡單易用
- 社群成熟

### 5.3 效能要求

| 指標 | 要求 | 測試條件 |
|------|------|----------|
| 初次渲染 | < 100ms | 1000 筆資料 |
| 滾動 FPS | > 55 FPS | 持續滾動 |
| 記憶體佔用 | < 50MB | 10000 筆資料 |
| 滾動位置記憶 | 支援 | 返回頁面恢復位置 |
| 鍵盤導航 | 支援 | ↑↓ 鍵切換列 |

### 5.4 何時不使用虛擬滾動

- 資料量 < 100 筆 (標準渲染即可)
- 需要列高度動態變化 (使用 `VariableSizeList`)
- 需要水平滾動 + 固定欄位 (使用 Grid 模式)

### 5.5 實作參考

詳細實作方式請參照 `common/table-design-system.md` § 11 虛擬滾動實作規範。

### 5.6 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 虛擬滾動實作 | ✅ | - |
| 觸發條件判斷 | ✅ | - |
| 效能監控 | ✅ | - |
| 資料分頁提供 | - | ✅ |

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **resources-list**
- **personnel**
- **teams**

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

- ✅ ~~[NEEDS CLARIFICATION: 表格高度的自適應策略]~~ → **已解決: 採用固定高度 + ResizeObserver 監聽,支援響應式斷點**
- ✅ ~~[NEEDS CLARIFICATION: 虛擬滾動的觸發條件]~~ → **已解決: 單頁資料 > 100 筆時啟用,採用 react-window (參照 common/table-design-system.md § 11)**

---

## 九、決策記錄 (Decision Records)

### DR-001: 表格高度自適應策略

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.8.1
**決策者**: Spec Architect

**決策內容**:
- 採用固定高度 + ResizeObserver 監聽
- 支援響應式斷點 (小/中/大螢幕)
- 最小高度 400px

**理由**:
- 確保不同螢幕尺寸最佳體驗
- 自動適應視窗大小變化
- 避免內容過小或過大

**前後端分工**:
- 前端: 高度計算、ResizeObserver 監聽、響應式處理
- 後端: 無需參與

---

### DR-002: 虛擬滾動觸發條件

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.8.2, `common/table-design-system.md` § 11
**決策者**: Spec Architect

**決策內容**:
- 觸發閾值: 單頁資料 > 100 筆
- 技術方案: react-window (FixedSizeList)
- 效能要求: 渲染 < 100ms, FPS > 55

**理由**:
- 參照已確認的通用規範
- 確保效能與使用者體驗
- 統一虛擬滾動實作標準

**前後端分工**:
- 前端: 虛擬滾動實作、觸發條件判斷
- 後端: 資料分頁提供
