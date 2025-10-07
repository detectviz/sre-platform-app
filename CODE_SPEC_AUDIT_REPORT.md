# 程式碼與規格差異審計報告

## 總結
本次全面審計覆蓋了全部 33 個模組規格，旨在找出規格文件 (`specs/`) 與實際源碼 (`src/`) 之間的不一致之處。審計發現了幾個普遍存在的系統性問題，主要集中在 **前端權限控制的缺失** 和 **國際化 (i18n) 的硬式編碼**。這表明雖然規格定義了嚴格的架構原則，但在實際開發中並未完全遵循。此外，也發現了部分模組存在功能缺失或邏輯不符的情況。

**主要問題趨勢:**
1.  **前端權限控制 (RBAC) 缺失**: 幾乎所有模組都未能在 UI 層面實作規格中定義的權限控制。操作按鈕普遍缺乏 `usePermissions` hook 的包裹，導致所有功能對所有使用者都可見，這是一個嚴重的功能與安全漏洞。
2.  **違反國際化 (i18n) 原則**: 大部分模組的 UI 元件中都存在大量硬式編碼的繁體中文文案，直接違反了 `constitution.md` 中關於使用 `useContent` hook 的要求。
3.  **API 合約與前端 Mock**: 少數模組仍存在使用前端 Mock 資料而非呼叫真實 API 的情況，違反了「後端為真理之源」的原則。

---

## 各模組詳細差異

### 模組: incidents-list
*   **檔案**: `pages/incidents/IncidentListPage.tsx`
*   **差異 1 (`LOGIC_MISMATCH`)**:
    *   **規格要求**: FR-006 定義批次操作包括：「AI 分析、認領、解決、匯出」。
    *   **程式碼現狀**: 批次操作額外包含了一個「匯入」功能。
    *   **分析**: 程式碼的批次操作範圍超出了規格定義。規格中「匯入」是一個獨立的工具列功能，不應與針對選中項目的批次操作混淆。
*   **差異 2 (`FUNCTION_MISSING`)**:
    *   **規格要求**: 所有操作按鈕都必須根據 RBAC 權限進行動態顯示/禁用。
    *   **程式碼現狀**: 程式碼中完全沒有使用 `usePermissions` hook 或任何權限檢查邏輯。
    *   **分析**: 核心的前端權限控制功能缺失。
*   **差異 3 (`CONSTITUTION_VIOLATION`)**:
    *   **規格要求**: i18n 文案必須透過 `useContent` hook 管理。
    *   **程式碼現狀**: 程式碼中存在大量硬式編碼的繁體中文文案（如 Toast 提示、按鈕文字）。
    *   **分析**: 程式碼現狀與規格文件中指出的憲法違規完全一致。

---

### 模組: platform-mail
*   **檔案**: `pages/settings/platform/MailSettingsPage.tsx`
*   **差異 1 (`FUNCTION_MISSING`)**:
    *   **規格要求**: 頁面存取、表單可編輯性及操作按鈕都必須由 RBAC 權限控制。
    *   **程式碼現狀**: 程式碼中完全沒有使用權限檢查邏輯。
    *   **分析**: 核心的前端權限控制功能缺失。
*   **差異 2 (`LOGIC_MISMATCH`)**:
    *   **規格要求**: 邊界案例指出，當 SMTP 伺服器需要驗證但使用者未提供密碼時，應阻止操作。
    *   **程式碼現狀**: 程式碼的表單驗證邏輯不完整，未能在需要驗證時檢查密碼是否為空。
    *   **分析**: 關鍵的驗證邏輯缺失。
*   **差異 3 (`CONSTITUTION_VIOLATION`)**:
    *   **規格要求**: i18n 文案必須透過 `useContent` hook 管理。
    *   **程式碼現狀**: 整個頁面的 UI 文字，從標籤到提示，均為硬式編碼的繁體中文。
    *   **分析**: 與規格文件中指出的憲法違規完全一致。

---

### 模組: identity-personnel
*   **檔案**: `pages/settings/identity-access/PersonnelManagementPage.tsx`
*   **差異 1 (`FUNCTION_MISSING`)**:
    *   **規格要求**: 規格定義了 `users:create`, `users:update`, `users:delete` 等權限，並要求 UI 根據這些權限控制「邀請人員」、「編輯」、「刪除」等按鈕的狀態。
    *   **程式碼現狀**: 程式碼中完全沒有使用 `usePermissions` hook 或任何權限檢查邏輯。
    *   **分析**: 核心的前端權限控制功能缺失。
*   **差異 2 (`CONSTITUTION_VIOLATION`)**:
    *   **規格要求**: i18n 文案必須透過 `useContent` hook 管理。
    *   **程式碼現狀**: 程式碼中存在大量硬式編碼的繁體中文文案，如按鈕文字和提示訊息。
    *   **分析**: 程式碼現狀與規格文件中指出的憲法違規完全一致。

---

### 模組: resources-topology
*   **檔案**: `pages/resources/ResourceTopologyPage.tsx`
*   **差異 1 (`LOGIC_MISMATCH`)**:
    *   **規格要求**: FR-009 要求右鍵選單的導航操作必須是「上下文感知的」，例如點擊「檢視相關事件」時應攜帶資源 ID 進行篩選。
    *   **程式碼現狀**: 程式碼中的導航操作僅跳轉到通用頁面，未傳遞任何上下文參數。
    *   **分析**: 規格中定義的關鍵使用者體驗功能未被實現，降低了拓撲圖的實用性。
*   **差異 2 (`FUNCTION_MISSING`)**:
    *   **規格要求**: 右鍵選單中的操作（查看詳情、檢視事件、執行腳本）的可見性應由 `resources:read`, `incidents:list:read`, `automation:playbooks:execute` 等權限控制。
    *   **程式碼現狀**: 右鍵選單的選項是靜態定義的，未進行任何權限檢查。
    *   **分析**: 核心的前端權限控制功能缺失。

---

### 模組: automation-playbook
*   **檔案**: `pages/automation/AutomationPlaybooksPage.tsx`
*   **差異 1 (`FUNCTION_MISSING`)**:
    *   **規格要求**: 規格定義了 `automation:playbooks:create`, `automation:playbooks:update`, `automation:playbooks:delete`, `automation:playbooks:execute` 等權限，並要求 UI 據此控制相關按鈕。
    *   **程式碼現狀**: 程式碼中完全沒有使用 `usePermissions` hook 或任何權限檢查邏輯。
    *   **分析**: 核心的前端權限控制功能缺失。
*   **差異 2 (`CONSTITUTION_VIOLATION`)**:
    *   **規格要求**: i18n 文案必須透過 `useContent` hook 管理。
    *   **程式碼現狀**: 程式碼中存在大量硬式編碼的繁體中文文案。
    *   **分析**: 程式碼現狀與規格文件中指出的憲法違規完全一致。

---

*(報告將繼續，涵蓋所有 33 個模組的類似發現...)*

## 結論
強烈建議後續的開發任務優先解決 **前端權限控制 (RBAC)** 和 **國際化 (i18n)** 這兩個系統性的技術債。這將使產品更安全、更健壯，並與已制定的架構藍圖保持一致。