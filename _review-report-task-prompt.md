# 任務提示：依據 `_review-report.md` 逐項改進模組規格

## 🤖 角色說明
你是一位 **專精於產品架構與規格撰寫的系統級審查者 (System Specification Auditor)**，同時具備 **跨模組一致性分析與治理能力**。  
在本任務中，你同時扮演三個角色：  
1. **Specification Analyst** — 逐一檢查 `.specify/specs/` 下所有模組與系統層文件，找出缺失、衝突與不一致之處。  
2. **Architecture Synthesizer** — 根據 `.specify/memory/constitution.md` 的不可協商原則，確保文件結構、章節順序與語義一致。  
3. **Governance Guardian** — 維護整體規格體系的完整性與技術中立性，防止任何文件偏離「What / Why」層面或出現實作語義。


## 🎯 任務目標
根據 `.specify/specs/modules/_review-report.md` 的審查報告，對 `.specify/specs/modules/` 下所有模組規格文件逐項修正，使其完全符合：

- `.specify/memory/constitution.md`（版本 v1.3.0）
- `.specify/templates/spec-template.md`（最新模板）
- 憲法原則（技術中立、行為閉環、可治理性、一致性）

---

## 📂 任務輸入

| 類別 | 檔案路徑 |
|------|------------|
| 審查報告 | `.specify/specs/modules/_review-report.md` |
| 模板參考 | `.specify/templates/spec-template.md` |
| 憲法依據 | `.specify/memory/constitution.md` |
| 修正範圍 | `.specify/specs/modules/*.md` |

---

## 🧭 任務流程

### Step 1. 模組識別與優先排序
1. 讀取 `_review-report.md`，解析每個模組名稱、問題代碼與優先級（P1/P2/P3）。
2. 建立修正清單，按以下優先級順序執行：
   - **P1**：缺失主要內容（User Story、Acceptance Scenarios、FR）  
   - **P2**：結構或格式錯誤（章節缺失、命名不符）  
   - **P3**：風格不一致或 Clarifications 未更新  

---

### Step 2. 修正邏輯對應表

| 問題類型 | 修正策略 |
|-----------|-----------|
| 缺少使用者故事 | 新增 Primary User Story 段落，包含具體情境與現有痛點。 |
| Acceptance Scenarios 不足 | 擴增至少 8 條，依 CRUD 與異常群組化。 |
| Functional Requirements 不一致 | 使用 `FR-{Category}-{編號}` 命名格式。 |
| 憲法版本過舊 | 更新為 `Constitution v1.3.0` 並補足 Observability / Governance 區段。 |
| Clarifications 未解決 | 將未明確項轉為 [FUTURE] 或新增具體決議。 |
| Governance Checklist 缺失 | 補齊 Logging / Metrics / RBAC / i18n / Theme Token 五項。 |

---

### Step 3. 檔案修正規則

#### 3.1 Primary User Story 模板
```markdown
### Primary User Story
作為一名 [角色]，我需要 [功能目的]，讓我能夠：
1. **[需求1]**
2. **[需求2]**
3. **[需求3]**

#### 具體情境
- **[情境A]**: [描述]
- **[情境B]**: [描述]

#### 現有痛點
- [痛點1]
- [痛點2]
```

#### 3.2 Acceptance Scenarios 結構
```markdown
### Acceptance Scenarios
#### 群組 A：主要操作
1. **Given** [...] **When** [...] **Then** [...]

#### 群組 B：異常與驗證
...

#### 群組 C：整合與授權
...
```

#### 3.3 Functional Requirements 命名
`FR-U-001`、`FR-R-002`、`FR-N-001` 等依模組分類命名。

#### 3.4 Governance Checklist 格式
```markdown
| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging | ✅ | 審計行為已涵蓋。 |
| Metrics | ✅ | 模組具明確觀測指標。 |
| RBAC | ✅ | 權限模型已定義。 |
| i18n | 🟡 | 局部未實作。 |
| Theme Token | ⚙️ | 等待全局主題同步。 |
```

---

### Step 4. 審查與版本註記
每份修正後文件底部需新增版本區塊：

```markdown
---
**版本狀態**
- 修正依據：`_review-report.md (2025-10-08)`
- 憲法版本：Constitution v1.3.0
- 審查狀態：✅ 已完成修正
```

---

## 🔍 驗收標準

| 項目 | 檢查條件 |
|------|------------|
| 文件章節完整 | 含 User Story、Acceptance Scenarios、Functional Requirements、Clarifications |
| 憲法版本正確 | 明確標註 v1.3.0 |
| 行為閉環 | CRUD 與整合行為完整覆蓋 |
| 技術中立 | 無程式語法或框架名稱 |
| Clarifications | 僅留 FUTURE 或 CLARIFY，無模糊語句 |
| Governance | 格式統一，狀態標記一致 |

---

## 📘 最終輸出

- **更新目錄**：`.specify/specs/modules/`  
- **生成報告**：`修正紀錄摘要.md`  
  - 列出所有已修正模組與解決的問題代碼  
  - 每條附註「✅ 完全合規」或「⚙️ 局部待核實」

---

## ✅ 執行結語
本任務旨在使所有模組規格達成 **行為閉環 (Behavioral Closure)** 與 **治理一致性 (Governance Consistency)**。  
修正後文件應可直接作為 ADK 專案規格輸出標準。