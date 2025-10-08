# Scene RBAC Specification（Scenes 架構權限控制規範）

**模組名稱 (Module)**: Scene RBAC Specification  
**來源 (Source)**: `SceneAppProvider`, `ScenePermissionGuard`, `SceneContext.permissions`, `SceneVariableSet`  
**建立日期 (Created)**: 2025-10-09  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、設計原則（Principles）

- 權限是 Scene 狀態的一部分，於初始化階段由 `SceneAppProvider` 透過 `/api/v1/me/permissions` 取得。  
- 權限格式採統一字串結構：`resource:action`（例如 `incidents:update`）。  
- 所有頁面、控制列與互動行為皆應以 `visibleWhen` 或 `enabledWhen` 條件綁定權限。  
- 權限控制屬於顯示層與互動層保護，後端仍需強制驗證所有 API 請求。  

---

## 二、資料流（Permission Data Flow）

1. **初始化階段**  
   - `SceneAppProvider` 呼叫 `/api/v1/me/permissions`。  
   - 將回傳結果存入 `SceneContext.permissions`。  

2. **使用階段**  
   - `ScenePermissionGuard` 根據 `SceneContext.permissions` 決定 SubScene、控制元件或行為是否可見。  
   - `SceneVariableSet` 可動態調整權限相關狀態（如可操作項目數量）。  

3. **更新階段**  
   - 權限狀態更新後，Scene 將重新渲染。  
   - 權限拒絕事件會由 `SceneEventBus` 廣播，並記錄於 Telemetry。  

---

## 三、權限定義（Permissions Schema）

權限字串結構：
```
<resource>:<action>
```
範例：
- `incidents:read`
- `alert-rules:update`
- `resources:delete`
- `automation:playbooks:execute`

**命名規則**
- 第一段（resource）對應模組。
- 第二段（action）對應操作類型：`read`、`create`、`update`、`delete`、`execute`、`config`、`analyze` 等。

---

## 四、使用方式（Usage Examples）

### 1. 在 Scene 定義中綁定權限
```yaml
scene:
  id: resource-list
  permission: resources:read
  controls:
    - type: button
      text: 匯出
      visibleWhen: hasPermission("resources:export")
```

### 2. 在 Scene Panel 內使用權限控制
```yaml
panel:
  id: edit-rule
  permission: alert-rules:update
  fields:
    - name: rule_name
      type: input
      enabledWhen: hasPermission("alert-rules:update")
```

---

## 五、前後端職責劃分（Responsibilities）

| 層級 | 職責 |
|------|------|
| **前端 (Scenes)** | 控制元件顯示與可用狀態，防止使用者誤操作。 |
| **後端 API** | 強制權限驗證，過濾不可見資料。 |
| **前後端協同** | 權限拒絕事件需記錄於審計與 Telemetry。 |

---

## 六、觀測性與治理（Observability & Governance）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging/Tracing | ✅ | 權限載入與拒絕事件需記錄於 `SceneEventBus`。 |
| Metrics & Alerts | ✅ | 權限拒絕率、初始化延遲需上報 Telemetry。 |
| RBAC 同步狀態 | ✅ | SceneContext 必須反映後端權限更新結果。 |
| i18n | ✅ | 所有權限錯誤訊息需支持多語。 |

---

## 七、模糊與待確認事項（Clarifications）

- 權限快取時效是否應統一（建議 10 分鐘）。  
- 是否需支援多角色合併權限（Union 模式）。  
- 是否需在 UI 提供權限檢視器（Permission Inspector）。  

---

## 八、結語（Conclusion）

本文件定義了 Grafana Scenes 架構下的統一權限控制模型。  
所有模組必須透過 `SceneAppProvider` 載入權限並使用 `ScenePermissionGuard` 控制顯示與互動，  
確保平台操作一致、安全且具觀測性。