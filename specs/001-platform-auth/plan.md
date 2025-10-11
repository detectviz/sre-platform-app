# 實作計劃：Platform Auth

**日期**：2025-10-11 | **規格**：[@specs/001-platform-auth/spec.md](../specs/001-platform-auth/spec.md)
**輸入**：來自 `/specs/001-platform-auth/spec.md` 的功能規格

**注意**：此模板由 `/speckit.plan` 命令填寫。請參閱 `.specify/templates/commands/plan.md` 以了解執行工作流程。

## 摘要

建立完整的身份驗證與授權管理平台，支援多個外部身份提供商（IdP）的 OIDC/SSO 連線設定。核心需求為企業級多租戶場景下的身份認證管理，包含高可用性容錯機制、敏感資訊保護、以及完整的審計追蹤。

技術方法採用前端 React + TypeScript 實作，與 Keycloak 等 IdP 整合，支援 10+ 個 IdP 並發處理 1000+ 認證請求/分鐘，確保 5 秒內的故障轉移和高可用性。

## 技術背景

**語言/版本**: TypeScript 5.5, React 18
**主要依賴項**: Grafana UI / Scenes SDK, Axios, React Hook Form, Zod (驗證)
**儲存**: PostgreSQL (IdP 配置與審計日誌), Redis (會話快取與容錯狀態)
**測試**: Jest + React Testing Library (單元測試), Playwright (E2E 測試)
**目標平台**: Web 瀏覽器 (Chrome/Edge/Safari/Firefox)
**專案類型**: 前端 Web 應用
**效能目標**: IdP 切換 <5秒，支援 10個 IdP 配置，同時處理 1000個認證請求/分鐘
**約束**: 符合 GDPR 和 ISO 27001，支援加密傳輸，防範進階威脅
**規模/範圍**: 企業級認證管理，支援多租戶，預計服務 1000+ 並發用戶

## 憲法檢查

*門檻：必須在階段 0 研究之前通過。在階段 1 設計之後重新檢查。*

| 憲法要求 | 狀態 | 說明 |
|----------|------|------|
| **觀測性** | ✅ PASS | 規格包含審計日誌、監控儀表板、錯誤記錄等完整觀測性要求 |
| **安全性** | ✅ PASS | 定義完整 RBAC 權限控制、敏感資料保護、GDPR/ISO 27001 合規 |
| **一致性** | ✅ PASS | 遵循統一表格格式、Theme Token 使用、標準化命名規則 |
| **i18n 與常數化** | ✅ PASS | 設計中已包含完整的 i18n 鍵值定義和常數化策略 |
| **資料閉環** | ✅ PASS | 包含完整的輸入(配置)→處理(認證)→輸出(登入)→回饋(日誌)→審計流程 |

**總結**: 5/5 項目通過，所有憲法要求已在設計階段滿足。準備進入實作階段。

## 專案結構

### 文件（此功能）

```bash
specs/001-platform-auth/
├── plan.md              # 此文件（/speckit.plan 命令輸出）
├── research.md          # 階段 0 輸出（/speckit.plan 命令）
├── data-model.md        # 階段 1 輸出（/speckit.plan 命令）
├── quickstart.md        # 階段 1 輸出（/speckit.plan 命令）
├── contracts/           # 階段 1 輸出（/speckit.plan 命令）
└── tasks.md             # 階段 2 輸出（/speckit.tasks 命令 - 非由 /speckit.plan 創建）
```

### 來源程式碼（倉庫根目錄）

```bash
# 前端 Web 應用結構
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── IdpList.tsx           # IdP 清單元件
│   │   │   ├── IdpForm.tsx           # IdP 配置表單
│   │   │   ├── IdpTestModal.tsx      # 連線測試對話框
│   │   │   ├── SecretField.tsx       # 敏感資訊欄位元件
│   │   │   └── FailoverStatus.tsx    # 故障轉移狀態顯示
│   ├── pages/
│   │   ├── settings/
│   │   │   └── auth/
│   │   │       ├── index.tsx         # 身份驗證設定首頁
│   │   │       ├── create.tsx        # 新增 IdP 頁面
│   │   │       └── [id]/edit.tsx     # 編輯 IdP 頁面
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.ts               # 認證相關 API 服務
│   │   │   └── idp.ts                # IdP 管理 API 服務
│   │   └── hooks/
│   │       ├── useIdp.ts             # IdP 管理 hooks
│   │       └── useAuth.ts            # 認證狀態 hooks
│   ├── stores/
│   │   └── authStore.ts              # 認證狀態管理
│   ├── constants/
│   │   ├── auth.ts                   # 認證相關常數
│   │   └── permissions.ts            # 權限定義
│   └── types/
│       ├── auth.ts                   # 認證相關型別定義
│       └── idp.ts                    # IdP 相關型別定義
└── tests/
    ├── components/                   # 元件單元測試
    ├── pages/                       # 頁面整合測試
    ├── services/                    # API 服務測試
    └── e2e/                         # 端到端測試
```

**結構決策**: 採用前端專注的結構，包含完整的元件、頁面、服務和測試層次。使用 TypeScript 確保型別安全，Grafana UI 提供一致的視覺體驗。

## 複雜度追蹤

*僅在憲法檢查有必須證明的違規時才填寫*

| 違規 | 為什麼需要 | 拒絕的更簡單替代方案，因為 |
|------|------------|------------------------------|
| [例如，第 4 個專案] | [當前需求] | [為什麼 3 個專案不足] |
| [例如，Repository 模式] | [具體問題] | [為什麼直接 DB 存取不足] |
