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
    **Then** 我應該看到一個由節點和連線組成的網路圖。

2.  **Given** 我在拓撲圖上看到一個代表核心資料庫的節點顏色變為紅色。
    **When** 我在該節點上按右鍵，並從彈出的選單中選擇「查看資源詳情」。
    **Then** 系統必須導航到該資料庫資源的詳細監控頁面。

3.  **Given** 整個拓撲圖因為節點過多而顯得雜亂。
    **When** 我使用頁面頂部的「篩選類型」下拉選單，選擇只顯示「Load Balancer」類型。
    **Then** 拓撲圖應立即更新，僅顯示符合條件的節點及其直接關聯。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供拓撲資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當拓撲資料為空時，頁面應顯示一個「沒有可顯示的拓撲資料」的提示。
- 在一個非常密集的圖中，滑鼠懸浮在節點上時，其 Tooltip 應能正常顯示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/resources/topology` API 端點獲取資料，並將其渲染成一個網路拓撲圖。
- **FR-002**：系統必須（MUST）允許使用者在不同的圖形佈局演算法之間切換。
- **FR-003**：系統必須（MUST）允許使用者根據資源的「類型」來篩選圖中顯示的節點。
- **FR-004**：系統必須（MUST）根據每個資源的健康狀態，以不同的顏色來呈現其對應的圖中節點。
- **FR-005**：系統必須（MUST）提供一個可互動的圖表，支援平移和縮放。
- **FR-006**：系統必須（MUST）在使用者右鍵點擊任一資源節點時，顯示一個包含快捷操作的上下文選單。
- **FR-007**：上下文選單必須（MUST）至少包含「查看資源詳情」、「檢視相關事件」、「執行腳本」等操作。
- **FR-008**：系統應該（SHOULD）在滑鼠懸浮於節點上時，顯示包含關鍵資訊的提示框。
- **FR-009 (AS-IS)**：右鍵選單的導航操作會跳轉到對應模組的根路徑。
- **FR-010 (FUTURE)**：對於超大規模拓撲，應考慮漸進式載入或按需聚合/展開等優化策略。
- **FR-011 (FUTURE)**：系統應根據使用者的權限，過濾拓撲圖中可見的節點和連線。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Resource (Node)** | 拓撲圖中的節點，代表一個獨立的資源。 | - |
| **Link (Edge)** | 拓撲圖中的連線，代表兩個資源之間的依賴或通訊關係。 | Resource (Source), Resource (Target) |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:topology:read` | 允許使用者查看資源拓撲圖頁面。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `ResourceTopologyPage` 的根元件需由 `<RequirePermission permission="resources:topology:read">` 包裹。
- **資料過濾 (後端職責)**: 後端 API (`/resources/topology`) **必須**根據發起請求的使用者權限，來過濾回傳的節點和連線。
- **右鍵選單操作**: 選單中每個操作的**可見性**將由其**目標模組**的權限決定（例如，「檢視相關事件」需 `incidents:list:read` 權限）。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入者均可見。 |
| i18n 文案 | 🟡 | 部分實現。此頁面大部分為硬編碼中文，未接入 i18n 內容管理系統。 |
| Theme Token 使用 | 🟡 | 部分實現。UI 混用預定義樣式與直接的 Tailwind 色票。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `'無法獲取拓撲資料。'`，未來需全面遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `text-slate-400`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Context Menu Actions**: 右鍵選單中的「執行腳本」等操作，其理想行為（如直接打開模態框）與當前實現（跳轉頁面）不符，需在未來迭代中對齊。