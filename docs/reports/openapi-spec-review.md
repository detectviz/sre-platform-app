# SRE Platform OpenAPI 3.0 審查報告

## 審查統計
- 審查檔案數：16
- 通過檔案數：11
- 發現問題數：5（Critical：4，Warning：1，Info：0）

## 優點與符合規範處
- 共用參數與錯誤回應定義完整，分頁、排序參數與錯誤範例敘述清楚，有助於前後端重用。【F:openapi-specs/01-common-parameters.yaml†L1-L51】【F:openapi-specs/02-common-responses.yaml†L1-L126】
- 多數 Schema 欄位使用 snake_case，並為時間欄位正確標註 `date-time` 格式，整體結構清晰易讀。【F:openapi-specs/03-schemas-core.yaml†L72-L87】【F:openapi-specs/03-schemas-core.yaml†L308-L334】
- 事件路徑涵蓋分頁查詢、批次操作與狀態更新，且範例資料貼近實際情境，易於整合測試。【F:openapi-specs/09-paths-incidents.yaml†L3-L199】【F:openapi-specs/09-paths-incidents.yaml†L220-L320】

## 問題與改進建議
| 嚴重度 | 檔案 | 問題描述 | 建議 |
| --- | --- | --- | --- |
| Critical | 03-schemas-core.yaml | `Dashboard` Schema 將 `owner` 標為必填唯讀欄位，但 `POST /dashboards` 實作建立的物件未填入該欄位，導致回傳資料缺失必填欄位。| 建議改為非必填或於建立流程中根據 `owner_id` 補齊 `owner` 值，以維持文件與回應一致性。【F:openapi-specs/03-schemas-core.yaml†L7-L43】【F:mock-server/handlers.ts†L507-L554】 |
| Critical | 03-schemas-core.yaml | `Resource` Schema 將 `tags` 定義為字典物件，但實際資料與批次更新流程皆使用 `{id,key,value}` 陣列，導致前端依照文件實作會失敗。| 將 Schema 改為陣列型別並提供元素結構，或更新實作以符合文件定義。【F:openapi-specs/03-schemas-core.yaml†L720-L819】【F:mock-server/db.ts†L2850-L2955】 |
| Critical | 03-schemas-core.yaml | 事件建立流程會將 `severity`/`impact` 轉為首字大寫字串（如 `Critical`），與文件列出的全小寫枚舉值不符，將造成客戶端驗證錯誤。| 調整實作改用小寫枚舉，或更新 Schema 枚舉值以符合實際回傳值。【F:openapi-specs/03-schemas-core.yaml†L270-L282】【F:mock-server/handlers.ts†L830-L876】 |
| Critical | （Silence Rules 路徑缺漏） | 實作提供完整的 `/silence-rules` CRUD 與批次操作端點，但文件中無對應路徑描述，造成主要功能未被記錄。| 新增 Silence Rules 路徑檔或在現有檔案補充相關端點，使文件涵蓋實際可用 API。【F:openapi-specs/00-main.yaml†L28-L41】【F:mock-server/handlers.ts†L1332-L1456】【412235†L1-L5】 |
| Warning | 09-paths-incidents.yaml | `POST /incidents/{id}/notify` 實作可手動觸發通知，但文件未載明該端點，影響使用者探索與整合。| 補充端點說明與成功回應 Schema，確保行為可被客戶端發現。【F:mock-server/handlers.ts†L878-L900】【F:openapi-specs/09-paths-incidents.yaml†L1-L199】 |

## 一致性檢查結果
- **命名規範**：大部分欄位維持 snake_case，但實作對 `owner`、`tags` 等唯讀欄位的填入策略需與文件同步調整，否則會出現必填缺失或型別差異。【F:openapi-specs/03-schemas-core.yaml†L7-L87】【F:mock-server/handlers.ts†L507-L554】
- **枚舉值**：除事件嚴重度/影響度大小寫不一致外，其餘枚舉與實作相符；建議優先校正事件枚舉以避免客戶端解析錯誤。【F:openapi-specs/03-schemas-core.yaml†L270-L282】【F:mock-server/handlers.ts†L830-L876】
- **型別定義**：多數欄位型別正確，但 `Resource.tags` 與部分批次操作回應結構需調整以符合實際陣列回傳格式。【F:openapi-specs/03-schemas-core.yaml†L720-L819】【F:mock-server/db.ts†L2850-L2955】

## 綜合建議與總體評估
整體文件架構完整、敘述詳盡，能有效支援大部分用例。但上述 Critical 問題將導致客戶端依文件實作時發生解析錯誤或遺漏重要端點，建議優先同步 Schema 與路徑定義與實際行為，並補齊缺少的 Silence Rules 與通知端點說明。待關鍵不一致修正後，即可達到可供外部整合使用的水準。
