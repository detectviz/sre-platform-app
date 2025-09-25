# SRE 平台 API 整合狀態

**契約版本**: `openapi.yaml` v4.0.7

本文件追蹤 SRE 平台前端各頁面與後端 API 的整合進度。

## 整合狀態圖例

- ✅ **已完成**: 前端元件已完全對接 Mock Server API，並處理了載入與錯誤狀態。
- ❌ **未開始**: 前端元件仍在使用 `constants.ts` 中的靜態模擬數據。

---

## API 端點整合清單

| 模組 (Module) | 端點 (Endpoint) | 描述 (Description) | 前端頁面 (Frontend Page) | 狀態 (Status) |
| :--- | :--- | :--- | :--- | :--- |
| **個人設定** | `GET /me` | 取得個人資訊 | `PersonalInfoPage` | ✅ 已完成 |
| | `GET /me/login-history` | 取得登入歷史 | `SecuritySettingsPage` | ✅ 已完成 |
| | `GET /me/preferences` | 取得偏好設定 | `PreferenceSettingsPage` | ✅ 已完成 |
| | `PUT /me/preferences` | 更新偏好設定 | `PreferenceSettingsPage` | ✅ 已完成 |
| **儀表板** | `GET /dashboards` | 取得儀表板列表 | `DashboardListPage` | ✅ 已完成 |
| | `POST /dashboards` | 建立儀表板 | `AddDashboardModal` | ✅ 已完成 |
| | `GET /dashboards/{id}` | 取得儀表板詳情 | `DashboardViewPage` | ✅ 已完成 |
| | `PATCH /dashboards/{id}` | 更新儀表板設定 | `DashboardEditModal` | ✅ 已完成 |
| | `DELETE /dashboards/{id}` | 軟刪除儀表板 | `DashboardListPage` | ✅ 已完成 |
| | `POST /dashboards/batch-actions` | 批次刪除儀表板 | `DashboardListPage` | ✅ 已完成 |
| **事件管理** | `GET /events` | 取得事件列表 | `IncidentListPage` | ✅ 已完成 |
| | `GET /events/{id}` | 取得事件詳情 | `IncidentDetailPage` | ✅ 已完成 |
| | `POST /events/{id}/actions` | 對事件執行狀態操作 | `IncidentListPage` | ✅ 已完成 |
| **告警規則** | `GET /alert-rules` | 取得告警規則列表 | `AlertRulePage` | ✅ 已完成 |
| | `POST /alert-rules` | 建立告警規則 | `AlertRuleEditModal` | ✅ 已完成 |
| | `PATCH /alert-rules/{id}` | 更新告警規則 | `AlertRuleEditModal` | ✅ 已完成 |
| | `DELETE /alert-rules/{id}` | 刪除告警規則 | `AlertRulePage` | ✅ 已完成 |
| | `POST /alert-rules/batch-actions` | 批次操作告警規則 | `AlertRulePage` | ✅ 已完成 |
| **靜音規則** | `GET /silence-rules` | 取得靜音規則列表 | `SilenceRulePage` | ✅ 已完成 |
| | `POST /silence-rules` | 建立靜音規則 | `SilenceRuleEditModal` | ✅ 已完成 |
| | `PATCH /silence-rules/{id}` | 更新靜音規則 | `SilenceRuleEditModal` | ✅ 已完成 |
| | `DELETE /silence-rules/{id}` | 刪除靜音規則 | `SilenceRulePage` | ✅ 已完成 |
| | `POST /silence-rules/batch-actions` | 批次操作靜音規則 | `SilenceRulePage` | ✅ 已完成 |
| **資源管理** | `GET /resources` | 取得資源列表 | `ResourceListPage` | ✅ 已完成 |
| | `POST /resources` | 建立資源 | `ResourceEditModal` | ✅ 已完成 |
| | `PATCH /resources/{id}` | 更新資源資訊 | `ResourceEditModal` | ✅ 已完成 |
| | `DELETE /resources/{id}` | 軟刪除資源 | `ResourceListPage` | ✅ 已完成 |
| | `POST /resources/batch-actions` | 批次刪除資源 | `ResourceListPage` | ✅ 已完成 |
| | `GET /resource-groups` | 取得資源群組列表 | `ResourceGroupPage` | ✅ 已完成 |
| | `POST /resource-groups` | 建立資源群組 | `ResourceGroupEditModal` | ✅ 已完成 |
| | `PUT /resource-groups/{id}` | 更新資源群組 | `ResourceGroupEditModal` | ✅ 已完成 |
| | `DELETE /resource-groups/{id}` | 刪除資源群組 | `ResourceGroupPage` | ✅ 已完成 |
| **自動化** | `GET /automation/scripts` | 取得腳本列表 | `AutomationPlaybooksPage` | ✅ 已完成 |
| | `POST /automation/scripts` | 建立自動化腳本 | `AutomationPlaybookEditModal` | ✅ 已完成 |
| | `PATCH /automation/scripts/{id}` | 更新自動化腳本 | `AutomationPlaybookEditModal` | ✅ 已完成 |
| | `DELETE /automation/scripts/{id}` | 軟刪除自動化腳本 | `AutomationPlaybooksPage` | ✅ 已完成 |
| | `POST /automation/scripts/{id}/execute` | 執行自動化腳本 | `RunPlaybookModal` | ✅ 已完成 |
| | `GET /automation/triggers` | 取得觸發器列表 | `AutomationTriggersPage` | ✅ 已完成 |
| | `POST /automation/triggers` | 建立觸發器 | `AutomationTriggerEditModal` | ✅ 已完成 |
| | `PATCH /automation/triggers/{id}` | 更新觸發器 | `AutomationTriggerEditModal` | ✅ 已完成 |
| | `DELETE /automation/triggers/{id}` | 刪除觸發器 | `AutomationTriggersPage` | ✅ 已完成 |
| | `GET /automation/executions` | 取得執行歷史列表 | `AutomationHistoryPage` | ✅ 已完成 |
| | `POST /automation/executions/{id}/retry` | 重試執行 | `AutomationHistoryPage` | ✅ 已完成 |
| **IAM** | `GET /iam/users` | 取得人員列表 | `PersonnelManagementPage` | ✅ 已完成 |
| | `POST /iam/users` | 邀請新人員 | `InviteUserModal` | ✅ 已完成 |
| | `PATCH /iam/users/{id}` | 更新人員資訊 | `UserEditModal` | ✅ 已完成 |
| | `DELETE /iam/users/{id}` | 刪除人員帳號 | `PersonnelManagementPage` | ✅ 已完成 |
| | `POST /iam/users/batch-actions` | 批次操作人員 | `PersonnelManagementPage` | ✅ 已完成 |
| | `GET /iam/teams` | 取得團隊列表 | `TeamManagementPage` | ✅ 已完成 |
| | `POST /iam/teams` | 建立團隊 | `TeamEditModal` | ✅ 已完成 |
| | `PATCH /iam/teams/{id}` | 更新團隊 | `TeamEditModal` | ✅ 已完成 |
| | `DELETE /iam/teams/{id}` | 刪除團隊 | `TeamManagementPage` | ✅ 已完成 |
| | `GET /iam/roles` | 取得角色列表 | `RoleManagementPage` | ✅ 已完成 |
| | `POST /iam/roles` | 建立角色 | `RoleEditModal` | ✅ 已完成 |
| | `PATCH /iam/roles/{id}` | 更新角色 | `RoleEditModal` | ✅ 已完成 |
| | `DELETE /iam/roles/{id}` | 刪除角色 | `RoleManagementPage` | ✅ 已完成 |
| **通知管理**| `GET /settings/notification-strategies` | 取得通知策略 | `NotificationStrategyPage` | ✅ 已完成 |
| | `POST /settings/notification-strategies`| 建立通知策略 | `NotificationStrategyEditModal`| ✅ 已完成 |
| | `PATCH /settings/notification-strategies/{id}`| 更新通知策略 | `NotificationStrategyEditModal`| ✅ 已完成 |
| | `DELETE /settings/notification-strategies/{id}`| 刪除通知策略 | `NotificationStrategyPage`| ✅ 已完成 |
| | `GET /settings/notification-channels`| 取得通知管道 | `NotificationChannelPage` | ✅ 已完成 |
| | `POST /settings/notification-channels`| 建立通知管道 | `NotificationChannelEditModal`| ✅ 已完成 |
| | `PATCH /settings/notification-channels/{id}`| 更新通知管道 | `NotificationChannelEditModal`| ✅ 已完成 |
| | `DELETE /settings/notification-channels/{id}`| 刪除通知管道 | `NotificationChannelPage`| ✅ 已完成 |
| | `POST /settings/notification-channels/{id}/test`| 測試通知管道 | `NotificationChannelPage`| ✅ 已完成 |
| | `GET /settings/notification-history`| 取得通知歷史 | `NotificationHistoryPage`| ✅ 已完成 |
| | `POST /settings/notification-history/{id}/resend`| 重送通知 | `NotificationHistoryPage`| ✅ 已完成 |
| **平台設定** | `GET /settings/tags` | 取得標籤定義 | `TagManagementPage` | ✅ 已完成 |
| | `POST /settings/tags` | 建立標籤定義 | `TagDefinitionEditModal` | ✅ 已完成 |
| | `PATCH /settings/tags/{id}` | 更新標籤定義 | `TagDefinitionEditModal` | ✅ 已完成 |
| | `DELETE /settings/tags/{id}` | 刪除標籤定義 | `TagManagementPage` | ✅ 已完成 |
| | `PUT /settings/tags/{id}/values` | 更新標籤允許值 | `TagValuesManageModal` | ✅ 已完成 |
| | `GET /settings/mail` | 取得郵件設定 | `MailSettingsPage` | ✅ 已完成 |
| | `PUT /settings/mail` | 更新郵件設定 | `MailSettingsPage` | ✅ 已完成 |
| | `POST /settings/mail/test` | 測試郵件設定 | `MailSettingsPage` | ✅ 已完成 |
| | `GET /settings/auth` | 取得身份驗證設定 | `AuthSettingsPage` | ✅ 已完成 |
| **分析中心** | `GET /logs` | 取得日誌數據 | `LogExplorerPage` | ✅ 已完成 |
| | `GET /traces` | 取得追蹤列表 | `TraceAnalysisPage` | ✅ 已完成 |
| | `GET /traces/{id}` | 取得追蹤詳情 | `TraceAnalysisPage` | ✅ 已完成 |