# 規劃您的 RBAC 推出策略

RBAC 推出策略可協助您在將 RBAC 角色指派給使用者和團隊之前，決定_如何_實作 RBAC。

您的推出策略應協助您回答以下問題：

- 我應該將基本角色指派給使用者，還是應該將固定角色或自訂角色指派給使用者？
- 我什麼時候應該建立自訂角色？
- 我應該將固定角色和自訂角色套用至哪些實體？我應該將它們套用至使用者、團隊？還是應該修改基本角色的權限？
- 我如何以易於管理的方式推出權限？
- 在指派角色時，我應該使用哪種方法？我應該使用 Grafana UI、佈建還是 API？

## 審查基本角色和固定角色定義

在決定權限推出策略的第一步，我們建議您熟悉基本角色和固定角色定義。除了將固定角色指派給任何使用者和團隊之外，您也可以修改基本角色的權限，這會改變 Viewer、Editor 或 Admin 可以做什麼。此靈活性意味著您需要考慮許多角色指派組合。如果您有大量 Grafana 使用者和團隊，我們建議您列出您可能想要使用的固定角色。請記住，`No Basic Role` 是沒有權限的角色，無法被修改或更新。

## 使用者和團隊考量

RBAC 是一個靈活且強大的功能，具有許多可能的權限指派組合。在將權限指派給使用者和團隊時，請考慮以下指南。

- **將角色指派給使用者** 當您有一個一次性情境，其中少數使用者需要存取資源，或當您想要指派臨時存取權時。如果您有大量使用者，此方法在擴展 Grafana 使用時可能難以管理。例如，您的 IT 部門成員可能需要 `fixed:licensing:reader` 和 `fixed:licensing:writer` 角色，以便管理您的 Grafana Enterprise 授權。

- **將角色指派給團隊** 當您有一組與您的組織結構一致的使用者，並且您希望團隊的所有成員都擁有相同程度的存取權時。例如，特定工程團隊的所有成員可能需要 `fixed:reports:reader` 和 `fixed:reports:writer` 角色來管理報告。

  當您將額外的使用者指派給團隊時，系統會自動將權限指派給這些使用者。

### 認證提供者考量

您可以利用目前的認證提供者來管理 Grafana 中的使用者和團隊權限。當您將使用者和團隊對應至 SAML 和 LDAP 群組時，您可以將這些指派與 Grafana 同步。

例如：

1. 將 SAML、LDAP 或 Oauth 角色對應至 Grafana 基本角色 (viewer、editor 或 admin)。

2. 使用 Grafana Enterprise 團隊同步功能，從您的 SAML、LDAP 或 Oauth 提供者同步團隊至 Grafana。如需詳細了解團隊同步，請參考[團隊同步](/docs/grafana/<GRAFANA_VERSION>/setup-grafana/configure-security/configure-team-sync/)。

3. 在 Grafana 內，將 RBAC 權限指派給使用者和團隊。

## 何時修改基本角色或建立自訂角色

在決定是否應該修改基本角色或建立自訂角色時，請考慮以下指南。

- **修改基本角色** 當 Grafana 對於 viewers、editors 和 admins 可以做什麼的定義不符合您對這些角色的定義時。您可以從任何基本角色新增或移除權限。

  {{< admonition type="note" >}}
  您對基本角色所做的變更會影響 Grafana 實例中所有[組織](/docs/grafana/<GRAFANA_VERSION>/administration/organization-management/)的角色定義。例如，當您將 `fixed:users:writer` 角色的權限新增至 viewer 基本角色時，Grafana 實例中任何組織的所有 viewers 都可以在該組織內建立使用者。
  {{< /admonition >}}

  {{< admonition type="note" >}}
  您無法修改 `No Basic Role` 權限。
  {{< /admonition >}}

- **建立自訂角色** 當固定角色定義不符合您的權限需求時。例如，`fixed:dashboards:writer` 角色允許使用者刪除儀表板。如果您希望某些使用者和團隊能夠建立和更新但不能刪除儀表板，您可以建立一個名為 `custom:dashboards:creator` 的自訂角色，它缺少 `dashboards:delete` 權限。

## 如何指派 RBAC 角色

使用以下任一種方法將 RBAC 角色指派給使用者和團隊。

