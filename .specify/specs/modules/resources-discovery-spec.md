# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-discovery
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceOverviewPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 團隊主管或平台架構師，我需要一個宏觀的資源總覽儀表板，以便快速掌握我們整個技術版圖的現狀。我希望能夠一目了然地看到資源的組成結構（例如，有多少資料庫、多少應用伺服器）、它們分佈在哪些雲端平台上、近期是否有新資產被納管，以及哪些業務群組目前問題最多，從而為資源規劃和風險管理提供數據支持。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「資源總覽」頁面。
    **When** 頁面載入完成。
    **Then** 我應該能看到一組 KPI、一個顯示資源類型分佈的圓餅圖，以及一個顯示雲端提供商分佈的長條圖。

2.  **Given** 我想了解近期是否有新的伺服器上線。
    **When** 我查看「最近發現的資源」卡片。
    **Then** 我應該能看到新伺服器的名稱、類型和發現時間，並可以點擊連結跳轉到相關的掃描任務。

3.  **Given** 我需要快速定位當前最不穩定的服務。
    **When** 我查看「需要關注的資源群組」卡片。
    **Then** 我應該能看到一個根據告警數量排序的群組列表。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供總覽資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當總覽資料中的某個部分為空時，對應的卡片區域應顯示一個友好的提示訊息。
- 在手動點擊「重新整理」按鈕時，按鈕本身應進入一個載入中狀態。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/resources/overview` API 端點獲取資料，並將其呈現在一個儀表板佈局中。
- **FR-002**：系統必須（MUST）展示一組關鍵績效指標（KPIs），例如總資源數、健康比例等。
- **FR-003**：系統必須（MUST）使用圖表視覺化展示按「類型」和「提供商」劃分的資源分佈。
- **FR-004**：系統必須（MUST）在卡片中列出「最近發現的資源」和「告警最多的資源群組」。
- **FR-005**：系統必須（MUST）提供一個手動刷新按鈕，並在頁面頂部顯示資料的「最後更新時間」戳記。
- **FR-006**：所有 UI 文字（包括圖表標籤）**必須**使用 i18n Key 進行渲染。
- **FR-007**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-008**：系統必須（MUST）根據使用者的權限，過濾頁面上顯示的所有聚合數據。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **ResourceOverviewData** | 整個總覽頁面的核心資料模型，是一個聚合了多種統計資訊的複合體。 | - |
| **DistributionMetric** | 用於圖表呈現的分佈統計，例如 `{name: 'EC2', value: 150}`。 | - |
| **DiscoveredResource** | 在「最近發現」列表中顯示的資源簡化資訊。 | DiscoveryJob |
| **AlertGroupSummary**| 在「告警熱區」列表中顯示的資源群組及其告警統計。 | ResourceGroup |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:discovery:read` | 允許使用者查看資源總覽儀表板。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `ResourceOverviewPage` 的根元件需由 `<RequirePermission permission="resources:discovery:read">` 包裹。
- **資料聚合過濾 (後端核心職責)**: 此頁面的所有數據都必須在後端 API (`/resources/overview`) 層級根據請求者的權限進行計算和過濾。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 使用者執行「重新整理」等操作時，必須產生審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與儀表板載入時間、資料延遲相關的指標。 |
| RBAC 權限與審計 | ✅ | 所有操作均由 `<RequirePermission>` 或 `usePermissions` hook 進行權限檢查。 |
| i18n 文案 | ✅ | 所有 UI 字串均由 i18n 內容管理系統提供。 |
| Theme Token 使用 | ✅ | 所有顏色均使用標準化的 Theme Token。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 七、模糊與待確認事項（Clarifications）

(此模組的所有待辦事項均已整合至功能需求中。)