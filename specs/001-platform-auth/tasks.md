# 任務：Platform Auth

**輸入**：來自 `/specs/001-platform-auth/` 的設計文件
**先決條件**：plan.md（必需）、spec.md（使用者故事必需）、research.md、data-model.md、contracts/

**測試**：下面的任務包含測試任務，因為功能規格中有明確的驗收情境和獨立測試標準。

**組織**：任務按使用者故事分組，以實現每個故事的獨立實作和測試。

## 格式：`[ID] [P?] [Story] 描述`
- **[P]**：可以並行運行（不同文件，無依賴項）
- **[Story]**：此任務屬於哪個使用者故事（例如，US1、US2、US3）
- 在描述中包含確切的檔案路徑

## 路徑慣例
- **前端 Web 應用**：`frontend/src/`（根據 plan.md 結構）
- 任務按功能模組組織

---

## 階段 1：設定（共享基礎設施）

**目的**：專案初始化和基本結構

- [X] T001 根據實作計劃創建前端專案結構
- [X] T002 使用 TypeScript 5.5, React 18 初始化前端專案
- [X] T003 [P] 配置 ESLint + Prettier 程式碼檢查和格式化工具
- [X] T004 [P] 安裝 Grafana UI / Scenes SDK, Axios, React Hook Form, Zod 依賴項
- [X] T005 設定 TypeScript 型別定義和路徑映射

---

## 階段 2：基礎（阻塞先決條件）

**目的**：在實作任何使用者故事之前必須完成的基礎設施

**⚠️ 關鍵**：在完成此階段之前無法開始任何使用者故事工作

- [X] T006 設定 PostgreSQL 資料庫連線和遷移腳本（前端專案跳過）
- [X] T007 [P] 實作身份驗證和權限檢查框架
- [X] T008 [P] 設定 API 路由和中介軟體結構（Axios 實例和攔截器）
- [X] T009 建立所有故事依賴的基礎型別定義（IdentityProvider, IdPConfiguration 等）
- [X] T010 配置錯誤處理和日誌基礎設施
- [X] T011 設定環境配置管理和敏感資訊處理
- [X] T012 實作基礎 UI 元件（Button, Input, Table 等 Grafana UI 包裝）

**檢查點**：基礎準備完成 - 現在可以並行開始使用者故事實作

---

## 階段 3：使用者故事 1 - 配置與管理多個身份提供商 (IdP) (優先級: P1) 🎯 MVP

**目標**：實作完整的 IdP 配置管理功能，包含新增、編輯、刪除、測試連線和故障轉移

**獨立測試**：可以通過新增、設定並啟用一個 OIDC IdP，並成功使用該 IdP 登入來獨立測試

### 使用者故事 1 的測試（可選 - 只有在請求測試時）⚠️

**注意：先編寫這些測試，確保在實作之前它們會 FAIL**

- [ ] T013 [P] [US1] tests/components/test_IdpList.test.tsx 中的 IdP 清單顯示測試
- [ ] T014 [P] [US1] tests/components/test_IdpForm.test.tsx 中的 IdP 配置表單測試
- [ ] T015 [P] [US1] tests/services/test_idpApi.test.ts 中的 IdP API 服務測試
- [ ] T016 [US1] tests/integration/test_idpManagement.test.tsx 中的完整 IdP 管理流程測試

### 使用者故事 1 的實作

- [X] T017 [P] [US1] 在 frontend/src/types/idp.ts 中建立 IdentityProvider 和 IdPConfiguration 型別定義
- [X] T018 [P] [US1] 在 frontend/src/services/api/idp.ts 中實作 IdP 管理 API 服務（CRUD 操作）
- [X] T019 [P] [US1] 在 frontend/src/services/api/connectionTest.ts 中實作連線測試 API 服務
- [X] T020 [US1] 在 frontend/src/components/auth/IdpList.tsx 中實作 IdP 清單元件（使用 Grafana Table）
- [X] T021 [US1] 在 frontend/src/components/auth/IdpForm.tsx 中實作 IdP 配置表單（動態欄位，React Hook Form + Zod）
- [X] T022 [US1] 在 frontend/src/pages/settings/auth/index.tsx 中實作身份驗證設定首頁
- [X] T023 [US1] 在 frontend/src/pages/settings/auth/create.tsx 中實作新增 IdP 頁面
- [X] T024 [US1] 在 frontend/src/pages/settings/auth/[id]/edit.tsx 中實作編輯 IdP 頁面
- [X] T025 [US1] 在 frontend/src/services/failover.ts 中實作 IdP 故障轉移邏輯
- [X] T026 [US1] 添加 IdP 操作的審計日誌記錄（IdPAuditLog）
- [X] T027 [US1] 實作 IdP 優先順序管理（priority_order 排序和主要/備用設定）