- **Grafana UI：** 當您想要將有限數量的 RBAC 角色指派給使用者和團隊時，請使用 Grafana UI。UI 包含一個角色挑選器，您可以用來選取角色。
- **Grafana HTTP API：** 如果您想要自動化角色指派，請使用 Grafana HTTP API。
- **Terraform：** 如果您使用 Terraform 進行佈建，請使用 Terraform 來指派和管理使用者和團隊的角色指派。
- **Grafana 佈建：** Grafana 佈建提供了指派、移除和刪除角色的強大方法。在單一 YAML 檔案中，您可以包含多個角色指派和移除項目。

## 權限情景

我們根據目前的 Grafana 實作編譯了以下權限推出情景。

{{< admonition type="note" >}}
如果您有想要分享的使用案例，請隨時為此文件頁面做出貢獻。我們很樂於聽到您的意見！
{{< /admonition >}}

### 提供內部 viewer 員工使用 Explore 的能力，但防止外部 viewer 承包商使用 Explore

1. 在 Grafana 中，建立一個名為 `Internal employees` 的團隊。
1. 將 `fixed:datasources:explorer` 角色指派給 `Internal employees` 團隊。
1. 將內部員工新增至 `Internal employees` 團隊，或使用[團隊同步](/docs/grafana/<GRAFANA_VERSION>/setup-grafana/configure-security/configure-team-sync/)從 SAML、LDAP 或 Oauth 團隊對應他們。
1. 將 viewer 角色指派給內部員工和承包商。

### 限制 viewer、editor 或 admin 權限

1. 審查與基本角色相關聯的權限清單。
1. [變更基本角色的權限](ref:manage-rbac-roles-update-basic-role-permissions)。

### 僅允許一個團隊的成員管理警示

1. 建立一個 `Alert Managers` 團隊，並將所有適用的 Alerting 固定角色指派給該團隊。
1. 將使用者新增至 `Alert Managers` 團隊。
1. 從 Viewer、Editor 和 Admin 基本角色中移除所有以 `alert.` 為前綴的動作權限。

### 為兩個或多個地理位置的使用者提供儀表板

1. 為每個地理位置建立一個資料夾，例如，建立一個 `US` 資料夾和一個 `EU` 資料夾。
1. 將儀表板新增至每個資料夾。
1. 使用資料夾權限將美國使用者新增為 `US` 資料夾的編輯者，並將歐洲使用者指派為 `EU` 資料夾的編輯者。

### 指派給使用者特定的角色集合

1. 建立一個在組織角色下選取 `No Basic Role` 的使用者。
1. 將符合您需求的固定角色集合指派給該使用者。

### 建立自訂角色來存取特定資料夾中的警示

若要在 Grafana 中查看警示規則，使用者必須擁有讀取儲存警示規則的資料夾權限、讀取資料夾中警示的權限，以及查詢規則使用的所有資料來源的權限。

此範例中的 API 命令基於以下條件：

- 一個 ID 為 `92` 的 `Test-Folder`
- 兩個資料來源：UID 為 `_oAfGYUnk` 的 `DS1`，以及 UID 為 `YYcBGYUnk` 的 `DS2`
- 一個儲存在 `Test-Folder` 中並查詢這兩個資料來源的警示規則。

以下請求建立一個包含存取警示規則權限的自訂角色：

```
curl --location --request POST '<grafana_url>/api/access-control/roles/' \
--header 'Authorization: Bearer glsa_kcVxDhZtu5ISOZIEt' \
--header 'Content-Type: application/json' \
--data-raw '{
    "version": 1,
    "name": "custom:alerts.reader.in.folder.123",
    "displayName": "Read-only access to alerts in folder Test-Folder",
    "description": "Let user query DS1 and DS2, and read alerts in folder Test-Folders",
    "group":"Custom",
    "global": false,
    "permissions": [
        {
            "action": "folders:read",
            "scope": "folders:uid:YEcBGYU22"
        },
        {
            "action": "alert.rules:read",
            "scope": "folders:uid:YEcBGYU22"
        },
        {
            "action": "datasources:query",
            "scope": "datasources:uid:_oAfGYUnk"
        },
        {
            "action": "datasources:query",
            "scope": "datasources:uid:YYcBGYUnk"
        }
    ]
}'
```

### 啟用編輯者建立自訂角色

