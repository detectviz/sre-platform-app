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
    **Then** 我應該能看到新伺服器的名稱、類型和發現時間，並可以點擊「查看掃描任務」連結，跳轉到發現該資源的具體任務詳情頁。

3.  **Given** 我需要快速定位當前最不穩定的服務。
    **When** 我查看「需要關注的資源群組」卡片。
    **Then** 我應該能看到一個根據嚴重和警告事件數量排序的群組列表，並可以點擊連結直接跳轉到資源群組管理頁面進行深入分析。

### 邊界案例（Edge Cases）
- 當後端 API 無法提供總覽資料時，頁面應顯示一個清晰的錯誤訊息和「重試」按鈕。
- 當總覽資料中的某個部分為空（例如，沒有最近發現的資源）時，對應的卡片區域應顯示一個友好的提示訊息，而不是空白或錯誤。
- 在手動點擊「重新整理」按鈕時，按鈕本身應進入一個載入中（loading）的狀態，以防止重複點擊。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）從 `/resources/overview` API 端點獲取資料，並將其呈現在一個儀表板佈局中。
- **FR-002**：系統必須（MUST）展示一組關鍵績效指標（KPIs），例如總資源數、健康比例等。
- **FR-003**：系統必須（MUST）使用圓餅圖視覺化展示按「類型」劃分的資源分佈。
- **FR-004**：系統必須（MUST）使用長條圖視覺化展示按「提供商」劃分的資源分佈。
- **FR-005**：系統必須（MUST）在一個卡片中列出「最近發現的資源」，並提供導航到具體掃描任務的連結。
- **FR-006**：系統必須（MUST）在一個卡片中列出「告警最多的資源群組」，並提供導航到資源群組管理頁面的連結。
- **FR-007**：系統必須（MUST）提供一個手動刷新按鈕，以重新獲取整個頁面的總覽資料。
- **FR-008**: 後端 API 回傳的「最近發現的資源」列表中，`discovered_at` 欄位**必須**使用 ISO 8601 標準時間戳格式。前端**必須**將此標準時間戳格式化為對使用者友好的相對時間。
- **FR-009**: 總覽頁面的資料是基於定時快照生成的。後端 API (`/resources/overview`) 的回應中**必須**包含一個 `last_updated` 時間戳，前端**必須**在頁面上清晰地向使用者展示「資料更新於...」的資訊。
- **FR-010**：系統必須（MUST）根據使用者的權限，過濾頁面上顯示的所有聚合數據。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-011**: 頁面上所有 KPI 指標（如「健康度」）的具體計算邏輯由後端負責。其詳細定義應記錄在團隊共享的知識庫中，API 僅回傳計算好的最終數值。

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

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:discovery:read` | 允許使用者查看資源總覽儀表板。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `ResourceOverviewPage` 的根元件需由 `<RequirePermission permission="resources:discovery:read">` 包裹。
- **資料聚合過濾 (後端核心職責)**: 此頁面的所有數據都必須在後端 API (`/resources/overview`) 層級根據請求者的權限進行計算和過濾。前端只負責渲染收到的聚合結果。
  - **KPIs**: 所有頂部 KPI（如總資源數、健康度）的計算範圍必須僅限於該使用者有權查看的資源。
  - **分佈圖表**: 資源類型和提供商的分佈圖，其統計基礎同樣必須是該使用者可見的資源。
  - **列表卡片**: 「最近發現的資源」和「需要關注的資源群組」列表，應只顯示該使用者有權查看的掃描任務或資源群組。
- **導航連結**: 頁面上的所有導航連結（如「查看資源列表」、「查看掃描任務」）的目標頁面，將由其自身的頁面級權限進行存取控制。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/resources/ResourceOverviewPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
| 指標與告警 (Metrics & Alerts) | ❌ | 頁面缺少 OpenTelemetry 或自訂指標，所有 API 呼叫僅透過共享客戶端發送。 |
| RBAC 權限與審計 | ❌ | UI 未使用 `usePermissions` 或 `<RequirePermission>`，所有操作目前對所有登入者可見，需依《common/rbac-observability-audit-governance.md》導入守衛。 |
| i18n 文案 | ⚠️ | 主要字串透過內容 context 取得，但錯誤與提示訊息仍有中文 fallback，需要補強內容來源。 |
| Theme Token 使用 | ⚠️ | 介面混用 `app-*` 樣式與 Tailwind 色票（如 `bg-slate-*`），尚未完全以設計 token 命名。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。