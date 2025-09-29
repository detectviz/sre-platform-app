## 流程

## 1.	mock-server 階段
- mock-server/server.js 提供 Express Mock API
- mock-server/db.ts 集中管理 mock 資料結構與選項
- 目標：前端能在沒有真實後端的情況下快速開發、驗證 UI 與交互流程

## 2.	契約導出階段
- 前端與 mock-server 驗證過流程 → 確認 API 欄位、格式
- 從 mock-server 導出 openapi.yaml（API 合約）與 db_schema.sql（資料庫結構）

## 3.	後端實作階段
- 依照 openapi.yaml 和 db_schema.sql 開始撰寫後端服務
- mock-server 在此階段仍作為對照測試資料源存在

## 4.	移除 mock-server
- 後端 API 功能覆蓋率完整
- 前端改為串接真實後端
- mock-server 功能下線

這種方式能確保：
- 前端開發與設計驗證不被後端進度卡住
- API 契約由實際 UI 需求推導，不會脫節
- 後端實作時有完整的 openapi.yaml 與 db_schema.sql 可遵循
