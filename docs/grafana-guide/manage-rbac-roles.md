# 管理 RBAC 角色

本節包含如何查看與角色關聯的權限、建立自訂角色，以及更新和刪除角色的說明。

以下範例包含 base64 使用者名稱:密碼的基本授權。您無法在請求中使用授權權杖。

## 列出與角色關聯的權限

使用 `GET` 命令查看與角色關聯的動作和範圍。如需詳細了解如何查看每個角色的權限清單，請參考[取得角色](ref:api-rbac-get-a-role)。

若要查看與基本角色關聯的權限，請參考以下基本角色 UID：

| 基本角色       | UID                   |
| -------------- | --------------------- |
| `None`         | `basic_none`          |
| `Viewer`       | `basic_viewer`        |
| `Editor`       | `basic_editor`        |
| `Admin`        | `basic_admin`         |
| `Grafana Admin`| `basic_grafana_admin` |

**範例請求**

```
curl --location --request GET '<grafana_url>/api/access-control/roles/qQui_LCMk' --header 'Authorization: Basic YWRtaW46cGFzc3dvcmQ='
```

**範例響應**

```
{
    "version": 2,
    "uid": "qQui_LCMk",
    "name": "fixed:users:writer",
    "displayName": "User writer",
    "description": "Read and update all attributes and settings for all users in Grafana: update user information, read user information, create or enable or disable a user, make a user a Grafana administrator, sign out a user, update a user's authentication token, or update quotas for all users.",
    "global": true,
    "permissions": [
        {
            "action": "org.users:add",
            "scope": "users:*",
            "updated": "2021-05-17T20:49:18+02:00",
            "created": "2021-05-17T20:49:18+02:00"
        },
        {
            "action": "org.users:read",
            "scope": "users:*",
            "updated": "2021-05-17T20:49:18+02:00",
            "created": "2021-05-17T20:49:18+02:00"
        },
        {
            "action": "org.users:remove",
            "scope": "users:*",
            "updated": "2021-05-17T20:49:18+02:00",
            "created": "2021-05-17T20:49:18+02:00"
        },
        {
            "action": "org.users:write",
            "scope": "users:*",
            "updated": "2021-05-17T20:49:18+02:00",
            "created": "2021-05-17T20:49:18+02:00"
        }
    ],
    "updated": "2021-05-17T20:49:18+02:00",
    "created": "2021-05-13T16:24:26+02:00"
}
```

如需詳細資訊，請參考 [RBAC HTTP API](ref:api-rbac-get-a-role)。

## 建立自訂角色

本節說明如何使用 Grafana 佈建和 HTTP API 建立自訂 RBAC 角色。

當基本角色和固定角色無法滿足您的權限需求時，請建立自訂角色。

**開始之前：**

- [規劃您的 RBAC 推出策略](ref:plan-rbac-rollout-strategy)。
- 決定要新增至自訂角色的權限。若要查看動作和範圍清單，請參考 [RBAC 權限、動作和範圍](ref:custom-role-actions-scopes)。
- [啟用角色佈建](ref:rbac-grafana-provisioning)。
- 確保您有權限建立自訂角色。
  - 預設情況下，Grafana Admin 角色有權限建立自訂角色。
  - Grafana Admin 可以透過建立具有相關權限的自訂角色並新增 `permissions:type:delegate` 範圍，將自訂角色權限委派給其他使用者。

### 使用佈建建立自訂角色

[檔案型佈建](ref:rbac-grafana-provisioning) 是您可以用來建立自訂角色的方法之一。

1. 開啟 YAML 設定檔案並找到 `roles` 區段。

1. 請參考下表新增屬性和值。

| 屬性         | 描述                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | 協助管理員了解角色用途的人性化識別碼。`name` 為必填，且長度不得超過 190 個字元。我們建議使用 ASCII 字元。角色名稱在組織內必須是唯一的。                                                                                                                                                                                                                                      |
| `uid`        | 與角色關聯的唯一識別碼。UID 讓您能夠變更或刪除角色。您可以自行產生 UID，或讓 Grafana 為您產生。同一個 Grafana 實例內無法使用相同的 UID。                                                                                                                                                                                                                                           |
| `orgId`      | 識別角色所屬的組織。若未指定 `orgId`，則使用[預設組織 ID](/docs/grafana/<GRAFANA_VERSION>/setup-grafana/configure-grafana/#auto_assign_org_id)。                                                                                                                                                                                                              |
| `global`     | 全域角色不與任何特定組織關聯，這表示您可以在所有組織間重複使用它們。此設定會覆寫 `orgId`。                                                                                                                                                                                                                                                        |
| `displayName`| 在 UI 中顯示的人性化文字。角色顯示名稱長度不得超過 190 個 ASCII 字元。對於固定角色，顯示名稱會按照指定顯示。若未設定顯示名稱，顯示名稱會將 `:` (冒號) 替換為 ` ` (空格)。                                                                                                                                       |
| `description`| 描述角色提供權限的人性化文字。                                                                                                                                                                                                                                                                                                                                                  |
| `group`      | 在角色挑選器中組織角色。                                                                                                                                                                                                                                                                                                                                                                                  |
| `version`    | 定義角色目前版本的正整數，可防止覆寫較新的變更。                                                                                                                                                                                                                                                                                                           |
| `hidden`     | 隱藏角色不會出現在角色挑選器中。                                                                                                                                                                                                                                                                                                                                                                       |
| `state`      | 角色的狀態。預設為 `present`，但若設定為 `absent` 則會移除角色。                                                                                                                                                                                                                                                                                                                           |
| `force`      | 可用於搭配 `absent` 狀態，強制移除角色及其所有指派。                                                                                                                                                                                                                                                                                                                   |
| `from`       | 您想要複製權限的角色選用清單。                                                                                                                                                                                                                                                                                                                                                   |
| `permissions`| 提供使用者存取 Grafana 資源的權限。如需權限清單，請參考 [RBAC 權限動作和範圍](ref:rbac-role-definitions)。若您不知道要指派哪些權限，您可以建立不含任何權限的角色作為佔位符。使用 `from` 屬性，您可以透過在權限清單中新增 `state` 來指定要新增的額外權限或要移除的權限。 |

1. 重新載入佈建設定檔案。

   如需詳細了解在執行時期重新載入佈建設定，請參考[重新載入佈建設定](/docs/grafana/<GRAFANA_VERSION>/developers/http_api/admin/#reload-provisioning-configurations)。

以下範例建立一個本地角色：

```yaml
# config file version
apiVersion: 2

roles:
  - name: custom:users:writer
    description: 'List, create, or update other users.'
    version: 1
    orgId: 1
    permissions:
      - action: 'users:read'
        scope: 'global.users:*'
      - action: 'users:write'
        scope: 'global.users:*'
      - action: 'users:create'
```

以下範例建立一個隱藏的全域角色。`global: true` 選項建立全域角色，而 `hidden: true` 選項從角色挑選器中隱藏角色。

```yaml
# config file version
apiVersion: 2

roles:
  - name: custom:users:writer
    description: 'List, create, or update other users.'
    version: 1
    global: true
    hidden: true
    permissions:
      - action: 'users:read'
        scope: 'global.users:*'
      - action: 'users:write'
        scope: 'global.users:*'
      - action: 'users:create'
```