**檢查點**：此時，使用者故事 1 應完全功能且可獨立測試

---

## 階段 4：使用者故事 2 - 安全地查看與管理 IdP 的敏感憑證 (優先級: P2)

**目標**：實作敏感資訊的安全顯示和管理功能，包含遮蔽顯示、一鍵複製和權限控制

**獨立測試**：可以通過驗證 Client Secret 預設為遮蔽、點擊按鈕可顯示/隱藏、以及複製功能可正常運作來獨立測試

### 使用者故事 2 的測試（可選 - 只有在請求測試時）⚠️

**注意：先編寫這些測試，確保在實作之前它們會 FAIL**

- [ ] T028 [P] [US2] tests/components/test_SecretField.test.tsx 中的敏感欄位元件測試
- [ ] T029 [P] [US2] tests/utils/test_clipboard.test.ts 中的複製功能測試
- [ ] T030 [US2] tests/integration/test_secretManagement.test.tsx 中的敏感資訊管理流程測試

### 使用者故事 2 的實作

- [X] T031 [P] [US2] 在 frontend/src/components/auth/SecretField.tsx 中實作敏感資訊欄位元件（遮蔽/顯示切換）
- [X] T032 [P] [US2] 在 frontend/src/utils/clipboard.ts 中實作一鍵複製功能（支援 Client ID 和 Client Secret）
- [X] T033 [P] [US2] 在 frontend/src/hooks/usePermissions.ts 中實作權限檢查 hooks（settings:auth:secret:view, settings:auth:secret:copy）
- [X] T034 [US2] 在 frontend/src/services/api/secrets.ts 中實作敏感資訊管理 API 服務
- [X] T035 [US2] 整合 SecretField 元件到 IdpForm 中替換標準輸入欄位
- [ ] T036 [US2] 添加敏感操作的審計日誌記錄
- [ ] T037 [US2] 實作瀏覽器相容性檢查（clipboard API 支援檢測）
- [ ] T038 [US2] 在 backend/src/services/encryption.ts 中實作敏感資料加密服務（AES-256 加密/解密）
- [ ] T039 [US2] 在 backend/src/models/idpConfiguration.ts 中整合加密邏輯到 IdP 配置儲存
- [ ] T046 [US2] 在 backend/src/api/idp.ts 中更新配置 API 以處理加密敏感欄位
- [ ] T047 [US2] 添加加密金鑰管理（環境變數或 HashiCorp Vault 整合）
- [ ] T048 [US2] 實作加密資料的遷移腳本（處理現有未加密資料）

**檢查點**：此時，使用者故事 1 和 2 都應獨立工作

---

## 階段 5：使用者故事 3 - 查看 IdP 設定與處理錯誤 (優先級: P3)

**目標**：實作設定顯示、錯誤處理和狀態管理功能，提供完整的系統狀態可視性

**獨立測試**：可以通過驗證頁面能正確顯示已配置的 IdP 資訊，並在模擬 API 失敗時顯示錯誤訊息來獨立測試

### 使用者故事 3 的測試（可選 - 只有在請求測試時）⚠️

**注意：先編寫這些測試，確保在實作之前它們會 FAIL**

- [ ] T043 [P] [US3] tests/components/test_IdpStatus.test.tsx 中的 IdP 狀態顯示測試
- [ ] T044 [P] [US3] tests/components/test_ErrorDisplay.test.tsx 中的錯誤處理元件測試
- [ ] T049 [US3] tests/integration/test_settingsDisplay.test.tsx 中的設定頁面顯示測試

### 使用者故事 3 的實作

- [X] T050 [P] [US3] 在 frontend/src/components/auth/IdpStatus.tsx 中實作 IdP 狀態顯示元件
- [X] T051 [P] [US3] 在 frontend/src/components/common/ErrorDisplay.tsx 中實作通用錯誤顯示元件
- [X] T052 [P] [US3] 在 frontend/src/hooks/useSession.ts 中實作 Session 管理 hooks
- [X] T053 [US3] 在 frontend/src/pages/settings/auth/components/SettingsDisplay.tsx 中實作設定資訊唯讀顯示
- [X] T054 [US3] 整合錯誤處理到所有 IdP 操作（API 失敗、權限不足、Session 過期）
- [X] T055 [US3] 添加設定頁面的載入狀態和重試機制
- [X] T056 [US3] 實作未配置欄位的占位符顯示（"—"）

**檢查點**：所有使用者故事現在都應獨立功能

---

## 階段 6：完善與跨切面關注點

**目的**：影響多個使用者故事的改進和最終整合

