# Scenes 架構規格釐清與解決方案計畫 (Scene Specification Clarification & Resolution Plan)

**報告日期**: 2025-10-09  
**審查代理**: Jules (Senior Frontend Architect)  
**目標**:  
針對所有規格文件中標記為 `[NEEDS CLARIFICATION]` 的項目，提供基於 **Grafana Scenes 架構** 的統一解決方案，確保所有模組符合 `.specify/memory/constitution.md` 的一致性、可觀測性與治理原則。

---

## 1. 總體摘要 (Executive Summary)

在全面審查所有 Scene 模組後，發現跨模組普遍存在五大類問題：  
**國際化 (i18n)**、**主題化 (Theming)**、**依賴檢查 (Dependency Validation)**、**臨時性實現 (AS-IS Implementation)**、**安全性與互動設計 (Security & UX)**。  
本報告針對上述問題提供 Scenes 架構層級的解決方案，使行為與設計可統一封裝於 Scene 元件層與治理層中。

---

## 2. 通用性問題與解決方案

### 2.1. 國際化 (i18n) Context 統一化

- **問題描述**  
  部分 Scene 模組仍使用硬編碼字串或本地翻譯函式，缺乏集中式內容管理。

- **解決方案**  
  1. **統一內容來源**：使用 `SceneLocalizationProvider` 管理所有文案，並建立多語內容檔 (`zh-TW.json`, `en-US.json`)。  
  2. **移除自製翻譯函式**：所有介面文案必須使用 Scene context 提供的 i18n key。  
  3. **動態插值支援**：對於如 `成功刪除 {n} 個項目` 類訊息，改用 i18n interpolation 支援變數插入。  
  4. **稽核與治理**：由 `SceneEventBus` 每週自動稽核未本地化字串，並記錄於 Telemetry。

---

### 2.2. 主題化 (Theming) 與設計系統統一

- **問題描述**  
  現有模組存在直接使用靜態色碼或舊 Tailwind class，導致 Theme Token 不一致。

- **解決方案**  
  1. **統一 Token 管理**：由 `SceneThemeProvider` 管理顏色、字體、間距等全域變數。  
  2. **移除靜態色碼**：禁止 `#hex` 或 `rgb()` 寫法，統一改為 `theme.color.*`。  
  3. **統一語義 Token**：例如：
     - `theme.color.status.error.background`
     - `theme.color.status.warning.text`
     - `theme.color.action.primary.default`  
  4. **元件封裝**：所有 Scene 元件 (`SceneTable`, `ScenePanel`, `SceneControls`) 需支援 `variant` 或 `tone` props 以映射至 Theme Token。  

---

## 3. 特定功能性問題與解決方案

### 3.1. 依賴檢查 (Dependency Validation)

- **問題描述**  
  部分刪除操作未檢查資源依賴關係，導致資料不一致。

- **解決方案**  
  1. **後端職責**：後端在 `DELETE` API 需回傳 `409 Conflict` 與依賴清單。  
  2. **前端處理**：  
     - 由 `SceneQueryRunner` 捕獲 `409` 狀態並廣播事件：
       ```ts
       SceneEventBus.emit("scene:delete-conflict", {
         resourceId,
         dependencies,
       });
       ```
     - 由 `SceneStatusHandler` 顯示標準錯誤場景（提示依賴來源）。  
  3. **治理要求**：所有 CRUD 模組必須覆蓋此場景，並在規格中標記「依賴刪除保護」。

---

### 3.2. 臨時性實現 (AS-IS Implementation)

- **問題描述**  
  多個模組採用臨時前端實作（如前端 CRON 解析、事件模擬、前端聚合），違反後端一致性原則。

- **解決方案**  
  1. **統一排程解析**：所有排程解析應透過後端 `/utils/parse-cron` API。  
  2. **事件模擬移除**：刪除 `generateMockEvents` 相關函式，改由 `SceneQueryRunner` 查詢實際資料。  
  3. **資料聚合後端化**：將聚合運算移至後端，Scene 僅負責渲染。  
  4. **整合自動化觸發器**：`AutomationTrigger` 應包含 `last_execution` 欄位，由後端提供，不由前端匹配。

---

### 3.3. 未實現的關鍵功能

- **問題描述**  
  部分核心功能仍為佔位狀態（例如回測指標、動態表單）。

- **解決方案**  
  1. **進階回測指標**：後端於 `/backtesting/results/{id}` API 回傳 Precision、Recall、F1。  
  2. **動態表單支援**：後端提供 JSON Schema，由 Scene 透過 `SceneVariableSet` 動態渲染欄位。  
  3. **匯入功能**：統一採用 `SceneFileUploader` 元件管理上傳與驗證流程。  

---

## 4. 安全性與 UX 釐清 (Security & UX)

### 4.1. 憑證與敏感資料處理

- **問題描述**  
  部分 API 回傳敏感資訊（如 Client Secret）。

- **解決方案**  
  - 後端僅提供 `has_secret: true/false` 屬性，不回傳明文。  
  - 前端更新 (`PUT`/`PATCH`) 時透過 `SceneQueryRunner` 傳送，永不渲染密鑰值。  
  - 所有密鑰操作應上報 `SceneTelemetry` 與 `SceneAuditing`。

### 4.2. 外部連結與導航一致性

- **問題描述**  
  外部儀表板的開啟方式不一致。

- **解決方案**  
  - 在 `Dashboard` 定義中加入屬性：
    ```yaml
    target: _blank | _self
    ```
  - 由 `SceneLink` 決定開啟行為。  

---

## 5. 治理與觀測 (Governance & Observability)

| 項目 | 狀態 | 說明 |
|------|------|------|
| i18n 稽核 | ✅ | 未本地化字串自動稽核 |
| Theme Token 驗證 | ✅ | 所有元件需通過 `SceneThemeProvider` 驗證 |
| API 錯誤治理 | ✅ | 透過 `SceneStatusHandler` 統一呈現 |
| CRUD 流程觀測 | ✅ | 由 `SceneQueryRunner` 自動報告指標 |
| 安全審計 | ✅ | 所有刪除、更新操作上報至 `SceneAuditing` |

---

## 6. 結語 (Conclusion)

本文件為 Scenes 架構下的釐清與修正計畫，  
所有模組與場景應依此為準則，確保：
- 所有 `[NEEDS CLARIFICATION]` 項目有標準解法  
- 規格、UI 與資料流行為保持一致  
- 與 `.specify/memory/constitution.md` 完全對齊  
以實現可維護、可觀測、可審計的 SRE 平台前端。