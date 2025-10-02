# OpenAPI 改進任務提示詞

你是一位資深全端工程師，請依據以下清單逐項修正 OpenAPI 規範與實作，確保文件、Schema、mock-server 與實際行為一致。

---

## 🎯 任務清單

### Critical 任務
1. **Dashboard Schema owner 欄位**
   - 問題：`Dashboard` Schema 將 `owner` 標為必填唯讀欄位，但建立物件時未補齊，導致回傳缺失。
   - 任務：於建立流程中根據 `owner_id` 自動補齊。

2. **Resource Schema tags 欄位**
   - 問題：Schema 定義為字典物件，但實際回傳與批次更新使用 `{id,key,value}` 陣列。
   - 任務：將 Schema 改為陣列型別並定義元素結構。

3. **Incident 枚舉大小寫不一致**
   - 問題：事件建立流程將 `severity`/`impact` 轉為首字大寫（如 `Critical`），與文件列出的全小寫不符。
   - 任務：統一改為小寫枚舉。

4. **Silence Rules 缺少路徑**
   - 問題：實作已有 `/silence-rules` CRUD 與批次操作，但文件中缺漏。
   - 任務：新增 Silence Rules 路徑檔。

### Warning 任務
5. **Incident 通知端點缺漏**
   - 問題：`POST /incidents/{id}/notify` 已實作，但文件中未載明。
   - 任務：需確認是否已有 mock-server 對應，若沒有需新增補充端點說明與回應 Schema。

---

## 🔍 一致性修正原則

- **命名規範**：保持 snake_case，確保 owner、tags 欄位正確填入。  
- **枚舉值**：統一大小寫，避免客戶端解析錯誤。  
- **型別定義**：`Resource.tags` 與批次回應結構需改為陣列格式。  

---

## 📤 輸出要求

- 修改對應檔案 (`openapi-specs/*.yaml`, `mock-server/*`)  
- 說明修改原因與影響範圍  
- 確保修正後，OpenAPI 文件與 mock-server 行為完全一致  
- 需同步檢查 docs/enums-ssot.md，避免枚舉定義不一致。

---

**提示詞版本**: 2.0  
**最後更新**: 2025-10-02
