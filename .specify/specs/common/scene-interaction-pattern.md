# Scene Interaction Pattern Specification（Scenes 架構互動層規範）

**模組名稱 (Module)**: Scene Interaction Pattern  
**類型 (Type)**: Common  
**來源 (Source)**: `SceneState`, `ScenePanel`, `ScenePersistence`, `SceneExitHandler`, `SceneAppProvider`  
**建立日期 (Created)**: 2025-10-08  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）  
作為使用者，我希望在不離開主要頁面情境的前提下，能透過「上下文場景（Context Scene）」完成聚焦或延伸的操作，例如：  
- 新增或編輯事件  
- 檢視資源詳細資訊  
- 執行一個自動化任務  

### 驗收情境（Acceptance Scenarios）  
1. **Given** 我需要執行一個短流程的聚焦任務，例如快速確認或簡易編輯。  
   **When** 我觸發該操作。  
   **Then** 系統必須使用一個**Inline SubScene** 來呈現對應的介面。  

2. **Given** 我需要執行一個較長流程或多步驟的延展任務，例如詳細資料檢視或設定流程。  
   **When** 我觸發該操作。  
   **Then** 系統必須使用一個**Context ScenePanel** 來呈現對應的介面。  

3. **Given** 任何一個互動層（SubScene 或 ScenePanel）處於開啟狀態。  
   **When** 我按下鍵盤上的 `Escape` 鍵或點擊背景。  
   **Then** 該互動層必須被關閉。  

---

## 二、功能需求（Functional Requirements）

- **FR-001**：平台必須（MUST）支援兩種互動層型態：`Inline SubScene`（短任務）與 `Context ScenePanel`（延展任務）。  
- **FR-002**：`Inline SubScene` 適用於短流程任務，例如快速確認、簡易編輯、輕量表單。  
- **FR-003**：`Context ScenePanel` 適用於長流程任務，例如詳細檢視、多步驟設定、任務回放。  
- **FR-004**：所有互動層皆應支援透過 `SceneExitHandler` 關閉（鍵盤、背景點擊、操作按鈕）。  
- **FR-005**：當互動層開啟時，主 Scene 的滾動與互動應自動凍結。  
- **FR-006**：顯示狀態必須透過 `SceneState.visible` 控制（受控狀態模式）。  
- **FR-007**：平台不允許巢狀互動層，若有需求須於模組層申請例外。  
- **FR-008**：內容採延遲掛載策略：`SceneState.visible = true` 時載入，關閉後延遲 300ms 卸載以保留動畫。  
- **FR-009**：支援暫存草稿 (`ScenePersistence.draftMode`)，於 5 秒無輸入後儲存至 SceneStorage，並於重新開啟時提供恢復提示。  

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **SceneState** | 控制互動層顯示狀態與動畫節奏。 | ScenePanel |
| **ScenePanel** | 表示上下文層場景容器（類似 Drawer）。 | SceneAppProvider |
| **ScenePersistence** | 管理暫存草稿與場景狀態持久化。 | SceneStorage |
| **SceneExitHandler** | 管理離開事件（Escape、背景點擊）。 | SceneState |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging/Tracing | ✅ | `SceneEventBus` 應記錄開啟與關閉事件。 |
| Metrics & Alerts | ✅ | 場景互動時間與放棄率應上報至 Telemetry。 |
| RBAC 權限與審計 | ✅ | 開啟互動層前須由 SceneAppProvider 驗證權限。 |
| Theme Token 使用 | ✅ | 所有樣式應遵循 Grafana Theme Token。 |
| i18n 文案 | ✅ | 所有文字來自全域多語 context。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。  
- [x] 所有必填段落皆存在。  
- [x] 所有 FR 可測試且明確。  
- [x] 無未標註的模糊需求。  
- [x] 符合 `.specify/memory/constitution.md`。  

---

## 六、模糊與待確認事項（Clarifications）

- 虛擬化延遲與卸載時間是否應統一由 constitution 決定。  
- `ScenePersistence` 的草稿儲存位置是否應支援瀏覽器 sessionStorage。  
- 是否需統一定義互動層開啟動畫樣式（左右滑入、淡入淡出）。  

---

## 七、結語  
本文件取代原有 Modal/Drawer 規範，  
為 Scenes 架構下所有上下文互動層提供統一行為定義。  
所有模組應使用 `SceneState`、`ScenePanel`、`SceneExitHandler`、`ScenePersistence` 以確保一致性與可觀測性。