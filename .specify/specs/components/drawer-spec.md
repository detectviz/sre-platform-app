# 功能規格書（Feature Specification）

**模組名稱 (Module)**: Drawer
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/Drawer.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，當我點擊列表中的一個項目以查看其詳細資訊時，我不希望被帶到一個全新的頁面而失去當前的列表上下文。我希望能從螢幕邊緣滑出一個面板來展示詳情，當我查看完畢後，可以輕鬆地關閉它並回到我原來的位置繼續瀏覽。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 一個 Drawer 元件處於關閉狀態 (`isOpen={false}`)。
    **When** 父元件將 `isOpen` 屬性更新為 `true`。
    **Then** Drawer 必須從螢幕右側平滑地滑入，並顯示其標題和內容。同時，頁面主體的滾動條應被禁用。

2.  **Given** 一個 Drawer 元件處於開啟狀態。
    **When** 我點擊抽屜右上角的「X」按鈕。
    **Then** `onClose` 回呼函式必須被觸發，父元件應將 `isOpen` 更新為 `false`，使 Drawer 平滑地滑出螢幕。

3.  **Given** 一個 Drawer 元件處於開啟狀態。
    **When** 我按下鍵盤上的 `Escape` 鍵。
    **Then** `onClose` 回呼函式必須被觸發，Drawer 應被關閉。

4.  **Given** 一個 Drawer 元件需要顯示額外的操作按鈕，例如「重新發送」。
    **When** 父元件向 `extra` 屬性傳入一個按鈕元件。
    **Then** 該按鈕必須顯示在抽屜標題列的「X」按鈕旁邊。

### 邊界案例（Edge Cases）
- 即使 Drawer 的內容過多導致其內部出現滾動條，頁面主體的滾動條也應保持鎖定狀態。
- 快速連續地切換 `isOpen` 狀態，元件的動畫應能正常表現，不會出現狀態錯亂。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）是一個從螢幕右側滑出的面板容器。
- **FR-002**：元件的顯示和隱藏必須（MUST）由外部傳入的 `isOpen` 屬性完全控制。
- **FR-003**：元件必須（MUST）提供至少三種關閉途徑：點擊關閉按鈕、點擊遮罩層、按下 `Escape` 鍵。所有途徑都應觸發 `onClose` 回呼函式。
- **FR-004**：當元件開啟時，必須（MUST）禁用頁面主體的滾動條；關閉時必須恢復。
- **FR-005**：元件必須（MUST）允許透過 `title` 屬性自訂標題，並透過 `children` 屬性傳入其主體內容。
- **FR-006**：元件必須（MUST）允許透過 `width` 屬性自訂其寬度。
- **FR-007**：元件應該（SHOULD）提供一個 `extra` 屬性，用於在標題區域注入額外的操作元件。
- **FR-008**：元件的滑入滑出必須（MUST）具備平滑的動畫效果。

---

## 三、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `title` | `string` | 是 | 顯示在抽屜頂部的標題文字。 |
| `isOpen` | `boolean` | 是 | 控制抽屜的開啟或關閉狀態。 |
| `onClose` | `() => void` | 是 | 當使用者請求關閉抽屜時觸發的回呼函式。 |
| `children` | `React.ReactNode`| 是 | 顯示在抽屜主體部分的內容。 |
| `width` | `string` | 否 | 設定抽屜寬度的 CSS class。預設為 `'w-2/3'`。 |
| `extra` | `React.ReactNode`| 否 | 顯示在標題列右側的額外內容（如操作按鈕）。 |

---

## 四、關聯模組（Associated Modules）

此元件是平台中實現「主從式介面」的核心容器，被多個模組用於顯示詳情或次級流程：
- `incidents-list` (顯示事件詳情)
- `resources-list` (顯示資源詳情)
- `resources-group` (顯示群組詳情)
- `automation-history` (顯示執行日誌)
- `identity-personnel` (顯示人員詳情)
- `identity-team` (顯示團隊詳情)
- `identity-audit` (顯示審計詳情)
- `notification-history` (顯示通知詳情)