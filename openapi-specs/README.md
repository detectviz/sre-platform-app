# OpenAPI 規範文件

本目錄包含 SRE Platform API 的 OpenAPI 3.0 規範，已拆分為多個檔案以便審查和維護。

## 📁 檔案結構

### 核心檔案

1. **00-main.yaml** - 主要資訊、伺服器、標籤定義
2. **01-common-parameters.yaml** - 通用參數（分頁、排序等）
3. **02-common-responses.yaml** - 通用回應和安全定義

### Schema 定義

4. **03-schemas-core.yaml** - 核心實體（Dashboard, Incident, AlertRule, Resource）
5. **04-schemas-automation.yaml** - 自動化相關（Playbook, Execution, Trigger）
6. **05-schemas-iam.yaml** - 身份管理（User, Team, Role）
7. **06-schemas-notifications.yaml** - 通知管理（Channel, Strategy, History）
8. **07-schemas-analysis.yaml** - 分析與 AI（Incident/Resource Analysis）

### API 路徑

9. **08-paths-dashboards.yaml** - 儀表板 API
10. **09-paths-incidents.yaml** - 事件管理 API
11. **10-paths-alert-rules.yaml** - 告警規則 API
12. **11-paths-resources.yaml** - 資源管理 API
13. **12-paths-automation.yaml** - 自動化 API
14. **13-paths-iam.yaml** - IAM API
15. **14-paths-notifications.yaml** - 通知 API
16. **15-paths-analysis.yaml** - 分析 API

## 📊 當前進度

| 類別 | 檔案數 | 狀態 |
|------|--------|------|
| 核心設定 | 3/3 | ✅ 完成 |
| Schema 定義 | 5/5 | ✅ 完成 |
| API 路徑 | 8/8 | ✅ 完成 |
| **總計** | **16/16** | **100%** |

## 🔄 合併指令

審查通過後，使用以下指令合併所有檔案：

```bash
# 方法 1: 使用 yq 工具合併（推薦）
yq eval-all '. as $item ireduce ({}; . * $item)' \
  00-main.yaml \
  01-common-parameters.yaml \
  02-common-responses.yaml \
  03-schemas-core.yaml \
  04-schemas-automation.yaml \
  05-schemas-iam.yaml \
  06-schemas-notifications.yaml \
  07-schemas-analysis.yaml \
  08-paths-dashboards.yaml \
  09-paths-incidents.yaml \
  10-paths-alert-rules.yaml \
  11-paths-resources.yaml \
  12-paths-automation.yaml \
  13-paths-iam.yaml \
  14-paths-notifications.yaml \
  15-paths-analysis.yaml \
  > ../openapi.yaml

# 方法 2: 手動合併
# 1. 複製 00-main.yaml 的內容作為基礎
# 2. 將其他檔案的 components 和 paths 區塊合併進去
# 3. 確保沒有重複的 key
```

## ✅ 審查檢查清單

### Schema 審查
- [ ] 所有必填欄位標記正確
- [ ] 枚舉值完整且正確
- [ ] 範例資料真實可用
- [ ] 欄位描述清晰
- [ ] 使用 snake_case 命名

### API 路徑審查
- [ ] 所有端點都有描述
- [ ] 參數定義完整
- [ ] 回應狀態碼正確
- [ ] 錯誤處理完善
- [ ] 範例請求/回應完整

### 整體審查
- [ ] 符合 OpenAPI 3.0 規範
- [ ] 與實際 handlers.ts 實現一致
- [ ] 文檔結構清晰
- [ ] 可以被 Swagger UI 正確渲染

## 🔗 相關工具

### 驗證工具
```bash
# 使用 openapi-generator 驗證
openapi-generator validate -i openapi.yaml

# 使用 swagger-cli 驗證
swagger-cli validate openapi.yaml
```

### 視覺化工具
```bash
# 使用 Swagger UI
npx swagger-ui-watcher openapi.yaml

# 使用 Redoc
npx redoc-cli serve openapi.yaml
```

## 📝 待完成項目

### 高優先級
1. ✅ ~~**完成剩餘 API 路徑定義**~~ (已完成)
   - ✅ Alert Rules API
   - ✅ Resources API
   - ✅ Automation API
   - ✅ IAM API
   - ✅ Notifications API
   - ✅ Analysis API

2. **審查與驗證**
   - 使用 OpenAPI 驗證工具檢查規範
   - 使用 Swagger UI 視覺化預覽
   - 確認所有端點與 handlers.ts 一致

3. **補充完整的範例**
   - 每個端點至少一個完整範例
   - 涵蓋成功和錯誤情境

4. **文檔完善**
   - 每個 schema 加入詳細描述
   - 補充使用說明和注意事項

### 中優先級
5. **生成客戶端 SDK**
   ```bash
   # TypeScript
   openapi-generator generate -i openapi.yaml -g typescript-axios -o sdk/typescript

   # Python
   openapi-generator generate -i openapi.yaml -g python -o sdk/python

   # Go
   openapi-generator generate -i openapi.yaml -g go -o sdk/go
   ```

6. **API 測試集成**
   - 基於 OpenAPI 自動生成 API 測試
   - 整合到 CI/CD 流程

## 📖 參考資料

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://github.com/Redocly/redoc)

---

**維護者**: Claude Code
**最後更新**: 2025-10-02
**狀態**: ✅ 完成 - 100%
