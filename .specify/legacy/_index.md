# SRE 平台規格文件索引（Legacy v1）

**建立日期**: 2025-10-06
**狀態**: Archived Draft (Plan Artifacts Only)
**憲法版本**: 1.2.0
**最新更新**: 2025-10-07 — Consolidated module/component/common specs into `.specify/specs/`

---

## 一、調整摘要

- 33 份模組規格、7 份元件規格與 3 份通用規範皆已升級至 `.specify/specs/` 並標記為 Final 版本，統一遵循 `.specify/templates/spec-template.md` 與憲法 1.2.0。
- `legacy/` 僅保留 plan 與決策備忘（`_resolution-plan*.md`、`_update-report*.md`、`assessment/` 等）。這些文件維持 WHAT/WHY 與 HOW 的過程紀錄，供計畫回顧與後續 tasks 拆解使用。
- 任何針對模組或元件規格的最新需求、Clarification 或合規更新，請直接修改 `.specify/specs/` 對應檔案，並同步更新那裡的 `_review.md`。

---

## 二、現行權威規格位置（Redirect）

| 類別 | 最新索引 | 主要內容 |
|------|-----------|----------|
| 模組規格（33） | [`../specs/_index.md`](../specs/_index.md#二-模組級規格-33-份) | WHAT/WHY 功能描述、RBAC、治理與 Clarification 狀態 |
| 元件規格（7） | [`../specs/_index.md`](../specs/_index.md#三-元件級規格-7-份) | 互動元件的使用情境、驗收情境與 props 規範 |
| 通用規範（3） | [`../specs/_index.md`](../specs/_index.md#四-通用規範-3-份) | CRUD/Modal/Table 等跨模組模式規範 |
| 平台規範（3） | [`../specs/_index.md`](../specs/_index.md#五-平台規範-3-份) | 憲法衍生的設計系統、觀測性與安全標準 |
| 規格審查 | [`../specs/_review.md`](../specs/_review.md) | 最新覆蓋率、違規標記與 Clarification 狀態 |

> 📌 若需查閱單一檔案，請從上表跳轉後使用目錄中的檔案連結，例如 `../specs/modules/automation-history-spec.md`。

---

## 三、`legacy/` 現存文件

以下文件保留以供回溯 plan 階段決策：

- `_resolution-plan.md`、`_resolution-plan-phase2.md`
- `_update-report.md`、`_update-report-phase2.md`
- `_remaining-clarifications.md`
- `assessment/` 內的評估、優先度矩陣與里程碑
- 其他計畫型文件（例如 `README.md`）

這些檔案可繼續引用新版規格，但不得再複製舊版 WHAT/WHY 內容。請以 `../specs/` 為唯一權威來源，避免產生雙重維護。

---

## 四、後續作業建議

1. 新增或更新規格時，直接在 `.specify/specs/` 撰寫並於那裡的 `_review.md` 登記。
2. 若 plan 文件需要引用規格條目，請使用相對路徑 `../specs/...` 連結，以確保讀者跳轉到最新版本。
3. 待 `plan` 與 `tasks` 階段完成後，可評估是否進一步將 `legacy/` 移至更深層的歸檔空間或版本庫外部，以清楚區隔。