預設情況下，只有 Grafana Server Admin 可以建立和管理自訂角色。如果您希望您的 `Editors` 也能執行相同操作，請[更新 `Editor` 基本角色權限](ref:manage-rbac-roles-update-basic-role-permissions)。有兩種方法可以實現這一點：

- 使用佈建或 [RBAC HTTP API](ref:api-rbac-update-a-role) 將以下權限新增至 `basic:editor` 角色：

  | action         | scope                       |
  | -------------- | --------------------------- |
  | `roles:read`   | `roles:*`                   |
  | `roles:write`  | `permissions:type:delegate` |
  | `roles:delete` | `permissions:type:delegate` |

  例如，以下是一個小型 bash 腳本，用來擷取角色、使用 `jq` 修改它並更新它：

  ```bash
  # Fetch the role, modify it to add the desired permissions and increment its version
  curl -H 'Authorization: Bearer glsa_kcVxDhZtu5ISOZIEt' \
    -X GET '<grafana_url>/api/access-control/roles/basic_editor' | \
    jq 'del(.created)| del(.updated) | del(.permissions[].created) | del(.permissions[].updated) | .version += 1' | \
    jq '.permissions += [{"action": "roles:read", "scope": "roles:*"}, {"action": "roles:write", "scope": "permissions:type:delegate"}, {"action": "roles:delete", "scope": "permissions:type:delegate"}]' > /tmp/basic_editor.json

  # Update the role
  curl -H 'Authorization: Bearer glsa_kcVxDhZtu5ISOZIEt' -H 'Content-Type: application/json' \
    -X PUT-d @/tmp/basic_editor.json '<grafana_url>/api/access-control/roles/basic_editor'
  ```

- Or add the `fixed:roles:writer` role permissions to the `basic:editor` role using the `role > from` list of your provisioning file:

  ```yaml
  apiVersion: 2

  roles:
    - name: 'basic:editor'
      global: true
      version: 3
      from:
        - name: 'basic:editor'
          global: true
        - name: 'fixed:roles:writer'
          global: true
  ```

> **Note:** 任何有能力修改角色的使用者或服務帳戶只能建立、更新或刪除他們已被授予權限的角色。例如，具有 `Editor` 角色的使用者只能使用他們擁有權限或其子集來建立和管理角色。

### 啟用 viewers 建立報告

如果您希望您的 `Viewers` 能夠建立報告，請[更新 `Viewer` 基本角色權限](ref:manage-rbac-roles-update-basic-role-permissions)。有兩種方法可以實現這一點：

- 使用佈建或 [RBAC HTTP API](ref:api-rbac-update-a-role) 將以下權限新增至 `basic:viewer` 角色：

  | Action           | Scope                           |
  | ---------------- | ------------------------------- |
  | `reports:create` | n/a                             |
  | `reports:write`  | `reports:*` <br> `reports:id:*` |
  | `reports:read`   | `reports:*`                     |
  | `reports:send`   | `reports:*`                     |

  例如，以下是一個小型 bash 腳本，用來擷取角色、使用 `jq` 修改它並更新它：

  ```bash
  # Fetch the role, modify it to add the desired permissions and increment its version
  curl -H 'Authorization: Bearer glsa_kcVxDhZtu5ISOZIEt' \
    -X GET '<grafana_url>/api/access-control/roles/basic_viewer' | \
    jq 'del(.created)| del(.updated) | del(.permissions[].created) | del(.permissions[].updated) | .version += 1' | \
    jq '.permissions += [{"action": "reports:create"}, {"action": "reports:read", "scope": "reports:*"}, {"action": "reports:write", "scope": "reports:*"}, {"action": "reports:send", "scope": "reports:*"}]' > /tmp/basic_viewer.json

  # Update the role
  curl -H 'Authorization: Bearer glsa_kcVxDhZtu5ISOZIEt' -H 'Content-Type: application/json' \
    -X PUT-d @/tmp/basic_viewer.json '<grafana_url>/api/access-control/roles/basic_viewer'
  ```

- 或者使用佈建檔案的 `role > from` 清單，將 `fixed:reports:writer` 角色權限新增至 `basic:viewer` 角色：

  ```yaml
  apiVersion: 2

  roles:
    - name: 'basic:viewer'
      global: true
      version: 3
      from:
        - name: 'basic:viewer'
          global: true
        - name: 'fixed:reports:writer'
          global: true
  ```
