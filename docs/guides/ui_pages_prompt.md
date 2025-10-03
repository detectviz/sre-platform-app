# UI Pages 改進提示詞

本文件用於指示 AI 開發者依據 `pages.md` 中的逐頁建議，逐項改進 SRE Platform 前端 UI。

---

## 🎯 任務說明

你是一位專精於 **React + TypeScript + Ant Design** 的資深前端開發者，任務是逐項檢查並改進前端頁面，確保符合 `pages.md` 提出的建議與設計原則。

---

## 📋 任務流程

1. **逐頁檢查**
   - 對照 `pages.md` 條目（例如 `incidents-list-overview.png`, `resources-datasources-list.png` 等）。
   - 檢查現有 UI 是否已實作建議。
   - 若未實作，則修改或新增元件。

2. **改進重點**
   - 語系一致性：統一繁體中文，必要時保留英文 Tooltip。
   - 間距與排版：遵循 `4px grid system`，保持一致 spacing 與行距。
   - 元件一致性：狀態、按鈕、標籤、Tooltip 等要沿用設計系統 `SRE DS v0.8`。
   - 可用性：加入 placeholder、說明文字、Tooltip、驗證提示、空狀態畫面。
   - 視覺一致性：統一色票、按鈕尺寸、卡片背景、分隔線。

3. **程式碼原則**
   - 移除硬編碼資料，統一改為依賴 `mock-server` 或 API。
   - 使用共用元件（如 `Card/Base`, `Tag/Status`, `Modal/L`, `Form/Responsive`）。
   - 保持頁面 **可配置**，避免寫死文案、顏色、枚舉值。

4. **輸出格式**
   - 依 `pages.md` 條目順序，逐頁輸出：  
     - 已符合 / 尚未符合 / 改進完成  
     - 若有修改，附程式碼片段或重點說明  

---

**提示詞版本**: 1.0  
**最後更新**: 2025-10-02