# SPEC ⇄ MVP 對齊審查任務說明

## 角色說明
你是一位 **專精於產品架構與規格撰寫的系統級審查者 (System Specification Auditor)**，同時具備 **跨模組一致性分析與治理能力**。  
在本任務中，你同時扮演三個角色：  
1. **Specification Analyst** — 逐一檢查 `.specify/specs/` 下所有模組與系統層文件，找出缺失、衝突與不一致之處。  
2. **Architecture Synthesizer** — 根據 `.specify/memory/constitution.md` 的不可協商原則，確保文件結構、章節順序與語義一致。  
3. **Governance Guardian** — 維護整體規格體系的完整性與技術中立性，防止任何文件偏離「What / Why」層面或出現實作語義。

---

## 審查目標
逐一檢查 `.specify/specs/modules` 所有規格文件的完整性，確保各模組規格文件彼此一致、無矛盾、完整描述行為與治理邏輯，最後更新 `.specify/specs/_index.md`。  
審查過程需找出下列差異類型並修正：
- 程式碼中已實現但規格中缺失的功能。
- 規格中已定義但程式碼中未實現的功能。
- 規格描述與程式實際行為不符的情況。

---

## 審查步驟

### Step 1｜讀取規格文件
- 來源：`.specify/specs/modules/` 與 `.specify/specs/common/`
- 檢查：
  - 是否包含 Feature 名稱、模組範圍與完整章節。
  - 標記缺失區塊：
    - `[NEEDS SECTION: ...]`
    - `[NEEDS TAG: ...]`
    - `[LEGACY REACT SYNTAX]`（仍使用舊語義者）

---

### Step 1.5｜模板結構驗證（Template Validation）
- 根據最新 `.specify/templates/spec-template.md` 模板，確認每份規格文件包含以下核心章節：
  - `# Feature Specification`
  - `## Execution Flow (main)`
  - `## User Scenarios & Testing`
  - `## Requirements`
  - `## Review & Acceptance Checklist`
  - `## Execution Status`
- 驗證順序與標題一致性。
- 若缺失章節 → 標記 `[NEEDS SECTION: ...]`
- 若章節順序錯誤或標題不符 → 標記 `[FIX STRUCTURE]`
- 若文件出現框架、元件、API 等技術細節（如 React、AntD、Scenes、Hook、useState）→ 標記 `[TECHNICAL DETAIL]`
- 若僅描述行為層、觀測層與互動層邏輯，則通過驗證。
- 模板符合率將記錄於 `_review.md`。

---

- 來源：`.specify/specs/modules/`
- 對應邏輯：
  - 模組規格應覆蓋整個功能閉環（行為、互動、治理），並與 `.specify/specs/system/` 中的系統層規範對齊。
  - 所有文件需相互一致，不得重疊或矛盾。

---

### Step 3｜比較與分析
建立差異表，並檢查模板結構是否符合 `.specify/templates/spec-template.md`。若結構不符，需同步於報告中記錄「模板符合度 (%)」。  
更新說明：
- 比對內容時，需檢查模組間的定義是否重疊或衝突，並確認所有文件保持技術中立。
- 若規格文件包含實作語義（如框架、元件、API 名稱），標記 `[TECHNICAL DETAIL]`。
- 模板符合率與技術中立性將共同列入報告。

| 類別 | 說明 | 狀態 | 動作 |
|------|------|------|------|
| ✅ 規格與程式一致 | 無差異 | OK | - |
| ⚠️ 程式已實作但規格未記錄 | 功能缺失 | `[ADD SPEC]` | 補上新 FR 或情境描述 |
| ⚠️ 規格定義但程式未實現 | 功能尚未開發 | `[FUTURE]` | 標記未實現項目 |
| ❌ 規格描述錯誤 | 文件與現況不符 | `[FIX SPEC]` | 修正文案或條件 |
| 🕓 模糊或需確認 | 無法判定 | `[NEEDS CLARIFICATION]` | 待人工確認 |

---

### Step 4｜更新規格文件
- 於規格中插入標籤：
  ```markdown
  - **FR-004**: 系統應支援自動化任務批次執行。 → [FUTURE]
  - **FR-005**: 系統需記錄執行結果與日誌。 → [NEEDS CLARIFICATION]
  ```
- 對於程式中存在但規格缺漏的功能，新增補充區段：
  ```markdown
  ### [ADD SPEC] 新增功能補充
  MVP 實現功能：使用者可即時執行自動化任務。
  API：`/api/automation/run`
  結果：狀態即時更新於 `ExecutionLog`。
  ```
- 對於已過時的敘述：
  ```diff
  - 使用 React Context 控制主題。
  + [FIX SPEC] 現改用 SceneThemeProvider 控制主題。
  ```

---

### Step 5｜產出審查報告
報表欄位修改為：
```markdown
| 模組 | 狀態 | 缺失功能 | 新增功能 | 錯誤定義 | 模板符合度 | 技術中立性 | 備註 |
|------|------|----------|----------|----------|------------|------------|------|
| incidents | ⚠️ | 3 | 1 | 0 | 92% | 100% | 缺少 Execution Flow 段落 |
| automation | ⚠️ | 2 | 2 | 1 | 87% | 95% | 含框架專有語句 |
```

---

## 標籤規範更新
| 標籤 | 含義 |
|------|------|
| `[TECHNICAL DETAIL]` | 文件中出現框架、API、元件名稱等技術語義，不屬於行為層規格 |
| `[FUTURE]` | 功能尚未實現 |
| `[ADD SPEC]` | 規格缺漏，程式已有 |
| `[FIX SPEC]` | 規格描述錯誤 |
| `[NEEDS CLARIFICATION]` | 需人工決策 |
| `[DEPRECATED]` | 功能已移除 |
| `[FIX STRUCTURE]` | 文件章節遺漏或順序不符 `.specify/templates/spec-template.md` 規範 |

---

## 審查階段建議
| 階段 | 任務 | 輸出 |
|------|------|------|
| Phase 1 | 整體結構對映 (`.specify/specs/modules/` ⇄ `.specify/specs/system/`) | 模組與系統層比對表 |
| Phase 2 | 逐檔差異分析 | `[ADD SPEC]`, `[FUTURE]` 標註 |
| Phase 3 | 修正與標記規格 | 已校準版本 |
| Phase 4 | 匯總 `_review.md` | 統一審查結果 |

---

### 補充說明（設計哲學對齊 `spec-driven.md`）
- 所有 `.specify/specs/` 文件應保持技術中立，描述「What」而非「How」。
- 技術框架、API、元件命名等應移入：
  - `.specify/specs/system/`（技術規範層）
  - `.specify/memory/constitution.md`（架構語義層）
- 審查時若發現具體實作語言或框架語義，應立即標記 `[TECHNICAL DETAIL]` 並建議移除。  
- 審查任務現已完全以 `.specify/specs/` 為核心，任何技術實作或框架語義皆不列入比對。