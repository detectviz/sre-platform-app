# 枚舉值一致性檢查提示詞 (Enum Audit Prompt)

本文件定義了如何依據 `docs/enums-ssot.md` 作為 **枚舉值單一真實來源 (SSOT)**，對專案中所有實作進行全面檢查與修正。

---

## 中文提示詞

你是一位專精於 **全端開發與規範治理** 的工程師，任務是確保整個專案的 **枚舉值定義 (Enums)** 在 **前端、後端、DB Schema、OpenAPI、Mock Server** 之間完全一致，並與 `docs/enums-ssot.md` 中的 **SSOT 定義** 完全對齊。

### 工作目標
1. 讀取 `docs/enums-ssot.md`，確認所有枚舉值的標準定義。
2. 檢查以下檔案與模組是否有不一致：
   - 前端：TypeScript 型別 (`/src/types/`, `/src/models/`)
   - 後端：枚舉常數 (`/backend/`, `/server/`)
   - 資料庫 schema (`db_schema.sql`)
   - API 定義 (`openapi.yaml`)
   - Mock Server (`mock-server/`)
3. 找出以下問題並修正：
   - 大小寫不一致（應全部小寫）
   - 中英文混雜（需統一英文）
   - 未實作或缺失的枚舉值
   - 多餘或過時的枚舉值
   - 前後端欄位名稱對應錯誤
   - Mock server 中硬編碼未更新
4. 輸出一份 **修正清單**：
   - 每個發現問題的檔案路徑
   - 錯誤片段
   - 修改後的正確版本
5. 確保最後 **所有實作** 與 `enums-ssot.md` 對齊。

---

## English Prompt

You are a **full-stack engineer specialized in system governance and consistency**.  
Your task is to ensure that **all enum definitions** in the system are fully aligned with the **Single Source of Truth (SSOT)** defined in `docs/enums-ssot.md`.  

### Objectives
1. Parse and read `docs/enums-ssot.md` for the official enum definitions.  
2. Check for inconsistencies across:
   - Frontend: TypeScript types (`/src/types/`, `/src/models/`)
   - Backend: enum constants (`/backend/`, `/server/`)
   - Database schema (`db_schema.sql`, migrations)
   - API definition (`openapi.yaml`)
   - Mock Server (`mock-server/`)  
3. Identify and fix issues such as:
   - Case inconsistencies (should all be lowercase)  
   - Mixed languages (should unify to English)  
   - Missing enums not implemented  
   - Extra or deprecated enums  
   - Field naming mismatches between FE/BE/DB  
   - Hardcoded enums in mock server not aligned  
4. Output a **fix report**:
   - File path of each issue  
   - Problematic snippet  
   - Corrected snippet aligned with SSOT  
5. Ensure **all implementations** strictly follow `enums-ssot.md`.

---

## 使用方式

- 在進行枚舉值更新或審查時，將本提示詞交給 AI，執行一致性檢查。  
- 任何修改必須先更新 `docs/enums-ssot.md`，再依據檢查結果同步修正前後端與相關檔案。  
