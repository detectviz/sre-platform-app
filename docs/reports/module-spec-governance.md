# 模組規格與選項治理筆記

## 模組規格同步流程
- 新增 `scripts/sync-module-specs.mjs` 將 `docs/specs/*.md` 中每個頁面段落依對應清單產出 33 份模組規格至 `.specify/specs/modules/`。
- 指令 `npm run specs:sync` 會重新產出所有模組規格；`npm run specs:check` 可驗證當前版本是否與來源文件一致。
- 產出的規格檔保留來源段落、互動流程、需求與 [NEEDS CLARIFICATION] 註記，確保與 `docs/specs/` 的視覺/流程描述一一對應。

## ResourceList 選項血緣
- `ResourceOptions` 新增 `utilization_bands`、`event_volume_bands`、`event_severities`，以語義化 class + template 管理顏色、文案與樣式。
- `mock-server/db.ts` 更新 `MOCK_RESOURCE_OPTIONS`，改用設計系統 token（`app-badge`, `app-status-pill`, `app-meter-bar`），避免頁面自行硬寫 Tailwind 顏色。
- `pages/resources/ResourceListPage.tsx` 改以 `useOptions()` 提供的描述渲染使用率、事件熱度、嚴重度標籤，並整合 `useDesignSystemClasses` 以維持樣式一致。
- 血緣：`docs/specs/resources-*.md` → `scripts/sync-module-specs.mjs` → `.specify/specs/modules/*.md` → `mock-server/db.ts` (`MOCK_RESOURCE_OPTIONS`) → `OptionsContext` → `ResourceListPage` UI。

## 操作指引
1. 更新規格或頁面時先執行 `npm run specs:sync`，提交 `.specify/specs/modules/` 變更。
2. 調整資源樣式或文案時，先於 `MOCK_RESOURCE_OPTIONS` 補齊對應 descriptor，再於頁面讀取；禁止在頁面內硬寫顏色或中文文案。
3. 驗證步驟：
   - `npm run specs:check` 應通過（確保規格未漂移）。
   - UI 測試應確認各嚴重度/事件量對應的 badge、meter 與文案皆與 Options 設定一致。