- [X] T057 [P] docs/architecture.md 中的架構文件更新（IdP 整合說明）
- [X] T058 [P] frontend/README.md 中的專案文件更新
- [X] T059 程式碼清理和 TypeScript 嚴格模式啟用
- [X] T060 跨所有故事的效能優化（API 快取、元件懶載入）
- [ ] T061 [P] tests/e2e/ 中的端到端測試（完整使用者流程）
- [X] T062 安全性最終檢查（敏感資訊處理、權限控制）
- [X] T063 運行 quickstart.md 驗證所有功能
- [X] T064 設定監控和告警（IdP 狀態監控、錯誤追蹤）

---

## 依賴項與執行順序

### 階段依賴項

- **設定（階段 1）**：無依賴項 - 可以立即開始
- **基礎（階段 2）**：依賴設定完成 - 阻塞所有使用者故事
- **使用者故事（階段 3+）**：全部依賴基礎階段完成
  - 使用者故事然後可以並行進行（如果有人員）
  - 或按優先級順序順序進行（P1 → P2 → P3）
- **完善（最終階段）**：依賴所有所需使用者故事完成

### 使用者故事依賴項

- **使用者故事 1 (P1）**：可以在基礎（階段 2）之後開始 - 對其他故事無依賴項
- **使用者故事 2 (P2）**：可以在基礎（階段 2）之後開始 - 依賴 US1 的基礎架構但應獨立可測試
- **使用者故事 3 (P3）**：可以在基礎（階段 2）之後開始 - 依賴 US1 的基礎架構但應獨立可測試

### 每個使用者故事內部

- 如果包含測試，必須在實作之前編寫並 FAIL
- 型別定義在元件之前
- API 服務在元件之前
- 核心功能在整合之前
- 故事完成後再移到下一個優先級

### 並行機會

- 所有標記 [P] 的設定任務可以並行運行
- 所有標記 [P] 的基礎任務可以並行運行（在階段 2 內）
- 一旦基礎階段完成，所有使用者故事可以並行開始（如果團隊能力允許）
- 使用者故事的所有標記 [P] 的測試可以並行運行
- 故事內的元件標記 [P] 可以並行運行
- 不同使用者故事可以由不同團隊成員並行處理

---

## 並行範例：使用者故事 1

```bash
# 一起啟動使用者故事 1 的所有測試（如果請求測試）：
任務："tests/components/test_IdpList.test.tsx 中的 IdP 清單顯示測試"
任務："tests/components/test_IdpForm.test.tsx 中的 IdP 配置表單測試"
任務："tests/services/test_idpApi.test.ts 中的 IdP API 服務測試"
任務："tests/integration/test_idpManagement.test.tsx 中的完整 IdP 管理流程測試"

# 一起啟動使用者故事 1 的所有元件：
任務："在 frontend/src/types/idp.ts 中建立 IdentityProvider 和 IdPConfiguration 型別定義"
任務："在 frontend/src/services/api/idp.ts 中實作 IdP 管理 API 服務（CRUD 操作）"
任務："在 frontend/src/services/api/connectionTest.ts 中實作連線測試 API 服務"
任務："在 frontend/src/components/auth/IdpList.tsx 中實作 IdP 清單元件（使用 Grafana Table）"
任務："在 frontend/src/components/auth/IdpForm.tsx 中實作 IdP 配置表單（動態欄位，React Hook Form + Zod）"
```

---

## 實作策略

### 先 MVP（只有使用者故事 1）

1. 完成階段 1：設定
2. 完成階段 2：基礎（關鍵 - 阻塞所有故事）
3. 完成階段 3：使用者故事 1
4. **停止並驗證**：獨立測試使用者故事 1
5. 如果準備好就部署/展示

### 增量交付

1. 完成設定 + 基礎 → 基礎準備完成
2. 添加使用者故事 1 → 獨立測試 → 部署/展示（MVP！）
3. 添加使用者故事 2 → 獨立測試 → 部署/展示
4. 添加使用者故事 3 → 獨立測試 → 部署/展示
5. 每個故事都添加價值而不破壞之前的

### 並行團隊策略

有多個開發者時：

1. 團隊一起完成設定 + 基礎
2. 一旦基礎完成：
   - 開發者 A：使用者故事 1（核心 IdP 管理）
   - 開發者 B：使用者故事 2（安全功能）
   - 開發者 C：使用者故事 3（顯示和錯誤處理）
3. 故事獨立完成和整合

---

## 附註

- [P] 任務 = 不同文件，無依賴項
- [Story] 標籤將任務映射到特定使用者故事以便追溯
- 每個使用者故事應獨立可完成和測試
- 在實作之前驗證測試會失敗
- 在每個任務或邏輯組之後提交
- 在任何檢查點停止以獨立驗證故事
- 避免：模糊任務、相同文件衝突、破壞獨立性的跨故事依賴項
