# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 模態框元件
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/Modal.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 11 次
**使用模組**: incidents-list, alert-rules, resources-list, personnel

---

## 一、功能概述 (Functional Overview)

通用模態框元件,支援自訂標題、內容、頁尾按鈕

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 父元件設定 isOpen 為 true
2. Modal 顯示並覆蓋頁面,背景變暗
3. 使用者查看內容並進行操作
4. 使用者點擊按鈕或關閉圖示
5. Modal 觸發對應事件(onClose 或自訂)
6. 父元件處理事件並關閉 Modal

### 互動事件
- `onClose`: 關閉模態框事件
- ESC 鍵按下觸發 onClose
- 背景遮罩點擊觸發 onClose(可配置)
- footer 區塊的按鈕事件由父元件定義

---

## 三、狀態管理 (State Management)

### 內部狀態
- `isAnimating`: 動畫進行中標記

### 外部控制
- `isOpen`: 控制顯示/隱藏
- `title`: 標題
- `width`: 寬度
- `footer`: 頁尾內容(按鈕)
- `children`: 主要內容

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| title | string | ✅ | - | 標題 |
| width | string | ❌ | 'w-1/3' | 寬度類別 |
| footer | ReactNode | ❌ | null | 頁尾內容 |
| children | ReactNode | ✅ | - | 主要內容 |

---

## 五、錯誤與例外處理 (Error Handling)

- 當內容渲染錯誤時,顯示錯誤邊界
- 當背景點擊關閉被禁用時,僅允許按鈕關閉
- 無內部業務邏輯錯誤處理

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

## 五、Z-index 與顯示優先級 (Z-index Priority)

### 5.1 巢狀模態框顯示優先級

當多層 Modal 開啟時,遵循以下 Z-index 優先級規則:

#### Z-index 分層規則

| 層級 | Z-index | 用途 | 說明 |
|------|---------|------|------|
| Modal Level 1 | 1000 | 主 Modal | 第一層模態框 |
| Modal Level 2 | 1050 | 子 Modal | 第二層模態框(輔助選擇器) |
| Drawer | 1100 | 抽屜元件 | 永遠在最上層 |
| Toast | 9999 | 通知訊息 | 全域通知,最高優先級 |

#### 焦點管理規則

- 開啟新 Modal 時,焦點自動移至最上層 Modal 的第一個可互動元素
- 關閉子 Modal 時,焦點自動回到父 Modal
- ESC 鍵優先關閉最上層 Modal
- 點擊背景遮罩關閉最上層 Modal

#### 背景遮罩處理

- 所有層級的 Modal 共用同一個背景遮罩 (不重疊多層遮罩)
- 背景遮罩透明度: 第一層使用 `bg-black/50`,第二層不增加透明度
- 點擊背景遮罩時關閉最上層 Modal

#### 實作要點

- 使用 `ModalStackContext` 追蹤當前開啟的 Modal 層級
- 每個 Modal 開啟時推入堆疊,關閉時彈出堆疊
- 根據堆疊層級動態計算 Z-index: `1000 + level * 50`
- 使用 CSS 類別 `modal-level-{n}` 標記層級

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| Z-index 計算與套用 | ✅ | - |
| 焦點管理與鍵盤導航 | ✅ | - |
| 背景遮罩渲染與事件 | ✅ | - |
| Modal 堆疊狀態管理 | ✅ | - |

---

## 六、生命週期管理 (Lifecycle Management)

### 6.1 模態框內容的掛載與卸載策略

Modal 內容的生命週期應根據使用場景選擇適當策略:

#### 生命週期策略矩陣

| Modal 類型 | 掛載時機 | 卸載時機 | 理由 |
|-----------|---------|---------|------|
| 簡單表單 | 開啟時 (`open=true`) | 關閉後延遲 300ms | 等待動畫完成 |
| 複雜編輯 | 首次開啟時 | 頁面卸載時 | 避免重複初始化 |
| 詳情檢視 | 開啟時 | 關閉後立即卸載 | 確保資料最新 |
| 確認對話框 | 首次開啟時 | 頁面卸載時 | 確認框經常使用 |

#### 推薦模式: 延遲卸載 (Lazy Unmount)

- **預設行為**: `destroyOnClose={false}` - 關閉時保留 DOM,快速重新開啟
- **強制卸載**: `destroyOnClose={true}` - 關閉後卸載 DOM,釋放記憶體
- **延遲時間**: 等待 300ms 動畫完成後再卸載

#### 使用指引

- **一般表單**: 使用 `destroyOnClose={false}` (預設)
  - 優勢: 快速重新開啟,保留表單狀態
  - 適用: 頻繁開關的表單

- **需重新初始化**: 使用 `destroyOnClose={true}`
  - 優勢: 確保每次開啟時資料最新
  - 適用: 詳情檢視、依賴 API 資料的內容

- **大型內容**: 使用 `destroyOnClose={true}`
  - 優勢: 釋放記憶體,避免效能問題
  - 適用: 包含圖表、大量資料的 Modal

#### 效能考量

| 策略 | 優勢 | 劣勢 | 記憶體佔用 |
|------|------|------|-----------|
| 保留 DOM | 快速重開,保留狀態 | 佔用記憶體 | 高 |
| 卸載 DOM | 釋放記憶體,資料最新 | 重開較慢 | 低 |

#### 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 生命週期策略實作 | ✅ | - |
| DOM 掛載/卸載控制 | ✅ | - |
| 動畫完成偵測 | ✅ | - |
| 表單狀態保留 | ✅ | - |

---

## 七、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **resources-list**
- **personnel**

---

## 八、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 九、待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 巢狀模態框的顯示優先級]~~ → **已解決: 採用 Z-index 分層規則 (L1=1000, L2=1050, Drawer=1100)**
- ✅ ~~[NEEDS CLARIFICATION: 模態框內容的生命週期管理]~~ → **已解決: 採用延遲卸載策略,預設 `destroyOnClose={false}`**

---

## 十、決策記錄 (Decision Records)

### DR-001: Z-index 優先級規則

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.1.1
**決策者**: Spec Architect

**決策內容**:
- Modal Level 1: Z-index 1000
- Modal Level 2: Z-index 1050
- Drawer: Z-index 1100 (永遠最上層)
- Toast: Z-index 9999 (全域通知)

**理由**:
- 確保 UI 層級清晰,避免遮擋問題
- Drawer 優先於 Modal,用於第三層互動
- Toast 永遠可見,不被任何元件遮擋

**前後端分工**:
- 前端: Z-index 計算、焦點管理、背景遮罩控制
- 後端: 無需參與

---

### DR-002: Modal 生命週期策略

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.1.2
**決策者**: Spec Architect

**決策內容**:
- 預設策略: 延遲卸載 (關閉後保留 DOM)
- 可選策略: 立即卸載 (關閉後銷毀 DOM)
- 延遲時間: 300ms (等待動畫完成)

**理由**:
- 平衡效能與使用者體驗
- 預設保留 DOM 提升重開速度
- 允許開發者依場景選擇策略

**前後端分工**:
- 前端: 生命週期控制、DOM 管理、動畫處理
- 後端: 無需參與
