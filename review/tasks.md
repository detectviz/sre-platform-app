# Remediation Tasks

## Completion Snapshot
- **Batch A — P1 i18n & Constants Hardening:** ✅ Localized import modal strings and buttons use the shared content pipeline and design buttons.【F:components/ImportFromCsvModal.tsx†L118-L199】
- **Batch B — P1 API & Mock Alignment:** ✅ Mock handlers and server responses emit `{code,message,details?}` so UI consumers receive structured errors.【F:mock-server/handlers.ts†L25-L74】【F:mock-server/server.js†L201-L218】
- **Batch C — P2 Design-System Adoption:** ✅ Dropzone styling and modal actions use semantic tokens; supporting classes live in `styles/design-system.css`.【F:components/ImportFromCsvModal.tsx†L182-L258】【F:styles/design-system.css†L687-L776】
- **Batch D — P2 Type Safety & Tooling:** ⚠ ESLint now runs but still reports blocking violations (unused variables, residual `any`), requiring staged cleanup to reach a passing baseline.【d3691d†L1-L120】
- **Batch E — Governance & Specs:** ✅ Spec sync tooling remains in place from earlier batches; no new drift detected in this pass.

## Batch A — P1 i18n & Constants Hardening
1. 建立 `content/zh-TW.json` 與 `useContent()` pipeline，將 `components/ImportFromCsvModal.tsx`, `pages/profile/SecuritySettingsPage.tsx`, `services/api.ts` 等中文文案抽離為 key，補齊多語系測試。【F:components/ImportFromCsvModal.tsx†L87-L129】【F:pages/profile/SecuritySettingsPage.tsx†L182-L214】【F:services/api.ts†L34-L45】
2. 建立 `constants/routes.ts` / `constants/status.ts`，將 `navigate('/...')`、`<Link to="/...">` 等路徑及狀態轉為集中管理，並更新所有呼叫點。【F:components/AddDashboardModal.tsx†L65-L108】【F:layouts/AppLayout.tsx†L360-L384】【F:pages/resources/ResourceTopologyPage.tsx†L229-L244】

## Batch B — P1 API & Mock Alignment
1. 調整 `mock-server/handlers.ts` 全部錯誤輸出為 `{ code, message, details? }`，同步更新前端錯誤處理以讀取 `code`、`message`，並為 `services/api.ts` 補上型別定義。【F:mock-server/handlers.ts†L42-L80】【F:components/ImportFromCsvModal.tsx†L99-L104】
2. 為每個 API 呼叫定義 `types/` 型別與錯誤窄化，消除 `err: any`，確保 UI 只顯示標準錯誤訊息並支援觀測記錄。【F:pages/profile/SecuritySettingsPage.tsx†L118-L205】

## Batch C — P2 Design-System Adoption
1. 盤點 `styles/design-system.css` token，提供 React hook 或 class map，將 `bg-sky-600`、`bg-slate-900/60` 等 Tailwind 顏色替換成語義 token。【F:pages/profile/SecuritySettingsPage.tsx†L189-L214】【F:styles/design-system.css†L1-L240】
2. 將所有表格組件統一改用 `TableContainer` + `.app-table` 結構，淘汰各頁重複的 `border-slate-800` / `hover:bg-slate-800/40` 實作。【F:pages/resources/ResourceGroupPage.tsx†L290-L369】
3. 清查未使用的 `.app-toolbar`、`.app-icon-button` 類別，決定是要落地或刪除，避免設計系統成為死碼。【F:styles/design-system.css†L160-L320】

## Batch D — P2 Type Safety & Tooling
1. 改寫 `services/api.ts` 與各頁面 API 呼叫，移除 `any`，提供泛型型別與錯誤守衛；為 ECharts 事件建立對應型別或 wrapper。【F:services/api.ts†L51-L57】【F:pages/resources/ResourceTopologyPage.tsx†L200-L260】
2. 導入 ESLint + Prettier 設定（含 `no-explicit-any`、`@typescript-eslint/consistent-type-imports` 等規則），加入 `npm run lint`、`npm run format`，並在 CI 執行。【F:package.json†L1-L118】

## Batch E — Governance & Specs
1. 取得並版本化 `.specify/specs/modules/` 33 份規格，建立自動比對流程，確保功能需求與 UI 實作同步。【6ba1ac†L1-L10】
2. 更新 `OptionsContext` 等集中設定來源，補齊顏色/狀態描述，避免頁面自行定義類別，並文件化血緣追蹤流程。【F:pages/resources/ResourceListPage.tsx†L291-L573】
