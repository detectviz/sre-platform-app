# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 抽屜元件
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/Drawer.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 8 次
**使用模組**: incidents-list, resources-list, resource-groups, discovery-jobs

---

## 一、功能概述 (Functional Overview)

側邊滑出抽屜,用於顯示詳情或表單

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 父元件設定 isOpen 為 true
2. Drawer 從右側滑入顯示
3. 使用者查看內容或進行操作
4. 使用者點擊關閉按鈕或背景遮罩
5. Drawer 觸發 onClose 事件
6. 父元件設定 isOpen 為 false,Drawer 滑出關閉

### 互動事件
- `onClose`: 關閉抽屜事件
- ESC 鍵按下觸發 onClose
- 背景遮罩點擊觸發 onClose
- 內容區的事件由 children 處理

---

## 三、狀態管理 (State Management)

### 內部狀態
- `isAnimating`: 動畫進行中標記

### 外部控制
- `isOpen`: 控制顯示/隱藏
- `title`: 標題
- `width`: 寬度(如 w-1/2, w-3/4)
- `children`: 內容

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| title | string | ✅ | - | 標題 |
| width | string | ❌ | 'w-1/2' | 寬度類別 |
| children | ReactNode | ✅ | - | 內容 |

---

## 五、錯誤與例外處理 (Error Handling)

- 當內容渲染錯誤時,顯示錯誤邊界
- 當動畫執行失敗時,強制完成開啟/關閉狀態
- 無內部業務邏輯錯誤處理

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **resources-list**
- **resource-groups**
- **discovery-jobs**

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

## 四、堆疊管理機制 (Stack Management)

### 4.1 多層抽屜的堆疊管理

**參照**: `common/modal-interaction-pattern.md` § 5.3

Drawer 的堆疊管理遵循統一的 Modal 互動規範:

#### Z-index 規則

| 元件 | Z-index | 說明 |
|------|---------|------|
| Modal Level 1 | 1000 | 主 Modal |
| Modal Level 2 | 1050 | 子 Modal |
| Drawer | 1100 | 永遠在最上層 |
| Toast | 9999 | 全域通知 |

#### 使用場景

- **Drawer 可疊加在 Modal 之上** - 用於第 3 層互動
- **Drawer 不建議多層堆疊** - 若需多層展示,改用 Tabs 或 Accordion

#### 焦點管理

- 開啟 Drawer 時,焦點移至 Drawer
- 關閉 Drawer 時,焦點回到觸發元素 (通常是 Modal)
- ESC 鍵關閉最上層 Drawer

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| Z-index 設定 | ✅ | - |
| 堆疊狀態管理 | ✅ | - |
| 焦點管理 | ✅ | - |

---

## 五、預載入策略 (Preload Strategy)

### 5.1 抽屜內容的載入時機與快取策略

根據 Drawer 內容類型,採用不同的預載入策略:

#### 預載入策略矩陣

| Drawer 類型 | 載入時機 | 快取策略 | 快取時間 | 理由 |
|------------|---------|---------|---------|------|
| 事件詳情 | 開啟時載入 | 快取 | 5 分鐘 | 資料可能變更 |
| 資源詳情 | 開啟時載入 | 快取 | 10 分鐘 | 資料較穩定 |
| 操作日誌 | 開啟時載入 | 不快取 | - | 需即時資料 |
| 說明文件 | 預先載入 | 永久快取 | - | 靜態內容 |

#### 實作要點

- 使用 React Query 的 `enabled` 參數控制載入時機
- 使用 `staleTime` 控制快取時間
- 顯示載入骨架屏 (Skeleton) 提升體驗
- 提供「刷新」按鈕重新載入資料

#### 快取失效提示

- 顯示「最後更新時間」
- 資料過時時顯示警告 Banner
- 提供「刷新」按鈕

#### 效能優化

- 預先載入常用 Drawer 內容
- 使用 HTTP ETag 實現條件請求
- 大型資料使用分段載入

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 載入時機控制 | ✅ | - |
| 快取策略實作 | ✅ | - |
| 骨架屏顯示 | ✅ | - |
| 刷新按鈕 | ✅ | - |
| 資料 API | ✅ | ✅ |
| Cache-Control Header | - | ✅ |
| ETag 支援 | - | ✅ |

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **resources-list**
- **resource-groups**
- **discovery-jobs**

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

- ✅ ~~[NEEDS CLARIFICATION: 多層抽屜的堆疊管理機制]~~ → **已解決: 參照 `modal-interaction-pattern.md`,Drawer 使用 z-index 1100,永遠在最上層**
- ✅ ~~[NEEDS CLARIFICATION: 抽屜內容的預載入策略]~~ → **已解決: 根據內容類型採用不同快取策略,5-10 分鐘快取時間**

---

## 九、決策記錄 (Decision Records)

### DR-001: Drawer 堆疊管理機制

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.4.1, `modal-interaction-pattern.md` § 5.3
**決策者**: Spec Architect

**決策內容**:
- Drawer 使用 z-index 1100,永遠在 Modal 之上
- Drawer 可疊加在 Modal 上,作為第 3 層互動
- 不建議 Drawer 多層堆疊,改用 Tabs/Accordion

**理由**:
- 統一 Modal/Drawer 的層級管理
- 提供第 3 層互動方案
- 避免過深的層級導致使用者困惑

**前後端分工**:
- 前端: Z-index 控制、焦點管理
- 後端: 無需參與

---

### DR-002: Drawer 預載入策略

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.4.2
**決策者**: Spec Architect

**決策內容**:
- 開啟時載入 + React Query 快取
- 事件詳情快取 5 分鐘,資源詳情快取 10 分鐘
- 操作日誌不快取,說明文件永久快取
- 提供刷新按鈕與過時提示

**理由**:
- 平衡效能與資料新鮮度
- 減少不必要的 API 呼叫
- 提升使用者體驗

**前後端分工**:
- 前端: 載入控制、快取策略、UI 提示
- 後端: Cache-Control Header、ETag 支援
