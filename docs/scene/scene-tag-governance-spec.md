# System Specification: Tag Governance

**Category**: System-level Specification  
**Created**: 2025-10-10  
**Status**: Draft  
**Based on**: `.specify/memory/constitution.md` (v1.3.0)  
**Related Module**: [`platform-tag-spec.md`](../modules/platform-tag-spec.md)

---

## 一、目的與範圍（Purpose & Scope）

本文件定義 **全平台標籤治理 (Tag Governance)** 架構與欄位規範，  
旨在確保跨模組（如 incident、resources、automation 等）之標籤使用一致、可審計且可擴展。

此規範適用於：
- 所有具標籤欄位之業務實體（如 Resource、Incident、Notification 等）。  
- 系統後端資料庫與前端設定介面。  
- 標籤生命週期（建立 → 指派 → 查詢 → 審計 → 版本回滾）。

---

## 二、核心原則（Core Principles）

1. **統一性 (Consistency)**：所有模組共用相同欄位結構與命名規則。  
2. **治理性 (Governance)**：標籤定義受控於平台設定層（由管理者設定）。  
3. **可擴展性 (Extensibility)**：支援多租戶、自訂屬性與階層化。  
4. **安全性 (Security)**：標籤修改行為皆記錄於稽核日誌。  
5. **語義化 (Semantic Clarity)**：標籤鍵 (Key) 與值 (Value) 均具明確業務意義。  

---

## 三、資料模型（Data Schema Definition）

| 欄位名稱 | 類型 | 約束 | 說明 |
|-----------|------|------|------|
| **tag_id** | UUID | Primary Key | 唯一標識符。 |
| **key** | String(64) | 唯一、不區分大小寫 | 標籤名稱。不可重複。 |
| **display_name** | String(64) | 非必填 | 前端顯示名稱，可多語系化。 |
| **type** | Enum(`text`, `number`, `boolean`, `enum`, `hierarchy`) | 必填 | 定義標籤值類型。 |
| **allowed_values** | Array[String] | 僅當 type=`enum` 時適用 | 定義允許的值集合。 |
| **scope** | Enum(`global`, `tenant`, `project`, `user`) | 必填 | 控制標籤作用範圍。 |
| **required** | Boolean | 預設 false | 是否為強制標籤。 |
| **editable** | Boolean | 預設 true | 是否允許使用者修改。 |
| **inherit** | Boolean | 預設 false | 是否支援階層繼承（父層 → 子層）。 |
| **description** | Text | 可為空 | 標籤用途與業務解釋。 |
| **created_by** | String(64) | 系統填入 | 建立者識別。 |
| **created_at** | Timestamp | 系統填入 | 建立時間。 |
| **updated_at** | Timestamp | 系統填入 | 最後更新時間。 |

---

## 四、標籤層級與繼承（Hierarchy & Inheritance）

### 層級結構
標籤支援多層階層（Hierarchy），例如：
```
BusinessUnit > Application > Module > Component
```

### 繼承原則
- 子層自動繼承父層標籤除非覆寫。
- 若父層刪除標籤，子層標籤不會自動移除但會標記為「孤立 (orphaned)」。
- [FUTURE] 系統可提供孤立標籤自動清理功能。

---

## 五、約束規則（Validation Rules）

| 規則編號 | 說明 |
|-----------|------|
| **VR-001** | Key 必須唯一（同 scope 不可重複）。 |
| **VR-002** | Enum 型標籤需提供至少一個 allowed_value。 |
| **VR-003** | Boolean 型標籤的值僅允許 `true` 或 `false`。 |
| **VR-004** | Hierarchy 型標籤僅允許單一路徑表示（例如 `"region/zone/node"`）。 |
| **VR-005** | 若 required=true，則在實體建立或修改時必須填寫。 |
| **VR-006** | Key、Value 不得包含特殊字元（僅允許字母、數字、底線與連字號）。 |
| **VR-007** | 標籤值長度不得超過 128 字元。 |
| **VR-008** | scope=tenant 時，僅該租戶可見與修改。 |
| **VR-009** | scope=global 時，僅平台管理者可修改。 |

---

## 六、後端驗證與版本控管（Backend Validation & Versioning）

### 驗證流程
1. **建立階段**  
   - 驗證 key 唯一性。  
   - 驗證值格式與約束。  
   - 寫入審計紀錄。  

2. **修改階段**  
   - 檢查引用關係（若標籤已用於其他實體，需警示影響範圍）。  
   - 比對舊版本與新版本差異，生成版本記錄。  

3. **刪除階段**  
   - 僅當標籤未被任何資源引用時可刪除。  
   - 若有引用，需先移除對應綁定或設定 `deprecated=true`。  

### 版本控管原則
- 所有標籤定義變更皆需生成版本號（例：v1.0 → v1.1）。  
- 支援回滾至任意歷史版本。  
- 每個版本均具備 metadata：`changed_by`, `change_reason`, `timestamp`。  

---

## 七、治理與審計（Governance & Audit）

| 項目 | 說明 |
|------|------|
| **建立 / 修改 / 刪除** | 每次操作均寫入 Audit Log。 |
| **權限控制** | 僅具 `platform:tag:admin` 或 `platform:settings:write` 權限者可修改 Tag Schema。 |
| **版本追蹤** | 所有標籤版本保存於獨立版本表中。 |
| **異動通知** | 當標籤 Schema 更新時，需觸發事件通知所有依賴模組。 |

---

## 八、相依與整合（Dependencies & Integration）

| 模組 | 依賴關係 |
|------|-----------|
| `platform-tag` | 提供標籤設定 UI 與治理介面。 |
| `resources-management` | 依據 Tag Schema 進行篩選與關聯。 |
| `incident-alert` | 使用 Tag 作為告警分群依據。 |
| `automation-playbook` | 可依標籤自動選擇執行目標。 |

---

## 九、模糊與待確認事項（Clarifications）

| 項目 | 狀態 | 備註 |
|------|------|------|
| 標籤版本上限 | [NEEDS CLARIFICATION] | 是否需限制版本保存數量。 |
| 多租戶隔離策略 | [NEEDS CLARIFICATION] | 不同租戶間標籤定義是否可共用。 |
| 孤立標籤清理機制 | [FUTURE] | 是否自動清除或僅提示治理人員。 |

---