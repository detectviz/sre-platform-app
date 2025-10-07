# 功能規格書（Feature Specification）

**模組名稱 (Module)**: Modal & Drawer Interaction Pattern
**類型 (Type)**: Common
**來源路徑 (Source Path)**: `components/Modal.tsx`, `components/Drawer.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，我期望平台中的彈出式對話方塊（無論是居中的模態框還是從側面滑出的抽屜）都具有一致、無干擾且可預測的行為。作為一名開發者，我需要清晰的指導原則，來幫助我根據互動的複雜性，選擇使用最合適的彈出式容器元件。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要執行一個簡短、聚焦的操作，例如刪除確認或新增一個簡單的項目。
    **When** 我觸發該操作。
    **Then** 系統必須使用一個**模態框 (Modal)** 來呈現對應的介面。

2.  **Given** 我需要查看一個物件的詳細資訊或執行一個包含多個步驟的複雜流程，同時不希望完全離開當前的列表頁面。
    **When** 我觸發該操作。
    **Then** 系統必須使用一個**抽屜 (Drawer)** 來呈現對應的介面。

3.  **Given** 任何一個模態框或抽屜處於開啟狀態。
    **When** 我按下鍵盤上的 `Escape` 鍵。
    **Then** 該彈出式面板必須被關閉。

---

## 二、功能需求（Functional Requirements）

- **FR-001**: 平台必須（MUST）提供兩種標準的彈出式面板容器：`Modal`（居中模態框）和 `Drawer`（側滑抽屜）。
- **FR-002**: **`Modal`** 應該（SHOULD）用於簡短、聚焦的任務，例如：
  - 確認對話框（如刪除確認）。
  - 簡單的表單填寫（如新增/編輯一個欄位較少的物件）。
  - 顯示簡短的資訊或報告（如 AI 分析結果）。
- **FR-003**: **`Drawer`** 應該（SHOULD）用於展示更豐富的詳細資訊或更複雜的流程，例如：
  - 展示一個物件的完整詳情頁（Master-Detail 模式）。
  - 顯示一個包含多個步驟的設定流程。
  - 展示執行日誌或歷史紀錄。
- **FR-004**: 所有 `Modal` 和 `Drawer` 都必須（MUST）支援透過點擊關閉按鈕、點擊背景遮罩或按下 `Escape` 鍵來關閉。
- **FR-005**: 當任何 `Modal` 或 `Drawer` 開啟時，頁面主體的背景滾動必須（MUST）被禁用。
- **FR-006**: 彈出式面板的顯示狀態必須（MUST）由父元件透過 `isOpen` 屬性進行控制（受控元件模式）。
- **FR-007**: 除非有極其特殊的理由，否則應避免**堆疊**模態框（在一個模態框之上再打開另一個模態框）。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **Modal** | 用於短小、聚焦任務的居中彈出式對話方塊。 | - |
| **Drawer** | 用於顯示詳細資訊或複雜流程的側滑面板。 | - |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 元件本身的開啟/關閉通常無需審計，但由其觸發的**業務操作**（如點擊「儲存」按鈕）則必須在對應的模組中被審計。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集核心性能指標。對於載入大量資料的 Drawer，應考慮使用自訂標記來測量其內容渲染時間。 |
| RBAC 權限與審計 | ✅ | 元件本身不處理權限。觸發其開啟的操作按鈕的權限，應在具體的模組級規格中定義。 |
| i18n 文案 | ✅ | 元件的標題等文字應由父元件傳入，並遵循 i18n 規範。 |
| Theme Token 使用 | ✅ | `Modal` 和 `Drawer` 的樣式應完全來自於平台的設計系統和 Theme Token。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項（Clarifications）

(此區塊所有相關項目已被澄清)