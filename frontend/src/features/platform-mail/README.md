# 郵件通知管理

- **Spec**: `specs/004-platform-mail`
- **Responsibility**: 整合郵件供應商並監控通知健康
- **Architecture reference**: `grafana/public/app/features/alerting/notifications`

## Data Closed-Loop

1. **Input**: 前端透過表單與設定面板輸入，或由 API 回傳原始資料。
2. **Processing**: `apiClient` 將請求送往 `/api/v1/platform-mail`，回應透過模組內的 hooks 與表格元件進行呈現。
3. **Output**: Page 與元件發送通知、指標紀錄與 audit log，更新使用者或系統狀態。
4. **Feedback & Audit**: `auditService` 與 `metricsService` 於動作觸發時記錄審計與指標，配合 `notifyService` 通知使用者。

## State Diagram (Conceptual)

```mermaid
stateDiagram-v2
  [*] --> Viewing
  Viewing --> Editing : action_click
  Editing --> Saving : submit
  Saving --> Viewing : success
  Saving --> Error : failure
  Error --> Viewing : acknowledge
```
