# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-topology
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceTopologyPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或架構師，我需要能夠以視覺化的方式查看我們系統中所有資源之間的相互依賴關係。我希望有一個拓撲圖，能讓我直觀地理解服務的架構、識別關鍵路徑，並在出現問題時快速評估故障的影響範圍（Blast Radius）。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「資源拓撲圖」頁面。
    **When** 頁面資料載入完成。
    **Then** 我應該看到一個由節點（代表資源）和連線（代表依賴關係）組成的網路圖。

2.  **Given** 我在拓撲圖上看到一個代表核心資料庫的節點顏色變為紅色（表示嚴重狀態）。
    **When** 我在該節點上按右鍵，並從彈出的選單中選擇「查看資源詳情」。
    **Then** 系統必須導航到該資料庫資源的詳細監控頁面。

3.  **Given** 整個拓撲圖因為節點過多而顯得雜亂。
    **When** 我使用頁面頂部的「篩選類型」下拉選單，選擇只顯示「Load Balancer」類型。
    **Then** 拓撲圖應立即更新，僅顯示負載平衡器類型的資源及其直接關聯的資源。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供拓撲資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當拓撲資料為空（沒有節點或連線）時，頁面應顯示一個提示，說明「沒有可顯示的拓撲資料」。
- 在一個非常密集的圖中，滑鼠懸浮在節點上時，其標籤和 Tooltip 應能正常顯示，不會被其他元素遮擋。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/resources/topology` API 端點獲取資料，並將其渲染成一個網路拓撲圖。
- **FR-002**：系統必須（MUST）允許使用者在不同的圖形佈局演算法之間切換（例如：力導向、環狀）。
- **FR-003**：系統必須（MUST）允許使用者根據資源的「類型」來篩選圖中顯示的節點。
- **FR-004**：系統必須（MUST）根據每個資源的健康狀態，以不同的顏色來呈現其對應的圖中節點。
- **FR-005**：系統必須（MUST）提供一個可互動的圖表，支援平移（Pan）和縮放（Zoom）。
- **FR-006**：系統必須（MUST）在使用者右鍵點擊任一資源節點時，顯示一個包含快捷操作的上下文選單（Context Menu）。
- **FR-007**：上下文選單必須（MUST）至少包含以下操作：「查看資源詳情」、「檢視相關事件」、「執行腳本」。
- **FR-008**：系統應該（SHOULD）在滑鼠懸浮於節點上時，顯示一個包含該資源關鍵資訊（名稱、類型、狀態、擁有者）的提示框（Tooltip）。
- **FR-009**：[NEEDS CLARIFICATION: 右鍵選單中的「檢視相關事件」和「執行腳本」操作，其目標頁面是否應根據所選資源進行篩選？目前的實作僅導航到通用頁面，未傳遞上下文。]
- **FR-010**：[NEEDS CLARIFICATION: 對於超大規模的拓撲（例如超過 1000 個節點），目前的單次載入機制可能存在效能瓶頸。是否需要為此類場景設計漸進式載入或按需載入的策略？]
- **FR-011**：系統必須（MUST）根據使用者的權限，過濾拓撲圖中可見的節點和連線。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Resource (Node)** | 拓撲圖中的節點，代表一個獨立的資源。 | - |
| **Link (Edge)** | 拓撲圖中的連線，代表兩個資源之間的依賴或通訊關係。 | Resource (Source), Resource (Target) |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:topology:read` | 允許使用者查看資源拓撲圖頁面。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `ResourceTopologyPage` 的根元件需由 `<RequirePermission permission="resources:topology:read">` 包裹。
- **資料過濾 (後端職責)**: 後端 API (`/resources/topology`) **必須**根據發起請求的使用者權限，來過濾回傳的節點（資源）和連線。例如，如果一個使用者只能看到隸屬於「團隊A」的資源，則 API 應只回傳屬於「團隊A」的資源以及它們之間的直接連線。前端只負責渲染收到的資料。
- **右鍵選單操作**: 選單中每個操作的**可見性**將由其**目標模組**的權限決定。
  - 「查看資源詳情」選項：需要 `resources:read` 權限。
  - 「檢視相關事件」選項：需要 `incidents:list:read` 權限。
  - 「執行腳本」選項：需要 `automation:playbooks:execute` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有從此頁面觸發的關鍵操作（如執行腳本）產生審計日誌。單純的 UI 互動（如佈局切換、篩選）無需記錄。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標和 API 呼叫遙測。此外，應使用自訂性能標記來測量拓撲圖的初始渲染時間。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型與後端資料過濾原則。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在硬式編碼的繁體中文文案，例如 "佈局模式"、"篩選類型"、"快捷操作" 等。 |
| Theme Token 使用 | ✅ | 程式碼透過 `useChartTheme` hook 獲取圖表主題，並使用 `statusColorMap` 映射狀態顏色，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Context-Aware Navigation]** 需要明確定義右鍵選單中操作的導航行為。點擊「檢視相關事件」時，是應該跳轉到已按該資源篩選過的事件列表頁，還是通用的事件列表頁？
- **[NEEDS CLARIFICATION: Scalability]** 需要為大規模拓撲圖的渲染效能制定策略。考慮的方案可包括：預設顯示簡化視圖、按需展開群組、或後端支援基於可視區域的資料查詢。
- **[NEEDS CLARIFICATION: Link Information]** 目前的連線（Link）僅包含來源和目標，是否需要增加額外資訊，例如表示流量方向、連線類型（如 API 呼叫、資料庫連接）等？