# Frontend Constitution Re-Audit

## Summary
- Mock API handlers now normalize every thrown error to `{ status, code, message, details? }`, giving the server a consistent payload to return to UI clients.【F:mock-server/handlers.ts†L1-L74】【F:mock-server/server.js†L201-L218】
- The CSV import modal consumes the content pipeline, design-system button and surface classes, and typed `ApiError` helpers while clearing file inputs safely on close.【F:components/ImportFromCsvModal.tsx†L30-L269】
- Added reusable dropzone tokens to the design stylesheet (including light-theme variants) so upload flows stop depending on Tailwind color literals.【F:styles/design-system.css†L687-L776】

## Batch Remediation Status
| Batch | Result | Evidence |
| --- | --- | --- |
| Batch A — i18n & Constants | ✅ Import modal strings, buttons, and success/error handling now pull from `useContent` with design buttons; Security settings and API hook changes from prior batches remain intact.【F:components/ImportFromCsvModal.tsx†L118-L199】 |
| Batch B — API & Mock Error Model | ✅ `normalizeHandlerError` and the mock server response wrapper add the mandated `code` plus optional `details` fields, ensuring UI consumers see structured errors.【F:mock-server/handlers.ts†L25-L74】【F:mock-server/server.js†L201-L218】 |
| Batch C — Design-System Adoption | ✅ New `.app-dropzone` tokens replace `bg-sky-*`/`text-slate-*` usage in the import modal and align the footer actions with shared button variants.【F:components/ImportFromCsvModal.tsx†L182-L258】【F:styles/design-system.css†L687-L776】 |
| Batch D — Tooling & Type Safety | ⚠ Baseline lint now runs, but the repo still reports blocking rule violations (unused vars, remaining `any`, hook deps). Follow-up cleanup is required before CI can pass.【d3691d†L1-L120】 |
| Batch E — Governance & Specs | ✅ Module spec sync tooling and docs added previously remain unchanged; nothing new detected in this pass. |

## Constitution Compliance Snapshot
| Principle | Status | Notes |
| --- | --- | --- |
| 錯誤模型 `{code,message,details?}` | ✅ Mock handlers and server responses emit structured payloads with sensible defaults even when thrown objects omit fields.【F:mock-server/handlers.ts†L25-L74】【F:mock-server/server.js†L201-L218】 |
| UI 色票與表格基線 | ⚠ Import modal adopts tokens, but other legacy surfaces (e.g., layout settings) still rely on Tailwind colors—tracked for Batch D follow-up.【F:components/ImportFromCsvModal.tsx†L182-L258】【d3691d†L73-L88】 |
| 型別與 `any` 收斂 | ⚠ The modal leverages `ApiError` guards, yet global lint output highlights many remaining `any` usages and unused symbols that must be resolved incrementally.【F:components/ImportFromCsvModal.tsx†L118-L161】【d3691d†L1-L120】 |
| 工程治理 | ⚠ ESLint executes but fails due to existing violations; the lint debt list in the output should seed the next cleanup sprint.【d3691d†L1-L120】 |

## Outstanding Risks & Next Actions
- **Lint cleanup** — Resolve the 20 errors/651 warnings reported by the fresh lint baseline (unused variables, hook deps, residual `any`).【d3691d†L1-L120】 Prioritize Layout Settings, Resource tooling, and shared utility modules to unblock CI adoption.
- **Legacy Tailwind usage** — Pages like LayoutSettings still mix Tailwind color utilities and unused modal state; refactor to design tokens and remove dead state during Batch D continuation.【d3691d†L73-L104】
- **Optional Rollup binary** — Vitest still fails in this environment because the optional `@rollup/rollup-linux-x64-gnu` native binary is unavailable; document the limitation or vendor the binary for CI parity.【34b318†L1-L22】

No additional blockers were discovered against the reviewed scope. The items above remain for future hardening sprints.
